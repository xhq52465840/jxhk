package com.usky;

import java.net.URLDecoder;
import java.sql.ResultSet;
import java.util.*;
import java.util.Map.Entry;


import com.usky.comm.*;

public class DbService extends BaseService {
	protected DbClient dbclient = null;
	protected String trace_id = "";
	
	protected boolean GetDbClient() {
		return true;
	}
	
	@Override
	protected boolean OnBeforeWork() throws Exception {
		if (!super.OnBeforeWork())
			return false;
		
		String ctx_name = page.getServletConfig().getInitParameter("DatabaseContext");
		if (Utility.IsEmpty(ctx_name)){
			SetErrorMsg("在web.xml中没有DatabaseContext参数", -1, true);
			return false;
		}
		
		dbclient = new DbClient();
		dbclient.log = log;
		if (!dbclient.Open(ctx_name)) {
			SetErrorMsg(dbclient);
			return false;
		}
		
		return OnBeforeWork(dbclient);
	}
	
	protected boolean OnBeforeWork(DbClient dc) throws Exception {
		String url = "http://" + request.getLocalAddr() + (request.getLocalPort() == 80 ? "" : ":" + request.getLocalPort()) + request.getRequestURI();
		if (mParam.size() > 0) {
			url += "?";
			if (request.getMethod().toUpperCase().equals("GET"))
				url += URLDecoder.decode(request.getQueryString(), "UTF-8");
			else {
				Iterator<Entry<String, String>> it = mParam.entrySet().iterator();
				while (it.hasNext()) {
					Entry<String, String> entry = it.next();
					url += entry.getKey() + "=" + entry.getValue() + "&";
					//log.WriteLine(entry.getKey() + "=" + entry.getValue());
				}
				url = url.substring(0, url.length() - 1);
			}
		}
		log.WriteLine(code + "\t" + url + " from " + request.getRemoteAddr());
		String brief = url;
		if (brief.length() > 3000)
			brief = brief.substring(0, 3000);
		
        String sql = "insert into app_trace(id,uri,user_id,sv,brief,url,ip,last_update) values("
                + dc.GetSeqNextValue("id_seq") + ","
                + "'" + dc.FormatString(page.getServletName()) + "',"
                + (HasParam("user_id") ? "'" + dc.FormatString(GetParam("user_id")) + "'," : "null,")
                + "'" + dc.FormatString(code) + "',"
                + "'" + dc.FormatString(brief) + "',"
                + (dc.IsOracle() ? "empty_clob()," : "'" + dc.FormatString(url) + "',")
                + "'" + request.getRemoteAddr() + "',"
                + dc.GetSysdate() + ")"
                ;
        dc.BeginTrans();
        int ect = dc.Execute(sql);
        if (ect < 0) {
        	SetErrorMsg(dc);
        	dc.Rollback();
        	return false;
        }
        trace_id = dc.GetSequence("id_seq");
        if (Utility.IsEmpty(trace_id)) {
        	dc.Rollback();
        	return false;
        }
        
        if (dc.IsOracle()) {
        	sql = "select id,url from app_trace where id = " + trace_id;
        	ResultSet rs_trace = dc.ExecuteQuery(sql);
        	if (rs_trace == null) {
        		SetErrorMsg(dc);
        		dc.Rollback();
        		return false;
        	}
        	if (!rs_trace.next()) {
        		SetErrorMsg("内部错误： 无法找到trace_id " + trace_id);
        		dc.Rollback();
        		return false;
        	}
        	if (!dc.UpdateClob(rs_trace, "url", url)) {
        		SetErrorMsg(dc);
        		dc.Rollback();
        		return false;
        	}
        }
        dc.Commit();
		
		return true;
	}
	
	@Override
	protected boolean OnWork() throws Exception {
		if (!super.OnWork())
			return false;
		
		return OnWork(dbclient);
	}
	
	protected boolean OnWork(DbClient dc) throws Exception {
		return true;
	}
	
	@Override
	protected boolean OnAfterWork() throws Exception {
		if (!super.OnAfterWork())
			return false;
		
		return OnAfterWork(dbclient);
	}
	
	protected boolean OnAfterWork(DbClient dc) throws Exception {
		return true;
	}

	@Override
	public void OnFinish() throws Exception {
		OnFinish(dbclient);
		
		super.OnFinish();
	}
	protected void OnFinish(DbClient dc) throws Exception {
		if (dc != null && dc.IsOpen()) {
			dc.Rollback();
			
			if (!Utility.IsEmpty(trace_id)) {
				int status = Integer.parseInt(mResponseHeader.get("status").toString());
				String msg = mResponseHeader.get("msg").toString();
	            if (msg.length() >= 3000)
	                msg = msg.substring(0, 3000) + " ...";
	            String sql = "update app_trace set msg = '" + dc.FormatString(msg) + "',status = " + status + ",time = " + ((new Date()).getTime() - startTime) + " where id = " + trace_id;
	            dc.BeginTrans();
	            int ect = dc.Execute(sql);
	            if (ect == 0) {
	            	log.WriteLine(sql + " 执行失败");
	            }
	            else if (ect > 0)
	            	dc.Commit();
			}
			
			dc.Close();
		}
	}
}
