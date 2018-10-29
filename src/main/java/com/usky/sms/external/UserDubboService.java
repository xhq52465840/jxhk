package com.usky.sms.external;

import java.net.URLDecoder;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.juneyaoair.common.util.SmsSingleton;
import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.external.wrapper.UserWrapper;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.user.UserDO;

public class UserDubboService {
	
	private static final Logger log = Logger.getLogger(UserDubboService.class);
	
	private static final Gson gson = GsonBuilder4SMS.getInstance();
	
//	@Autowired
//	private NcInfoService ncInfoService;
	
//	public static void main(String[] args) {
//		getSmsUser(new Date());
//	}

	/**
	 * 获取oa的用户信息
	 * @param code 机场四字码
	 */
	public List<UserDO> getSmsUser(Date date) {
		try {
			log.info("调用外部接口NcInfoService.getUserInfo开始");
//			String s = URLDecoder.decode(ncInfoService.getUserInfo(DateHelper.formatIsoDate(date), "0"), "UTF-8");
			String s = URLDecoder.decode(SmsSingleton.getInstanceNC().getUserInfo(DateHelper.formatIsoDate(date), "0"), "UTF-8");
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取用户信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口NcInfoService.getUserInfo成功");
					return UserWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取用户信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口NcInfoService.getUserInfo失败", e);
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取用户信息失败");
//			return Collections.emptyList();
		}
	}

//	public void setNcInfoService(NcInfoService ncInfoService) {
//		this.ncInfoService = ncInfoService;
//	}
}
