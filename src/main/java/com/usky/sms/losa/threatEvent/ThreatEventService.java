package com.usky.sms.losa.threatEvent;

import java.math.BigDecimal;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.losa.UnexceptStatusBaseInfoDO;
import com.usky.sms.losa.UnexceptStatusBaseInfoDao;
import com.usky.sms.losa.error.ErrorBaseInfoDO;
import com.usky.sms.losa.error.ErrorBaseInfoDao;
import com.usky.sms.losa.threat.ThreatBaseInfoDO;

public class ThreatEventService extends AbstractService{
	
  @Autowired
  private ThreatEventDao threatEventDao;
  @Autowired
  private ErrorBaseInfoDao errorBaseInfoDao;
  @Autowired
  private UnexceptStatusBaseInfoDao unexceptStatusBaseInfoDao;
	
	public void queryThreatEvent (HttpServletRequest request,HttpServletResponse response)throws Exception {		
		Map<String, Object> map = new HashMap<String, Object>();
		try{
		  String eventType = request.getParameter("eventType");
			List<Object[]> list=threatEventDao.queryThreatEvent(eventType);
			
			Map resultMap = new HashMap();
			resultMap.put("name", "事件类型");
      resultMap.put("number", "0");
      resultMap.put("parentNode", "");
      resultMap.put("level", "0");
      resultMap.put("id", "");
      resultMap.put("deleted", "");
      resultMap.put("children", new ArrayList());
      for (Object[] obj : list) {
        Integer level = ((BigDecimal) obj[0]).intValue();
        ArrayList tempList = new ArrayList();
        tempList = (ArrayList) resultMap.get("children");
        for (int i = 0; i < level-1; i++) {
          tempList = (ArrayList) ((HashMap) tempList.get(tempList.size() - 1)).get("children");
        }
        Map tempMap = new HashMap();
        tempMap.put("name", obj[2]);
        tempMap.put("number", obj[1]);
        tempMap.put("parentNode", obj[3]);
        tempMap.put("level", obj[0]);
        tempMap.put("id", obj[4]);
        tempMap.put("deleted", obj[5]);
        tempMap.put("children", new ArrayList());
        tempList.add(tempMap);
      }
      String json = gson.toJson(resultMap);
      
      map.put("success", "success");
      map.put("data", json);
      ResponseHelper.output(response, map);
		}catch(Exception e){
			e.printStackTrace();
			 ResponseHelper.output(response,e);
		}
	}
	
	 public void saveThreatEvent (HttpServletRequest request,HttpServletResponse response)throws Exception {
	    Map<String, Object> map = new HashMap<String, Object>();
	    boolean isNameRepeat = false;
	    try {
	      String threatEvent = request.getParameter("threatEvent");
	      String eventType = request.getParameter("eventType");
	      if (!StringUtils.isBlank(threatEvent)) {
	        switch(eventType)
	        {
	        case "L_THREAT_BASEINFO":
	          ThreatBaseInfoDO data1 = gson.fromJson(threatEvent, new TypeToken<ThreatBaseInfoDO>() {}.getType());
	          if(threatEventDao.isNameRepeat(eventType,data1.getParentNode(),data1.getName(),data1.getNumber())){
	            isNameRepeat = true;
	            break;
	          }            
	          threatEventDao.saveThreatEvent(data1);
	          break;
	        case "L_ERROR_BASEINFO":
	          ErrorBaseInfoDO data2 = gson.fromJson(threatEvent, new TypeToken<ErrorBaseInfoDO>() {}.getType());
	          if(threatEventDao.isNameRepeat(eventType,data2.getParentNode(),data2.getName(),data2.getNumber())){
              isNameRepeat = true;
              break;
            }   
	          errorBaseInfoDao.saveErrorEvent(data2);
            break;
	        case "L_UNEXCEPT_STATUS_BASEINFO":
	          UnexceptStatusBaseInfoDO data3 = gson.fromJson(threatEvent, new TypeToken<UnexceptStatusBaseInfoDO>() {}.getType());
	          if(threatEventDao.isNameRepeat(eventType,data3.getParentNode(),data3.getName(),data3.getNumber())){
              isNameRepeat = true;
              break;
            }   
	          unexceptStatusBaseInfoDao.saveUnexceptStatusEvent(data3);
            break;
	        }
	        if(isNameRepeat){
	          map.put("Code", "failure");
	          map.put("resultDesc", "事件名称有重复");
	          ResponseHelper.output(response, map);
	        }else{
	          map.put("success", "success");
	          map.put("resultDesc", "保存数据成功");
	          ResponseHelper.output(response, map);
	        }        
	      }
	    } catch (Exception e) {
	      e.printStackTrace();
	      map.put("Code", "failure");
	      map.put("resultDesc", "保存数据失败");
	      ResponseHelper.output(response, map);
	    }
	 }
	 
   public void deletedThreatEvent (HttpServletRequest request,HttpServletResponse response)throws Exception {
     Map<String, Object> map = new HashMap<String, Object>();
     try {
       String threatEvent = request.getParameter("threatEvent");
       String eventType = request.getParameter("eventType");
       if (!StringUtils.isBlank(threatEvent)) {
         switch(eventType)
         {
         case "L_THREAT_BASEINFO":
           ThreatBaseInfoDO data1 = gson.fromJson(threatEvent, new TypeToken<ThreatBaseInfoDO>() {}.getType());
           threatEventDao.deletedThreatEvent(data1);
           break;
         case "L_ERROR_BASEINFO":
           ErrorBaseInfoDO data2 = gson.fromJson(threatEvent, new TypeToken<ErrorBaseInfoDO>() {}.getType());
           errorBaseInfoDao.deletedErrorEvent(data2);
           break;
         case "L_UNEXCEPT_STATUS_BASEINFO":
           UnexceptStatusBaseInfoDO data3 = gson.fromJson(threatEvent, new TypeToken<UnexceptStatusBaseInfoDO>() {}.getType());
           unexceptStatusBaseInfoDao.deletedUnexceptStatusEvent(data3);
           break;
         }

         map.put("success", "success");
         map.put("resultDesc", "失效数据成功");
         ResponseHelper.output(response, map);
       }
     } catch (Exception e) {
       e.printStackTrace();
       map.put("Code", "failure");
       map.put("resultDesc", "失效数据失败");
       ResponseHelper.output(response, map);
     }
  }

   public void addThreatEvent (HttpServletRequest request,HttpServletResponse response)throws Exception {
     Map<String, Object> map = new HashMap<String, Object>();
     try {
       String threatEvent = request.getParameter("threatEvent");
       String eventType = request.getParameter("eventType");
       if (!StringUtils.isBlank(threatEvent)) {
         switch(eventType)
         {
         case "L_THREAT_BASEINFO":
           ThreatBaseInfoDO data1 = gson.fromJson(threatEvent, new TypeToken<ThreatBaseInfoDO>() {}.getType());
           threatEventDao.addThreatEvent(data1);
           break;
         case "L_ERROR_BASEINFO":
           ErrorBaseInfoDO data2 = gson.fromJson(threatEvent, new TypeToken<ErrorBaseInfoDO>() {}.getType());
           errorBaseInfoDao.addErrorEvent(data2);
           break;
         case "L_UNEXCEPT_STATUS_BASEINFO":
           UnexceptStatusBaseInfoDO data3 = gson.fromJson(threatEvent, new TypeToken<UnexceptStatusBaseInfoDO>() {}.getType());
           unexceptStatusBaseInfoDao.addUnexceptStatusEvent(data3);
           break;
         }

         map.put("success", "success");
         map.put("resultDesc", "复效数据成功");
         ResponseHelper.output(response, map);
       }
     } catch (Exception e) {
       e.printStackTrace();
       map.put("Code", "failure");
       map.put("resultDesc", "复效数据失败");
       ResponseHelper.output(response, map);
     }
  }
   
  public ThreatEventDao getThreatEventDao() {
    return threatEventDao;
  }

  public void setThreatEventDao(ThreatEventDao threatEventDao) {
    this.threatEventDao = threatEventDao;
  }

  public ErrorBaseInfoDao getErrorBaseInfoDao() {
    return errorBaseInfoDao;
  }

  public void setErrorBaseInfoDao(ErrorBaseInfoDao errorBaseInfoDao) {
    this.errorBaseInfoDao = errorBaseInfoDao;
  }

  public UnexceptStatusBaseInfoDao getUnexceptStatusBaseInfoDao() {
    return unexceptStatusBaseInfoDao;
  }

  public void setUnexceptStatusBaseInfoDao(UnexceptStatusBaseInfoDao unexceptStatusBaseInfoDao) {
    this.unexceptStatusBaseInfoDao = unexceptStatusBaseInfoDao;
  }
  
}
