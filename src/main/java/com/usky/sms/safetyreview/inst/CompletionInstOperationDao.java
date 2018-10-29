package com.usky.sms.safetyreview.inst;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.comm.JsonUtil;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class CompletionInstOperationDao extends BaseDao<CompletionInstOperationDO> {
	
	private Config config;
	
	@Autowired
	private UserDao userDao;
	
	protected CompletionInstOperationDao() {
		super(CompletionInstOperationDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		CompletionInstOperationDO completionInstOperation = (CompletionInstOperationDO) obj;
		if ("user".equals(fieldName)) {
			UserDO user = completionInstOperation.getUser();
			if(user==null){
				user = userDao.getByUsername("ANONYMITY");
			}
			map.put("userId", user.getId());
			map.put("username", user.getUsername());
			map.put("fullname", user.getFullname());
			AvatarDO avatar = user.getAvatar();
			map.put("avatar", config.getUserAvatarWebPath() + "/" + (avatar == null ? config.getUnknownUserAvatar() : avatar.getFileName()));
		} else if ("data".equals(fieldName)) {
			List<Object> list = new ArrayList<Object>();
			// 解析data的数据获取details,对其进行处理
			@SuppressWarnings("unchecked")
			Map<String, Object> dataMap = (Map<String, Object>) JsonUtil.getGson().fromJson(completionInstOperation.getData(), Object.class);
			if (null != dataMap) {
				@SuppressWarnings("unchecked")
				List<String> details = (List<String>) dataMap.get("details");
				if (null != details) {
					for(String detail : details){
						Map<String, String> detailMap = new HashMap<String, String>();
						detailMap.put("content", detail);
						list.add(detailMap);
					}
				}
			}
			map.put("details", list);
		} else if ("created".equals(fieldName)) {
			map.put("date", DateHelper.formatIsoSecond(completionInstOperation.getCreated()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	public UserDao getUserDao() {
		return userDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
}
