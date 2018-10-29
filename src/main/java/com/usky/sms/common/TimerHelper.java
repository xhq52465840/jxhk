
package com.usky.sms.common;

import java.util.ArrayList;
import java.util.List;

import org.apache.log4j.Logger;

public class TimerHelper {
	
	private static final Logger log = Logger.getLogger(TimerHelper.class);
	
	private static ThreadLocal<List<String>> points = new ThreadLocal<List<String>>();
	
	private static ThreadLocal<List<Long>> timingPoints = new ThreadLocal<List<Long>>();
	
	public static void init() {
		points.set(new ArrayList<String>());
		timingPoints.set(new ArrayList<Long>());
	}
	
	public static void clear() {
		points.get().clear();
		timingPoints.get().clear();
	}
	
	public static void timing(String point) {
		if (points.get() == null || timingPoints.get() == null) init();
		points.get().add(point);
		timingPoints.get().add(System.currentTimeMillis());
	}
	
	public static void print() {
		if (!log.isDebugEnabled()) return;
		String threadName = Thread.currentThread().getName();
		List<String> ponintList = points.get();
		List<Long> timingPointList = timingPoints.get();
		for (int i = 1; i < ponintList.size(); i++) {
			log.debug("<" + threadName + ">" + ponintList.get(i - 1) + "--" + ponintList.get(i) + ": " + (timingPointList.get(i) - timingPointList.get(i - 1)));
		}
		log.debug("<" + threadName + ">" + ponintList.get(0) + "--" + ponintList.get(ponintList.size() - 1) + ": " + (timingPointList.get(ponintList.size() - 1) - timingPointList.get(0)));
	}
	
}
