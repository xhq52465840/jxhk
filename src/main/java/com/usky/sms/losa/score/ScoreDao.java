package com.usky.sms.losa.score;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.core.BaseDao;
import com.usky.sms.losa.activity.FlyStageNameEnum;

public class ScoreDao extends BaseDao<ScoreDO>{
	
	public ScoreDao(){
		super(ScoreDO.class);
	}
	
	@SuppressWarnings("unchecked")
	public List<ScoreDO> queryByObserveId(Integer observeId) throws Exception{
		List<ScoreDO>list=new ArrayList<ScoreDO>();
		try{
			String hql="from ScoreDO t where t.deleted=false and t.observeActivityDO.id=?";
			list=this.getHibernateTemplate().find(hql,observeId);
		}catch(Exception e){
			e.printStackTrace();
		}
		return list;
	}
	
	public void updateScore(Map<String,Object>map,String activityId)throws Exception{
		try{
			String score=(String)map.get("score");
			this.updateOrSave(score, activityId);
			this.updateOrSave((String)map.get(FlyStageNameEnum.DEPARTURE.getKey()), activityId);
			this.updateOrSave((String)map.get(FlyStageNameEnum.TAKEOFF.getKey()), activityId);
			this.updateOrSave((String)map.get(FlyStageNameEnum.CRUISE.getKey()), activityId);
			this.updateOrSave((String)map.get(FlyStageNameEnum.TECHWORKSHEET.getKey()), activityId);
			this.updateOrSave((String)map.get(FlyStageNameEnum.LAUNCH.getKey()), activityId);
			this.updateOrSave((String)map.get(FlyStageNameEnum.WHOLEFLIGHT.getKey()), activityId);
		}catch(Exception e){
			e.printStackTrace();
		}
	}
	
	private void updateOrSave(String score,String activityId) throws Exception {
		try{
			if(!StringUtils.isEmpty(score)){
				List<Map<String,Object>>scoreList=gson.fromJson(score,new TypeToken<List<Map<String,Object>>>() {}.getType());
			    if(scoreList!=null){
			    	for(Map<String,Object> scoreMap:scoreList){
			    		ScoreDO scoreDO=new ScoreDO();
			    		scoreDO.setObserveActivity(Integer.valueOf(activityId));
			    		scoreDO.setScoreSelectkey(String.valueOf(scoreMap.get("scoreSelectKey")));
			    		Integer value = new BigDecimal(String.valueOf(scoreMap.get("scoreTempId"))).intValue();
			    		scoreDO.setScoreTemplet(value);
			    		
			    		if(scoreMap.get("scoreId")!=null){
			    			scoreDO.setId(new BigDecimal(String.valueOf(scoreMap.get("scoreId"))).intValue());
			    			this.internalUpdate(scoreDO);
			    		}else{
			    			this.internalSave(scoreDO);
			    		}
			    	}
			    }
			}
		}catch(Exception e){
			e.printStackTrace();
		}
	}

}
