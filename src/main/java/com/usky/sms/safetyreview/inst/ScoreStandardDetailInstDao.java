package com.usky.sms.safetyreview.inst;

import java.util.ArrayList;
import java.util.List;

import com.usky.sms.core.BaseDao;

public class ScoreStandardDetailInstDao extends BaseDao<ScoreStandardDetailInstDO> {
	
	protected ScoreStandardDetailInstDao() {
		super(ScoreStandardDetailInstDO.class);
	}
	
	@SuppressWarnings("unchecked")
	public List<ScoreStandardDetailInstDO> getByStandardInstId(Integer standardInstId){
		if(null == standardInstId){
			return new ArrayList<ScoreStandardDetailInstDO>();
		}else{
			return (List<ScoreStandardDetailInstDO>) this.query("from ScoreStandardDetailInstDO t where t.deleted = false and t.scoreStandardInst.id = ? order by t.leftInterval", standardInstId);
		}
	}
}
