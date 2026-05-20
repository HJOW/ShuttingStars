package org.duckdns.hjow.shuttingstars.firebase;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.duckdns.hjow.commons.json.JsonObject;
import org.duckdns.hjow.commons.util.ClassUtil;
import org.duckdns.hjow.commons.util.DataUtil;

import com.google.api.core.ApiFuture;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.FirestoreClient;

/** Firebase - firestore DB 사용을 위한 매니저 */
public class FirestoreManager {
    protected static final Logger LOGGER = LogManager.getLogger(FirestoreManager.class);
    
    private boolean using = false; // 사용여부 (true 로 하지 않으면 이 클래스 내 메소드 일체를 사용할 수 없음)
    private String firebaseConfigFile = "/***.json"; // Firebase 사이트에서 받은 admin 키 파일
    private String projectId = "shuttingstars-3eddf";
    
    protected Firestore conn;
    private boolean initialized = false;
    
    public FirestoreManager() {
        if(! initialized) init();
    }
    
    /** 초기화 */
    public void init() {
        if(initialized) { LOGGER.info("Firebase already prepared."); return; }
        if(! using) { LOGGER.info("FirestoreManager is disabled !"); return; }
        LOGGER.info("Firebase preparing...");
        
        InputStream inp = null;
        byte[] buff = new byte[2048];
        ByteArrayOutputStream coll = new ByteArrayOutputStream();
        int read;
        
        try {
        	JsonObject jsonConfig = new JsonObject();
        	inp = this.getClass().getResourceAsStream("firebase.json");
        	if(inp != null) {
        		while(true) {
        			read = inp.read(buff, 0, buff.length);
        			if(read < 0) break;
        			coll.write(buff, 0, read);
        		}
        		inp.close(); inp = null;
        		
        		jsonConfig = (JsonObject) JsonObject.parseJson(new String(coll.toByteArray(), "UTF-8"));
        		coll = null;
        		
        		using              = DataUtil.parseBoolean(jsonConfig.get("use").toString().trim());
        		firebaseConfigFile = jsonConfig.get("configFile").toString().trim();
        	}
        	
            InputStream serviceAccount = getClass().getResourceAsStream(firebaseConfigFile);
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setProjectId(projectId)
                    .build();

            FirebaseApp.initializeApp(options);
            conn = FirestoreClient.getFirestore();
            LOGGER.info("Firebase preparing END");
            initialized = true;
        } catch(Throwable t) {
            LOGGER.warn("Firebase preparing fail - (" + t.getClass().getSimpleName() + ") " + t.getMessage());
            LOGGER.trace("    detail...", t);
            initialized = false;
        } finally {
        	ClassUtil.closeAll(inp);
        }
    }
    
    /** Firebase 데이터 생성 */
    public String put(String collectionName, Map<String, Object> row) {
        if(! using) { LOGGER.info("FirestoreManager is disabled !"); return null; }
        return put(collectionName, null, row);
    }
    
    /** Firebase 데이터 수정 */
    public String put(String collectionName, String docId, Map<String, Object> row) {
        if(! using) { LOGGER.info("FirestoreManager is disabled !"); return null; }
        CollectionReference collection = conn.collection(collectionName);
        
        DocumentReference doc;
        if(docId == null) doc = collection.document();
        else              doc = collection.document(docId);
        docId = doc.getId();
        
        doc.set(row);
        return docId;
    }
    
    /** Firebase 목록 조회 */
    public List<Map<String, Object>> list(String collectionName) throws InterruptedException, ExecutionException {
        if(! using) { LOGGER.info("FirestoreManager is disabled !"); return null; }
        ApiFuture<QuerySnapshot> futures = conn.collection(collectionName).get();
        QuerySnapshot snapshot = futures.get();
        List<QueryDocumentSnapshot> docs = snapshot.getDocuments();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        
        for(QueryDocumentSnapshot snap : docs) {
            Map<String, Object> rowOne = new HashMap<String, Object>();
            rowOne.putAll( snap.getData() );
            rowOne.put("__id", snap.getId());
            list.add(rowOne);
        }
        
        return list;
    }
    
    /** Firebase 목록 조회 (값 일치 조건절 입력가능) */
    public List<Map<String, Object>> list(String collectionName, Map<String, Object> equalConditions) throws InterruptedException, ExecutionException {
        if(! using) { LOGGER.info("FirestoreManager is disabled !"); return null; }
        CollectionReference collRef = conn.collection(collectionName);
        ApiFuture<QuerySnapshot> futures;
        Query query = null;
        Set<String> fieldNames = equalConditions.keySet();
        for(String f : fieldNames) {
            query = collRef.whereEqualTo(f, equalConditions.get(f));
        }
        
        if(query == null) futures = collRef.get();
        else futures = query.get();
        
        QuerySnapshot snapshot = futures.get();
        List<QueryDocumentSnapshot> docs = snapshot.getDocuments();
        List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
        
        for(QueryDocumentSnapshot snap : docs) {
            Map<String, Object> rowOne = new HashMap<String, Object>();
            rowOne.putAll( snap.getData() );
            rowOne.put("__id", snap.getId());
            list.add(rowOne);
        }
        
        return list;
    }
    
    /** Firebase 문서 단건 조회 (조회 안된 경우 null 반환) */
    public Map<String, Object> get(String collectionName, String docId) throws InterruptedException, ExecutionException {
        if(! using) { LOGGER.info("FirestoreManager is disabled !"); return null; }
        DocumentReference docRef = conn.collection(collectionName).document(docId);
        ApiFuture<DocumentSnapshot> future = docRef.get();
        DocumentSnapshot doc = future.get();
        
        if(doc.exists()) {
            Map<String, Object> rowOne = new HashMap<String, Object>();
            rowOne.putAll(doc.getData());
            rowOne.put("__id", doc.getId());
            return rowOne;
        } else {
            return null;
        }
    }
    
    /** Firebase 단건 삭제 */
    public void delete(String collectionName, String docId) {
        if(! using) { LOGGER.info("FirestoreManager is disabled !"); return; }
        conn.collection(collectionName).document(docId).delete();
    }
    
    /** Firestore 접속 종료 */
    public void close() {
        if(conn != null) {
            try { conn.close(); LOGGER.info("Firestore DB Connection closed !"); } catch (Exception e) { throw new RuntimeException(e.getMessage(), e); }
            conn = null;
        }
        initialized = false;
    }
}
