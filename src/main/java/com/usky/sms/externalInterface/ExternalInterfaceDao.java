package com.usky.sms.externalInterface;

import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.config.Config;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.report.ReportDao;
import com.usky.sms.report.ReportFliterDao;
import com.usky.sms.tem.TemDao;
import com.usky.sms.tem.consequence.ConsequenceDO;
import com.usky.sms.tem.consequence.ConsequenceDao;
import com.usky.sms.tem.severity.SeverityDO;

public class ExternalInterfaceDao extends HibernateDaoSupport {

	private Config config = Config.getInstance();
	
	@Autowired
	private ReportDao reportDao;
	
	@Autowired
	private ConsequenceDao consequenceDao;
	
	@Autowired
	private ReportFliterDao reportFliterDao;
	
	@Autowired
	private TemDao temDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
	
	private static final DecimalFormat df = new DecimalFormat("0.000");
	
	private static final Integer wp = 10000;
	

	/**
	 * 通过安全信息类型，创建时间，安监机构查询安全信息
	 * @param type 类型的id 如：员工报告Id
	 * @param startDate 查询开始时间
	 * @param endDate 查询截止时间
	 * @param unit 安监机构Id
	 * @return [{unit:安监机构,userNum:人员编号(这个我不知道是哪个人员), type:信息类型, created:提交时间, summary:这是一条员工报告, description：报告明细(这个我不知道具体指什么), id:报告id, status:处理状态}]
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String,Object>> getActivityByTypeAndCreatedAndUnitZ(Integer type, Date startDate, Date endDate, Integer unit){
		StringBuffer sql = new StringBuffer("from ActivityDO t where t.deleted = false");
		List<Object> param = new ArrayList<Object>();
		if (type != null) {
			sql.append(" and t.type.id = ?");
			param.add(type);
		}
		if (unit != null) {
			sql.append(" and t.unit.id = ?");
			param.add(unit);
		}
		if (startDate != null) {
			sql.append(" and t.created >= ?");
			param.add(startDate);
		}
		if (endDate != null) {
			sql.append(" and t.created <= ?");
			param.add(endDate);
		}
		@SuppressWarnings("unchecked")
		List<ActivityDO> activitys = this.getHibernateTemplate().find(sql.toString(), param.toArray());
		Map<Integer, List<Map<String, Object>>> SeverityAndSystype = this.getSeverityAndSystype(activitys);
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (ActivityDO a : activitys) {
			Map<String, Object> m = new HashMap<String, Object>();
			m.put("id", a.getId());
			m.put("summary", a.getSummary());
			m.put("description", a.getDescription());
			m.put("type", a.getType() == null ? null : a.getType().getName());
			m.put("status", a.getStatus() == null ? null : a.getStatus().getName());
			m.put("unit", a.getUnit() == null ? null : a.getUnit().getName());
			m.put("created", a.getCreated() == null ? null : ((SimpleDateFormat)sdf.clone()).format(a.getCreated()));
			m.put("userNum", a.getCreator() == null ? null : a.getCreator().getUsername());
			m.put("severity", SeverityAndSystype.get(a.getId()));
			list.add(m);
		}
		return list;
	}

	private Map<Integer, List<Map<String, Object>>> getSeverityAndSystype(List<ActivityDO> activitys){
		List<Integer> activityIds = new ArrayList<Integer>();
		for (ActivityDO a : activitys) {
			activityIds.add(a.getId());
		}
		StringBuffer sql = new StringBuffer("select t.activity.id, t.severity, t.sysType from TemDO t where");
		if (activitys.size() > 0 && activitys.size() <= 500){
			sql.append(" (t.activity.id in ( " + StringUtils.join(activityIds, ",") + "))");
		} else if (activitys.size() > 500){
			sql.append(" (t.activity.id in ( " + StringUtils.join(activityIds.subList(0, 500), ",") + " )" + reportFliterDao.getHql(activityIds));
		} else {
			sql.append(" 1 = 0");
		}
		@SuppressWarnings("unchecked")
		List<Object[]> objs = this.getHibernateTemplate().find(sql.toString());
		List<Integer> ids = new ArrayList<Integer>();
		Map<Integer, List<Map<String, Object>>> map = new HashMap<Integer, List<Map<String, Object>>>();
		for (Object[] o : objs ) {
			if (o[0] != null && o[1] != null && o[2] != null) {
				Integer activityId = (Integer) o[0];
				SeverityDO severity = (SeverityDO) o[1];
				DictionaryDO sysType = (DictionaryDO) o[2];
				if (ids.contains(activityId)) {
					List<Map<String, Object>> a = map.get(activityId);
					Map<String, Object> tm = new HashMap<String, Object>();
					tm.put("severityId", severity.getId());
					tm.put("severityName", severity.getName());
					tm.put("sysTypeId", sysType.getId());
					tm.put("sysTypeName", sysType.getName());
					a.add(tm);
				} else {
					ids.add(activityId);
					List<Map<String, Object>> a = new ArrayList<Map<String,Object>>();
					Map<String, Object> tm = new HashMap<String, Object>();
					tm.put("severityId", severity.getId());
					tm.put("severityName", severity.getName());
					tm.put("sysTypeId", sysType.getId());
					tm.put("sysTypeName", sysType.getName());
					a.add(tm);
					map.put(activityId, a);
				}
			}
		}
		return map;
	}
	
	/**
	 * 通过开始时间和结束时间查询重大风险雷达图数据(雷达图理论上是按照每个月查的，还有他的风险值算法也就延用sms的算法)
	 * @param startDate 开始时间
	 * @param endDate 结束时间
	 * @param unit 安监机构id
	 * @return [{id: 重大风险id, name: 重大风险名称, value: 风险值, showValue: 显示值, showWarning: 警戒值, max: 最大值}]
	 * @throws Exception 
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String,Object>> getRadarZ(Date firstDay, Date lastDay, Integer unitId) throws Exception{
		Integer sysType = null;
		Double flyTime = reportDao.getFlyTime(firstDay);
		List<Object[]> temlist = reportDao.getRadarRiskValue(sysType, firstDay);
		List<ConsequenceDO> conList = consequenceDao.achieveListBySysType(sysType, null);
		Map<String, Object> tempMap = temDao.drawRadar(firstDay, lastDay, sysType, unitId);
		Double riskparam = reportDao.getRiskParam();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (ConsequenceDO con : conList) {
			Map<String, Object> conMap = new LinkedHashMap<String, Object>();
			conMap.put("id", con.getId());
			conMap.put("name", con.getName());
			Double value = tempMap.get(con.getName()) == null ? 0.0 : Double.parseDouble(tempMap.get(con.getName()).toString());
			Map<String, Double> riskMap = reportDao.getRadarWaringValue(con.getId(), firstDay, flyTime, temlist, riskparam);
			Double max = riskMap.get("warning");
			Double average = riskMap.get("average");
			conMap.put("value", reportDao.getValue(Double.parseDouble(df.format((value/flyTime))) * wp, average, max));
			conMap.put("showValue", Double.parseDouble(df.format((value/flyTime))) * wp);
			conMap.put("showWarning", max);
			conMap.put("max", 6);
			list.add(conMap);
		}
		return list;
	}

	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getUserBySearchN(Map<String, Object> rule) {
		String username = (rule.get("username") == null || "".equals(rule.get("username"))) ? null : rule.get("username").toString();
		String fullname = (rule.get("fullname") == null || "".equals(rule.get("fullname"))) ? null : rule.get("fullname").toString();
		String email = (rule.get("email") == null || "".equals(rule.get("email"))) ? null : rule.get("email").toString();
		Integer unit = (rule.get("unit") == null || "".equals(rule.get("unit"))) ? null : NumberHelper.toInteger(rule.get("unit").toString());
		Integer organization = (rule.get("organization") == null || "".equals(rule.get("organization"))) ? null : NumberHelper.toInteger(rule.get("organization").toString());
		Integer usergroup = (rule.get("usergroup") == null || "".equals(rule.get("usergroup"))) ? null : NumberHelper.toInteger(rule.get("usergroup").toString());
		StringBuffer sql = new StringBuffer("select u.id as userid, u.username, u.fullname, u.email, u.login_count, u.last_login, u.\"type\",o.id as orgid, o.\"name\" as orgname, r.id as roleid, r.name as rolename, av.file_name, unit.id unitid, unit.name as unitname, ug.id ugid, ug.name ugname"
						+ " from t_user u"
						+ " left join t_unit_role_actor a"
						+ "    on (u.id = a.parameter and a.deleted = 0)"
						+ " left join t_role r"
					    + "	   on (a.role_id = r.id and r.deleted = 0)"
						+ "	left join t_unit unit"
					    + "		on (a.unit_id = unit.id and unit.deleted = 0)"
					    + " left join t_user_organization uo"
						+ "    on u.id = uo.user_id"
						+ " left join t_organization o"
						+ "    on (o.id = uo.organization_id and o.deleted = 0)"
						+ " left join t_user_user_group uug"
						+ "    on u.id = uug.user_id"
						+ " left join t_user_group ug"
						+ "    on (ug.id = uug.user_group_id and ug.deleted = 0)"
						+ " left join t_avatar av"
						+ "    on av.id = u.avatar_id"
						+ " where u.deleted = '0'");
		if (username != null) {
			sql.append(" and upper(u.username) like upper('%" + username + "%')");
		}
		if (fullname != null) {
			sql.append(" and upper(u.fullname) like upper('%" + fullname + "%')");
		}
		if (email != null) {
			sql.append(" and upper(u.email) like upper('%" + email + "%')");
		}
		if (unit != null) {
			sql.append(" and o.\"unit\" = " + unit);
		}
		if (organization != null) {
			List<Integer> ids = this.getAllIOrganizationIdsByParent(organization);
			sql.append(" and o.id in (" + StringUtils.join(ids, ",") + ")");
		}
		if (usergroup != null) {
			sql.append(" and ug.id = " + usergroup);
		}
		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		List<Object> ids = new ArrayList<Object>();
		List<Map<String, Object>> data = new ArrayList<Map<String,Object>>();
		Map<String, Map<Object, List<Map<String, Object>>>> org_role = this.factroyorgandrole(list);
		for (Object[] o : list) {
			if (ids.contains(o[0])) continue;
			ids.add(o[0]);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", o[0]);
			map.put("username", o[1]);
			map.put("fullname", o[2]);
			map.put("email", o[3]);
			map.put("loginCount", o[4]);
			map.put("lastLogin", o[5]);
			map.put("type", o[6]);
			map.put("organization", org_role.get("org").get(o[0]));
			map.put("role", org_role.get("role").get(o[0]));
			map.put("usergroup", org_role.get("usergroup").get(o[0]));
			if (o[11] == null) {
				map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + config.getUnknownUserAvatar());
			} else {
				map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + o[11]);
			}
			data.add(map);
		}
		return data;
	}
	
	private List<Integer> getAllIOrganizationIdsByParent(Integer id) {
		List<OrganizationDO> organizations = organizationDao.getAllOrganizationByParent(id);
		List<Integer> ids = new ArrayList<Integer>();
		for (OrganizationDO o : organizations) {
			ids.add(o.getId());
		}
		return ids;
	}
	
	private Map<String, Map<Object, List<Map<String, Object>>>> factroyorgandrole(List<Object[]> list) {
		Map<String, Map<Object, List<Map<String, Object>>>> map = new HashMap<String, Map<Object,List<Map<String,Object>>>>();
		List<Object> ids_org = new ArrayList<Object>();
		Map<Object, List<Map<String, Object>>> orgmap = new HashMap<Object, List<Map<String, Object>>>();
		List<Object> ids_role = new ArrayList<Object>();
		Map<Object, List<Map<String, Object>>> rolemap = new HashMap<Object, List<Map<String, Object>>>();
		List<Object> ids_usergroup = new ArrayList<Object>();
		Map<Object, List<Map<String, Object>>> usergroupmap = new HashMap<Object, List<Map<String, Object>>>();
		for (Object[] o : list) {
			if (null != o[7]) {
				if (ids_org.contains(o[0])) {
					List<Map<String, Object>> orgs = orgmap.get(o[0]);
					Map<String, Object> org = new HashMap<String, Object>();
					org.put("organizationId", o[7]);
					org.put("organizationName", o[8] == null ? "" : o[8]);
					if (!orgs.contains(org)) {
						orgs.add(org);
					}
				} else {
					ids_org.add(o[0]);
					List<Map<String, Object>> orgs = new ArrayList<Map<String, Object>>();
					Map<String, Object> org = new HashMap<String, Object>();
					org.put("organizationId", o[7]);
					org.put("organizationName", o[8] == null ? "" : o[8]);
					orgs.add(org);
					orgmap.put(o[0], orgs);
				}
			}
			if (null != o[9]) {
				if (ids_role.contains(o[0])) {
					List<Map<String, Object>> roles = rolemap.get(o[0]);
					Map<String, Object> role = new HashMap<String, Object>();
					role.put("roleId", o[9]);
					role.put("roleName", o[10]);
					role.put("unitId", o[12]);
					role.put("unitName", o[13]);
					if (!roles.contains(role)) {
						roles.add(role);
					}
				} else {
					ids_role.add(o[0]);
					List<Map<String, Object>> roles = new ArrayList<Map<String, Object>>();
					Map<String, Object> role = new HashMap<String, Object>();
					role.put("roleId", o[9]);
					role.put("roleName", o[10]);
					role.put("unitId", o[12]);
					role.put("unitName", o[13]);
					roles.add(role);
					rolemap.put(o[0], roles);
				}
			}
			if (null != o[14]) {
				if (ids_usergroup.contains(o[0])) {
					List<Map<String, Object>> usergroups = usergroupmap.get(o[0]);
					Map<String, Object> usergroup = new HashMap<String, Object>();
					usergroup.put("usergroupId", o[14]);
					usergroup.put("usergroupName", o[15]);
					if (!usergroups.contains(usergroup)) {
						usergroups.add(usergroup);
					}
				} else {
					ids_usergroup.add(o[0]);
					List<Map<String, Object>> usergroups = new ArrayList<Map<String, Object>>();
					Map<String, Object> usergroup = new HashMap<String, Object>();
					usergroup.put("usergroupId", o[14]);
					usergroup.put("usergroupName", o[15]);
					usergroups.add(usergroup);
					usergroupmap.put(o[0], usergroups);
				}
			}
		}
		map.put("org", orgmap);
		map.put("role", rolemap);
		map.put("usergroup", usergroupmap);
		return map;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getUserByOrganizationN(Integer orgId) {
		List<Map<String, Object>> data = new ArrayList<Map<String,Object>>();
		if (orgId != null) {
			StringBuffer sql = new StringBuffer("select u.id as userid, u.username, u.fullname,  r.name as rolename, ug.name as usergroupname"
							+ " from t_user u"
							+ " left join t_user_organization uo"
							+ "   	 on u.id = uo.user_id"
							+ " left join t_organization o"
							+ "   	 on o.id = uo.organization_id"
							+ " left join t_unit_role_actor ua"
							+ "      on u.id = ua.parameter"
							+ " left join t_role r"
							+ "      on ua.role_id = r.id"
							+ " left join t_user_user_group uug"
							+ "      on u.id = uug.user_id"
							+ " left join t_user_group ug"
							+ "      on uug.user_group_id = ug.id"
							+ " where o.id = " + orgId);
			Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query = session.createSQLQuery(sql.toString());
			@SuppressWarnings("unchecked")
			List<Object[]> list = query.list();
			List<Object> ids = new ArrayList<Object>();
			Map<String, Map<Object, List<Map<String, Object>>>> ug_role = this.factroyusergroupandrole(list);
			for (Object[] o : list) {
				if (ids.contains(o[0])) continue;
				ids.add(o[0]);
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", o[0]);
				map.put("username", o[1]);
				map.put("fullname", o[2]);
				map.put("role", ug_role.get("role").get(o[0]));
				map.put("usergroup", ug_role.get("usergroup").get(o[0]));
				data.add(map);
			}
		}
		return data;
	}
	
	private Map<String, Map<Object, List<Map<String, Object>>>> factroyusergroupandrole(List<Object[]> list) {
		Map<String, Map<Object, List<Map<String, Object>>>> map = new HashMap<String, Map<Object,List<Map<String,Object>>>>();
		List<Object> ids_ug = new ArrayList<Object>();
		Map<Object, List<Map<String, Object>>> ugmap = new HashMap<Object, List<Map<String, Object>>>();
		List<Object> ids_role = new ArrayList<Object>();
		Map<Object, List<Map<String, Object>>> rolemap = new HashMap<Object, List<Map<String, Object>>>();
		for (Object[] o : list) {
			if (ids_ug.contains(o[0])) {
				List<Map<String, Object>> ugs = ugmap.get(o[0]);
				Map<String, Object> ug = new HashMap<String, Object>();
				ug.put("usergroupName", o[4]);
				if (!ugs.contains(ug)) {
					ugs.add(ug);
				}
			} else {
				ids_ug.add(o[0]);
				List<Map<String, Object>> ugs = new ArrayList<Map<String, Object>>();
				Map<String, Object> ug = new HashMap<String, Object>();
				ug.put("usergroupName", o[4]);
				ugs.add(ug);
				ugmap.put(o[0], ugs);
			}
			if (ids_role.contains(o[0])) {
				List<Map<String, Object>> roles = rolemap.get(o[0]);
				Map<String, Object> role = new HashMap<String, Object>();
				role.put("roleName", o[3]);
				if (!roles.contains(role)) {
					roles.add(role);
				}
			} else {
				ids_role.add(o[0]);
				List<Map<String, Object>> roles = new ArrayList<Map<String, Object>>();
				Map<String, Object> role = new HashMap<String, Object>();
				role.put("roleName", o[3]);
				roles.add(role);
				rolemap.put(o[0], roles);
			}
		}
		map.put("usergroup", ugmap);
		map.put("role", rolemap);
		return map;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getUserByRoleN(Integer roleId, String user, Integer unitId) {
		StringBuffer sql = new StringBuffer("select unit.name as unitname, u.username, u.fullname, u.status"
						+ " from t_unit_role_actor ura"
						+ " left join t_unit unit"
						+ "  	 on ura.unit_id = unit.id" 
						+ " left join t_user u"
						+ "  	 on ura.parameter = u.id" 
						+ " where ura.type = 'USER' and ura.role_id = " + roleId);
		if (unitId != null) {
			sql.append(" and ura.unit_id = " + unitId);
		}
		sql.append(" order by unit.name");
		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		List<Map<String, Object>> data = new ArrayList<Map<String,Object>>();
		for (Object[] o : list) {
			Map<String, Object> map = new HashMap<String, Object>();
			if (user != null && !"".equals(user)) {
				if (o[1] != null && o[2] != null) {
					if (o[1].toString().indexOf(user) > -1 || o[2].toString().indexOf(user) > -1) {
						map.put("unitname", o[0]);
						map.put("username", o[1]);
						map.put("fullname", o[2]);
						map.put("status", o[3]);
						data.add(map);
					}
				}
			} else {
				map.put("unitname", o[0]);
				map.put("username", o[1]);
				map.put("fullname", o[2]);
				map.put("status", o[3]);
				data.add(map);
			}
		}
		return data;
	}
	
	/**
	 * 根据用户单位和信息部的需求，需要在管理大屏系统中统计事故症候万时率，其中的分子事故症候数量就是从我们的安全网中获取的。所以需要请你们协助开发一个接口：
	 * 输入 起、止日期
	 * 输出 事故症候数量（对应我们航空安全信息严重等级为严重事故症候、一般事故症候、地面事故症候三类信息数量的总和）
	 * @param activitys
	 * @param datelist
	 * @param symbol
	 * @return
	 * @throws ParseException
	 */
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	@SuppressWarnings("unchecked")
	public Integer getSeverityByFliterN(Date startDate, Date endDate, List<String> severityType) throws ParseException {
		if (severityType.size() == 0) return 0;
		List<String> severityName = new ArrayList<String>();
		Map<String, String> enumServerityCodeAndName = EnumServerityCodeAndName();
		for (String str : severityType) {
			severityName.add(enumServerityCodeAndName.get(str));
		}
		List<Integer> serverityIds = this.getHibernateTemplate().find("select id from SeverityDO where deleted = false and name in ('"+StringUtils.join(severityName, "','")+"')");
		List<Integer> activityTypeId = this.getHibernateTemplate().find("select id from ActivityTypeDO where deleted = false and name = '航空安全信息'");
		if (serverityIds.size() == 0 && activityTypeId.size() > 0) {
			return 0;
		}
		List<Object> param = new ArrayList<Object>();
		StringBuffer sql = new StringBuffer("select count(t) from TemDO t left join t.severity s ,AccessInformationDO a where t.deleted = false and a.activity.id = t.activity.id");
		sql.append(" and t.activity.type.id = " + activityTypeId.get(0));
		sql.append(" and s.id in ("+StringUtils.join(serverityIds, ",")+")");
		sql.append(" and a.occurredDate >= ?");
		param.add(startDate);
		sql.append(" and a.occurredDate <= ?");
		param.add(endDate);
		List<Long> temlist = this.getHibernateTemplate().find(sql.toString(), param.toArray());
		Integer result = (temlist.get(0) == null ? 0 : temlist.get(0).intValue());
		return result;
	}
	
	private Map<String, String> EnumServerityCodeAndName() {
		//严重事故征候','一般事故征候','地面事故征候
		Map<String, String> map = new HashMap<String, String>();
		map.put("YZ", "严重事故征候");
		map.put("YB", "一般事故征候");
		map.put("DM", "地面事故征候");
		return map;
	}
	
	public void setReportDao(ReportDao reportDao) {
		this.reportDao = reportDao;
	}

	public void setConsequenceDao(ConsequenceDao consequenceDao) {
		this.consequenceDao = consequenceDao;
	}

	public void setTemDao(TemDao temDao) {
		this.temDao = temDao;
	}

	public void setReportFliterDao(ReportFliterDao reportFliterDao) {
		this.reportFliterDao = reportFliterDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	

}
