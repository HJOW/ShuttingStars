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
    const lang = String(navigator.language || 'en').toLowerCase();
    const texts = ((lang === 'ko' || lang === 'ko-kr') ? {
        title: 'Community Board', write: '글 작성', edit: '글 수정', save: '저장', cancel: '취소', logout: '로그아웃',
        login: 'Google 로그인', loginDesc: '게시판을 이용하려면 Google 로그인이 필요합니다.', placeholder: '내용을 입력해 주세요.',
        empty: '등록된 글이 없습니다.', more: '더 보기', notice: '공지사항', noticeBadge: '공지', deletePost: '삭제',
        loading: '글 목록을 불러오는 중입니다...', loadingMore: '다음 글을 불러오는 중입니다...', signingIn: 'Google 로그인 중입니다...',
        signingOut: '로그아웃 중입니다...', saving: '저장 중입니다...', deleting: '삭제 중입니다...', error: '오류가 발생했습니다. ',
        loginRequired: '로그인이 필요합니다.', enterContent: '내용을 입력해 주세요.', tooLong: '글 내용은 1000자까지 입력할 수 있습니다.',
        notFound: '글을 찾을 수 없습니다.', noEdit: '수정 권한이 없습니다.', noDelete: '삭제 권한이 없습니다.',
        deleteConfirm: '이 글을 삭제하시겠습니까?', loginFailed: '로그인에 실패했습니다.', unknown: 'unknown'
    } : {
        title: 'Community Board', write: 'Write', edit: 'Edit Post', save: 'Save', cancel: 'Cancel', logout: 'Log out',
        login: 'Sign in with Google', loginDesc: 'Sign in with Google to use the board.', placeholder: 'Enter your post.',
        empty: 'No posts yet.', more: 'Load more', notice: 'Notice', noticeBadge: 'Notice', deletePost: 'Delete',
        loading: 'Loading posts...', loadingMore: 'Loading more posts...', signingIn: 'Signing in with Google...',
        signingOut: 'Signing out...', saving: 'Saving...', deleting: 'Deleting...', error: 'An error occurred. ',
        loginRequired: 'Sign-in is required.', enterContent: 'Enter your post.', tooLong: 'Posts can be up to 1000 characters.',
        notFound: 'Post not found.', noEdit: 'You do not have permission to edit this post.', noDelete: 'You do not have permission to delete this post.',
        deleteConfirm: 'Delete this post?', loginFailed: 'Sign-in failed.', unknown: 'unknown'
    });
    document.documentElement.lang = (lang === 'ko' || lang === 'ko-kr') ? 'ko' : 'en';

    const state = {
        backend: null, db: null, user: null, busy: false, loadingMore: false, editingDocId: null,
        noticeLastDoc: null, regularLastDoc: null, noticeDone: false, regularDone: false, renderedIds: {}, hasMore: false
    };
    const nodes = {
        root: document.getElementById('board_root'), title: document.querySelector('.board_title'),
        loginPanel: document.getElementById('board_login_panel'), loginDesc: document.getElementById('board_login_desc'),
        appPanel: document.getElementById('board_app_panel'), status: document.getElementById('board_status'),
        account: document.getElementById('board_account'), list: document.getElementById('board_list'),
        empty: document.getElementById('board_empty'), moreWrap: document.getElementById('board_more_wrap'),
        loginButton: document.getElementById('board_login_button'), writeButton: document.getElementById('board_write_button'),
        logoutButton: document.getElementById('board_logout_button'), moreButton: document.getElementById('board_more_button'),
        editor: document.getElementById('board_editor'), editorTitle: document.getElementById('board_editor_title'),
        editorText: document.getElementById('board_editor_text'), editorCount: document.getElementById('board_editor_count'),
        noticeWrap: document.getElementById('board_notice_wrap'), noticeCheckbox: document.getElementById('board_notice_checkbox'),
        noticeLabel: document.getElementById('board_notice_label'), saveButton: document.getElementById('board_save_button'),
        cancelButton: document.getElementById('board_cancel_button'), appActions: document.getElementById('board_app_actions')
    };

    function applyTexts() {
        nodes.title.textContent = texts.title;
        nodes.writeButton.textContent = texts.write;
        nodes.logoutButton.textContent = texts.logout;
        nodes.loginDesc.textContent = texts.loginDesc;
        // nodes.loginButton.textContent = texts.login;
        nodes.editorTitle.textContent = texts.write;
        nodes.editorText.setAttribute('placeholder', texts.placeholder);
        nodes.noticeLabel.textContent = texts.notice;
        nodes.saveButton.textContent = texts.save;
        nodes.cancelButton.textContent = texts.cancel;
        nodes.empty.textContent = texts.empty;
        nodes.moreButton.textContent = texts.more;
    }
    function setStatus(message, error) {
        nodes.status.textContent = message || '';
        nodes.status.classList.toggle('error', !! error);
    }
    function setBusy(value) {
        state.busy = !! value;
        nodes.root.setAttribute('aria-busy', state.busy ? 'true' : 'false');
        const buttons = nodes.root.querySelectorAll('button');
        for(let idx = 0; idx < buttons.length; idx++) buttons[idx].disabled = state.busy;
        nodes.noticeCheckbox.disabled = state.busy || ! isAdmin();
    }
    function escapeHtml(value) {
        return String(value == null ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function currentEmail() { return (state.user && state.user.email) ? String(state.user.email) : ''; }
    function currentUid() { return (state.user && state.user.uid) ? String(state.user.uid) : ''; }
    function isAdmin() { return currentEmail().toLowerCase() === ADMIN_EMAIL; }
    function canEdit(post) { return post && post.uid === currentUid(); }
    function canDelete(post) { return canEdit(post) || isAdmin(); }
    function formatDate(value) {
        const date = new Date(Number(value || 0));
        return isNaN(date.getTime()) ? '' : date.toLocaleString();
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
        updateNoticeOption();
    }
    function updateNoticeOption() {
        nodes.noticeWrap.classList.toggle('hidden', ! isAdmin());
        nodes.noticeCheckbox.disabled = state.busy || ! isAdmin();
        if(! isAdmin()) nodes.noticeCheckbox.checked = false;
    }
    function updateEditorCount() {
        const length = nodes.editorText.value.length;
        nodes.editorCount.textContent = length + ' / ' + MAX_CONTENT_LENGTH;
        nodes.editorCount.classList.toggle('error', length > MAX_CONTENT_LENGTH);
    }
    function openEditor(post) {
        state.editingDocId = post ? post._docId : null;
        nodes.editorTitle.textContent = post ? texts.edit : texts.write;
        nodes.editorText.value = post ? (post.content || '') : '';
        nodes.noticeCheckbox.checked = !! (post && post.notice);
        updateNoticeOption();
        updateEditorCount();
        nodes.editor.classList.remove('hidden');
        nodes.editorText.focus();
    }
    function closeEditor() {
        state.editingDocId = null;
        nodes.editorText.value = '';
        nodes.noticeCheckbox.checked = false;
        updateEditorCount();
        nodes.editor.classList.add('hidden');
    }
    function baseQuery() { return state.db.collection('board').where('boardName', '==', BOARD_NAME); }
    function normalizePost(doc) {
        const data = doc.data() || {};
        data._docId = doc.id;
        data.notice = data.notice === true;
        return data;
    }
    function resetPaging() {
        state.noticeLastDoc = null;
        state.regularLastDoc = null;
        state.noticeDone = false;
        state.regularDone = false;
        state.renderedIds = {};
        state.hasMore = false;
        nodes.list.innerHTML = '';
    }
    function renderPost(post) {
        const actions = [];
        if(canEdit(post)) actions.push('<button type="button" class="board_btn board_post_edit" data-doc-id="' + escapeHtml(post._docId) + '">' + escapeHtml(texts.edit) + '</button>');
        if(canDelete(post)) actions.push('<button type="button" class="board_btn danger board_post_delete" data-doc-id="' + escapeHtml(post._docId) + '">' + escapeHtml(texts.deletePost) + '</button>');
        const noticeBadge = post.notice ? '<span class="board_notice_badge">' + escapeHtml(texts.noticeBadge) + '</span> ' : '';
        nodes.list.insertAdjacentHTML('beforeend',
            '<article class="board_post' + (post.notice ? ' notice' : '') + '" data-doc-id="' + escapeHtml(post._docId) + '">' +
                '<div class="board_post_meta"><span class="board_post_email">' + noticeBadge + escapeHtml(post.email || texts.unknown) + '</span><span>' + escapeHtml(formatDate(post.regdate)) + '</span></div>' +
                '<p class="board_post_content">' + escapeHtml(post.content || '') + '</p>' +
                (actions.length ? '<div class="board_actions">' + actions.join('') + '</div>' : '') +
            '</article>');
        state.renderedIds[post._docId] = true;
    }
    function renderPosts(posts, append) {
        if(! append) nodes.list.innerHTML = '';
        for(let idx = 0; idx < posts.length; idx++) renderPost(posts[idx]);
        nodes.empty.classList.toggle('hidden', nodes.list.children.length > 0);
        nodes.moreWrap.classList.toggle('hidden', ! state.hasMore);
    }
    async function fetchNoticeBatch(posts) {
        if(state.noticeDone || posts.length >= PAGE_SIZE) return;
        let query = baseQuery().where('notice', '==', true).orderBy('regdate', 'desc').limit(PAGE_SIZE);
        if(state.noticeLastDoc) query = baseQuery().where('notice', '==', true).orderBy('regdate', 'desc').startAfter(state.noticeLastDoc).limit(PAGE_SIZE);
        const snapshot = await query.get();
        state.noticeLastDoc = snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : state.noticeLastDoc;
        if(snapshot.docs.length < PAGE_SIZE) state.noticeDone = true;
        snapshot.forEach(function(doc) {
            if(posts.length >= PAGE_SIZE) return;
            const post = normalizePost(doc);
            if(state.renderedIds[post._docId]) return;
            posts.push(post);
            state.renderedIds[post._docId] = true;
        });
    }
    async function fetchRegularBatch(posts) {
        let guard = 0;
        while(posts.length < PAGE_SIZE && ! state.regularDone && guard < 10) {
            guard++;
            let query = baseQuery().orderBy('regdate', 'desc').limit(PAGE_SIZE);
            if(state.regularLastDoc) query = baseQuery().orderBy('regdate', 'desc').startAfter(state.regularLastDoc).limit(PAGE_SIZE);
            const snapshot = await query.get();
            state.regularLastDoc = snapshot.docs.length ? snapshot.docs[snapshot.docs.length - 1] : state.regularLastDoc;
            if(snapshot.docs.length < PAGE_SIZE) state.regularDone = true;
            snapshot.forEach(function(doc) {
                if(posts.length >= PAGE_SIZE) return;
                const post = normalizePost(doc);
                if(post.notice || state.renderedIds[post._docId]) return;
                posts.push(post);
                state.renderedIds[post._docId] = true;
            });
            if(snapshot.docs.length <= 0) state.regularDone = true;
        }
    }
    async function loadPosts(append) {
        if(state.loadingMore || state.db == null) return;
        state.loadingMore = true;
        if(! append) resetPaging();
        setStatus(append ? texts.loadingMore : texts.loading, false);
        try {
            const posts = [];
            while(posts.length < PAGE_SIZE && ! state.noticeDone) await fetchNoticeBatch(posts);
            if(posts.length < PAGE_SIZE) await fetchRegularBatch(posts);
            state.hasMore = ! state.noticeDone || ! state.regularDone;
            renderPosts(posts, append);
            setStatus('', false);
        } catch(error) {
            handleError(error);
        } finally {
            state.loadingMore = false;
        }
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
        setStatus(texts.error + (error && error.message ? error.message : String(error)), true);
    }
    function requireLogin() {
        if(! state.backend || ! state.backend.logined || ! state.backend.user) throw texts.loginRequired;
    }
    function selectedNotice() { return isAdmin() && nodes.noticeCheckbox.checked; }
    function savePost() {
        const content = nodes.editorText.value.trim();
        if(! content) { setStatus(texts.enterContent, true); nodes.editorText.focus(); return; }
        if(content.length > MAX_CONTENT_LENGTH) { setStatus(texts.tooLong, true); nodes.editorText.focus(); return; }
        setBusy(true);
        setStatus(texts.saving, false);
        try {
            requireLogin();
            if(state.editingDocId) {
                state.db.collection('board').doc(state.editingDocId).get().then(function(doc) {
                    if(! doc.exists) throw texts.notFound;
                    const post = normalizePost(doc);
                    if(! canEdit(post)) throw texts.noEdit;
                    const updateData = { content: content, moddate: Date.now() };
                    if(isAdmin()) updateData.notice = selectedNotice();
                    return doc.ref.update(updateData);
                }).then(function() {
                    closeEditor();
                    return loadPosts(false);
                }).catch(handleError).then(function() {
                    setBusy(false);
                });
            } else {
                const docRef = state.db.collection('board').doc();
                docRef.set({
                    boardName: BOARD_NAME, content: content, email: currentEmail(), postserial: docRef.id,
                    regdate: Date.now(), uid: currentUid(), notice: selectedNotice()
                }).then(function() {
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
        if(! confirm(texts.deleteConfirm)) return;
        setBusy(true);
        setStatus(texts.deleting, false);
        try {
            requireLogin();
            const docRef = state.db.collection('board').doc(docId);
            docRef.get().then(function(doc) {
                if(! doc.exists) throw texts.notFound;
                const post = normalizePost(doc);
                if(! canDelete(post)) throw texts.noDelete;
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
    function findPost(docId) {
        return state.db.collection('board').doc(docId).get().then(function(doc) {
            if(! doc.exists) throw texts.notFound;
            return normalizePost(doc);
        });
    }

    nodes.loginButton.addEventListener('click', function() {
        if(state.backend == null || state.busy) return;
        setBusy(true);
        setStatus(texts.signingIn, false);
        state.backend.openGoogleLogin().then(function(result) {
            if(result == null || ! result.success) throw ((result && result.message) ? result.message : texts.loginFailed);
            refreshAuthView();
        }).catch(handleError).then(function() { setBusy(false); });
    });
    nodes.logoutButton.addEventListener('click', function() {
        if(state.backend == null || state.busy) return;
        setBusy(true);
        setStatus(texts.signingOut, false);
        state.backend.logout().then(function() {
            setStatus('', false);
            refreshAuthView();
        }).catch(handleError).then(function() { setBusy(false); });
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
            findPost(docId).then(function(post) {
                if(! canEdit(post)) throw texts.noEdit;
                openEditor(post);
            }).catch(handleError).then(function() { setBusy(false); });
        } else if(target.classList.contains('board_post_delete')) {
            deletePost(docId);
        }
    });

    applyTexts();
    closeEditor();
    try {
        if(typeof(__ssBackEnd) == 'undefined') throw 'Backend is not available.';
        state.backend = __ssBackEnd();
        if(state.backend == null || ! state.backend.avail) throw 'Firebase backend is not available.';
        if(state.backend.firestore == null) throw 'Firestore is not available.';
        state.db = state.backend.firestore;
        if(state.backend.authStateChangedEvents) {
            state.backend.authStateChangedEvents.push(function() { if(! state.busy) refreshAuthView(); });
        }
        state.backend.checkLogined().then(refreshAuthView).catch(handleError);
    } catch(error) {
        handleError(error);
        showLogin();
    }
});