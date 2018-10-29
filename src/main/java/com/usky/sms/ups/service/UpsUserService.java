
package com.usky.sms.ups.service;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.DateHelper;
import com.usky.sms.core.Constants;
import com.usky.sms.ups.UpsUser;
import com.usky.sms.user.UserDO;

public class UpsUserService {
	
	private UpsService upsService;
	
	public UpsUserService() {
		upsService = new UpsService();
	}
	
	public List<UpsUser> fetchAll(String tokenId) throws Exception {
		return fetchUpsUser(tokenId, new Date(0));
	}
	
	public List<UpsUser> fetchUpsUser(String tokenId, Date sequenceTime) throws Exception {
		Map<String, String> parameters = new HashMap<String, String>();
		if (sequenceTime != null) parameters.put("sequencetime", DateHelper.formatIsoSecond(sequenceTime));
		@SuppressWarnings("unchecked")
		Map<String, Object> result = (Map<String, Object>) upsService.executeService("getAllUsers", tokenId, parameters);
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> list = (List<Map<String, Object>>) result.get("list");
		Gson gson = upsService.newUpsGson();
		return gson.fromJson(gson.toJson(list), new TypeToken<List<UpsUser>>() {}.getType());
	}
	
	public List<UserDO> toUserDO(List<UpsUser> list) {
		List<UserDO> userList = new ArrayList<UserDO>();
		for (UpsUser upsUser : list) {
			UserDO user = toUserDO(upsUser);
			if (user == null) continue;
			userList.add(user);
		}
		return userList;
	}
	
	public UserDO toUserDO(UpsUser upsUser) {
		UserDO user = new UserDO();
		user.setUsername(upsUser.getUsercode());
		user.setFullname(upsUser.getUsername());
		user.setCreated(DateHelper.parseIsoSecond(upsUser.getCreate_time()));
		user.setLastUpdate(DateHelper.parseIsoSecond(upsUser.getLast_update()));
		user.setDeleted("Y".equals(upsUser.getDeleted()));
		user.setStatus("Y".equals(upsUser.getActive()) ? Constants.NORMAL : Constants.CANCEL);
		user.setType(upsUser.getType());
		return user;
	}
	
}
