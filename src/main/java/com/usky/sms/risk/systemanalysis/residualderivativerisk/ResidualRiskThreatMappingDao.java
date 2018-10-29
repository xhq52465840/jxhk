package com.usky.sms.risk.systemanalysis.residualderivativerisk;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.alibaba.dubbo.common.utils.StringUtils;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.tem.threat.ThreatDO;
import com.usky.sms.tem.threat.ThreatDao;

public class ResidualRiskThreatMappingDao extends BaseDao<ResidualRiskThreatMappingDO> {
	
	@Autowired
	private ThreatDao threatDao;
	
	@Autowired
	private DerivativeRiskErrorMappingDao derivativeRiskErrorMappingDao;
	
	@Autowired
	private DerivativeRiskThreatMappingDao derivativeRiskThreatMappingDao;

	protected ResidualRiskThreatMappingDao() {
		super(ResidualRiskThreatMappingDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		ResidualRiskThreatMappingDO residualRiskThreatMapping = (ResidualRiskThreatMappingDO) obj;
		if ("threat".equals(field.getName())) {
			Map<String, Object> threatMap = null;
			ThreatDO threat = residualRiskThreatMapping.getThreat();
			if (threat != null) {
				threatMap = new HashMap<String, Object>();
				threatMap.put("id", threat.getId());
				threatMap.put("name", threat.getName());
				threatMap.put("num", threat.getNum());
			}
			map.put(field.getName(), threatMap);
		} else if ("riskLevelP".equals(field.getName())) {
			String risklevelColour = threatDao.vfyRisklevelColour(
					residualRiskThreatMapping.getRiskLevelP(), residualRiskThreatMapping.getRiskLevelS());
			map.put("colour", risklevelColour);
			map.put(field.getName(), residualRiskThreatMapping.getRiskLevelP());
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		ResidualRiskThreatMappingDO residualRiskThreatMapping = (ResidualRiskThreatMappingDO) obj;
		if (multiple && showExtendFields) {
			// 对应的衍生风险的威胁
			List<DerivativeRiskThreatMappingDO> derivativeRiskThreatMappings = derivativeRiskThreatMappingDao.getByResidualRiskThreatMappingId(residualRiskThreatMapping.getId());
			List<Map<String, Object>> derivativeRiskThreatMappingMaps = derivativeRiskThreatMappingDao.convert(derivativeRiskThreatMappings);
			for (Map<String, Object> derivativeRiskThreatMappingMap : derivativeRiskThreatMappingMaps) {
				derivativeRiskThreatMappingMap.put("systemAnalysisRiskThreatMappingId", residualRiskThreatMapping.getSystemAnalysisRiskThreatMappingId());
			}
			map.put("derivativeRiskThreatMappings", derivativeRiskThreatMappingMaps);
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	@Override
	@SuppressWarnings("unchecked")
	protected Object getQueryParamValue(String key, Object value) {
		if ("residualDerivativeRisk.id".equals(key) || "systemAnalysisRiskThreatMappingId".equals(key) || "threat.id".equals(key)) {
			if (null == value) {
				return null;
			}
			if (value instanceof Collection || value instanceof Object[]) {
				List<Integer> resultList = new ArrayList<Integer>();
				if (value instanceof Collection) {
					for (Object o : (Collection<Object>) value) {
						resultList.add((Integer) getQueryParamValue(key, o));
					}
				} else {
					for (Object o : (Object[]) value) {
						resultList.add((Integer) getQueryParamValue(key, o));
					}
				}
				return resultList;
			} else if (value instanceof Number) {
				return ((Number) value).intValue();
			}
			return (NumberHelper.toInteger((String) value));
		}
		return super.getQueryParamValue(key, value);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// 如果剩余风险修改了风险等级则将对应的危险源的风险等级也修改
		if (map.containsKey("riskLevelP") || map.containsKey("riskLevelS")) {
			ResidualRiskThreatMappingDO residualRiskThreatMapping = this.internalGetById(id);
			ThreatDO threat = residualRiskThreatMapping.getThreat();
			if (threat != null) {
				if (map.containsKey("riskLevelP")) {
					threat.setRiskLevelP(map.get("riskLevelP") == null ? null : ((Number) map.get("riskLevelP")).intValue());
				}
				if (map.containsKey("riskLevelS")) {
					threat.setRiskLevelS(map.get("riskLevelS") == null ? null : ((Number) map.get("riskLevelS")).intValue());
				}
				threatDao.internalUpdate(threat);
			}
		}
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	@Override
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	/**
	 * 根据系统分析风险分析块明细行（威胁） ID的数组获取对应的剩余风险块明细行（威胁）
	 * @param systemAnalysisRiskThreatMappingIds 系统分析风险分析块明细行（威胁） ID的数组
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ResidualRiskThreatMappingDO> getBySystemAnalysisRiskThreatMappingIds(String[] systemAnalysisRiskThreatMappingIds) {
		if (systemAnalysisRiskThreatMappingIds == null || systemAnalysisRiskThreatMappingIds.length < 1) {
			return Collections.emptyList();
		}
		StringBuilder hql = new StringBuilder("from ResidualRiskThreatMappingDO where systemAnalysisRiskThreatMappingId in (");
		hql.append(StringUtils.join(systemAnalysisRiskThreatMappingIds));
		hql.append(")");
		return (List<ResidualRiskThreatMappingDO>) this.query(hql.toString());
	}
	
	/**
	 * 根据剩余衍生风险分析块的ID获取对应的剩余风险块明细行（威胁）<br>
	 * 参数为null时返回空集合
	 * @param residualDerivativeRiskId 剩余衍生风险分析块的ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ResidualRiskThreatMappingDO> getByResidualDerivativeRiskId(Integer residualDerivativeRiskId) {
		if (residualDerivativeRiskId == null) {
			return Collections.emptyList();
		}
		return (List<ResidualRiskThreatMappingDO>) this.query("from ResidualRiskThreatMappingDO t where t.deleted = false and t.residualDerivativeRisk.id = ?", residualDerivativeRiskId);
	}

	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}

	public void setDerivativeRiskErrorMappingDao(DerivativeRiskErrorMappingDao derivativeRiskErrorMappingDao) {
		this.derivativeRiskErrorMappingDao = derivativeRiskErrorMappingDao;
	}

	public void setDerivativeRiskThreatMappingDao(DerivativeRiskThreatMappingDao derivativeRiskThreatMappingDao) {
		this.derivativeRiskThreatMappingDao = derivativeRiskThreatMappingDao;
	}
}

