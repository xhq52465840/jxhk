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

import com.usky.sms.common.NumberHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.tem.error.ErrorDO;
import com.usky.sms.tem.error.ErrorDao;
import com.usky.sms.tem.threat.ThreatDao;

public class DerivativeRiskErrorMappingDao extends BaseDao<DerivativeRiskErrorMappingDO> {
	
	@Autowired
	private ThreatDao threatDao;

	@Autowired
	private ErrorDao errorDao;

	protected DerivativeRiskErrorMappingDao() {
		super(DerivativeRiskErrorMappingDO.class);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("residualDerivativeRisk.id".equals(key) || "residualRiskErrorMappingId".equals(key) || "error.id".equals(key)) {
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
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		DerivativeRiskErrorMappingDO derivativeRiskErrorMapping = (DerivativeRiskErrorMappingDO) obj;
		if ("error".equals(field.getName())) {
			Map<String, Object> errorMap = null;
			ErrorDO error = derivativeRiskErrorMapping.getError();
			if (error != null) {
				errorMap = new HashMap<String, Object>();
				errorMap.put("id", error.getId());
				errorMap.put("name", error.getName());
				errorMap.put("num", error.getNum());
			}
			map.put(field.getName(), errorMap);
		} else if ("riskLevelP".equals(field.getName())) {
			String risklevelColour = threatDao.vfyRisklevelColour(
					derivativeRiskErrorMapping.getRiskLevelP(), derivativeRiskErrorMapping.getRiskLevelS());
			map.put("colour", risklevelColour);
			map.put(field.getName(), derivativeRiskErrorMapping.getRiskLevelP());
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
		if (map.get("error") != null) {
			Integer errorId = ((Number) map.get("error")).intValue();
			ErrorDO error = errorDao.internalGetById(errorId);
			map.put("riskLevelP", error.getRiskLevelP());
			map.put("riskLevelS", error.getRiskLevelS());
		}
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
	}

	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	@Override
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	/**
	 * 根据剩余风险的差错的ID查询对应的衍生风险的差错
	 * @param residualRiskErrorMappingId 剩余风险的差错的ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<DerivativeRiskErrorMappingDO> getByResidualRiskErrorMappingId(Integer residualRiskErrorMappingId) {
		if (residualRiskErrorMappingId == null) {
			return Collections.emptyList();
		}
		return (List<DerivativeRiskErrorMappingDO>) this.query("from DerivativeRiskErrorMappingDO t where t.deleted = false and t.residualRiskErrorMappingId = ?", residualRiskErrorMappingId);
	}

	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}

	public void setErrorDao(ErrorDao errorDao) {
		this.errorDao = errorDao;
	}
}

