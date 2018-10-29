package com.usky.sms.aircraftType;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserContext;

public class AircraftModelDao extends BaseDao<AircraftModelDO> {

	protected AircraftModelDao() {
		super(AircraftModelDO.class);
	}
	
	/**
	 * 唯一性约束
	 * @param code
	 * @param familycode
	 * @param manufacturer
	 */
	public void validateUnique(String code, String familycode, String manufacturer) {
		@SuppressWarnings("unchecked")
		List<Long> cnt = this.getHibernateTemplate().find("select count(t.id) from AircraftModelDO t where t.deleted = false and t.code = ? and familycode = ? and t.manufacturer = ?", code, familycode, manufacturer);
		if (cnt.get(0) > 0) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_128000001, code, familycode, manufacturer);
		}
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		String code = (String) map.get("code");
		String familycode = (String) map.get("familycode");
		String manufacturer = (String) map.get("manufacturer");
		this.validateUnique(code, familycode, manufacturer);
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		String code = (String) map.get("code");
		String familycode = (String) map.get("familycode");
		String manufacturer = (String) map.get("manufacturer");
		this.validateUnique(code, familycode, manufacturer);
		map.put("lastUpdater", UserContext.getUserId());
	}

	@Override
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	/**
	 * 查询机型对应的字段(familycode:机型系列，manufacturer：机型厂商，code：机型类型(小分类))
	 * @param field 查询的字段
	 * @param familycode 机型系列(大分类)
	 * @param code 机型类型(小分类)
	 * @param manufacturer 机型厂商
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<String> getFieldBySearch(String field, String familycode, String code, String manufacturer, boolean fuzzySearch) {
		String[] fields = new String[]{"familycode", "manufacturer", "code"};
		if (!Arrays.asList(fields).contains(field)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_101002013, field);
		}
		StringBuffer hql = new StringBuffer("select distinct ");
		hql.append(field);
		hql.append(" from AircraftModelDO t where t.deleted = false");
		List<Object> values = new ArrayList<Object>();
		if (!StringUtils.isBlank(familycode)) {
			this.generateSearchHql("familycode", familycode, fuzzySearch, values, hql);
		}
		if (!StringUtils.isBlank(code)) {
			this.generateSearchHql("code", code, fuzzySearch, values, hql);
		}
		if (!StringUtils.isBlank(manufacturer)) {
			this.generateSearchHql("manufacturer", manufacturer, fuzzySearch, values, hql);
		}
		hql.append(" order by ");
		hql.append(field);
		return (List<String>) this.query(hql.toString(), values.toArray());
	}
	
	private void generateSearchHql(String field, String value, boolean fuzzySearch, List<Object> values, StringBuffer hql) {
		if (!StringUtils.isBlank(value)) {
			hql.append(" and t.");
			hql.append(field);
			if (fuzzySearch) {
				String transferredvalue = value.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
				transferredvalue = "%" + transferredvalue + "%";
				hql.append(" like ?");
				values.add(transferredvalue);
			} else {
				hql.append(" = ?");
				values.add(value);
			}
		}
	}
	
	/**
	 * 获取大机型与小机型的对应关系
	 * @return map key为大机型， value为小机型的list
	 */
	public Map<String, Object> getFamilycodes() {
		Map<String, Object> result = new HashMap<String, Object>();
		List<AircraftModelDO> list = this.getList();
		for (AircraftModelDO aircraftModel : list) {
			@SuppressWarnings("unchecked")
			List<String> codes = (List<String>) result.get(aircraftModel.getFamilycode());
			if (codes == null) {
				codes = new ArrayList<String>();
			}
			if (aircraftModel.getCode() != null && !codes.contains(aircraftModel.getCode())) {
				codes.add(aircraftModel.getCode());
			}
			result.put(aircraftModel.getFamilycode(), codes);
		}
		return result;
	}
}

