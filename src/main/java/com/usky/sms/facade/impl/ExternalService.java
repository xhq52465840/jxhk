package com.usky.sms.facade.impl;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.alibaba.dubbo.rpc.protocol.rest.support.ContentType;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.directory.EnumSafetyInfoType;
import com.usky.sms.facade.ExternalInterface;
import com.usky.sms.facade.rqrs.AttachmentVO;
import com.usky.sms.facade.rqrs.FlightInfoVO;
import com.usky.sms.facade.rqrs.GetFlightInfoRQ;
import com.usky.sms.facade.rqrs.GetPilotRiskValueRQ;
import com.usky.sms.facade.rqrs.SubmitAircraftCommanderReportRQ;
import com.usky.sms.facade.rqrs.SubmitEmReportRQ;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.flightmovementinfo.AirportDao;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.report.ReportDao;
import com.usky.sms.rewards.RewardsDao;
import com.usky.sms.service.LoginService;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

@Path("rest/externalService")
@Consumes({MediaType.APPLICATION_JSON})
@Produces({ContentType.APPLICATION_JSON_UTF_8})
public class ExternalService implements ExternalInterface {
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(ExternalService.class);
	
	private static final Gson gson = GsonBuilder4SMS.getInstance();
	
	private Config config = Config.getInstance();
	
	private static final Map<String, String> STATISTIC_DISPLAY_NAME = new LinkedHashMap<String, String>() {
		private static final long serialVersionUID = 1791715975664354459L;
		{
			put("activityCount", "信息任务");
			put("auditCount", "审计任务");
			put("riskCount", "风险任务");
			put("actionItemCount", "行动项");
			put("assistCount", "协助任务");
			put("methanolCount", "评审任务");
			put("messageCount", "站内通知");
		}
	};
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private AirportDao airportDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private ReportDao reportDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private LoginService login;
	
	@Autowired
	private RewardsDao rewardsDao;
	
	@GET
	@Path("getToDoStatisticsByPkPsnbasdoc")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces({ContentType.APPLICATION_JSON_UTF_8})
	@Override
	public String getToDoStatisticsByPkPsnbasdoc(@QueryParam(value = "pkPsnbasdoc") String pkPsnbasdoc) {
		List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
		try {
			UserDO user = null;
			if (StringUtils.isNotBlank(pkPsnbasdoc)) {
				user = userDao.getByPkPsnbasdoc(pkPsnbasdoc);
				if (user == null) {
					throw new Exception("用户[" + pkPsnbasdoc + "]不存在SMS系统中!");
				}
			} else {
				user = UserContext.getUser();
				pkPsnbasdoc = user.getPkPsnbasdoc();
			}
			Map<String, Object> statistics = reportDao.getToDoStatistics(user);
			StringBuilder sb = new StringBuilder();
			for (Entry<String, String> entry : STATISTIC_DISPLAY_NAME.entrySet()) {
				sb.append(entry.getValue());
				sb.append("(");
				sb.append(statistics.get(entry.getKey()) == null ? 0 : statistics.get(entry.getKey()));
				sb.append(")、");
			}
			if (sb.length() != 0) {
				sb.deleteCharAt(sb.length() - 1);
			}
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("PkEmp", user.getPkPsnbasdoc());
			data.put("EmpName", user.getFullname());
			data.put("BtDateBegin", new Date().getTime());
			data.put("System", "SMS");
			data.put("Url", config.getHostAddress() + "/sms/uui/com/sms/dash/DashBoard.html");
			data.put("BtTitle", sb.toString());
			result.add(data);
		} catch (Exception e) {
			log.error("获取[" + pkPsnbasdoc + "]的待办统计失败!", e);
		}
		return gson.toJson(result);
	}
	
	@GET
	@Path("getToDoStatistics")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces({ContentType.APPLICATION_JSON_UTF_8})
	@Override
	public String getToDoStatistics(@QueryParam(value = "username") String username) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			UserDO user = null;
			if (StringUtils.isNotBlank(username)) {
				user = userDao.getByUsername(username);
				if (user == null) {
					throw new Exception("用户[" + username + "]不存在SMS系统中!");
				}
			} else {
				user = UserContext.getUser();
				username = user.getUsername();
			}
			result.put("success", true);
			result.put("data", reportDao.getToDoStatistics(user));
		} catch (Exception e) {
			log.error("获取[" + username + "]的待办统计失败!", e);
			result.put("success", false);
			result.put("reason", e.getMessage());
		}
		return gson.toJson(result);
	}
	
	@GET
	@Path("getUserByUsername/{username}")
	@Produces({ContentType.APPLICATION_JSON_UTF_8})
	@Override
	public String getUserByUsername(@PathParam("username") String username) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			UserDO user = userDao.getByUsername(username);
			result.put("data", userDao.convert(user, Arrays.asList(new String[]{"id", "username", "fullname", "email", "telephoneNumber"}), false));
			result.put("success", true);
		} catch (Exception e) {
			log.error("获取[" + username + "]的用户信息失败!", e);
			result.put("success", false);
			result.put("reason", e.getMessage());
		}
		return gson.toJson(result);
	}

	@GET
	@Path("getUnit/{locale}")
	@Produces({ContentType.APPLICATION_JSON_UTF_8})
	@Override
	public String getUnit(@PathParam("locale") String locale) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			List<UnitDO> list = unitDao.getList();
			List<Map<String, Object>> dataList = new ArrayList<Map<String,Object>>();
			for (UnitDO unit : list) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", unit.getId());
				if (Locale.ENGLISH.getLanguage().equals(locale)) {
					map.put("name", unit.getNameEn());
				} else {
					map.put("name", unit.getName());
				}
				dataList.add(map);
			}
			
			result.put("success", true);
			result.put("data", dataList);
		} catch (Exception e) {
			log.error("获取安监机构信息失败!", e);
			result.put("success", false);
			result.put("reason", e.getMessage());
		}
		return gson.toJson(result);
	}

	@GET
	@Path("getOrg/{locale}/{unitId}")
	@Produces({ContentType.APPLICATION_JSON_UTF_8})
	@Override
	public String getOrg(@PathParam("locale") String locale, @PathParam("unitId") String unitId) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			List<OrganizationDO> list = organizationDao.getByUnitforEm(unitId);
			List<Map<String, Object>> dataList = new ArrayList<Map<String,Object>>();
			for (OrganizationDO organization : list) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", organization.getId());
				if (Locale.ENGLISH.getLanguage().equals(locale)) {
					map.put("name", organization.getNameEn());
				} else {
					map.put("name", organization.getName());
				}
				dataList.add(map);
			}
			result.put("success", true);
			result.put("data", dataList);
		} catch (Exception e) {
			log.error("获取安监机构[" + unitId + "]的组织信息失败!", e);
			result.put("success", false);
			result.put("reason", e.getMessage());
		}
		return gson.toJson(result);
	}
	
	@GET
	@Path("getFlightPhase/{locale}")
	@Produces({ContentType.APPLICATION_JSON_UTF_8})
	@Override
	public String getFlightPhase(@PathParam("locale") String locale) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			List<DictionaryDO> list = dictionaryDao.getListByType("飞行阶段");
			List<Map<String, Object>> dataList = new ArrayList<Map<String,Object>>();
			for (DictionaryDO dic : list) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", dic.getId());
				if (Locale.ENGLISH.getLanguage().equals(locale)) {
					map.put("name", dic.getNameEn());
				} else {
					map.put("name", dic.getName());
				}
				dataList.add(map);
			}
			
			result.put("success", true);
			result.put("data", dataList);
		} catch (Exception e) {
			log.error("获取飞行阶段信息失败!", e);
			result.put("success", false);
			result.put("reason", e.getMessage());
		}
		return gson.toJson(result);
	}
	
	@POST
	@Path("getFlightInfo")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces({ContentType.APPLICATION_JSON_UTF_8})
	@Override
	public String getFlightInfo(GetFlightInfoRQ rq) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			// 参数校验
			this.checkGetFlightInfoRQ(rq);

			Integer start = rq.getStart() == null ? null : Integer.parseInt(rq.getStart());
			Integer length = rq.getLength() == null ? null : Integer.parseInt(rq.getLength());
			Map<String, Object> resultMap = airportDao.getBaseInfo(DateHelper.parseIsoDate(rq.getDateTime()), rq.getFlightNo(), start, length);
			result.put("success", true);
			result.put("data", resultMap);
		} catch (Exception e) {
			log.error("获取航班信息失败! 参数: " + gson.toJson(rq), e);
			result.put("success", false);
			result.put("reason", e.getMessage());
		}
		return gson.toJson(result);
	}
	
	private void checkGetFlightInfoRQ(GetFlightInfoRQ rq) throws Exception {
		try {
			if (rq == null) {
				throw new Exception("参数GetFlightInfoRQ不能为空");
			}
			if (rq.getDateTime() == null) {
				throw new Exception("参数dateTime不能为空");
			}
		} catch (Exception e) {
			throw new Exception("参数校验异常：" + e.getMessage());
		}
	}
	
	@POST
	@Path("uploadFile/{username}")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	@Produces({ContentType.APPLICATION_JSON_UTF_8})
	@Override
	public String uploadFile(@PathParam("username") String username, @Context HttpServletRequest request) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			if (request == null) {
				throw new Exception("request为空");
			}
			UserDO user = userDao.getByUsername(username);
			if (user == null) {
				throw new Exception("用户[" + username + "]不存在SMS系统中!");
			}
			Config config = Config.getInstance();
			String uploadFilePath = config.getUploadFilePath();
			if (StringUtils.isBlank(uploadFilePath)) {
				throw new Exception("没有配置上传文件的保存路径!");
			}
			//attachmentType:0, sourceType:3
			List<Map<String, Object>> fileItems = fileDao.uploadFile(request, uploadFilePath);
			
			List<FileDO> files = fileDao.saveFiles(fileItems, user, EnumFileType.SAFETYINFORMATION.getCode(), null, null, null, String.valueOf(EnumSafetyInfoType.OTHER.getCode()));
			List<Integer> fileIds = new ArrayList<Integer>();
			for (FileDO file : files) {
				fileIds.add(file.getId());
			}
			result.put("success", true);
			result.put("data", fileIds);
		} catch (Exception e) {
			log.error("上传文件失败!", e);
			result.put("success", false);
			result.put("reason", e.getMessage());
		}
		return gson.toJson(result);
	}
	
	@POST
	@Path("submitEmReport")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces({ContentType.APPLICATION_JSON_UTF_8})
	@Override
	public String submitEmReport(SubmitEmReportRQ rq) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			// 参数校验
			this.checkSubmitEmReportRQ(rq);

			// 登录校验
			if (!rq.isAnonymous()) {
				login.loginFromOaToSms(rq.getTicket());
			} else {
				rq.setUserCode("ANONYMITY");
			}

			Map<String, Object> map = gson.fromJson(gson.toJson(rq), new TypeToken<Map<String, Object>>() {}.getType());
			activityDao.submitEmReport(map);
			result.put("success", true);
			result.put("data", null);
		} catch (Exception e) {
			log.error("上报员工报告失败!参数: " + gson.toJson(rq), e);
			result.put("success", false);
			result.put("reason", e.getMessage());
		}
		return gson.toJson(result);
	}
	
	private void checkSubmitEmReportRQ(SubmitEmReportRQ rq) throws Exception {
		try {
			if (rq == null) {
				throw new Exception("参数SubmitEmReportRQ不能为空");
			}
			if (StringUtils.isBlank(rq.getUserCode())) {
				throw new Exception("参数userCode不能为空");
			}
			if (rq.getUnit() == null) {
				throw new Exception("参数unit不能为空");
			}
			if (StringUtils.isBlank(rq.getDealDepartment())) {
				throw new Exception("参数dealDepartment不能为空");
			}
			if (StringUtils.isBlank(rq.getOccurDate())) {
				throw new Exception("参数occurDate不能为空");
			}
			if (StringUtils.isBlank(rq.getSummary())) {
				throw new Exception("参数summary不能为空");
			}
			if (StringUtils.isBlank(rq.getDescription())) {
				throw new Exception("参数description不能为空");
			}
			if (StringUtils.isBlank(rq.getMtype())) {
				throw new Exception("参数mtype不能为空");
			}
			if (rq.getFlightInfos() != null) {
				for (FlightInfoVO flightInfoVO : rq.getFlightInfos()) {
					if (flightInfoVO == null) {
						throw new Exception("参数FlightInfoVO不能为空");
					}
					if (StringUtils.isBlank(flightInfoVO.getFlightInfo())) {
						throw new Exception("参数FlightInfoVO.FlightInfo不能为空");
					}
					if (StringUtils.isBlank(flightInfoVO.getFlightPhase())) {
						throw new Exception("参数FlightInfoVO.FlightPhase不能为空");
					}
				}
			}
			if (rq.getAttachments() != null) {
				for (AttachmentVO attachment : rq.getAttachments()) {
					if (attachment == null) {
						throw new Exception("参数attachment不能为空");
					}
					if (attachment.getAttachmentId() == null) {
						throw new Exception("参数attachment.AttachmentId不能为空");
					}
				}
			}
			if (!rq.isAnonymous() && StringUtils.isBlank(rq.getTicket())) {
				throw new Exception("参数ticket不能为空");
			}
		} catch (Exception e) {
			throw new Exception("参数校验异常：" + e.getMessage());
		}
	}
	
	@POST
	@Path("submitAircraftCommanderReport")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces({ContentType.APPLICATION_JSON_UTF_8})
	@Override
	public String submitAircraftCommanderReport(SubmitAircraftCommanderReportRQ rq) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			// 参数校验
			this.checkSubmitAircraftCommanderReportRQ(rq);

			// 登录校验
//			login.loginFromOaToSms(rq.getTicket());

			Map<String, Object> map = gson.fromJson(gson.toJson(rq), new TypeToken<Map<String, Object>>() {}.getType());

			/******************************luobin added**********************************/
			/**机长报告是否已提交过判断逻辑*/
			List<Map<String, Object>> flightInfos = (List<Map<String, Object>>) map.get("flightInfos");
			if (flightInfos != null && flightInfos.size() > 0) {
				Map<String, Object> flightInfo = flightInfos.get(0);
				String flightId = (String) flightInfo.get("flightInfo");
				int captainReportCnt = activityDao.getCaptainReportCnt(flightId);
				if (captainReportCnt > 0) {
					// 已提交过
					throw SMSException.CAPTAIN_REPORT_EXIST;
				}
			}
			/******************************luobin added**********************************/
			
			// 电话的处理
			if (StringUtils.isBlank(rq.getReporterPhone())) {
				UserDO user = userDao.getByUsername(rq.getUserCode());
				map.put("reporterPhone", user.getTelephoneNumber());
			}
			activityDao.submitAircraftCommanderReport(map);
			result.put("success", true);
			result.put("data", null);
		} catch (Exception e) {
			log.error("上报机长报告失败!参数: " + gson.toJson(rq), e);
			result.put("success", false);
			result.put("reason", e.getMessage());
		}
		return gson.toJson(result);
	}
	
	private void checkSubmitAircraftCommanderReportRQ(SubmitAircraftCommanderReportRQ rq) throws Exception {
		try {
			if (rq == null) {
				throw new Exception("参数SubmitAircraftCommanderReportRQ不能为空");
			}
			if (StringUtils.isBlank(rq.getUserCode())) {
				throw new Exception("参数userCode不能为空");
			}
			if (StringUtils.isBlank(rq.getOccurDate())) {
				throw new Exception("参数occurDate不能为空");
			}
			if (StringUtils.isBlank(rq.getSummary())) {
				throw new Exception("参数summary不能为空");
			}
			if (StringUtils.isBlank(rq.getDescription())) {
				throw new Exception("参数description不能为空");
			}
			if (StringUtils.isBlank(rq.getMtype())) {
				throw new Exception("参数mtype不能为空");
			}
			if (rq.getFlightInfos() == null || rq.getFlightInfos().isEmpty()) {
				throw new Exception("参数flightInfos不能为空");
			}
			if (rq.getFlightInfos().size() > 1) {
				throw new Exception("参数flightInfos的size只能为1");
			}
			for (FlightInfoVO flightInfoVO : rq.getFlightInfos()) {
				if (flightInfoVO == null) {
					throw new Exception("参数FlightInfoVO不能为空");
				}
				if (StringUtils.isBlank(flightInfoVO.getFlightInfo())) {
					throw new Exception("参数FlightInfoVO.FlightInfo不能为空");
				}
				if (StringUtils.isBlank(flightInfoVO.getFlightPhase())) {
					throw new Exception("参数FlightInfoVO.FlightPhase不能为空");
				}
			}
			if (rq.getAttachments() != null) {
				for (AttachmentVO attachment : rq.getAttachments()) {
					if (attachment == null) {
						throw new Exception("参数attachment不能为空");
					}
					if (attachment.getAttachmentId() == null) {
						throw new Exception("参数attachment.AttachmentId不能为空");
					}
				}
			}
//			if (StringUtils.isBlank(rq.getTicket())) {
//				throw new Exception("参数ticket不能为空");
//			}
		} catch (Exception e) {
			throw new Exception("参数校验异常：" + e.getMessage());
		}
	}
	
	@POST
	@Path("getPilotRiskValue")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces({ContentType.APPLICATION_JSON_UTF_8})
	@Override
	public String getPilotRiskValue(GetPilotRiskValueRQ rq) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			// 参数校验
			this.checkGetPilotRiskValueRQ(rq);
			Date queryDate = DateHelper.parseIsoDate(rq.getQueryDate());
			if (queryDate == null) {
				throw new Exception("参数queryDate[" + rq.getQueryDate() + "]格式不正确");
			}
			Map<String, Object> riskValue = rewardsDao.getPilotRiskValue(rq.getPkPsnbasdocs(), queryDate);
			result.put("success", true);
			result.put("data", riskValue);
		} catch (Exception e) {
			log.error("上报机长报告失败!参数: " + gson.toJson(rq), e);
			result.put("success", false);
			result.put("reason", e.getMessage());
		}
		return gson.toJson(result);
	}
	
	private void checkGetPilotRiskValueRQ(GetPilotRiskValueRQ rq) throws Exception {
		try {
			if (rq == null) {
				throw new Exception("参数GetPilotRiskValueRQ不能为空");
			}
			if (StringUtils.isBlank(rq.getQueryDate())) {
				throw new Exception("参数queryDate不能为空");
			}
			if (rq.getPkPsnbasdocs() == null || rq.getPkPsnbasdocs().length == 0) {
				throw new Exception("参数pkPsnbasdocs不能为empty");
			}
			if (rq.getPkPsnbasdocs().length > 1000) {
				throw new Exception("参数pkPsnbasdocs的length不能大于1000");
			}
		} catch (Exception e) {
			throw new Exception("参数校验异常：" + e.getMessage());
		}
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

	public void setAirportDao(AirportDao airportDao) {
		this.airportDao = airportDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setReportDao(ReportDao reportDao) {
		this.reportDao = reportDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}

	public void setLogin(LoginService login) {
		this.login = login;
	}

	public void setRewardsDao(RewardsDao rewardsDao) {
		this.rewardsDao = rewardsDao;
	}
}
