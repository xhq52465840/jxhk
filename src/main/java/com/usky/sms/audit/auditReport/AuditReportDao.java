package com.usky.sms.audit.auditReport;

import java.math.BigDecimal;
import java.text.Collator;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.hibernate.Query;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.audit.AuditConstant;
import com.usky.sms.audit.check.CheckListDao;
import com.usky.sms.audit.check.EnumAuditResult;
import com.usky.sms.audit.check.EnumConfirmResult;
import com.usky.sms.audit.check.EnumImproveItemStatus;
import com.usky.sms.audit.improve.EnumImproveSourceType;
import com.usky.sms.audit.improvenotice.EnumImproveNoticeIssueStatus;
import com.usky.sms.audit.improvenotice.EnumImproveNoticeIssueTraceStatus;
import com.usky.sms.audit.improvenotice.ImproveNoticeDao;
import com.usky.sms.audit.improvenotice.ImproveNoticeIssueDao;
import com.usky.sms.audit.plan.EnumCheckGrade;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.geography.UnitGeographyDO;
import com.usky.sms.geography.UnitGeographyDao;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.utils.SpringBeanUtils;

public class AuditReportDao extends HibernateDaoSupport {
	
	protected static final Gson gson = GsonBuilder4SMS.getInstance();
	
	private Config config;
	
	@Autowired
	private UnitGeographyDao unitGeographyDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private CheckListDao checkListDao;
	
	@Autowired
	private ImproveNoticeIssueDao improveNoticeIssueDao;
	
	@Autowired
	private ImproveNoticeDao improveNoticeDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	public AuditReportDao() {
		this.config = Config.getInstance();
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getAuditMap(Integer year) {
		Map<Object, List<Object[]>> all_groupByUnit = this.groupByUnit(this.getAllSource(year));
		Map<Object, List<Object[]>> fuHeX_groupByUnit = this.groupByUnit(this.getFuHeXSource(year));
		return this.calculateSource(all_groupByUnit, fuHeX_groupByUnit);
	}
	
	private List<Object[]> getAllSource(Integer year){
		String sql = "select ta.target as unitid, unit.name as unitname, dic2.id as professionid, dic2.name as professionname,"
				+ "sum(item.weight_type * (case dic1.name when '"
				+ EnumAuditResult.符合项
				+ "' then 3 when '"
				+ EnumAuditResult.有实无文
				+ "' then 2 when '"
				+ EnumAuditResult.有文无实
				+ "' then 2 when '"
				+ EnumAuditResult.建议项
				+ "' then 1 when '"
				+ EnumAuditResult.无文无实
				+ "' then 0 else 0 end)) as source"
				+ " from a_task ta"
				+ " left join a_check ch"
				+ "  on ta.id = ch.task_id"
				+ " left join a_check_list cl"
				+ "  on ch.id = cl.check_id"
				+ " left join t_dictionary dic2"
				+ "  on ch.check_type = dic2.id"
				+ " left join a_item item"
				+ "  on cl.item_id = item.id"
				+ " left join t_dictionary dic1"
				+ "  on cl.audit_result = dic1.id"
				+ " left join t_unit unit"
				+ "  on ta.target = unit.id"
				+ " where ta.deleted = '0' and ta.plan_type = 'SYS'"
				+ "  and ta.year = '" + year + "'"
				+ " group by ta.target, unit.name, dic2.id, dic2.name";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		return list;
	}
	
	private List<Object[]> getFuHeXSource(Integer year){
		String sql = "select ta.target as unitid, unit.name as unitname, dic2.id as professionid, dic2.name as professionname,"
				+ "sum(item.weight_type * 3) as source"
				+ " from a_task ta"
				+ " left join a_check ch"
				+ "  on ta.id = ch.task_id"
				+ " left join a_check_list cl"
				+ "  on ch.id = cl.check_id"
				+ " left join t_dictionary dic2"
				+ "  on ch.check_type = dic2.id"
				+ " left join a_item item"
				+ "  on cl.item_id = item.id"
				+ " left join t_dictionary dic1"
				+ "  on cl.audit_result = dic1.id"
				+ " left join t_unit unit"
				+ "  on ta.target = unit.id"
				+ " where ta.deleted = '0' and ta.plan_type = 'SYS'"
				+ "  and ta.year = '" + year + "'"
				+ " group by ta.target, unit.name, dic2.id, dic2.name";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		return list;
	}
	
	private Map<Object, List<Object[]>> groupByUnit(List<Object[]> list) {
		List<Object> ids_unit = new ArrayList<Object>();
		Map<Object, List<Object[]>> map_unit = new HashMap<Object, List<Object[]>>();
		for (Object[] o : list) {
			if (ids_unit.contains(o[0])) {
				List<Object[]> units = map_unit.get(o[0]);
				units.add(o);
			} else {
				ids_unit.add(o[0]);
				List<Object[]> units = new ArrayList<Object[]>();
				units.add(o);
				map_unit.put(o[0], units);
			}
		}
		return map_unit;
	}
	
	private List<Map<String, Object>> calculateSource(Map<Object, List<Object[]>> map_all, Map<Object, List<Object[]>> map_fhx) {
		DecimalFormat df = new DecimalFormat("0.0");
		Map<Integer, Map<String, Object>> city_maps = groupByUnitCity();
		Map<Integer, Integer> sysMap = this.getSysMap();
		List<Map<String, Object>> data_list = new ArrayList<Map<String, Object>>();
		for (Map.Entry<Object, List<Object[]>> entry : map_all.entrySet()) {
			List<Object[]> list_unit = entry.getValue();
			for (Object[] o : list_unit) {
				Map<String, Object> map_data = new HashMap<String, Object>();
				map_data.put("unitId", o[0]);
				map_data.put("unitName", o[1]);
				Map<Integer, Object> all_ProfessionSource = this.groupByProfession(list_unit);
				Map<Integer, Object> fhx_ProfessionSource = this.groupByProfession(map_fhx.get(o[0]));
				Double source = this.calculate(all_ProfessionSource, fhx_ProfessionSource, sysMap);
				map_data.put("source", df.format(source));
				Map<String, Object> city_map = city_maps.get(NumberHelper.toInteger(o[0].toString()));
				if (city_map == null) {
					map_data.put("city", "未知位置");
					map_data.put("latitude", 0.00);//纬度
					map_data.put("longitude", 0.00);	//经度
				} else {
					map_data.putAll(city_map);
				}
				data_list.add(map_data);
				break;
			}
		}
		return data_list;
	}
	
	private Double calculate(Map<Integer, Object> all_ProfessionSource,
			Map<Integer, Object> fhx_ProfessionSource, Map<Integer, Integer> sysMap) {
		Double dividend = 0.0;
		//除数
		Double divisor = this.getDivisor(all_ProfessionSource, sysMap);
		for (Entry<Integer, Object> entry : all_ProfessionSource.entrySet()) {
			//每个专业的分数
			BigDecimal fhx_source = (BigDecimal)fhx_ProfessionSource.get(entry.getKey());
			if (fhx_source != null && fhx_source.compareTo(BigDecimal.ZERO) > 0) {
				Double profession_source = (((BigDecimal)entry.getValue()).doubleValue() / fhx_source.doubleValue() * 100) * (sysMap.get(entry.getKey()) / divisor);
				dividend += profession_source;
			}
		}
		return dividend;
	}

	private Double getDivisor(Map<Integer, Object> all_ProfessionSource, Map<Integer, Integer> sysMap) {
		Double divisor = 0.0;
		for (Entry<Integer, Object> entry : all_ProfessionSource.entrySet()) {
			if (sysMap.get(entry.getKey()) != null) {
				divisor += sysMap.get(entry.getKey()).doubleValue();
			}
		}
		return divisor;
	}
	
	private Map<Integer, Object> groupByProfession(List<Object[]> list) {
		Map<Integer, Object> data_sys = new HashMap<Integer, Object>();
		for (Object[] o : list) {
			if (o[4] != null) {
				data_sys.put(((BigDecimal)o[2]).intValue(), o[4]);
			}
		}
		return data_sys;
	}
	
	private Map<Integer, Map<String, Object>> groupByUnitCity() {
		List<UnitGeographyDO> unitGeographyList = unitGeographyDao.getAllList();
		Map<Integer, Map<String, Object>> map = new HashMap<Integer, Map<String,Object>>();
		for (UnitGeographyDO unitGeography : unitGeographyList) {
				Map<String, Object> city_map = new HashMap<String, Object>();
				city_map.put("city", unitGeography.getGeography().getCity());
				city_map.put("latitude", unitGeography.getGeography().getLatitude());//纬度
				city_map.put("longitude", unitGeography.getGeography().getLongitude());	//经度
				map.put(unitGeography.getUnit().getId(), city_map);
		}
		return map;
	}
	
	private Map<Integer, Integer> getSysMap() {
		List<DictionaryDO> sys = dictionaryDao.getListByType("系统分类");
		Map<Integer, Integer> map = new HashMap<Integer, Integer>();
		for (DictionaryDO d : sys) {
			if (d.getName().indexOf("ORG") > -1) {
				map.put(d.getId(), 10);
			} else if (d.getName().indexOf("FLT") > -1) {
				map.put(d.getId(), 10);
			} else if (d.getName().indexOf("MNT") > -1) {
				map.put(d.getId(), 8);
			} else if (d.getName().indexOf("DSP") > -1) {
				map.put(d.getId(), 8);
			} else if (d.getName().indexOf("CAB") > -1) {
				map.put(d.getId(), 6);
			} else if (d.getName().indexOf("GRH") > -1) {
				map.put(d.getId(), 5);
			} else if (d.getName().indexOf("CGO") > -1) {
				map.put(d.getId(), 5);
			} else {
				map.put(d.getId(), 2);
			}
		}
		return map;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public Map<String, Object> getImproveNoticeIssue(HttpServletRequest request) throws Exception {
		Map<String, Object> result = new HashMap<String, Object>();
		int count = 0;
		List<Map<String, Object>> dataMaps = new ArrayList<Map<String, Object>>();
		Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
		Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
		//审计类型
		List<String> auditType = gson.fromJson(request.getParameter("auditType"), new TypeToken<List<String>>() {}.getType());
		if (null == auditType || auditType.isEmpty()) {
			PermissionSets permission = this.getViewImproveIssuePermission();
			auditType = this.getCheckGradeIdsForImproveIssue(permission);
		}
		if (!auditType.isEmpty()) {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			
			//版本
			List<Integer> version = gson.fromJson(request.getParameter("version"), new TypeToken<List<Integer>>() {}.getType());
			// 专业
			List<Number> profession = gson.fromJson(request.getParameter("profession"), new TypeToken<List<Number>>() {}.getType());
			// 结论
			List<Integer> auditResult = gson.fromJson(request.getParameter("auditResult"), new TypeToken<List<Integer>>() {}.getType());
			
			String checkStartDate = (StringUtils.isBlank(request.getParameter("checkStartDate"))) ? null : request.getParameter("checkStartDate");//检查开始日期
			String checkEndDate = (StringUtils.isBlank(request.getParameter("checkEndDate"))) ? null : request.getParameter("checkEndDate");//检查结束日期
			String improveStartDate = (request.getParameter("improveStartDate") == null || "".equals(request.getParameter("improveStartDate"))) ? null : request.getParameter("improveStartDate");//整改日期
			String improveEndDate = (request.getParameter("improveEndDate") == null || "".equals(request.getParameter("improveEndDate"))) ? null : request.getParameter("improveEndDate");//整改日期
			String completeStartDate = (request.getParameter("completeStartDate") == null || "".equals(request.getParameter("completeStartDate"))) ? null : request.getParameter("completeStartDate");//完成日期
			String completeEndDate = (request.getParameter("completeEndDate") == null || "".equals(request.getParameter("completeEndDate"))) ? null : request.getParameter("completeEndDate");//完成日期
			// 来源(整改通知单，现场检查，专项检查)
			List<String> source = gson.fromJson(request.getParameter("source"), new TypeToken<List<String>>() {}.getType());
			// 下级来源(局方，SAFA)
			List<String> littleSource = gson.fromJson(request.getParameter("littleSource"), new TypeToken<List<String>>() {}.getType());
			// 状态
			List<String> improveItemStatus = gson.fromJson(request.getParameter("improveItemStatus"), new TypeToken<List<String>>() {}.getType());
			// 验证结论
			List<String> confirmResult = gson.fromJson(request.getParameter("confirmResult"), new TypeToken<List<String>>() {}.getType());
			// 审计原因
			String[] auditReasonIds = gson.fromJson(request.getParameter("auditReason"), String[].class);
			List<String> operators = gson.fromJson(request.getParameter("operators"), new TypeToken<List<String>>() {}.getType());
			List<String> targets = gson.fromJson(request.getParameter("targets"), new TypeToken<List<String>>() {}.getType());
				
			StringBuffer sql = new StringBuffer();
			List<String> params = new ArrayList<String>();
			List<Object> values = new ArrayList<Object>();
			
			sql.append("select issue.id,");
			sql.append(" decode(issue.profession, null, cl.item_profession, issue.profession) as checkTypeId,");
			sql.append(" decode(proDic1.name, null, proDic2.name, proDic1.name) as checkType,");
			sql.append(" issue.improve_unit as improveUnitId,");
			sql.append(" decode(improveUnitUnit.name, null, improveUnitOrg.\"name\", improveUnitUnit.name) as improveUnit,");
			sql.append(" issue.issue_content as itemPoint,");
			sql.append(" cl.audit_result as auditResultId,");
			sql.append(" resultDic.name as auditResult,");
			sql.append(" issue.improve_dead_line as improveLastDate,");
			sql.append(" issue.completion_date as improveDate,");
			sql.append(" issue.status as improveItemStatus,");
			sql.append(" issue.completion_status as improveRemark,");
			sql.append(" issue.improve_reason as improveReason,");
			sql.append(" issue.improve_measure as improveMeasure,");
			sql.append(" issue.trace_flow_status as confirmResult,");
			sql.append(" issue.audit_reason_id as auditReasonId,");
			sql.append(" auditReason.name as auditReason,");
			sql.append(" notice.operator as operatorId,");
			sql.append(" decode(operatorUnit.name, null, operatorOrg.\"name\", operatorUnit.name) as operator,");
			sql.append(" cl.audit_record as auditRecord,");
			sql.append(" notice.check_start_date as checkStartDate,");
			sql.append(" notice.check_end_date as checkEndDate,");
			// 来源(SPOT:现场检查，SPOT:专项检查，IMPROVE_NOTICE:整改通知单)
			sql.append(" task.plan_type as source,");
			// 详细来源(SAFA,局方)
			sql.append(" notice.source as littleSource");
					
					
			sql.append(" from a_improve_notice_issue issue");
			sql.append(" inner join a_improve_notice notice");
			sql.append("  on (issue.improve_notice_id = notice.id and notice.deleted = '0' and notice.status <> 'NEW' and notice.status <> 'AUDIT_WAITING' and notice.status <> 'AUDIT_REJECTED' and notice.status is not null)");
			sql.append(" left join t_dictionary proDic1");
			sql.append("  on (issue.profession = proDic1.id)");
			sql.append(" left join a_check_list cl");
			sql.append("  on issue.check_list_id = cl.id");
			sql.append(" left join t_dictionary proDic2");
			sql.append("  on (cl.item_profession = proDic2.id)");
			sql.append(" left join t_unit improveUnitUnit");
			sql.append("  on (substr(issue.improve_unit, 3, length(issue.improve_unit)) = to_char(improveUnitUnit.id))");
			sql.append(" left join t_organization improveUnitOrg");
			sql.append("  on (substr(issue.improve_unit, 3, length(issue.improve_unit)) = to_char(improveUnitOrg.id))");
			sql.append(" left join t_dictionary resultDic");
			sql.append("  on (cl.audit_result = resultDic.id)");
			sql.append(" left join a_issue_audit_reason auditReason");
			sql.append("  on (issue.audit_reason_id = auditReason.audit_reason_id)");
			sql.append(" left join t_unit operatorUnit");
			sql.append("  on (notice.operator = operatorUnit.id)");
			sql.append(" left join t_organization operatorOrg");
			sql.append("  on (notice.operator = operatorOrg.id)");
			sql.append(" left join a_item item");
			sql.append("  on (cl.item_id = item.id)");
			sql.append(" left join a_task task");
			sql.append(" on (notice.task_id = task.id)");
			sql.append(" where issue.deleted = '0'");
			
			sql.append(" and notice.improve_notice_type in ('" + StringUtils.join(auditType, "','") + "')");//类型

			List<String> creatableOperatorIdsForImproveNotice = improveNoticeDao.getCreatableOperatorIdsForImproveNotice();
			creatableOperatorIdsForImproveNotice = this.stripImproveUnitPrefix(creatableOperatorIdsForImproveNotice);
			// 具有权限查看的operators
			Map<String, Object> viewableOperatorsAndTargets = this.getViewableOperatorsAndTargets(operators, targets, auditType);
			List<String> viewableTarget = (List<String>) viewableOperatorsAndTargets.get("targets");
			// 如果页面有传值则按照所传的值进行匹配
			if ((operators != null && !operators.isEmpty()) || (targets != null && !targets.isEmpty())) {
				if (operators != null && !operators.isEmpty()) {
					sql.append(" and (");
					boolean hasOr = false;
					// 求差集
					List<String> operatorsToTargets = (List<String>) CollectionUtils.subtract(operators, creatableOperatorIdsForImproveNotice);
					// 此时operatorsToTargets只能匹配下发给当前用户所在机构或组织的数据, 所以要加上targets条件
					if (!operatorsToTargets.isEmpty()) {
						if (viewableTarget != null && !viewableTarget.isEmpty()) {
							// 求交集
							List<String> interSectionTargets = viewableTarget;
							if (targets != null && !targets.isEmpty()) {
								interSectionTargets = (List<String>) CollectionUtils.intersection(viewableTarget, targets);
							}
							if (!interSectionTargets.isEmpty()) {
								hasOr = true;
								operatorsToTargets = this.stripImproveUnitPrefix(operatorsToTargets);
								sql.append(" (notice.operator in (:operatorsToTargets) ");
								params.add("operatorsToTargets");
								values.add(operatorsToTargets);
								sql.append(" and issue.improve_unit in (:interSectionTargets))");
								params.add("interSectionTargets");
								values.add(interSectionTargets);
							}
						} else {
							sql.append(" 1 = 0");
							hasOr = true;
						}
					}
					operators = (List<String>) CollectionUtils.subtract(operators, operatorsToTargets);
					if (!operators.isEmpty()) {
						if (hasOr) {
							sql.append(" or");
						}
						operators = this.stripImproveUnitPrefix(operators);
						sql.append(" notice.operator in (:operators) ");
						params.add("operators");
						values.add(operators);
					}
					
					sql.append(")");
				}
				if (targets != null && !targets.isEmpty()) {
					sql.append(" and issue.improve_unit in (:targets)");
					params.add("targets");
					values.add(targets);
				}
			} else {
				if (!creatableOperatorIdsForImproveNotice.isEmpty() || !viewableTarget.isEmpty()) {
					sql.append(" and (");
					if (!creatableOperatorIdsForImproveNotice.isEmpty()) {
						sql.append(" notice.operator in (:operators)");
						params.add("operators");
						values.add(creatableOperatorIdsForImproveNotice);
						
						if (!viewableTarget.isEmpty()) {
							sql.append(" or");
						}
					}
					if (!viewableTarget.isEmpty()) {
						// 求交集
						List<String> interSectionTargets = viewableTarget;
						if (targets != null && !targets.isEmpty()) {
							interSectionTargets = (List<String>) CollectionUtils.intersection(viewableTarget, targets);
						}
						if (!interSectionTargets.isEmpty()) {
							sql.append(" issue.improve_unit in (:interSectionTargets)");
							params.add("interSectionTargets");
							values.add(interSectionTargets);
						}
					}
					sql.append(" )");
				} else {
					// 如果不属于任何安监机构或组织则检索不到数据
					sql.append(" and 1 = 0");
				}
			}
			if (version != null && version.size()  > 0) {
				sql.append(" and item.version_id in (" + StringUtils.join(version, ",") + ")");//版本
			}
			if (profession != null && profession.size() > 0) {
				sql.append(" and (");
				sql.append("          cl.item_profession in (" + StringUtils.join(profession, ",") + ")");//专业
				sql.append("       or issue.profession in (" + StringUtils.join(profession, ",") + ")");//专业
				sql.append(" )");
			}
			if (auditResult != null && auditResult.size() > 0) {
				sql.append(" and cl.audit_result in (" + StringUtils.join(auditResult, ",") + ")");//检查结论
			}
			if (improveItemStatus != null && improveItemStatus.size() > 0) {
				sql.append(" and issue.status in ('" + StringUtils.join(improveItemStatus, "','") + "')"); //检查状态
			}
			if (checkStartDate != null || checkEndDate != null) {
				sql.append(" and (");
				StringBuffer startEndDateSql = new StringBuffer();
				if (checkStartDate != null && checkEndDate != null) {
					startEndDateSql.append(" or (notice.check_start_date <= to_date('" + checkEndDate + "','yyyy-MM-dd') and notice.check_start_date >= to_date('" + checkStartDate + "','yyyy-MM-dd'))");
					startEndDateSql.append(" or (notice.check_end_date <= to_date('" + checkEndDate + "','yyyy-MM-dd') and notice.check_end_date >= to_date('" + checkStartDate + "','yyyy-MM-dd'))");
				} else if (checkStartDate != null) {
					startEndDateSql.append(" or notice.check_start_date >= to_date('" + checkStartDate + "','yyyy-MM-dd')");
					startEndDateSql.append(" or notice.check_end_date >= to_date('" + checkStartDate + "','yyyy-MM-dd')");
				} else {
					startEndDateSql.append(" or notice.check_start_date <= to_date('" + checkEndDate + "','yyyy-MM-dd')");
					startEndDateSql.append(" or notice.check_end_date <= to_date('" + checkEndDate + "','yyyy-MM-dd')");
				}
				sql.append(startEndDateSql.delete(0, 3));
				sql.append(" )");
			}
			if (improveStartDate != null) {
				sql.append(" and issue.improve_dead_line >= to_date('" +improveStartDate +"', 'yyyy-MM-dd')"); // 整改日期
			}
			if (improveEndDate != null) {
				sql.append(" and issue.improve_dead_line <= to_date('"+improveEndDate+"', 'yyyy-MM-dd')");
			}
			if (completeStartDate != null) {
				sql.append(" and issue.completion_date >= to_date('"+completeStartDate+"', 'yyyy-MM-dd')"); //完成日期
			}
			if (completeEndDate != null) {
				sql.append(" and issue.completion_date <= to_date('"+completeEndDate+"', 'yyyy-MM-dd')");
			}
			if (confirmResult != null && confirmResult.size() > 0) {
				sql.append(" and issue.trace_flow_status in ('" + StringUtils.join(confirmResult, "','") + "')"); //验证状态
			}
			if (null != auditReasonIds && auditReasonIds.length > 0) {
				sql.append(" and (");
				int i = 0;
				for (String auditReasonId : auditReasonIds) {
					if (i > 0) {
						sql.append(" or ");
					}
					sql.append(" ',' || issue.AUDIT_REASON_ID || ',' like '%," + auditReasonId + ",%'");
					i++;
				}
				sql.append(" )");
			}
			if (null != source && source.size() > 0) {
				sql.append(" and (");
				sql.append(" task.plan_type in ('");
				sql.append(StringUtils.join(source, "','"));
				sql.append("')");
				if (source.contains("IMPROVE_NOTICE")) { // 整改通知单
					sql.append(" or notice.task_id is null");
				}
				sql.append(" )");
			}
			if (null != littleSource && littleSource.size() > 0) {
				sql.append(" and ");
				sql.append(" notice.source in ('");
				sql.append(StringUtils.join(littleSource, "','"));
				sql.append("')");
			}
			
			
			String ordersql = getOrderSql(request.getParameter("order"), request.getParameter("issueType"));
			if (ordersql.length() > 0) {
				sql.append(ordersql);
			}
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query = session.createSQLQuery(sql.toString());
			// 设置参数
			this.applyNamedParameterToQuery(query, params, values);
			// 分页
			if (null != start) {
				query.setFirstResult(start);
			}
			if (null != length) {
				query.setMaxResults(length);
			}
			
			List<Object[]> list = query.list();
			
			// 查询总数
			sql.insert(0, "select count(*) from (");
			sql.append(")");
			query = session.createSQLQuery(sql.toString());
			// 设置参数
			this.applyNamedParameterToQuery(query, params, values);
			count = ((BigDecimal) query.uniqueResult()).intValue();
			
			// 是否具有验证的权限
			List<Integer> editableOperatorIds = this.getEditableOperatorIdsForImproveIssue();
			for (Object[] o : list) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", ((BigDecimal) o[0]).intValue());
				map.put("checkType", o[2] == null ? "" : o[2]);
				map.put("improveUnit", o[4] == null ? "" : o[4]);
				map.put("itemPoint", o[5]);
				map.put("improveReason", o[3] == null ? "" : o[3]);//整改原因
				map.put("improveMeasure", o[4] == null ? "" : o[4]);//整改措施
				map.put("auditResult", this.reDealAuditResult((String) o[7]));
				Date improveLastDate = (Date) o[8];
				Date improveDate = (Date) o[9];
				map.put("improveLastDate", DateHelper.formatIsoDate(improveLastDate));
				map.put("improveDate", DateHelper.formatIsoDate(improveDate));
				// 逾期天数(整改完成日期-整改期限)
				Long overdueDays = DateHelper.getIntervalDays(improveLastDate, improveDate == null ? new Date() : improveDate);
				map.put("overdueDays", overdueDays == null || overdueDays <= 0 ? null : overdueDays);
						
				try {
					map.put("improveItemStatus", EnumImproveNoticeIssueStatus.getEnumByVal((String) o[10]).getDescription());
				} catch (Exception e) {
					map.put("improveItemStatus", "");
				}
				map.put("improveRemark", o[11] == null ? "" : o[11]);
				map.put("improveReason", o[12] == null ? "" : o[12]);
				map.put("improveMeasure", o[13] == null ? "" : o[13]);
				map.put("confirmResult", o[14] == null ? "" : EnumImproveNoticeIssueTraceStatus.getEnumByVal((String) o[14]).getDescription());//验证状态
				map.put("auditReason", o[16] == null ? "" : o[16]);
				map.put("operator", o[18] == null ? "" : o[18]);
				map.put("auditRecord", o[19] == null ? "" : o[19]);
				map.put("checkStartDate", DateHelper.formatIsoDate((Date) o[20]));
				map.put("checkEndDate", DateHelper.formatIsoDate((Date) o[21]));
				// 来源
				String returnSource = null;
				if (o[22] != null) {
					try {
						returnSource = EnumPlanType.getEnumByVal((String) o[22]).getDescription();
					} catch(Exception e) {
						returnSource = "未知类型";
					}
				} else {
					returnSource = "整改通知单";
				}
				map.put("source", returnSource);
				// 详细来源
				String returnLittleSource = null;
				if (o[23] != null) {
					try {
							returnLittleSource = EnumImproveSourceType.getEnumByVal((String) o[23]).getDescription();
					} catch(Exception e) {
							returnLittleSource = "未知类型";
					}
				}
				map.put("littleSource", returnLittleSource);
				map.put("editable", EnumImproveNoticeIssueStatus.COMPLETED.toString().equals((String) o[10]) && !EnumImproveNoticeIssueTraceStatus.COMFIRM_PASSED.toString().equals((String) o[14]) && editableOperatorIds.contains(Integer.valueOf((String) o[17])));
						
				dataMaps.add(map);
			}
		}
		result.put("count", count);
		result.put("data", dataMaps == null ? new ArrayList<Map<String, Object>>() : dataMaps);
		return result;
	}

	/**
	 * 获取具有权限查看的operators和targets
	 * @param operators
	 * @param targets 整改通知单时表示责任单位
	 * @param planTypes 审计类型 SYS,SUB2,SUB3
	 * @return 以operators和targets为key的map, value为String的list。targets的value带有UT或DP前缀
	 */
	public Map<String, Object> getViewableOperatorsAndTargets(List<String> operators, List<String> targets, List<String> planTypes) {
		Map<String, Object> result = new HashMap<String, Object>();
		PermissionSets permission = this.getViewImproveIssuePermission();
		if (null == planTypes || planTypes.isEmpty()) {
			planTypes = this.getCheckGradeIdsForImproveIssue(permission);
		}
		if (!planTypes.isEmpty()) {
			// operator
			if (null == operators || operators.isEmpty()) {
				operators = this.getOperatorIdsForImproveIssue(planTypes, permission);
			}
			if (!operators.isEmpty()) {
				// target对应subImproveNotice的improveUnit
				if (null == targets || targets.isEmpty()) {
					targets = this.getTargetIdsForImproveIssue(planTypes, operators, permission);
				}
				if (!targets.isEmpty()) {
					// 将operator的前缀去掉
					operators = this.stripImproveUnitPrefix(operators);
				}
			}
		}
		result.put("operators", operators);
		result.put("targets", targets);
		return result;
	}
	
	/**
	 * 去除责任单位的前缀(UT和DP)
	 * @param list
	 * @return
	 */
	public List<String> stripImproveUnitPrefix(List<String> list) {
		if (list != null && !list.isEmpty()) {
			for (int i = 0; i < list.size(); i++) {
				list.set(i, stripImproveUnitPrefix(list.get(i)));
			}
		}
		return list;
	}
	
	/**
	 * 去除责任单位的前缀(UT和DP)
	 * @param improveUnit
	 * @return
	 */
	public String stripImproveUnitPrefix(String improveUnit) {
		if (improveUnit == null) {
			return null;
		}
		if (StringUtils.startsWith(improveUnit, AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)) {
			return StringUtils.stripStart(improveUnit, AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT);
		} else if (StringUtils.startsWith(improveUnit, AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) {
			return StringUtils.stripStart(improveUnit, AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP);
		}
		return improveUnit;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public Map<String, Object> getTermIssueList(HttpServletRequest request) throws Exception {
		Map<String, Object> result = new HashMap<String, Object>();
		int count = 0;
		List<Map<String, Object>> dataMaps = new ArrayList<Map<String, Object>>();
		Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
		Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
		//审计类型
//		String auditType_ = request.getParameter("auditType");
//		List<String> auditType = gson.fromJson(auditType_, new TypeToken<List<String>>() {}.getType());
//		if (null == auditType || auditType.isEmpty()) {
//			auditType = this.getCheckGradeIdsForImproveIssue(null);
//		}
		// operator
		String operators_ = request.getParameter("operators");
		List<String> operators = gson.fromJson(operators_, new TypeToken<List<String>>() {}.getType());
		// target
		String targets_ = request.getParameter("targets");
		List<String> targets = gson.fromJson(targets_, new TypeToken<List<String>>() {}.getType());
		//版本
		String version_ = request.getParameter("version");
		List<Integer> version = gson.fromJson(version_, new TypeToken<List<Integer>>() {}.getType());
		
		// 结论
		String auditResult_ = request.getParameter("auditResult");
		List<Integer> auditResult = gson.fromJson(auditResult_, new TypeToken<List<Integer>>() {}.getType());
		
		// 整改期限
		String improveStartDate = (request.getParameter("improveStartDate") == null || "".equals(request.getParameter("improveStartDate"))) ? null : request.getParameter("improveStartDate");//整改日期
		String improveEndDate = (request.getParameter("improveEndDate") == null || "".equals(request.getParameter("improveEndDate"))) ? null : request.getParameter("improveEndDate");//整改日期
		
		StringBuffer sql = new StringBuffer();
		sql.append(" select ");
		sql.append(" cl.id,");
		sql.append(" tk.operator as operatorId,");
		sql.append(" u.name as operator,");
		sql.append(" tk.target as targetId,");
		sql.append(" terminal.airport as target,");
		sql.append(" cl.item_point as itemPoint,");
		sql.append(" cl.improve_remark as improveRemark,");
		sql.append(" cl.audit_result as auditResultId,");
		sql.append(" resultDic.name as auditResult,");
		sql.append(" cl.improve_lastdate as improveLastDate,");
		sql.append(" tk.close_Date as closeDate");
		sql.append(" from a_check_list cl");
		sql.append(" left join t_dictionary resultDic");
		sql.append(" on (cl.audit_result = resultDic.Id)");
		sql.append(" inner join a_task tk");
		sql.append(" on (cl.task_id = tk.id and tk.deleted = 0 and tk.plan_type = 'TERM')");
		sql.append(" left join t_unit u");
		sql.append(" on (tk.operator = u.id)");
		sql.append(" left join a_terminal terminal");
		sql.append(" on (tk.target = terminal.id)");
		sql.append(" left join a_item item");
		sql.append(" on (cl.item_id = item.id)");
		sql.append(" where cl.deleted = 0");
			
		if (operators != null && !operators.isEmpty()) {
			sql.append(" and tk.operator in ('" + StringUtils.join(operators, "','") + "')");
		}
		if (targets != null && !targets.isEmpty()) {
			sql.append(" and tk.target in (('" + StringUtils.join(targets, "','") + "')");
			
		}
		if (version != null && !version.isEmpty()) {
			sql.append(" and item.version_id in ((" + StringUtils.join(version, ",") + ")");//版本
		}
		if (auditResult != null && !auditResult.isEmpty()) {
			sql.append(" and cl.audit_result in (" + StringUtils.join(auditResult, ",") + ")");//检查结论
		}
		if (improveStartDate != null) {
			sql.append(" and cl.improve_lastdate >= to_date('" +improveStartDate +"', 'yyyy-MM-dd')"); // 整改日期
		}
		if (improveEndDate != null) {
			sql.append(" and cl.improve_lastdate <= to_date('"+improveEndDate+"', 'yyyy-MM-dd')");
		}
			
		String ordersql = this.getOrderSql(request.getParameter("order"), null);
		if (ordersql.length() > 0) {
			sql.append(ordersql);
		}
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		
		// 分页
		if (null != start) {
			query.setFirstResult(start);
		}
		if (null != length) {
			query.setMaxResults(length);
		}
			
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		// 查询总数
		sql.insert(0, "select count(*) from (");
		sql.append(")");
		query = session.createSQLQuery(sql.toString());
		count = ((BigDecimal) query.uniqueResult()).intValue();
			
		for (Object[] o : list) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", ((BigDecimal) o[0]).intValue());
			map.put("operator", o[2] == null ? "" : o[2]);
			map.put("target", o[4] == null ? "" : o[4]);
			map.put("itemPoint", o[5]);
			map.put("improveRemark", o[6] == null ? "" : o[6]);
			map.put("auditResult", this.reDealAuditResult((String) o[8]));
			Date improveLastDate =(Date) o[9];
			Date closeDate =(Date) o[10];
			map.put("improveLastDate", DateHelper.formatIsoDate(improveLastDate));
			Long overdueDays = DateHelper.getIntervalDays(improveLastDate, closeDate == null ? new Date() : closeDate);
			map.put("overdueDays", overdueDays == null || overdueDays <= 0 ? null : overdueDays);
			
			dataMaps.add(map);
		}
		result.put("count", count);
		result.put("data", dataMaps == null ? new ArrayList<Map<String, Object>>() : dataMaps);
		return result;
	}
	
	private String reDealAuditResult(String auditResult) {
		if (EnumAuditResult.符合项.toString().equals(auditResult)) {
			return EnumAuditResult.符合项.toString();
		} else if (EnumAuditResult.建议项.toString().equals(auditResult)) {
			return EnumAuditResult.建议项.toString();
		} else if (EnumAuditResult.有实无文.toString().equals(auditResult) || EnumAuditResult.有文无实.toString().equals(auditResult)) {
			return "一般不符合";
		} else if (EnumAuditResult.无文无实.toString().equals(auditResult)) {
			return "严重不符合";
		} else {
			return "";
		}
	}
	
	
	@SuppressWarnings("unchecked")
	private Map<String, Object> queryCheckListBySearch(HttpServletRequest request) throws ParseException {
		Map<String, Object> result = new HashMap<String, Object>();
		int count = 0;
		List<Object[]> list = null;
		PermissionSets permission = this.getViewImproveIssuePermission();
		Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
		Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
		//审计类型
		List<String> auditType = gson.fromJson(request.getParameter("auditType"), new TypeToken<List<String>>() {}.getType());
		if (null == auditType || auditType.isEmpty()) {
			auditType = this.getPlanTypeIdsForImproveIssue(permission);
		}
		if (!auditType.isEmpty()) {
			//版本
			List<Integer> version = gson.fromJson(request.getParameter("version"), new TypeToken<List<Integer>>() {}.getType());
			// 专业
			List<Number> profession = gson.fromJson(request.getParameter("profession"), new TypeToken<List<Number>>() {}.getType());
			// 责任单位
			List<String> improveUnit = gson.fromJson(request.getParameter("improveUnit"), new TypeToken<List<String>>() {}.getType());
			// 结论
			List<Integer> auditResult = gson.fromJson(request.getParameter("auditResult"), new TypeToken<List<Integer>>() {}.getType());
			
			String auditStartDate = (StringUtils.isBlank(request.getParameter("auditStartDate"))) ? null : request.getParameter("auditStartDate");//审计开始日期
			String auditEndDate = (StringUtils.isBlank(request.getParameter("auditEndDate"))) ? null : request.getParameter("auditEndDate");//审计结束日期
			String improveStartDate = (request.getParameter("improveStartDate") == null || "".equals(request.getParameter("improveStartDate"))) ? null : request.getParameter("improveStartDate");//整改日期
			String improveEndDate = (request.getParameter("improveEndDate") == null || "".equals(request.getParameter("improveEndDate"))) ? null : request.getParameter("improveEndDate");//整改日期
			String completeStartDate = (request.getParameter("completeStartDate") == null || "".equals(request.getParameter("completeStartDate"))) ? null : request.getParameter("completeStartDate");//完成日期
			String completeEndDate = (request.getParameter("completeEndDate") == null || "".equals(request.getParameter("completeEndDate"))) ? null : request.getParameter("completeEndDate");//完成日期
			// 状态
			List<Integer> improveItemStatus = gson.fromJson(request.getParameter("improveItemStatus"), new TypeToken<List<Integer>>() {}.getType());
			// 验证结论
			List<String> confirmResult = gson.fromJson(request.getParameter("confirmResult"), new TypeToken<List<String>>() {}.getType());
			// 审计原因
			String[] auditReasonIds = gson.fromJson(request.getParameter("auditReason"), String[].class);
			// operator
			List<String> operators = gson.fromJson(request.getParameter("operators"), new TypeToken<List<String>>() {}.getType());
			// target
			List<String> targets = gson.fromJson(request.getParameter("targets"), new TypeToken<List<String>>() {}.getType());
			
			String order = request.getParameter("order");
			String type = request.getParameter("issueType");
			StringBuffer sql = new StringBuffer();
			List<String> params = new ArrayList<String>();
			List<Object> values = new ArrayList<Object>();
			sql.append("select cl.id,");
			sql.append(" cl.item_profession as checkTypeId,");
			sql.append(" proDic.name as checkType,");
			sql.append(" cl.improve_unit as improveUnitId,");
			sql.append(" decode(improveUnitUnit.name, null, improveUnitOrg.\"name\", improveUnitUnit.name) as improveUnit,");
			sql.append(" cl.item_point as itemPoint,");
			sql.append(" cl.audit_result as auditResultId,");
			sql.append(" resultDic.name as auditResult,");
			sql.append(" cl.improve_lastdate as improveLastDate,");
			sql.append(" cl.improve_date as improveDate,");
			sql.append(" cl.improve_item_status as improveItemStatus,");
			sql.append(" cl.improve_remark as improveRemark,");
			sql.append(" cl.improve_reason as improveReason,");
			sql.append(" cl.improve_measure as improveMeasure,");
			sql.append(" cl.confirm_result as confirmResult,");
			sql.append(" cl.audit_reason_id as auditReasonId,");
			sql.append(" auditReason.name as auditReason,");
			sql.append(" task.operator as operatorId,");
			sql.append(" decode(operatorUnit.name, null, operatorOrg.\"name\", operatorUnit.name) as operator,");
			sql.append(" task.target as targetId,");
			sql.append(" decode(targetUnit.name, null, targetOrg.\"name\", targetUnit.name) as target,");
			sql.append(" cl.audit_record as auditRecord,");
			sql.append(" task.start_date as auditStartDate,");
			sql.append(" task.end_date as auditEndDate");
			sql.append(" from a_check_list cl");
			sql.append(" inner join a_task task");
			sql.append("   on (cl.task_id = task.id and task.deleted = '0')");
			sql.append(" left join t_dictionary proDic");
			sql.append("   on (cl.item_profession = proDic.id)");
			sql.append(" left join t_unit improveUnitUnit");
			sql.append("   on (substr(cl.improve_unit, 3, length(cl.improve_unit)) = improveUnitUnit.id)");
			sql.append(" left join t_organization improveUnitOrg");
			sql.append("   on (substr(cl.improve_unit, 3, length(cl.improve_unit)) = improveUnitOrg.id)");
			sql.append(" left join t_dictionary resultDic");
			sql.append("   on (cl.audit_result = resultDic.id)");
			sql.append(" left join a_check_list_audit_reason auditReason");
			sql.append("   on (cl.audit_reason_id = auditReason.audit_reason_id)");
			sql.append(" left join t_unit operatorUnit");
			sql.append("   on (task.operator = operatorUnit.id)");
			sql.append(" left join t_organization operatorOrg");
			sql.append("   on (task.operator = operatorOrg.id)");
			sql.append(" left join t_unit targetUnit");
			sql.append("   on (task.target = targetUnit.id)");
			sql.append(" left join t_organization targetOrg");
			sql.append("   on (task.target = targetOrg.id)");
			sql.append(" inner join a_plan plan");
			sql.append("   on (task.plan_id = plan.id and plan.deleted = '0')");
			sql.append(" left join a_item item");
			sql.append("   on cl.item_id = item.id");
			sql.append(" where cl.deleted = '0' and cl.improve_item_status is not null");
			
			sql.append(" and task.plan_type in ('" + StringUtils.join(auditType, "','") + "')");
			
			List<String> creatableOperatorIdsForAudit = this.getCreatableOperatorIdsForAudit();
			creatableOperatorIdsForAudit = this.stripImproveUnitPrefix(creatableOperatorIdsForAudit);
			Map<String, Object> viewableOperatorsAndTargets = this.getViewableOperatorsAndTargets(operators, targets, auditType);
			List<String> viewableTarget = (List<String>) viewableOperatorsAndTargets.get("targets");
			// 如果页面有传值则按照所传的值进行匹配
			if ((operators != null && !operators.isEmpty()) || (targets != null && !targets.isEmpty())) {
				if (operators != null && !operators.isEmpty()) {
					sql.append(" and (");
					boolean hasOr = false;
					// 求差集
					List<String> operatorsToTargets = (List<String>) CollectionUtils.subtract(operators, creatableOperatorIdsForAudit);
					// 此时operatorsToTargets只能匹配下发给当前用户所在机构或组织的数据, 所以要加上targets条件
					if (!operatorsToTargets.isEmpty()) {
						if (viewableTarget != null && !viewableTarget.isEmpty()) {
							// 求交集
							List<String> interSectionTargets = viewableTarget;
							if (targets != null && !targets.isEmpty()) {
								interSectionTargets = (List<String>) CollectionUtils.intersection(viewableTarget, targets);
							}
							if (!interSectionTargets.isEmpty()) {
								hasOr = true;
								operatorsToTargets = this.stripImproveUnitPrefix(operatorsToTargets);
								interSectionTargets = this.stripImproveUnitPrefix(interSectionTargets);
								sql.append(" (task.operator in (:operatorsToTargets) ");
								params.add("operatorsToTargets");
								values.add(operatorsToTargets);
								sql.append(" and task.target in (:interSectionTargets))");
								params.add("interSectionTargets");
								values.add(interSectionTargets);
							}
						}
					}
					operators = (List<String>) CollectionUtils.subtract(operators, operatorsToTargets);
					if (!operators.isEmpty()) {
						if (hasOr) {
							sql.append(" or");
						}
						operators = this.stripImproveUnitPrefix(operators);
						sql.append(" task.operator in (:operators) ");
						params.add("operators");
						values.add(operators);
					}
					
					sql.append(")");
				}
				if (targets != null && !targets.isEmpty()) {
					targets = this.stripImproveUnitPrefix(targets);
					sql.append(" and task.target in (:targets)");
					params.add("targets");
					values.add(targets);
				}
			} else {
				if (!creatableOperatorIdsForAudit.isEmpty() || !viewableTarget.isEmpty()) {
					sql.append(" and (");
					if (!creatableOperatorIdsForAudit.isEmpty()) {
						sql.append(" task.operator in (:operators)");
						params.add("operators");
						values.add(creatableOperatorIdsForAudit);
						
						if (!viewableTarget.isEmpty()) {
							sql.append(" or");
						}
					}
					if (!viewableTarget.isEmpty()) {
						// 求交集
						List<String> interSectionTargets = viewableTarget;
						if (targets != null && !targets.isEmpty()) {
							interSectionTargets = (List<String>) CollectionUtils.intersection(viewableTarget, targets);
						}
						if (!interSectionTargets.isEmpty()) {
							interSectionTargets = this.stripImproveUnitPrefix(interSectionTargets);
							sql.append(" task.target in (:interSectionTargets)");
							params.add("interSectionTargets");
							values.add(interSectionTargets);
						}
					}
					sql.append(" )");
				} else {
					// 如果不属于任何安监机构或组织则检索不到数据
					sql.append(" and 1 = 0");
				}
			}
					
			if (version != null && version.size() > 0) {
				sql.append(" and item.version_id in (" + StringUtils.join(version, ",") + ")");
			}
			if (profession != null && profession.size() > 0) {
				sql.append(" and cl.item_profession in (" + StringUtils.join(profession, ",") + ")");
			}
			if (improveUnit != null && improveUnit.size() > 0) {
				sql.append(" and cl.improve_unit in ('" + StringUtils.join(improveUnit, "','") + "')");
			}
			if (auditResult != null && auditResult.size() > 0) {
				sql.append(" and cl.audit_result in (" + StringUtils.join(auditResult, ",") + ")");
			}
			if (auditStartDate != null || auditEndDate != null) {
				sql.append(" and (");
				StringBuffer startEndDateSql = new StringBuffer();
				if (auditStartDate != null && auditEndDate != null) {
					startEndDateSql.append(" or (task.start_date <= to_date('" + auditEndDate + "','yyyy-MM-dd') and task.start_date >= to_date('" + auditStartDate + "','yyyy-MM-dd'))");
					startEndDateSql.append(" or (task.end_date <= to_date('" + auditEndDate + "','yyyy-MM-dd') and task.end_date >= to_date('" + auditStartDate + "','yyyy-MM-dd'))");
				} else if (auditStartDate != null) {
					startEndDateSql.append(" or task.start_date >= to_date('" + auditStartDate + "','yyyy-MM-dd')");
					startEndDateSql.append(" or task.end_date >= to_date('" + auditStartDate + "','yyyy-MM-dd')");
				} else {
					startEndDateSql.append(" or task.start_date <= to_date('" + auditEndDate + "','yyyy-MM-dd')");
					startEndDateSql.append(" or task.end_date <= to_date('" + auditEndDate + "','yyyy-MM-dd')");
				}
				sql.append(startEndDateSql.delete(0, 3));
				sql.append(" )");
			}
			if (improveStartDate != null) {
				sql.append(" and cl.improve_lastdate >= to_date('" + improveStartDate + "','yyyy-MM-dd')");
			}
			if (improveEndDate != null) {
				sql.append(" and cl.improve_lastdate <= to_date('" + improveEndDate + "','yyyy-MM-dd')");
			}
			if (completeStartDate != null) {
				sql.append(" and cl.improve_date >= to_date('"+completeStartDate+"','yyyy-MM-dd')");
			}
			if (completeEndDate != null) {
				sql.append(" and cl.improve_date <= to_date('"+completeEndDate+"','yyyy-MM-dd')");
			}
			if (improveItemStatus != null && improveItemStatus.size() > 0) {
				sql.append(" and cl.improve_item_status in (" + StringUtils.join(improveItemStatus, ",") + ")");
			}
			if (confirmResult != null && confirmResult.size() > 0) {
				sql.append(" and cl.confirm_result in ('" + StringUtils.join(confirmResult, "','") + "')");
			}
			if (null != auditReasonIds && auditReasonIds.length > 0) {
				sql.append(" and (");
				int i = 0;
				for (String auditReasonId : auditReasonIds) {
					if (i > 0) {
						sql.append(" or ");
					}
					sql.append(" ',' || cl.audit_reason_id || ',' like '%," + auditReasonId + ",%'");
					i++;
				}
				sql.append(" )");
			}
			String ordersql = getOrderSql(order, type);
			if (ordersql.length() > 0) {
				sql.append(ordersql);
			}
			
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query = session.createSQLQuery(sql.toString());
			// 设置参数
			this.applyNamedParameterToQuery(query, params, values);
			// 分页
			if (null != start) {
				query.setFirstResult(start);
			}
			if (null != length) {
				query.setMaxResults(length);
			}
			list = query.list();
			// 查询总数
			sql.insert(0, "select count(*) from (");
			sql.append(")");
			query = session.createSQLQuery(sql.toString());
			// 设置参数
			this.applyNamedParameterToQuery(query, params, values);
			count = ((BigDecimal) query.uniqueResult()).intValue();
		}
		result.put("count", count);
		result.put("data", list == null ? new ArrayList<Object[]>() : list);
		return result;
	}
	
	private void applyNamedParameterToQuery(Query query, List<String> params, List<Object> values) {
		// 设置参数
		for (int i = 0; i < params.size(); i++) {
			if (values.get(i) instanceof Collection) {
				query.setParameterList(params.get(i), (Collection<?>) values.get(i));
			} else {
				query.setParameter(params.get(i), values.get(i));
			}
		}
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public Map<String, Object> getImproveIssueList(HttpServletRequest request) throws Exception {
		Map<String, Object> result = this.queryCheckListBySearch(request);
		@SuppressWarnings("unchecked")
		List<Object[]> checkLists = (List<Object[]>) result.get("data");
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		if (!checkLists.isEmpty()) {
//			Map<Object, Object> sys = getSysMap();
//			Map<Object, Object> auditResultDic = getAuditResult();
//			Map<String, Object> units = this.getAllUnits();
//			Map<String, Object> organizations = this.getAllOrganizations();
//			Map<String, Object> auditReason = getAuditReason();
			
			List<Integer> editableOperatorIds = this.getEditableOperatorIdsForImproveIssue();
			for (Object[] o : checkLists) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", ((BigDecimal) o[0]).intValue());
				map.put("checkType", o[2] == null ? "" : o[2]);
				map.put("improveUnit", o[4] == null ? "" : o[4]);
				map.put("itemPoint", o[5] == null ? "" : o[5]);
				map.put("auditResult", this.reDealAuditResult((String) o[7]));
				Date improveLastDate = (Date) o[8];
				Date improveDate = (Date) o[9];
				map.put("improveLastDate", DateHelper.formatIsoDate(improveLastDate));
				map.put("improveDate", DateHelper.formatIsoDate(improveDate));
				// 逾期天数(整改完成日期-整改期限)
				Long overdueDays = DateHelper.getIntervalDays(improveLastDate, improveDate == null ? new Date() : improveDate);
				map.put("overdueDays", overdueDays == null || overdueDays <= 0 ? null : overdueDays);
				try {
					map.put("improveItemStatus", EnumImproveItemStatus.getEnumByCode(((BigDecimal)o[10]).intValue()));
				} catch (Exception e) {
					map.put("improveItemStatus", "");
				}
				map.put("improveRemark", o[11] == null ? "" : o[11]);
				map.put("improveReason", o[12] == null ? "" : o[12]);
				map.put("improveMeasure", o[13] == null ? "" : o[13]);
				map.put("confirmResult", o[14] == null ? "" : EnumConfirmResult.getEnumByVal((String)o[14]).getDescription());//验证状态
				map.put("auditReason", o[16] == null ? "" : o[16]);
				map.put("operator", o[18] == null ? "" : o[18]);
				map.put("target", o[20] == null ? "" : o[20]);
				map.put("auditRecord", o[21] == null ? "" : o[21]);
				map.put("auditStartDate", DateHelper.formatIsoDate((Date) o[22]));
				map.put("auditEndDate", DateHelper.formatIsoDate((Date) o[23]));
				
				// 是否具有验证的权限
				map.put("editable", o[10] != null && EnumImproveItemStatus.整改完成.getCode() == ((BigDecimal) o[10]).intValue() && !EnumConfirmResult.COMFIRM_PASSED.toString().equals((String) o[14]) && editableOperatorIds.contains(Integer.valueOf((String) o[17])));
				
				list.add(map);
			}
			// 排序
//			if (null != order && !order.isEmpty()) {
//				Entry<String, Object> entry = order.entrySet().iterator().next();
//				this.sortMapListByKey(list, entry.getKey(), "desc".equals(entry.getValue()) ? false : true);
//			}

		}
		result.put("data", list);
		return result;
	}
	
	private String getOrderSql(String order, String type) {
		//order {"id":"desc"}
//		Map<String, String> fileds = facOrderFileds(type);
		String sql = "";
		if (order != null && !"".equals(order)) {
			Map<String, Object> map = gson.fromJson(order, new TypeToken<Map<String, Object>>() {}.getType());
			for (Map.Entry<String, Object> entry : map.entrySet()) {
				sql += " order by ";
				sql += entry.getKey();
				sql += " ";
				sql += entry.getValue();
			}
		}
		return sql;
	}
	
	/**
	 * 获取当前用户能够创建审计计划的operator
	 * @return list 以UT开头的为安监机构的id, 以DP开头的为组织的id
	 */
	public List<String> getCreatableOperatorIdsForAudit() {
		Map<String, Object> map = this.getCreatableOperatorsMapForAudit();
		return this.addPrefixForUnitAndOrgIds(map);
	}
	
	/**
	 * 获取当前用户能够创建审计计划的operator的map
	 * @return Map key为UT的表示安监机构，key为DP的表示组织
	 */
	public Map<String, Object> getCreatableOperatorsMapForAudit() {
		Map<String, Object> map = new HashMap<String, Object>();
		List<Integer> unitIds = new ArrayList<Integer>();
		List<Integer> orgIds = new ArrayList<Integer>();
		if (permissionSetDao.hasPermission(PermissionSets.ADD_SYS_PLAN.getName())) {
			unitIds = unitDao.getAllUnitIds(null);
			orgIds = organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", unitIds, null, null);
		} else {
			// 能够创建分子公司的审计计划的安监机构
			unitIds = permissionSetDao.getPermittedUnitIdsByUnitName(UserContext.getUserId(), null, PermissionSets.ADD_SUB_PLAN.getName());
			if (!unitIds.isEmpty()) {
				orgIds = organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", unitIds, null, null);
			} else {
				orgIds = permissionSetDao.getPermittedOrgIdsByOrgName(UserContext.getUserId(), null, PermissionSets.ADD_SUB3_PLAN.getName());
			}
		}
		map.put(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, unitIds);
		map.put(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, orgIds);
		return map;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getCheckListBar(String auditType, String operator, String profession, String chapter, String startDate_, String endDate_, List<Integer> target, List<Integer> checklist) throws Exception {
		StringBuffer sql = new StringBuffer("select count(*), item.point, item.id as itemid, dic.id as resultid, dic.name as resultname"
				+ " from a_check_list cl" 
				+ " left join t_dictionary dic"
				+ "   on cl.audit_result = dic.id"
				+ " left join a_task ta"
				+ "   on cl.task_id = ta.id" 
				+ " left join a_item item"
				+ "   on cl.item_id = item.id" 
				+ " where cl.deleted = '0'");
		if (auditType != null && !"".equals(auditType)) {
			sql.append(" and ta.plan_type = '" + auditType + "'");
		}
		if (operator != null && !"".equals(operator)) {
			sql.append(" and ta.operator = '" + operator + "'");
		}
		if (profession != null && !"".equals(profession)) {
			sql.append(" and item.profession_id = " + profession);
		}
		if (checklist.size() > 0) {
			sql.append(" and cl.item_id in (" + StringUtils.join(checklist, ",") + ")");
		}
		if (chapter != null && !"".equals(chapter)) {
			sql.append(" and item.parent_id = " + NumberHelper.toInteger(chapter));
		}
		if (startDate_ != null && !"".equals(startDate_)) {
			sql.append(" and ta.generate_report_date >= to_date('" + startDate_ + "', 'yyyy-MM-dd')");
		}
		if (endDate_ != null && !"".equals(endDate_)) {
			sql.append(" and ta.generate_report_date <= to_date('" + endDate_ + "', 'yyyy-MM-dd')");
		}
		if (target.size() > 0) {
			sql.append(" and ta.target in (" + StringUtils.join(target, ",") + ")");
		}
		sql.append(" group by item.point, item.id, dic.id, dic.name");
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		List<Map<String, Object>> data = new ArrayList<Map<String,Object>>();
		List<Integer> ids = new ArrayList<Integer>(checklist);
		if (chapter != null && !"".equals(chapter) && checklist.size() == 0) {
			ids = this.getallids(NumberHelper.toInteger(chapter));
		}
		for (Object[] o : list) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", o[2]);
			map.put("value", o[0]);
			map.put("name", o[1]);
			map.put("auditResultId", o[3]);
			map.put("auditResultName", o[4]);
			ids = this.removeElement(((BigDecimal)o[2]).intValue(), ids);
			data.add(map);
		}
		List<Map<String, Object>> dataall = this.getCheckLists(ids);
		data.addAll(dataall);
		return this.getSortInteger(data);
	}

	private List<Integer> getallids(Integer parent) {
		String sql = "select id from a_item where deleted = '0' and parent_id = " + parent;
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		@SuppressWarnings("unchecked")
		List<Object> list = query.list();
		List<Integer> data = new ArrayList<Integer>();
		for (Object o : list) {
			data.add(((BigDecimal)o).intValue());
		}
		return data;
	}
	
	private List<Map<String,Object>> getSortInteger(List<Map<String,Object>> list){
		Collections.sort(list, new Comparator<Map<String,Object>>(){
			@Override
			public int compare(Map<String, Object> o1,Map<String, Object> o2) {
				String value1 = (String) o1.get("name");
				String value2 = (String) o2.get("name");
				return value1.compareTo(value2);
			}
		});
		return list;
	}
	private List<Integer> removeElement(Integer id, List<Integer> ids) {
		List<Integer> data = new ArrayList<Integer>();
		for (Integer i : ids) {
			if (!i.equals(id)) {
				data.add(i);
			}
		}
		return data;
	}
	
	private List<Map<String, Object>> getCheckLists(List<Integer> checklists) {
		List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
		if (checklists.size() > 0) {
			String sql = "select t.id, t.point from a_item t where t.id in (" + StringUtils.join(checklists, ",") + ")";
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query = session.createSQLQuery(sql.toString());
			@SuppressWarnings("unchecked")
			List<Object[]> list = query.list();
			for (Object[] o : list) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("value", 0);
				map.put("id", ((BigDecimal)o[0]).intValue());
				map.put("name", o[1]);
				map.put("auditResultId", null);
				map.put("auditResultName", null);
				data.add(map);
			}
		}
		return data;
	}
	
	/**
	 * 审计结论的条数按审计报告时间分组
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getAdtRstCntGroupByAdtRptDate(List<String> operators, List<String> targets, List<Integer> professions, String planType,  String checkType, List<String> years) throws Exception {
		List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
		StringBuffer sql = new StringBuffer();
		sql.append("select to_char(t.generate_report_date,'yyyy') as year, cl.audit_result as auditResult, count(cl.audit_result) as cnt");
		sql.append(" from a_check_list cl inner join a_task t on (cl.task_id = t.id and t.deleted = '0')");
		sql.append(" inner join a_plan p on (p.id = t.plan_id and p.deleted = '0')");
		sql.append(" where cl.deleted = '0'");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		if (null != operators && !operators.isEmpty()) {
			sql.append("   and t.operator in (:operators)");
			params.add("operators");
			values.add(operators);
		}
		if (null != targets && !targets.isEmpty()) {
			sql.append("   and t.target in (:targets)");
			params.add("targets");
			values.add(targets);
		}
		if (null != professions && !professions.isEmpty()) {
			sql.append(" and cl.item_profession in (:professions)");
			params.add("professions");
			values.add(professions);
		}
		if (null != planType) {
			sql.append("   and t.plan_type = :planType");
			params.add("planType");
			values.add(planType);
		}
		if (null != checkType) {
			sql.append("   and t.check_type = :checkType");
			params.add("checkType");
			values.add(checkType);
		}
		sql.append("   and to_char(t.generate_report_date,'yyyy') in (:years)");
		params.add("years");
		values.add(years);

		sql.append(" group by to_char(t.generate_report_date,'yyyy'), cl.audit_result");
		
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		for (int i = 0; i < params.size(); i++) {
			if (values.get(i) instanceof Collection) {
				query.setParameterList(params.get(i), (Collection<?>) values.get(i));
			} else {
				query.setParameter(params.get(i), values.get(i));
			}
		}
		
		query.addScalar("year", StandardBasicTypes.STRING);
		query.addScalar("auditResult", StandardBasicTypes.INTEGER);
		query.addScalar("cnt", StandardBasicTypes.INTEGER);

		List<Object[]> list = query.list();
		// 按年份分组
		Map<Integer, Object> auditResultMap = new HashMap<Integer, Object>();
		for (Object[] o : list) {
			String year =(String) o[0];
			Integer auditResultId =(Integer) o[1];
			Integer cnt =((Integer) o[2]);
			// key 为auditresult的id,value为cnt
			Map<String, Integer> yearMap = null;
			if (auditResultMap.containsKey(auditResultId)) {
				yearMap = (Map<String, Integer>) auditResultMap.get(auditResultId);
				yearMap.put(year, cnt);
			} else {
				yearMap = new HashMap<String, Integer>();
				yearMap.put(year, cnt);
				auditResultMap.put(auditResultId, yearMap);
			}
		}
		
		List<DictionaryDO> dics = dictionaryDao.getListByType("审计结论");
		for (DictionaryDO dic : dics) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", dic.getId());
			map.put("name", dic.getName());
			List<Integer> vals = new ArrayList<Integer>(); 
			for (String year : years){
				if (auditResultMap.containsKey(dic.getId())) {
					Map<String, Integer> yearMap = (Map<String, Integer>) auditResultMap.get(dic.getId());
					if (yearMap.containsKey(year.toString())) {
						vals.add(yearMap.get(year.toString()));
					} else {
						vals.add(0);
					}
				} else {
					vals.add(0);
				}
			}
			map.put("value", vals);
			result.add(map);
		}
		return result;
	}

	/**
	 * 审计结论的条数按被执行单位分组
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getAdtRstCntGroupByTarget(List<String> operators, List<String> targets, List<Integer> professions, String planType, String checkType, Date startDate, Date endDate) throws Exception {
		List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
		StringBuffer sql = new StringBuffer();
		sql.append("select t.target as target, cl.audit_result as auditResult, count(cl.audit_result) as cnt");
		sql.append(" from a_check_list cl inner join a_task t on (cl.task_id = t.id and t.deleted = '0')");
		sql.append(" inner join a_plan p on (p.id = t.plan_id and p.deleted = '0')");
		sql.append(" where cl.deleted = '0'");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		if (null != operators && !operators.isEmpty()) {
			sql.append("   and t.operator in (:operators)");
			params.add("operators");
			values.add(operators);
		}
		sql.append("   and t.target in (:targets)");
		params.add("targets");
		values.add(targets);
		if (null != professions && !professions.isEmpty()) {
			sql.append(" and cl.item_profession in (:professions)");
			params.add("professions");
			values.add(professions);
		}
		if (null != planType) {
			sql.append("   and t.plan_type = :planType");
			params.add("planType");
			values.add(planType);
		}
		if (null != checkType) {
			sql.append("   and t.check_type = :checkType");
			params.add("checkType");
			values.add(checkType);
		}
		if (null != startDate) {
			sql.append("   and t.generate_report_date >= :startDate");
			params.add("startDate");
			values.add(startDate);
		}
		if (null != startDate) {
			sql.append("   and t.generate_report_date < :endDate");
			params.add("endDate");
			Calendar cal = DateHelper.getCalendar();
			cal.setTime(endDate);
			cal.add(Calendar.DAY_OF_MONTH, 1);
			values.add(cal.getTime());
		}

		sql.append(" group by t.target, cl.audit_result");
		
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		for (int i = 0; i < params.size(); i++) {
			if (values.get(i) instanceof Collection) {
				query.setParameterList(params.get(i), (Collection<?>) values.get(i));
			} else {
				query.setParameter(params.get(i), values.get(i));
			}
		}
		
		query.addScalar("target", StandardBasicTypes.STRING);
		query.addScalar("auditResult", StandardBasicTypes.INTEGER);
		query.addScalar("cnt", StandardBasicTypes.INTEGER);

		List<Object[]> list = query.list();
		// 按年份分组
		Map<Integer, Object> auditResultMap = new HashMap<Integer, Object>();
		for (Object[] o : list) {
			String target =(String) o[0];
			Integer auditResultId =(Integer) o[1];
			Integer cnt =((Integer) o[2]);
			// key 为auditresult的id,value为cnt
			Map<String, Integer> targetMap = null;
			if (auditResultMap.containsKey(auditResultId)) {
				targetMap = (Map<String, Integer>) auditResultMap.get(auditResultId);
				targetMap.put(target, cnt);
			} else {
				targetMap = new HashMap<String, Integer>();
				targetMap.put(target, cnt);
				auditResultMap.put(auditResultId, targetMap);
			}
		}
		
		List<DictionaryDO> dics = dictionaryDao.getListByType("审计结论");
		for (DictionaryDO dic : dics) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", dic.getId());
			map.put("name", dic.getName());
			List<Integer> vals = new ArrayList<Integer>(); 
			for (String target : targets){
				if (auditResultMap.containsKey(dic.getId())) {
					Map<String, Integer> targetMap = (Map<String, Integer>) auditResultMap.get(dic.getId());
					if (targetMap.containsKey(target)) {
						vals.add(targetMap.get(target));
					} else {
						vals.add(0);
					}
				} else {
					vals.add(0);
				}
			}
			map.put("value", vals);
			result.add(map);
		}
		return result;
	}

	/**
	 * 审计结论的条数按专业分组
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getAdtRstCntGroupByProfession(List<String> operators, List<String> targets, List<Integer> professions, String planType, String checkType, Date startDate, Date endDate) throws Exception {
		List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
		StringBuffer sql = new StringBuffer();
		sql.append("select cl.item_profession as profession, cl.audit_result as auditResult, count(cl.audit_result) as cnt");
		sql.append(" from a_check_list cl inner join a_task t on (cl.task_id = t.id and t.deleted = '0')");
		sql.append(" inner join a_plan p on (p.id = t.plan_id and p.deleted = '0')");
		sql.append(" where cl.deleted = '0'");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		sql.append(" and cl.item_profession in (:professions)");
		params.add("professions");
		values.add(professions);
		
		if (null != operators && !operators.isEmpty()) {
			sql.append("   and t.operator in (:operators)");
			params.add("operators");
			values.add(operators);
		}
		if (null != targets && !targets.isEmpty()) {
			sql.append("   and t.target in (:targets)");
			params.add("targets");
			values.add(targets);
		}
		if (null != planType) {
			sql.append("   and t.plan_type = :planType");
			params.add("planType");
			values.add(planType);
		}
		if (null != checkType) {
			sql.append("   and t.check_type = :checkType");
			params.add("checkType");
			values.add(checkType);
		}
		if (null != startDate) {
			sql.append("   and t.generate_report_date >= :startDate");
			params.add("startDate");
			values.add(startDate);
		}
		if (null != endDate) {
			sql.append("   and t.generate_report_date < :endDate");
			params.add("endDate");
			Calendar cal = DateHelper.getCalendar();
			cal.setTime(endDate);
			cal.add(Calendar.DAY_OF_MONTH, 1);
			values.add(cal.getTime());
		}
		
		sql.append(" group by cl.item_profession, cl.audit_result");
		
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		for (int i = 0; i < params.size(); i++) {
			if (values.get(i) instanceof Collection) {
				query.setParameterList(params.get(i), (Collection<?>) values.get(i));
			} else {
				query.setParameter(params.get(i), values.get(i));
			}
		}
		
		query.addScalar("profession", StandardBasicTypes.INTEGER);
		query.addScalar("auditResult", StandardBasicTypes.INTEGER);
		query.addScalar("cnt", StandardBasicTypes.INTEGER);
		
		List<Object[]> list = query.list();
		// 按专业分组
		Map<Integer, Object> auditResultMap = new HashMap<Integer, Object>();
		for (Object[] o : list) {
			Integer professionId =(Integer) o[0];
			Integer auditResultId =(Integer) o[1];
			Integer cnt =((Integer) o[2]);
			// key 为auditresult的id,value为cnt
			Map<Integer, Integer> perfessionMap = null;
			if (auditResultMap.containsKey(auditResultId)) {
				perfessionMap = (Map<Integer, Integer>) auditResultMap.get(auditResultId);
				perfessionMap.put(professionId, cnt);
			} else {
				perfessionMap = new HashMap<Integer, Integer>();
				perfessionMap.put(professionId, cnt);
				auditResultMap.put(auditResultId, perfessionMap);
			}
		}
		
		List<DictionaryDO> dics = dictionaryDao.getListByType("审计结论");
		for (DictionaryDO dic : dics) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", dic.getId());
			map.put("name", dic.getName());
			List<Integer> vals = new ArrayList<Integer>(); 
			for (Integer profession : professions){
				if (auditResultMap.containsKey(dic.getId())) {
					Map<Integer, Integer> perfessionMap = (Map<Integer, Integer>) auditResultMap.get(dic.getId());
					if (perfessionMap.containsKey(profession)) {
						vals.add(perfessionMap.get(profession));
					} else {
						vals.add(0);
					}
				} else {
					vals.add(0);
				}
			}
			map.put("value", vals);
			result.add(map);
		}
		return result;
	}

	/**
	 * 获取执行单位
	 * @param planType
	 * @param checkType
	 * @return
	 */
	public List<Map<String, Object>> getAuditReportOperators(String planType, String checkType, String name) {
		List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
		if (EnumPlanType.SYS.toString().equals(planType) || EnumCheckGrade.SYS.toString().equals(checkType) || EnumPlanType.TERM.toString().equals(planType)) { // 系统级时返回安全监察部
			UnitDO unit = unitDao.getAnJianBu(true);
			if (null != unit) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", unit.getId());
				map.put("name", unit.getName());
				result.add(map);
			}
		} else if (EnumPlanType.SUB2.toString().equals(planType) || EnumCheckGrade.SUB2.toString().equals(checkType)) { // 分子公司级返回除了安全监察部之外的所有安监机构
			UnitDO unit = unitDao.getAnJianBu(true);
			List<UnitDO> units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName(), name);
			units.remove(unit);
			result = unitDao.convert(units, Arrays.asList(new String[]{"id", "name"}), false);
		} else if (EnumPlanType.SUB3.toString().equals(planType)) { // 部门三级时,下拉安监机构下的组织
			List<UnitDO> units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName(), name);
			result = organizationDao.convert(organizationDao.getByOlevelAndUnits("3", units), Arrays.asList(new String[]{"id", "name"}), false);
		}
		if (!StringUtils.isBlank(name)) {
			Iterator<Map<String, Object>> iterator = result.iterator();
			while (iterator.hasNext()) {
				Map<String, Object> map = iterator.next();
				if (null == map.get("name") || !StringUtils.containsIgnoreCase((String) map.get("name"), name)){
					iterator.remove();
				}
			}
		}
		// 按名称排序
		this.sortMapListByKey(result, "name", true);
		return result;
	}
	
	/**
	 * 获取被执行单位
	 * @param planType
	 * @param checkType
	 * @return
	 */
	public List<Map<String, Object>> getAuditReportTargets(String planType, String checkType, List<String> operators, List<String> targets, String name) {
		List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
		if (EnumPlanType.SPOT.toString().equals(planType)) {
			List<DictionaryDO> dics = null;
			if (null != targets && !targets.isEmpty()) {
				dics = dictionaryDao.internalGetByIds(targets.toArray(new String[0]));
			} else {
				dics = dictionaryDao.getListByType("现场检查");
			}
			result = dictionaryDao.convert(dics, Arrays.asList(new String[]{"id", "name"}), false);
		} else if (EnumPlanType.SYS.toString().equals(planType) || EnumCheckGrade.SYS.toString().equals(checkType)) { // 系统级时返回安全监察部之外的所有安监机构
			UnitDO unit = unitDao.getAnJianBu(true);
			List<UnitDO> units = null;
			if (null != targets && !targets.isEmpty()) {
				units = unitDao.internalGetByIds(targets.toArray(new String[0]));
			} else {
				units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName(), name);
			}
			units.remove(unit);
			result = unitDao.convert(units, Arrays.asList(new String[]{"id", "name"}), false);
		} else if (EnumPlanType.SUB2.toString().equals(planType) || EnumCheckGrade.SUB2.toString().equals(checkType)) { // 分子公司级返回operator对应的组织
			List<OrganizationDO> orgs = null;
			if (null != targets && !targets.isEmpty()) {
				orgs = organizationDao.internalGetByIds(targets.toArray(new String[0]));
			} else {
				List<Integer> unitIds = new ArrayList<Integer>();
				if (null == operators || operators.isEmpty()) { // 查询所有的operator
					unitIds = unitDao.getUnitIds(PermissionSets.VIEW_UNIT.getName(), null);
					UnitDO unit = unitDao.getAnJianBu(true);
					unitIds.remove(unit.getId());
				} else {
					for (String operator : operators) {
						unitIds.add(Integer.parseInt(operator));
					}
				}
				orgs = organizationDao.getByOlevelAndUnitIds("3", unitIds);
			}
			result = organizationDao.convert(orgs, Arrays.asList(new String[]{"id", "name"}), false);
		} else if (EnumPlanType.SUB3.toString().equals(planType)) {
			List<OrganizationDO> orgs = null;
			if (null != targets && !targets.isEmpty()) {
				orgs = organizationDao.internalGetByIds(targets.toArray(new String[0]));
			} else {
				List<Integer> parentOrgIds = new ArrayList<Integer>();
				if (null == operators || operators.isEmpty()) { // 查询所有的operator
					List<Integer> unitIds = unitDao.getUnitIds(PermissionSets.VIEW_UNIT.getName(), null);
					UnitDO unit = unitDao.getAnJianBu(true);
					unitIds.remove(unit.getId());
					parentOrgIds = organizationDao.getIdsByOlevelAndUnitIds("3", unitIds);
				} else {
					for (String operator : operators) {
						parentOrgIds.add(Integer.parseInt(operator));
					}
				}
				orgs = organizationDao.getSubOrganizationsByParents(parentOrgIds);
			}
			result = organizationDao.convert(orgs, Arrays.asList(new String[]{"id", "name"}), false);
		} else if (EnumPlanType.TERM.toString().equals(planType)) { // 航站时
			// do nothing
		}
		if (!StringUtils.isBlank(name)) {
			Iterator<Map<String, Object>> iterator = result.iterator();
			while (iterator.hasNext()) {
				Map<String, Object> map = iterator.next();
				if (null == map.get("name") || !StringUtils.containsIgnoreCase((String) map.get("name"), name)){
					iterator.remove();
				}
			}
		}
		// 按名称排序
		this.sortMapListByKey(result, "name", true);
		return result;
	}
	
	public List<Map<String, Object>> getAuditReportProfession(List<String> professions) {
		List<DictionaryDO> dics = null;
		if (null == professions || professions.isEmpty()) { // 查询所有的专业
			dics = dictionaryDao.getListByType("系统分类");
		} else {
			dics = dictionaryDao.internalGetByIds(professions.toArray(new String[0]));
		}
		List<Map<String, Object>> result = dictionaryDao.convert(dics, Arrays.asList(new String[]{"id", "name"}), false);
		// 按名称排序
		this.sortMapListByKey(result, "name", true);
		return result;
	}
	
	/**
	 * 将map的list按照map的key为name的值进行排序
	 * @param maps 待排序的列表
	 * @param key 按照map的哪个key进行排序
	 * @param asc 是否按升序进行排序。true 升序， false 降序
	 */
	private void sortMapListByKey(List<Map<String, Object>> maps, final String key, final boolean asc) {
		Collections.sort(maps, new Comparator<Map<String, Object>>() {
			Collator collator = Collator.getInstance();
			@Override
			public int compare(Map<String, Object> o1, Map<String, Object> o2) {
				String name1 = (String) o1.get(key);
				String name2 = (String) o2.get(key);
				int result;
				if (null == name1 && null != name2) {
					result = -1;
				} else if (null != name1 && null == name2) {
					result = 1;
				} else if (null == name1 && null == name2) {
					result = 0;
				} else {
					result = collator.compare(name1, name2);
				}
				if (!asc) {
					result = -result;
				}
				return result;
			}
		});
		
	}
	
	public PermissionSets getViewImproveIssuePermission() {
		PermissionSetDao permissionSetDao = (PermissionSetDao) SpringBeanUtils.getBean("permissionSetDao");
		if (permissionSetDao.hasPermission(PermissionSets.VIEW_ALL_IMPROVE_ISSUE.getName())) {
			return PermissionSets.VIEW_ALL_IMPROVE_ISSUE;
		} else if (permissionSetDao.hasUnitPermission(PermissionSets.VIEW_UNIT_IMPROVE_ISSUE.getName())) {
			return PermissionSets.VIEW_UNIT_IMPROVE_ISSUE;
		} else if (permissionSetDao.hasUnitPermission(PermissionSets.VIEW_ORG_IMPROVE_ISSUE.getName())){
			return PermissionSets.VIEW_ORG_IMPROVE_ISSUE;
		}
		return null;
	}
	
	/**
	 * 返回审计的计划类型
	 * 三级的时候返回SUB2和SUB3，一级或二级的时候返回所有审计的类型
	 * @param permission
	 * @return
	 */
	public List<String> getPlanTypeIdsForImproveIssue(PermissionSets permission) {
		List<String> list = new ArrayList<String>();
		if (PermissionSets.VIEW_ORG_IMPROVE_ISSUE.equals(permission)) { // 三级的时候
			list.add(EnumPlanType.SUB2.toString());
			list.add(EnumPlanType.SUB3.toString());
		} else if (PermissionSets.VIEW_ALL_IMPROVE_ISSUE.equals(permission) || PermissionSets.VIEW_UNIT_IMPROVE_ISSUE.equals(permission)) { // 一级或二级的时候
			for (EnumPlanType planType : EnumPlanType.values()) {
				if ("audit".equals(planType.getCategory())) {
					list.add(planType.toString());
				}
			}
		}
		return list;
	}

	/**
	 * 返回检查的类型
	 * @return
	 */
	public List<String> getCheckGradeIdsForImproveIssue(PermissionSets permission) {
		List<String> list = new ArrayList<String>();
		if (PermissionSets.VIEW_ORG_IMPROVE_ISSUE.equals(permission)) { // 三级的时候
			list.add(EnumCheckGrade.SUB2.toString());
		} else if (PermissionSets.VIEW_ALL_IMPROVE_ISSUE.equals(permission) || PermissionSets.VIEW_UNIT_IMPROVE_ISSUE.equals(permission)) { // 一级或二级的时候
			for (EnumCheckGrade checkGrade : EnumCheckGrade.values()) {
				list.add(checkGrade.toString());
			}
		}
		return list;
	}
	
	/**
	 * 返回整改问题的operator,按照安监机构和组织进行分类
	 * @param planTypes 计划或检查类型
	 * @param permission 权限
	 * @return
	 */
	public Map<String, Object> getOperatorIdMapsForImproveIssue(List<String> planTypes, PermissionSets permission) {
		Map<String, Object> map = new HashMap<String, Object>();
		List<Integer> unitIds = new ArrayList<Integer>();
		List<Integer> orgIds = new ArrayList<Integer>();
		if (planTypes == null || planTypes.isEmpty()) {
			planTypes = this.getPlanTypeIdsForImproveIssue(permission);
		}
		if (!planTypes.isEmpty()) {
			// 系统级时operator为安监部
			if (planTypes.contains(EnumPlanType.SYS.toString())) {
				Integer anJianBuId = unitDao.getAnJianBuId(false);
				if (anJianBuId != null) {
					unitIds.add(anJianBuId);
				}
			}
			
			// 分子公司级返回所有安监机构
			if (planTypes.contains(EnumPlanType.SUB2.toString())) {
				// 安监机构id
				unitIds.addAll(unitDao.getAllUnitIds(null));
				// 分子公司级返回所在的安监机构及下级组织（组织级别是3）
				if (PermissionSets.VIEW_UNIT_IMPROVE_ISSUE.equals(permission)) {
					List<Integer> viewableUnitIds = unitDao.getUnitIds(permission.getName());
					orgIds.addAll(organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", viewableUnitIds, null, null));
				}
			}
			
			// 三级返回所在安监机构及下级所在组织（组织级别是3）
			if (planTypes.contains(EnumPlanType.SUB3.toString())) {
				List<Integer> viewableUnitIds = unitDao.getUnitIds(permission.getName());
				unitIds.addAll(viewableUnitIds);
				orgIds.addAll(organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", viewableUnitIds, UserContext.getUserId(), null));
			}
		}
		map.put(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, unitIds);
		map.put(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, orgIds);
		return map;
	}
	
	/**
	 * 返回整改问题的operator(带前缀"UT"或"DP")
	 * @param planTypes 计划或检查类型
	 * @param permission 权限
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<String> getOperatorIdsForImproveIssue(List<String> planTypes, PermissionSets permission) {
		List<String> list = new ArrayList<String>();
		Map<String, Object> map = this.getOperatorIdMapsForImproveIssue(planTypes, permission);
		for (Integer unitId : (List<Integer>) map.get(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)) {
			list.add(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT + unitId);
		}
		for (Integer orgId : (List<Integer>) map.get(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) {
			list.add(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP + orgId);
		}
		return list;
	}
	

	/**
	 * 返回整改问题的target,按照安监机构和组织进行分类
	 * @param planTypes 计划或检查类型
	 * @param operators 执行单位
	 * @param permission 权限
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getTargetIdMapsForImproveIssue(List<String> planTypes, List<String> operators, PermissionSets permission) {
		Map<String, Object> map = new HashMap<String, Object>();
		List<Integer> targetUnitIds = new ArrayList<Integer>();
		List<Integer> targetOrgIds = new ArrayList<Integer>();
		if (planTypes == null || planTypes.isEmpty()) {
			planTypes = this.getPlanTypeIdsForImproveIssue(permission);
		}
		if (operators == null || operators.isEmpty()) {
			operators = this.getOperatorIdsForImproveIssue(planTypes, permission);
		}
		if (!operators.isEmpty()) {
			// 将operator分成安监机构id和组织的id
			List<Integer> unitIds = new ArrayList<Integer>();
			List<Integer> orgIds = new ArrayList<Integer>();
			for (String operator : operators) {
				if (StringUtils.startsWith(operator, AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)) {
					unitIds.add(Integer.parseInt(operator.replace(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, "")));
				} else if (StringUtils.startsWith(operator, AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) {
					orgIds.add(Integer.parseInt(operator.replace(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, "")));
				}
			}
			
			if (!unitIds.isEmpty()) {
				// 如果是系统级 安监部下发给各分子公司
				if (planTypes.contains(EnumPlanType.SYS.toString())) {
					if (PermissionSets.VIEW_ALL_IMPROVE_ISSUE.equals(permission)) {
						Integer anJianBuId = unitDao.getAnJianBuId(false);
						if (anJianBuId != null && unitIds.contains(anJianBuId)) {
							targetUnitIds.addAll(unitDao.getAllUnitIds(null));
						}
					} else if (PermissionSets.VIEW_UNIT_IMPROVE_ISSUE.equals(permission)) {
						targetUnitIds.addAll(unitDao.getUnitIds(permission.getName(), null));
					}
				}
				// 如果是分子公司级  分子公司之间可以互相下发
				if (planTypes.contains(EnumPlanType.SUB2.toString())) {
					if (PermissionSets.VIEW_ALL_IMPROVE_ISSUE.equals(permission)) {
						List<Integer> viewableUnitIds = unitDao.getAllUnitIds(null);
						targetUnitIds.addAll(viewableUnitIds);
						targetOrgIds.addAll(organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", unitIds, null, null));
					} else if (PermissionSets.VIEW_UNIT_IMPROVE_ISSUE.equals(permission)) {
						// 如果是浏览分子公司的权限，则查看分配给当前用户所在的安监机构的数据
						List<Integer> viewableUnitIds = unitDao.getUnitIds(permission.getName(), null);
						targetUnitIds.addAll(viewableUnitIds);
						// 如果operators包含用户所在的安监机构则求viewableUnitIds与unitIds求交集
						List<Integer> interSectionUnitIds = (List<Integer>) CollectionUtils.intersection(unitIds, viewableUnitIds);
						if (!interSectionUnitIds.isEmpty()) {
							// 求交集的安监机构下的3级组织
							targetOrgIds.addAll(organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", interSectionUnitIds, null, null));
						}
					} else if (PermissionSets.VIEW_ORG_IMPROVE_ISSUE.equals(permission)) {
						// 如果是浏览组织的权限，则查看分配给当前用户所在的安监机构下的3级组织的数据
						List<Integer> viewableUnitIds = unitDao.getUnitIds(permission.getName(), null);
						if (!viewableUnitIds.isEmpty()) {
							// 求安监机构下的当前用户所在的3级组织
							targetOrgIds.addAll(organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", viewableUnitIds, UserContext.getUserId(), null));
						}
					}
				}
				
				/*
				Integer anJianBuId = unitDao.getAnJianBuId(true);
				if (unitIds.contains(anJianBuId)) { // 如果operator有安监部时返回targetUnitId包含所有安监机构
					targetUnitIds = unitDao.getAllUnitIds(null);
				}
				// targetOrgId包含安监机构的下级组织（组织级别是3）
				targetOrgIds = organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", unitIds, null, null);
				*/
			}
			// targetOrgId包含所给组织的下级组织
			if (!orgIds.isEmpty()) {
				targetOrgIds.addAll(organizationDao.getSubOrgIdsByParents(orgIds));
			}
		}
		map.put(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, targetUnitIds);
		map.put(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, targetOrgIds);
		return map;
	}
	
	/**
	 * 返回整改问题的target(ID带前缀"UT"或"DP")
	 * @param planTypes 计划或检查类型
	 * @param operators 执行单位
	 * @param permission 权限
	 * @return
	 */
	public List<String> getTargetIdsForImproveIssue(List<String> planTypes, List<String> operators, PermissionSets permission) {
		Map<String, Object> map = this.getTargetIdMapsForImproveIssue(planTypes, operators, permission);
		return this.addPrefixForUnitAndOrgIds(map);
	}
	
	/**
	 * 将安监机构id和组织id带上前缀，返回list
	 */
	@SuppressWarnings("unchecked")
	public List<String> addPrefixForUnitAndOrgIds (Map<String, Object> map) {
		List<String> list = new ArrayList<String>();
		for (Integer unitId : (List<Integer>) map.get(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)) {
			list.add(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT + unitId);
		}
		for (Integer orgId : (List<Integer>) map.get(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) {
			list.add(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP + orgId);
		}
		return list;
	}
	
	/**
	 * 获取能够验证的问题的operatorid（粗略的）
	 * @return
	 */
	public List<Integer> getEditableOperatorIdsForImproveIssue() {
		List<Integer> list = null;
		PermissionSets permission = this.getViewImproveIssuePermission();
		if (PermissionSets.VIEW_ALL_IMPROVE_ISSUE.equals(permission)) { // 查看所有问题时，只能验证operator是安监部的问题
			list = new ArrayList<Integer>();
			list.add(unitDao.getAnJianBuId(true));
		} else if (PermissionSets.VIEW_UNIT_IMPROVE_ISSUE.equals(permission)) { // 查看所在安监机构的问题时，只能验证operator是除去安监部的其他安监机构的问题
			Integer anJianBuId = unitDao.getAnJianBuId(true);
			list = unitDao.getUnitIds(PermissionSets.VIEW_UNIT.getName());
			list.remove(anJianBuId);
		} else if (PermissionSets.VIEW_ORG_IMPROVE_ISSUE.equals(permission)) { // 查看所在组织的问题时，只能验证operator是3级组织的问题
			list = organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", null, null, null);
		} else {
			list = new ArrayList<Integer>();
		}
		return list;
	}
	
	/**
	 * 获取能够查看的问题的operatorid（严格的）
	 * @return
	 */
	public List<Integer> getViewableOperatorIdsForImproveIssue(List<Integer> list, PermissionSets permission) {
		if (list == null) {
			list = new ArrayList<Integer>();
		}
		if (permission == null) {
			permission = this.getViewImproveIssuePermission();
			if (permission == null) {
				return list;
			}
		}
		if (PermissionSets.VIEW_ALL_IMPROVE_ISSUE.equals(permission)) { // 查看所有问题时
			list.addAll(unitDao.getAllUnitIds(null));
			list.addAll(this.getViewableOperatorIdsForImproveIssue(list, PermissionSets.VIEW_UNIT_IMPROVE_ISSUE));
			return list;
		} else if (PermissionSets.VIEW_UNIT_IMPROVE_ISSUE.equals(permission)) { // 查看所在安监机构的问题时
			List<Integer> viewableUnitIds = unitDao.getUnitIds(PermissionSets.VIEW_UNIT.getName());
			list.addAll(viewableUnitIds);
			list.addAll(this.getViewableOperatorIdsForImproveIssue(list, PermissionSets.VIEW_ORG_IMPROVE_ISSUE));
			return list;
		} else if (PermissionSets.VIEW_ORG_IMPROVE_ISSUE.equals(permission)) { // 查看所在组织的问题时
			list.addAll(organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", null, null, null));
			return list;
		} else {
			list = new ArrayList<Integer>();
		}
		return list;
	}
	
	/**
	 * 验证 问题列表
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<FileDO> confirmImproveIssue(HttpServletRequest request) {
		String issueType = request.getParameter("issueType");
		String objs = request.getParameter("objs");
		Map<String, Object>[] maps = gson.fromJson(objs, new TypeToken<Map<String, Object>[]>() {}.getType());
		List<Integer> ids = new ArrayList<Integer>();
		for (Map<String, Object> map : maps) {
			ids.add(((Number) map.get("id")).intValue());
		}
		int sourceType ;
		// 验证状态设置为已验证
		if ("audit".equals(issueType)) {
			checkListDao.updateAll(maps);
			sourceType = EnumFileType.AUDIT_CONFIRM.getCode();
		} else { // check
			improveNoticeIssueDao.updateAll(maps);
			sourceType = EnumFileType.CHECK_CONFIRM.getCode();
		}
		// 读取file
		String uploadFilePath = config.getUploadFilePath();
		if (StringUtils.isBlank(uploadFilePath)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有配置上传文件的保存路径！");
		}
		// 保存在磁盘的绝对路径(不带文件名)
		String savedPath = uploadFilePath + "/";
		List<Map<String, Object>> fileMaps = fileDao.uploadFile(request, savedPath);
		List<FileDO> files = new ArrayList<FileDO>();
		for (Map<String, Object> map : fileMaps) {
			for (Integer id : ids) {
				FileItem item = (FileItem) map.get("fileItem");
				String savedFileName = (String) map.get("savedFileName");
				FileDO file = new FileDO();
				// 客户端显示的文件名
				file.setFileName(item.getName());
				file.setSize(fileDao.convertFileSize(item.getSize()));
				// TODO 还未确定
				file.setTag("tag");
				file.setType(FilenameUtils.getExtension(item.getName()));
				Date date = new Date();
				file.setUploadTime(date);
				file.setUploadUser(UserContext.getUser());
				file.setRelativePath("/" + savedFileName);
				// 上传附件的来源类型
				file.setSourceType(sourceType);
				// 不同类型附件的来源ID
				file.setSource(id);
				//不同类型附件的来源不同来源说明
				file.setDescription(item.getName());
				// 将附件的信息保存到数据库中
				fileDao.internalSave(file);
				fileDao.afterSave(file);
				files.add(file);
			}
		}
		return files;
	}
	
	/**
	 * 根据ids和类型获取需要导出的详细内容
	 * @param ids
	 * @param issueType
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> getImproveIssueByIds(String[] ids, String issueType) {
		if (ids == null || ids.length == 0) {
			return new ArrayList<Map<String,Object>>();
		}
		List<Map<String, Object>> result = null;
		if ("audit".equals(issueType)) {
			result = (List<Map<String, Object>>) checkListDao.query("select new Map(concat('审计要点：',itemPoint,'\n审计记录：', auditRecord) as issueContent, improveReason as improveReason, improveMeasure as improveMeasure, improveRemark as completionStatus) from CheckListDO t where t.id in (" + StringUtils.join(ids, ",") + ")");
		} else if ("check".equals(issueType)){ // check
			result = (List<Map<String, Object>>) improveNoticeIssueDao.query("select new Map(issueContent as issueContent, improveReason as improveReason, improveMeasure as improveMeasure, completionStatus as completionStatus) from ImproveNoticeIssueDO t where t.id in (" + StringUtils.join(ids, ",") + ")");
		}
		return result;
	}
	
	public void setUnitGeographyDao(UnitGeographyDao unitGeographyDao) {
		this.unitGeographyDao = unitGeographyDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setCheckListDao(CheckListDao checkListDao) {
		this.checkListDao = checkListDao;
	}

	public void setImproveNoticeIssueDao(ImproveNoticeIssueDao improveNoticeIssueDao) {
		this.improveNoticeIssueDao = improveNoticeIssueDao;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setImproveNoticeDao(ImproveNoticeDao improveNoticeDao) {
		this.improveNoticeDao = improveNoticeDao;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Object[]> getCheckOverdueInfo(String endDateStr){
		String sql = "select searchRs.unitBelongName, count(*) as cnt from ( " +
	                 "select issue.id, notice.operator as operatorId, issue.improve_unit as improveUnitId, " +
				     "decode(improveUnitUnit.name, null, improveUnitOrg.\"name\", improveUnitUnit.name) as improveUnit, " +
				     "decode(improveUnitUnit.name, null, tUnit.name, improveUnitUnit.name) as unitBelongName, " +
				     "issue.improve_dead_line as improveLastDate, " +
				     "issue.completion_date as improveDate, " +
				     "issue.improve_measure as improveMeasure, " +
				     "notice.check_start_date as checkStartDate " +
				     "from a_improve_notice_issue issue " +
				     "inner join a_improve_notice notice " +
				     "on (issue.improve_notice_id = notice.id and notice.deleted = '0' and notice.status <> 'NEW' and notice.status <> 'AUDIT_WAITING' and notice.status <> 'AUDIT_REJECTED' and notice.status is not null) " +
				     "left join t_unit improveUnitUnit " +
				     "on (substr(issue.improve_unit, 3, length(issue.improve_unit)) = to_char(improveUnitUnit.id)) " +
				     "left join t_organization improveUnitOrg " +
				     "on (substr(issue.improve_unit, 3, length(issue.improve_unit)) = to_char(improveUnitOrg.id)) " +
				     "left join t_unit tUnit " +
				     "on (improveUnitOrg.\"unit\" = tUnit.id) " +
				     "where issue.deleted = '0' " +
	                 "and notice.improve_notice_type in ('SYS', 'SUB2') " +
				     "and issue.completion_date is null " +
	                 "and issue.improve_dead_line < to_date('" + endDateStr + "', 'yyyy-MM-dd') " +
	                 "and issue.trace_flow_status is null " +
	                 ") searchRs " +
				     "group by searchRs.unitBelongName " +
				     "order by cnt";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		return list;
	}
	
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Object[]> getAuditOverdueInfo(String endDateStr){
		String sql = "select searchRs.targetUnitBelongName, count(*) as cnt from ( " +
	                 "select cl.id, cl.improve_lastdate as improveLastDate, cl.improve_date as improveDate, task.operator as operatorId, task.target as targetId, " +
				     "decode(targetUnit.name, null, targetOrg.\"name\", targetUnit.name) as target, " +
				     "decode(targetUnit.name, null, tUnit.name, targetUnit.name) as targetUnitBelongName, " +
				     "task.start_date as auditStartDate " +
				     "from a_check_list cl " +
				     "inner join a_task task " +
				     "on (cl.task_id = task.id and task.deleted = '0') " +
				     "left join t_unit targetUnit " +
				     "on (task.target = targetUnit.id) " +
				     "left join t_organization targetOrg " +
				     "on (task.target = targetOrg.id) " +
				     "left join t_unit tUnit " +
				     "on (targetOrg.\"unit\" = tUnit.id) " +
				     "inner join a_plan plan " +
				     "on (task.plan_id = plan.id and plan.deleted = '0') " +
				     "left join a_item item " +
				     "on cl.item_id = item.id " +
				     "where cl.deleted = '0' " +
	                 "and cl.improve_item_status is not null " +
				     "and cl.improve_date is null " +
	                 "and cl.improve_lastdate < to_date('" + endDateStr + "', 'yyyy-MM-dd') " +
	                 "and task.plan_type in ('SYS', 'SUB2', 'SUB3') " +
	                 ") searchRs " +
				     "group by searchRs.targetUnitBelongName " +
				     "order by cnt";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		return list;
	}

}
