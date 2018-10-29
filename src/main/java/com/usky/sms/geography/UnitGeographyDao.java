package com.usky.sms.geography;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.BaseDao;
import com.usky.sms.unit.UnitDao;

public class UnitGeographyDao extends BaseDao<UnitGeographyDO> {

	@Autowired
	private UnitDao unitDao;

	public UnitGeographyDao() {
		super(UnitGeographyDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		UnitGeographyDO unitGeography = (UnitGeographyDO)obj;
		if("unit".equals(fieldName)){
			Map<String, Object> unit = new HashMap<String, Object>();
			unit.put("name", unitGeography.getUnit().getName());
			unit.put("id", unitGeography.getUnit().getId());
			map.put(fieldName, unit);
		}else if("geography".equals(fieldName)){
			Map<String, Object> geography = new HashMap<String, Object>();
			geography.put("longitude", unitGeography.getGeography().getLongitude());
			geography.put("latitude", unitGeography.getGeography().getLatitude());
			geography.put("city", unitGeography.getGeography().getCity());
			geography.put("id", unitGeography.getGeography().getId());
			map.put(fieldName, geography);
		}else{
			super.setField(map, obj, claz, multiple, field);
		}
	}

	/**
	 * @param unitDao the unitDao to set
	 */
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

}
