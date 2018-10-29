
package com.usky.sms.service;

import java.util.HashMap;
import java.util.Map;

public class ServiceRegister {
	
	private static Map<String, Map<String, Service>> serviceMap = new HashMap<String, Map<String, Service>>();
	
	static {
		for (String[] service : ServiceDao.services) {
			register(service[0], service[1], service[2], service[3]);
		}
	}
	
	public static void register(String serviceName, String methodSign, String beanName, String methodName) {
		Map<String, Service> map = serviceMap.get(serviceName);
		if (map == null) {
			map = new HashMap<String, Service>();
			serviceMap.put(serviceName, map);
		}
		map.put(methodSign, new Service(beanName, methodName));
	}
	
	public static Service getService(String serviceName, String methodSign) {
		Map<String, Service> map = serviceMap.get(serviceName);
		if (map == null) return null;
		return map.get(methodSign);
	}
	
}
