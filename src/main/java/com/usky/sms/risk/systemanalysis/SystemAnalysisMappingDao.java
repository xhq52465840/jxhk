package com.usky.sms.risk.systemanalysis;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserContext;

public class SystemAnalysisMappingDao extends BaseDao<SystemAnalysisMappingDO> {
	
	@Autowired
	private SystemAnalysisDao systemAnalysisDao;

	protected SystemAnalysisMappingDao() {
		super(SystemAnalysisMappingDO.class);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		SystemAnalysisMappingDO systemAnalysisMapping = (SystemAnalysisMappingDO) obj;
		String fieldName = field.getName();
		if ("systemAnalysis".equals(fieldName)) {
			SystemAnalysisDO systemAnalysis = systemAnalysisMapping.getSystemAnalysis();
			if (systemAnalysis != null) {
				Map<String, Object> systemAnalysisMap = systemAnalysisDao.convert(systemAnalysis, false);
				systemAnalysisMap.put("tertiaryWorkflow", systemAnalysisMapping.getTertiaryWorkflow());
				map.put("systemAnalysis", systemAnalysisMap);
			}
		}
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
	protected void beforeUpdate(int id, Map<String, Object> map) {
		map.put("lastUpdater", UserContext.getUserId());
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	@Override
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	@SuppressWarnings("unchecked")
	public List<SystemAnalysisMappingDO> getByActivityId(int activityId) {
		return (List<SystemAnalysisMappingDO>) this.query("from SystemAnalysisMappingDO t where t.deleted = false and t.activity.id = ?", activityId);
	}

	public void setSystemAnalysisDao(SystemAnalysisDao systemAnalysisDao) {
		this.systemAnalysisDao = systemAnalysisDao;
	}
	
}

