
package com.usky.sms.tem;

import java.sql.Timestamp;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.report.ReportDao;
import com.usky.sms.tem.consequence.ConsequenceDO;
import com.usky.sms.tem.consequence.ConsequenceDao;
import com.usky.sms.tem.error.ErrorDao;
import com.usky.sms.tem.insecurity.InsecurityDao;
import com.usky.sms.tem.threat.ThreatDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;

public class TemService extends AbstractService {
	
	@Autowired
	private ControlMeasureDao controlMeasureDao;
	
	@Autowired
	private TemDao temDao;
	
	@Autowired
	private ConsequenceDao consequenceDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private InsecurityDao insecurityDao;
	
	@Autowired
	private ErrorDao errorDao;
	
	@Autowired
	private ThreatDao threatDao;
	
	@Autowired
	private ReportDao reportDao;
	
	@Autowired
	private ErrorMappingDao errorMappingDao;
	
	@Autowired
	private ThreatMappingDao threatMappingDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	
	private static final DecimalFormat df = new DecimalFormat("0.000");
	
	private static final Integer wp = 10000;
	
	public void addError(HttpServletRequest request, HttpServletResponse response) {
		try {
			int temId = Integer.parseInt(request.getParameter("tem"));
			int[] errors = gson.fromJson(request.getParameter("errors"), new TypeToken<int[]>() {}.getType());
			temDao.addError(temId, errors);

			// 更新tem信息到solr
			TemDO tem = temDao.internalGetById(temId);
			temDao.updateTemInfoToSolr(tem);

			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void addThreat(HttpServletRequest request, HttpServletResponse response) {
		try {
			int temId = Integer.parseInt(request.getParameter("tem"));
			int[] threats = gson.fromJson(request.getParameter("threats"), new TypeToken<int[]>() {}.getType());
			temDao.addThreat(temId, threats);
			
			// 更新tem信息到solr
			TemDO tem = temDao.internalGetById(temId);
			temDao.updateTemInfoToSolr(tem);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void removeError(HttpServletRequest request, HttpServletResponse response) {
		try {
			int errorId = Integer.parseInt(request.getParameter("error"));

			// 更新solr用
			ErrorMappingDO mapping = errorMappingDao.internalGetById(errorId);
			TemDO tem = mapping.getTem();

			temDao.removeError(errorId);

			// 更新tem信息到solr
			temDao.updateTemInfoToSolr(tem);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void removeThreat(HttpServletRequest request, HttpServletResponse response) {
		try {
			int threatId = Integer.parseInt(request.getParameter("threat"));

			// 更新solr用
			ThreatMappingDO mapping = threatMappingDao.internalGetById(threatId);
			TemDO tem = mapping.getTem();

			temDao.removeThreat(threatId);

			// 更新tem信息到solr
			temDao.updateTemInfoToSolr(tem);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void saveControlMeasures(HttpServletRequest request, HttpServletResponse response) {
		try {
			String error = request.getParameter("error");
			String threat = request.getParameter("threat");
			Integer errorId = error == null ? null : Integer.parseInt(error);
			Integer threatId = threat == null ? null : Integer.parseInt(threat);
			List<Map<String, Object>> controlMeasureMaps = gson.fromJson(request.getParameter("controlMeasures"), new TypeToken<List<Map<String, Object>>>() {}.getType());
			controlMeasureDao.saveControlMeasures(errorId, threatId, controlMeasureMaps);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/*
	 * 根据安监机构、不安全状态、开始日期和截止日期查询重大风险所对应的严重条款的分数
	 */
	public void calculateByMultiCon(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer unit = null;
			Integer insecurityid = null;
			Integer system = null;
			if (!("0".equals(request.getParameter("insecurityid")))) {
				insecurityid = Integer.parseInt(request.getParameter("insecurityid"));
			}
			if (!("0".equals(request.getParameter("unitId")))) {
				unit = Integer.parseInt(request.getParameter("unitId"));
			}
			if (!("0").equals(request.getParameter("systemId"))) {
				system = Integer.parseInt(request.getParameter("systemId"));
			}
			// 时间轴
			List<String> timeData = new ArrayList<String>();
			List<Map<String, Object>> calculates = new ArrayList<Map<String, Object>>();
			// 当前时间
			Date currentDate = new Date();
			List<Object[]> actualList = temDao.calculateByMultiCon(unit, system, insecurityid, currentDate);
			Map<String,Double> flyTimeMap = reportDao.getFlyTimePerMonth(DateUtils.addMonths(currentDate, -12), DateUtils.addMonths(currentDate, -1));
			Double riskParam = reportDao.getRiskParam();
			for (int i = -12; i < 0; i++) {
				Map<String, Object> map = new LinkedHashMap<String, Object>();
				Date first = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(currentDate, i));
				Date last = DateHelper.getLastDayOfMonth(DateUtils.addMonths(currentDate, i));
				String firstDateString = DateHelper.formatDate(first, "yyyy-MM");
				String lastDateString = DateHelper.formatDate(last, "yyyy-MM");
				Double flyTime = flyTimeMap.get(firstDateString) == null ? 1.0 : flyTimeMap.get(lastDateString);
				Double value = 0.0;
				for (Object[] o : actualList) {
					if (o[0] != null && o[1] != null) {
						if(((Timestamp) o[0]).compareTo(first) == 0){
							value = value + Double.parseDouble(o[1].toString());
						}
						if (((Timestamp) o[0]).after(first) && ((Timestamp) o[0]).before(last)) {
							value = value + Double.parseDouble(o[1].toString());
						}
					}
				}
				Map<String, Double> warnMap = reportDao.getGaugeWarningValue(system, insecurityid, first, flyTime,riskParam);
				double median = value * wp / flyTime;
				map.putAll(reportDao.getGaugeParam(median, warnMap.get("average"), warnMap.get("warning")));
				timeData.add(DateHelper.formatIsoDate(first));
				calculates.add(map);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("timeData", timeData);
			map.put("calculates", calculates);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/*
	 * 查询不安全状态
	 */
	public void getInsecurityList(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer unitId = Integer.parseInt(request.getParameter("unitId"));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", temDao.getInsecurityList(unitId));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/*
	 * 返回距当前时间的前12个月，并且查询出每个月的安全信息的分数
	 */
	public void calculateLine(HttpServletRequest request, HttpServletResponse response) {
		try {
			Date date = new Date();
			List<String> list = new ArrayList<String>();
			for (int i = 1; i <= 12; i++) {
				Date tempDate = DateUtils.addMonths(date, -i);
				Calendar cal = Calendar.getInstance();
				cal.setTime(tempDate);
				list.add(cal.get(Calendar.MONTH) + 1 + "月");
			}
			Collections.reverse(list);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", temDao.calculateLine());
			map.put("time", list);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/*
	 * 根据安监机构返回距当前时间的前12个月，并且查询出每个月的安全信息的分数
	 */
	public void calculateLineByItem(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer unit = null;
			Integer sysType = null;
			if (!("0".equals(request.getParameter("unit")))) {
				unit = Integer.parseInt(request.getParameter("unit"));
			}
			if (!("0".equals(request.getParameter("sysType")))) {
				sysType = Integer.parseInt(request.getParameter("sysType"));
			}
			Date date = new Date();
			List<String> list = new ArrayList<String>();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM");
			for (int i = 1; i <= 12; i++) {
				Date tempDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
				list.add(sdf.format(tempDate));
			}
			Collections.reverse(list);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", temDao.calculateLineByItem(unit, sysType));
			map.put("time", list);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/*
	 * 根据安监机构和重大风险返回不安全状态的分数
	 */
	public void calculateInsecurity(HttpServletRequest request, HttpServletResponse response) {
		try {
			String unit = "";
			String sysType = "";
			if ("0".equals(request.getParameter("unit"))) {
				unit = null;
			} else {
				unit = request.getParameter("unit");
			}
			if ("0".equals(request.getParameter("sysType"))) {
				sysType = null;
			} else {
				sysType = request.getParameter("sysType");
			}
			String consequence = request.getParameter("consequence");
			Date date = new Date();
			List<String> list = new ArrayList<String>();
			for (int i = 1; i <= 12; i++) {
				Date tempDate = DateUtils.addMonths(date, -i);
				Calendar cal = Calendar.getInstance();
				cal.setTime(tempDate);
				list.add(cal.get(Calendar.MONTH) + 1 + "月");
			}
			Collections.reverse(list);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", temDao.calculateInsecurity(unit, consequence, sysType));
			map.put("time", list);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 根据安监机构、不安全状态返回距当前时间上个月的前12个月，并且查询出每个月的威胁、差错的分数
	 */
	@SuppressWarnings("unchecked")
	public void calculateByMultiConForThreatAndError(HttpServletRequest request, HttpServletResponse response) {
		try {
			String obj = request.getParameter("obj");
			Map<String, String> datamap = gson.fromJson(obj, new TypeToken<Map<String, String>>() {}.getType());
			Integer unitId = StringUtils.isBlank(datamap.get("unitId")) ? null : Integer.parseInt(datamap.get("unitId"));
			if (new Integer(0).equals(unitId)) {
				unitId = null;
			}
			Integer systemId = StringUtils.isBlank(datamap.get("systemId")) ? null : Integer.parseInt(datamap.get("systemId"));
			if (new Integer(0).equals(systemId)) {
				systemId = null;
			}
			Integer insecurityId = StringUtils.isBlank(datamap.get("insecurityId")) ? null : Integer.parseInt(datamap.get("insecurityId"));
			if (new Integer(0).equals(insecurityId)) {
				insecurityId = null;
			}
			String paramType = datamap.get("paramType");
			String selectedDate = datamap.get("date");
			
			if (!StringUtils.isBlank(selectedDate)) {
				SimpleDateFormat sdf0 = new SimpleDateFormat("yyyy/MM/dd");
				SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd");
				Date date = sdf0.parse(selectedDate);
				// 将yyyy/MM/dd转换成yyyy-MM-dd
				selectedDate = sdf1.format(date);
			}
			// 选择的threat或error的id
			String idStr = request.getParameter("ids");
			String[] ids = null;
			if (!StringUtils.isBlank(idStr)) {
				ids = gson.fromJson(idStr, String[].class);
			}
			List<List<Map<String, String>>> scoreListOneYear = new ArrayList<List<Map<String, String>>>();
			List<Integer> insecurityIdListOneYear = new ArrayList<Integer>();
			// 当前时间
			Date currentDate = new Date();
			Date begin = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(currentDate, -12));
			Date end = DateHelper.getLastDayOfMonth(DateUtils.addMonths(currentDate, -1));
			// 时间轴
			List<String> timeData = temDao.generateTimeData(begin, end);
			Map<String, Object> scoreMap = null;
			if ("threat".equals(paramType)) {
				if (!StringUtils.isBlank(selectedDate)) {
					scoreMap = temDao.calculateByMultiConForThreat(unitId, insecurityId, systemId, begin, end, selectedDate, ids);
				} else {
					scoreMap = temDao.calculateByMultiConForThreat(unitId, insecurityId, systemId, begin, end);
				}
			} else if ("error".equals(paramType)) {
				if (!StringUtils.isBlank(selectedDate)) {
					scoreMap = temDao.calculateByMultiConForError(unitId, insecurityId, systemId, begin, end, selectedDate, ids);
				} else {
					scoreMap = temDao.calculateByMultiConForError(unitId, insecurityId, systemId, begin, end);
				}
			}
			
			for (String time : timeData) {
				List<Map<String, String>> scoreListOneMonth = null;
				Map<String, Object> socreMapForOneMonth = null;
				socreMapForOneMonth = (Map<String, Object>) scoreMap.get(time);
				scoreListOneMonth = (List<Map<String, String>>) socreMapForOneMonth.get("scoreList");
				insecurityIdListOneYear.add((Integer) socreMapForOneMonth.get("insecurityId"));
				scoreListOneYear.add(scoreListOneMonth);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("timeData", timeData);
			map.put("scoreListOneYear", scoreListOneYear);
			map.put("insecurityIdListOneYear", insecurityIdListOneYear);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 根据安监机构、不安全状态、系统、时间返回给定时间的月份的威胁、差错的分数
	 */
	@SuppressWarnings("unchecked")
	public void calculateByMultiConOneMonthForThreatAndError(HttpServletRequest request, HttpServletResponse response) {
		try {
			String obj = request.getParameter("obj");
			Map<String, String> datamap = gson.fromJson(obj, new TypeToken<Map<String, String>>() {}.getType());
			Integer unitId = StringUtils.isBlank(datamap.get("unitId")) ? null : Integer.parseInt(datamap.get("unitId"));
			if (new Integer(0).equals(unitId)) {
				unitId = null;
			}
			
			Integer systemId = StringUtils.isBlank(datamap.get("systemId")) ? null : Integer.parseInt(datamap.get("systemId"));
			if (new Integer(0).equals(systemId)) {
				systemId = null;
			}
			
			Integer insecurityId = StringUtils.isBlank(datamap.get("insecurityId")) ? null : Integer.parseInt(datamap.get("insecurityId"));
			if (new Integer(0).equals(insecurityId)) {
				insecurityId = null;
			}
			String dateString = datamap.get("date");
			SimpleDateFormat sdf0 = new SimpleDateFormat("yyyy/MM/dd");
			SimpleDateFormat sdf1 = new SimpleDateFormat("yyyy-MM-dd");
			Date date = null;
			Date begin = null;
			Date end = null;
			if (StringUtils.isBlank(dateString)) {
				date = new Date();
			} else {
				date = sdf0.parse(dateString);
			}
			begin = DateHelper.getFirstDayOfMonth(date);
			end = DateHelper.getLastDayOfMonth(date);
			
			String paramType = datamap.get("paramType");
			Map<String, Object> scoreMap = null;
			if ("threat".equals(paramType)) {
				scoreMap = temDao.calculateByMultiConForThreat(unitId, insecurityId, systemId, begin, end);
			} else if ("error".equals(paramType)) {
				scoreMap = temDao.calculateByMultiConForError(unitId, insecurityId, systemId, begin, end);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("scoreListOneMonth", ((Map<String, Object>) scoreMap.get(sdf1.format(begin))).get("scoreList"));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * tem统计表
	 * 
	 * @param request
	 * @param response
	 */
	public void getScoreBySysType(HttpServletRequest request, HttpServletResponse response) {
		try {
			String paramdate = request.getParameter("date");
			Date firstDay = null;
			Date lastDay = null;
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
			Date date = new Date();
			if (paramdate == null) {
				firstDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -1));
				lastDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
			} else {
				firstDay = DateHelper.getFirstDayOfMonth(sdf.parse(paramdate));
				lastDay = DateHelper.getLastDayOfMonth(sdf.parse(paramdate));
			}
			Calendar cal = Calendar.getInstance();
			cal.setTime(firstDay);
			List<UnitDO> units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName(), null);
			Double flytime = reportDao.getFlyTime(firstDay);
			List<DictionaryDO> sysType = dictionaryDao.getListByType("系统分类");
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			if(units.size() > 0) {
				list = temDao.getScoreBySysType(units, firstDay, lastDay,flytime,sysType);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", list);
			map.put("year", cal.get(Calendar.YEAR));
			map.put("month", cal.get(Calendar.MONTH) + 1);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 每个系统的重大风险雷达图
	 * 
	 * @param request
	 * @param response
	 */
	public void drawRadar(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer sysType = null;
			Integer unitId = null;
			Date firstDay = null;
			Date lastDay = null;
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
			if (request.getParameter("date") != null) {
				firstDay = DateHelper.getFirstDayOfMonth(sdf.parse(request.getParameter("date")));
				lastDay = DateHelper.getLastDayOfMonth(sdf.parse(request.getParameter("date")));
			}
			if (!("0".equals(request.getParameter("sysTypeId")))) {
				sysType = Integer.parseInt(request.getParameter("sysTypeId"));
			}
			if (!("0").equals(request.getParameter("unitId"))) {
				unitId = Integer.parseInt(request.getParameter("unitId"));
			}
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
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", list);
			map.put("timeline", reportDao.getTimeLine());
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void drawLine(HttpServletRequest request, HttpServletResponse response) {
		try {
			Date date = new Date();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM");
			String consequence = request.getParameter("consequence");
			Integer unit = null;
			Integer sysType = null;
			if (!("0").equals(request.getParameter("unit"))) {
				unit = Integer.parseInt(request.getParameter("unit"));
			}
			if (!("0").equals(request.getParameter("sysType"))) {
				sysType = Integer.parseInt(request.getParameter("sysType"));
			}
			List<String> timeline = new ArrayList<String>();
			for (int i = -12; i < 0; i++) {
				Date firstDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, i));
				timeline.add(sdf.format(firstDay));
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", temDao.drawLine(consequence, date, unit, sysType));
			map.put("timeline", timeline);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getScoreByUnit(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer unit = null;
			if (!("0".equals(request.getParameter("unit")))) {
				unit = Integer.parseInt(request.getParameter("unit"));
			}
			Date date = new Date();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
			Date beginDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -1));
			Date endDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", temDao.getScoreByUnit(unit, beginDay, endDay));
			map.put("sum", temDao.sumScoreByUnit(unit, beginDay, endDay));
			map.put("warningValue", temDao.warnScoreByUnit(unit));
			map.put("date", sdf.format(beginDay));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void drawGaugeByInsecurity(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer insecurity = null;
			Integer unit = null;
			Integer sysType = null;
			Integer consequence = null;
			if (!("0").equals(request.getParameter("consequence"))) {
				consequence = Integer.parseInt(request.getParameter("consequence"));
			}
			if (!("0").equals(request.getParameter("insecurity"))) {
				insecurity = Integer.parseInt(request.getParameter("insecurity"));
			}
			if (!("0").equals(request.getParameter("unit"))) {
				unit = Integer.parseInt(request.getParameter("unit"));
			}
			if (!("0").equals(request.getParameter("sysType"))) {
				sysType = Integer.parseInt(request.getParameter("sysType"));
			}
			Date date = new Date();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
			Date beginDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -1));
			Date endDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
			if (request.getParameter("date") != null && !("".equals(request.getParameter("date")))) {
				beginDay = DateHelper.getFirstDayOfMonth(sdf.parse(request.getParameter("date")));
				endDay = DateHelper.getLastDayOfMonth(sdf.parse(request.getParameter("date")));
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", temDao.drawGaugeByInsecurity(insecurity, unit, sysType, consequence, beginDay, endDay));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void drawGaugeAll(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer unit = null;
			Integer sysType = null;
			String consequence = request.getParameter("consequence");
			if (!("0").equals(request.getParameter("unit"))) {
				unit = Integer.parseInt(request.getParameter("unit"));
			}
			if (!("0").equals(request.getParameter("sysType"))) {
				sysType = Integer.parseInt(request.getParameter("sysType"));
			}
			Date date = new Date();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
			Date beginDay = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -1));
			Date endDay = DateHelper.getLastDayOfMonth(DateUtils.addMonths(date, -1));
			if (request.getParameter("date") != null) {
				beginDay = DateHelper.getFirstDayOfMonth(sdf.parse(request.getParameter("date")));
				endDay = DateHelper.getLastDayOfMonth(sdf.parse(request.getParameter("date")));
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", temDao.drawGaugeAll(consequence, unit, sysType, beginDay, endDay));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getTOrRforActivity(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			List<Map<String, Object>> list1 = new ArrayList<Map<String, Object>>();
			List<Object> list2 = new ArrayList<Object>();
			String type = request.getParameter("type");
			String category = request.getParameter("category");
			Integer systemId = request.getParameter("systemId") == null ? null : Integer.parseInt(request.getParameter("systemId").toString());
			Integer insecurityId = request.getParameter("insecurityId") == null ? null : Integer.parseInt(request.getParameter("insecurityId").toString());
			if ("ERROR".equals(type)) {
				if (category != null && !"".equals(category)) {
					list1 = errorDao.getErrorForInputActivity(systemId, insecurityId, category);
					map.put("data", list1);
				} else {
					list2 = errorDao.getErrorCategoryForInputActivity(systemId);
					map.put("data", list2);
				}
			} else if ("THREAT".equals(type)) {
				if (category != null && !"".equals(category)) {
					list1 = threatDao.getThreatForInputActivity(systemId, insecurityId, category);
					map.put("data", list1);
				} else {
					list2 = threatDao.getThreatCategoryForInputActivity(systemId);
					map.put("data", list2);
				}
			} else if ("OERROR".equals(type)) {
				list1 = errorDao.getOErrorForInputActivity(systemId, insecurityId, category);
				map.put("data", list1);
			} else if ("OTHREAT".equals(type)) {
				list1 = threatDao.getOThreatForInputActivity(systemId, insecurityId, category);
				map.put("data", list1);
			}
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 获取威胁或差错的分类（一级或二级）
	 * @param request
	 * @param response
	 */
	public void getTOrRCategory(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			List<Map<String, Object>> list1 = new ArrayList<Map<String, Object>>();
			List<Object> list2 = new ArrayList<Object>();
			String type = request.getParameter("type");
			String category = request.getParameter("category");
			Integer systemId = request.getParameter("systemId") == null ? null : Integer.parseInt(request.getParameter("systemId").toString());
			Integer insecurityId = request.getParameter("insecurityId") == null ? null : Integer.parseInt(request.getParameter("insecurityId").toString());
			if ("ERROR".equals(type)) {
				if (category != null && !"".equals(category)) {
					list1 = errorDao.getErrorForInputActivity(systemId, insecurityId, category);
					map.put("data", list1);
				} else {
					list2 = errorDao.getErrorCategoryForInputActivity(systemId);
					map.put("data", list2);
				}
			} else if ("THREAT".equals(type)) {
				if (category != null && !"".equals(category)) {
					list1 = threatDao.getThreatForInputActivity(systemId, insecurityId, category);
					map.put("data", list1);
				} else {
					list2 = threatDao.getThreatCategoryForInputActivity(systemId);
					map.put("data", list2);
				}
			} else if ("OERROR".equals(type)) {
				list1 = errorDao.getOErrorForInputActivity(systemId, insecurityId, category);
				map.put("data", list1);
			} else if ("OTHREAT".equals(type)) {
				list1 = threatDao.getOThreatForInputActivity(systemId, insecurityId, category);
				map.put("data", list1);
			}
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setControlMeasureDao(ControlMeasureDao controlMeasureDao) {
		this.controlMeasureDao = controlMeasureDao;
	}
	
	public void setTemDao(TemDao temDao) {
		this.temDao = temDao;
	}
	
	public void setConsequenceDao(ConsequenceDao consequenceDao) {
		this.consequenceDao = consequenceDao;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setInsecurityDao(InsecurityDao insecurityDao) {
		this.insecurityDao = insecurityDao;
	}
	
	public void setErrorDao(ErrorDao errorDao) {
		this.errorDao = errorDao;
	}
	
	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}
	
	public void setReportDao(ReportDao reportDao) {
		this.reportDao = reportDao;
	}

	public void setErrorMappingDao(ErrorMappingDao errorMappingDao) {
		this.errorMappingDao = errorMappingDao;
	}

	public void setThreatMappingDao(ThreatMappingDao threatMappingDao) {
		this.threatMappingDao = threatMappingDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}
	
	
	
}
