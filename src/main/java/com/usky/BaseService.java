package com.usky;

import java.util.*;
import java.util.Map.Entry;

import javax.servlet.http.*;

import com.usky.comm.*;

public class BaseService extends Object implements Cloneable {
	public String code = "";
	public boolean bShow = true;
	public HttpServletRequest request = null;
	public HttpServletResponse response = null;
	public Log log = null;
	public HttpServlet page = null;
	public HashMap<String, String> mParam = null;
	//public HashMap<String, Object> mResponse = null;
	public HashMap<String, Object> mResponseHeader = new LinkedHashMap<String, Object>();
	public HashMap<String, Object> mResponseData = new LinkedHashMap<String, Object>();
	public long startTime = 0;
	
	protected HashMap<String, String[]> h_usage = new LinkedHashMap<String, String[]>();
	
	@Override
	public BaseService clone() throws CloneNotSupportedException {
		return (BaseService)super.clone();
	}
	
	public String GetDescribe(){
		return "未定义";
	}
	
	protected void DefineParams(){
		
	}
	
	//系统启动时被调用
	public boolean init() {
		return true;
	}
	
    public HashMap<String, String[]> GetUsage()
    {
    	if (h_usage.size() == 0)
    		DefineParams();
        return h_usage;
    }
	
    public void AddParams(String name, String describe)
    {
        AddParams(name, describe, false);
    }

    public void AddParams(String name, String describe, boolean required)
    {
        AddParams(name, describe, required, "");
    }
	
    protected void AddParams(String name, String describe, boolean required, String value_list)
    {
    	if (Utility.IsEmpty(name))
    		return;
        h_usage.put(name, new String[] { describe, required ? "Y" : "N", value_list });
    }
	
    public void Usage(){
    	HashMap<String, Object> h = new LinkedHashMap<String, Object>();
    	int n = 0;
    	Iterator<Entry<String, String[]>> iter = h_usage.entrySet().iterator();
    	while (iter.hasNext()) {
    		Entry<String, String[]> e = iter.next();
    		String key = e.getKey();
    		String[] value = e.getValue();
    		n++;
    		if (value == null || value.length < 3) {
    			if (Utility.IsEmpty(key))
    				h.put("param_" + n, value);
    			else
    				h.put(key, value);
    			continue;
    		}
    		
    		String describe = value[0];
    		if (!Utility.IsEmpty(value[2])) {
    			String[] sa = value[2].split(",");
    			describe += "，只能是[" + sa[0] + "]";
    			for (int i = 1; i < sa.length - 1; i++)
    				describe += "、[" + sa[i] + "]";
    			describe += "或[" + sa[sa.length - 1] + "]";
    		}
    		if ("N".equals(value[1]))
    			describe += "，可选参数";
    		h.put(key, describe);
    	}
    	mResponseHeader.put("usage", h);
    	mResponseHeader.put("status", -1);
    	mResponseHeader.put("msg", "服务[" + code + "]未设置参数");
    }
    
    public boolean DoWork() throws Exception {
		if (!OnBeforeWork())
			return false;
		if (!OnWork())
			return false;
		if (!OnAfterWork())
			return false;
		return true;
    }
    
    protected boolean OnBeforeWork() throws Exception {
    	return true;
    }
    
	protected boolean OnWork() throws Exception {
		return true;
	}
	
	protected boolean OnAfterWork() throws Exception {
		return true;
	}
	
	//在OnResponse后调用，因此SetErrorMsg无用
	public void OnFinish() throws Exception {
		
	}
	
	public String GetResponseText(String text) throws Exception {
		return text;
	}
	
	public boolean HasParam(String key) {
		return mParam.containsKey(key);
	}
	
    public String GetParam(String key) throws Exception
    {
        return GetParam(key, "");
    }

    public String GetParam(String key, String dft) throws Exception
    {
        if (mParam.containsKey(key))
        	return mParam.get(key);
        else {
        	if (!h_usage.containsKey(key)) {
        		Usage();
        		throw new Exception("服务[" + code + "]未定义参数[" + key + "]");
        	}
        	return dft;
        }
    }
	
	protected void SetErrorMsg(DbClient dc) {
		SetErrorMsg(dc, false);
	}
	
	protected void SetErrorMsg(DbClient dc, boolean bLog) {
		SetErrorMsg(dc.ErrorMessage, -1, bLog);
	}
	
	protected void SetErrorMsg(String msg) {
		SetErrorMsg(msg, -1, false);
	}
	
	protected void SetErrorMsg(String msg, int status, boolean bLog) {
		mResponseHeader.put("status", status);
		mResponseHeader.put("msg", msg);
		
		if (bLog)
			log.WriteLine(msg);
	}
}
