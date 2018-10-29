package com.usky.sms.risk.systemanalysis.residualderivativerisk;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.alibaba.dubbo.common.utils.StringUtils;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserContext;

public class ResidualDerivativeRiskDao extends BaseDao<ResidualDerivativeRiskDO> {
	
	@Autowired
	private ResidualRiskThreatMappingDao residualRiskThreatMappingDao;
	
	@Autowired
	private ResidualRiskErrorMappingDao residualRiskErrorMappingDao;

	protected ResidualDerivativeRiskDao() {
		super(ResidualDerivativeRiskDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ResidualDerivativeRiskDO residualDerivativeRisk = (ResidualDerivativeRiskDO) obj;
		if ("residualRiskThreatMappings".equals(fieldName)) {
			List<ResidualRiskThreatMappingDO> residualRiskThreatMappings = residualRiskThreatMappingDao.getByResidualDerivativeRiskId(residualDerivativeRisk.getId());
			map.put(fieldName, residualRiskThreatMappingDao.convert(residualRiskThreatMappings));
		} else if ("residualRiskErrorMappings".equals(fieldName)) {
			List<ResidualRiskErrorMappingDO> residualRiskErrorMappings = residualRiskErrorMappingDao.getByResidualDerivativeRiskId(residualDerivativeRisk.getId());
			map.put(fieldName, residualRiskErrorMappingDao.convert(residualRiskErrorMappings));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("creator.id".equals(key) || "lastUpdater.id".equals(key) || "systemAnalysisRiskAnalysisId".equals(key) || "system.id".equals(key)) {
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
	
	/**
	 * 根据系统分析风险分析ID获取对应的剩余衍生风险
	 * @param systemAnalysisRiskAnalysisId 系统分析风险分析ID
	 * @return
	 */
	public ResidualDerivativeRiskDO getBySystemAnalysisRiskAnalysisId(Integer systemAnalysisRiskAnalysisId) {
		if (systemAnalysisRiskAnalysisId == null) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<ResidualDerivativeRiskDO> list = (List<ResidualDerivativeRiskDO>) this.query("from ResidualDerivativeRiskDO t where t.deleted = false and t.systemAnalysisRiskAnalysisId = ?", systemAnalysisRiskAnalysisId);
		return list.isEmpty() ? null : list.get(0);
	}
	
	/**
	 * 根据系统分析风险分析ID的数组获取对应的剩余衍生风险
	 * @param systemAnalysisRiskAnalysisIds 系统分析风险分析ID的数组
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ResidualDerivativeRiskDO> getBySystemAnalysisRiskAnalysisIds(String[] systemAnalysisRiskAnalysisIds) {
		if (systemAnalysisRiskAnalysisIds == null || systemAnalysisRiskAnalysisIds.length < 1) {
			return Collections.emptyList();
		}
		StringBuilder hql = new StringBuilder("from ResidualDerivativeRiskDO where systemAnalysisRiskAnalysisId in (");
		hql.append(StringUtils.join(systemAnalysisRiskAnalysisIds));
		hql.append(")");
		return (List<ResidualDerivativeRiskDO>) this.query(hql.toString());
	}
	
	@SuppressWarnings("unchecked")
	public List<ResidualDerivativeRiskDO> getByActivityId(int activityId) {
		return (List<ResidualDerivativeRiskDO>) this.query("from ResidualDerivativeRiskDO t where t.deleted = false and t.systemAnalysisRiskAnalysisId in (select id from SystemAnalysisRiskAnalysisDO where deleted = false and activity.id = ?)", activityId);
	}

	public void setResidualRiskThreatMappingDao(ResidualRiskThreatMappingDao residualRiskThreatMappingDao) {
		this.residualRiskThreatMappingDao = residualRiskThreatMappingDao;
	}

	public void setResidualRiskErrorMappingDao(ResidualRiskErrorMappingDao residualRiskErrorMappingDao) {
		this.residualRiskErrorMappingDao = residualRiskErrorMappingDao;
	}
}

