/*
    이 소스는 community/board.html 동작에만 사용됨


    LICENSE

    Copyright 2026 HJOW (hujinone22@naver.com)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License. 
*/

document.addEventListener('DOMContentLoaded', function() {
    const BOARD_NAME = 'board';
    const PAGE_SIZE = 20;
    const MAX_CONTENT_LENGTH = 1000;
    const ADMIN_EMAIL = 'hujinone11@gmail.com';

    const state = {
        backend: null,
        db: null,
        user: null,
        busy: false,
        lastDoc: null,
        loadingMore: false,
        editingDocId: null,
        hasMore: false
    };

    const nodes = {
        root: document.getElementById('board_root'),
        loginPanel: document.getElementById('board_login_panel'),
        appPanel: document.getElementById('board_app_panel'),
        status: document.getElementById('board_status'),
        account: document.getElementById('board_account'),
        list: document.getElementById('board_list'),
        empty: document.getElementById('board_empty'),
        moreWrap: document.getElementById('board_more_wrap'),
        loginButton: document.getElementById('board_login_button'),
        writeButton: document.getElementById('board_write_button'),
        logoutButton: document.getElementById('board_logout_button'),
        moreButton: document.getElementById('board_more_button'),
        editor: document.getElementById('board_editor'),
        editorTitle: document.getElementById('board_editor_title'),
        editorText: document.getElementById('board_editor_text'),
        editorCount: document.getElementById('board_editor_count'),
        saveButton: document.getElementById('board_save_button'),
        cancelButton: document.getElementById('board_cancel_button'),
        appActions: document.getElementById('board_app_actions')
    };

    function setStatus(message, error) {
        nodes.status.textContent = message || '';
        nodes.status.classList.toggle('error', !! error);
    }

    function setBusy(value) {
        state.busy = !! value;
        nodes.root.setAttribute('aria-busy', state.busy ? 'true' : 'false');
        const buttons = nodes.root.querySelectorAll('button');
        for(let idx = 0; idx < buttons.length; idx++) buttons[idx].disabled = state.busy;
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function newPostSerial() {
        return 'post_' + Date.now() + '_' + Math.random().toString(36).slice(2, 12);
    }

    function formatDate(value) {
        if(! value) return '';
        const date = new Date(Number(value));
        if(isNaN(date.getTime())) return '';
        return date.toLocaleString();
    }

    function currentEmail() {
        return (state.user && state.user.email) ? String(state.user.email) : '';
    }

    function currentUid() {
        return (state.user && state.user.uid) ? String(state.user.uid) : '';
    }

    function isAdmin() {
        return currentEmail().toLowerCase() === ADMIN_EMAIL;
    }

    function canEdit(post) {
        return post && post.uid === currentUid();
    }

    function canDelete(post) {
        return canEdit(post) || isAdmin();
    }

    function showLogin() {
        nodes.loginPanel.classList.remove('hidden');
        nodes.appPanel.classList.add('hidden');
        nodes.appActions.classList.add('hidden');
        nodes.account.textContent = '';
    }

    function showApp() {
        nodes.loginPanel.classList.add('hidden');
        nodes.appPanel.classList.remove('hidden');
        nodes.appActions.classList.remove('hidden');
        nodes.account.textContent = currentEmail() || currentUid();
    }

    function updateEditorCount() {
        const length = nodes.editorText.value.length;
        nodes.editorCount.textContent = length + ' / ' + MAX_CONTENT_LENGTH;
        nodes.editorCount.classList.toggle('error', length > MAX_CONTENT_LENGTH);
    }

    function openEditor(post) {
        if(post) {
            state.editingDocId = post._docId;
            nodes.editorTitle.textContent = '글 수정';
            nodes.editorText.value = post.content || '';
        } else {
            state.editingDocId = null;
            nodes.editorTitle.textContent = '글 작성';
            nodes.editorText.value = '';
        }
        updateEditorCount();
        nodes.editor.classList.remove('hidden');
        nodes.editorText.focus();
    }

    function closeEditor() {
        state.editingDocId = null;
        nodes.editorText.value = '';
        updateEditorCount();
        nodes.editor.classList.add('hidden');
    }

    function buildQuery() {
        return state.db.collection('board')
            .where('boardName', '==', BOARD_NAME)
            .orderBy('regdate', 'desc');
    }

    function normalizePost(doc) {
        const data = doc.data() || {};
        data._docId = doc.id;
        return data;
    }

    function renderPost(post, append) {
        const actions = [];
        if(canEdit(post)) actions.push('<button type="button" class="board_btn board_post_edit" data-doc-id="' + escapeHtml(post._docId) + '">수정</button>');
        if(canDelete(post)) actions.push('<button type="button" class="board_btn danger board_post_delete" data-doc-id="' + escapeHtml(post._docId) + '">삭제</button>');

        const html = '' +
            '<article class="board_post" data-doc-id="' + escapeHtml(post._docId) + '">' +
                '<div class="board_post_meta">' +
                    '<span class="board_post_email">' + escapeHtml(post.email || 'unknown') + '</span>' +
                    '<span>' + escapeHtml(formatDate(post.regdate)) + '</span>' +
                '</div>' +
                '<p class="board_post_content">' + escapeHtml(post.content || '') + '</p>' +
                (actions.length ? '<div class="board_actions">' + actions.join('') + '</div>' : '') +
            '</article>';

        if(append) nodes.list.insertAdjacentHTML('beforeend', html);
        else nodes.list.innerHTML += html;
    }

    function renderPosts(posts, append) {
        if(! append) nodes.list.innerHTML = '';
        for(let idx = 0; idx < posts.length; idx++) renderPost(posts[idx], true);
        nodes.empty.classList.toggle('hidden', nodes.list.children.length > 0);
        nodes.moreWrap.classList.toggle('hidden', ! state.hasMore);
    }

    function loadPosts(append) {
        if(state.loadingMore || state.db == null) return Promise.resolve();
        state.loadingMore = true;
        if(! append) {
            state.lastDoc = null;
            nodes.list.innerHTML = '';
        }
        setStatus(append ? '다음 글을 불러오는 중입니다...' : '글 목록을 불러오는 중입니다...', false);

        let query = buildQuery().limit(PAGE_SIZE);
        if(append && state.lastDoc) query = buildQuery().startAfter(state.lastDoc).limit(PAGE_SIZE);

        return query.get().then(function(snapshot) {
            const posts = [];
            snapshot.forEach(function(doc) { posts.push(normalizePost(doc)); });
            state.lastDoc = snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : state.lastDoc;
            state.hasMore = snapshot.docs.length === PAGE_SIZE;
            renderPosts(posts, append);
            setStatus('', false);
        }).catch(function(error) {
            handleError(error);
        }).then(function() {
            state.loadingMore = false;
        });
    }

    function refreshAuthView() {
        state.user = state.backend && state.backend.user ? state.backend.user : null;
        if(state.backend && state.backend.logined && state.user) {
            showApp();
            loadPosts(false);
        } else {
            closeEditor();
            showLogin();
        }
    }

    function handleError(error) {
        console.error(error);
        setStatus('오류가 발생했습니다. ' + (error && error.message ? error.message : String(error)), true);
    }

    function requireLogin() {
        if(! state.backend || ! state.backend.logined || ! state.backend.user) throw '로그인이 필요합니다.';
    }

    function savePost() {
        const content = nodes.editorText.value.trim();
        if(! content) {
            setStatus('내용을 입력해 주세요.', true);
            nodes.editorText.focus();
            return;
        }
        if(content.length > MAX_CONTENT_LENGTH) {
            setStatus('글 내용은 1000자까지 입력할 수 있습니다.', true);
            nodes.editorText.focus();
            return;
        }

        setBusy(true);
        setStatus('저장 중입니다...', false);
        try {
            requireLogin();
            if(state.editingDocId) {
                state.db.collection('board').doc(state.editingDocId).get().then(function(doc) {
                    if(! doc.exists) throw '글을 찾을 수 없습니다.';
                    const post = normalizePost(doc);
                    if(! canEdit(post)) throw '수정 권한이 없습니다.';
                    return doc.ref.update({ content: content, moddate: Date.now() });
                }).then(function() {
                    closeEditor();
                    return loadPosts(false);
                }).catch(handleError).then(function() {
                    setBusy(false);
                });
            } else {
                const docRef = state.db.collection('board').doc();
                const record = {
                    boardName: BOARD_NAME,
                    content: content,
                    email: currentEmail(),
                    postserial: docRef.id || newPostSerial(),
                        regdate: Date.now(),
                        uid: currentUid()
                    };
                    docRef.set(record).then(function() {
                        closeEditor();
                        return loadPosts(false);
                    }).catch(handleError).then(function() {
                        setBusy(false);
                    });
                }
            } catch(error) {
                handleError(error);
                setBusy(false);
            }
        }

        function deletePost(docId) {
            if(! confirm('이 글을 삭제하시겠습니까?')) return;
            setBusy(true);
            setStatus('삭제 중입니다...', false);
            try {
                requireLogin();
                const docRef = state.db.collection('board').doc(docId);
                docRef.get().then(function(doc) {
                    if(! doc.exists) throw '글을 찾을 수 없습니다.';
                    const post = normalizePost(doc);
                    if(! canDelete(post)) throw '삭제 권한이 없습니다.';
                    return docRef.delete();
                }).then(function() {
                    closeEditor();
                    return loadPosts(false);
                }).catch(handleError).then(function() {
                    setBusy(false);
                });
            } catch(error) {
                handleError(error);
                setBusy(false);
            }
        }

        function findRenderedPost(docId) {
            const postNode = nodes.list.querySelector('[data-doc-id="' + docId.replace(/"/g, '\\"') + '"]');
            if(! postNode) return null;
            return state.db.collection('board').doc(docId).get().then(function(doc) {
                if(! doc.exists) throw '글을 찾을 수 없습니다.';
                return normalizePost(doc);
            });
        }

        nodes.loginButton.addEventListener('click', function() {
            if(state.backend == null || state.busy) return;
            setBusy(true);
            setStatus('Google 로그인 중입니다...', false);
            state.backend.openGoogleLogin().then(function(result) {
                if(result == null || ! result.success) throw ((result && result.message) ? result.message : 'Login failed.');
                refreshAuthView();
            }).catch(handleError).then(function() {
                setBusy(false);
            });
        });

        nodes.logoutButton.addEventListener('click', function() {
            if(state.backend == null || state.busy) return;
            setBusy(true);
            setStatus('로그아웃 중입니다...', false);
            state.backend.logout().then(function() {
                setStatus('', false);
                refreshAuthView();
            }).catch(handleError).then(function() {
                setBusy(false);
            });
        });

        nodes.writeButton.addEventListener('click', function() { openEditor(null); });
        nodes.cancelButton.addEventListener('click', closeEditor);
        nodes.saveButton.addEventListener('click', savePost);
        nodes.moreButton.addEventListener('click', function() { loadPosts(true); });
        nodes.editorText.addEventListener('input', updateEditorCount);

        nodes.list.addEventListener('click', function(event) {
            const target = event.target;
            if(! target || ! target.getAttribute) return;
            const docId = target.getAttribute('data-doc-id');
            if(! docId) return;
            if(target.classList.contains('board_post_edit')) {
                setBusy(true);
                findRenderedPost(docId).then(function(post) {
                    if(! canEdit(post)) throw '수정 권한이 없습니다.';
                    openEditor(post);
                }).catch(handleError).then(function() {
                    setBusy(false);
                });
            } else if(target.classList.contains('board_post_delete')) {
                deletePost(docId);
            }
        });

        try {
            if(typeof(__ssBackEnd) == 'undefined') throw 'Backend is not available.';
            state.backend = __ssBackEnd();
            if(state.backend == null || ! state.backend.avail) throw 'Firebase backend is not available.';
            if(state.backend.firestore == null) throw 'Firestore is not available.';
            state.db = state.backend.firestore;

            if(state.backend.authStateChangedEvents) {
                state.backend.authStateChangedEvents.push(function() {
                    if(! state.busy) refreshAuthView();
                });
            }

            state.backend.checkLogined().then(function() {
                refreshAuthView();
            }).catch(handleError);
        } catch(error) {
            handleError(error);
            showLogin();
        }
    });