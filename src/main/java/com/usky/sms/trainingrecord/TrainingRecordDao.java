package com.usky.sms.trainingrecord;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.time.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.DateHelper;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDao;
import com.usky.sms.permission.IPermission;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class TrainingRecordDao extends BaseDao<TrainingRecordDO> implements IPermission {
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private UnitDao unitDao;
	
	protected TrainingRecordDao() {
		super(TrainingRecordDO.class);
	}
	
	@SuppressWarnings("rawtypes")
	@Override
	protected void beforeGetList(Map<String, Object> map, Map<String, Object> searchMap, List<String> orders) {
		// 如果没有安监机构参数则赋值当前用户所能浏览的安监机构
		@SuppressWarnings("unchecked")
		List<List<Map<String, Object>>> ruleList = (List<List<Map<String, Object>>>) map.get("rule");
		if (ruleList == null || ruleList.isEmpty()) {
			ruleList = new ArrayList<List<Map<String,Object>>>();
			map.put("rule", ruleList);
		}
		// 是否有安监机构参数
		boolean hasTrainingUnit = false;
		for (List<Map<String, Object>> list : ruleList) {
			if (hasTrainingUnit) {
				break;
			}
			for (Map<String, Object> paramMap : list) {
				if ("trainingUnit.id".equals(paramMap.get("key")) && "in".equals(paramMap.get("op")) && paramMap.get("value") != null && !((List)paramMap.get("value")).isEmpty()) {
					hasTrainingUnit = true;
					break;
				}
			}
		}
		if (!hasTrainingUnit) {
			List<Integer> unitIds = unitDao.getUnitIds(PermissionSets.VIEW_UNIT.getName());
			// unitIds如果为empty，则返回空数据
			List<Map<String, Object>> unitParamList = new ArrayList<Map<String,Object>>();
			Map<String, Object> unitParam = new HashMap<String, Object>();
			if (unitIds.isEmpty()) {
				unitParam.put("key", "id");
				unitParam.put("op", "=");
				unitParam.put("value", -1);
				unitParamList.add(unitParam);
			} else {
				unitParam.put("key", "trainingUnit.id");
				unitParam.put("op", "in");
				unitParam.put("value", unitIds);
				unitParamList.add(unitParam);
			}
			ruleList.add(unitParamList);
		}
		super.beforeGetList(map, searchMap, orders);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		if (map.get("trainingTargets") != null) {
			@SuppressWarnings("unchecked")
			List<Number> trainingTargets = (List<Number>) map.get("trainingTargets");
			for (Number trainingTarget : trainingTargets) {
				Map<String, Object> newMap = new HashMap<String, Object>();
				newMap.putAll(map);
				newMap.remove("trainingTargets");
				newMap.put("trainingTarget", trainingTarget);
				super.save(newMap);
			}
		}
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return super.beforeSave(map);
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		map.put("lastUpdater", UserContext.getUserId());
		super.beforeUpdate(id, map);
	}

	@Override
	protected void beforeUpdate(TrainingRecordDO obj) {
		obj.setLastUpdater(UserContext.getUser());
		super.beforeUpdate(obj);
	}

	@Override
	protected String getQueryParamName(String key) {
		if ("remainingDays".equals(key)) {
			return "expiryDate";
		}
		return super.getQueryParamName(key);
	}

	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("trainingTarget.id".equals(key) || "trainingUnit.id".equals(key) || "creator.id".equals(key) || "lastUpdater.id".equals(key)) {
			if (null == value) {
				return null;
			}
			if (value instanceof Collection || value instanceof Object[]) {
				List<Integer> resultList = new ArrayList<Integer>();
				if (value instanceof Collection) {
					for (Object o : (Collection<Object>) value) {
						resultList.add((Integer) getQueryParamValue(key, o));
					}
				} else {
					for (Object o : (Object[]) value) {
						resultList.add((Integer) getQueryParamValue(key, o));
					}
				}
				return resultList;
			} else if (value instanceof Number) {
				return ((Number) value).intValue();
			}
			return (NumberHelper.toInteger((String) value));
		}
		if ("remainingDays".equals(key)) {
			Integer remainingDays = ((Number) value).intValue();
			return DateUtils.addDays(DateHelper.getIniDate(new Date()), remainingDays);
		}
		return super.getQueryParamValue(key, value);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		TrainingRecordDO trainingRecord = (TrainingRecordDO) obj;
		if ("certificateType".equals(field.getName())) {
			Map<String, Object> certificateTypeMap = new HashMap<String, Object>();
			certificateTypeMap.put("code", trainingRecord.getCertificateType());
			EnumCertificateType enumCertificateType = EnumCertificateType.getEnumByVal(trainingRecord.getCertificateType());
			certificateTypeMap.put("name", enumCertificateType == null ? null : enumCertificateType.getDesc());
			map.put("certificateType", certificateTypeMap);
		} else if ("trainingType".equals(field.getName())) {
			Map<String, Object> trainingTypeMap = new HashMap<String, Object>();
			trainingTypeMap.put("code", trainingRecord.getTrainingType());
			EnumTrainingType enumTrainingType = EnumTrainingType.getEnumByVal(trainingRecord.getTrainingType());
			trainingTypeMap.put("name", enumTrainingType == null ? null : enumTrainingType.getDesc());
			map.put("trainingType", trainingTypeMap);
		} else if ("trainingTarget".equals(field.getName())) {
			UserDO user = trainingRecord.getTrainingTarget();
			map.put("trainingTarget", userDao.convert(user, Arrays.asList(new String[]{"id", "username", "fullname", "oaDeptName", "pkPsnbasdoc", "sex", "jobName", "education", "school", "birthDate", "onTheJob", "identity"}), false));
		} else if ("expiryDate".equals(field.getName())) {
			Date expiryDate = trainingRecord.getExpiryDate();
			map.put("expiryDate", DateHelper.formatIsoDate(expiryDate));
			map.put("remainingDays", DateHelper.getIntervalDays(new Date(), expiryDate));
		} else if ("created".equals(field.getName())) {
			map.put("created", DateHelper.formatIsoSecond(trainingRecord.getCreated()));
		} else if ("lastUpdate".equals(field.getName())) {
			map.put("lastUpdate", DateHelper.formatIsoSecond(trainingRecord.getLastUpdate()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@SuppressWarnings("unchecked")
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap,
			Map<String, Object> searchMap, List<String> orders) {
		// 权限
		List<Integer> permittedUnitIds = permissionSetDao.getPermittedUnitIdsByUnitName(UserContext.getUserId(), null, PermissionSets.MANAGE_TRAINING_RECORD.getName());
		for (Map<String, Object> map : list) {
			if (map.get("trainingUnitId") != null && permittedUnitIds.contains(map.get("trainingUnitId"))) {
				map.put("managable", true);
			} else {
				map.put("managable", false);
			}
		}
		
		// 附件
		List<Integer> ids = new ArrayList<Integer>();
		for (Map<String, Object> map : list) {
			ids.add((Integer) map.get("id"));
		}
		List<Map<String, Object>> fileMaps = fileDao.convert(fileDao.getFilesBySources(EnumFileType.TRAINING_RECORD.getCode(), ids), false);
		// file按source分组
		Map<Integer, Object> groupMap = new HashMap<Integer, Object>();
		for (Map<String, Object> fileMap : fileMaps) {
			Integer source = (Integer) fileMap.get("source");
			List<Map<String, Object>> groupList = null;
			if (groupMap.containsKey(source)) {
				groupList = (List<Map<String, Object>>) groupMap.get(source);
				groupList.add(fileMap);
			} else {
				groupList = new ArrayList<Map<String,Object>>();
				groupList.add(fileMap);
				groupMap.put(source, groupList);
			}
		}
		
		// 将分组好的file挂到问题列表中
		for (Map<String, Object> map : list) {
			map.put("files", groupMap.get((Integer) map.get("id")));
		}
		super.afterGetList(list, paramMap, searchMap, orders);
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	@Override
	public boolean hasPermission(Integer id, HttpServletRequest request) {
		// 是否管理培训记录的权限
		return permissionSetDao.hasUnitPermission(PermissionSets.MANAGE_TRAINING_RECORD.getName());
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

}
