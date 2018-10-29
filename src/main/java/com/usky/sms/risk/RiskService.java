
package com.usky.sms.risk;

import java.io.File;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.dom4j.Document;
import org.dom4j.Element;
import org.dom4j.Node;
import org.dom4j.io.SAXReader;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.common.StringHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.risk.airline.AirlineInfoActivityTypeEntityDao;
import com.usky.sms.risk.airline.AirlineInfoDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

import freemarker.template.Configuration;
import freemarker.template.Template;

public class RiskService extends AbstractService {
	
	public static final String DOWNLOAD_FILE_NAME = "风险通告.doc";
	
	public static final String TEMPLATE_FILE_PATH = "/uui/com/sms/risk/";
	
	public static final String TEMPLATE_NAME = "risk_report.ftl";
	
	@Autowired
	private AirlineInfoActivityTypeEntityDao airlineInfoActivityTypeEntityDao;
	
	@Autowired
	private AirlineInfoDao airlineInfoDao;
	
	@Autowired
	private RiskDao riskDao;
	
	@Autowired
	private RiskTaskSettingDao riskTaskSettingDao;
	
	@Autowired
	private UserDao userDao;
	
	public void addAirlineInfo(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> obj = gson.fromJson(request.getParameter("obj"), new TypeToken<Map<String, Object>>() {}.getType());
			int id = airlineInfoDao.addAirlineInfo(obj);
			
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
	
	public void addRiskTaskSetting(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> obj = gson.fromJson(request.getParameter("obj"), new TypeToken<Map<String, Object>>() {}.getType());
			int id = riskTaskSettingDao.addRiskTaskSetting(obj);
			
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
	
	public void generateReport(HttpServletRequest request, HttpServletResponse response) throws Exception {
		PrintWriter writer = response.getWriter();
		try{
			int riskId = Integer.parseInt(request.getParameter("risk"));
			Map<String, Object> riskMap = riskDao.getExportData(riskId);
			Configuration configuration = new Configuration();
			configuration.setDefaultEncoding("utf-8");
			configuration.setServletContextForTemplateLoading(request.getSession().getServletContext(), TEMPLATE_FILE_PATH);
			Template t = configuration.getTemplate(TEMPLATE_NAME); // 文件名
			t.setEncoding("utf-8");
			
			String fileName = "关于《"+(String) riskMap.get("rsummary")+"》的风险通告.doc";
			response.setContentType("application/x-msdownload");
			response.setHeader("content-disposition", "attachment;filename=" + URLEncoder.encode(fileName, "UTF-8"));
			response.setCharacterEncoding("utf-8");   
			PrintWriter out = response.getWriter();
			t.process(riskMap, out);
			out.close();
		} catch (Exception e) {
			String url = new String(request.getParameter("url").getBytes("iso-8859-1"), "utf-8");
			url = URLDecoder.decode(url, "utf-8");
			response.reset();
			response.setContentType("text/html");
			response.setCharacterEncoding("UTF-8");
			response.setHeader("Pragma", "no-cache");
			response.setHeader("Cache-Control", "no-cache");
			request.getServletPath();
			StringBuilder sb = new StringBuilder().append("<script language='javascript'>alert('下载失败！");
			sb.append("');window.location.href='");
			sb.append(request.getScheme());
			sb.append("://");
			sb.append(url);
			sb.append("';</script>");
			writer.print(sb.toString());
			writer.flush();
			writer.close();
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} finally {
			IOUtils.closeQuietly(writer);
		}
	}
	
	public void generateReport_Back(HttpServletRequest request, HttpServletResponse response) throws Exception {
		OutputStream out = null;
		try {
			int riskId = Integer.parseInt(request.getParameter("risk"));
			System.out.println(new Gson().toJson(riskDao.getExportData(riskId)));
			
			Map<String, Object> riskMap = riskDao.getById(riskId);
			boolean hasAirlineInfo = riskMap.get("activityType")!=null?airlineInfoActivityTypeEntityDao.hasAirlineInfoActivityTypeEntity((Integer) riskMap.get("activityType")):false;
			hasAirlineInfo = true;
			String filePath = request.getSession().getServletContext().getRealPath("/");
			if (filePath == null) filePath = RiskService.class.getResource("/").getPath() + "/../..";
			System.out.println("filePath:" + filePath);
			Document doc = new SAXReader().read(new File(filePath + TEMPLATE_FILE_PATH));
			if (!hasAirlineInfo) {
				Element airlineInfoSection = doc.selectSingleNode("//w:p[@wsp:rsidRDefault='00F539EA']").getParent();
				airlineInfoSection.getParent().remove(airlineInfoSection);
			}
			Element riskAnalysesSection = doc.selectSingleNode("//w:p[@wsp:rsidR='0016783C']").getParent();
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> riskAnalysisMaps = (List<Map<String, Object>>) riskMap.get("riskAnalyses");
			if (riskAnalysisMaps.size() == 0) {
				riskAnalysesSection.getParent().remove(riskAnalysesSection);
			} else {
				Element riskAnalysisSection = (Element) riskAnalysesSection.selectSingleNode(".//wx:sub-section");
				@SuppressWarnings("unchecked")
				List<Node> nodes = riskAnalysisSection.selectNodes(".//w:tr");
				Element threatTr = (Element) nodes.get(1);
				Element clauseTr = (Element) nodes.get(2);
				Element actionItemTr = (Element) nodes.get(3);
				Element sourceTr = (Element) nodes.get(4);
				Element errorTr = (Element) nodes.get(5);
				Element table = nodes.get(0).getParent();
				table.remove(threatTr);
				table.remove(clauseTr);
				table.remove(actionItemTr);
				table.remove(sourceTr);
				table.remove(errorTr);
				riskAnalysesSection.remove(riskAnalysisSection);
				for (int i = 0; i < riskAnalysisMaps.size(); i++) {
					Element section = (Element) riskAnalysisSection.clone();
					riskAnalysesSection.add(section);
					Element system = (Element) section.selectSingleNode("./w:p/w:r/w:t");
					system.setText("${系统名" + i + "}");
					Element tbl = (Element) section.selectSingleNode("./w:tbl");
					Map<String, Object> riskAnalysisMap = riskAnalysisMaps.get(i);
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> threatMaps = (List<Map<String, Object>>) riskAnalysisMap.get("threats");
					for (int j = 0; j < threatMaps.size(); j++) {
						Map<String, Object> threatMap = threatMaps.get(j);
						if (j == 0) {
							Element threat = threatTr.createCopy();
							tbl.add(threat);
							@SuppressWarnings("unchecked")
							List<Element> textElements = threat.selectNodes("./w:tc/w:p/w:r/w:t");
							textElements.get(1).setText("${危险源" + i + ".T" + j + "}");
							textElements.get(2).setText("${风险分析" + i + ".T" + j + "}");
							textElements.get(3).setText("${风险等级" + i + ".T" + j + "}");
							@SuppressWarnings("unchecked")
							List<Map<String, Object>> clauseMaps = (List<Map<String, Object>>) threatMap.get("clauses");
							if (clauseMaps == null) continue;
							for (int k = 0; k < clauseMaps.size(); k++) {
								List<Map<String, Object>> actionItemMaps = (List<Map<String, Object>>) threatMap.get("actionItems");
								if (k == 0) {
									textElements.get(4).setText("${条款内容" + i + ".T" + j + "." + k + "}");
									if (actionItemMaps != null) {
										for (int h = 0; h < actionItemMaps.size(); h++) {
											textElements.get(5).setText("${行动项内容" + i + ".T" + j + "." + k + "." + h + "}");
										}
									}
								} else {
									Element clause = clauseTr.createCopy();
									tbl.add(clause);
									// :TODO
									Element textElement = (Element) clause.selectSingleNode("./w:tc/w:p/w:r/w:t");
									textElement.setText("${条款内容" + i + ".T" + j + "." + k + "}");
								}
							}
						} else {
							Element threat = sourceTr.createCopy();
							tbl.add(threat);
							@SuppressWarnings("unchecked")
							List<Element> textElements = threat.selectNodes("./w:tc/w:p/w:r/w:t");
							textElements.get(0).setText("${危险源" + i + ".T" + j + "}");
							textElements.get(1).setText("${风险分析" + i + ".T" + j + "}");
							textElements.get(2).setText("${风险等级" + i + ".T" + j + "}");
							@SuppressWarnings("unchecked")
							List<Map<String, Object>> clauseMaps = (List<Map<String, Object>>) threatMap.get("clauses");
							if (clauseMaps == null) continue;
							for (int k = 0; k < clauseMaps.size(); k++) {
								if (k == 0) {
									textElements.get(3).setText("${条款内容" + i + ".T" + j + "." + k + "}");
								} else {
									Element clause = clauseTr.createCopy();
									tbl.add(clause);
									Element textElement = (Element) clause.selectSingleNode("./w:tc/w:p/w:r/w:t");
									textElement.setText("${条款内容" + i + ".T" + j + "." + k + "}");
								}
							}
						}
					}
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> errorMaps = (List<Map<String, Object>>) riskAnalysisMap.get("errors");
					for (int j = 0; j < errorMaps.size(); j++) {
						Map<String, Object> errorMap = errorMaps.get(j);
						if (j == 0) {
							Element error = errorTr.createCopy();
							tbl.add(error);
							@SuppressWarnings("unchecked")
							List<Element> textElements = error.selectNodes("./w:tc/w:p/w:r/w:t");
							textElements.get(1).setText("${危险源" + i + ".E" + j + "}");
							textElements.get(2).setText("${风险分析" + i + ".E" + j + "}");
							textElements.get(3).setText("${风险等级" + i + ".E" + j + "}");
							@SuppressWarnings("unchecked")
							List<Map<String, Object>> clauseMaps = (List<Map<String, Object>>) errorMap.get("clauses");
							if (clauseMaps == null) continue;
							for (int k = 0; k < clauseMaps.size(); k++) {
								if (k == 0) {
									textElements.get(4).setText("${条款内容" + i + ".E" + j + "." + k + "}");
								} else {
									Element clause = clauseTr.createCopy();
									tbl.add(clause);
									Element textElement = (Element) clause.selectSingleNode("./w:tc/w:p/w:r/w:t");
									textElement.setText("${条款内容" + i + ".E" + j + "." + k + "}");
								}
							}
						} else {
							Element error = sourceTr.createCopy();
							tbl.add(error);
							@SuppressWarnings("unchecked")
							List<Element> textElements = error.selectNodes("./w:tc/w:p/w:r/w:t");
							textElements.get(0).setText("${危险源" + i + ".E" + j + "}");
							textElements.get(1).setText("${风险分析" + i + ".E" + j + "}");
							textElements.get(2).setText("${风险等级" + i + ".E" + j + "}");
							@SuppressWarnings("unchecked")
							List<Map<String, Object>> clauseMaps = (List<Map<String, Object>>) errorMap.get("clauses");
							if (clauseMaps == null) continue;
							for (int k = 0; k < clauseMaps.size(); k++) {
								if (k == 0) {
									textElements.get(3).setText("${条款内容" + i + ".E" + j + "." + k + "}");
								} else {
									Element clause = clauseTr.createCopy();
									tbl.add(clause);
									Element textElement = (Element) clause.selectSingleNode("./w:tc/w:p/w:r/w:t");
									textElement.setText("${条款内容" + i + ".E" + j + "." + k + "}");
								}
							}
						}
					}
				}
			}
			String fileName = "关于《"+(String) riskMap.get("rsummary")+"》的风险通告.doc";
			String report = doc.asXML();
			report = report.replace("${标题}", (String) riskMap.get("rsummary"));
			report = report.replace("${提交日期}", (String) riskMap.get("date"));
			report = report.replace("${提交人}", (String) riskMap.get("fullname"));
			report = report.replace("${风险类型}", riskMap.get("activityTypeName")==null?"无":(String) riskMap.get("activityTypeName"));
			report = report.replace("${详细描述}", (String) riskMap.get("rdescription"));
			if (hasAirlineInfo) {
				report = report.replace("${航线信息}", "航线信息");
				@SuppressWarnings("unchecked")
				Map<String, Object> departureAirportMap = (Map<String, Object>) riskMap.get("departureAirport");
				report = report.replace("${出发机场}", (String) departureAirportMap.get("name"));
				@SuppressWarnings("unchecked")
				Map<String, Object> arrivalAirportMap = (Map<String, Object>) riskMap.get("arrivalAirport");
				report = report.replace("${到达机场}", (String) arrivalAirportMap.get("name"));
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> stopoverMaps = (List<Map<String, Object>>) riskMap.get("stopovers");
				StringBuilder stopovers = new StringBuilder();
				for (Map<String, Object> stopoverMap : stopoverMaps) {
					stopovers.append((String) stopoverMap.get("name")).append("、");
				}
				if (stopovers.length() > 0) stopovers.deleteCharAt(stopovers.length() - 1);
				report = report.replace("${经停机场}", stopovers.toString());
				report = report.replace("${执行单位}", (String) riskMap.get("unit"));
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> aircraftTypeMaps = (List<Map<String, Object>>) riskMap.get("aircraftTypes");
				StringBuilder aircraftTypes = new StringBuilder();
				for (Map<String, Object> aircraftTypeMap : aircraftTypeMaps) {
					aircraftTypes.append((String) aircraftTypeMap.get("type")).append("、");
				}
				if (aircraftTypes.length() > 0) aircraftTypes.deleteCharAt(aircraftTypes.length() - 1);
				report = report.replace("${机型}", aircraftTypes.toString());
			}
			if (riskAnalysisMaps.size() > 0) report = report.replace("${风险分析}", "风险分析");
			for (int i = 0; i < riskAnalysisMaps.size(); i++) {
				Map<String, Object> riskAnalysisMap = riskAnalysisMaps.get(i);
				report = report.replace("${系统名" + i + "}", i + 1 + "：" + ((DictionaryDO) riskAnalysisMap.get("system")).getName());
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> threatMaps = (List<Map<String, Object>>) riskAnalysisMap.get("threats");
				for (int j = 0; j < threatMaps.size(); j++) {
					Map<String, Object> threatMap = threatMaps.get(j);
					@SuppressWarnings("unchecked")
					Map<String, Object> threat = (Map<String, Object>) threatMap.get("threat");
					report = report.replace("${危险源" + i + ".T" + j + "}", (String) threat.get("name"));
					Object text = threatMap.get("text");
					report = report.replace("${风险分析" + i + ".T" + j + "}", text == null ? "" : (String) text);
					report = report.replace("${风险等级" + i + ".T" + j + "}", ((Integer) threatMap.get("score")) + "（" + ((String) threatMap.get("mark")) + "）");
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> clauseMaps = (List<Map<String, Object>>) threatMap.get("clauses");
					if (clauseMaps == null) continue;
					for (int k = 0; k < clauseMaps.size(); k++) {
						Map<String, Object> clauseMap = clauseMaps.get(k);
						report = report.replace("${条款内容" + i + ".T" + j + "." + k + "}", (String) clauseMap.get("title"));
					}
				}
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> errorMaps = (List<Map<String, Object>>) riskAnalysisMap.get("errors");
				for (int j = 0; j < errorMaps.size(); j++) {
					Map<String, Object> errorMap = errorMaps.get(j);
					@SuppressWarnings("unchecked")
					Map<String, Object> error = (Map<String, Object>) errorMap.get("error");
					report = report.replace("${危险源" + i + ".E" + j + "}", (String) error.get("name"));
					Object text = errorMap.get("text");
					report = report.replace("${风险分析" + i + ".E" + j + "}", text == null ? "" : (String) text);
					report = report.replace("${风险等级" + i + ".E" + j + "}", ((Integer) errorMap.get("score")) + "（" + ((String) errorMap.get("mark")) + "）");
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> clauseMaps = (List<Map<String, Object>>) errorMap.get("clauses");
					if (clauseMaps == null) continue;
					for (int k = 0; k < clauseMaps.size(); k++) {
						Map<String, Object> clauseMap = clauseMaps.get(k);
						report = report.replace("${条款内容" + i + ".E" + j + "." + k + "}", (String) clauseMap.get("title"));
					}
				}
			}
			response.setContentType("application/x-msdownload");
			response.setHeader("content-disposition", "attachment;filename=" + new String(fileName.getBytes("UTF-8"), "ISO-8859-1"));
			out = response.getOutputStream();
			out.write(report.getBytes("utf-8"));
		} catch (Exception e) {
			String url = new String(request.getParameter("url").getBytes("iso-8859-1"), "utf-8");
			url = URLDecoder.decode(url, "utf-8");
			response.reset();
			response.setContentType("text/html");
			response.setCharacterEncoding("UTF-8");
			response.setHeader("Pragma", "no-cache");
			response.setHeader("Cache-Control", "no-cache");
			PrintWriter writer = response.getWriter();
			request.getServletPath();
			StringBuilder sb = new StringBuilder().append("<script language='javascript'>alert('下载失败！");
			sb.append("');window.location.href='");
			sb.append(request.getScheme());
			sb.append("://");
			sb.append(url);
			sb.append("';</script>");
			writer.print(sb.toString());
			writer.flush();
			writer.close();
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} finally {
			IOUtils.closeQuietly(out);
		}
	}
	
	public void getActivityInfoOfRisk(HttpServletRequest request, HttpServletResponse response) {
		try {
			int activityId = Integer.parseInt(request.getParameter("activity"));
			Map<String, Object> data = riskDao.getActivityInfoOfRisk(activityId);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
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
	 * 获取风险分析人
	 * @param request
	 * @param response
	 */
	public void getRiskAnalysisPerson(HttpServletRequest request, HttpServletResponse response) {
		try {
			int organizationId = Integer.parseInt(request.getParameter("organization"));
			List<UserDO> users = riskDao.getRiskAnalysisPerson(organizationId);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", userDao.convert(users, Arrays.asList(new String[]{"id", "username", "fullname", "displayName", "avatar"}), false));
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
	 * 风险分析的发布
	 * @param request
	 * @param response
	 */
	public void publish(HttpServletRequest request, HttpServletResponse response) {
		try {
			int activityId = Integer.parseInt(request.getParameter("activity"));
			int organizationId = Integer.parseInt(request.getParameter("organization"));
			int riskTaskId = Integer.parseInt(request.getParameter("riskTask"));
			@SuppressWarnings("unchecked")
			List<Integer> riskAnalysisPersons = StringHelper.converStringListToIntegerList(gson.fromJson(request.getParameter("riskAnalysisPersons"), List.class));
			List<Integer> ids = riskDao.publish(activityId, organizationId, riskTaskId, riskAnalysisPersons);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", ids);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void updateAirlineInfo(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> obj = gson.fromJson(request.getParameter("obj"), new TypeToken<Map<String, Object>>() {}.getType());
			airlineInfoDao.updateAirlineInfo(obj);
			
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
	
	public void updateRiskTaskSetting(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> obj = gson.fromJson(request.getParameter("obj"), new TypeToken<Map<String, Object>>() {}.getType());
			riskTaskSettingDao.updateRiskTaskSetting(obj);
			
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
	
	public void setAirlineInfoActivityTypeEntityDao(AirlineInfoActivityTypeEntityDao airlineInfoActivityTypeEntityDao) {
		this.airlineInfoActivityTypeEntityDao = airlineInfoActivityTypeEntityDao;
	}
	
	public void setAirlineInfoDao(AirlineInfoDao airlineInfoDao) {
		this.airlineInfoDao = airlineInfoDao;
	}
	
	public void setRiskDao(RiskDao riskDao) {
		this.riskDao = riskDao;
	}
	
	public void setRiskTaskSettingDao(RiskTaskSettingDao riskTaskSettingDao) {
		this.riskTaskSettingDao = riskTaskSettingDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
}
