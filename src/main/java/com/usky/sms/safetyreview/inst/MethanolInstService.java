package com.usky.sms.safetyreview.inst;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.util.JRLoader;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.JasperHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.geography.UnitGeographyDO;
import com.usky.sms.geography.UnitGeographyDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.risk.RiskService;
import com.usky.sms.safetyreview.AssessmentUnitDO;
import com.usky.sms.safetyreview.AssessmentUnitDao;
import com.usky.sms.safetyreview.EnumMethanolStatus;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserDao;

public class MethanolInstService extends AbstractService {

	public static final String DOWNLOAD_FILE_NAME = "评审单.pdf";
	
	public static final String TEMPLATE_FILE_PATH = "/uui/com/sms/review/safety_review.jasper";
	
	@Autowired
	private MethanolInstDao methanolInstDao;

	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitGeographyDao unitGeographyDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private AssessmentProjectInstDao assessmentProjectInstDao;
	
	@Autowired
	private CompletionInstDao completionInstDao;
	
	@Autowired
	private AssessmentUnitDao assessmentUnitDao;
	
	@Autowired
	private UserDao userDao;
	
	/**
	 * 审核评审单
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void updateMethanolInsts(HttpServletRequest request, HttpServletResponse response){
		try {
			// 操作(提交:commit，保存:save，审核:review)
			String operation = (String) request.getParameter("operation");
			Integer methanolId = Integer.parseInt(request.getParameter("methanolId"));
			Map<String, Object>[] completionMaps = gson.fromJson(request.getParameter("completions"), new TypeToken<Map<String, Object>[]>() {}.getType());
			MethanolInstDO methanol = null;
			if (null != methanolId) {
				methanol = methanolInstDao.internalGetById(methanolId);
			}
			if ("save".equals(operation) || "review".equals(operation)) {
				// 先保存完成情况
				completionInstDao.updateAll(completionMaps);
				// 评审小组成员
				methanol.setReviewer((String) request.getParameter("reviewer"));
				// 备注
				methanol.setRemark((String) request.getParameter("remark"));
				if ("review".equals(operation)) { // 审核
					// 算出总分
					Double sum = methanolInstDao.getSumScore(methanolId);
	
					methanol.setScore(sum);
					// 更新评审单的状态到完成COMPLETE
					methanol.setStatus(EnumMethanolStatus.COMPLETE.toString());
					methanolInstDao.update(methanol);
				} else if ("save".equals(operation)) { // 保存 TODO
					// 算出总分
//					Double sum = methanolInstDao.getSumScore(methanolId);
	
//					methanol.setScore(sum);
					// 更新评审单的状态到完成COMPLETE
//					methanol.setStatus(EnumMethanolStatus.COMPLETE.toString());
					methanolInstDao.update(methanol);
				}
			}

			Map<String, Object> result = new HashMap<String, Object>();

			result.put("success", true);

			ResponseHelper.output(response, result);
			
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 自动计算分数
	 * @param request
	 * @param response
	 */
	public void evalCompletionByMethanolInst(HttpServletRequest request, HttpServletResponse response){
		try {
			Integer methanolId = Integer.parseInt(request.getParameter("methanolId")); 
			
			methanolInstDao.evalCompletionByMethanolInst(methanolId);
			
			Map<String, Object> result = new HashMap<String, Object>();
	
			result.put("success", true);
	
			ResponseHelper.output(response, result);
			
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 根据评审单id查找评审单的详情
	 * @param request
	 * @param response
	 */
	public void getMethanolById(HttpServletRequest request, HttpServletResponse response){
		try{
			Integer id = Integer.parseInt(request.getParameter("id"));
			Map<String, Object> methanolMap = methanolInstDao.getMethanolDataMapById(id);
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", methanolMap);

			ResponseHelper.output(response, result);

		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	

	/**
	 * 导出评审单到pdf
	 * @param request
	 * @param response
	 * @throws Exception 
	 */
	public void exportMethanolToPdf(HttpServletRequest request, HttpServletResponse response) throws Exception{
		OutputStream outputStream = null;
		InputStream is = null;
		try{
			Integer id = Integer.parseInt(request.getParameter("id"));
			Map<String, Object> methanolMap = methanolInstDao.getMethanolDataMapById(id);
			
			List<Object> datas = new ArrayList<Object>();
			datas.add(methanolMap);
			String filePath = request.getSession().getServletContext().getRealPath("/");
			if (filePath == null) {
				filePath = RiskService.class.getResource("/").getPath() + "/../..";
			}
			String fileurl = filePath + TEMPLATE_FILE_PATH;
			is = new FileInputStream(new File(fileurl));
			JasperReport jasperReport = (JasperReport) JRLoader.loadObject(is);
			JRDataSource ds = new JRBeanCollectionDataSource(datas, false);
			JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, null, ds);
			
//			response.setContentType("application/pdf");
//			response.setHeader("content-disposition", "inline;filename=" + new String(DOWNLOAD_FILE_NAME.getBytes("UTF-8"), "ISO-8859-1"));
//			outputStream = response.getOutputStream();
//			JasperExportManager.exportReportToPdfStream(jasperPrint, outputStream);
//			outputStream.flush();
//			outputStream.close();
			List<JasperPrint> jasperPrintList = new ArrayList<JasperPrint>();
			jasperPrintList.add(jasperPrint);
			JasperHelper.exportToPdf(jasperPrintList, DOWNLOAD_FILE_NAME, response);

		} catch (Exception e) {
			e.printStackTrace();
			if (!response.isCommitted()) {
				ResponseHelper.output(response, "导出失败！" + e.getMessage());
			}
		}finally{
			IOUtils.closeQuietly(is);
			IOUtils.closeQuietly(outputStream);
		}
	}

	/**
	 *  生成评审单
	 * @param request
	 * @param response
	 */
	public void generateMethanolInst(HttpServletRequest request, HttpServletResponse response){
		try{
			methanolInstDao.generateMethanolInst();
			
			Map<String, Object> result = new HashMap<String, Object>();
			
			result.put("success", true);

			ResponseHelper.output(response, result);
			
		}catch(SMSException e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 获取所有安检机构的一季度的评审单
	 * @param request
	 * @param response
	 */
	public void getAllMethanol(HttpServletRequest request, HttpServletResponse response){
		try{
			Integer year = Integer.parseInt(request.getParameter("year")==null||"".equals(request.getParameter("year")+"")?"0":request.getParameter("year"));
			Integer season = Integer.parseInt(request.getParameter("season")==null||"".equals(request.getParameter("season")+"")?"0":request.getParameter("season"));
			List<MethanolInstDO> methanolList = methanolInstDao.getAllMethanolInst(year,season);
			List<UnitGeographyDO> unitGeographyList = unitGeographyDao.getAllList();
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();		
			List<String> tempList = new ArrayList<String>();
			for (MethanolInstDO methanolInstDO : methanolList) {
				if(tempList.contains(methanolInstDO.getUnit().getId()+"")){
					break;
				}else{
					tempList.add(methanolInstDO.getUnit().getId()+"");
				}
				Map<String, Object> currMethanol = new HashMap<String, Object>();
				currMethanol.put("score", methanolInstDO.getScore());
				currMethanol.put("id", methanolInstDO.getId());
				currMethanol.put("unitId", methanolInstDO.getUnit().getId());
				currMethanol.put("unitName", methanolInstDO.getUnit().getName());
				for (UnitGeographyDO unitGeographyDO : unitGeographyList) {				
					if(methanolInstDO.getUnit().getId().equals(unitGeographyDO.getUnit().getId())){				
						currMethanol.put("city", unitGeographyDO.getGeography().getCity());
						currMethanol.put("latitude", unitGeographyDO.getGeography().getLatitude());//纬度
						currMethanol.put("longitude", unitGeographyDO.getGeography().getLongitude());	//经度
						break;
					}else{
						currMethanol.put("city", "未知位置");
						currMethanol.put("latitude", 0.00);//纬度
						currMethanol.put("longitude", 0.00);	//经度
					}
				}
				list.add(currMethanol);
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", list);
			ResponseHelper.output(response, result);
		}catch(SMSException e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 获取安监机构的某一年4个季度的评审单<br>
	 * 默认是前一年
	 */
	public void getMethanolsByMultiCon(HttpServletRequest request,HttpServletResponse response) {
		try {
			Integer unitId = StringUtils.isBlank(request.getParameter("unitId")) ? null : Integer.parseInt(request.getParameter("unitId"));
			Integer year = StringUtils.isBlank(request.getParameter("year")) ? null : Integer.parseInt(request.getParameter("year"));
			if (null != unitId && 0 == unitId) {
				unitId = null;
			}
			List<Integer> unitIds = new ArrayList<Integer>();
			if (null != unitId) { // 如果传了安检机构则检索该安检机构的评审单
				unitIds.add(unitId);
			} else { // 如果没有传安检机构则检索当前用户所能看到的安检机构的评审单
				List<UnitDO> units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName(), null);
				for (UnitDO unit : units) {
					unitIds.add(unit.getId());
				}
			}
			Calendar cal = DateHelper.getCalendar();
			// 没有传年份则查询前一年的评审单
			cal.set(Calendar.MONTH, 0);
			if (null != year) {
				cal.set(Calendar.YEAR, year + 1);
			}
			Map<int[], List<MethanolInstDO>> map = methanolInstDao.getMethanolInstsByMultiCon(unitIds, cal.getTime(), 4);
			// 时间轴
			List<int[]> timeData = new ArrayList<int[]>(map.keySet());
			List<Map<String, Object>> timeLine = new ArrayList<Map<String, Object>>();
			for (int[] season : timeData) {
				Map<String, Object> seasonMap = new HashMap<String, Object>();
				seasonMap.put("year", season[0]);
				seasonMap.put("season", season[1]);
				timeLine.add(seasonMap);
			}
			List<List<MethanolInstDO>> methanols = new ArrayList<List<MethanolInstDO>>(map.values());
			List<Map<String, Object>> scores = new ArrayList<Map<String, Object>>();
			for (List<MethanolInstDO> methanolsOneSeason : methanols) {
				Map<String, Object> scoreMap = new HashMap<String, Object>();
				int id = 0;
				double score = 0.0;
				if (null != unitId) { // 如果查询的是某个安监机构的评审单则取第一条记录的分数
					if (!methanolsOneSeason.isEmpty()) {
						MethanolInstDO methanol = methanolsOneSeason.get(0);
						id = methanol.getId();
						score = methanol.getScore();
					}
				} else { // 如果查询的是全部安监机构则总分数的取平均值
					id = 0;
					double sum = 0.0;
					if (methanolsOneSeason.isEmpty() || unitIds.isEmpty()) {
						score = sum;
					} else {
						for (MethanolInstDO methanol : methanolsOneSeason) {
							sum += methanol.getScore();
						}
						score = sum / unitIds.size();
					}
				}
				scoreMap.put("id", id);
				scoreMap.put("score", score);
				scores.add(scoreMap);
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("timeData", timeLine);
			result.put("methanols", scores);
			
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 获取当前用户所在安监机构的前4个季度的评审单的分数，及总分的平均分
	 */
	public void getMethanolsForUnits(HttpServletRequest request,HttpServletResponse response) {
		try {
			List<UnitDO> units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName(), null);
			List<Integer> unitIds = new ArrayList<Integer>();
			List<AssessmentUnitDO> assessmentUnits = assessmentUnitDao.getAllList();
			for (UnitDO unit : units) {
				for (AssessmentUnitDO assessmentUnitDO : assessmentUnits) {
					if(unit.getId().equals(assessmentUnitDO.getUnit().getId())){
						unitIds.add(unit.getId());
						break;
					}
				}			
			}
			if(unitIds.size()<1){
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有可访问的安监机构");
			}
			Integer year = StringUtils.isBlank(request.getParameter("year")) ? null : Integer.parseInt(request.getParameter("year"));
			Calendar cal = DateHelper.getCalendar();
			cal.set(Calendar.MONTH, 0);
			if (null != year) {
				cal.set(Calendar.YEAR, year + 1);
			}
			Map<int[], List<MethanolInstDO>> map = methanolInstDao.getMethanolInstsByMultiCon(unitIds, cal.getTime(), 4);
			// 时间轴
			List<int[]> timeData = new ArrayList<int[]>(map.keySet());
			List<Map<String, Object>> timeLine = new ArrayList<Map<String, Object>>();
			for (int[] season : timeData) {
				Map<String, Object> seasonMap = new HashMap<String, Object>();
				seasonMap.put("year", season[0]);
				seasonMap.put("season", season[1]);
				timeLine.add(seasonMap);
			}
			List<List<MethanolInstDO>> methanols = new ArrayList<List<MethanolInstDO>>(map.values());
			// series
			Map<Object, Object> scoresForUnit = new HashMap<Object, Object>();
			for (Integer unitId : unitIds) {
				List<Map<String, Object>> methanolsForUnit = new ArrayList<Map<String, Object>>();
				for (List<MethanolInstDO> methanolsOneSeason : methanols) {
					Map<String, Object> scoreMap = new LinkedHashMap<String, Object>();
					boolean hasMethanol = false;
					for (MethanolInstDO methanol : methanolsOneSeason) {
						if (unitId.equals(methanol.getUnit().getId())) {
							scoreMap.put("id", methanol.getId());
							scoreMap.put("score", methanol.getScore());
							hasMethanol = true;
							continue;
						}
					}
					if (!hasMethanol) {
						scoreMap.put("id", -1);
						scoreMap.put("score", 0.0);
					}
					methanolsForUnit.add(scoreMap);
				}
				Map<String,Object> unitMap = new HashMap<String,Object>();
				UnitDO unitDO = unitDao.internalGetById(unitId);
				unitMap.put("id", unitId);
				unitMap.put("name", unitDO.getName());
				scoresForUnit.put(unitMap, methanolsForUnit);
			}
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("timeData", timeLine);
			result.put("methanols", scoresForUnit);
			
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 获取操作评审单的权限值
	 * @param request
	 * @param response
	 */
	public void getMethanolPermissions(HttpServletRequest request,HttpServletResponse response){
		try {
			String unitId = request.getParameter("unitId");
			// 查看权限
			boolean viewable = false;
			// 审核权限
			boolean manageable = false;
			if (!StringUtils.isBlank(unitId)) {
				viewable = permissionSetDao.hasUnitPermission(Integer.parseInt(unitId), PermissionSets.VIEW_SAFETY_REVIEW.getName());
				manageable = permissionSetDao.hasUnitPermission(Integer.parseInt(unitId), PermissionSets.AUDIT_SAFETY_REVIEW.getName());
			}
			Map<String, Object> permissionMap = new HashMap<String, Object>();
			permissionMap.put("viewable", viewable);
			permissionMap.put("manageable", manageable);
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", permissionMap);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void setMethanolInstDao(MethanolInstDao methanolInstDao) {
		this.methanolInstDao = methanolInstDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setUnitGeographyDao(UnitGeographyDao unitGeographyDao) {
		this.unitGeographyDao = unitGeographyDao;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setAssessmentProjectInstDao(AssessmentProjectInstDao assessmentProjectInstDao) {
		this.assessmentProjectInstDao = assessmentProjectInstDao;
	}

	public void setCompletionInstDao(CompletionInstDao completionInstDao) {
		this.completionInstDao = completionInstDao;
	}
	public void setAssessmentUnitDao(AssessmentUnitDao assessmentUnitDao) {
		this.assessmentUnitDao = assessmentUnitDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
}
