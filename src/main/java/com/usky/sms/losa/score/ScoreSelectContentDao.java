package com.usky.sms.losa.score;

import java.util.ArrayList;
import java.util.List;

import com.usky.sms.core.BaseDao;

public class ScoreSelectContentDao extends BaseDao<ScoreSelectContentDO>{
    
	public ScoreSelectContentDao(){
		super(ScoreSelectContentDO.class);
	}
	
	public List<ScoreSelectContentDO> queryByType(Integer type,List<ScoreSelectContentDO> valueList) throws Exception{
		List<ScoreSelectContentDO>result=new ArrayList<ScoreSelectContentDO>();
		try{
			if(valueList.size()>0){
				for(ScoreSelectContentDO select:valueList){
					if(select.getScoreType().equals(type)){
						result.add(select);
					}
				}
			}
			
		}catch(Exception e){
			e.printStackTrace();
		}
		return result;
	}
}
