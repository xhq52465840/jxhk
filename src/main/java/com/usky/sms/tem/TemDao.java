
package com.usky.sms.tem;

import java.lang.reflect.Field;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateUtils;
import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.IDComparator;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.permission.IPermission;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.report.ReportDao;
import com.usky.sms.solr.SolrService;
import com.usky.sms.tem.consequence.ConsequenceDO;
import com.usky.sms.tem.consequence.ConsequenceDao;
import com.usky.sms.tem.error.ErrorDO;
import com.usky.sms.tem.error.ErrorDao;
import com.usky.sms.tem.insecurity.InsecurityDO;
import com.usky.sms.tem.insecurity.InsecurityDao;
import com.usky.sms.tem.severity.ProvisionDO;
import com.usky.sms.tem.severity.ProvisionDao;
import com.usky.sms.tem.severity.SeverityDO;
import com.usky.sms.tem.severity.SeverityDao;
import com.usky.sms.tem.threat.ThreatDO;
import com.usky.sms.tem.threat.ThreatDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserContext;

public class TemDao extends BaseDao<TemDO> implements IPermission{
	
	@Autowired
	private ConsequenceDao consequenceDao;
	
	@Autowired
	private ErrorDao errorDao;
	
	@Autowired
	private ErrorMappingDao errorMappingDao;
	
	@Autowired
	private InsecurityDao insecurityDao;
	
	@Autowired
	private ProvisionDao provisionDao;
	
	@Autowired
	private SeverityDao severityDao;
	
	@Autowired
	private ThreatDao threatDao;
	
	@Autowired
	private ThreatMappingDao threatMappingDao;
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private ControlMeasureDao controlMeasureDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private ReportDao reportDao;
	
	@Autowired
	private SolrService solrService;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	private static final Integer wp = 10000;
	
	public TemDao() {
		super(TemDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator", UserContext.getUserId());
		return true;
	}
	
	@Override
	protected void afterSave(TemDO obj) {
		// 向solr中更新temSystem
		updateTemInfoToSolr(obj);
		// 活动日志
		List<String> details = new ArrayList<String>();
		DictionaryDO dict = dictionaryDao.internalGetById(obj.getSysType().getId());
		details.add("添加了[" + dict.getName() + "]TEM分析块");
		MDC.put("details", details.toArray());
		activityLoggingDao.addLogging(obj.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("ADD_TEM"));
		MDC.remove("details");
	}
	
	@Override
	protected void beforeDelete(Collection<TemDO> collection) {
		List<TemDO> currList = new ArrayList<TemDO>();
		for (TemDO temDO : collection) {
			List<String> details = new ArrayList<String>();
			DictionaryDO dict = dictionaryDao.internalGetById(temDO.getSysType().getId());
			details.add("删除了[" + dict.getName() + "]TEM分析块");
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(temDO.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_TEM"));
			MDC.remove("details");
			Set<ErrorMappingDO> errorMappings = temDO.getErrors();
			Set<ThreatMappingDO> threatMappings = temDO.getThreats();
			this.checkErrorOrThreatHaveMeasures(errorMappings, threatMappings);
			currList.add(temDO);
		}
		for (TemDO temDO : currList) {
			Set<ErrorMappingDO> errorMappings = temDO.getErrors();
			temDO.setErrors(null);
			temDO.setPrimaryError(null);
			for (ErrorMappingDO errorMapping : errorMappings) {
				errorMapping.setTem(null);
			}
			errorMappingDao.internalMarkAsDeleted(errorMappings);
			
			Set<ThreatMappingDO> threatMappings = temDO.getThreats();
			temDO.setThreats(null);
			temDO.setPrimaryThreat(null);
			for (ThreatMappingDO threatMapping : threatMappings) {
				threatMapping.setTem(null);
			}
			threatMappingDao.internalMarkAsDeleted(threatMappings);
			
			temDO.setActivity(null);
			this.internalUpdate(temDO);
		}
	}
	
	@Override
	protected void afterUpdate(TemDO tem, TemDO dbTem) {
		// 向solr中更新temSystem，威胁，差错，严重程度，不安全状态，重大风险
		updateTemInfoToSolr(tem);
		
		// 添加更新TEM分析的活动日志
		addActivityLoggingForUpdateTem(tem, dbTem);
		tem = this.internalGetById(tem.getId());
		InsecurityDO insecurity = tem.getInsecurity();
		InsecurityDO dbInsecurity = dbTem.getInsecurity();
		if (dbInsecurity != null && (insecurity == null || !insecurity.getId().equals(dbInsecurity.getId()))) {
			Set<ErrorMappingDO> errorMappings = tem.getErrors();
			Set<ThreatMappingDO> threatMappings = tem.getThreats();
			this.checkErrorOrThreatHaveMeasures(errorMappings, threatMappings);
			
			tem.setErrors(null);
			tem.setPrimaryError(null);
			for (ErrorMappingDO errorMapping : errorMappings) {
				errorMapping.setTem(null);
			}
			errorMappingDao.internalMarkAsDeleted(errorMappings);
			
			tem.setThreats(null);
			tem.setPrimaryThreat(null);
			for (ThreatMappingDO threatMapping : threatMappings) {
				threatMapping.setTem(null);
			}
			threatMappingDao.internalMarkAsDeleted(threatMappings);
			this.internalUpdate(tem);
		}
		
	}
	
	/*
	 * 校验当前TEM下的威胁或差错有无控制措施，若有则不允许删除
	 */
	public void checkErrorOrThreatHaveMeasures(Set<ErrorMappingDO> errorMappings, Set<ThreatMappingDO> threatMappings) {
		if (null != errorMappings) {
			for (ErrorMappingDO errorMappingDO : errorMappings) {
				List<ControlMeasureDO> controlMeasures = controlMeasureDao.getControlMeasures(errorMappingDO.getId(), null);
				if (controlMeasures != null && controlMeasures.size() > 0) {
					SMSException e = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "操作失败:当前TEM下的差错存在控制措施");
					throw e;
				}
			}
		}
		if (null != threatMappings) {
			for (ThreatMappingDO threatMappingDO : threatMappings) {
				List<ControlMeasureDO> controlMeasures = controlMeasureDao.getControlMeasures(null, threatMappingDO.getId());
				if (controlMeasures != null && controlMeasures.size() > 0) {
					SMSException e = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "操作失败:当前TEM下的威胁存在控制措施");
					throw e;
				}
			}
		}
	}
	
	/*
	 * 校验当前TEM下的威胁或差错有无控制措施，若有则不允许删除
	 */
	public void checkErrorOrThreatHaveMeasures(ErrorMappingDO errorMapping, ThreatMappingDO threatMapping) {
		if (null != errorMapping) {
			List<ControlMeasureDO> controlMeasures = controlMeasureDao.getControlMeasures(errorMapping.getId(), null);
			if (controlMeasures != null && controlMeasures.size() > 0) {
				SMSException e = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "操作失败:当前TEM下的差错存在控制措施");
				throw e;
			}
		}
		if (null != threatMapping) {
			List<ControlMeasureDO> controlMeasures = controlMeasureDao.getControlMeasures(null, threatMapping.getId());
			if (controlMeasures != null && controlMeasures.size() > 0) {
				SMSException e = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "操作失败:当前TEM下的威胁存在控制措施");
				throw e;
			}
		}
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		TemDO tem = (TemDO) obj;
		if ("severity".equals(fieldName)) {
			map.put(fieldName, severityDao.convert(tem.getSeverity()));
		} else if ("provision".equals(fieldName)) {
			map.put(fieldName, provisionDao.convert(tem.getProvision()));
		} else if ("insecurity".equals(fieldName)) {
			map.put(fieldName, insecurityDao.convert(tem.getInsecurity()));
		} else if ("consequence".equals(fieldName)) {
			map.put(fieldName, consequenceDao.convert(tem.getConsequence()));
		} else if ("threats".equals(fieldName)) {
			List<ThreatMappingDO> threats = new ArrayList<ThreatMappingDO>(tem.getThreats());
			Collections.sort(threats, IDComparator.getInstance());
			map.put(fieldName, threatMappingDao.convert(threats, Arrays.asList(new String[] { "id", "threat", "controlMeasures" })));
		} else if ("primaryThreat".equals(fieldName)) {
			ThreatMappingDO primaryThreat = tem.getPrimaryThreat();
			map.put(fieldName, primaryThreat == null ? null : primaryThreat.getId());
		} else if ("errors".equals(fieldName)) {
			List<ErrorMappingDO> errors = new ArrayList<ErrorMappingDO>(tem.getErrors());
			Collections.sort(errors, IDComparator.getInstance());
			map.put(fieldName, errorMappingDao.convert(errors, Arrays.asList(new String[] { "id", "error", "controlMeasures" })));
		} else if ("primaryError".equals(fieldName)) {
			ErrorMappingDO primaryError = tem.getPrimaryError();
			map.put(fieldName, primaryError == null ? null : primaryError.getId());
		} else if ("sysType".equals(fieldName)) {
			DictionaryDO sysType = tem.getSysType();
			map.put("sysTypeId", sysType == null ? null : sysType.getId());
			map.put("sysType", sysType == null ? null : sysType.getName());
			map.put("sysTypeDeleted", sysType == null ? null : sysType.isDeleted());
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
		
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void addError(int temId, int[] errors) {
		TemDO tem = this.internalGetById(temId);
		if (errors.length > 4 || (tem.getErrors() != null && tem.getErrors().size() + errors.length > 4)) {
			SMSException e = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "不能添加超过4个差错！");
			throw e;
		}
		for (int i = 0; i < errors.length; i++) {
			int errorId = errors[i];
			ErrorMappingDO mapping = errorMappingDao.getErrorMapping(temId, errorId);
			if (mapping != null) {
				SMSException e = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "[" + mapping.getError().getName() + "]已存在");
				throw e;
			}
			ErrorDO error = errorDao.internalGetById(errorId);
			mapping = new ErrorMappingDO();
			mapping.setTem(tem);
			mapping.setError(error);
			errorMappingDao.internalSave(mapping);
			
			// 添加活动日志
			addActivityLoggingForAddError(tem, error);
			
			if (tem.getPrimaryError() != null) continue;
			tem.setPrimaryError(mapping);
			this.internalUpdate(tem);
		}
		
		// 更新tem信息到solr
		updateTemInfoToSolr(tem);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void addThreat(int temId, int[] threats) {
		TemDO tem = this.internalGetById(temId);
		if (threats.length > 4 || (tem.getThreats() != null && tem.getThreats().size() + threats.length > 4)) {
			SMSException e = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "不能添加超过4个威胁！");
			throw e;
		}
		for (int i = 0; i < threats.length; i++) {
			int threatId = threats[i];
			ThreatMappingDO mapping = threatMappingDao.getThreatMapping(temId, threatId);
			if (mapping != null) {
				SMSException e = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "[" + mapping.getThreat().getName() + "]已存在");
				throw e;
			}
			ThreatDO threat = threatDao.internalGetById(threatId);
			mapping = new ThreatMappingDO();
			mapping.setTem(tem);
			mapping.setThreat(threat);
			threatMappingDao.internalSave(mapping);
			
			// 添加活动日志
			addActivityLoggingForAddThreat(tem, threat);
			
			if (tem.getPrimaryThreat() != null) continue;
			tem.setPrimaryThreat(mapping);
			this.internalUpdate(tem);
		}
		
		// 更新tem信息到solr
		updateTemInfoToSolr(this.internalGetById(temId));
	}
	
	public List<TemDO> getByActivityId(int activityId) {
		@SuppressWarnings("unchecked")
		List<TemDO> list = this.getHibernateTemplate().find("from TemDO where activity.id = ? order by created", activityId);
		if (list.size() == 0) return null;
		return list;
	}
	
	public List<TemDO> getByActivityIds(List<Integer> activityIds) {
		if (null == activityIds || activityIds.isEmpty()) {
			return new ArrayList<TemDO>();
		}
		@SuppressWarnings("unchecked")
		List<TemDO> list = (List<TemDO>) this.getHibernateTemplate().findByNamedParam("from TemDO t where t.deleted = false and t.activity.id in :ids order by created", "ids", activityIds);
		return list;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void removeError(int errorId) {
		// 待删除的差错
		ErrorMappingDO mapping = errorMappingDao.internalGetById(errorId);
		this.checkErrorOrThreatHaveMeasures(mapping, null);
		TemDO tem = mapping.getTem();
		// 删除差错
		mapping.setTem(null);
		errorMappingDao.internalMarkAsDeleted(mapping);
		
		ErrorMappingDO primaryError = tem.getPrimaryError();
		// 如果删除的差错是主差错则将下一差错设置成主差错
		ErrorMappingDO newPrimaryError = null;
		if (primaryError.getId() == errorId) {
			if (tem.getErrors() != null) {
				// 如果是主差错,将其删除并将下一个威差错设置成主差错
				for (ErrorMappingDO error : tem.getErrors()) {
					if (error.getId() != errorId && !error.isDeleted()) {
						newPrimaryError = error;
						break;
					}
				}
			}
			tem.setPrimaryError(newPrimaryError);
		}
		this.internalUpdate(tem);
		
		// 添加活动日志
		addActivityLoggingForRemoveError(tem.getActivity().getId(), mapping, newPrimaryError);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void removeThreat(int threatId) {
		// 待删除的威胁
		ThreatMappingDO mapping = threatMappingDao.internalGetById(threatId);
		this.checkErrorOrThreatHaveMeasures(null, mapping);
		TemDO tem = mapping.getTem();
		// 删除威胁
		mapping.setTem(null);
		threatMappingDao.internalMarkAsDeleted(mapping);
		
		ThreatMappingDO primaryThreat = tem.getPrimaryThreat();
		// 如果删除的威胁是主威胁则将下一威胁设置成主威胁
		ThreatMappingDO newPrimaryThreat = null;
		if (primaryThreat.getId() == threatId) {
			if (tem.getThreats() != null) {
				// 如果是主威胁,将其删除并将下一个威胁设置成主威胁
				for (ThreatMappingDO threat : tem.getThreats()) {
					if (threat.getId() != threatId && !threat.isDeleted()) {
						newPrimaryThreat = threat;
						break;
					}
				}
			}
			tem.setPrimaryThreat(newPrimaryThreat);
		}
		this.internalUpdate(tem);
		
		// 添加活动日志
		addActivityLoggingForRemoveThreat(tem.getActivity().getId(), mapping, newPrimaryThreat);
	}
	
	/**
	 * 添加更新TEM分析的活动日志
	 * 
	 * @param tem
	 * @param dbTem
	 */
	private void addActivityLoggingForUpdateTem(TemDO tem, TemDO dbTem) {
		List<String> details = new ArrayList<String>();
		// 严重程度
		SeverityDO severity = tem.getSeverity();
		SeverityDO dbSeverity = dbTem.getSeverity();
		if (null != severity && null == dbSeverity) {
			severity = severityDao.internalGetById(severity.getId());
			details.add("添加严重程度:" + (severity == null ? "" : severity.getName()));
		} else if (!(null == severity || null == dbSeverity || severity.getId().equals(dbSeverity.getId()))) {
			severity = severityDao.internalGetById(severity.getId());
			details.add("修改严重程度为:" + (severity == null ? "" : severity.getName()));
		}
		// 对应条款
		ProvisionDO provision = tem.getProvision();
		ProvisionDO dbProvision = dbTem.getProvision();
		if (null != provision && null == dbProvision) {
			provision = provisionDao.internalGetById(provision.getId());
			details.add("添加对应条款:" + (provision == null ? "" : provision.getName()));
		} else if (!(null == provision || null == dbProvision || provision.getId().equals(dbProvision.getId()))) {
			provision = provisionDao.internalGetById(provision.getId());
			details.add("修改对应条款为:" + (provision == null ? "" : provision.getName()));
		}
		// 不安全状态
		InsecurityDO insecurity = tem.getInsecurity();
		InsecurityDO dbInsecurity = dbTem.getInsecurity();
		if (null != insecurity && null == dbInsecurity) {
			insecurity = insecurityDao.internalGetById(insecurity.getId());
			details.add("添加不安全状态:" + (insecurity == null ? "" : insecurity.getName()));
		} else if (!(null == insecurity || null == dbInsecurity || insecurity.getId().equals(dbInsecurity.getId()))) {
			insecurity = insecurityDao.internalGetById(insecurity.getId());
			details.add("修改不安全状态为:" + (insecurity == null ? "" : insecurity.getName()));
		}
		// 重大风险
		ConsequenceDO consequence = tem.getConsequence();
		ConsequenceDO dbConsequence = dbTem.getConsequence();
		if (null != consequence && null == dbConsequence) {
			consequence = consequenceDao.internalGetById(consequence.getId());
			details.add("添加重大风险:" + (consequence == null ? "" : consequence.getName()));
		} else if (!(null == consequence || null == dbConsequence || consequence.getId().equals(dbConsequence.getId()))) {
			consequence = consequenceDao.internalGetById(consequence.getId());
			details.add("修改重大风险为:" + (consequence == null ? "" : consequence.getName()));
		}
		// 主要威胁
		ThreatMappingDO primaryThreat = tem.getPrimaryThreat();
		ThreatMappingDO dbPrimaryThreat = dbTem.getPrimaryThreat();
		if (!(null == primaryThreat || null == dbPrimaryThreat || primaryThreat.getId().equals(dbPrimaryThreat.getId()))) {
			primaryThreat = threatMappingDao.internalGetById(primaryThreat.getId());
			if (null != primaryThreat && null != primaryThreat.getThreat()) {
				details.add("将威胁:[名称:" + primaryThreat.getThreat().getName() + "]设置为主要威胁");
			}
		}
		// 主要差错
		ErrorMappingDO primaryError = tem.getPrimaryError();
		ErrorMappingDO dbPrimaryError = dbTem.getPrimaryError();
		if (!(null == primaryError || null == dbPrimaryError || primaryError.getId().equals(dbPrimaryError.getId()))) {
			primaryError = errorMappingDao.internalGetById(primaryError.getId());
			if (null != primaryError && null != primaryError.getError()) {
				details.add("将差错:[名称:" + primaryError.getError().getName() + "]设置为主要差错");
			}
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(tem.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_TEM"));
			MDC.remove("details");
		}
	}
	
	/**
	 * 添加差错的活动日志
	 */
	private void addActivityLoggingForAddError(TemDO tem, ErrorDO error) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		if (null != error) {
			details.add("添加差错为:[名称:" + error.getName() + "]");
		}
		if (null == tem.getPrimaryError()) {
			details.add("将差错:[名称:" + error.getName() + "]设置为主要差错");
		}
		MDC.put("details", details.toArray());
		activityLoggingDao.addLogging(tem.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_TEM"));
		MDC.remove("details");
	}
	
	/**
	 * 添加威胁的活动日志
	 */
	private void addActivityLoggingForAddThreat(TemDO tem, ThreatDO threat) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		if (null != threat) {
			details.add("添加威胁为:[名称:" + threat.getName() + "]");
		}
		if (null == tem.getPrimaryThreat()) {
			details.add("将威胁:[名称:" + threat.getName() + "]设置为主要威胁");
		}
		MDC.put("details", details.toArray());
		activityLoggingDao.addLogging(tem.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_TEM"));
		MDC.remove("details");
	}
	
	/**
	 * 删除差错的活动日志
	 */
	private void addActivityLoggingForRemoveError(Integer activityId, ErrorMappingDO mapping, ErrorMappingDO newPrimaryError) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		if (null != mapping && null != mapping.getError()) {
			ErrorDO error = mapping.getError();
			details.add("删除了差错:[名称:" + error.getName() + "]");
			
			if (null != newPrimaryError) {
				details.add("将差错:[名称:" + newPrimaryError.getError().getName() + "]设置为主要差错");
			}
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(activityId, ActivityLoggingOperationRegister.getOperation("UPDATE_TEM"));
			MDC.remove("details");
		}
	}
	
	/**
	 * 删除威胁的活动日志
	 */
	private void addActivityLoggingForRemoveThreat(Integer activityId, ThreatMappingDO mapping, ThreatMappingDO newPrimaryThreat) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		if (null != mapping && null != mapping.getThreat()) {
			ThreatDO threat = mapping.getThreat();
			details.add("删除了威胁:[名称:" + threat.getName() + "]");
			
			if (null != newPrimaryThreat) {
				details.add("将威胁:[名称:" + newPrimaryThreat.getThreat().getName() + "]设置为主要威胁");
			}
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(activityId, ActivityLoggingOperationRegister.getOperation("UPDATE_TEM"));
			MDC.remove("details");
		}
	}
	
	/*
	 * 根据安监机构、开始日期和截止日期查询重大风险所对应的严重条款的分数
	 */
	/*
	 * @SuppressWarnings("unchecked") public List<Map<String,Object>>
	 * calculateByTerm(Integer unit, Integer sysType,Date beginday,Date endday)
	 * throws ParseException { List<ConsequenceDO> consequenceList =
	 * consequenceDao.achieveListBySysType(sysType,null); StringBuffer sql = new
	 * StringBuffer(
	 * "select t.consequence.name, sum(p.score) from TemDO t left join t.provision p ,AccessInformationDO a where "
	 * + " t.deleted = false and t.activity.id = a.activity.id "); List<Object>
	 * param2 = new ArrayList<Object>(); sql.append(" and a.occurredDate >= ?");
	 * param2.add(beginday); sql.append("  and a.occurredDate <= ?");
	 * param2.add(endday); if(unit != null){
	 * sql.append(" and t.activity.unit.id = ?"); param2.add(unit); } if(sysType
	 * != null){ sql.append(" and t.sysType.id = ?"); param2.add(sysType); }
	 * sql.append(" group by t.consequence.name"); List<Object[]> temlist =
	 * this.getHibernateTemplate().find(sql.toString(),param2.toArray());
	 * Map<String, Object> valuemap = new HashMap<String, Object>(); for
	 * (Object[] tem : temlist) { valuemap.put(tem[0].toString(),
	 * tem[1].toString()); } Map<String,Object> avgmap = this.avgRadar(sysType,
	 * unit,beginday); //前12个月各个重大风险平均值的集合 List<Map<String,Object>> risklist =
	 * this.riskValue(unit, sysType, beginday);//按当前月份前12个月 每个月每个重大风险的风险值；
	 * List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
	 * Double flyTime = reportDao.getFlyTime(unit, sysType, beginday); for
	 * (ConsequenceDO consequence : consequenceList) {//风险值计算块，实际值除以飞行小时数
	 * Map<String,Object> map = new HashMap<String, Object>(); String name =
	 * consequence.getName(); Double value = valuemap.get(consequence.getName())
	 * == null ? 0.0 :
	 * Double.parseDouble(valuemap.get(consequence.getName()).toString()); //
	 * Double max = avgmap.get(consequence.getName()) == null ? 100.0 :
	 * Double.parseDouble(avgmap.get(consequence.getName()).toString()); Double
	 * max = reportDao.getWaringValue(consequence,avgmap,value,risklist);
	 * map.put("name", name); map.put("value",
	 * Double.parseDouble(df.format(value/flyTime))); map.put("max",
	 * Double.parseDouble(df.format(max))); list.add(map); } return list; }
	 */
	
	/*
	 * 返回距当前时间的前12个月，并且查询出每个月的安全信息的分数
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> calculateLine() throws ParseException {
		Date date = new Date();
		List<ConsequenceDO> consequenceList = consequenceDao.achievelist(null);
		Integer consequenceLength = 1;
		if (consequenceList.size() > 0) {
			consequenceLength = consequenceList.size();
		}
		Map<String, Double> flyTimeMap = reportDao.getFlyTimePerMonth(DateUtils.addMonths(date, -12), DateUtils.addMonths(date, -1));
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");
		Map<String, Object> conseMap = new LinkedHashMap<String, Object>();
		List<Integer> avglist = new ArrayList<Integer>();
		Date avgFDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -12));
		Date avgSdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
		String avgsql = "select a.occurredDate,sum(p.score) from TemDO t " + " left join t.provision p ,ConsequenceDO c,AccessInformationDO a" + " where  t.deleted = false" + " and t.activity.id = a.activity.id" + " and a.occurredDate >= ?" + " and a.occurredDate <= ?" + " and t.consequence.id = c.id" + " group by a.occurredDate";
		List<Object[]> temavglist = this.getHibernateTemplate().find(avgsql, avgFDate, avgSdate);
		for (int i = 1; i <= 12; i++) {
			Date FDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
			Date Sdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -i));
			Double flyTime = flyTimeMap.get(sdf.format(FDate)) == null ? 1.0 : flyTimeMap.get(sdf.format(FDate));
			Double value = 0.0;
			for (Object[] o : temavglist) {
				if (o[0] != null && o[1] != null) {
					if (((Timestamp) o[0]).compareTo(FDate) == 0) {
						value = value + ((Long) o[1]).doubleValue();
					}
					if (((Timestamp) o[0]).after(FDate) && ((Timestamp) o[0]).before(Sdate)) {
						value = value + ((Long) o[1]).doubleValue();
					}
				}
			}
			double median = value / consequenceLength * wp / flyTime;
			avglist.add(reportDao.getRiskValue(median));
		}
		Collections.reverse(avglist);
		conseMap.put(consequenceLength + "大风险平均值", avglist);
		List<Map<String, Object>> datalist = new ArrayList<Map<String, Object>>();
		datalist.add(conseMap);
		Date FDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -12));
		Date Sdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
		String sql = "select a.occurredDate,t.consequence.id,sum(p.score) from TemDO t " + " left join t.provision p ,AccessInformationDO a " + " where  t.deleted = false" + " and t.activity.id = a.activity.id" + " and a.occurredDate >= ?" + " and a.occurredDate <= ?" + " group by a.occurredDate,t.consequence.id";
		List<Object[]> temlist = this.getHibernateTemplate().find(sql, FDate, Sdate);
		for (ConsequenceDO consequence : consequenceList) {
			Map<String, Object> map = new HashMap<String, Object>();
			List<Integer> list = new ArrayList<Integer>();
			for (int i = 1; i <= 12; i++) {
				Date tempFDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
				Date tempSdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -i));
				Double flyTime = flyTimeMap.get(sdf.format(tempFDate)) == null ? 1.0 : flyTimeMap.get(sdf.format(tempFDate));//获取飞行小时数//获取飞行小时数
				Double value = 0.0;
				for (Object[] o : temlist) {
					if (o[0] != null && o[1] != null && o[2] != null) {
						if (((Timestamp) o[0]).compareTo(tempFDate) == 0 && consequence.getId().equals(((Integer) o[1]).intValue())) {
							value = value + ((Long) o[2]).doubleValue();
						}
						if (((Timestamp) o[0]).after(tempFDate) && ((Timestamp) o[0]).before(tempSdate) && consequence.getId().equals(((Integer) o[1]).intValue())) {
							value = value + ((Long) o[2]).doubleValue();
						}
					}
				}
				double median = value * wp / flyTime;
				list.add(reportDao.getRiskValue(median));
			}
			Collections.reverse(list);
			map.put("value", list);
			map.put("name", consequence.getName());
			map.put("id", consequence.getId());
			datalist.add(map);
		}
		return datalist;
	}
	
	/*
	 * 根据安监机构返回距当前时间的前12个月，并且查询出每个月的安全信息的分数
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> calculateLineByItem(Integer unit, Integer sysType) throws ParseException {
		Date date = new Date();
		List<ConsequenceDO> consequenceList = consequenceDao.achieveListBySysType(sysType, null);
		Integer consequenceLength = 1;
		if (consequenceList.size() > 0) {
			consequenceLength = consequenceList.size();
		}
		Map<String, Double> flyTimeMap = reportDao.getFlyTimePerMonth(DateUtils.addMonths(date, -12), DateUtils.addMonths(date, -1));
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");
		Map<String, Object> conseMap = new LinkedHashMap<String, Object>();
		List<Integer> avglist = new ArrayList<Integer>();
		Date avgFDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -12));
		Date avgSdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
		StringBuffer avgsql = new StringBuffer("select a.occurredDate,sum(p.score) from TemDO t left join t.provision p ,ConsequenceDO c,AccessInformationDO a where  t.deleted = false and t.activity.id = a.activity.id and t.consequence.id = c.id");
		List<Object> param1 = new ArrayList<Object>();
		avgsql.append(" and a.occurredDate >= ?");
		param1.add(avgFDate);
		avgsql.append(" and a.occurredDate <= ?");
		param1.add(avgSdate);
		if (unit != null) {
			avgsql.append(" and t.activity.unit.id = ?");
			param1.add(unit);
		}
		if (sysType != null) {
			avgsql.append(" and t.sysType.id = ?");
			param1.add(sysType);
		}
		avgsql.append(" group by a.occurredDate");
		List<Object[]> temavglist = this.getHibernateTemplate().find(avgsql.toString(), param1.toArray());
		for (int i = 1; i <= 12; i++) {
			Date FDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
			Date Sdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -i));
			Double flyTime = flyTimeMap.get(sdf.format(FDate)) == null ? 1.0 : flyTimeMap.get(sdf.format(FDate));
			Double value = 0.0;
			for (Object[] o : temavglist) {
				if (o[0] != null && o[1] != null) {
					if (((Timestamp) o[0]).compareTo(FDate) == 0) {
						value = value + ((Long) o[1]).doubleValue();
					}
					if (((Timestamp) o[0]).after(FDate) && ((Timestamp) o[0]).before(Sdate)) {
						value = value + ((Long) o[1]).doubleValue();
					}
				}
			}
			double median = value / consequenceLength * wp / flyTime;
			avglist.add(reportDao.getRiskValue(median));
		}
		Collections.reverse(avglist);
		conseMap.put(consequenceLength + "大风险平均值", avglist);
		List<Map<String, Object>> datalist = new ArrayList<Map<String, Object>>();
		datalist.add(conseMap);
		Date FDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -12));
		Date Sdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
		StringBuffer sql = new StringBuffer("select a.occurredDate,t.consequence.id,sum(p.score) from TemDO t left join t.provision p ,AccessInformationDO a where  t.deleted = false and t.activity.id = a.activity.id ");
		List<Object> param2 = new ArrayList<Object>();
		sql.append(" and a.occurredDate >= ?");
		param2.add(FDate);
		sql.append(" and a.occurredDate <= ?");
		param2.add(Sdate);
		if (unit != null) {
			sql.append(" and t.activity.unit.id = ?");
			param2.add(unit);
		}
		if (sysType != null) {
			sql.append(" and t.sysType.id = ?");
			param2.add(sysType);
		}
		sql.append(" group by a.occurredDate,t.consequence.id");
		List<Object[]> temlist = this.getHibernateTemplate().find(sql.toString(), param2.toArray());
		for (ConsequenceDO consequence : consequenceList) {
			Map<String, Object> map = new HashMap<String, Object>();
			List<Integer> list = new ArrayList<Integer>();
			for (int i = 1; i <= 12; i++) {
				Date tempFDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
				Date tempSdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -i));
				Double flyTime = flyTimeMap.get(sdf.format(tempFDate)) == null ? 1.0 : flyTimeMap.get(sdf.format(tempFDate));//获取飞行小时数//获取飞行小时数
				Double value = 0.0;
				for (Object[] o : temlist) {
					if (o[0] != null && o[1] != null && o[2] != null) {
						if (((Timestamp) o[0]).compareTo(tempFDate) == 0 && consequence.getId().equals(((Integer) o[1]).intValue())) {
							value = value + ((Long) o[2]).doubleValue();
						}
						if (((Timestamp) o[0]).after(tempFDate) && ((Timestamp) o[0]).before(tempSdate) && consequence.getId().equals(((Integer) o[1]).intValue())) {
							value = value + ((Long) o[2]).doubleValue();
						}
					}
				}
				double median = value * wp / flyTime;
				list.add(reportDao.getRiskValue(median));
			}
			Collections.reverse(list);
			map.put("value", list);
			map.put("name", consequence.getName());
			map.put("id", consequence.getId());
			datalist.add(map);
		}
		return datalist;
	}
	
	/*
	 * 根据安监机构和重大风险返回不安全状态的分数
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public Map<String, Object> calculateInsecurity(String unit, String consequence, String sysType) throws ParseException {
		Map<String, Object> map = new LinkedHashMap<String, Object>();
		if (!("".equals(consequence)) && consequence != null) {
			List<InsecurityDO> insecuritys = insecurityDao.getByConsequence(consequence);
			Date date = new Date();
			for (InsecurityDO insecurity : insecuritys) {
				List<Integer> list = new ArrayList<Integer>();
				for (int i = 1; i <= 12; i++) {
					Date FDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
					Date Sdate = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -i));
					StringBuffer sql = new StringBuffer("select sum(p.score) from TemDO t join t.provision p ,AccessInformationDO a where t.deleted = false and t.activity.id = a.activity.id");
					List<Object> param = new ArrayList<Object>();
					sql.append(" and a.occurredDate >= ?");
					param.add(FDate);
					sql.append(" and a.occurredDate <= ?");
					param.add(Sdate);
					if (unit != null) {
						sql.append(" and t.activity.unit.id = ?");
						param.add(Integer.parseInt(unit));
					}
					if (consequence != null || !("".equals(consequence))) {
						sql.append(" and t.consequence.id = ?");
						param.add(Integer.parseInt(consequence));
					}
					if (insecurity.getId() != null) {
						sql.append(" and t.insecurity.id = ?");
						param.add(insecurity.getId());
					}
					if (sysType != null) {
						sql.append(" and t.sysType.id = ?");
						param.add(Integer.parseInt(sysType));
					}
					List<Long> temlist = this.getHibernateTemplate().find(sql.toString(), param.toArray());
					Double flytime = reportDao.getFlyTime(FDate);
					if (temlist.get(0) != null) {
						double median = temlist.get(0).intValue() * wp / flytime;
						list.add(reportDao.getRiskValue(median));
					} else {
						list.add(0);
					}
				}
				Collections.reverse(list);
				map.put(insecurity.getName(), list);
			}
		}
		return map;
	}
	
	/**
	 * 根据activity对应的安监机构、不安全状态，开始日期和截止日期查询查询tem和安全信息发生时间数组的list<br>
	 * object[0]是TemDO,object[1]是安全信息的发生时间
	 */
	public List<Object[]> getByMultiCon(Integer unitId, Integer insecurityId, Integer systemId, Date begin, Date end) {
		StringBuffer sql = new StringBuffer("select t, a.occurredDate from TemDO t, AccessInformationDO a where t.deleted = false and a.deleted = false and t.activity.deleted = false");
		List<Object> params = new ArrayList<Object>();
		if (null != unitId) {
			sql.append(" and t.activity.unit.id = ?");
			params.add(unitId);
		}
		if (null != insecurityId) {
			sql.append(" and t.insecurity.id = ?");
			params.add(insecurityId);
		}
		if (null != systemId) {
			sql.append(" and t.sysType.id = ?");
			params.add(systemId);
		}
		if (null != begin || null != end) {
			sql.append(" and a.activity.id = t.activity.id");
			if (null != begin) {
				sql.append(" and a.occurredDate >= ?");
				params.add(begin);
			}
			if (null != end) {
				sql.append(" and a.occurredDate <= ?");
				params.add(end);
			}
		}
		sql.append(" order by t.insecurity.name, a.occurredDate");
		@SuppressWarnings("unchecked")
		List<Object[]> list = (List<Object[]>) this.query(sql.toString(), params.toArray());
		return list;
	}
	
	/**
	 * 将tem对应的activity的发生时间
	 * 
	 * @param list
	 */
	private Map<String, List<Object[]>> groupByActivityOccurredDate(List<Object[]> list) {
		// 信息获取的发生时间按月分组，并按升序排列
		Map<String, List<Object[]>> map = new LinkedHashMap<String, List<Object[]>>();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");
		for (Object[] object : list) {
			String occurredDate = sdf.format(object[1]);
			if (map.containsKey(occurredDate)) {
				map.get(occurredDate).add(object);
			} else {
				List<Object[]> tempList = new ArrayList<Object[]>();
				tempList.add(object);
				map.put(occurredDate, tempList);
			}
		}
		return map;
	}
	
	/**
	 * 过滤掉已删除的不安全状态的tem<br>
	 * 如果paramType为threat，过滤掉没有threat的tem,反之过滤掉没有error的tem<br>
	 * 只取第一个不安全状态的tem<br>
	 * 
	 * @return 返回以不安全状态为key,temList为value的map
	 */
	private List<TemDO> filerTemList(List<Object[]> list, String paramType) {
		List<TemDO> result = null;
		// 只取第一个不安全状态的tem
		Map<Object, List<TemDO>> map = new LinkedHashMap<Object, List<TemDO>>();
		InsecurityDO insecurity = null;
		for (Object[] object : list) {
			TemDO tem = (TemDO) object[0];
			if (!tem.getInsecurity().isDeleted()) { // 过滤掉已删除的不安全状态
				if ("threat".equals(paramType)) {
					if (null == tem.getThreats() || tem.getThreats().isEmpty()) { // 过滤掉没有threat的tem
						continue;
					}
				} else if ("error".equals(paramType)) {
					if (null == tem.getErrors() || tem.getErrors().isEmpty()) { // 过滤掉没有error的tem
						continue;
					}
				}
				
				// 只取第一个不安全状态的tem,保证了map只有一个key
				insecurity = tem.getInsecurity();
				if (map.isEmpty()) {
					List<TemDO> tempList = new ArrayList<TemDO>();
					tempList.add(tem);
					map.put(insecurity, tempList);
				} else if (map.containsKey(insecurity)) {
					map.get(insecurity).add(tem);
				}
			}
		}
		if (map.isEmpty()) {
			result = new ArrayList<TemDO>();
		} else {
			for (Entry<Object, List<TemDO>> entry : map.entrySet()) {
				result = entry.getValue();
				break;
			}
		}
		return result;
	}
	
	/**
	 * 生成时间轴 格式：yyyy-MM-dd
	 * 
	 * @param begin
	 * @param end
	 * @return
	 */
	public List<String> generateTimeData(Date begin, Date end) {
		// 生成时间轴
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		List<String> timeData = new ArrayList<String>();
		if (null != begin && null != end) {
			try {
				begin = DateHelper.getFirstDayOfMonth(begin);
				end = DateHelper.getLastDayOfMonth(end);
			} catch (ParseException e) {
				e.printStackTrace();
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "解析日期失败！" + e.getMessage());
			}
			while (begin.before(end)) {
				timeData.add(sdf.format(begin));
				begin = DateUtils.addMonths(begin, 1);
			}
			
		}
		return timeData;
	}
	
	/**
	 * 获取根据activity对应的安监机构、不安全状态，开始日期和截止日期查询的tem,并根据paramType进行过滤
	 * 
	 * @param unitId
	 * @param insecurityId
	 * @param systemId
	 * @param begin
	 * @param end
	 * @param paramType "threat" or "error"
	 * @return 以begin和end的月份（yyyy-MM-dd）为key,List<TemDO>为value的LinkedMap,
	 *         value可能为null
	 */
	private Map<String, List<TemDO>> getFiteredTemsMap(Integer unitId, Integer insecurityId, Integer systemId, Date begin, Date end, String paramType) {
		List<Object[]> list = this.getByMultiCon(unitId, insecurityId, systemId, begin, end);
		Map<String, List<Object[]>> objectMap = groupByActivityOccurredDate(list);
		
		// 时间轴
		List<String> timeData = generateTimeData(begin, end);
		// 与时间轴一一对应的过滤好的tem
		Map<String, List<TemDO>> fiteredTemsMap = new LinkedHashMap<String, List<TemDO>>();
		for (String time : timeData) {
			List<TemDO> fiteredTems = null;
			if (objectMap.containsKey(time.substring(0, 7))) {
				List<Object[]> objectList = objectMap.get(time.substring(0, 7));
				// 过滤出算分的tem
				fiteredTems = filerTemList(objectList, paramType);
			}
			fiteredTemsMap.put(time, fiteredTems);
		}
		return fiteredTemsMap;
	}
	
	/**
	 * 根据activity对应的安监机构、不安全状态，开始日期和截止日期查询威胁的分数<br>
	 * 以selectedDate月份里的所有tem的所有threat为纵轴<br>
	 * 参数都不为空
	 */
	public Map<String, Object> calculateByMultiConForThreat(Integer unitId, Integer insecurityId, Integer systemId, Date begin, Date end, String selectedDate, String[] threatIds) {
		// 指定时间段的飞行小时数
		Map<String, Double> flyTimeMap = reportDao.getFlyTimePerMonth(begin, end);
		Map<String, List<TemDO>> fiteredTemsMap = this.getFiteredTemsMap(unitId, insecurityId, systemId, begin, end, "threat");
		Map<String, Object> result = new HashMap<String, Object>();
		
		// 选择月的所有威胁
		Set<ThreatDO> allThreats = new HashSet<ThreatDO>();
		List<TemDO> tems = fiteredTemsMap.get(selectedDate);
		if (null != tems) {
			for (TemDO tem : tems) {
				if (null != tem.getThreats()) {
					for (ThreatMappingDO threatMapping : tem.getThreats()) {
						allThreats.add(threatMapping.getThreat());
					}
				}
			}
		}
		// 如果有选择threat则加入到所有威胁中
		if (null != threatIds && threatIds.length > 0) {
			allThreats.addAll(threatDao.internalGetByIds(threatIds));
		}
		
		// 对每个月进行处理
		for (Entry<String, List<TemDO>> temListEntry : fiteredTemsMap.entrySet()) {
			String key = temListEntry.getKey();
			String flyTimeKey = key.substring(0, 6);
			Double flyTime = flyTimeMap.get(flyTimeKey) == null ? 1.0 : flyTimeMap.get(flyTimeKey);
			List<TemDO> fiteredTems = temListEntry.getValue();
			// key为威胁的对象
			Map<Object, Integer> scoreMap = new HashMap<Object, Integer>();
			if (null != fiteredTems) {
				for (TemDO tem : fiteredTems) {
					sumForSameId(scoreMap, getScoreForThreatOrError(tem, "threat"));
				}
			}
			
			Map<String, Map<String, String>> resultScore = new HashMap<String, Map<String, String>>();
			for (ThreatDO threat : allThreats) { // 先将所有的威胁赋值为默认的0
				Map<String, String> map = new HashMap<String, String>();
				map.put("name", threat.getName());
				map.put("threatId", threat.getId().toString());
				map.put("value", "0");
				resultScore.put(threat.getId().toString(), map);
			}
			for (Entry<Object, Integer> scoreMapEntry : new ArrayList<Entry<Object, Integer>>(scoreMap.entrySet())) {
				ThreatDO threat = (ThreatDO) (scoreMapEntry.getKey());
				if (allThreats.contains(threat)) { // 再将有分数的威胁赋值为算出来的分数
					Map<String, String> map = new HashMap<String, String>();
					map.put("name", threat.getName());
					map.put("threatId", threat.getId().toString());
					double medain = scoreMapEntry.getValue() * wp / flyTime;
					map.put("value", reportDao.getRiskValue(medain) + "");
					resultScore.put(threat.getId().toString(), map);
				}
			}
			
			Map<String, Object> scoreForOneMonth = new HashMap<String, Object>();
			scoreForOneMonth.put("scoreList", new ArrayList<Map<String, String>>(resultScore.values()));
			scoreForOneMonth.put("insecurityId", insecurityId);
			
			result.put(key, scoreForOneMonth);
		}
		
		return result;
	}
	
	/**
	 * 根据activity对应的安监机构、不安全状态，开始日期和截止日期查询威胁的分数<br>
	 * insecurityId可能为空
	 */
	public Map<String, Object> calculateByMultiConForThreat(Integer unitId, Integer insecurityId, Integer systemId, Date begin, Date end) {
		// 指定时间段的飞行小时数
		Map<String, Double> flyTimeMap = reportDao.getFlyTimePerMonth(begin, end);
		Map<String, List<TemDO>> fiteredTemsMap = this.getFiteredTemsMap(unitId, insecurityId, systemId, begin, end, "threat");
		Map<String, Object> result = new HashMap<String, Object>();
		
		// 对每个月进行处理
		for (Entry<String, List<TemDO>> temListEntry : fiteredTemsMap.entrySet()) {
			String key = temListEntry.getKey();
			String flyTimeKey = key.substring(0, 6);
			Double flyTime = flyTimeMap.get(flyTimeKey) == null ? 1.0 : flyTimeMap.get(flyTimeKey);
			List<TemDO> fiteredTems = temListEntry.getValue();
			Integer newInsecurityId = null;
			// key为威胁的对象
			Map<Object, Integer> scoreMap = new HashMap<Object, Integer>();
			if (null != fiteredTems && !fiteredTems.isEmpty()) {
				for (TemDO tem : fiteredTems) {
					sumForSameId(scoreMap, getScoreForThreatOrError(tem, "threat"));
				}
				if (null == insecurityId) {
					newInsecurityId = fiteredTems.get(0).getInsecurity().getId();
				}
			}
			
			List<Map<String, String>> resultScore = new ArrayList<Map<String, String>>();
			for (Entry<Object, Integer> scoreMapEntry : new ArrayList<Entry<Object, Integer>>(scoreMap.entrySet())) {
				ThreatDO threat = (ThreatDO) (scoreMapEntry.getKey());
				Map<String, String> map = new HashMap<String, String>();
				map.put("name", threat.getName());
				map.put("threatId", threat.getId().toString());
				double median = ((Double) (scoreMapEntry.getValue() * wp / flyTime));
				map.put("value", reportDao.getRiskValue(median) + "");
				resultScore.add(map);
			}
			
			Map<String, Object> scoreForOneMonth = new HashMap<String, Object>();
			scoreForOneMonth.put("scoreList", resultScore);
			scoreForOneMonth.put("insecurityId", insecurityId == null ? (newInsecurityId == null ? 0 : newInsecurityId) : insecurityId);
			
			result.put(key, scoreForOneMonth);
		}
		
		return result;
	}
	
	/**
	 * 根据activity对应的安监机构、不安全状态，开始日期和截止日期查询差错的分数<br>
	 * 以selectedDate月份里的所有tem的所有error为纵轴<br>
	 * 参数都不为空
	 */
	public Map<String, Object> calculateByMultiConForError(Integer unitId, Integer insecurityId, Integer systemId, Date begin, Date end, String selectedDate, String[] errorIds) {
		// 指定时间段的飞行小时数
		Map<String, Double> flyTimeMap = reportDao.getFlyTimePerMonth(begin, end);
		Map<String, List<TemDO>> fiteredTemsMap = this.getFiteredTemsMap(unitId, insecurityId, systemId, begin, end, "error");
		Map<String, Object> result = new HashMap<String, Object>();
		
		// 选择月的所有差错
		Set<ErrorDO> allErrors = new HashSet<ErrorDO>();
		List<TemDO> tems = fiteredTemsMap.get(selectedDate);
		if (null != tems) {
			for (TemDO tem : tems) {
				if (null != tem.getErrors()) {
					for (ErrorMappingDO errorMapping : tem.getErrors()) {
						allErrors.add(errorMapping.getError());
					}
				}
			}
		}
		// 如果有选择error则加入到所有差错中
		if (null != errorIds && errorIds.length > 0) {
			allErrors.addAll(errorDao.internalGetByIds(errorIds));
		}
		
		// 对每个月进行处理
		for (Entry<String, List<TemDO>> temListEntry : fiteredTemsMap.entrySet()) {
			String key = temListEntry.getKey();
			String flyTimeKey = key.substring(0, 6);
			Double flyTime = flyTimeMap.get(flyTimeKey) == null ? 1.0 : flyTimeMap.get(flyTimeKey);
			List<TemDO> fiteredTems = temListEntry.getValue();
			// key为差错的对象
			Map<Object, Integer> scoreMap = new HashMap<Object, Integer>();
			if (null != fiteredTems) {
				for (TemDO tem : fiteredTems) {
					sumForSameId(scoreMap, getScoreForThreatOrError(tem, "error"));
				}
			}
			
			Map<String, Map<String, String>> resultScore = new HashMap<String, Map<String, String>>();
			for (ErrorDO error : allErrors) { // 先将所有的差错赋值为默认的0
				Map<String, String> map = new HashMap<String, String>();
				map.put("name", error.getName());
				map.put("errorId", error.getId().toString());
				map.put("value", "0");
				resultScore.put(error.getId().toString(), map);
			}
			for (Entry<Object, Integer> scoreMapEntry : new ArrayList<Entry<Object, Integer>>(scoreMap.entrySet())) {
				ErrorDO error = (ErrorDO) (scoreMapEntry.getKey());
				if (allErrors.contains(error)) { // 再将有分数的差错赋值为算出来的分数
					Map<String, String> map = new HashMap<String, String>();
					map.put("name", error.getName());
					map.put("errorId", error.getId().toString());
					double median = scoreMapEntry.getValue() * wp / flyTime;
					map.put("value", reportDao.getRiskValue(median) + "");
					resultScore.put(error.getId().toString(), map);
				}
			}
			
			Map<String, Object> scoreForOneMonth = new HashMap<String, Object>();
			scoreForOneMonth.put("scoreList", new ArrayList<Map<String, String>>(resultScore.values()));
			scoreForOneMonth.put("insecurityId", insecurityId);
			
			result.put(key, scoreForOneMonth);
		}
		
		return result;
	}
	
	/**
	 * 根据activity对应的安监机构、不安全状态，开始日期和截止日期查询差错的分数<br>
	 * insecurityId可能为空
	 */
	public Map<String, Object> calculateByMultiConForError(Integer unitId, Integer insecurityId, Integer systemId, Date begin, Date end) {
		// 指定时间段的飞行小时数
		Map<String, Double> flyTimeMap = reportDao.getFlyTimePerMonth(begin, end);
		Map<String, List<TemDO>> fiteredTemsMap = this.getFiteredTemsMap(unitId, insecurityId, systemId, begin, end, "error");
		Map<String, Object> result = new HashMap<String, Object>();
		
		// 对每个月进行处理
		for (Entry<String, List<TemDO>> temListEntry : fiteredTemsMap.entrySet()) {
			String key = temListEntry.getKey();
			String flyTimeKey = key.substring(0, 6);
			Double flyTime = flyTimeMap.get(flyTimeKey) == null ? 1.0 : flyTimeMap.get(flyTimeKey);
			List<TemDO> fiteredTems = temListEntry.getValue();
			Integer newInsecurityId = null;
			// key为差错的对象
			Map<Object, Integer> scoreMap = new HashMap<Object, Integer>();
			if (null != fiteredTems && !fiteredTems.isEmpty()) {
				for (TemDO tem : fiteredTems) {
					sumForSameId(scoreMap, getScoreForThreatOrError(tem, "error"));
				}
				if (null == insecurityId) {
					newInsecurityId = fiteredTems.get(0).getInsecurity().getId();
				}
			}
			
			List<Map<String, String>> resultScore = new ArrayList<Map<String, String>>();
			for (Entry<Object, Integer> scoreMapEntry : new ArrayList<Entry<Object, Integer>>(scoreMap.entrySet())) {
				ErrorDO error = (ErrorDO) (scoreMapEntry.getKey());
				Map<String, String> map = new HashMap<String, String>();
				map.put("name", error.getName());
				map.put("errorId", error.getId().toString());
				double median = ((Double) (scoreMapEntry.getValue() * wp / flyTime));
				map.put("value", reportDao.getRiskValue(median) + "");
				resultScore.add(map);
			}
			
			Map<String, Object> scoreForOneMonth = new HashMap<String, Object>();
			scoreForOneMonth.put("scoreList", resultScore);
			scoreForOneMonth.put("insecurityId", insecurityId == null ? (newInsecurityId == null ? 0 : newInsecurityId) : insecurityId);
			
			result.put(key, scoreForOneMonth);
		}
		
		return result;
	}
	
	/**
	 * key相同的分数相加
	 * 
	 * @param scoreMap
	 * @param addMap
	 */
	private void sumForSameId(Map<Object, Integer> scoreMap, Map<Object, Integer> addMap) {
		if (null != addMap) {
			for (Object key : addMap.keySet()) {
				if (scoreMap.containsKey(key)) {
					scoreMap.put(key, scoreMap.get(key) + addMap.get(key));
				} else {
					scoreMap.put(key, addMap.get(key));
				}
			}
		}
	}
	
	/**
	 * @param tem 要算分的tem
	 * @return 威胁或差错的分数map
	 */
	private Map<Object, Integer> getScoreForThreatOrError(TemDO tem, String paramType) {
		Set<ThreatMappingDO> threats = tem.getThreats();
		ThreatMappingDO primaryThreat = tem.getPrimaryThreat();
		Set<ErrorMappingDO> errors = tem.getErrors();
		ErrorMappingDO primaryError = tem.getPrimaryError();
		Integer[] scoresForThreat = null;
		Integer[] scoresForError = null;
		
		// 总分
		// 差错饼图 不安全状态 egpws下滑道
		Integer sumScore = tem.getProvision().getScore();
		if (null == sumScore) {
			sumScore = 0;
		}
		
		Map<Object, Integer> scoreMap = new HashMap<Object, Integer>();
		if (null != primaryThreat || null != primaryError) {
			// 威胁与差错同时存在时
			if (null != primaryThreat && null != primaryError) {
				// 威胁
				scoresForThreat = getScoreByNum((4 * sumScore) / 10, threats.size());
				// 差错
				scoresForError = getScoreByNum((6 * sumScore) / 10, errors.size());
			} else if (null == primaryError) { // 只有威胁时
				scoresForThreat = getScoreByNum(sumScore, threats.size());
			} else { // 只有差错时
				scoresForError = getScoreByNum(sumScore, errors.size());
			}
			
			if ("threat".equals(paramType)) { // 威胁的分数
				for (ThreatMappingDO threatMapping : threats) {
					ThreatDO threat = threatMapping.getThreat();
					if (primaryThreat.getThreat().equals(threat)) {
						scoreMap.put(threat, scoresForThreat[0]);
					} else {
						scoreMap.put(threat, scoresForThreat[1]);
					}
				}
			} else if ("error".equals(paramType)) { // 差错的分数
				for (ErrorMappingDO errorMapping : errors) {
					ErrorDO error = errorMapping.getError();
					if (primaryError.getError().equals(error)) {
						scoreMap.put(error, scoresForError[0]);
					} else {
						scoreMap.put(error, scoresForError[1]);
					}
				}
			}
		}
		
		return scoreMap;
	}
	
	/**
	 * 根据条数获取每条的分数 <br>
	 * 最多四条 <br>
	 * 两条 是64 <br>
	 * 三条是622 <br>
	 * 四条是7111
	 * 
	 * @param sum 总分
	 * @param num 总条数
	 * @return 第一条是主要威胁或差错的分数, 第二条是一般威胁或差错的分数
	 */
	private Integer[] getScoreByNum(int sum, int num) {
		Integer[] scores = new Integer[2];
		int secondaryScore = 0;
		int primaryScore = 0;
		switch (num) {
			case 1:
				primaryScore = sum;
				secondaryScore = 0;
				break;
			case 2:
				primaryScore = 6 * sum / 10;
				secondaryScore = 4 * sum / 10;
				break;
			case 3:
				primaryScore = 6 * sum / 10;
				secondaryScore = 2 * sum / 10;
				break;
			case 4:
				primaryScore = 7 * sum / 10;
				secondaryScore = 1 * sum / 10;
				break;
			default:
				// 默认
		}
		scores[0] = primaryScore;
		scores[1] = secondaryScore;
		return scores;
	}
	
	/*
	 * 根据安监机构、不安全状态，开始日期和截止日期查询重大风险所对应的严重条款的分数
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Object[]> calculateByMultiCon(Integer unit, Integer system, Integer insecurityid, Date date) throws ParseException {
		Date first = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -12));
		Date last = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
		StringBuffer sql = new StringBuffer("select a.occurredDate,sum(p.score) from TemDO t left join t.provision p, AccessInformationDO a where  t.deleted = false ");
		List<Object> params = new ArrayList<Object>();
		if (null != unit && 0 != unit) {
			sql.append(" and t.activity.unit.id = ?");
			params.add(unit);
		}
		if (null != insecurityid) {
			sql.append(" and t.insecurity.id = ?");
			params.add(insecurityid);
		}
		if (null != system && 0 != system) {
			sql.append(" and t.sysType.id = ?");
			params.add(system);
		}
		if (null != first || null != last) {
			sql.append(" and a.activity.id = t.activity.id");
			if (null != first) {
				sql.append(" and a.occurredDate >= ?");
				params.add(first);
			}
			if (null != last) {
				sql.append(" and a.occurredDate <= ?");
				params.add(last);
			}
		}
		sql.append(" group by a.occurredDate");
		List<Object[]> scorelist = this.getHibernateTemplate().find(sql.toString(), params.toArray());
		return scorelist;
	}
	
	/*
	 * 查询不安全状态
	 */
	public Map<String, Object> getInsecurityList(Integer unitId) {
		String hql = "select t.insecurity.id, t.insecurity.name from TemDO t where t.activity.unit.id = ?";
		@SuppressWarnings("unchecked")
		List<Object[]> objList = (List<Object[]>) this.query(hql, unitId);
		Map<String, Object> map = new HashMap<String, Object>();
		for (Object[] tem : objList) {
			map.put(tem[0].toString(), tem[1]);
		}
		return map;
	}
	
	/**
	 * tem统计表
	 * 
	 * @param firstDay 当月第一天
	 * @param lastDay 当月最后一天
	 * @throws ParseException
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getScoreBySysType(List<UnitDO> units, Date firstDay, Date lastDay, Double flytime, List<DictionaryDO> sysType) throws ParseException {
		List<Map<String, Object>> datalist = new ArrayList<Map<String, Object>>();
		for (UnitDO unit : units) {
			Map<String, Object> map = new LinkedHashMap<String, Object>();
			StringBuffer sql = new StringBuffer("select t.sysType.name,sum(p.score) from TemDO t join t.provision p," + "AccessInformationDO a where t.deleted = false and t.activity.id = a.activity.id ");
			List<Object> param = new ArrayList<Object>();
			sql.append(" and a.occurredDate >= ?");
			param.add(firstDay);
			sql.append(" and a.occurredDate <= ?");
			param.add(lastDay);
			sql.append(" and t.activity.unit.id = ?");
			param.add(unit.getId());
			sql.append("  group by t.sysType.name");
			map.put("unitId", unit.getId());
			map.put("unitName", unit.getName());
			List<Object[]> list = this.getHibernateTemplate().find(sql.toString(), param.toArray());
			Map<String, Object> tempMap = new LinkedHashMap<String, Object>();
			for (Object[] o : list) {
				if (o[0] != null && o[1] != null) {
					tempMap.put(o[0].toString(), o[1].toString());
				}
			}
			List<Map<String, Object>> innerList = new ArrayList<Map<String, Object>>();
			for (DictionaryDO dictionary : sysType) {
				Map<String, Object> innerMap = new LinkedHashMap<String, Object>();
				innerMap.put("sysTypeId", dictionary.getId());
				innerMap.put("name", dictionary.getName());
				Integer value = Integer.parseInt(tempMap.get(dictionary.getName()) == null ? "0" : tempMap.get(dictionary.getName()).toString());
				double median = value * wp / flytime;
				innerMap.put("value", reportDao.getRiskValue(median));
				innerList.add(innerMap);
			}
			map.put("sysType", innerList);
			datalist.add(map);
		}
		return datalist;
	}
	
	/**
	 * 每个系统的雷达图
	 * 
	 * @param firstDay
	 * @param lastDay
	 * @param sysType
	 * @return
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public Map<String, Object> drawRadar(Date firstDay, Date lastDay, Integer sysType, Integer unitId) {
		StringBuffer sql = new StringBuffer("select t.consequence.name, sum(p.score) from TemDO t left join t.provision p ,AccessInformationDO a where " + "t.deleted = false and t.activity.id = a.activity.id ");
		List<Object> param = new ArrayList<Object>();
		if (firstDay != null) {
			sql.append(" and a.occurredDate >= ?");
			param.add(firstDay);
		}
		if (lastDay != null) {
			sql.append(" and a.occurredDate <= ?");
			param.add(lastDay);
		}
		if (sysType != null) {
			sql.append(" and t.sysType.id = ?");
			param.add(sysType);
		}
		if (unitId != null) {
			sql.append(" and t.activity.unit.id = ?");
			param.add(unitId);
		}
		sql.append(" group by t.consequence.name");
		@SuppressWarnings("unchecked")
		List<Object[]> list = this.getHibernateTemplate().find(sql.toString(), param.toArray());
		Map<String, Object> map = new LinkedHashMap<String, Object>();
		for (Object[] o : list) {
			map.put(o[0].toString(), o[1].toString());
		}
		return map;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> drawLine(String consequence, Date date, Integer unit, Integer sysType) throws ParseException {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		if (!("".equals(consequence))) {
			Date begin = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -12));
			Date end = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
			StringBuffer sql = new StringBuffer("select a.occurredDate,t.insecurity.id,sum(p.score) from TemDO t join t.provision p ,AccessInformationDO a where t.deleted = false and t.activity.id = a.activity.id");
			List<Object> param = new ArrayList<Object>();
			sql.append(" and a.occurredDate >= ?");
			param.add(begin);
			sql.append(" and a.occurredDate <= ?");
			param.add(end);
			sql.append(" and t.consequence.id = ?");
			param.add(Integer.parseInt(consequence));
			if (unit != null) {
				sql.append(" and t.activity.unit.id = ?");
				param.add(unit);
			}
			if (sysType != null) {
				sql.append("  and t.sysType.id = ?");
				param.add(sysType);
			}
			sql.append(" group by a.occurredDate,t.insecurity.id");
			List<Object[]> scoreList = this.getHibernateTemplate().find(sql.toString(), param.toArray());
			List<InsecurityDO> inseList = insecurityDao.getByConsequence(consequence);
			Map<String, Double> flyTimeMap = reportDao.getFlyTimePerMonth(DateUtils.addMonths(date, -12), DateUtils.addMonths(date, -1));
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");
			for (InsecurityDO inse : inseList) {
				Map<String, Object> map = new LinkedHashMap<String, Object>();
				List<Integer> tempList = new ArrayList<Integer>();
				double mark = 0.0;
				for (int i = -12; i < 0; i++) {
					Date firstDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, i));
					Date lastDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, i));
					Double flyTime = flyTimeMap.get(sdf.format(firstDay)) == null ? 1.0 : flyTimeMap.get(sdf.format(firstDay));
					Double value = 0.0;
					for (Object[] o : scoreList) {
						if (o[0] != null && o[1] != null && o[2] != null) {
							if (((Timestamp) o[0]).compareTo(firstDay) == 0 && inse.getId().equals((Integer) o[1])) {
								value = value + ((Long) o[2]).doubleValue();
							}
							if (((Timestamp) o[0]).after(firstDay) && ((Timestamp) o[0]).before(lastDay) && inse.getId().equals((Integer) o[1])) {
								value = value + ((Long) o[2]).doubleValue();
							}
						}
					}
					double median = value * wp / flyTime;
					tempList.add(reportDao.getRiskValue(median));
					mark += value;
				}
				map.put("id", inse.getId());
				map.put("name", inse.getName());
				map.put("value", tempList);
				if (mark == 0.0) {
					map.put("mark", true);
				} else {
					map.put("mark", false);
				}
				list.add(map);
			}
		}
		return list;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getScoreByUnit(Integer unit, Date beginDay, Date endDay) {
		StringBuffer sql = new StringBuffer("select t.sysType.name,sum(p.score) from TemDO t join t.provision p ,AccessInformationDO a where t.deleted = false and t.activity.id = a.activity.id");
		List<Object> param = new ArrayList<Object>();
		sql.append(" and a.occurredDate >= ?");
		param.add(beginDay);
		sql.append(" and a.occurredDate <= ?");
		param.add(endDay);
		if (unit != null) {
			sql.append(" and t.activity.unit.id = ?");
			param.add(unit);
		}
		sql.append(" group by t.sysType.name");
		List<Object[]> dataList = this.getHibernateTemplate().find(sql.toString(), param.toArray());
		List<DictionaryDO> dictionary = dictionaryDao.getListByType("系统分类");
		Map<String, Object> tempMap = new HashMap<String, Object>();
		for (Object[] o : dataList) {
			tempMap.put(o[0].toString(), o[1].toString());
		}
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Double flyTime = reportDao.getFlyTime(beginDay);
		for (DictionaryDO dic : dictionary) {
			Map<String, Object> map = new HashMap<String, Object>();
			if (tempMap.get(dic.getName()) == null) {
				map.put("id", dic.getId());
				map.put("name", dic.getName());
				map.put("value", 0);
			} else {
				map.put("id", dic.getId());
				map.put("name", dic.getName());
				double median = Double.parseDouble(tempMap.get(dic.getName()).toString()) * wp / flyTime;
				map.put("value", reportDao.getRiskValue(median));
			}
			list.add(map);
		}
		return list;
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> sumScoreByUnit(Integer unit, Date beginDay, Date endDay) {
		Double flyTime = reportDao.getFlyTime(beginDay);
		StringBuffer sumsql = new StringBuffer("select sum(p.score) from TemDO t join t.provision p ,AccessInformationDO a where t.deleted = false and t.activity.id = a.activity.id");
		List<Object> param1 = new ArrayList<Object>();
		sumsql.append(" and a.occurredDate >= ?");
		param1.add(beginDay);
		sumsql.append(" and a.occurredDate <= ?");
		param1.add(endDay);
		if (unit != null) {
			sumsql.append(" and t.activity.unit.id = ?");
			param1.add(unit);
		}
		List<Long> sumList = this.getHibernateTemplate().find(sumsql.toString(), param1.toArray());
		Map<String, Object> summap = new HashMap<String, Object>();
		summap.put("id", 0);
		summap.put("name", "总分");
		if (sumList.get(0) != null) {
			double median = Double.parseDouble(sumList.get(0).toString()) * wp / flyTime;
			summap.put("value", reportDao.getRiskValue(median));
		} else {
			summap.put("value", 0);
		}
		return summap;
	}
	
	@SuppressWarnings("unchecked")
	public Integer warnScoreByUnit(Integer unit) throws ParseException {
		Date date = new Date();
		Date beginDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -12));
		Date endDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
		StringBuffer sumsql = new StringBuffer("select sum(p.score)/6 from TemDO t join t.provision p ,AccessInformationDO a where t.deleted = false and t.activity.id = a.activity.id");
		List<Object> param1 = new ArrayList<Object>();
		sumsql.append(" and a.occurredDate >= ?");
		param1.add(beginDay);
		sumsql.append(" and a.occurredDate <= ?");
		param1.add(endDay);
		if (unit != null) {
			sumsql.append(" and t.activity.unit.id = ?");
			param1.add(unit);
		}
		List<Long> sumList = this.getHibernateTemplate().find(sumsql.toString(), param1.toArray());
		Integer warn = 100;
		if (sumList.get(0) != null) {
			warn = sumList.get(0).intValue();
		}
		return warn;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public Map<String, Double> drawGaugeByInsecurity(Integer insecurity, Integer unit, Integer sysType, Integer consequence, Date beginDay, Date endDay) throws ParseException {
		StringBuffer sql = new StringBuffer("select sum(p.score) from TemDO t join t.provision p ,AccessInformationDO a where t.deleted = false and t.activity.id = a.activity.id");
		List<Object> param = new ArrayList<Object>();
		if (insecurity != null) {
			sql.append(" and t.insecurity.id = ?");
			param.add(insecurity);
		}
		if (consequence != null) {
			sql.append(" and t.consequence.id = ?");
			param.add(consequence);
		}
		if (unit != null) {
			sql.append(" and t.activity.unit.id = ?");
			param.add(unit);
		}
		if (sysType != null) {
			sql.append("  and t.sysType.id = ?");
			param.add(sysType);
		}
		sql.append("  and a.occurredDate >= ?");
		param.add(beginDay);
		sql.append(" and a.occurredDate <= ?");
		param.add(endDay);
		List<Long> list = this.getHibernateTemplate().find(sql.toString(), param.toArray());
		Map<String, Double> map = new HashMap<String, Double>();
		Double flyTime = reportDao.getFlyTime(beginDay);
		Double riskParam = reportDao.getRiskParam();
		Double score = 0.0;
		if (list.get(0) != null) {
			score = Double.parseDouble(list.get(0).toString()) * wp / flyTime;
		}
		Map<String, Double> warnList = reportDao.getGaugeWarningValue(sysType, insecurity, beginDay, flyTime, riskParam);
		map.putAll(reportDao.getGaugeParam(score, warnList.get("average"), warnList.get("warning")));
		return map;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> drawGaugeAll(String consequence, Integer unit, Integer sysType, Date beginDay, Date endDay) throws ParseException {
		List<InsecurityDO> inseList = insecurityDao.getByConsequence(consequence);
		StringBuffer sql = new StringBuffer("select t.insecurity.name,sum(p.score) from TemDO t join t.provision p ,AccessInformationDO a where t.deleted = false and t.activity.id = a.activity.id");
		List<Object> param = new ArrayList<Object>();
		if (unit != null) {
			sql.append(" and t.activity.unit.id = ?");
			param.add(unit);
		}
		if (sysType != null) {
			sql.append("  and t.sysType.id = ?");
			param.add(sysType);
		}
		sql.append("  and a.occurredDate >= ?");
		param.add(beginDay);
		sql.append(" and a.occurredDate <= ?");
		param.add(endDay);
		sql.append(" group by t.insecurity.name");
		List<Object[]> datalist = this.getHibernateTemplate().find(sql.toString(), param.toArray());
		Map<String, Object> tempMap = new HashMap<String, Object>();
		for (Object[] o : datalist) {
			tempMap.put(o[0].toString(), o[1].toString());
		}
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Double flyTime = reportDao.getFlyTime(beginDay);
		Double riskParam = reportDao.getRiskParam();
		for (InsecurityDO inse : inseList) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", inse.getId());
			map.put("name", inse.getName());
			Double value = tempMap.get(inse.getName()) == null ? 0.0 : Double.parseDouble(tempMap.get(inse.getName()).toString());
			Map<String, Double> warnMap = reportDao.getGaugeWarningValue(sysType, inse.getId(), beginDay, flyTime, riskParam);
			double median = value * wp / flyTime;
			map.putAll(reportDao.getGaugeParam(median, warnMap.get("average"), warnMap.get("warning")));
			list.add(map);
		}
		return list;
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		// 获取删除tem的activity的id,更新solr用
		List<TemDO> tems = this.internalGetByIds(ids);
		List<Integer> activityIds = new ArrayList<Integer>();
		for (TemDO tem : tems) {
			activityIds.add(tem.getActivity().getId());
		}
		
		// 删除tem
		this.markAsDeleted(ids);
		
		// 更新solr
		for (Integer activityId : activityIds) {
			updateTemInfoToSolr(activityId);
		}
	}
	
	/**
	 * 根据activityId获取要更新到solr里的tem的信息
	 * 
	 * @param activityId
	 * @return
	 */
	public Map<String, Object> getTemInfoForSolr(Integer activityId) {
		// 对应activity的所有tem
		StringBuffer hql = new StringBuffer("select distinct t from TemDO t left join fetch t.severity left join fetch t.provision").append(" left join fetch t.insecurity left join fetch t.consequence left join fetch t.threats left join fetch t.primaryThreat").append(" left join fetch t.errors left join fetch t.primaryError left join fetch t.activity left join fetch t.sysType").append(" left join fetch t.creator").append(" where t.activity.id = ?");
		@SuppressWarnings("unchecked")
		List<TemDO> tems = (List<TemDO>) this.query(hql.toString(), activityId);
		//		List<TemDO> tems = this.getByActivityId(activityId);
		List<String> systemIds = new ArrayList<String>();
		List<Integer> threatIds = new ArrayList<Integer>();
		List<Integer> errorIds = new ArrayList<Integer>();
		List<Integer> severityIds = new ArrayList<Integer>();
		List<Integer> insecurityIds = new ArrayList<Integer>();
		List<Integer> consequenceIds = new ArrayList<Integer>();
		if (null != tems) {
			for (TemDO tem : tems) {
				// 系统分类
				if (null != tem.getSysType()) {
					systemIds.add(tem.getSysType().getId().toString());
				}
				// 威胁
				if (null != tem.getThreats()) {
					for (ThreatMappingDO threatMapping : tem.getThreats()) {
						threatIds.add(threatMapping.getThreat().getId());
					}
				}
				// 差错
				if (null != tem.getErrors()) {
					for (ErrorMappingDO errorMapping : tem.getErrors()) {
						errorIds.add(errorMapping.getError().getId());
					}
				}
				// 严重程度
				if (null != tem.getSeverity()) {
					severityIds.add(tem.getSeverity().getId());
				}
				// 不安全状态
				if (null != tem.getInsecurity()) {
					insecurityIds.add(tem.getInsecurity().getId());
				}
				// 重大风险
				if (null != tem.getConsequence()) {
					consequenceIds.add(tem.getConsequence().getId());
				}
			}
		}
		
		Map<String, Object> map = new HashMap<String, Object>();
		// 系统分类 字典型的字段保存到solr中由string型改为int型的id
		map.put("temSystem", systemIds);
		map.put("threat", threatIds);
		map.put("error", errorIds);
		map.put("severity", severityIds);
		map.put("insecurity", insecurityIds);
		map.put("consequence", consequenceIds);
		return map;
	}
	
	/**
	 * 根据activityIds获取要更新到solr里的tem的信息
	 * 
	 * @param activityId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getTemInfoForSolr(List<Integer> activityIds) {
		Map<String, Object> result = new HashMap<String, Object>();
		if (activityIds == null || activityIds.isEmpty()) {
			return result;
		}
		List<TemDO> tems;
		// 对应activity的所有tem
		StringBuffer hql = new StringBuffer("select distinct t from TemDO t left join fetch t.severity left join fetch t.provision").append(" left join fetch t.insecurity left join fetch t.consequence left join fetch t.threats left join fetch t.primaryThreat").append(" left join fetch t.errors left join fetch t.primaryError left join fetch t.activity left join fetch t.sysType").append(" left join fetch t.creator").append(" where t.activity.id in (:ids)");
		
		tems = this.getHibernateTemplate().findByNamedParam(hql.toString(), "ids", activityIds);
		// 分组
		Map<String, Object> activityMap = new HashMap<String, Object>();
		for (TemDO tem : tems) {
			String avtivityId = tem.getActivity().getId().toString();
			if (activityMap.containsKey(avtivityId)) {
				((List<TemDO>) activityMap.get(avtivityId)).add(tem);
			} else {
				List<TemDO> list = new ArrayList<TemDO>();
				list.add(tem);
				activityMap.put(avtivityId, list);
			}
		}
		for (Entry<String, Object> entry : activityMap.entrySet()) {
			tems = (List<TemDO>) entry.getValue();
			List<String> systemIds = new ArrayList<String>();
			List<Integer> threatIds = new ArrayList<Integer>();
			List<Integer> errorIds = new ArrayList<Integer>();
			List<Integer> severityIds = new ArrayList<Integer>();
			List<Integer> insecurityIds = new ArrayList<Integer>();
			List<Integer> consequenceIds = new ArrayList<Integer>();
			if (null != tems) {
				for (TemDO tem : tems) {
					// 系统分类
					if (null != tem.getSysType()) {
						systemIds.add(tem.getSysType().getId().toString());
					}
					// 威胁
					if (null != tem.getThreats()) {
						for (ThreatMappingDO threatMapping : tem.getThreats()) {
							threatIds.add(threatMapping.getThreat().getId());
						}
					}
					// 差错
					if (null != tem.getErrors()) {
						for (ErrorMappingDO errorMapping : tem.getErrors()) {
							errorIds.add(errorMapping.getError().getId());
						}
					}
					// 严重程度
					if (null != tem.getSeverity()) {
						severityIds.add(tem.getSeverity().getId());
					}
					// 不安全状态
					if (null != tem.getInsecurity()) {
						insecurityIds.add(tem.getInsecurity().getId());
					}
					// 重大风险
					if (null != tem.getConsequence()) {
						consequenceIds.add(tem.getConsequence().getId());
					}
				}
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			// 系统分类 字典型的字段保存到solr中由string型改为int型的id
			map.put("temSystem", systemIds);
			map.put("threat", threatIds);
			map.put("error", errorIds);
			map.put("severity", severityIds);
			map.put("insecurity", insecurityIds);
			map.put("consequence", consequenceIds);
			result.put(entry.getKey(), map);
		}
		return result;
	}
	
	/**
	 * 通过activityId的list获取tem信息的的map的Map
	 * 
	 * @param activityIds activityId的list
	 * @return tem信息的的map的Map
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getTemInfoMapsByActivityIds(List<Integer> activityIds) {
		if (null == activityIds || activityIds.isEmpty()) {
			return Collections.emptyMap();
		}
		List<Object[]> objs = (List<Object[]>) getHibernateTemplate().findByNamedParam("select t.activity.id, t from TemDO t where t.deleted = false and t.activity.id in (:ids)", "ids", activityIds);
		// 将查询出来的结果按activityId分组
		return this.getTemInfoMapsGroupByActivityId(objs);
	}
	
	/**
	 * 通过activityId的list获取tem信息的的map的Map
	 * 
	 * <br>
	 * 调用前先将activityid插入到临时表中
	 * @return tem信息的的map的Map
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getTemInfoMapsThroughTempTable() {
		List<Object[]> objs = (List<Object[]>) getHibernateTemplate().find("select t.activity.id, t from TemDO t where t.deleted = false and t.activity.id in (select id from TempTableDO)");
		// 将查询出来的结果按activityId分组
		return this.getTemInfoMapsGroupByActivityId(objs);
	}
	
	/**
	 * 将查询出来的TEM信息以安全信息的id分组返回
	 * @param objs
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private Map<String, Object> getTemInfoMapsGroupByActivityId(List<Object[]> objs) {
		Map<String, Object> result = new HashMap<String, Object>();
		Map<String, Object> map = new HashMap<String, Object>();
		// 将查询出来的结果按activityId分组
		for (Object[] obj : objs) {
			String activityId = obj[0].toString();
			// TODO 有问题
			TemDO tem = (TemDO) obj[1];
			if (map.containsKey(activityId)) {
				((List<TemDO>) map.get(activityId)).add(tem);
			} else {
				List<TemDO> tems = new ArrayList<TemDO>();
				tems.add(tem);
				map.put(activityId, tems);
			}
		}
		for (String activityId : map.keySet()) {
			List<TemDO> tems = (List<TemDO>) map.get(activityId);
			List<String> systems = new ArrayList<String>();
			List<String> threats = new ArrayList<String>();
			List<String> errors = new ArrayList<String>();
			List<String> severitys = new ArrayList<String>();
			List<String> insecuritys = new ArrayList<String>();
			List<String> consequences = new ArrayList<String>();
			if (null != tems) {
				for (TemDO tem : tems) {
					// 系统分类
					if (null != tem.getSysType()) {
						systems.add(tem.getSysType().getName());
					}
					// 威胁
					if (null != tem.getThreats()) {
						for (ThreatMappingDO threatMapping : tem.getThreats()) {
							threats.add(threatMapping.getThreat().getName());
						}
					}
					// 差错
					if (null != tem.getErrors()) {
						for (ErrorMappingDO errorMapping : tem.getErrors()) {
							errors.add(errorMapping.getError().getName());
						}
					}
					// 严重程度
					if (null != tem.getSeverity()) {
						severitys.add(tem.getSeverity().getName());
					}
					// 不安全状态
					if (null != tem.getInsecurity()) {
						insecuritys.add(tem.getInsecurity().getName());
					}
					// 重大风险
					if (null != tem.getConsequence()) {
						consequences.add(tem.getConsequence().getName());
					}
				}
			}
			
			Map<String, Object> temInfoMap = new HashMap<String, Object>();
			temInfoMap.put("temSystem", StringUtils.join(systems, ";"));
			temInfoMap.put("threat", StringUtils.join(threats, ";"));
			temInfoMap.put("error", StringUtils.join(errors, ";"));
			temInfoMap.put("severity", StringUtils.join(severitys, ";"));
			temInfoMap.put("insecurity", StringUtils.join(insecuritys, ";"));
			temInfoMap.put("consequence", StringUtils.join(consequences, ";"));
			
			result.put(activityId, temInfoMap);
		}
		return result;
	}
	
	// 更新activity对应的tem信息到solr
	public void updateTemInfoToSolr(Integer activityId) {
		if (null != activityId) {
			Map<String, Object> map = this.getTemInfoForSolr(activityId);
			solrService.updateSolrFields("activity", activityId, map);
		}
	}
	
	/**
	 * 更新tem的信息到solr<br>
	 * 包括系统分类，威胁，差错，严重程度，不安全状态，重大风险
	 * 
	 * @param obj
	 */
	public void updateTemInfoToSolr(TemDO obj) {
		if (null != obj) {
			Integer activityId = obj.getActivity().getId();
			updateTemInfoToSolr(activityId);
		}
	}
	
	@Override
	public boolean hasPermission(Integer id, HttpServletRequest request) {
		return permissionSetDao.hasPermission(PermissionSets.BUSINESS_ADMIN.getName());
	}

	public void setConsequenceDao(ConsequenceDao consequenceDao) {
		this.consequenceDao = consequenceDao;
	}
	
	public void setErrorDao(ErrorDao errorDao) {
		this.errorDao = errorDao;
	}
	
	public void setErrorMappingDao(ErrorMappingDao errorMappingDao) {
		this.errorMappingDao = errorMappingDao;
	}
	
	public void setInsecurityDao(InsecurityDao insecurityDao) {
		this.insecurityDao = insecurityDao;
	}
	
	public void setProvisionDao(ProvisionDao provisionDao) {
		this.provisionDao = provisionDao;
	}
	
	public void setSeverityDao(SeverityDao severityDao) {
		this.severityDao = severityDao;
	}
	
	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}
	
	public void setThreatMappingDao(ThreatMappingDao threatMappingDao) {
		this.threatMappingDao = threatMappingDao;
	}
	
	/**
	 * @param activityLoggingDao the activityLoggingDao to set
	 */
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}
	
	public void setControlMeasureDao(ControlMeasureDao controlMeasureDao) {
		this.controlMeasureDao = controlMeasureDao;
	}
	
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}
	
	public void setReportDao(ReportDao reportDao) {
		this.reportDao = reportDao;
	}
	
	public void setSolrService(SolrService solrService) {
		this.solrService = solrService;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
}
