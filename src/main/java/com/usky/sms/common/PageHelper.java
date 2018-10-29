
package com.usky.sms.common;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

public class PageHelper {
	
	public static Integer getFirstResult(HttpServletRequest request) {
		String iDisplayStart = request.getParameter("start");
		if (iDisplayStart == null || iDisplayStart.trim().length() == 0) return null;
		Integer firstResult = Integer.parseInt(iDisplayStart);
		return firstResult;
	}
	
	public static Integer getMaxResults(HttpServletRequest request) {
		String iDisplayLength = request.getParameter("length");
		if (iDisplayLength == null || iDisplayLength.trim().length() == 0) return null;
		Integer maxResults = Integer.parseInt(iDisplayLength);
		return maxResults;
	}
	
	public static Map<String, Object> getPagedResult(List<?> list, HttpServletRequest request) {
		Integer from = getFirstResult(request);
		from = from == null ? 0 : from;
		Integer size = getMaxResults(request);
		Integer to = size == null ? list.size() : from + size;
		to = to < list.size() ? to : list.size();
		return getPagedResult(list.subList(from, to), request, list.size());
	}
	
	public static Map<String, Object> getPagedResult(List<?> list, HttpServletRequest request, int count) {
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("sEcho", request.getParameter("sEcho"));
		result.put("iTotalDisplayRecords", count);
		result.put("iTotalRecords", count);
		result.put("aaData", list);
		return result;
	}
	
}
