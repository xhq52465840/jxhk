package com.usky.sms.tem.threat;

import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.file.ExcelUtil;
import com.usky.sms.service.QueryService;

public class ThreatService extends AbstractService {

	@Autowired
	private ThreatDao threatDao;

	@Autowired
	private QueryService queryService;

	public void getRiskColour(HttpServletRequest request,
			HttpServletResponse response) throws Exception {

		try {
			String oid = request.getParameter("id");
			// Map<String, Object> objMap = gson.fromJson(obj, new
			// TypeToken<Map<String, Object>>() {}.getType());
			// String oid = (String) objMap.get("id");
			Integer id = Integer.parseInt(oid);
			if (null == id) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,
						"ID不能为空!");
			}
			ThreatDO thdo = threatDao.getByAId(id);
			String a="name";
			List<String> list=new ArrayList<String>();
			list.add(a);
			Map<String, Object> testmap = threatDao.convert(thdo,list);
			System.out.println(testmap);
			Integer riskLevelP = thdo.getRiskLevelP();
			Integer riskLevelS = thdo.getRiskLevelS();
			String colour = threatDao
					.vfyRisklevelColour(riskLevelP, riskLevelS);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("riskLevelP", riskLevelP);
			map.put("riskLevelS", riskLevelS);
			map.put("colour", colour);
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

	public void updateRiskTwoLevels(HttpServletRequest request,
			HttpServletResponse response) {

		try {
			ThreatDO thdo = null;
			Integer id = StringUtils.isEmpty(request.getParameter("id")) ? null
					: Integer.parseInt(request.getParameter("id"));
			Integer riskLevelP = StringUtils.isEmpty(request
					.getParameter("riskLevelP")) ? null : Integer
					.parseInt(request.getParameter("riskLevelP"));
			Integer riskLevelS = StringUtils.isEmpty(request
					.getParameter("riskLevelS")) ? null : Integer
					.parseInt(request.getParameter("riskLevelS"));
			thdo = new ThreatDO();

			thdo=threatDao.getByAId(id);
			thdo.setRiskLevelP(riskLevelP);
			thdo.setRiskLevelS(riskLevelS);
			threatDao.update(thdo);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 导出危险源威胁到excel
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void exportThreatsToExcel(HttpServletRequest request, HttpServletResponse response) throws Exception{
		OutputStream out = response.getOutputStream();
		try {
			response.addHeader("content-disposition", "attachment;filename=" + URLEncoder.encode("危险源威胁列表.xlsx", "UTF-8"));
			response.setContentType("application/msexcel");
			
			// 导出的表头
			String[][] titles = gson.fromJson(request.getParameter("titles"), String[][].class);
			Map<String, Object> result = (Map<String, Object>) queryService.getListFromDatabase(request);
			List<Map<String, Object>> dataList = (List<Map<String, Object>>) result.get("aaData");
			List<Object[]> datas = new ArrayList<Object[]>();
			for (Map<String, Object> map : dataList) {
				Object[] data = new Object[titles[0].length];
				for (int i = 0; i < titles[0].length; i++) {
					if (i == 2 && "category".equals(titles[1][i])) {
						data[i] = "威胁";
						// 控制措施
					} else if ("controls".equals(titles[1][i])) {
						List<Map<String, Object>> controls = (List<Map<String, Object>>) map.get(titles[1][i]);
						StringBuilder controlSb = new StringBuilder();
						if (controls != null && !controls.isEmpty()) {
							for (Map<String, Object> control : controls) {
								if (control.get("number") != null) {
									controlSb.append(control.get("number")).append("\r\n");
								}
							}
							if (controlSb.length() > 0) {
								controlSb.setLength(controlSb.length() - 2);
							}
							data[i] = controlSb.toString();
						} else {
							data[i] = "";
						}
						// 危险源系数
					} else if ("riskTotal".equals(titles[1][i])) {
						StringBuilder sb = new StringBuilder();
						sb.append("P : ").append(map.get("riskLevelP") == null ? "" : map.get("riskLevelP")).append("  S : ").append(map.get("riskLevelS") == null ? "" : map.get("riskLevelS")).append("\r\n");
						String colour = (String) map.get("colour");
						if ("G".equals(colour)) {
							sb.append("可接受");
						} else if ("Y".equals(colour)) {
							sb.append("控制后可接受");
						} else if ("R".equals(colour)) {
							sb.append("不可接受");
						}
						data[i] = sb.toString();
					} else {
						data[i] = map.get(titles[1][i]) == null ? "" : map.get(titles[1][i]);
					}
				}
				datas.add(data);
			}
			// 导出的表头
			List<String> headers = Arrays.asList(titles[0]);
			// 数据
			List<Object[]> dataset = new ArrayList<Object[]>();
			for (Object[] data : datas) {
				dataset.add(data);
			}
			ExcelUtil.exportExcel(headers, dataset, out);
			out.close();
			response.flushBuffer();
		} catch (SMSException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			IOUtils.closeQuietly(out);
		}
	}
	
	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}

	public void setQueryService(QueryService queryService) {
		this.queryService = queryService;
	}
}
