package com.usky.sms.losa.scoreTemplet;

import java.io.Serializable;
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
import com.usky.sms.losa.activity.FlyStageNameEnum;
import com.usky.sms.losa.score.ScoreSelectContentDO;


public class ScoreTempletService extends AbstractService{
	
	@Autowired
	private ScoreTempletDao  scoreTempletDao;
	
	public void queryScoreTemplet (HttpServletRequest request,HttpServletResponse response)throws Exception {		
		Map<String, Object> map = new HashMap<String, Object>();
		try{
		  String id = request.getParameter("id");
		  String flyStage = request.getParameter("flyStage");
		  Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
      Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
			Map resultmap = scoreTempletDao.query(id,flyStage,start,length);
			List<Object[]> list =  (List<Object[]>) resultmap.get("result");
			List resultList = new ArrayList<>();
      for (Object[] obj : list) {
        Map tempMap = new HashMap();
        tempMap.put("id", obj[0]);
        tempMap.put("deleted", ((BigDecimal) obj[5]).intValue()==0?false:true);
        tempMap.put("flyStageName", obj[7]);
        tempMap.put("flyStageValue", FlyStageNameEnum.getEnumByVal((String) obj[7]).getValue());
        tempMap.put("scoreStandard", obj[8]);
        tempMap.put("scoreItems", obj[9]);
        tempMap.put("scoreItemsExplan", obj[10]);
        tempMap.put("scoreItemContent", obj[11]);
        tempMap.put("scoreSelectType", obj[12]);
        tempMap.put("scoreItemsSort", obj[13]);
        resultList.add(tempMap);
      }
      String json = gson.toJson(resultList);
      
      map.put("success", "success");
      map.put("data", json);
      map.put("all", resultmap.get("all"));
      ResponseHelper.output(response, map);
		}catch(Exception e){
			e.printStackTrace();
			 ResponseHelper.output(response,e);
		}
	}
	
	 public void saveScoreTemplet (HttpServletRequest request,HttpServletResponse response)throws Exception {
	    Map<String, Object> map = new HashMap<String, Object>();
	    try {
	      String scoreTemplet = request.getParameter("scoreTemplet");

	      if (!StringUtils.isBlank(scoreTemplet)) {
	        ScoreTempletDO data = gson.fromJson(scoreTemplet, new TypeToken<ScoreTempletDO>() {}.getType());
	        Serializable id = scoreTempletDao.saveScoreTemplet(data);

	        map.put("success", "success");
	        map.put("resultDesc", "保存数据成功");
	        map.put("id", id);
	        ResponseHelper.output(response, map);
	      }
	    } catch (Exception e) {
	      e.printStackTrace();
	      map.put("Code", "failure");
	      map.put("resultDesc", "保存数据失败");
	      ResponseHelper.output(response, map);
	    }
	 }
	 
	 public void querySort (HttpServletRequest request,HttpServletResponse response)throws Exception {
		    Map<String, Object> map = new HashMap<String, Object>();
		    try {
		      String scoreTemplet = request.getParameter("scoreTemplet");

		      if (!StringUtils.isBlank(scoreTemplet)) {
		        ScoreTempletDO scoreTempletDo = gson.fromJson(scoreTemplet, new TypeToken<ScoreTempletDO>() {}.getType());
		        if(scoreTempletDao.querySort(scoreTempletDo)){
		        	map.put("code", "success");
		        	ResponseHelper.output(response, map);
		        }else{
		        	map.put("code", "failure");
				    ResponseHelper.output(response, map);
		        }	        
		        
		      }
		    } catch (Exception e) {
		      e.printStackTrace();
		      ResponseHelper.output(response, map);
		    }
		 }
	 
   public void deletedScoreTemplet (HttpServletRequest request,HttpServletResponse response)throws Exception {
     Map<String, Object> map = new HashMap<String, Object>();
     try {
       String scoreTemplet = request.getParameter("scoreTemplet");

       if (!StringUtils.isBlank(scoreTemplet)) {
         ScoreTempletDO data = gson.fromJson(scoreTemplet, new TypeToken<ScoreTempletDO>() {}.getType());
         scoreTempletDao.deletedScoreTemplet(data);

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

   public void addScoreTemplet (HttpServletRequest request,HttpServletResponse response)throws Exception {
     Map<String, Object> map = new HashMap<String, Object>();
     try {
       String scoreTemplet = request.getParameter("scoreTemplet");

       if (!StringUtils.isBlank(scoreTemplet)) {
         ScoreTempletDO data = gson.fromJson(scoreTemplet, new TypeToken<ScoreTempletDO>() {}.getType());
         scoreTempletDao.addScoreTemplet(data);

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

  public ScoreTempletDao getScoreTempletDao() {
    return scoreTempletDao;
  }

  public void setScoreTempletDao(ScoreTempletDao scoreTempletDao) {
    this.scoreTempletDao = scoreTempletDao;
  }

}
