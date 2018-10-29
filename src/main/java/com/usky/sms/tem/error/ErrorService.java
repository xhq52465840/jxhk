package com.usky.sms.tem.error;

import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.file.ExcelUtil;
import com.usky.sms.service.QueryService;

public class ErrorService extends AbstractService {

	@Autowired
	private QueryService queryService;

	/**
	 * 导出危险源差错到excel
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void exportErrorsToExcel(HttpServletRequest request, HttpServletResponse response) throws Exception{
		OutputStream out = response.getOutputStream();
		try {
			response.addHeader("content-disposition", "attachment;filename=" + URLEncoder.encode("危险源差错列表.xlsx", "UTF-8"));
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
						data[i] = "差错";
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

	public void setQueryService(QueryService queryService) {
		this.queryService = queryService;
	}
}
