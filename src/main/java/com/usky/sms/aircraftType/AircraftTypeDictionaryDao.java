package com.usky.sms.aircraftType;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserContext;

/**
 * @deprecated
 *
 */
@Deprecated
public class AircraftTypeDictionaryDao extends BaseDao<AircraftTypeDictionaryDO> {

	
	
	protected AircraftTypeDictionaryDao() {
		super(AircraftTypeDictionaryDO.class);
	}

	@SuppressWarnings("unchecked")
	public List<AircraftTypeDictionaryDO> getListByAircraftType(String aircraftType) {
		String sql = "from AircraftTypeDictionaryDO where deleted = false and upper(aircrafts) like upper(?)";
		List<AircraftTypeDictionaryDO> list = this.getHibernateTemplate().find(sql,  "%"+aircraftType+"%");
		return list;
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		AircraftTypeDictionaryDO aircraftTypeDictionary = (AircraftTypeDictionaryDO) obj;
		String aircraftType = aircraftTypeDictionary.getAircrafts();
		List<String> list = new ArrayList<String>();
		if(aircraftType != null){
			String[] aircraftStr = aircraftType.split(",");
			list.addAll(Arrays.asList(aircraftStr));
		}
		map.put("aircrafts", list);
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		String aircraftType = (String) map.get("aircraftType");
		@SuppressWarnings("unchecked")
		List<AircraftTypeDictionaryDO> aircraftTypeDictionary = this.getHibernateTemplate().find("from AircraftTypeDictionaryDO where deleted = false and aircraftType = ?",aircraftType);
		if (aircraftTypeDictionary.size() > 0) throw new SMSException(MessageCodeConstant.MSG_CODE_101002005, aircraftType);
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		String aircraftType = (String) map.get("aircraftType");
		@SuppressWarnings("unchecked")
		List<AircraftTypeDictionaryDO> aircraftTypeDictionary = this.getHibernateTemplate().find("from AircraftTypeDictionaryDO where deleted = false and aircraftType = ?",aircraftType);
		if (aircraftTypeDictionary.size() >= 1 && aircraftTypeDictionary.get(0).getId() != id) throw new SMSException(MessageCodeConstant.MSG_CODE_101002005, aircraftType);
		map.put("lastUpdater", UserContext.getUserId());
	}
	
	
}
