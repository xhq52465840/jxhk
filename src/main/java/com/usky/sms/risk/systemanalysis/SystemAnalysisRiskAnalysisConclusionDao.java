package com.usky.sms.risk.systemanalysis;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserContext;

public class SystemAnalysisRiskAnalysisConclusionDao extends BaseDao<SystemAnalysisRiskAnalysisConclusionDO> {
	
	protected SystemAnalysisRiskAnalysisConclusionDao() {
		super(SystemAnalysisRiskAnalysisConclusionDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}

	@Override
	protected void afterSave(SystemAnalysisRiskAnalysisConclusionDO obj) {
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		map.put("lastUpdater", UserContext.getUserId());
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	@Override
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	@SuppressWarnings("unchecked")
	public SystemAnalysisRiskAnalysisConclusionDO getByActivityId(int activityId) {
		List<SystemAnalysisRiskAnalysisConclusionDO> list = (List<SystemAnalysisRiskAnalysisConclusionDO>) this.query("from SystemAnalysisRiskAnalysisConclusionDO t where t.deleted = false and t.activity.id = ?", activityId);
		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}
	
}

 