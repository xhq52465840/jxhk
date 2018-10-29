
package com.usky.sms.risk;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.report.ReportDao;

public class RiskThreatMappingDao extends BaseDao<RiskThreatMappingDO> {
	
	public static final SMSException EXIST_SAME_THREAT = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "待添加的威胁中有已存在的威胁！");
	
	@Autowired
	private ReportDao reportDao;
	
	@Autowired
	private ClauseDao clauseDao;
	
	public RiskThreatMappingDao() {
		super(RiskThreatMappingDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		int analysisId = ((Number) map.get("analysis")).intValue();
		int threatId = ((Number) map.get("threat")).intValue();
		List<RiskThreatMappingDO> list = this.getRiskThreatMappingByAnalysisAndError(analysisId, threatId);
		if (!list.isEmpty()) throw EXIST_SAME_THREAT;
		return true;
	}
	
	@Override
	protected void afterSave(RiskThreatMappingDO mapping) {
		Map<String, Object> map = reportDao.getThreatOrErrorValueAndWarning(mapping.getThreat().getId(), "threat");
		int value = ((Number) map.get("value")).intValue();
		String mark = (String) map.get("mark");
		mapping.setScore(value);
		mapping.setMark(mark);
		this.internalUpdate(mapping);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		RiskThreatMappingDO mapping = (RiskThreatMappingDO) obj;
		if ("threat".equals(fieldName)) {
			Map<String, Object> threatMap = new HashMap<String, Object>();
			threatMap.put("id", mapping.getThreat().getId());
			threatMap.put("name", mapping.getThreat().getName());
			map.put("threat", threatMap);
			return;
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	private List<RiskThreatMappingDO> getRiskThreatMappingByAnalysisAndError(int analysisId, int threatId) {
		@SuppressWarnings("unchecked")
		List<RiskThreatMappingDO> list = this.getHibernateTemplate().find("from RiskThreatMappingDO m where m.analysis.id = ? and m.threat.id = ?", analysisId, threatId);
		return list;
	}
	
	@Override
	protected void beforeDelete(Collection<RiskThreatMappingDO> collection) {
		for (RiskThreatMappingDO riskThreatMapping : collection) {
			List<ClauseDO> list = clauseDao.getClauses(null, riskThreatMapping.getId());
			if (list != null && list.size() > 0) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "操作失败：已存在手册条款");
		}
	}
	
	public void setReportDao(ReportDao reportDao) {
		this.reportDao = reportDao;
	}
	
	public void setClauseDao(ClauseDao clauseDao) {
		this.clauseDao = clauseDao;
	}
	
}
