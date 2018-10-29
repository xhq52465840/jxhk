package com.usky.sms.report;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.lang.time.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.DateFormats;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.common.StringHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.custom.CustomFieldDao;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.search.template.DateSearchTemplate;
import com.usky.sms.search.template.ISearchTemplate;
import com.usky.sms.search.template.SearchTemplateRegister;
import com.usky.sms.service.QueryService;
import com.usky.sms.tem.ActionItemDao;
import com.usky.sms.tem.insecurity.InsecurityDao;
import com.usky.sms.user.UserContext;

public class ReportService extends AbstractService {
	
	@Autowired
	private ReportDao reportDao;
	
	@Autowired
	private ActionItemDao actionItemDao;
	
	@Autowired
	private QueryService queryService;
	
	@Autowired
	private CustomFieldDao customFieldDao;
	
	@Autowired
	private InsecurityDao insecurityDao;
	
	@Autowired
	private FieldRegister fieldRegister;
	
	private static final SimpleDateFormat asdf = new SimpleDateFormat("yyyy-MM-dd");
	
	private static final SMSException PLEASE_CHOOSE_DATE = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"请选择发生日期！");
	
	/**
	 * 获取待办的个数统计
	 * 
	 * @param request
	 * @param response
	 */
	public void getToDoStatistics(HttpServletRequest request,HttpServletResponse response) {
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", reportDao.getToDoStatistics(UserContext.getUser()));
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
	 * 根据事件类型查询前12个月的所用次数
	 * 
	 * @param request
	 * @param response
	 */
	public void getByIncidentType(HttpServletRequest request,HttpServletResponse response) {
		try {
			String mark = request.getParameter("mark");//是事件类型[T]还是系统分类[S]
			String symbol = request.getParameter("symbol");//是员工安全报告[E]还是航空安全信息[A]
			Integer unit = null;
			String system = "总数";
			if(!("0".equals(request.getParameter("unit")))){
				unit = Integer.parseInt(request.getParameter("unit"));
			}
			if("T".equals(mark) || mark == "T"){//如果是事件类型
				if(!("总数".equals(request.getParameter("system")))){
					system = request.getParameter("system");
				}
			}
			Date date = new Date();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM");
			List<String> timeList = new ArrayList<String>();
			for (int i = 12; i > 0; i--) {
				Date tempDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
				timeList.add(sdf.format(tempDate));
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", reportDao.getByIncidentType(date, mark,symbol,unit,system));
			map.put("timeline", timeList);
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
	//严重程度
	public void getSeverityScore(HttpServletRequest request,HttpServletResponse response) {
		try {
			String symbol = request.getParameter("symbol");//是员工安全报告[E]还是航空安全信息[A]
			Integer unit = null;
			String system = "总数";
			if(!("0".equals(request.getParameter("unit")))){
				unit = Integer.parseInt(request.getParameter("unit"));
			}
			if(!("总数".equals(request.getParameter("system")))){
				system = request.getParameter("system");
			}
			Date date = new Date();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM");
			List<String> timeList = new ArrayList<String>();
			for (int i = 12; i > 0; i--) {
				Date tempDate = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
				timeList.add(sdf.format(tempDate));
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", reportDao.getSeverityScore(date,unit,system,symbol));
			map.put("timeline", timeList);
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
	
	public void countActivity(HttpServletRequest request,HttpServletResponse response){
		try{
			Integer unit = null;
			if(!("0".equals(request.getParameter("unit")))){
				unit = Integer.parseInt(request.getParameter("unit"));
			}
			SimpleDateFormat sdf = new SimpleDateFormat("MM/dd");
			List<String> timeline = new ArrayList<String>();
			Date date = new Date();
			for(int i = 30; i > 0; i--){
				Date day = DateUtils.addDays(date, -i);
				timeline.add(sdf.format(day));
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", reportDao.countActivity(date,unit));
			map.put("timeline", timeline);
			map.put("success", true);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActionItemByUser(HttpServletRequest request,HttpServletResponse response){
		try{
			Integer userId = UserContext.getUserId();
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", actionItemDao.convert(reportDao.getActionItemByUser(userId)));
			map.put("success", true);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void systemLine(HttpServletRequest request,HttpServletResponse response){
		try{
			Integer unit = null;
			Integer system = null;
			if(!("0".equals(request.getParameter("unit")))){
				unit = Integer.parseInt(request.getParameter("unit"));
			}
			if(!("0").equals(request.getParameter("system"))){
				system = Integer.parseInt(request.getParameter("system"));
			}
			Date date = new Date();
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM");
			List<String> timeLine = new ArrayList<String>();
			for(int i = 12; i > 0; i--){
				Date temp = DateHelper.getFirstDayOfMonth(DateUtils.addMonths(date, -i));
				timeLine.add(sdf.format(temp));
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", reportDao.systemLine(unit,system,date));
			map.put("timeline", timeLine);
			map.put("success", true);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
		
	}
	
	// 重大风险雷达图 OK
	@SuppressWarnings("unchecked")
	public void getConsequenceRadar(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "temSystem");
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Integer> _system = new ArrayList<Integer>();
			if (parammap.get("temSystem") != null) {
				for (Map<String, Object> o : (List<Map<String, Object>>) parammap.get("temSystem")) {
					_system.add(toInteger(o.get("id").toString()));
				}
			}
			List<Map<String, Object>> list = reportDao.getConsequenceRadarScore(activitys, _system, begin, end);
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

	// 重大风险趋势图 OK
	@SuppressWarnings("unchecked")
	public void getConsequenceLine(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "temSystem");
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Integer> _system = new ArrayList<Integer>();
			if (parammap.get("temSystem") != null) {
				for (Map<String, Object> o : (List<Map<String, Object>>) parammap.get("temSystem")) {
					_system.add(toInteger(o.get("id").toString()));
				}
			}
			List<Map<String, Object>> list = reportDao.getConsequenceLineScore(activitys, _system, begin, end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("timeline", reportDao.getTimeLineByF(begin, end));
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
	
	//不安全状态条形图，为某个月某个系统，某个重大风险下的所有不安全状态的分数 OK
	public void getInsecurityPie(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Map<String,Object>> list = reportDao.getInsecurityPieScore(activitys,begin,end);
			Map<String, Object> map = new HashMap<String, Object>();
			if (list.size() > 8) {
				map.put("data", list.subList(list.size() - 8, list.size()));
			} else {
				map.put("data", list);
			}
			map.put("alldata", list);
			map.put("success", true);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	public void getInsecurityTiao(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Map<String,Object>> list = reportDao.getInsecurityPieScore(activitys,begin,end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			if (list.size() > 8) {
				map.put("data", list.subList(list.size() - 8, list.size()));
			} else {
				map.put("data", list);
			}
			map.put("alldata", list);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	//某一个重大风险下每一个不安全状态的告警图
	public void getInsecurityGauge(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Map<String,Object>> list = reportDao.getInsecurityGauge(activitys,begin,end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	//威胁条形图 为某个月某个系统，某个不安全状态下的所有威胁的分数 OK
	@SuppressWarnings("unchecked")
	public void getThreatPie(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "insecurity");
			List<Integer> _Insecurity = new ArrayList<Integer>();
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			if(parammap.get("insecurity") != null){
				for(Map<String,Object>  o : (List<Map<String,Object>>)parammap.get("insecurity")){
					_Insecurity.add(toInteger(o.get("id").toString()));
				}
			}
			List<Map<String,Object>> list = reportDao.getThreatScore(activitys,_Insecurity,begin,end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	@SuppressWarnings("unchecked")
	public void getThreatTiao(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "insecurity");
			List<Integer> _Insecurity = new ArrayList<Integer>();
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			if(parammap.get("insecurity") != null){
				for(Map<String,Object>  o : (List<Map<String,Object>>)parammap.get("insecurity")){
					_Insecurity.add(toInteger(o.get("id").toString()));
				}
			}
			List<Map<String,Object>> list = reportDao.getThreatScore(activitys,_Insecurity,begin,end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	//差错条形图 为某个月某个系统，某个不安全状态下的所有差错的分数 OK
	@SuppressWarnings("unchecked")
	public void getErrorPie(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "insecurity");
			List<Integer> _Insecurity = new ArrayList<Integer>();
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			if(parammap.get("insecurity") != null){
				for(Map<String,Object>  o : (List<Map<String,Object>>)parammap.get("insecurity")){
					_Insecurity.add(toInteger(o.get("id").toString()));
				}
			}
			List<Map<String,Object>> list = reportDao.getErrorScore(activitys,_Insecurity,begin,end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	@SuppressWarnings("unchecked")
	public void getErrorTiao(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "insecurity");
			List<Integer> _Insecurity = new ArrayList<Integer>();
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			if(parammap.get("insecurity") != null){
				for(Map<String,Object>  o : (List<Map<String,Object>>)parammap.get("insecurity")){
					_Insecurity.add(toInteger(o.get("id").toString()));
				}
			}
			List<Map<String,Object>> list = reportDao.getErrorScore(activitys,_Insecurity,begin,end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	//根据威胁查不安全状态 OK
	public void getScoreByThreatPie(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Map<String,Object>> list = reportDao.getInsecurityByThreatOrError(activitys, begin, end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	public void getScoreByThreatTiao(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Map<String,Object>> list = reportDao.getInsecurityByThreatOrError(activitys, begin, end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	//根据差错查不安全状态 OK
	public void getScoreByErrorPie(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Map<String,Object>> list = reportDao.getInsecurityByThreatOrError(activitys, begin, end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	public void getScoreByErrorTiao(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Map<String,Object>> list = reportDao.getInsecurityByThreatOrError(activitys, begin, end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	//根据不安全状态查询重大风险 OK
	@SuppressWarnings("unchecked")
	public void getConsequenceByInsecurity(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "temSystem");
			List<Integer> _temSystem = new ArrayList<Integer>();
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			if(parammap.get("temSystem") != null){
				for(Map<String,Object> o : (List<Map<String,Object>>)parammap.get("temSystem")){
					_temSystem.add(toInteger(o.get("id").toString()));
				}
			}
			List<Map<String,Object>> list = reportDao.getConsequenceBySystem(activitys,_temSystem,begin,end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
		
	}
	
	//某一不安全状态的趋势图 OK
	@SuppressWarnings("unchecked")
	public void getInsecurityLine(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "insecurity");
			List<Integer> _insecurity = new ArrayList<Integer>();
			if(parammap.get("insecurity") != null){
				for(Map<String,Object> o : (List<Map<String,Object>>)parammap.get("insecurity")){
					_insecurity.add(toInteger(o.get("id").toString()));
				}
			}
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Map<String,Object>> list = reportDao.getInsecurityLine(activitys,_insecurity,begin,end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("timeline", reportDao.getTimeLineByF(begin, end));
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch(SMSException e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	//某一威胁的趋势图 OK
	@SuppressWarnings("unchecked")
	public void getThreatLine(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "threat");
			List<Integer> _threats = new ArrayList<Integer>();
			if(parammap.get("threat") != null){
				for(Map<String,Object>  o : (List<Map<String,Object>>)parammap.get("threat")){
					_threats.add(toInteger(o.get("id").toString()));
				}
			}
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Map<String,Object>> list = reportDao.getThreatLine(activitys, _threats, begin, end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("timeline", reportDao.getTimeLineByF(begin, end));
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch(SMSException e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}catch (Exception e) { 
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	//某一差错的趋势图 OK
	@SuppressWarnings("unchecked")
	public void getErrorLine(HttpServletRequest request,HttpServletResponse response){
		try{
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request,  "error");
			List<Integer> _errors = new ArrayList<Integer>();
			if(parammap.get("error") != null){
				for(Map<String,Object>  o : (List<Map<String,Object>>)parammap.get("error")){
					_errors.add(toInteger(o.get("id").toString()));
				}
			}
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Map<String,Object>> list = reportDao.getErrorLine(activitys, _errors, begin, end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("timeline", reportDao.getTimeLineByF(begin, end));
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch(SMSException e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	// 不安全事件 安系统类型 统计次数
	public void getEventBySystem(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Date> datelist = reportDao.getTimeLineByFliter(begin, end);
			List<Map<String, Object>> list = reportDao.getEventBySystem(activitys, datelist);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			map.put("timeline", reportDao.getTimeLineByF(begin, end));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

	}

	// 统计 严重程度 次数
	public void getSeverityByFliter(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			String symbol = request.getParameter("symbol");
			List<Date> datelist = reportDao.getTimeLineByFliter(begin, end);
			List<Map<String, Object>> list = reportDao.getSeverityByFliter(activitys,datelist,symbol);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			map.put("timeline", reportDao.getTimeLineByF(begin, end));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

	}
	
	// 统计单位的次数
	public void getOrganizationByFliter(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			List<Map<String, Object>> list = reportDao.getUnitEmpReport(activitys);
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

	// 每个单位 不安全事件次数前12个月的趋势图
	@SuppressWarnings("unchecked")
	public void getOrganizationLineFliter(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "unit");
			List<Integer> units = new ArrayList<Integer>();
			if (parammap.get("unit") != null) {
				for (Map<String, Object> o : (List<Map<String, Object>>) parammap.get("unit")) {
					units.add(toInteger(o.get("id").toString()));
				}
			}
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Date> datelist = reportDao.getTimeLineByFliter(begin, end);
			List<Map<String, Object>> list = reportDao.getOrganizationLineFliter(activitys, units, begin, end, datelist);
			Map<String, Object> map = new HashMap<String, Object>();
			if(datelist.size() > 1){
				map.put("timeline", reportDao.getTimeLineByF(begin, end));
			}else{
				map.put("timeline", reportDao.getTimeLineF());
			}
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

	// 不安全事件 事件类型 条形图 饼图
	public void getEventTypeFliterPie(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			List<Map<String, Object>> list = reportDao.getEventTypeFliter(activitys);
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

	public void getEventTypeFliterTiao(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			List<Map<String, Object>> list = reportDao.getEventTypeFliter(activitys);
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

	// 不安全事件 飞行阶段 条形图 饼图
	public void getFlightPhaseFliterPie(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			List<Map<String, Object>> list = reportDao.getFlightPhaseFliter(activitys);
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

	public void getFlightPhaseFliterTiao(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			List<Map<String, Object>> list = reportDao.getFlightPhaseFliter(activitys);
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

	// 某个飞行阶段 的前12个月趋势图
	@SuppressWarnings("unchecked")
	public void getFlightPhaseLineFliter(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "flightPhase");
			List<Integer> flightPhases = new ArrayList<Integer>();
			if (parammap.get("flightPhase") != null) {
				for (Map<String, Object> o : (List<Map<String, Object>>) parammap.get("flightPhase")) {
					flightPhases.add(toInteger(o.get("id").toString()));
				}
			}
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Date> datelist = reportDao.getTimeLineByFliter(begin, end);
			List<Map<String, Object>> list = reportDao.getFlightPhaseLineFliter(activitys, flightPhases, begin, end, datelist);
			Map<String, Object> map = new HashMap<String, Object>();
			if(datelist.size() > 1){
				map.put("timeline", reportDao.getTimeLineByF(begin, end));
			}else{
				map.put("timeline", reportDao.getTimeLineF());
			}
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

	// 不安全事件 标签 次数
	public void getlabelFliter(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			List<Map<String, Object>> list = reportDao.getlabelFliter(activitys);
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

	// 某一个标签前12个月的趋势图
	@SuppressWarnings("unchecked")
	public void getlabelLineFliter(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, "label");
			List<String> labels = new ArrayList<String>();
			if (parammap.get("label") != null) {
				for (Map<String, Object> o : (List<Map<String, Object>>) parammap.get("label")) {
					labels.add(o.get("name").toString());
				}
			}
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Date> datelist = reportDao.getTimeLineByFliter(begin, end);
			List<Map<String, Object>> list = reportDao.getlabelLineFliter(activitys, labels, begin, end, datelist);
			Map<String, Object> map = new HashMap<String, Object>();
			if(datelist.size() > 1){
				map.put("timeline", reportDao.getTimeLineByF(begin, end));
			}else{
				map.put("timeline", reportDao.getTimeLineF());
			}
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

	// 不安全事件 机场 条形图饼图
	public void getAirportFliterPie(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			List<Map<String, Object>> list = reportDao.getAirportFliter(activitys);
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

	public void getAirportFliterTiao(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			List<Map<String, Object>> list = reportDao.getAirportFliter(activitys);
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

	// 不安全事件 每个事件类型 前12个月的趋势图 OK
	@SuppressWarnings("unchecked")
	public void getEventTypeLine(HttpServletRequest request, HttpServletResponse response) {
		try {
			String  customFieldValueKey = "customfield_"+(customFieldDao.getByName("事件类型").get(0).getId().toString());
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> parammap = this.parseQueryParam(request, customFieldValueKey);
			List<String> _eventTypes = new ArrayList<String>();
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			Date _date = new Date();
			if(parammap.get(customFieldValueKey) != null){
				for (Map<String, Object> o : (List<Map<String, Object>>) parammap.get(customFieldValueKey)) {
					_eventTypes.add(o.get("name").toString());
				}
			}
			List<Date> datelist = reportDao.getTimeLineByFliter(begin, end);
			List<Map<String, Object>> list = reportDao.getEventTypeLine(activitys,_eventTypes,customFieldValueKey,_date,begin,end,datelist);
			Map<String, Object> map = new HashMap<String, Object>();
			if(datelist.size() > 1){
				map.put("timeline", reportDao.getTimeLineByF(begin, end));
			}else{
				map.put("timeline", reportDao.getTimeLineF());
			}
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

	// 员工报告 安系统类型 统计次数
	public void getEventEmpReport(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Date date[] = this.parseDate(request, "occurredDate");
			if(date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat)asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat)asdf.clone()).format(date[1]);
			List<Date> datelist = reportDao.getTimeLineByFliter(begin, end);
			List<String> timeline = reportDao.getTimeLineByF(begin, end);
			
			Map<String, Double> flyTime = reportDao.getFlyTimePerMonth(date[0], date[1]);
			
			List<Map<String, Object>> list = reportDao.getEventBySystem(activitys, datelist);
			// 报告率
			Map<String, Object> valueMap = list.get(0);
			@SuppressWarnings("unchecked")
			List<Integer> valueList = (List<Integer>) valueMap.get("value");
			List<String> rateList = new ArrayList<String>();
			for (int i = 0; i < timeline.size(); i++) {
				if (flyTime.get(timeline.get(i).substring(0, 7)) == null || flyTime.get(timeline.get(i).substring(0, 7)) == 0.0) {
					rateList.add("0");
				} else {
					Double rate = valueList.get(i) * 100000 / (flyTime.get(timeline.get(i).substring(0, 7)) * 10) / 100;
					rateList.add(String.format("%.2f", rate));
				}
			}
			valueMap.put("rate", rateList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			map.put("timeline", timeline);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

	}

	// 员工报告 按接收单位（安监机构）
	public void getUnitEmpReport(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Map<String, Object> dataMap = reportDao.getUnitEmp(activitys);
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
	
		
	//机型pie
	public void getAircraftTypePie(HttpServletRequest request, HttpServletResponse response) {
		try {
			String query = request.getParameter("query");
			String search = request.getParameter("search");
			query = formatQuery(query);
			List<Map<String, Object>> list = reportDao.getAircraftTypeChart(query, search);
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

	public void getAircraftTypeTiao(HttpServletRequest request, HttpServletResponse response) {
		try {
			String query = request.getParameter("query");
			String search = request.getParameter("search");
			query = formatQuery(query);
			List<Map<String, Object>> list = reportDao.getAircraftTypeChart(query, search);
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
	
	@SuppressWarnings("unchecked")
	public void getAircraftTypeLine(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> activitys = this.getActivtiyIdsByParams(request);
			Date date[] = this.parseDate(request, "occurredDate");
			if (date == null || date[0] == null || date[1] == null) throw PLEASE_CHOOSE_DATE;
			String begin = ((SimpleDateFormat) asdf.clone()).format(date[0]);
			String end = ((SimpleDateFormat) asdf.clone()).format(date[1]);
			Map<String, Object> parammap = this.parseQueryParam(request, "aircraftTypeCat");
			List<String> aircraftTypes = new ArrayList<String>();
			if(parammap.get("aircraftTypeCat") != null){
				for (Map<String, Object> o : (List<Map<String, Object>>) parammap.get("aircraftTypeCat")) {
					aircraftTypes.add(o.get("name").toString());
				}
			}
			List<Map<String, Object>> dataList = reportDao.getAircraftTypeLine(activitys, aircraftTypes, begin, end);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", dataList);
			map.put("timeline", reportDao.getTimeLineByF(begin,end));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

	}	
	
	private List<Integer> getActivtiyIdsByParams(HttpServletRequest request)
			throws Exception {
		String query = request.getParameter("query");
		String search = request.getParameter("search");
		query = formatQuery(query);
		Map<String, Object> map = queryService.getActivityIdsByParams(
				UserContext.getUserId().toString(), query, null, "0", (Integer.MAX_VALUE - 1) + "",
				null, search, false);
		if (!map.containsKey("ids")) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "查询失败！");
		}
		@SuppressWarnings("unchecked")
		List<String> ids = (List<String>) map.get("ids");
		return StringHelper.converStringListToIntegerList(ids);
	}

	private String formatQuery(String query) {
		if (StringUtils.isBlank(query)) {
			return query;
		}
		List<Map<String, Object>> queryList = gson.fromJson(query,
				new TypeToken<List<Map<String, Object>>>() {
				}.getType());
		List<Map<String, Object>> resultList = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> map : queryList) {
			Object value = map.get("propvalue");
			if (value != null && !((List) value).isEmpty()) {
				Map<String, Object> resultMap = new HashMap<String, Object>();
				resultMap.put("id", map.get("propid"));
				resultMap.put("value", map.get("propvalue"));
				resultList.add(resultMap);
			}
		}
		return gson.toJson(resultList);
	}

	private Map<String, Object> parseQueryParam(HttpServletRequest request,
			String... params) throws Exception {
		String query = request.getParameter("query");
		String search = request.getParameter("search");
		query = this.formatQuery(query);
		Map<String, Object> result = new HashMap<String, Object>();
		// 解析search
		result.putAll(parseFilterQueryParam(search, params));
		// 解析query
		result.putAll(parseFilterQueryParam(query, params));

		return result;
	}

	/**
	 * date[0] startDate<br>
	 * date[1] endDate
	 * @param query
	 * @return
	 */
	private Date[] parseDate(HttpServletRequest request, String key){
		String searcher = fieldRegister.getFieldSearcher(key);
		if (searcher == null) {
			return null;
		}
		ISearchTemplate template = SearchTemplateRegister.getSearchTemplate(searcher);
		if (template == null) {
			return null;
		}
		if (template instanceof DateSearchTemplate) {
			Date[] date = new Date[2];
			try {
				@SuppressWarnings("unchecked")
				Map<String, Object> occurredDate = ((List<Map<String, Object>>) parseQueryParam(request,"occurredDate").get("occurredDate")).get(0);
				String id = (String) occurredDate.get("id");

				if ("currentSeason()".equals(id)) { // 当前季度
					date[0] = DateHelper.getCurrentSeasonStartTime();
					date[1] = DateHelper.getCurrentSeasonEndTime();
				} else if("currentMonth()".equals(id)){ // 当前月
					date[0] = DateHelper.getFirstDayOfCurrentMonth();
					date[1] = DateHelper.getLastDayOfCurrentMonth();
				} else if("prevMonth()".equals(id)){ // 前一个月
					date[0] = DateHelper.getFirstDayOfPreviousMonth(new Date(), 1);
					date[1] = DateHelper.getLastDayOfPreviousMonth(new Date(), 1);
				} else if("currentYear()".equals(id)){ // 对当前年的处理
					date[0] = DateHelper.getFirstDayOfCurrentYear();
					date[1] = DateHelper.getLastDayOfCurrentYear();
				} else if("last12Months()".equals(id)){ // 对前12个月的处理(包括当前月)
					date[0] = DateHelper.getFirstDayOfPreviousMonth(new Date(), 11);
					date[1] = DateHelper.getLastDayOfCurrentMonth();
				} else {
					date[0] = parseDate((String) occurredDate.get("startDate"));
					date[1] = parseDate((String) occurredDate.get("endDate"));
				}
				return date;
			} catch (Exception e) {
				e.printStackTrace();
				return null;
			}
		}
		return null;
	}
	
	/**
	 * 将字符串解析成日期
	 * @param date
	 * @return
	 */
	private Date parseDate(String date){
		if(StringUtils.isBlank(date)){
			return null;
		}
		SimpleDateFormat sdf = null;
		if (date.length() == DateFormats.ISO_DATE.length()) {
			sdf = new SimpleDateFormat(DateFormats.ISO_DATE);
		} else if (date.length() == DateFormats.ISO_TIMESTAMP_MINUTES.length()) {
			sdf = new SimpleDateFormat(DateFormats.ISO_TIMESTAMP_MINUTES);
		} else if (date.length() == DateFormats.ISO_TIMESTAMP_SECONDS.length()) {
			sdf = new SimpleDateFormat(DateFormats.ISO_TIMESTAMP_SECONDS);
		} else if (date.length() == DateFormats.ISO_TIMESTAMP_MILLIS.length()) {
			sdf = new SimpleDateFormat(DateFormats.ISO_TIMESTAMP_MILLIS);
		}
		try {
			return sdf.parse(date);
		} catch (ParseException e) {
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * 解析出过滤器中查询参数id是params的值
	 * 
	 * @param query
	 * @param params
	 * @return param为key, 参数值(list)为value的map
	 * @throws Exception
	 */
	private Map<String, Object> parseFilterQueryParam(String query,
			String... params) throws Exception {
		Map<String, Object> result = new HashMap<String, Object>();
		if (StringUtils.isBlank(query) || null == params || params.length == 0) {
			return result;
		}
		List<String> paramList = Arrays.asList(params);
		// 解析query
		if (StringUtils.isNotEmpty(query) && !"{}".equals(query.trim())
				&& !"[]".equals(query.trim())) {
			List<Map<String, Object>> queryList = gson.fromJson(query,
					new TypeToken<List<Map<String, Object>>>() {
					}.getType());
			for (Map<String, Object> queryMap : queryList) {
				String id = (String) queryMap.get("id");
				if (!StringUtils.isBlank(id) && paramList.contains(id)) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> valueList = (List<Map<String, Object>>) queryMap
							.get("value");
					result.put(id, valueList);
				}
			}
		}
		return result;
	}

	private static Integer toInteger(String s){
		Integer i;
		if(NumberUtils.isDigits(s)){
			i = Integer.parseInt(s);
		}else{
			i = (new Double(s)).intValue();
		}
		return i;
	}

	public void getInsecurityByConsequence(HttpServletRequest request, HttpServletResponse response) {
		try {
			String name = request.getParameter("name");
			Integer consequence = toInteger(request.getParameter("consequence"));
			List<Map<String,Object>> list = reportDao.getInsecurityByConsequence(consequence, name);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", PageHelper.getPagedResult(list, request));
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
	
	public void setReportDao(ReportDao reportDao) {
		this.reportDao = reportDao;
	}

	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}

	public void setQueryService(QueryService queryService) {
		this.queryService = queryService;
	}

	public void setCustomFieldDao(CustomFieldDao customFieldDao) {
		this.customFieldDao = customFieldDao;
	}
	public void setInsecurityDao(InsecurityDao insecurityDao) {
		this.insecurityDao = insecurityDao;
	}
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}


}
