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
import com.usky.sms.tem.threat.ThreatDO;
import com.usky.sms.tem.threat.ThreatDao;

public class DerivativeRiskThreatMappingDao extends BaseDao<DerivativeRiskThreatMappingDO> {

	@Autowired
	private ThreatDao threatDao;
	
	protected DerivativeRiskThreatMappingDao() {
		super(DerivativeRiskThreatMappingDO.class);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("residualDerivativeRisk.id".equals(key) || "residualRiskThreatMappingId".equals(key) || "threat.id".equals(key)) {
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
		DerivativeRiskThreatMappingDO derivativeRiskThreatMapping = (DerivativeRiskThreatMappingDO) obj;
		if ("threat".equals(field.getName())) {
			Map<String, Object> threatMap = null;
			ThreatDO threat = derivativeRiskThreatMapping.getThreat();
			if (threat != null) {
				threatMap = new HashMap<String, Object>();
				threatMap.put("id", threat.getId());
				threatMap.put("name", threat.getName());
				threatMap.put("num", threat.getNum());
			}
			map.put(field.getName(), threatMap);
		} else if ("riskLevelP".equals(field.getName())) {
			String risklevelColour = threatDao.vfyRisklevelColour(
					derivativeRiskThreatMapping.getRiskLevelP(), derivativeRiskThreatMapping.getRiskLevelS());
			map.put("colour", risklevelColour);
			map.put(field.getName(), derivativeRiskThreatMapping.getRiskLevelP());
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
		if (map.get("threat") != null) {
			Integer threatId = ((Number) map.get("threat")).intValue();
			ThreatDO threat = threatDao.internalGetById(threatId);
			map.put("riskLevelP", threat.getRiskLevelP());
			map.put("riskLevelS", threat.getRiskLevelS());
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
	 * 根据剩余风险的威胁的ID查询对应的衍生风险的威胁
	 * @param residualRiskThreatMappingId 剩余风险的威胁的ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<DerivativeRiskThreatMappingDO> getByResidualRiskThreatMappingId(Integer residualRiskThreatMappingId) {
		if (residualRiskThreatMappingId == null) {
			return Collections.emptyList();
		}
		return (List<DerivativeRiskThreatMappingDO>) this.query("from DerivativeRiskThreatMappingDO t where t.deleted = false and t.residualRiskThreatMappingId = ?", residualRiskThreatMappingId);
	}

	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}
}

