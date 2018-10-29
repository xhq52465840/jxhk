package com.usky.sms.flightmovementinfo;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.rmi.RemoteException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.namespace.QName;
import javax.xml.rpc.ParameterMode;
import javax.xml.rpc.ServiceException;

import org.apache.axis.client.Call;
import org.apache.axis.client.Service;
import org.apache.axis.encoding.XMLType;
import org.apache.commons.lang.time.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.w3c.dom.DOMException;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.usky.sms.common.DateHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.PagedData;
import com.usky.sms.core.SMSException;
import com.usky.sms.flightmovementinfo.Maintenance.AircraftDao;
import com.usky.sms.flightmovementinfo.Maintenance.BzcsjDao;
import com.usky.sms.flightmovementinfo.Maintenance.DeferredDefectDao;
import com.usky.sms.flightmovementinfo.Maintenance.DeferredPepairDao;
import com.usky.sms.flightmovementinfo.Maintenance.MonitDao;

public class FlightInfoService extends AbstractService {

	private static String targetNamespace = "http://tempuri.org/";

	@Autowired
	private FlightInfoDao flightInfoDao;

	@Autowired
	private AirportDao airportDao;

	@Autowired
	private AircraftDao aircraftDao;

	@Autowired
	private AirportMeteorologyReportDao airportMeteorologyReportDao;

	@Autowired
	private FlightCrewScheduleInfoDao flightCrewScheduleInfoDao;

	@Autowired
	private FlightCrewMemberDao flightCrewMemberDao;

	@Autowired
	private CrewBaoWuDao crewBaoWuDao;

	@Autowired
	private CrewRNPInfoDao crewRNPInfoDao;

	@Autowired
	private CrewSpecAirportInfoDao crewSpecAirportInfoDao;

	@Autowired
	private CrewEtopsInfoDao crewEtopsInfoDao;

	@Autowired
	private CrewLicenseInfoDao crewLicenseInfoDao;

	@Autowired
	private FlightDispatchInfoDao dispatchInfoDao;

	@Autowired
	private LoadSheetDao loadSheetDao;

	@Autowired
	private MonitDao monitDao;

	@Autowired
	private DeferredDefectDao deferredDefectDao;

	@Autowired
	private DeferredPepairDao deferredPepairDao;

	@Autowired
	private BzcsjDao bzcsjDao;

	@Autowired
	private CabinCrewMemberDao cabinCrewMemberDao;

	@Autowired
	private CabinQualificationInfoDao cabinQualificationInfoDao;

	@Autowired
	private CabinLicenceInfoDao cabinLicenceInfoDao;
	
	@Autowired
	private AirPlaneDao airPlaneDao;

	/**
	 * 根据时间返回航班号及机场等 (成功)
	 */
	public void getBaseInfo(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String flightNum = request.getParameter("flightNum");
			Integer start = PageHelper.getFirstResult(request);
			Integer length = PageHelper.getMaxResults(request);
			if (flightNum != null) {
				flightNum = flightNum.toUpperCase();
			}
			String dateTime = request.getParameter("dataTime");
			Date date = DateHelper.parseIsoDate(dateTime);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", airportDao.getBaseInfo(date, flightNum, start, length));
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
	 *  根据航班ID返回该航班的信息(成功)
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getFlightInfo(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			// 航班id
			Integer flightInfoID = request.getParameter("flightInfoID") == null ? null : Integer.parseInt(request.getParameter("flightInfoID"));// 获取航班ID
			// 航班号
			String flightNo = request.getParameter("flightNo");
			// 航班日期
			Date flightDate = request.getParameter("flightDate") == null ? null : DateHelper.parseIsoDate(request.getParameter("flightDate"));
			// 起飞机场四字码
			String depAirport = request.getParameter("depAirport");
			// 降落机场四字码
			String arrAirport = request.getParameter("arrAirport");
			String dataobject = request.getParameter("dataobject");
			Object data = null;
			if ("flightInfo".equals(dataobject)) {// 航班信息
				data = airportDao.getFlightInfo(flightInfoID);
			} else if ("dispatchInfo".equals(dataobject)) {// 签派燃油情况
				data = dispatchInfoDao.getdispatchInfo(flightDate, flightNo, depAirport, arrAirport);
			} else if ("loadSheet".equals(dataobject)) {// 舱单
				data = loadSheetDao.getLoadSheetInfo(flightDate, flightNo, depAirport, arrAirport);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", data);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	// 返回机场信息
	public void getAirport(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			String iATACode = request.getParameter("iATACode");
			String iCaoCode = request.getParameter("iCaoCode");
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", airportDao.getAirport(iATACode, iCaoCode));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	/**
	 *  根据飞机号返回飞机的信息
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getAircraftInfo(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			String tailNo = request.getParameter("tailNo");
			String dataobject = request.getParameter("dataobject");
			Map<String, Object> map = new HashMap<String, Object>();
			Object data = null;
			if ("aircraft".equals(dataobject)) {// 飞机信息
				data = aircraftDao.getAircraftInfo(tailNo);
			} else if ("monit".equals(dataobject)) {// 重点监控故障
				data = monitDao.getMonitInfo(tailNo);
			} else if ("deferredDefect".equals(dataobject)) {// 故障保留
				data = deferredDefectDao.getDeferredInfo(tailNo);
			} else if ("deferredPepair".equals(dataobject)) {// 暂缓修理项目
				data = deferredPepairDao.getRepairInfo(tailNo);
			} else if ("bzcsj".equals(dataobject)) {// 不正常事件(不需要)
				// data = bzcsjDao.getBzcsjInfo(tailNo);
			}
			map.put("data", data);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	/*
	 * 机场天气信息
	 */
	public void getWeather(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			String status = request.getParameter("status");
			String iCaoCode = request.getParameter("iCaoCode");
			Date date = null;
			if (status == "S" || "S".equals(status)) {
				date = request.getParameter("atd") == null ? null : DateHelper.parseIsoSecond(request.getParameter("atd")); // atd 实际起飞时间UTC
			} else if (status == "E" || "E".equals(status)) {
				date = request.getParameter("ata") == null ? null : DateHelper.parseIsoSecond(request.getParameter("ata"));// ata 实际到达时间UTC
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", date == null ? null : airportMeteorologyReportDao.getMeteorology(iCaoCode, DateUtils.addHours(date, -1), DateUtils.addHours(date, 1)));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	/*
	 * 获取机组信息
	 */
	public void searchFlightCrew(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			String dataobject = request.getParameter("dataobject");// 获取对象
			// 航班号
			String flightNo = request.getParameter("flightNo");
			// 航班日期(yyyy-mm-dd)
			Date flightDate = request.getParameter("flightDate") == null ? null : DateHelper.parseIsoDate(request.getParameter("flightDate"));
			// 起飞机场四字码
			String deptApt = request.getParameter("depAirport");
			// 到达机场四字码
			String arrApt = request.getParameter("arrAirport");
			Object data = null;
			if ("flightCrewMember".equals(dataobject)) { // 机组人员
				data = flightCrewMemberDao.getCrewBaseInfo(flightDate, flightNo, deptApt, arrApt);
			} else if ("crewBaoWu".equals(dataobject)) { // 报务
				String pcode = request.getParameter("pcode");
				data = crewBaoWuDao.getBaoWuInfo(pcode);
			} else if ("crewRNPInfo".equals(dataobject)) { // RNP
//				String pcode = request.getParameter("pcode");
//				data = crewRNPInfoDao.getRNPInfo(pcode);
			} else if ("crewSpecAirportInfo".equals(dataobject)) { // 特殊机场
				String pcode = request.getParameter("pcode");
				data = crewSpecAirportInfoDao.getSpecAirportInfo(pcode);
			} else if ("crewEtopsInfo".equals(dataobject)) { // ETOPS
				String pcode = request.getParameter("pcode");
				data = crewEtopsInfoDao.getEtopsInfo(pcode);
			} else if ("crewLicenseInfo".equals(dataobject)) { // 证件
				String pcode = request.getParameter("pcode");
				data = crewLicenseInfoDao.getLicenseInfo(pcode);
			} else if ("cabinCrewMember".equals(dataobject)) { // 乘务组
				data = cabinCrewMemberDao.getCabinCrewMember(flightDate, flightNo, deptApt, arrApt);
			} else if ("cabinQualificationInfo".equals(dataobject)) {// 乘务组飞行资格信息
				String staffid = request.getParameter("staffid");
				data = cabinQualificationInfoDao.getCabinQualification(staffid);
			} else if ("cabinLicenceInfo".equals(dataobject)) {// 乘务组签证信息
				String staffid = request.getParameter("staffid");
				data = cabinLicenceInfoDao.getCabinLicence(staffid);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", data);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	/**
	 *  根据机场名、城市名，四字码查询机场
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getAirportBySearch(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			String term = request.getParameter("term");
			Map<String, Object> map = new HashMap<String, Object>();
			PagedData pageData = airportDao.getAirportByNameAndICaoCode(term, PageHelper.getFirstResult(request), PageHelper.getMaxResults(request));
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("iTotalRecords", pageData.getTotalCount());
			dataMap.put("iTotalDisplayRecords", pageData.getTotalCount());
			List<Map<String, Object>> dataList = new ArrayList<Map<String,Object>>();
			for (Object airport : pageData.getData()) {
				Map<String, Object> airportMap = new HashMap<String, Object>();
				AirportDO airportDO = (AirportDO) airport;
				airportMap.put("iCaoCode", airportDO.getiCaoCode());
				airportMap.put("iATACode", airportDO.getiATACode());
				airportMap.put("fullName", airportDO.getFullName());
				airportMap.put("fullEnName", airportDO.getFullEnName());
				airportMap.put("cityName", airportDO.getCityName());
				airportMap.put("cityEnName", airportDO.getCityEnName());
				dataList.add(airportMap);
			}
			dataMap.put("aaData", dataList);
					
			
			map.put("success", true);
			map.put("data", dataMap);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	// 根据机型查询飞机
	public void getAircraftBySearch(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			String term = request.getParameter("term");
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data",
					PageHelper.getPagedResult(
							aircraftDao.getAircraftByType(term), request));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	// 查询所有的机号
	public void getAllTailNO(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", PageHelper.getPagedResult(
					flightInfoDao.getAllTailNO(), request));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	// 查询所有的航班号
	public void getAllFlightNO(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", PageHelper.getPagedResult(
					flightInfoDao.getAllFlightNO(), request));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	/**
	 * 查询所有的机场名称
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getAllAirportName(HttpServletRequest request, HttpServletResponse response) throws Exception {
		this.getAirportBySearch(request, response);
	}
	
	/*
	 * 获取机场pdf图
	 */
	public void getAirportPdf(HttpServletRequest request,
			HttpServletResponse response) {

		String path = request.getParameter("pdfUrl") == null ? "" : request
				.getParameter("pdfUrl").toString();
		InputStream in = null;
		OutputStream out = null;
		byte[] data = null;
		if (path != null && path != "") {
			if(path.indexOf("\\")!=-1)
			{
				path=path.replace("\\", "/");
			}
			String prefix=path.substring(0,path.lastIndexOf("/")+1);
	    	String fileName=path.substring(path.lastIndexOf("/")+1);
			try {
				fileName=URLEncoder.encode(fileName,"UTF-8");
			} catch (UnsupportedEncodingException e2) {
				// TODO Auto-generated catch block
				e2.printStackTrace();
			}
			String newPath=prefix+fileName;
			try {
				HttpURLConnection conn = null;
				URL url = new URL(newPath);
				conn = (HttpURLConnection) url.openConnection();
				// 得到输入流
				in = conn.getInputStream();
				data = readInputStream(in);
			} catch (MalformedURLException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			} catch (IOException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			response.setContentType("application/pdf");
			try {
				out = response.getOutputStream();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
			// 将文件输出
			try {
				if (data != null) {
					out.write(data);
				}
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}

		}

	}

	/**
	 * 从输入流中获取字节数组
	 * 
	 * @param inputStream
	 * @return
	 * @throws IOException
	 */
	public static byte[] readInputStream(InputStream inputStream)
			throws IOException {
		byte[] buffer = new byte[1024];
		int len = 0;
		ByteArrayOutputStream bos = new ByteArrayOutputStream();
		while ((len = inputStream.read(buffer)) != -1) {
			bos.write(buffer, 0, len);
		}
		bos.close();
		return bos.toByteArray();
	}

	/*
	 * 获取机场平面信息
	 */
	public void getAirportInformation(HttpServletRequest request,
			HttpServletResponse response) {

		String airportCode = request.getParameter("airportCode") == null ? ""
				: request.getParameter("airportCode").toString();
		AirPortContent apc = null;
		if (airportCode != null && airportCode.length() == 4
				&& airportCode != "") {
			apc = getAirportContent(airportCode);
		}
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("success", true);
		map.put("data", apc);
		ResponseHelper.output(response, map);

	}

	public AirPortContent getAirportContent(String airportCode) {
		org.w3c.dom.Element versionElement = getElementByMethod("GetVersion",
				null);
		if (versionElement.getElementsByTagName("RESULT").item(0)
				.getTextContent().equals("0")) {
			NodeList versionList = versionElement
					.getElementsByTagName("Identity");
			String version = versionList.item(0).getTextContent();
			org.w3c.dom.Element airportElment = getElementByMethod(
					"GetAirportContents", version);
			NodeList airportCodeList = airportElment
					.getElementsByTagName("Code");
			String airportId = null;
			String airportFilePath = null;
			String chartType = null;
			String chartName = null;
			String chartFilePath = null;

			// 通过机场四字码获取机场ID
			for (int i = 0; i < airportCodeList.getLength(); i++) {
				Node currentNode = airportCodeList.item(i);
				if (currentNode.getTextContent().equals(airportCode)) {

					NodeList list = currentNode.getParentNode().getChildNodes();
					for (int j = 0; j < list.getLength(); j++) {
						if (list.item(j).getNodeName().equals("ID")) {
							airportId = list.item(j).getTextContent();
						}
					}

				}
			}

			// 获取机场规则的文档路径
			org.w3c.dom.Element airportRuleElemet = getElementByMethod(
					"GetAirportDocuments", version);
			NodeList airportRuleList = airportRuleElemet
					.getElementsByTagName("AirportID");
			for (int i = 0; i < airportRuleList.getLength(); i++) {
				Node currentNode = airportRuleList.item(i);
				if (currentNode.getTextContent().equals(airportId)) {

					NodeList list = currentNode.getParentNode().getChildNodes();
					for (int j = 0; j < list.getLength(); j++) {
						if (list.item(j).getNodeName().equals("FileName")) {
							airportFilePath = list.item(j).getTextContent();
						}
					}

				}
			}

			// 获取机场进场离场图
			org.w3c.dom.Element airportChartElemet = getElementByMethod(
					"GetAirportCharts", version);
			ArrayList<AirPortChart> chartList = new ArrayList<AirPortChart>();
			NodeList airportChartList = airportChartElemet
					.getElementsByTagName("AirportID");
			for (int i = 0; i < airportChartList.getLength(); i++) {
				Node currentNode = airportChartList.item(i);
				if (currentNode.getTextContent().equals(airportId)) {

					NodeList list = currentNode.getParentNode().getChildNodes();
					AirPortChart chart = new AirPortChart();
					for (int j = 0; j < list.getLength(); j++) {
						if (list.item(j).getNodeName().equals("ChartName")) {
							chartName = list.item(j).getTextContent();
							chart.setChartName(chartName);
						}
						if (list.item(j).getNodeName().equals("ChartType")) {
							chartType = list.item(j).getTextContent();
							chart.setChartType(chartType);
						}
						if (list.item(j).getNodeName().equals("FileName")) {
							chartFilePath = list.item(j).getTextContent();
							chart.setFilePath(chartFilePath);
						}
					}
					chartList.add(chart);

				}
			}

			// 所有数据获取完毕
			AirPortContent apc = new AirPortContent();
			apc.setId(airportId);
			apc.setAirportRuleFile(airportFilePath);
			apc.setChartList(chartList);
			return apc;
		}
		return null;
	}

	public static Element getElementByMethod(String methodName,
			String parameterValue) {
		try {
			Service service = new Service();
			Call call = (Call) service.createCall();
			call.setTargetEndpointAddress(new java.net.URL(Config.getInstance()
					.getAirportServiceUrl()));
			call.setOperationName(new QName(targetNamespace, methodName));
			call.setReturnClass(org.w3c.dom.Element.class);
			call.setSOAPActionURI(targetNamespace + methodName);
			call.setUseSOAPAction(true);
			org.w3c.dom.Element returnNode;
			if (parameterValue != null) {
				call.addParameter(new QName(targetNamespace, "identity"),
						XMLType.XSD_STRING, ParameterMode.IN);
				returnNode = (org.w3c.dom.Element) call
						.invoke(new Object[] { parameterValue });
			} else {
				returnNode = (org.w3c.dom.Element) call.invoke(new Object[] {});
			}
			return returnNode;
		} catch (MalformedURLException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (RemoteException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (DOMException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ServiceException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public void setFlightInfoDao(FlightInfoDao flightInfoDao) {
		this.flightInfoDao = flightInfoDao;
	}

	public void setAirportDao(AirportDao airportDao) {
		this.airportDao = airportDao;
	}

	public void setAircraftDao(AircraftDao aircraftDao) {
		this.aircraftDao = aircraftDao;
	}

	public void setAirportMeteorologyReportDao(
			AirportMeteorologyReportDao airportMeteorologyReportDao) {
		this.airportMeteorologyReportDao = airportMeteorologyReportDao;
	}

	public void setFlightCrewScheduleInfoDao(
			FlightCrewScheduleInfoDao flightCrewScheduleInfoDao) {
		this.flightCrewScheduleInfoDao = flightCrewScheduleInfoDao;
	}

	public void setFlightCrewMemberDao(FlightCrewMemberDao flightCrewMemberDao) {
		this.flightCrewMemberDao = flightCrewMemberDao;
	}

	public void setCrewBaoWuDao(CrewBaoWuDao crewBaoWuDao) {
		this.crewBaoWuDao = crewBaoWuDao;
	}

	public void setCrewRNPInfoDao(CrewRNPInfoDao crewRNPInfoDao) {
		this.crewRNPInfoDao = crewRNPInfoDao;
	}

	public void setCrewSpecAirportInfoDao(
			CrewSpecAirportInfoDao crewSpecAirportInfoDao) {
		this.crewSpecAirportInfoDao = crewSpecAirportInfoDao;
	}

	public void setCrewEtopsInfoDao(CrewEtopsInfoDao crewEtopsInfoDao) {
		this.crewEtopsInfoDao = crewEtopsInfoDao;
	}

	public void setCrewLicenseInfoDao(CrewLicenseInfoDao crewLicenseInfoDao) {
		this.crewLicenseInfoDao = crewLicenseInfoDao;
	}

	public void setDispatchInfoDao(FlightDispatchInfoDao dispatchInfoDao) {
		this.dispatchInfoDao = dispatchInfoDao;
	}

	public void setLoadSheetDao(LoadSheetDao loadSheetDao) {
		this.loadSheetDao = loadSheetDao;
	}

	public void setMonitDao(MonitDao monitDao) {
		this.monitDao = monitDao;
	}

	public void setDeferredDefectDao(DeferredDefectDao deferredDefectDao) {
		this.deferredDefectDao = deferredDefectDao;
	}

	public void setDeferredPepairDao(DeferredPepairDao deferredPepairDao) {
		this.deferredPepairDao = deferredPepairDao;
	}

	public void setBzcsjDao(BzcsjDao bzcsjDao) {
		this.bzcsjDao = bzcsjDao;
	}

	public void setCabinCrewMemberDao(CabinCrewMemberDao cabinCrewMemberDao) {
		this.cabinCrewMemberDao = cabinCrewMemberDao;
	}

	public void setCabinQualificationInfoDao(
			CabinQualificationInfoDao cabinQualificationInfoDao) {
		this.cabinQualificationInfoDao = cabinQualificationInfoDao;
	}

	public void setCabinLicenceInfoDao(CabinLicenceInfoDao cabinLicenceInfoDao) {
		this.cabinLicenceInfoDao = cabinLicenceInfoDao;
	}

	public void setAirPlaneDao(AirPlaneDao airPlaneDao) {
		this.airPlaneDao = airPlaneDao;
	}

}
