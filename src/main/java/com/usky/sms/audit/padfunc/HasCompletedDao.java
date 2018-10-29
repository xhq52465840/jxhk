package com.usky.sms.audit.padfunc;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.audit.check.CheckDO;
import com.usky.sms.audit.check.CheckDao;
import com.usky.sms.audit.check.CheckListDO;
import com.usky.sms.audit.check.CheckListDao;
import com.usky.sms.audit.check.EnumImproveItemStatus;
import com.usky.sms.audit.improve.ImproveDO;
import com.usky.sms.audit.improve.ImproveDao;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.workflow.WorkflowService;

public class HasCompletedDao extends HibernateDaoSupport {
	
	@Autowired
	private CheckDao checkdao;
	
	@Autowired
	private ImproveDao improveDao;
	
	@Autowired
	private CheckListDao checkListDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private FileDao fileDao;
	
	private static final SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getTaskPad(String type, String status) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		if ("all".equals(status)) { // 所有
			if ("check".equals(type)) {
				list.addAll(this.toCheck());
				for (Map<String, Object> m1 : this.doneCheck()) {
					int id1 = (int) m1.get("id");
					int count = 0;
					for (Map<String, Object> m2 : list) {
						int id2 = (int) m2.get("id");
						if (id1 == id2) count++;
					}
					if (count == 0) {
						list.add(m1);
					}
				}
			} else if ("improve".equals(type)) {
				list.addAll(this.toImprove());
				for (Map<String, Object> m1 : this.doneImprove()) {
					int id1 = (int) m1.get("id");
					int count = 0;
					for (Map<String, Object> m2 : list) {
						int id2 = (int) m2.get("id");
						if (id1 == id2) count++;
					}
					if (count == 0) {
						list.add(m1);
					}
				}
			} else if ("trace".equals(type)) {
				list.addAll(this.toTrace());
				list.addAll(this.doneTrace());
			}
		} else if ("to".equals(status)) { // 待处理
			if ("check".equals(type)) {
				list.addAll(this.toCheck());
			} else if ("improve".equals(type)) {
				list.addAll(this.toImprove());
			} else if ("trace".equals(type)) {
				list.addAll(this.toTrace());
			}
		} else if ("done".equals(status)) { // 已完成
			if ("check".equals(type)) {
				list.addAll(this.doneCheck());
			} else if ("improve".equals(type)) {
				list.addAll(this.doneImprove());
			} else if ("trace".equals(type)) {
				list.addAll(this.doneTrace());
			}
		}
		return list;
	}
	/**
	 * 待办的检查单
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> toCheck(){
		String todosql = "select distinct c, tv.lastUpdate from TodoViewDO tv, TodoViewFlowUserDO tf, CheckDO c where tv.id = tf.id and tv.id = c.id and tv.todoName = ? and tf.user.id= ? order by tv.lastUpdate desc"; 
		List<Object[]> todos = this.getHibernateTemplate().find(todosql, "check", UserContext.getUserId());
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for (Object[] o : todos) {
			if (o[0] == null) continue;
			CheckDO check = (CheckDO) o[0];
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", check.getId());
			map.put("checkName", check.getCheckName());// 名称
			map.put("address", check.getAddress());// 地点
			map.put("flowStatus", check.getFlowStatus());// 状态
			map.put("planType", check.getTask() == null ? null : check.getTask().getPlanType());// 类型
			map.put("planTime", check.getTask() == null ? null : check.getTask().getPlanTime());// 年月
			map.put("completedDate", null); // 完成日期
			list.add(map);
		}
		return list;
	}
	/**
	 * 已完成的检查单
	 * @return
	 */
	private List<Map<String, Object>> doneCheck(){
		@SuppressWarnings("unchecked")
		List<Object[]> dones = this.getHibernateTemplate().find("select c, t.lastUpdate from HasCompletedDO t , CheckDO c where t.checkId = c.id and t.userId = ? order by t.lastUpdate desc", UserContext.getUserId());
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for (Object[] o : dones) {
			if (o[0] == null) continue;
			CheckDO check = (CheckDO) o[0];
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", check.getId());
			map.put("checkName", check.getCheckName());// 名称
			map.put("address", check.getAddress());// 地点
			map.put("flowStatus", check.getFlowStatus());// 状态
			map.put("planType", check.getTask() == null ? null : check.getTask().getPlanType());// 类型
			map.put("planTime", check.getTask() == null ? null : check.getTask().getPlanTime());// 年月
			map.put("completedDate", o[1] == null ? null : ((SimpleDateFormat)sdf.clone()).format(o[1])); // 完成日期
			list.add(map);
		}
		return list;
	}
	
	/**
	 * 待办的整改单
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> toImprove(){
		String todosql = "select distinct ip, tv.lastUpdate from TodoViewDO tv, TodoViewFlowUserDO tf, ImproveDO ip where tv.id = tf.id and tv.id = ip.id and tv.todoName = ? and tf.user.id= ? order by tv.lastUpdate desc"; 
		List<Object[]> todos = this.getHibernateTemplate().find(todosql, "improve", UserContext.getUserId());
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for (Object[] o : todos) {
			if (o[0] == null) continue;
			ImproveDO improve = (ImproveDO) o[0];
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", improve.getId());
			map.put("checkName", improve.getImproveName());// 名称
			map.put("address", improve.getAddress());// 地点
			map.put("flowStatus", improve.getFlowStatus());// 状态
			map.put("planType", improve.getTask() == null ? null : improve.getTask().getPlanType());// 类型
			map.put("planTime", improve.getTask() == null ? null : improve.getTask().getPlanTime());// 年月
			map.put("completedDate", null); // 完成日期
			list.add(map);
		}
		return list;
	}
	
	/**
	 * 已完成的整改单
	 * @return
	 */
	private List<Map<String, Object>> doneImprove(){
		@SuppressWarnings("unchecked")
		List<Object[]> dones = this.getHibernateTemplate().find("select ip, t.lastUpdate from HasCompletedDO t , ImproveDO ip where t.checkId = ip.id and t.userId = ? order by t.lastUpdate desc", UserContext.getUserId());
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for (Object[] o : dones) {
			if (o[0] == null) continue;
			ImproveDO improve = (ImproveDO) o[0];
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", improve.getId());
			map.put("checkName", improve.getImproveName());// 名称
			map.put("address", improve.getAddress());// 地点
			map.put("flowStatus", improve.getFlowStatus());// 状态
			map.put("planType", improve.getTask() == null ? null : improve.getTask().getPlanType());// 类型
			map.put("planTime", improve.getTask() == null ? null : improve.getTask().getPlanTime());// 年月
			map.put("completedDate", o[1] == null ? null : ((SimpleDateFormat)sdf.clone()).format(o[1])); // 完成日期
			list.add(map);
		}
		return list;
	}
	/**
	 * 待办的验证单
	 * @return
	 */
	private List<Map<String, Object>> toTrace(){
		String sql = "from CheckListDO t where t.deleted = false and t.improveItemStatus = ?";
		@SuppressWarnings("unchecked")
		List<CheckListDO> checkLists = this.getHibernateTemplate().find(sql, EnumImproveItemStatus.已指派.getCode());
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for (CheckListDO checkList : checkLists) {
			String confirmMan = "," + checkList.getConfirmMan() + ",";
			String userid = "," + UserContext.getUserId() + ",";
			if (confirmMan.indexOf(userid) > -1) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", checkList.getId());
				map.put("itemPoint", checkList.getItemPoint()); // 检查要点
				map.put("address", checkList.getCheck() == null ? null : checkList.getCheck().getAddress()); // 检查地点
				map.put("confirmDate", checkList.getConfirmDate() == null ? null : ((SimpleDateFormat)sdf.clone()).format(checkList.getConfirmDate())); // 验证日期
				map.put("confirmResult", checkList.getConfirmResult());
				map.put("improveReason", checkList.getImproveReason());
				map.put("improveMeasure", checkList.getImproveMeasure());
				map.put("improveRemark", checkList.getImproveRemark());
				map.put("verification", checkList.getVerification());
				list.add(map);
			}
		}
		return list;
	}
	/**
	 * 已办的验证单
	 */
	private List<Map<String, Object>> doneTrace(){
		String sql = "from CheckListDO t where t.deleted = false and t.improveItemStatus = ? order by t.confirmDate desc";
		@SuppressWarnings("unchecked")
		List<CheckListDO> checkLists = this.getHibernateTemplate().find(sql, EnumImproveItemStatus.验证通过.getCode());
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for (CheckListDO checkList : checkLists) {
			String confirmMan = "," + checkList.getConfirmMan() + ",";
			String userid = "," + UserContext.getUserId() + ",";
			if (confirmMan.indexOf(userid) > -1) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", checkList.getId()); //id
				map.put("itemPoint", checkList.getItemPoint()); // 检查要点
				map.put("address", checkList.getCheck() == null ? null : checkList.getCheck().getAddress()); // 检查地点
				map.put("confirmDate", checkList.getConfirmDate() == null ? null : ((SimpleDateFormat)sdf.clone()).format(checkList.getConfirmDate())); // 验证日期
				map.put("confirmResult", checkList.getConfirmResult()); //验证结论
				map.put("improveReason", checkList.getImproveReason()); //整改说明原因
				map.put("improveMeasure", checkList.getImproveMeasure());//整改措施
				map.put("improveRemark", checkList.getImproveRemark());// 整改完成情况
				map.put("verification", checkList.getVerification());//验证情况
				list.add(map);
			}
		}
		return list;
	}
	public Map<String, Object> getTaskById(String dataobject, Integer id) {
		Map<String, Object> map = new HashMap<String, Object>();
		if ("check".equals(dataobject)) {
			map.putAll(this.getCheckById(id));
		} else if ("improve".equals(dataobject)){
			map.putAll(this.getImproveById(id));
		} else if ("checklist".equals(dataobject)) {
			map.putAll(this.getCheckListById(id));
		}
		return map;
	}
	/**
	 * 取指定检查单
	 * @param id
	 * @return
	 */
	private Map<String, Object> getCheckById(Integer id){
		Map<String, Object> map = new HashMap<String, Object>();
		CheckDO check = checkdao.internalGetById(id);
		if (check != null) {
			map.put("checkName", check.getCheckName());// 名称
			map.put("startDate", check.getStartDate() == null ? null : ((SimpleDateFormat)sdf.clone()).format(check.getStartDate()));// 审计日期
			map.put("endDate", check.getEndDate() == null ? null : ((SimpleDateFormat)sdf.clone()).format(check.getEndDate()));
			map.put("checkType", check.getCheckType() == null ? null : check.getCheckType().getName());// 所属系统
			map.put("address", check.getAddress());// 审计地点
			map.put("remark", check.getRemark());// 备注
			map.put("planType", check.getTask() == null ? null : check.getTask().getPlanType());
			String unitName = null;
			if (check.getTask() != null && check.getTarget() != null) {
				if (EnumPlanType.SPOT.toString().equals(check.getTask().getPlanType()) || EnumPlanType.SPEC.toString().equals(check.getTask().getPlanType())) {
					// 现场检查或专项检查时do nothing
				} else if (EnumPlanType.SYS.toString().equals(check.getTask().getPlanType())){
					UnitDO unit = unitDao.internalGetById(Integer.parseInt(check.getTarget()));
					unitName = unit.getName();
				} else {
					OrganizationDO organization = organizationDao.internalGetById(NumberHelper.toInteger(check.getTarget()));
					unitName = organization.getName();
				}
			}
			map.put("target", unitName);// 被审计单位
			String member = check.getMember();
			if (member != null && !"".equals(member)) {
				String m[] = member.split(",");
				List<UserDO> u = userDao.internalGetByIds(m);
				map.put("member", userDao.convert(u, Arrays.asList(new String[]{"id", "fullname"}), false));// 审计员
			}
			map.put("actions", workflowService.getActionsWithAttributes(check.getFlowId()));
			map.put("workflowNodeAttributes", workflowService.getWorkflowNodeAttributes(check.getFlowId()));
			map.put("checkList", checkListDao.convert(new ArrayList<CheckListDO>(check.getCheckLists())));
		}
		return map;
	}
	/**
	 * 取指定整改单
	 * @param id
	 * @return
	 */
	private Map<String, Object> getImproveById(Integer id){
		Map<String, Object> map = new HashMap<String, Object>();
		ImproveDO improve = improveDao.internalGetById(id);
		if (improve != null) {
			Map<String, Object> im = improveDao.convert(improve);
			map.put("improveName", improve.getImproveName());//名称
			map.put("improveNo", improve.getImproveNo());//编号
			map.put("startDate", improve.getStartDate() == null ? null : ((SimpleDateFormat)sdf.clone()).format(improve.getStartDate()));//审计日期
			map.put("endDate", improve.getEndDate() == null ? null : ((SimpleDateFormat)sdf.clone()).format(improve.getEndDate()));//审计日期
			map.put("address", improve.getAddress());// 审计地点
			map.put("transactorTel", improve.getTransactorTel());// 经办人联系方式
			map.put("improverTel", improve.getImproverTel());// 整改人联系方式
			map.put("remark", improve.getRemark());// 备注
			map.put("operator", im.get("operator"));// 审计单位
			map.put("target", im.get("target"));// 被审计单位
			map.put("transactor", im.get("transactor"));// 经办人
			map.put("improver", im.get("improver"));// 整改人
			List<FileDO> improveFiles = fileDao.getFilesBySource(EnumFileType.IMPROVE.getCode(), improve.getId());
			map.put("improveFiles", fileDao.convert(improveFiles));// 整改反馈签批件
			map.put("actions", workflowService.getActionsWithAttributes(improve.getFlowId()));
			map.put("checkList", checkListDao.convert(new ArrayList<CheckListDO>(improve.getCheckLists())));
			map.put("workflowNodeAttributes", workflowService.getWorkflowNodeAttributes(improve.getFlowId()));
		}
		return map;
	}
	
	/**
	 * 取指定检查项
	 * @param id
	 * @return
	 */
	private Map<String, Object> getCheckListById(Integer id){
		Map<String, Object> map = new HashMap<String, Object>();
		CheckListDO checkList = checkListDao.internalGetById(id);
		if (checkList != null) {
			map = checkListDao.convert(checkList);
		}
		return map;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public Map<String, Integer> getTODOCount() {
		List<Map<String, Object>> improves = this.getTaskPad("improve", "to");
		List<Map<String, Object>> checks = this.getTaskPad("check", "to");
		List<Map<String, Object>> traces = this.getTaskPad("trace", "to");
		Map<String, Integer> map = new HashMap<String, Integer>();
		map.put("improve", improves.size());
		map.put("check", checks.size());
		map.put("trace", traces.size());
		return map;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getQar_event_tongbi() {
		String sql = "select t.p_year ,t.p_month, sum(t.summary), sum(t.flight_count) from QAR_EVENT_TONGBI t where t.severity_class_no in (3,4) group by t.p_year ,t.p_month order by t.p_year ,t.p_month";
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		Map<Object, Object> datacur = new HashMap<Object, Object>();
		Map<Object, Object> datapre = new HashMap<Object, Object>();
//		Map<Object, Object> datacur_flight = new HashMap<Object, Object>();
//		Map<Object, Object> datapre_flight = new HashMap<Object, Object>();
		Calendar cal = Calendar.getInstance();
		int yearcur = cal.get(Calendar.YEAR);
		int yearpre = yearcur - 1;
		for (Object[] o : list) {
			if (yearcur== NumberHelper.toInteger(o[0].toString())) {
				datacur.put(NumberHelper.toInteger(o[1].toString()), o[2]);
//				datacur_flight.put(o[1], o[3]);
			} else if (yearpre == NumberHelper.toInteger(o[0].toString())) {
				datapre.put(NumberHelper.toInteger(o[1].toString()), o[2]);
//				datapre_flight.put(o[1], o[3]);
			}
		}
		List<Object> valuecurs = new ArrayList<Object>();
		List<Object> valuepres = new ArrayList<Object>();
		List<Object> month = new ArrayList<Object>();
		for (int i = 1; i <= 12; i++) {
			Object valuecur = datacur.get(i) == null ? 0 : datacur.get(i);
			valuecurs.add(valuecur);
			Object valuepre = datapre.get(i) == null ? 0 : datapre.get(i);
			valuepres.add(valuepre);
			month.add(i);
		}
		List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
		Map<String, Object> cur = new HashMap<String, Object>();
		cur.put("year", yearcur);
		cur.put("value", valuecurs);
		data.add(cur);
		Map<String, Object> pre = new HashMap<String, Object>();
		pre.put("year", yearpre);
		pre.put("value", valuepres);
		data.add(pre);
		Map<String, Object> mon = new HashMap<String, Object>();
		mon.put("timeline", month);
		data.add(mon);
		return data;
	}
	
	public void setCheckdao(CheckDao checkdao) {
		this.checkdao = checkdao;
	}

	public void setImproveDao(ImproveDao improveDao) {
		this.improveDao = improveDao;
	}

	public void setCheckListDao(CheckListDao checkListDao) {
		this.checkListDao = checkListDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}
	

}
