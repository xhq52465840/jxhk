package com.usky.sms.audit.base;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.audit.improve.ImproveDO;
import com.usky.sms.audit.improve.ImproveDao;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class AuditBaseService extends AbstractService {
	
	private static final String A2_2_AUDITROLE = "A2.2二级审计主管";
	
	@Autowired
	private ProfessionUserDao professionUserDao;

	@Autowired
	private ItemDao itemDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private ImproveDao improveDao;
	
	@Autowired
	private AuditorDao auditorDao;
	
	@Autowired
	private TaskDao taskDao;
	
	public void getItemFields(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Map<String, String>> list = ItemDao.searchFields;
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(list, request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void getItemFieldsData(HttpServletRequest request, HttpServletResponse response) {
		try {
			String field = request.getParameter("field");
			List<Map<String, String>> list = itemDao.getFieldData(Boolean.parseBoolean(field));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(list, request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void getProfessionUserBySearch(HttpServletRequest request, HttpServletResponse response) {
		try {
			String name = request.getParameter("name");
			String unit = request.getParameter("unit");
			String profession = request.getParameter("profession");
			List<ProfessionUserDO> list = professionUserDao.getProfessionUserBySearch(unit, profession, name);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(professionUserDao.convert(list), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getItemTree(HttpServletRequest request, HttpServletResponse response) {
		try {
			String rule = request.getParameter("rule");
			List<List<Map<String, Object>>> obj = gson.fromJson(rule, new TypeToken<List<List<Map<String, Object>>>>() {}.getType());
			List<Map<String,Object>> list = itemDao.getTermItemTree(obj);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(list, request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getItemTreeNode(HttpServletRequest request, HttpServletResponse response) {
		try {
			String rule = request.getParameter("rule");
			List<List<Map<String, Object>>> obj = gson.fromJson(rule, new TypeToken<List<List<Map<String, Object>>>>() {}.getType());
			List<Map<String,Object>> list = itemDao.getRootNode(obj);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(list, request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void addTMPItem(HttpServletRequest request, HttpServletResponse response) {
		try {
			String obj = request.getParameter("obj");
			Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			Integer id = itemDao.addTMPItem(objMap);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", id);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getItemByChapter(HttpServletRequest request, HttpServletResponse response) {
		try {
			String parentId = request.getParameter("parentId");
			Map<String, Object> dataMap = itemDao.getItemByParent(NumberHelper.toInteger(parentId));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", dataMap);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getGradeOneAuditors(HttpServletRequest request, HttpServletResponse response) {
		try {
			String professionId = request.getParameter("professionId");
			String taskId = request.getParameter("taskId");
			String term = request.getParameter("term");
			TaskDO task = taskDao.internalGetById(NumberHelper.toInteger(taskId));
			List<UserDO> list = new ArrayList<UserDO>();
			if (EnumPlanType.SYS.toString().equals(task.getPlanType())){
				list.addAll(professionUserDao.getYiJiShenJiYuan(NumberHelper.toInteger(professionId), taskId, term));
			} else if (EnumPlanType.SUB2.toString().equals(task.getPlanType())){
				list.addAll(professionUserDao.getErJiShenJiYuan(NumberHelper.toInteger(professionId), task, term));
			} else if (EnumPlanType.SUB3.toString().equals(task.getPlanType())){
				list.addAll(professionUserDao.getSanJiShenJiYuan(NumberHelper.toInteger(professionId), task, term));
			} else if (EnumPlanType.TERM.toString().equals(task.getPlanType())){
				list.addAll(professionUserDao.getYiJiShenJiYuan(null, taskId, term));
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(list), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getFirstAuditors(HttpServletRequest request, HttpServletResponse response) {
		try {
			String term = request.getParameter("term");
			List<Map<String, Object>> list = auditorDao.getAuditorByRole(term);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getGradeTwoAuditors(HttpServletRequest request, HttpServletResponse response) {
		try {
			String improveId = request.getParameter("improveId");
			ImproveDO improve = improveDao.internalGetById(NumberHelper.toInteger(improveId));
			Integer target = null;
			if (improve.getTarget() != null){
				target = NumberHelper.toInteger(improve.getTarget());
			}
			List<UserDO> list = professionUserDao.getAuditorsByRoleName(null, A2_2_AUDITROLE, null, null, target);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(list), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	//一级审计经理，可以分配验证人员
	public void getGradeOneManagerAuditors(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<UserDO> list = professionUserDao.getYiJiShenJiJingLi();
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(list), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getMarkByUser(HttpServletRequest request, HttpServletResponse response) {
		try {
			Object mark = professionUserDao.getMarkByUser();
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", mark);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void getTaskManager(HttpServletRequest request, HttpServletResponse response) {
		try {
			String dataobjectid = request.getParameter("dataobjectid");
			String term = request.getParameter("term");
			TaskDO task = taskDao.internalGetById(NumberHelper.toInteger(dataobjectid));
			List<Map<String,Object>> list = professionUserDao.getXiangMuZhuGuan(task,term);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getItemByTypeAndProfession(HttpServletRequest request, HttpServletResponse response) {
		try {
			String profession = request.getParameter("profession");
			String pointType = request.getParameter("pointType");
			String parent = request.getParameter("parent");
			List<ItemDO> list = itemDao.getItemByTypeAndProfession(profession, pointType, parent);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(itemDao.convert(list), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setProfessionUserDao(ProfessionUserDao professionUserDao) {
		this.professionUserDao = professionUserDao;
	}

	public void setItemDao(ItemDao itemDao) {
		this.itemDao = itemDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setImproveDao(ImproveDao improveDao) {
		this.improveDao = improveDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setTaskDao(TaskDao taskDao) {
		this.taskDao = taskDao;
	}

	
}
