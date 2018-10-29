package com.usky.sms.losa;

import java.lang.reflect.Field;
import java.util.Map;

import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.BaseDao;
import com.usky.sms.eiosa.OperateLogDO;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class LosaOperateLogDao extends BaseDao<LosaOperateLogDO>{
	private Config config;
	
	public LosaOperateLogDao(){
		super(LosaOperateLogDO.class);
		this.config = Config.getInstance();
		
	}
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator",UserContext.getUserId());
		return super.beforeSave(map);
	}
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("targetId".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}	
	public void addLog(int source, String type, String operType,String detail) throws Exception{
         try{
        	 LosaOperateLogDO log=new LosaOperateLogDO();
        	 log.setCreator(UserContext.getUser());
 			 log.setLast_modifier(UserContext.getUserId());
			 log.setDetail(detail);
			 log.setTargetId(source);
			 log.setType(type);
			 log.setOper_type(operType);
			 this.internalSave(log);
			
		}catch(Exception e){
			e.printStackTrace();
		}
	}	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		LosaOperateLogDO log=(LosaOperateLogDO)obj;
		if("creator".equals(fieldName)){
			UserDO user = log.getCreator();
			map.put("userId", user.getId());
			map.put("username", user.getUsername());
			map.put("fullname", user.getFullname());
			AvatarDO avatar = user.getAvatar();
			map.put("avatar", config.getUserAvatarWebPath() + "/" + (avatar == null ? config.getUnknownUserAvatar() : avatar.getFileName()));
		}else if ("created".equals(fieldName)) {
			map.put("date", DateHelper.formatIsoSecond(log.getCreated()));
		}
		super.setField(map, obj, claz, multiple, field);
	}
}
