package com.usky.sms.rewards;

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
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.file.ExcelUtil;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.service.QueryService;

public class RewardsService extends AbstractService {

	@Autowired
	private RewardsDao rewardsDao;
	
	@Autowired
	private QueryService queryService;
	
	@Autowired
	private PermissionSetDao permissionSetDao;

	/**
	 * 获取奖惩记录的类型
	 * @param request
	 * @param response
	 */
	public void getRewardsType(HttpServletRequest request, HttpServletResponse response) {
		try {
			String category = request.getParameter("category");
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			for (EnumRewordsType rewordsType : EnumRewordsType.values()) {
				if (rewordsType.getCategory().equals(category)) {
					Map<String, Object> rewordsTypeMap = new HashMap<String, Object>();
					rewordsTypeMap.put("id", rewordsType.toString());
					rewordsTypeMap.put("name", rewordsType.getDesc());
					list.add(rewordsTypeMap);
				}
			}
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
	
	/**
	 * 获取奖惩记录的权限
	 * @param request
	 * @param response
	 */
	public void getRewardsPermission(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> permission = new HashMap<String, Object>();
			boolean managable = permissionSetDao.hasUnitPermission(PermissionSets.MANAGE_REWARDS.getName());
			permission.put("managable", managable);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", permission);
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
	 * 导出奖惩记录列表到excel
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void exportRewardsToExcel(HttpServletRequest request, HttpServletResponse response) throws Exception{
		OutputStream out = response.getOutputStream();
		try {
			response.addHeader("content-disposition", "attachment;filename=" + URLEncoder.encode("奖惩记录列表.xlsx", "UTF-8"));
			response.setContentType("application/msexcel");
			
			// 导出的表头
			String[][] titles = gson.fromJson(request.getParameter("titles"), String[][].class);
			Map<String, Object> result = (Map<String, Object>) queryService.getListFromDatabase(request);
			List<Map<String, Object>> dataList = (List<Map<String, Object>>) result.get("aaData");
			List<Object[]> datas = new ArrayList<Object[]>();
			for (Map<String, Object> map : dataList) {
				Object[] data = new Object[titles[0].length];
				for (int i = 0; i < titles[0].length; i++) {
					if ("rewardType".equals(titles[1][i])) {
						data[i] = map.get(titles[1][i]) == null ? "" : ((Map<String, Object>)map.get(titles[1][i])).get("name").toString();
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

	public void setRewardsDao(RewardsDao rewardsDao) {
		this.rewardsDao = rewardsDao;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
}
