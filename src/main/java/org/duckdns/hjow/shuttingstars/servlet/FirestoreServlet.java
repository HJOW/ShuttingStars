package org.duckdns.hjow.shuttingstars.servlet;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.duckdns.hjow.commons.util.DataUtil;
import org.duckdns.hjow.commons.util.HexUtil;
import org.duckdns.hjow.shuttingstars.firebase.FirestoreManager;

import com.fasterxml.jackson.databind.ObjectMapper;

/** Firebase - firestore DB 사용을 위한 서블릿 */
public class FirestoreServlet extends HttpServlet {
    private static final long serialVersionUID = -5036459627770813477L;
    protected static final Logger LOGGER = LogManager.getLogger(FirestoreServlet.class);
    private SimpleDateFormat formatter19 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private FirestoreManager manager;
    
    @Override
    public void init() {
        manager = new FirestoreManager();
    }
    
    @Override
    public void destroy() {
        manager.close();
    }
    
    @SuppressWarnings("unchecked")
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            String action = request.getParameter("action");
            
            ObjectMapper mapper = new ObjectMapper();
            
            String collection = request.getParameter("collection");
            String jsonParam  = request.getParameter("parameter");
            
            if(action.equalsIgnoreCase("list")) {
                List<Map<String, Object>> list = null;
                try {
                    if(DataUtil.isEmpty(collection)) throw new RuntimeException("The collection name must not be empty !");
                    
                    if(DataUtil.isNotEmpty(jsonParam)) {
                        jsonParam = HexUtil.decodeString(jsonParam);
                        Map<String, Object> map = mapper.readValue(jsonParam, HashMap.class);
                        
                        list = manager.list(collection, map);
                    } else {
                        list = manager.list(collection);
                    }
                } catch(Throwable tx) {
                    LOGGER.error(tx.getMessage(), tx);
                    if("JsonParseException".equals(tx.getClass().getSimpleName())) {
                        LOGGER.error("Original...");
                        LOGGER.error("    " + jsonParam);
                    }
                    list = new ArrayList<Map<String, Object>>();
                }
                
                response.setCharacterEncoding("UTF-8");
                response.setContentType("application/json");
                response.getWriter().write(mapper.writeValueAsString(list));
            } else if(action.equalsIgnoreCase("put")) {
                String docId = request.getParameter("docId");
                
                Map<String, Object> resp = new HashMap<String, Object>();
                resp.put("success", new Boolean(false));
                resp.put("message", "");
                
                try {
                    if(DataUtil.isEmpty(collection)) throw new RuntimeException("The collection name must not be empty !");
                    if(DataUtil.isEmpty(jsonParam)) throw new RuntimeException("Parameter contents cannot be empty !");
                    
                    jsonParam = HexUtil.decodeString(jsonParam);
                    Map<String, Object> paramMap = mapper.readValue(jsonParam, HashMap.class);
                    
                    if(DataUtil.isEmpty(paramMap.get("document"))) throw new RuntimeException("'document' field must be specified !");
                    if(DataUtil.isEmpty(docId)) {
                        // 신규 등록
                        // paramMap.put("_createdBy", sessMap.get("ID")); // 등록자ID 넣기
                        paramMap.put("_createdDate", formatter19.format(new java.util.Date(System.currentTimeMillis())));
                        paramMap.put("_updatedBy", "");
                        paramMap.put("_updatedDate", "");
                        paramMap.put("_hidden", "false");
                        manager.put(collection, paramMap);
                    } else {
                        // 수정
                        //     먼저 조회
                        Map<String, Object> befores = manager.get(collection, docId);
                        if(befores == null) throw new RuntimeException("The document does not exists !");
                        
                        /*
                        // 등록자 여부 검사
                        String createdBy = befores.get("_createdBy").toString();
                        if(! ("99".equals(sessMap.get("GRADE")) || createdBy.equals(sessMap.get("ID")))) {
                            throw new RuntimeException("Insufficient privileges.");
                        }
                        
                        // 수정자ID 넣기
                        paramMap.put("_updatedBy", sessMap.get("ID"));
                        */
                        paramMap.put("_updatedDate", formatter19.format(new java.util.Date(System.currentTimeMillis())));
                        
                        // 집행
                        manager.put(collection, docId, paramMap);
                    }
                    resp.put("success", new Boolean(true));
                    resp.put("message", "");
                } catch(Throwable tx) {
                    LOGGER.error(tx.getMessage(), tx);
                    String msg = "(" + tx.getClass().getSimpleName() + ") " + tx.getMessage();
                    if("JsonParseException".equals(tx.getClass().getSimpleName())) {
                        LOGGER.error("Original...");
                        LOGGER.error("    " + jsonParam);
                        msg += "\nOriginal...\n    " + jsonParam;
                    }
                    resp.put("success", new Boolean(false));
                    resp.put("message", msg);
                }
                
                response.setCharacterEncoding("UTF-8");
                response.setContentType("application/json");
                response.getWriter().write(mapper.writeValueAsString(resp));
            } else if(action.equalsIgnoreCase("delete")) {
                Map<String, Object> resp = new HashMap<String, Object>();
                resp.put("success", new Boolean(false));
                resp.put("message", "");
                
                String docId = request.getParameter("docId");
                
                try {
                    if(DataUtil.isEmpty(collection)) throw new RuntimeException("The collection name must not be empty !");
                    if(DataUtil.isEmpty(docId)) throw new RuntimeException("The document ID cannot be empty !");
                    
                    // 먼저 조회
                    Map<String, Object> befores = manager.get(collection, docId);
                    if(befores == null) throw new RuntimeException("The document does not exists !");
                    
                    /*
                    // 등록자 여부 검사
                    String createdBy = befores.get("_createdBy").toString();
                    if(! ("99".equals(sessMap.get("GRADE")) || createdBy.equals(sessMap.get("ID")))) {
                        throw new RuntimeException("Insufficient privileges.");
                    }
                    */
                    
                    // 집행
                    manager.delete(collection, docId);
                    resp.put("success", new Boolean(true));
                    resp.put("message", "");
                } catch(Throwable tx) {
                    LOGGER.error(tx.getMessage(), tx);
                    String msg = "(" + tx.getClass().getSimpleName() + ") " + tx.getMessage();
                    resp.put("success", new Boolean(false));
                    resp.put("message", msg);
                }
                
                response.setCharacterEncoding("UTF-8");
                response.setContentType("application/json");
                response.getWriter().write(mapper.writeValueAsString(resp));
            } else {
                response.sendError(404);
            }
        } catch(Throwable tx) {
            LOGGER.error("On " + this.getClass().getSimpleName() + " - (" + tx.getClass().getSimpleName() + ") " + tx.getMessage());
            response.sendError(500, "ERROR : " + tx.getMessage());
        }
    }
}
