package com.usky.sms.losa;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.losa.activity.FlyStageNameEnum;
import com.usky.sms.losa.activity.ObserveActivityDO;
import com.usky.sms.losa.activity.ObserveActivityDao;
import com.usky.sms.losa.activity.ObserveApproachDO;
import com.usky.sms.losa.activity.ObserveApproachDao;
import com.usky.sms.losa.activity.ObserverInfoDao;
import com.usky.sms.losa.error.ErrorBaseInfoDO;
import com.usky.sms.losa.error.ErrorBaseInfoDao;
import com.usky.sms.losa.error.ErrorManageDO;
import com.usky.sms.losa.error.ErrorManageDao;
import com.usky.sms.losa.plan.TaskPlanDao;
import com.usky.sms.losa.score.ScoreDao;
import com.usky.sms.losa.score.ScoreSelectContentDO;
import com.usky.sms.losa.score.ScoreSelectContentDao;
import com.usky.sms.losa.scoreTemplet.ScoreTempletDao;
import com.usky.sms.losa.threat.ThreatBaseInfoDO;
import com.usky.sms.losa.threat.ThreatBaseInfoDao;
import com.usky.sms.losa.threat.ThreatManageDO;
import com.usky.sms.losa.threat.ThreatManageDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class LosaService extends AbstractService {
	private Config config;
	@Autowired
	private ObserveActivityDao observeActivityDao;
	@Autowired
	private ErrorManageDao errorManageDao;
	@Autowired
	private ThreatManageDao threatManageDao;
	@Autowired
	private CrewInterviewDao crewInterviewDao;
	@Autowired
	private AttachmentDao attachmentDao;
	@Autowired
	private UnexceptStatusBaseInfoDao unexceptStatusBaseInfoDao;
	@Autowired
	private CauseFindPersonTypeDao causeFindPersonTypeDao;
	@Autowired
	private ErrorBaseInfoDao errorBaseInfoDao;
	@Autowired
	private ThreatBaseInfoDao threatBaseInfoDao;
	@Autowired
	private UserDao userDao;
	@Autowired
	private TaskPlanDao taskPlanDao;

	@Autowired
	private ScoreDao scoreDao;
	@Autowired
	private DictTypeDao dictypedao;
	@Autowired
	private ScoreTempletDao scoreTempletDao;

	@Autowired
	private ScoreSelectContentDao scoreSelectContentDao;
	
	@Autowired
	private ObserveApproachDao observeApproachDao;
	
	@Autowired
	private ObserverInfoDao observerInfoDao;

	SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

	public LosaService() {
		this.config = Config.getInstance();
	}

	/**
	 * 获取基础信息
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void queryBaseInfo(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		try {

			List<UnexceptStatusBaseInfoDao> unexcetStatus = unexceptStatusBaseInfoDao.query();
			// List<CauseFindPersonTypeDO> causeFindPersonType =
			// causeFindPersonTypeDao
			// .query();
			List<ErrorBaseInfoDO> errorBaseInfo = errorBaseInfoDao.query();
			List<ThreatBaseInfoDO> threatBaseInfo = threatBaseInfoDao.query();
			List<Map<String, Object>> dictypeInfo = dictypedao.query();
			List<Map<String, Object>> branchInfo = dictypedao.queryBranch();
			List<ScoreSelectContentDO> scoreSelectContent = scoreSelectContentDao.getAllList();
			List<Map<String,Object>> observerInfo = observerInfoDao.queryObserverInfo();
			Map<String, Object> baseInfos = new HashMap<String, Object>();
			baseInfos.put("unexcetStatus", unexcetStatus);
			// baseInfos.put("causeFindPersonType", causeFindPersonType);
			baseInfos.put("errorBaseInfo", errorBaseInfo);
			baseInfos.put("threatBaseInfo", threatBaseInfo);
			baseInfos.put("dictypeInfo", dictypeInfo);
			baseInfos.put("branchInfo", branchInfo);
			baseInfos.put("scoreSelectContent", scoreSelectContent);
			baseInfos.put("observerFxwNo", observerInfo);
			map.put("Code", "success");
			map.put("jsonBaseInfo", baseInfos);
			ResponseHelper.output(response, map);

		} catch (Exception e) {
			e.printStackTrace();
			map.put("Code", "failure");
			map.put("resultDesc", "获取基础信息失败");
			ResponseHelper.output(response, map);
		}
	}

	/**
	 * 移动端根据插入字段的类型拉取数据
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void pullByInsertFieldType(HttpServletRequest request, HttpServletResponse response) throws Exception {

		String insertFieldType = request.getParameter("insertFieldTypeList");
		String serverIp = InetAddress.getLocalHost().getHostAddress();
		String serverPort = String.valueOf(request.getServerPort());
		Map<String, Object> map = new HashMap<String, Object>();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		try {
			if (StringUtils.isNotEmpty(insertFieldType)) {
				List<Map<String, Object>> filedMapList = gson.fromJson(insertFieldType,
						new TypeToken<List<Map<String, Object>>>() {
						}.getType());
				if (filedMapList.size() > 0) {
					for (Map<String, Object> fieldMap : filedMapList) {
						String activityId = (String) fieldMap.get("activityId");
						String insertFileds = (String) fieldMap.get("insertFileds");
						Map<String, Object> backList = this.getLosaByFields(activityId, insertFileds, serverIp,
								serverPort);
						list.add(backList);
					}

				}
			}
			map.put("Code", "success");
			map.put("jsonActivity", list);
			ResponseHelper.output(response, map);

		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

	}

	private Map<String, Object> getLosaByFields(String activityId, String fields, String serverIp, String serverPort)
			throws Exception {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Map<String, Object> activityMap = new HashMap<String, Object>();
		try {
			if (StringUtils.isNotBlank(activityId)) {
				activityMap.put("activityId", activityId);
				if (StringUtils.isNotBlank(fields)) {
					String[] insertFiled = fields.split(",");
					if (insertFiled.length > 0) {
						for (int i = 0; i < insertFiled.length; i++) {
							Map<String, Object> map = new HashMap<String, Object>();
							if (FlyStageNameEnum.INSERTJSONOBSERVE.getKey().equals(insertFiled[i])) {
								map.put(FlyStageNameEnum.INSERTJSONOBSERVE.getKey(),
										observeActivityDao.pullActivity(activityId, ""));
							} else if (FlyStageNameEnum.INSERTJSONTHREAT.getKey().equals(insertFiled[i])) {
								map.put(FlyStageNameEnum.INSERTJSONTHREAT.getKey(),
										threatManageDao.pullThreatMnanage(activityId));
							} else if (FlyStageNameEnum.INSERTJSONOERROR.getKey().equals(insertFiled[i])) {
								map.put(FlyStageNameEnum.INSERTJSONOERROR.getKey(),
										errorManageDao.pullErrorManage(activityId));
							} else if (FlyStageNameEnum.INSERTJSONOCREW.getKey().equals(insertFiled[i])) {
								map.put(FlyStageNameEnum.INSERTJSONOCREW.getKey(),
										crewInterviewDao.pullCrewInterview(activityId));
							} else if (FlyStageNameEnum.INSERTJSONATTACH.getKey().equals(insertFiled[i])) {
								map.put(FlyStageNameEnum.INSERTJSONATTACH.getKey(),
										attachmentDao.pullAttachment(activityId, serverIp, serverPort));

							}
							list.add(map);
						}
					}
				}
				activityMap.put("backUpdateInfo", list);
			}

		} catch (Exception e) {
			e.printStackTrace();

		}
		return activityMap;
	}

	public void submitLosa(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			String id = request.getParameter("id");
			int result = observeActivityDao.submitLosa(id);
			if (result > 0) {
				map.put("Code", "success");
				ResponseHelper.output(response, map);
			} else {
				map.put("Code", "failure");
				ResponseHelper.output(response, map);
			}

		} catch (Exception e) {
			e.printStackTrace();
			map.put("Code", "failure");
			map.put("resultDesc", "提交失败");
			ResponseHelper.output(response, map);
		}
	}

	/**
	 * 获取单一LOSA观察活动最新更新时间接口
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void queryActUpdateTime(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();

		try {
			String activityId = request.getParameter("activityId");
			if (!StringUtils.isBlank(activityId)) {
				List<Object> list = observeActivityDao.queryActivityUpdateTime(activityId);
				// List<Object>attachIds=attachmentDao.queryAttachementById(activityId);
				if (!list.isEmpty()) {
					Map<String, Object> data = new HashMap<String, Object>();
					data.put("activityId", activityId);
					data.put("updateTime", dateFormat.format(list.get(0)));
					map.put("Code", "success");
					map.put("jsonActivity", data);
					ResponseHelper.output(response, map);
				} else {
					map.put("Code", "failure");
					map.put("resultDesc", "服务器上未找到该条记录的更新时间");
					ResponseHelper.output(response, map);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			map.put("Code", "failure");
			map.put("resultDesc", "查询失败");
			ResponseHelper.output(response, map);

		}
	}

	/**
	 * 批量获取LOSA观察活动最新更新时间接口
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void queryActsUpdateTime(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			String userId = request.getParameter("userId");
			String activityIds = request.getParameter("activityIds");
			String modelUpdate = request.getParameter("modelUpdate");
			// 比较模板更新时间，确定是否更新模板数据
			if (!StringUtils.isEmpty(modelUpdate)) {
				if(modelUpdate.equals("null")){
					map.put("modelDate", this.queryActivityForMobile(null, null, null, null));
				}else{
					SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
					Date modelUpdateDate = dateFormat.parse(modelUpdate);
					Date scoreUpdateDate = scoreTempletDao.queryLastUpdateTime();
					if (scoreUpdateDate.getTime() > modelUpdateDate.getTime()) {
						map.put("modelDate", this.queryActivityForMobile(null, null, null, null));
					}
				}
			}
			List<Map<String, Object>> updateTimes = new ArrayList<Map<String, Object>>();

			if (StringUtils.isBlank(activityIds)) {
				List<Object[]> list = observeActivityDao.queryActsUpdateTime(userId);
				if (!list.isEmpty()) {
					for (Object[] objs : list) {
						String id = String.valueOf(objs[0]);
						Map<String, Object> data = new HashMap<String, Object>();
						data.put("activityId", id);
						data.put("updateTime", dateFormat.format(objs[1]));
						updateTimes.add(data);
					}
					map.put("Code", "success");
					map.put("jsonActivity", updateTimes);
					ResponseHelper.output(response, map);
				} else {
					map.put("Code", "success");
					map.put("resultDesc", "没有需要更新的数据");
					map.put("jsonActivity", updateTimes);
					ResponseHelper.output(response, map);
				}

			} else {
				String[] ids = activityIds.split(",");
				for (int i = 0; i < ids.length; i++) {
					List<Object> list = observeActivityDao.queryActivityUpdateTime(ids[i]);
					Map<String, Object> data = new HashMap<String, Object>();
					if (!list.isEmpty()) {
						data.put("activityId", ids[i]);
						data.put("updateTime", dateFormat.format(list.get(0)));
						updateTimes.add(data);
					} else {
						data.put("activityId", ids[i]);
						data.put("updateTime", "服务器没有更新时间");
						updateTimes.add(data);
					}
				}
				if (!updateTimes.isEmpty()) {
					map.put("Code", "success");
					map.put("jsonActivity", updateTimes);
					ResponseHelper.output(response, map);
				} else {
					map.put("Code", "success");
					map.put("resultDesc", "没有需要更新的数据");
					map.put("jsonActivity", updateTimes);
					ResponseHelper.output(response, map);
				}

			}

		}catch(ParseException e){
			e.printStackTrace();
			map.put("Code", "failure");
			map.put("resultDesc", "参数日期格式不正确，请传入yyyy-MM-dd HH:mm:ss格式的日期参数");
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			map.put("Code", "failure");
			map.put("resultDesc", "批量获取更新时间出错");
			ResponseHelper.output(response, map);
		}
	}

	/**
	 * 移动端向服务器 LOSA观察活动单一推送与PC端观察活动保存
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void pushActivity(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		String serverIp = InetAddress.getLocalHost().getHostAddress();
		String serverPort = String.valueOf(request.getServerPort());
		try {
			String jsonActivity = request.getParameter("jsonActivity");

			if (!StringUtils.isBlank(jsonActivity)) {
				Map<String, Object> data = gson.fromJson(jsonActivity, new TypeToken<Map<String, Object>>() {
				}.getType());
				Map<String, Object> backIds = saveActivity(data, serverIp, serverPort);
				if (backIds != null) {
					map.put("backSaveDatas", backIds);
				}
				map.put("Code", "success");
				map.put("resultDesc", "推送数据成功");
				ResponseHelper.output(response, map);
			}

		} catch (Exception e) {
			e.printStackTrace();
			map.put("Code", "failure");
			map.put("resultDesc", "推送数据失败");
			ResponseHelper.output(response, map);
		}

	}

	/**
	 * 移动端向PC端LOSA观察活动批量推送
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void pushActivities(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		String serverIp = InetAddress.getLocalHost().getHostAddress();
		String serverPort = String.valueOf(request.getServerPort());
		try {
			String activities = request.getParameter("jsonActivity");
			List<Map<String, Object>> backIdsList = new ArrayList<Map<String, Object>>();
			List<Map<String, Object>> activitiesList = gson.fromJson(activities,
					new TypeToken<List<Map<String, Object>>>() {
					}.getType());
			for (int i = 0; i < activitiesList.size(); i++) {
				Map<String, Object> backIds = saveActivity(activitiesList.get(i), serverIp, serverPort);
				if (backIds != null) {
					backIdsList.add(backIds);
				}
			}

			map.put("backSaveIdsList", backIdsList);
			map.put("Code", "success");
			map.put("resultDesc", "推送数据成功");
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			StringWriter sw = new StringWriter();
			PrintWriter pw = new PrintWriter(sw);
			e.printStackTrace(pw);
			map.put("Code", "failure");
			map.put("resultDesc", "推送数据失败");
			map.put("errorDetail", sw.toString());
			ResponseHelper.output(response, map);
		}

	}

	/**
	 * 保存观察活动各个实体类
	 * 
	 * @param map
	 * @return
	 * @throws Exception
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Map<String, Object> saveActivity(Map<String, Object> map, String serverIp, String serverPort)
			throws Exception {
		Integer planId = null;
		// boolean isMoNew=false;//是否是移动端新建任务
		// String moId=null;//移动端新建观察活动的ID
		// 保存任务信息
		String taskPlan = (String) map.get("jsonPlan");
		if (!StringUtils.isEmpty(taskPlan)) {
			Map<String, Object> plan = taskPlanDao.taskPlanSave(taskPlan);
			planId = Integer.valueOf(String.valueOf(plan.get("planId")));
			// moId=String.valueOf(plan.get("observiewId"));
			// isMoNew=(boolean)plan.get("mobileNew");
		}
		// 观察表更新
		String observe = (String) map.get("jsonObserve");
		Map<String, Object> observeMap = gson.fromJson(observe, new TypeToken<Map<String, Object>>() {
		}.getType());
		Map<String, Object> backMap = observeActivityDao.updateObserveActivity(observeMap, planId);
		// Date activityUpdateTime= (Date) backMap.get("date");
		String activityId = String.valueOf(backMap.get("activityId"));

		// 评分信息
		scoreDao.updateScore(observeMap, activityId);

		// 差错表返回新增数据的ID
		Map<String, Object> backSaveIds = new HashMap<String, Object>();
		String errorManage = (String) map.get("jsonError");
		
			// List<Map<String, Object>> errorBackIdList =
			// errorManageDao.saveError(errorManage,activityId);
			// backSaveIds.put("errorBackIds", errorBackIdList);
			errorManageDao.saveError(errorManage, activityId);
		
		// 威胁表更新
		String threatManage = (String) map.get("jsonThreat");
		
			// List<Map<String, Object>> threatBackIdList
			// =threatManageDao.saveThreat(
			// threatManage, activityId);
			// backSaveIds.put("threatBackIds", threatBackIdList);
			threatManageDao.saveThreat(threatManage, activityId);
		
		//观察活动下稳定进近参数信息表更新
		String observeApproach = (String)map.get("jsonApproach");
		if(!StringUtils.isBlank(observeApproach)){
			observeApproachDao.saveObserveApproach(observeApproach, activityId);
		}
		// 附件表
		String attachment = (String) map.get("jsonAttach");
		if (!StringUtils.isBlank(attachment)) {
			// List<Map<String, Object>> attachBackIdList = saveAttachment(
			// attachment, activityId, activityId, serverIp, serverPort);
			// backSaveIds.put("attachBackIds", attachBackIdList);
			saveAttachment(attachment, activityId, activityId, serverIp, serverPort);
		}

		// 机组访谈表
		String crewInterview = (String) map.get("jsonCrew");
		if (!StringUtils.isBlank(crewInterview) && !crewInterview.equals("null")) {
			crewInterviewDao.pushCrewInterview(crewInterview, activityId);
		}

		// 新建的数据进行更新
		/*
		 * if(isMoNew==true){
		 * backSaveIds.put("updateData",this.queryActivityForMobile(activityId,
		 * serverIp, serverPort, null)); backSaveIds.put("localId",moId); }else{
		 * backSaveIds.put("activityId", activityId);
		 * backSaveIds.put("activityUpdateTime",
		 * dateFormat.format(activityUpdateTime)); }
		 */
		// backSaveIds.put("jsonActivity",this.queryActivityForMobile(activityId,
		// serverIp, serverPort, null));
		backSaveIds = this.queryActivityForMobile(activityId, serverIp, serverPort, null);
		if (!backSaveIds.isEmpty()) {
			return backSaveIds;
		} else {
			return null;
		}
	}

	/**
	 * 移动端从服务器单条拉取LOSA观察活动
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void pullActivity(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		String serverIp = InetAddress.getLocalHost().getHostAddress();
		String serverPort = String.valueOf(request.getServerPort());
		String flyStageName = request.getParameter("flyStageName");
		try {
			String activityId = request.getParameter("activityId");
			Map<String, Object> data = new HashMap<String, Object>();
			// 版本为空时是PC端查询，不为空是是移动端查询
			if (StringUtils.isEmpty(flyStageName)) {
				data = queryActivityForMobile(activityId, serverIp, serverPort, flyStageName);
			} else {
				data = queryActivityForPc(activityId, serverIp, serverPort, flyStageName);
			}
			if (data.isEmpty()) {
				map.put("Code", "failure");
				map.put("resultDesc", "没有该活动信息");
				ResponseHelper.output(response, map);
			} else {
				map.put("Code", "success");
				map.put("jsonActivity", data);
				ResponseHelper.output(response, map);
			}

		} catch (Exception e) {
			e.printStackTrace();
			map.put("Code", "failure");
			map.put("resultDesc", "拉取数据失败");
			ResponseHelper.output(response, map);
		}
	}

	/**
	 * 移动端从服务器批量拉取LOSA观察活动
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void pullActivities(HttpServletRequest request, HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			String serverIp = InetAddress.getLocalHost().getHostAddress();
			String serverPort = String.valueOf(request.getServerPort());
			String activityIds = request.getParameter("activityIds");
			List<Object> activityList = new ArrayList<Object>();
			String[] ids = activityIds.split(",");
			for (int i = 0; i < ids.length; i++) {
				Map<String, Object> data = queryActivityForMobile(ids[i], serverIp, serverPort, "");
				activityList.add(data);
			}
			if (activityList.size() > 0) {
				map.put("jsonActivity", activityList);
				map.put("Code", "success");
				map.put("resultDesc", "批量拉取数据成功");
				ResponseHelper.output(response, map);
			} else {
				map.put("Code", "failure");
				map.put("resultDesc", "没有活动信息");
				ResponseHelper.output(response, map);
			}
		} catch (Exception e) {
			e.printStackTrace();
			map.put("Code", "failure");
			map.put("resultDesc", "批量拉取数据失败");
			ResponseHelper.output(response, map);
		}
	}

	private Map<String, Object> queryActivityForMobile(String activityId, String serverIp, String serverPort,
			String flyStageName) throws Exception {
		try {
			Map<String, Object> data = new HashMap<String, Object>();
			// 为移动端传送数据
			Map<String, Object> observe = observeActivityDao.pullActivity(activityId, flyStageName);
			List<ErrorManageDO> errorList = errorManageDao.pullErrorManage(activityId);
			List<ThreatManageDO> threatList = threatManageDao.pullThreatMnanage(activityId);
			CrewInterviewDO crewInterview = crewInterviewDao.pullCrewInterview(activityId);
			List<AttachmentDO> attachList = attachmentDao.pullAttachment(activityId, serverIp, serverPort);
			//获取观察活动下稳定进近参数信息
			List<ObserveApproachDO> approachList = observeApproachDao.queryObserveApproach(activityId);
			// 拉取任务表
			if (observe.get("planId") != null) {
				Map<String, Object> paramMap = new HashMap<String, Object>();
				paramMap.put("planId", String.valueOf(observe.get("planId")));
				Map<String, Object> plan = taskPlanDao.queryTaskPlans(paramMap);
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> planList = (List<Map<String, Object>>) plan.get("result");
				if (planList.size() > 0 && planList != null) {
					data.put("jsonPlan", planList.get(0));
				} else {
					data.put("jsonPlan", null);
				}

			} else {

				data.put("jsonPlan", taskPlanDao.newPlanJson());
			}
			data.put("activityId", activityId);
			data.put("jsonObserve", observe);
			data.put("jsonError", errorList);
			data.put("jsonThreat", threatList);
			data.put("jsonCrew", crewInterview);
			data.put("jsonAttach", attachList);
			data.put("jsonApproach", approachList);

			return data;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}

	}

	private Map<String, Object> queryActivityForPc(String activityId, String serverIp, String serverPort,
			String flyStageName) throws Exception {
		try {
			Map<String, Object> data = new HashMap<String, Object>();
			// 为pc端传送数据
			if (!StringUtils.isEmpty(flyStageName)) {
				if (FlyStageNameEnum.BASEINFO.getKey().equals(flyStageName)) {// 传基础信息
					ObserveActivityDO observeDO = observeActivityDao.internalGetById(Integer.valueOf(activityId));
					Map<String, Object> paramMap = new HashMap<String, Object>();
					paramMap.put("planId", String.valueOf(observeDO.getPlanId()));
					Map<String, Object> plan = taskPlanDao.queryTaskPlans(paramMap);
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> planList = (List<Map<String, Object>>) plan.get("result");
					List<ErrorManageDO> errorList = errorManageDao.pullErrorManage(activityId);
					List<ThreatManageDO> threatList = threatManageDao.pullThreatMnanage(activityId);
					Map<String, Object> observeMap = new HashMap<String, Object>();
					observeMap.put("observeActivity", observeDO);
					data.put("jsonObserve", observeMap);
					data.put("jsonPlan", planList.get(0));
					if (errorList == null) {
						data.put("errorNum", null);
					} else {
						data.put("errorNum", errorList.size());
					}
					if (threatList == null) {
						data.put("threatNum", null);
					} else {
						data.put("threatNum", threatList.size());
					}

				} else if (FlyStageNameEnum.THREAT.getKey().equals(flyStageName)) {// 传威胁信息

					List<ThreatManageDO> threatList = threatManageDao.pullThreatMnanage(activityId);
					data.put("jsonThreat", threatList);
				} else if (FlyStageNameEnum.ERROR.getKey().equals(flyStageName)) {// 传差错信息
					List<ErrorManageDO> errorList = errorManageDao.pullErrorManage(activityId);
					data.put("jsonError", errorList);
				} else if (FlyStageNameEnum.CREWINTERVIEW.getKey().equals(flyStageName)) {// 传机组访谈信息
					CrewInterviewDO crewInterview = crewInterviewDao.pullCrewInterview(activityId);
					data.put("jsonCrew", crewInterview);
				} else if (flyStageName.equals("attach")) {// 传附件信息
					List<AttachmentDO> attachList = attachmentDao.pullAttachment(activityId, serverIp, serverPort);
					data.put("jsonAttach", attachList);
				} else {// 观察活动中飞行阶段
					Map<String, Object> observe = observeActivityDao.pullActivity(activityId, flyStageName);
					//获取观察活动下稳定进近参数信息
					List<ObserveApproachDO> approachList = observeApproachDao.queryObserveApproach(activityId);
					data.put("jsonObserve", observe);
					data.put("jsonObserveApproach", approachList);
				}
			}

			return data;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}

	}

	/**
	 * 保存附件
	 * 
	 * @param attachment
	 * @param activityId
	 * @return
	 * @throws Exception
	 */
	public List<Map<String, Object>> saveAttachment(String attachment, String activityId, String activityNo,
			String serverIp, String serverPort) throws Exception {
		List<Map<String, Object>> attachBackIdList = new ArrayList<Map<String, Object>>();
		if (!StringUtils.isBlank(attachment)) {
			List<AttachmentDO> attachList = gson.fromJson(attachment, new TypeToken<List<AttachmentDO>>() {
			}.getType());
			List<AttachmentDO> attaches = attachmentDao.pullAttachment(activityId);// 数据中附件id
			
			for (AttachmentDO attach : attachList) {
				
				if (attach.getId() == null) {// 说明数据中不存在，为新增附件
					// 下载附件到本地
					String sourceUrl = attach.getAttachUrl();// 获取文件http地址

					URL url = new URL(sourceUrl);
					HttpURLConnection conn = (HttpURLConnection) url.openConnection();
					InputStream inputStream = conn.getInputStream();
					// byte[] data = readInputStream(inputStream);
					// 将附件保存到磁盘中
					String saveAttachPath = config.getSavePath();
					if (saveAttachPath.endsWith("/"))
						saveAttachPath = saveAttachPath.substring(0, saveAttachPath.length() - 1);
					// String showAttachName=attach.getAttachShowName();
					String serverAttachName = createFileNameFromClient(attach.getAttachShowName());

					// try {
					// FileUtils.writeByteArrayToFile(
					// new File(saveAttachPath + "/" +"losa"+"/"+ activityNo
					// + "/" + serverAttachName),
					// data);
					// } catch (Exception e) {
					// e.printStackTrace();
					// throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "附件上传失败！");
					// }
					int totalLen = readInputStreamToFile(inputStream,
							saveAttachPath + "/" + "losa" + "/" + activityNo + "/", serverAttachName);
					// 保存到数据库
					attach.setAttachSize(getSizeString(totalLen));// 文件大小
					// attach.setAttachType(FilenameUtils.getExtension(attach
					// .getAttachShowName()));// 文件类型
					attach.setAttachType("losa");
					attach.setAttachUrl(saveAttachPath + "/" + "losa" + "/" + activityNo + "/" + serverAttachName);// 保存地址
					attach.setAttachServerName(serverAttachName);
					
					attach.setActivityId(Integer.valueOf(activityId));
					Integer attachId = (Integer) attachmentDao.internalSave(attach);

					// 生成返回下载的http地址
					StringBuffer backUrl = new StringBuffer("http://");
					backUrl.append(serverIp + ":" + serverPort + "/sms/query.do?");
					backUrl.append("nologin=Y&method=downloadLosaFiles&fileId=" + attachId);
					Map<String, Object> attachbackId = new HashMap<String, Object>();
					attachbackId.put("localId", attach.getLocalId());
					attachbackId.put("serverId", attachId);
					attachbackId.put("serverUrl", backUrl);
					attachBackIdList.add(attachbackId);
				} else {// 数据库已存在，不需要下载
					if (attaches != null) {
						List<AttachmentDO>removeList=new ArrayList<AttachmentDO>();
						for(AttachmentDO att:attaches){
							Integer a=att.getId();
							Integer b=attach.getId();
							
							if(a.intValue()!=b.intValue()){
								removeList.add(att);
							}
						}
						attaches.clear();
						for(AttachmentDO att:removeList){
							attaches.add(att);
						}
						
					}

				}
			}
			// 本地没有而数据库中存在时进行删除
			// 删除附件
			if (attaches != null) {
				for (int i = 0; i < attaches.size(); i++) {
					File file = new File(attaches.get(i).getAttachUrl());
					if (file.exists()) {
						file.delete();
					}
				}
				// 数据库删除
				attachmentDao.delete(attaches);
			}

		}
		return attachBackIdList;
	}

	/**
	 * 从输入流中获取字节数组
	 * 
	 * @param inputStream
	 * @return
	 * @throws IOException
	 */
	public static byte[] readInputStream(InputStream inputStream) throws IOException {
		byte[] buffer = new byte[1024];
		int len = 0;
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		while ((len = inputStream.read(buffer)) != -1) {
			bos.write(buffer, 0, len);
		}
		bos.close();
		return bos.toByteArray();
	}

	/**
	 * 读取远程文件流，直接保存到服务器文件
	 * 
	 * @param inputStream
	 * @param file
	 * @throws IOException
	 */
	public static int readInputStreamToFile(InputStream inputStream, String path, String filename) throws IOException {
		byte[] buffer = new byte[1024];
		int len = 0, totalLen = 0;

		// 先确认文件夹存在
		File f = new File(path);
		if (!f.exists())
			;
		f.mkdirs();
		String file = path + filename;
		try (OutputStream os = new FileOutputStream(file)) {
			while ((len = inputStream.read(buffer)) != -1) {
				os.write(buffer, 0, len);
				totalLen += len;
			}
			os.close();
			inputStream.close();
		} catch (SMSException e) {
			e.printStackTrace();
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "附件上传失败！");
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "附件上传失败！");
		}
		return totalLen;
	}

	/**
	 * 从输出流中获取附件的大小
	 * 
	 * @param byte[]
	 * @return String
	 *
	 */
	public String getSizeString(double size) {

		DecimalFormat df = new DecimalFormat("0.00");
		if (size > 1024 * 1024 * 1024) {
			return df.format(size / 1024.0 / 1024.0 / 1024.0) + "GB";
		}
		if (size > 1024 * 1024) {
			return df.format(size / 1024.0 / 1024.0) + "MB";
		}
		if (size > 1024) {
			return df.format(size / 1024.0) + "KB";
		}
		return df.format(size) + "B";
	}

	/**
	 * 下载文件
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void downloadFiles(HttpServletRequest request, HttpServletResponse response) throws Exception {
		InputStream in = null;
		OutputStream out = null;
		// Map<String, Object> map = new HashMap<String, Object>();
		try {
			// 获取附件ID
			String fileId = request.getParameter("fileId");
			// 根据文件ID获取文件
			List<AttachmentDO> list = attachmentDao.queryById(fileId);
			// 获取文件在服务器上的路径
			String filePath = list.get(0).getAttachUrl();
			// 显示在客户端的文件名
			String fileName = list.get(0).getAttachShowName();
			try {
				in = new FileInputStream(new File(filePath));

				response.setContentType("application/octet-stream");

				response.setHeader("content-disposition",
						"attachment;filename=" + new String(fileName.getBytes("UTF-8"), "ISO-8859-1"));
				out = response.getOutputStream();
				// 将文件输出
				write(in, out);
				// map.put("Code", "success");
				// map.put("resultDesc", "下载附件成功");
				// ResponseHelper.output(response, map);

			} catch (Exception e) {
				e.printStackTrace();
			}

		} catch (Exception e) {
			e.printStackTrace();
			// map.put("Code", "faile");
			// map.put("resultDesc", "下载附件失败");
			// ResponseHelper.output(response, map);
		}

		finally {
			close(in, out);

		}

	}

	/**
	 * 文件上传
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void uploadFile(HttpServletRequest request, HttpServletResponse response) throws Exception {

		InputStream in = null;
		// OutputStream fileData = null;
		List<AttachmentDO> attach = new ArrayList<AttachmentDO>();
		Integer activityId = Integer.valueOf(request.getParameter("id"));
		String activityNumber = request.getParameter("activityNumber");
		request.setCharacterEncoding("UTF-8");
		String type = request.getParameter("type");
		// String username="管理员";
		UserDO user = UserContext.getUser();
		String fullname = user.getFullname();
		Integer userId = Integer.valueOf(request.getParameter("userid"));

		try {
			String uploadFilePath = config.getSavePath();
			if (StringUtils.isBlank(uploadFilePath)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有配置的保存路径！");
			}
			if (uploadFilePath.endsWith("/"))
				uploadFilePath = uploadFilePath.substring(0, uploadFilePath.length() - 1);

			// fileData = new ByteArrayOutputStream();
			List<FileItem> list = getFileItems(request);
			for (FileItem item : list) {
				// 将数据保存到磁盘
				in = item.getInputStream();
				String serverFileName = createFileNameFromClient(item.getName());
				// byte[] data = readInputStream(in);
				// write(in, fileData);
				// FileUtils.writeByteArrayToFile(
				// new File(uploadFilePath + "/" +type+"/"+
				// activityNumber+"/"+serverFileName),
				// data);
				String filepath = uploadFilePath + "/" + type + "/" + activityNumber + "/";
				String filepathname = filepath + serverFileName;
				int totalLen = readInputStreamToFile(in, filepath, serverFileName);

				AttachmentDO attachmentDO = new AttachmentDO();
				attachmentDO.setActivityId(activityId);
				attachmentDO.setAttachServerName(serverFileName);
				attachmentDO.setAttachShowName(item.getName());
				attachmentDO.setAttachSize(getSizeString(totalLen));
				attachmentDO.setAttachType(type);
				attachmentDO.setAttachUrl(filepathname);
				Date date = new Date();
				attachmentDO.setUpdateTime(date);
				attachmentDO.setCreatorName(fullname);
				attachmentDO.setCreator(userId);
				attachmentDO.setLastModifier(userId);
				attach.add(attachmentDO);
			}
			attachmentDao.internalSave(attach);
			if(!StringUtils.isNotBlank(type)){
				if("losa".equals(type)){
					observeActivityDao.modifyUpdateTimeById(activityId);
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} finally {
			IOUtils.closeQuietly(in);
		}
	}

	public void deleteAttachFile(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String attachId = request.getParameter("attachId");
			AttachmentDO attachementDO = attachmentDao.get(Integer.valueOf(attachId));
			if(attachementDO!=null){
				
				
				String uploadFilePath = config.getSavePath();
				File file = new File(uploadFilePath+attachementDO.getAttachUrl());
				if (file.exists()) {
					file.delete();
				}
				attachmentDao.internalDelete(attachementDO);
				if("losa".equals(attachementDO.getAttachType())){
					observeActivityDao.modifyUpdateTimeById(attachementDO.getActivityId());
				}
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("result", "success");
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void deleteFile(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {

			// 删除附件
			String attachment = request.getParameter("attachment");
			AttachmentDO attachementDO = gson.fromJson(attachment, new TypeToken<AttachmentDO>() {
			}.getType());
			String saveName = attachementDO.getAttachServerName();
			String type = attachementDO.getAttachType();
			String activityNumber = request.getParameter("activityNumber");
			File file = new File(config.getSavePath() + "/" + type + "/" + activityNumber + "/" + saveName);
			if (file.exists()) {
				file.delete();
			}
			// 删除数据库中数据
			attachmentDao.internalDelete(attachementDO);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("result", "success");
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

	}

	public void queryFileList(HttpServletRequest request,HttpServletResponse response) throws Exception {
		Map<String, Object> map = new HashMap<String, Object>();
		String activityId=request.getParameter("activityId");
		
		try{
			List<AttachmentDO> attachList = attachmentDao.pullAttachment(activityId);
			/**String serverIp = InetAddress.getLocalHost().getHostAddress();
			String serverPort = String.valueOf(request.getServerPort());
			for (int i = 0; i < attachList.size(); i++) {
				StringBuffer url = new StringBuffer("http://");
				url.append(serverIp + ":" + serverPort + "/sms/query.do?");
				url.append("nologin=Y&method=downloadFiles&fileId="
						+ attachList.get(i).getId());
				attachList.get(i).setAttachUrl(String.valueOf(url));
			  }*/
		    map.put("fileList", attachList);
		    map.put("success", true);
		    map.put("resultDesc", "拉取附件数据成功");
		    ResponseHelper.output(response, map);	
		}catch(Exception e){
			e.printStackTrace();
			map.put("success", "false");
			map.put("resultDesc", "拉取附件数据失败");
			ResponseHelper.output(response, map);
		}
	}

	/**
	 * 文件名的base64码 + "_" + uuid
	 * 
	 * @param uploadFileName
	 * @return
	 */
	private String createFileNameFromClient(String uploadFileName) {
		String docName = null;
		String uuid = UUID.randomUUID().toString();
		int pos = uploadFileName.lastIndexOf(".");
		if (pos > 0) {
			docName = Base64.encodeBase64(uploadFileName.substring(0, pos).getBytes(), true) + "_" + uuid
					+ uploadFileName.substring(pos);
		} else {
			docName = Base64.encodeBase64(uploadFileName.substring(0, pos).getBytes(), true) + "_" + uuid;
		}
		return docName;
	}

	/**
	 * 获取上传的文件列表
	 */
	public List<FileItem> getFileItems(HttpServletRequest request) throws IOException, FileUploadException {

		DiskFileItemFactory fac = new DiskFileItemFactory();
		ServletFileUpload upload = new ServletFileUpload(fac);
		upload.setHeaderEncoding("utf-8");
		@SuppressWarnings("unchecked")
		List<FileItem> list = upload.parseRequest(request);
		List<FileItem> result = new ArrayList<FileItem>();
		for (FileItem item : list) {
			if (!item.isFormField()) {
				result.add(item);
			}
		}
		return result;
	}

	/**
	 * 将输入流写入输出流中
	 * 
	 * @param in
	 *            输入流
	 * @param out
	 *            输出流
	 */
	private void write(InputStream in, OutputStream out) {
		byte[] bytes = new byte[64];
		int rc = 0;
		try {
			while ((rc = in.read(bytes, 0, 64)) > 0) {
				out.write(bytes, 0, rc);
			}
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	/**
	 * 关闭输入输出流
	 * 
	 * @param in
	 *            输入流
	 * @param out
	 *            输出流
	 */
	private void close(InputStream in, OutputStream out) {
		IOUtils.closeQuietly(in);
		IOUtils.closeQuietly(out);
	}

	/**
	 * 查找附件
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void queryAttach(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			String activityId = request.getParameter("activityId");
			List<AttachmentDO> list = attachmentDao.pullAttachment(activityId);
			map.put("success", true);
			map.put("jsonAttach", list);
			ResponseHelper.output(response, map);

		} catch (Exception e) {
			e.printStackTrace();
		}
	}

	// 删除威胁记录
	public void deleteThreatManage(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String threatId = request.getParameter("threatId");
			List<Object> threatIds = gson.fromJson(threatId, new TypeToken<List<Object>>() {
			}.getType());
			if (threatIds.size() > 0) {
				for (int i = 0; i < threatIds.size(); i++) {
					String threa = (String) threatIds.get(i);
					threatManageDao.deleteThreatManage(Integer.valueOf(threa));
				}
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	// 删除差错记录
	public void deleteErrorManage(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String errorId = request.getParameter("errorId");
			List<Object> errorIds = gson.fromJson(errorId, new TypeToken<List<Object>>() {
			}.getType());
			if (errorIds.size() > 0) {
				for (int i = 0; i < errorIds.size(); i++) {
					String error = (String) errorIds.get(i);
					errorManageDao.deleteErrorManage(Integer.valueOf(error));
				}
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public ErrorManageDao getErrorManageDao() {
		return errorManageDao;
	}

	public void setErrorManageDao(ErrorManageDao errorManageDao) {
		this.errorManageDao = errorManageDao;
	}

	public ObserveActivityDao getObserveActivityDao() {
		return observeActivityDao;
	}

	public void setObserveActivityDao(ObserveActivityDao observeActivityDao) {
		this.observeActivityDao = observeActivityDao;
	}

	public ThreatManageDao getThreatManageDao() {
		return threatManageDao;
	}

	public void setThreatManageDao(ThreatManageDao threatManageDao) {
		this.threatManageDao = threatManageDao;
	}

	public CrewInterviewDao getCrewInterviewDao() {
		return crewInterviewDao;
	}

	public void setCrewInterviewDao(CrewInterviewDao crewInterviewDao) {
		this.crewInterviewDao = crewInterviewDao;
	}

	public AttachmentDao getAttachmentDao() {
		return attachmentDao;
	}

	public void setAttachmentDao(AttachmentDao attachmentDao) {
		this.attachmentDao = attachmentDao;
	}

	public Config getConfig() {
		return config;
	}

	public void setConfig(Config config) {
		this.config = config;
	}

	public UnexceptStatusBaseInfoDao getUnexceptStatusBaseInfoDao() {
		return unexceptStatusBaseInfoDao;
	}

	public void setUnexceptStatusBaseInfoDao(UnexceptStatusBaseInfoDao unexceptStatusBaseInfoDao) {
		this.unexceptStatusBaseInfoDao = unexceptStatusBaseInfoDao;
	}

	public CauseFindPersonTypeDao getCauseFindPersonTypeDao() {
		return causeFindPersonTypeDao;
	}

	public void setCauseFindPersonTypeDao(CauseFindPersonTypeDao causeFindPersonTypeDao) {
		this.causeFindPersonTypeDao = causeFindPersonTypeDao;
	}

	public ErrorBaseInfoDao getErrorBaseInfoDao() {
		return errorBaseInfoDao;
	}

	public void setErrorBaseInfoDao(ErrorBaseInfoDao errorBaseInfoDao) {
		this.errorBaseInfoDao = errorBaseInfoDao;
	}

	public ThreatBaseInfoDao getThreatBaseInfoDao() {
		return threatBaseInfoDao;
	}

	public void setThreatBaseInfoDao(ThreatBaseInfoDao threatBaseInfoDao) {
		this.threatBaseInfoDao = threatBaseInfoDao;
	}

	public UserDao getUserDao() {
		return userDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public TaskPlanDao getTaskPlanDao() {
		return taskPlanDao;
	}

	public void setTaskPlanDao(TaskPlanDao taskPlanDao) {
		this.taskPlanDao = taskPlanDao;
	}

	public ScoreDao getScoreDao() {
		return scoreDao;
	}

	public void setScoreDao(ScoreDao scoreDao) {
		this.scoreDao = scoreDao;
	}

	public ScoreTempletDao getScoreTempletDao() {
		return scoreTempletDao;
	}

	public void setScoreTempletDao(ScoreTempletDao scoreTempletDao) {
		this.scoreTempletDao = scoreTempletDao;
	}

	public DictTypeDao getDictypedao() {
		return dictypedao;
	}

	public void setDictypedao(DictTypeDao dictypedao) {
		this.dictypedao = dictypedao;
	}

	public SimpleDateFormat getDateFormat() {
		return dateFormat;
	}

	public void setDateFormat(SimpleDateFormat dateFormat) {
		this.dateFormat = dateFormat;
	}

	public ScoreSelectContentDao getScoreSelectContentDao() {
		return scoreSelectContentDao;
	}

	public void setScoreSelectContentDao(ScoreSelectContentDao scoreSelectContentDao) {
		this.scoreSelectContentDao = scoreSelectContentDao;
	}

	public ObserveApproachDao getObserveApproachDao() {
		return observeApproachDao;
	}

	public void setObserveApproachDao(ObserveApproachDao observeApproachDao) {
		this.observeApproachDao = observeApproachDao;
	}

	public ObserverInfoDao getObserverInfoDao() {
		return observerInfoDao;
	}

	public void setObserverInfoDao(ObserverInfoDao observerInfoDao) {
		this.observerInfoDao = observerInfoDao;
	}
}
