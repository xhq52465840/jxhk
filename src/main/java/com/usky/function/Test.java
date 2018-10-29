package com.usky.function;

import java.util.HashMap;

import com.usky.comm.*;

public class Test {
	public static String Hello(HashMap<String, Object> h_page_param, HashMap<String, Object> h_wf_param, HashMap<String, Object> mResponseHeader, HashMap<String, Object> mResponseData, Log log) throws Exception {
		mResponseData.put("Hello", "world");
		mResponseHeader.put("status", 123);
		mResponseHeader.put("msg", "456");
		mResponseData.put("Test", "ok");
		//throw new Exception("Hello");
		return "abc,def";
	}
}
