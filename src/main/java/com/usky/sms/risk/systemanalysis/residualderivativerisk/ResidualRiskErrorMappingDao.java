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
import com.usky.sms.tem.error.ErrorDO;
import com.usky.sms.tem.error.ErrorDao;
import com.usky.sms.tem.threat.ThreatDao;

public class ResidualRiskErrorMappingDao extends BaseDao<ResidualRiskErrorMappingDO> {
	
	@Autowired
	private ErrorDao errorDao;
	
	@Autowired
	private ThreatDao threatDao;
	
	@Autowired
	private DerivativeRiskErrorMappingDao derivativeRiskErrorMappingDao;

	protected ResidualRiskErrorMappingDao() {
		super(ResidualRiskErrorMappingDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		ResidualRiskErrorMappingDO residualRiskErrorMapping = (ResidualRiskErrorMappingDO) obj;
		if ("error".equals(field.getName())) {
			Map<String, Object> errorMap = null;
			ErrorDO error = residualRiskErrorMapping.getError();
			if (error != null) {
				errorMap = new HashMap<String, Object>();
				errorMap.put("id", error.getId());
				errorMap.put("name", error.getName());
				errorMap.put("num", error.getNum());
			}
			map.put(field.getName(), errorMap);
		} else if ("riskLevelP".equals(field.getName())) {
			String risklevelColour = threatDao.vfyRisklevelColour(
					residualRiskErrorMapping.getRiskLevelP(), residualRiskErrorMapping.getRiskLevelS());
			map.put("colour", risklevelColour);
			map.put(field.getName(), residualRiskErrorMapping.getRiskLevelP());
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		ResidualRiskErrorMappingDO residualRiskErrorMapping = (ResidualRiskErrorMappingDO) obj;
		if (multiple && showExtendFields) {
			// 对应的衍生风险的差错
			List<DerivativeRiskErrorMappingDO> derivativeRiskErrorMappings = derivativeRiskErrorMappingDao.getByResidualRiskErrorMappingId(residualRiskErrorMapping.getId());
			List<Map<String, Object>> derivativeRiskErrorMappingMaps = derivativeRiskErrorMappingDao.convert(derivativeRiskErrorMappings);
			for (Map<String, Object> derivativeRiskErrorMappingMap : derivativeRiskErrorMappingMaps) {
				derivativeRiskErrorMappingMap.put("systemAnalysisRiskErrorMappingId", residualRiskErrorMapping.getSystemAnalysisRiskErrorMappingId());
			}
			map.put("derivativeRiskErrorMappings", derivativeRiskErrorMappingMaps);
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("residualDerivativeRisk.id".equals(key) || "systemAnalysisRiskErrorMappingId".equals(key) || "error.id".equals(key)) {
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
			ResidualRiskErrorMappingDO residualRiskErrorMapping = this.internalGetById(id);
			ErrorDO error = residualRiskErrorMapping.getError();
			if (error != null) {
				if (map.containsKey("riskLevelP")) {
					error.setRiskLevelP(map.get("riskLevelP") == null ? null : ((Number) map.get("riskLevelP")).intValue());
				}
				if (map.containsKey("riskLevelS")) {
					error.setRiskLevelS(map.get("riskLevelS") == null ? null : ((Number) map.get("riskLevelS")).intValue());
				}
				errorDao.internalUpdate(error);
			}
		}
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	@Override
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	/**
	 * 根据系统分析风险分析块明细行（差错） ID的数组获取对应的剩余风险块明细行（差错）
	 * @param systemAnalysisRiskErrorMappingIds 系统分析风险分析块明细行（差错） ID的数组
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ResidualRiskErrorMappingDO> getBySystemAnalysisRiskErrorMappingIds(String[] systemAnalysisRiskErrorMappingIds) {
		if (systemAnalysisRiskErrorMappingIds == null || systemAnalysisRiskErrorMappingIds.length < 1) {
			return Collections.emptyList();
		}
		StringBuilder hql = new StringBuilder("from ResidualRiskErrorMappingDO where systemAnalysisRiskErrorMappingId in (");
		hql.append(StringUtils.join(systemAnalysisRiskErrorMappingIds));
		hql.append(")");
		return (List<ResidualRiskErrorMappingDO>) this.query(hql.toString());
	}
	
	/**
	 * 根据剩余衍生风险分析块的ID获取对应的剩余风险块明细行（差错）<br>
	 * 参数为null时返回空集合
	 * @param residualDerivativeRiskId 剩余衍生风险分析块的ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ResidualRiskErrorMappingDO> getByResidualDerivativeRiskId(Integer residualDerivativeRiskId) {
		if (residualDerivativeRiskId == null) {
			return Collections.emptyList();
		}
		return (List<ResidualRiskErrorMappingDO>) this.query("from ResidualRiskErrorMappingDO t where t.deleted = false and t.residualDerivativeRisk.id = ?", residualDerivativeRiskId);
	}

	public void setErrorDao(ErrorDao errorDao) {
		this.errorDao = errorDao;
	}

	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}

	public void setDerivativeRiskErrorMappingDao(
			DerivativeRiskErrorMappingDao derivativeRiskErrorMappingDao) {
		this.derivativeRiskErrorMappingDao = derivativeRiskErrorMappingDao;
	}
	
}

