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
import com.usky.sms.risk.systemanalysis.residualderivativerisk.ResidualRiskThreatMappingDO;
import com.usky.sms.risk.systemanalysis.residualderivativerisk.ResidualRiskThreatMappingDao;
import com.usky.sms.tem.threat.ThreatDO;
import com.usky.sms.tem.threat.ThreatDao;

public class SystemAnalysisRiskThreatMappingDao extends BaseDao<SystemAnalysisRiskThreatMappingDO> {
	
	@Autowired
	private ThreatDao threatDao;
	
	@Autowired
	private ResidualDerivativeRiskDao residualDerivativeRiskDao;
	
	@Autowired
	private ResidualRiskThreatMappingDao residualRiskThreatMappingDao;
	
	@Autowired
	private SystemAnalysisClauseDao systemAnalysisClauseDao;

	protected SystemAnalysisRiskThreatMappingDao() {
		super(SystemAnalysisRiskThreatMappingDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		SystemAnalysisRiskThreatMappingDO systemAnalysisRiskThreatMapping = (SystemAnalysisRiskThreatMappingDO) obj;
		if ("threat".equals(field.getName())) {
			Map<String, Object> threatMap = null;
			ThreatDO threat = systemAnalysisRiskThreatMapping.getThreat();
			if (threat != null) {
				threatMap = new HashMap<String, Object>();
				threatMap.put("id", threat.getId());
				threatMap.put("name", threat.getName());
				threatMap.put("num", threat.getNum());
			}
			map.put(field.getName(), threatMap);
		} else if ("riskLevelP".equals(field.getName())) {
			String risklevelColour = threatDao.vfyRisklevelColour(
					systemAnalysisRiskThreatMapping.getRiskLevelP(), systemAnalysisRiskThreatMapping.getRiskLevelS());
			map.put("colour", risklevelColour);
			map.put(field.getName(), systemAnalysisRiskThreatMapping.getRiskLevelP());
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		SystemAnalysisRiskThreatMappingDO systemAnalysisRiskThreatMapping = (SystemAnalysisRiskThreatMappingDO) obj;
		if (multiple && showExtendFields) {
			// 系统分析手册条款实例
			map.put("systemAnalysisClauses", systemAnalysisClauseDao.convert(systemAnalysisClauseDao.getByRiskThreatMappingId(systemAnalysisRiskThreatMapping.getId())));
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		if (map.get("threat") != null) {
			Integer threatId = ((Number) map.get("threat")).intValue();
			ThreatDO threat = threatDao.internalGetById(threatId);
			map.put("riskLevelP", threat.getRiskLevelP());
			map.put("riskLevelS", threat.getRiskLevelS());
		}
		return true;
	}

	@Override
	protected void afterSave(SystemAnalysisRiskThreatMappingDO obj) {
		// 生成对应的剩余风险的威胁
		Map<String, Object> residualRiskThreatMappingMap = new HashMap<String, Object>();
		residualRiskThreatMappingMap.put("systemAnalysisRiskThreatMappingId", obj.getId());
		ResidualDerivativeRiskDO residualDerivativeRisk = residualDerivativeRiskDao.getBySystemAnalysisRiskAnalysisId(obj.getRiskAnalysis().getId());
		if (residualDerivativeRisk != null) {
			residualRiskThreatMappingMap.put("residualDerivativeRisk", residualDerivativeRisk.getId());
		}
		if (obj.getThreat() != null) {
			residualRiskThreatMappingMap.put("threat", obj.getThreat().getId());
		}
		residualRiskThreatMappingMap.put("text", obj.getText());
		residualRiskThreatMappingMap.put("riskLevelP", obj.getRiskLevelP());
		residualRiskThreatMappingMap.put("riskLevelS", obj.getRiskLevelS());
		residualRiskThreatMappingDao.save(residualRiskThreatMappingMap);
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	@Override
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
		// 删除对应的剩余风险的威胁
		List<ResidualRiskThreatMappingDO> residualRiskThreatMappings = residualRiskThreatMappingDao.getBySystemAnalysisRiskThreatMappingIds(ids);
		if (!residualRiskThreatMappings.isEmpty()) {
			String[] residualRiskThreatMappingIds = new String[residualRiskThreatMappings.size()];
			int i = 0;
			for (ResidualRiskThreatMappingDO residualRiskThreatMapping : residualRiskThreatMappings) {
				residualRiskThreatMappingIds[i++] = residualRiskThreatMapping.getId().toString();
			}
			residualRiskThreatMappingDao.delete(residualRiskThreatMappingIds);
		}
	}
	
	/**
	 * 根据系统分析风险分析块的ID获取对应的系统分析风险分析块明细行（威胁）<br>
	 * 参数为null时返回空集合
	 * @param systemAnalysisRiskAnalysisId 系统分析风险分析块的ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<SystemAnalysisRiskThreatMappingDO> getBySystemAnalysisRiskAnalysisId(Integer systemAnalysisRiskAnalysisId) {
		if (systemAnalysisRiskAnalysisId == null) {
			return Collections.emptyList();
		}
		return (List<SystemAnalysisRiskThreatMappingDO>) this.query("from SystemAnalysisRiskThreatMappingDO t where t.deleted = false and t.riskAnalysis.id = ?", systemAnalysisRiskAnalysisId);
	}

	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}

	public void setResidualDerivativeRiskDao(ResidualDerivativeRiskDao residualDerivativeRiskDao) {
		this.residualDerivativeRiskDao = residualDerivativeRiskDao;
	}

	public void setResidualRiskThreatMappingDao(ResidualRiskThreatMappingDao residualRiskThreatMappingDao) {
		this.residualRiskThreatMappingDao = residualRiskThreatMappingDao;
	}

	public void setSystemAnalysisClauseDao(SystemAnalysisClauseDao systemAnalysisClauseDao) {
		this.systemAnalysisClauseDao = systemAnalysisClauseDao;
	}
	
}

