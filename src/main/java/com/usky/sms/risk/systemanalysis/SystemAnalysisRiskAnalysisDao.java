package com.usky.sms.risk.systemanalysis;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.risk.systemanalysis.residualderivativerisk.ResidualDerivativeRiskDO;
import com.usky.sms.risk.systemanalysis.residualderivativerisk.ResidualDerivativeRiskDao;
import com.usky.sms.risk.systemanalysis.residualderivativerisk.ResidualRiskErrorMappingDao;
import com.usky.sms.risk.systemanalysis.residualderivativerisk.ResidualRiskThreatMappingDao;
import com.usky.sms.user.UserContext;

public class SystemAnalysisRiskAnalysisDao extends BaseDao<SystemAnalysisRiskAnalysisDO> {
	
	@Autowired
	private ResidualDerivativeRiskDao residualDerivativeRiskDao;
	
	@Autowired
	private SystemAnalysisRiskThreatMappingDao systemAnalysisRiskThreatMappingDao;
	
	@Autowired
	private SystemAnalysisRiskErrorMappingDao systemAnalysisRiskErrorMappingDao;
	
	@Autowired
	private ResidualRiskThreatMappingDao residualRiskThreatMappingDao;
	
	@Autowired
	private ResidualRiskErrorMappingDao residualRiskErrorMappingDao;

	protected SystemAnalysisRiskAnalysisDao() {
		super(SystemAnalysisRiskAnalysisDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		SystemAnalysisRiskAnalysisDO systemAnalysisRiskAnalysis = (SystemAnalysisRiskAnalysisDO) obj;
		if ("riskThreatMappings".equals(fieldName)) {
			List<SystemAnalysisRiskThreatMappingDO> systemAnalysisRiskThreatMappings = systemAnalysisRiskThreatMappingDao.getBySystemAnalysisRiskAnalysisId(systemAnalysisRiskAnalysis.getId());
			map.put(fieldName, systemAnalysisRiskThreatMappingDao.convert(systemAnalysisRiskThreatMappings));
		} else if ("riskErrorMappings".equals(fieldName)) {
			List<SystemAnalysisRiskErrorMappingDO> systemAnalysisRiskErrorMappings = systemAnalysisRiskErrorMappingDao.getBySystemAnalysisRiskAnalysisId(systemAnalysisRiskAnalysis.getId());
			map.put(fieldName, systemAnalysisRiskErrorMappingDao.convert(systemAnalysisRiskErrorMappings));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
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
	protected void afterSave(SystemAnalysisRiskAnalysisDO obj) {
		// 生成对应的剩余风险
		Map<String, Object> residualDerivativeRiskMap = new HashMap<String, Object>();
		residualDerivativeRiskMap.put("systemAnalysisRiskAnalysisId", obj.getId());
		if (obj.getSystem() != null) {
			residualDerivativeRiskMap.put("system", obj.getSystem().getId());
		}
		residualDerivativeRiskDao.save(residualDerivativeRiskMap);
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		map.put("lastUpdater", UserContext.getUserId());
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	@Override
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
		// 删除对应的剩余风险
		List<ResidualDerivativeRiskDO> residualDerivativeRisks = residualDerivativeRiskDao.getBySystemAnalysisRiskAnalysisIds(ids);
		if (!residualDerivativeRisks.isEmpty()) {
			String[] residualDerivativeRiskIds = new String[residualDerivativeRisks.size()];
			int i = 0;
			for (ResidualDerivativeRiskDO residualDerivativeRisk : residualDerivativeRisks) {
				residualDerivativeRiskIds[i++] = residualDerivativeRisk.getId().toString();
			}
			residualDerivativeRiskDao.delete(residualDerivativeRiskIds);
		}
	}
	
	@SuppressWarnings("unchecked")
	public List<SystemAnalysisRiskAnalysisDO> getByActivityId(int activityId) {
		return (List<SystemAnalysisRiskAnalysisDO>) this.query("from SystemAnalysisRiskAnalysisDO t where t.deleted = false and t.activity.id = ?", activityId);
	}
	
	public void setResidualDerivativeRiskDao(ResidualDerivativeRiskDao residualDerivativeRiskDao) {
		this.residualDerivativeRiskDao = residualDerivativeRiskDao;
	}

	public void setResidualRiskThreatMappingDao(ResidualRiskThreatMappingDao residualRiskThreatMappingDao) {
		this.residualRiskThreatMappingDao = residualRiskThreatMappingDao;
	}

	public void setResidualRiskErrorMappingDao(ResidualRiskErrorMappingDao residualRiskErrorMappingDao) {
		this.residualRiskErrorMappingDao = residualRiskErrorMappingDao;
	}

	public void setSystemAnalysisRiskThreatMappingDao(SystemAnalysisRiskThreatMappingDao systemAnalysisRiskThreatMappingDao) {
		this.systemAnalysisRiskThreatMappingDao = systemAnalysisRiskThreatMappingDao;
	}

	public void setSystemAnalysisRiskErrorMappingDao(SystemAnalysisRiskErrorMappingDao systemAnalysisRiskErrorMappingDao) {
		this.systemAnalysisRiskErrorMappingDao = systemAnalysisRiskErrorMappingDao;
	}
	
}

 