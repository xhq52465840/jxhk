package com.usky.sms.risk.systemanalysis;

import java.lang.reflect.Field;
import java.util.Collections;
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
import com.usky.sms.risk.systemanalysis.residualderivativerisk.ResidualRiskErrorMappingDO;
import com.usky.sms.risk.systemanalysis.residualderivativerisk.ResidualRiskErrorMappingDao;
import com.usky.sms.tem.error.ErrorDO;
import com.usky.sms.tem.error.ErrorDao;
import com.usky.sms.tem.threat.ThreatDao;

public class SystemAnalysisRiskErrorMappingDao extends BaseDao<SystemAnalysisRiskErrorMappingDO> {
	
	@Autowired
	private ErrorDao errorDao;
	
	@Autowired
	private ThreatDao threatDao;
	
	@Autowired
	private ResidualDerivativeRiskDao residualDerivativeRiskDao;
	
	@Autowired
	private ResidualRiskErrorMappingDao residualRiskErrorMappingDao;
	
	@Autowired
	private SystemAnalysisClauseDao systemAnalysisClauseDao;

	protected SystemAnalysisRiskErrorMappingDao() {
		super(SystemAnalysisRiskErrorMappingDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		SystemAnalysisRiskErrorMappingDO systemAnalysisRiskErrorMapping = (SystemAnalysisRiskErrorMappingDO) obj;
		if ("error".equals(field.getName())) {
			Map<String, Object> errorMap = null;
			ErrorDO error = systemAnalysisRiskErrorMapping.getError();
			if (error != null) {
				errorMap = new HashMap<String, Object>();
				errorMap.put("id", error.getId());
				errorMap.put("name", error.getName());
				errorMap.put("num", error.getNum());
			}
			map.put(field.getName(), errorMap);
		} else if ("riskLevelP".equals(field.getName())) {
			String risklevelColour = threatDao.vfyRisklevelColour(
					systemAnalysisRiskErrorMapping.getRiskLevelP(), systemAnalysisRiskErrorMapping.getRiskLevelS());
			map.put("colour", risklevelColour);
			map.put(field.getName(), systemAnalysisRiskErrorMapping.getRiskLevelP());
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		SystemAnalysisRiskErrorMappingDO systemAnalysisRiskErrorMapping = (SystemAnalysisRiskErrorMappingDO) obj;
		if (multiple && showExtendFields) {
			// 系统分析手册条款实例
			map.put("systemAnalysisClauses", systemAnalysisClauseDao.convert(systemAnalysisClauseDao.getByRiskErrorMappingId(systemAnalysisRiskErrorMapping.getId())));
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		if (map.get("error") != null) {
			Integer errorId = ((Number) map.get("error")).intValue();
			ErrorDO error = errorDao.internalGetById(errorId);
			map.put("riskLevelP", error.getRiskLevelP());
			map.put("riskLevelS", error.getRiskLevelS());
		}
		return true;
	}

	@Override
	protected void afterSave(SystemAnalysisRiskErrorMappingDO obj) {
		// 生成对应的剩余风险的差错
		Map<String, Object> residualRiskErrorMappingMap = new HashMap<String, Object>();
		residualRiskErrorMappingMap.put("systemAnalysisRiskErrorMappingId", obj.getId());
		ResidualDerivativeRiskDO residualDerivativeRisk = residualDerivativeRiskDao.getBySystemAnalysisRiskAnalysisId(obj.getRiskAnalysis().getId());
		if (residualDerivativeRisk != null) {
			residualRiskErrorMappingMap.put("residualDerivativeRisk", residualDerivativeRisk.getId());
		}
		if (obj.getError() != null) {
			residualRiskErrorMappingMap.put("error", obj.getError().getId());
		}
		residualRiskErrorMappingMap.put("text", obj.getText());
		residualRiskErrorMappingMap.put("riskLevelP", obj.getRiskLevelP());
		residualRiskErrorMappingMap.put("riskLevelS", obj.getRiskLevelS());
		residualRiskErrorMappingDao.save(residualRiskErrorMappingMap);
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	@Override
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
		// 删除对应的剩余风险的差错
		List<ResidualRiskErrorMappingDO> residualRiskErrorMappings = residualRiskErrorMappingDao.getBySystemAnalysisRiskErrorMappingIds(ids);
		if (!residualRiskErrorMappings.isEmpty()) {
			String[] residualRiskErrorMappingIds = new String[residualRiskErrorMappings.size()];
			int i = 0;
			for (ResidualRiskErrorMappingDO residualRiskErrorMapping : residualRiskErrorMappings) {
				residualRiskErrorMappingIds[i++] = residualRiskErrorMapping.getId().toString();
			}
			residualRiskErrorMappingDao.delete(residualRiskErrorMappingIds);
		}
	}
	
	/**
	 * 根据系统分析风险分析块的ID获取对应的系统分析风险分析块明细行（差错）<br>
	 * 参数为null时返回空集合
	 * @param systemAnalysisRiskAnalysisId 系统分析风险分析块的ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<SystemAnalysisRiskErrorMappingDO> getBySystemAnalysisRiskAnalysisId(Integer systemAnalysisRiskAnalysisId) {
		if (systemAnalysisRiskAnalysisId == null) {
			return Collections.emptyList();
		}
		return (List<SystemAnalysisRiskErrorMappingDO>) this.query("from SystemAnalysisRiskErrorMappingDO t where t.deleted = false and t.riskAnalysis.id = ?", systemAnalysisRiskAnalysisId);
	}

	public void setErrorDao(ErrorDao errorDao) {
		this.errorDao = errorDao;
	}

	public void setResidualDerivativeRiskDao(ResidualDerivativeRiskDao residualDerivativeRiskDao) {
		this.residualDerivativeRiskDao = residualDerivativeRiskDao;
	}

	public void setResidualRiskErrorMappingDao(ResidualRiskErrorMappingDao residualRiskErrorMappingDao) {
		this.residualRiskErrorMappingDao = residualRiskErrorMappingDao;
	}

	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}

	public void setSystemAnalysisClauseDao(SystemAnalysisClauseDao systemAnalysisClauseDao) {
		this.systemAnalysisClauseDao = systemAnalysisClauseDao;
	}
	
}

