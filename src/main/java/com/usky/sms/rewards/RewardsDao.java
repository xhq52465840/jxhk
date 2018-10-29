package com.usky.sms.rewards;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.NumberHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.permission.IPermission;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;

public class RewardsDao extends BaseDao<RewardsDO> implements IPermission {
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	protected RewardsDao() {
		super(RewardsDO.class);
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
		boolean hasRewardUnit = false;
		for (List<Map<String, Object>> list : ruleList) {
			if (hasRewardUnit) {
				break;
			}
			for (Map<String, Object> paramMap : list) {
				if ("rewardUnit.id".equals(paramMap.get("key")) && "in".equals(paramMap.get("op")) && paramMap.get("value") != null && !((List)paramMap.get("value")).isEmpty()) {
					hasRewardUnit = true;
					break;
				}
			}
		}
		if (!hasRewardUnit) {
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
				unitParam.put("key", "rewardUnit.id");
				unitParam.put("op", "in");
				unitParam.put("value", unitIds);
				unitParamList.add(unitParam);
			}
			ruleList.add(unitParamList);
		}
		super.beforeGetList(map, searchMap, orders);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("rewardTarget.id".equals(key) || "rewardUnit.id".equals(key) || "eventLevel.id".equals(key)) {
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
		return super.getQueryParamValue(key, value);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		RewardsDO rewards = (RewardsDO) obj;
		if ("rewardType".equals(field.getName())) {
			Map<String, Object> rewardTypeMap = new HashMap<String, Object>();
			rewardTypeMap.put("code", rewards.getRewardType());
			EnumRewordsType enumRewordsType = EnumRewordsType.getEnumByVal(rewards.getRewardType());
			rewardTypeMap.put("name", enumRewordsType == null ? null : enumRewordsType.getDesc());
			map.put("rewardType", rewardTypeMap);
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap,
			Map<String, Object> searchMap, List<String> orders) {
		// 权限
		List<Integer> permittedUnitIds = permissionSetDao.getPermittedUnitIdsByUnitName(UserContext.getUserId(), null, PermissionSets.MANAGE_REWARDS.getName());
		for (Map<String, Object> map : list) {
			if (map.get("rewardUnitId") != null && permittedUnitIds.contains(map.get("rewardUnitId"))) {
				map.put("managable", true);
			} else {
				map.put("managable", false);
			}
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
		// 是否管理奖惩记录的权限
		return permissionSetDao.hasUnitPermission(PermissionSets.MANAGE_REWARDS.getName());
	}
	
	/**
	 * 获取飞行员的风险值<br>
	 * 计算逻辑说明：
	 * <br>
	 * 1、计算范围：
	 * <br>
	 * （1）指定飞行员的事故征候的记录：【查询日期】前的近一年的记录
	 * <br>
	 * （比如：【查询日期】为2017年1月1日，则2016年1月1日至2016年12月31日的事故征候记录，都属于统计对象）
	 * <br>
	 * （2）指定飞行员的严重差错的记录：【查询日期】前的近半年的记录
	 * <br>
	 * （比如：【查询日期】为2017年1月1日，则2016年6月1日至2016年12月31日的严重差错记录，都属于统计对象）
	 * <br>
	 * 2、奖惩记录中如果是【事故征候】就记为M 风险（风险期为12个月），如果是 【严重差错】就记为 L风险（风险期为6个月），其它不记
	 * <br>
	 * 3、评分规则为：指定飞行员同时有多起M/L，那么就按照下面的公式进行风险的累加：
	 * <br>
	 * L+L=M,L+M=H,L+H=H,M+M=H,M+H=H,H+H=H
	 * <br>
	 * 如果有>=3的情况，那么就叠代1和2，然后将1和2的结果再叠代3 ，以此类推，得到总风险值；
	 * <br>
	 * 例如：【查询日期】为2017年1月1日，某飞行人员2016年6月1日发生严重差错，自事发之日起至2016年12月1日，其风险等级为L，2016年9月1日又发生运输航空事故征候，其风险等级为M，风险期自2016年9月1日起重新计算，风险值为L+M=H，以此类推。
	 * <br>
	 * （2016年1月1日到2016年5月31日发生的严重差错，不作为统计计算对象）
	 * <br>
	 * @param pkPsnbasdocs 飞行员的NC编号
	 * @param queryDate 查询时间
	 */
	public Map<String, Object> getPilotRiskValue(String[] pkPsnbasdocs, Date queryDate) {
		// 事故症候的统计
		Map<String, Object> accidentCount = this.getRewardAccidentCount(pkPsnbasdocs, queryDate);
		// 严重差错的统计
		Map<String, Object> severeErrorCount = this.getRewardSevereErrorCount(pkPsnbasdocs, queryDate);
		return this.calculateRiskLevel(accidentCount, severeErrorCount);
		
	}
	
	/**
	 * 计算风险等级, 每个用户的故症候的分数与严重差错的分数求和<br>
	 * 一条事故症候为2分（等级M），严重差错算1分（等级L），大于等于3分为等级H
	 * @param accidentCount 事故症候的统计一
	 * @param severeErrorCount 严重差错的统计
	 * @return
	 */
	private Map<String, Object> calculateRiskLevel(Map<String, Object> accidentCount, Map<String, Object> severeErrorCount) {
		Map<String, Object> result = new HashMap<String, Object>();
		// 所有的事故症候
		for (Entry<String, Object> entry : accidentCount.entrySet()) {
			long accidentScore = entry.getValue() == null ? 0 : 2 * (long) entry.getValue();
			long severeErrorScore = severeErrorCount.get(entry.getKey()) == null ? 0 : (long) severeErrorCount.get(entry.getKey());
			long sum = accidentScore + severeErrorScore;
			result.put(entry.getKey(), this.scoreToLevel(sum));
		}
		// 剩余的严重差错
		for (Entry<String, Object> entry : severeErrorCount.entrySet()) {
			if (!accidentCount.containsKey(entry.getKey())) {
				long severeErrorScore = entry.getValue() == null ? 0 : (long) entry.getValue();
				result.put(entry.getKey(), this.scoreToLevel(severeErrorScore));
			}
		}
		return result;
	}
	
	/**
	 * 分数转换成对于的风险等级(1:L, 2:M, 大于等于3:H)
	 * @param score 分数
	 * @return
	 */
	private String scoreToLevel(long score) {
		if (score == 1) {
			return "L";
		}
		if (score == 2) {
			return "M";
		}
		if (score >= 3) {
			return "H";
		}
		return null;
	}
	
	/**
	 * 事件等级为事故症候的记录<br>
	 * 【查询日期】前的近一年的记录（比如：【查询日期】为2017年1月1日，则2016年1月1日至2016年12月31日的事故征候记录，都属于统计对象）
	 * @param pkPsnbasdocs 用户的NC编号
	 * @param queryDate 查询时间
	 */
	private Map<String, Object> getRewardAccidentCount(String[] pkPsnbasdocs, Date queryDate) {
		// 事故症候
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("事件等级", EnumEventLevel.ACCIDENT.getCode());
		if (dic == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "事件等级", EnumEventLevel.ACCIDENT.getCode());
		}
		Calendar cal = Calendar.getInstance();
		cal.setTime(queryDate);
		cal.add(Calendar.YEAR, -1);
		Date occurDateStart = cal.getTime();
		cal.setTime(queryDate);
		cal.add(Calendar.DAY_OF_MONTH, -1);
		Date occurDateEnd = cal.getTime();
		List<Map<String, Object>> counts = this.getRewardCount(pkPsnbasdocs, dic, occurDateStart, occurDateEnd);
		return this.countListToMap(counts);
	}
	
	/**
	 * 事件等级为严重差错的记录<br>
	 * 【查询日期】前的近半年的记录（比如：【查询日期】为2017年1月1日，则2016年6月1日至2016年12月31日的严重差错记录，都属于统计对象）
	 * @param pkPsnbasdocs 用户的NC编号
	 * @param queryDate 查询时间
	 */
	private Map<String, Object> getRewardSevereErrorCount(String[] pkPsnbasdocs, Date queryDate) {
		// 严重差错
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("事件等级", EnumEventLevel.SEVERE_ERROR.getCode());
		if (dic == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "事件等级", EnumEventLevel.SEVERE_ERROR.getCode());
		}
		Calendar cal = Calendar.getInstance();
		cal.setTime(queryDate);
		cal.add(Calendar.MONTH, -6);
		Date occurDateStart = cal.getTime();
		cal.setTime(queryDate);
		cal.add(Calendar.DAY_OF_MONTH, -1);
		Date occurDateEnd = cal.getTime();
		List<Map<String, Object>> counts = this.getRewardCount(pkPsnbasdocs, dic, occurDateStart, occurDateEnd);
		return this.countListToMap(counts);
	}
	
	/**
	 * 获取用户奖惩的次数
	 * @param pkPsnbasdocs 用户的NC编号
	 * @param eventLevel 事件等级
	 * @param occurDateStart 事发日期段的开始日期
	 * @param occurDateEnd 事发日期段的结束日期
	 */
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> getRewardCount(String[] pkPsnbasdocs, DictionaryDO eventLevel, Date occurDateStart, Date occurDateEnd) {
		
		StringBuilder hql = new StringBuilder();
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		hql.append("select new Map(t.rewardTarget.pkPsnbasdoc as pkPsnbasdoc, count(*) as count) from RewardsDO t where t.deleted = false");
		if (pkPsnbasdocs != null && pkPsnbasdocs.length > 0) {
			hql.append(" and t.rewardTarget.pkPsnbasdoc in (:pkPsnbasdocs)");
			params.add("pkPsnbasdocs");
			values.add(pkPsnbasdocs);
		}
		if (eventLevel != null) {
			hql.append(" and t.eventLevel = :eventLevel");
			params.add("eventLevel");
			values.add(eventLevel);
		}
		if (occurDateStart != null) {
			hql.append(" and t.occurDate >= :occurDateStart");
			params.add("occurDateStart");
			values.add(occurDateStart);
		}
		if (occurDateEnd != null) {
			hql.append(" and t.occurDate < :occurDateEnd");
			Calendar cal = Calendar.getInstance();
			cal.setTime(occurDateEnd);
			cal.add(Calendar.DAY_OF_MONTH, 1);
			params.add("occurDateEnd");
			values.add(cal.getTime());
		}
		hql.append(" group by t.rewardTarget.pkPsnbasdoc");
		List<Map<String, Object>> counts = (List<Map<String, Object>>) this.query(hql.toString(), params.toArray(new String[params.size()]), values.toArray());
		return counts;
	}
	
	private Map<String, Object> countListToMap(List<Map<String, Object>> counts) {
		Map<String, Object> map = new HashMap<String, Object>();
		for (Map<String, Object> count : counts) {
			map.put((String) count.get("pkPsnbasdoc"), count.get("count"));
		}
		return map;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

}
