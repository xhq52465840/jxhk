
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

public class RiskErrorMappingDao extends BaseDao<RiskErrorMappingDO> {
	
	public static final SMSException EXIST_SAME_ERROR = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "待添加的差错中有已存在的差错！");
	
	@Autowired
	private ReportDao reportDao;
	
	@Autowired
	private ClauseDao clauseDao;
	
	public RiskErrorMappingDao() {
		super(RiskErrorMappingDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		int analysisId = ((Number) map.get("analysis")).intValue();
		int errorId = ((Number) map.get("error")).intValue();
		List<RiskErrorMappingDO> list = this.getRiskErrorMappingByAnalysisAndError(analysisId, errorId);
		if (!list.isEmpty()) throw EXIST_SAME_ERROR;
		return true;
	}
	
	@Override
	protected void afterSave(RiskErrorMappingDO mapping) {
		Map<String, Object> map = reportDao.getThreatOrErrorValueAndWarning(mapping.getError().getId(), "error");
		int value = ((Number) map.get("value")).intValue();
		String mark = (String) map.get("mark");
		mapping.setScore(value);
		mapping.setMark(mark);
		this.internalUpdate(mapping);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		RiskErrorMappingDO mapping = (RiskErrorMappingDO) obj;
		if ("error".equals(fieldName)) {
			Map<String, Object> errorMap = new HashMap<String, Object>();
			errorMap.put("id", mapping.getError().getId());
			errorMap.put("name", mapping.getError().getName());
			map.put("error", errorMap);
			return;
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	private List<RiskErrorMappingDO> getRiskErrorMappingByAnalysisAndError(int analysisId, int errorId) {
		@SuppressWarnings("unchecked")
		List<RiskErrorMappingDO> list = this.getHibernateTemplate().find("from RiskErrorMappingDO m where m.analysis.id = ? and m.error.id = ?", analysisId, errorId);
		return list;
	}
	
	@Override
	protected void beforeDelete(Collection<RiskErrorMappingDO> collection) {
		for (RiskErrorMappingDO riskErrorMapping : collection) {
			List<ClauseDO> list = clauseDao.getClauses(riskErrorMapping.getId(), null);
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
