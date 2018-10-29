package com.usky.sms.trainingrecord;

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

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.file.ExcelUtil;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.service.QueryService;

public class TrainingRecordService extends AbstractService {
	
	@Autowired
	private TrainingRecordDao trainingRecordDao;

	@Autowired
	private QueryService queryService;

	@Autowired
	private PermissionSetDao permissionSetDao;
	
	/**
	 * 获取培训记录的权限
	 * @param request
	 * @param response
	 */
	public void getTrainingRecordPermission(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> permission = new HashMap<String, Object>();
			boolean managable = permissionSetDao.hasUnitPermission(PermissionSets.MANAGE_TRAINING_RECORD.getName());
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
	 * 保存多个培训记录
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void saveAllTrainingRecords(HttpServletRequest request, HttpServletResponse response) {
		try {
			String obj = request.getParameter("obj");
			Object data;
			Map<String, Object> dataMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			if (dataMap.get("trainingTargets") != null) {
				List<Number> trainingTargets = (List<Number>) dataMap.get("trainingTargets");
				List<Map<String, Object>> newMaps = new ArrayList<Map<String,Object>>();
				for (Number trainingTarget : trainingTargets) {
					Map<String, Object> newMap = new HashMap<String, Object>();
					newMap.putAll(dataMap);
					newMap.remove("trainingTargets");
					newMap.put("trainingTarget", trainingTarget);
					newMaps.add(newMap);
				}
				data = trainingRecordDao.save(newMaps);
			} else {
				data = trainingRecordDao.save(dataMap);
			}
			
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
	 * 导出培训记录列表到excel
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void exportTrainingRecordsToExcel(HttpServletRequest request, HttpServletResponse response) throws Exception{
		OutputStream out = response.getOutputStream();
		try {
			response.addHeader("content-disposition", "attachment;filename=" + URLEncoder.encode("培训记录列表.xlsx", "UTF-8"));
			response.setContentType("application/msexcel");
			
			// 导出的表头
			String[][] titles = gson.fromJson(request.getParameter("titles"), String[][].class);
			Map<String, Object> result = (Map<String, Object>) queryService.getListFromDatabase(request);
			List<Map<String, Object>> dataList = (List<Map<String, Object>>) result.get("aaData");
			List<Object[]> datas = new ArrayList<Object[]>();
			for (Map<String, Object> map : dataList) {
				Object[] data = new Object[titles[0].length];
				for (int i = 0; i < titles[0].length; i++) {
					Object value = null;
					String[] keys = StringUtils.split(titles[1][i], ".");
					if (keys != null) {
						Map<String, Object> newMap = map;
						for (int j = 0; j < keys.length; j++) {
							if (newMap != null) {
								if (j == keys.length - 1) {
									value = newMap.get(keys[j]);
									if ("sex".equals(keys[j]) && value != null) {
										value = (int) value == 1 ? "男" : "女";
									}
								} else {
									newMap = (Map<String, Object>) newMap.get(keys[j]);
								}
							}
						}
					}
					
					data[i] = value == null ? "" : value;
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

	/**
	 * 获取证书的类别
	 * @param request
	 * @param response
	 */
	public void getCertificateType(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			for (EnumCertificateType enumCertificateType : EnumCertificateType.values()) {
				Map<String, Object> certificateTypeMap = new HashMap<String, Object>();
				certificateTypeMap.put("id", enumCertificateType.toString());
				certificateTypeMap.put("name", enumCertificateType.getDesc());
				list.add(certificateTypeMap);
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
	 * 获取培训的类别
	 * @param request
	 * @param response
	 */
	public void getTrainingType(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			for (EnumTrainingType enumTrainingType : EnumTrainingType.values()) {
				Map<String, Object> trainingTypeMap = new HashMap<String, Object>();
				trainingTypeMap.put("id", enumTrainingType.toString());
				trainingTypeMap.put("name", enumTrainingType.getDesc());
				list.add(trainingTypeMap);
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

	public void setTrainingRecordDao(TrainingRecordDao trainingRecordDao) {
		this.trainingRecordDao = trainingRecordDao;
	}

	public void setQueryService(QueryService queryService) {
		this.queryService = queryService;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
}
