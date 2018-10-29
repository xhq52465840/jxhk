package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.user.UserDO;

public class UserWrapper {

	/**
	 * 将外部接口返回的机场数据封装成UserDO
	 * @param map
	 * @return
	 */
	public static UserDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			UserDO userDO = new UserDO();
			userDO.setEmail((String) map.get("EMAIL"));
			userDO.setDeleted("Y".equals((String) map.get("ISVALID")) ? false : true);
			userDO.setFullname((String) map.get("PSNNAME"));
			userDO.setOaDeptName((String) map.get("DEPTNAME"));
			userDO.setPkPsnbasdoc((String) map.get("PK_PSNBASDOC"));
			userDO.setTelephoneNumber((String) map.get("MOBILE"));
			userDO.setSex("男".equals((String) map.get("SEX")) ? 1 : 0);
			userDO.setUsername((String) map.get("DOMAIN_ID"));
			// 岗位
			userDO.setJobName((String) map.get("JOBNAME"));
			// 学历
			userDO.setEducation((String) map.get("EDUCATION"));
			// 生日
			userDO.setBirthDate((String) map.get("BIRTHDATE"));
			// 毕业院校
			userDO.setSchool((String) map.get("SCHOOL"));
			// 是否离职
			userDO.setOnTheJob("在职".equals((String) map.get("PSNCLSCOPE")) ? true : false);
			// 身份证
			userDO.setIdentity((String) map.get("ID"));
			return userDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的机场数据的list封装成AirportDO的list
	 * @param maps 机场数据的map的list
	 * @return
	 */
	public static List<UserDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<UserDO> list = new ArrayList<UserDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				UserDO userDO = wrapFromMap(map);
				if (userDO != null) {
					list.add(userDO);
				}
			}
		}
		return list;
	}
}
