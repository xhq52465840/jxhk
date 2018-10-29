package com.usky.service;

import java.sql.ResultSet;
import java.util.*;

import com.usky.*;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;

public class GetTemplateList extends WfService {
	@Override
	public String GetDescribe(){
		return "获取工作流模板列表";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("page_no", "页号，缺省为1");
        AddParams("page_size", "每页记录数，缺省为20");
        AddParams("tag", "标签，标签包括标签名和标签值，标签名和标签值间有冒号分隔，多个标签间用逗号分隔，如：tag1:value1,tag2,tag3:value3");
        AddParams("where", "查询条件");
        AddParams("order", "排序参数");
    }
	
	@SuppressWarnings("unused")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String page_no = GetParam("page_no", "1");
        String page_size = GetParam("page_size", "20");
        String tag = GetParam("tag");
        String where = GetParam("where");
        String order = GetParam("order", "wt_id");

        String sql = "select wt_id,name,title,active,remark,last_update from " + WfMng.db_name + "workflow_temp wt where 1 = 1";

        if (!Utility.IsEmpty(tag)) {
        	sql += " and exists (select 1 from " + WfMng.db_name + "app_tag_relate atr "
        			+ "where ("
        			+ "(object_type = 'workflow_temp' and object_id = wt.wt_id)"
        			+ " or (object_type = 'workflow_temp_node' and object_id in (select wtn_id from workflow_temp_node wtn where wtn.wt_id = wt.wt_id))"
        			+ " or (object_type = 'workflow_temp_path' and object_id in (select wtp_id from workflow_temp_path wtp where wtn_id in (select wtn_id from workflow_temp_node wtn where wtn.wt_id = wt.wt_id)))"
        			+ " )"
        			+ " and " + GetTagSql(dc, tag)
        			+ ")"
        			;
        }
        if (!Utility.IsEmpty(where))
        	sql += " and " + where;
        
        String total = dc.GetTotal(sql);
        if (Utility.IsEmpty(total)) {
        	SetErrorMsg(dc);
        	return false;
        }
        sql = dc.GetPageSql(sql, order, page_no, page_size);
//        ResultSet rs_temp = dc.ExecuteQuery(sql);
        List<Map<String, Object>> rs_temp = dc.executeQuery(sql);
        if (rs_temp == null) {
        	SetErrorMsg(dc);
        	return false;
        }
        
        //mResponseData.put("sql", sql);
        mResponseData.put("total", total);
        
        List<Map<String, Object>> al = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> temp : rs_temp) {
        	Map<String, Object> hm_temp = Utility.formatResultMap(temp);
        	al.add(hm_temp);
        	
//        	sql = "select object_type,object_id,name tag_name,tag_value from " + WfMng.db_name + "app_tag_info ati," + WfMng.db_name + "app_tag_relate atr where ati.tid = atr.tid "
//        			+ "and ("
//        			+ "(object_type = 'workflow_temp' and object_id = " + rs_temp.getString("WT_ID") + ")"
//        			+ " or (object_type = 'workflow_temp_node' and object_id in (select wtn_id from workflow_temp_node wtn where wtn.wt_id = " + rs_temp.getString("WT_ID") + "))"
//        			+ " or (object_type = 'workflow_temp_path' and object_id in (select wtp_id from workflow_temp_path wtp where wtn_id in (select wtn_id from workflow_temp_node wtn where wtn.wt_id = " +  rs_temp.getString("WT_ID") + ")))"
//        			+ ")"
//        			;
//        	ResultSet rs_tag = dc.ExecuteQuery(sql);
        	sql = "select object_type,object_id,name tag_name,tag_value from " + WfMng.db_name + "app_tag_info ati," + WfMng.db_name + "app_tag_relate atr where ati.tid = atr.tid "
        			+ "and ("
        			+ "(object_type = 'workflow_temp' and object_id = ?)"
        			+ " or (object_type = 'workflow_temp_node' and object_id in (select wtn_id from workflow_temp_node wtn where wtn.wt_id = ?))"
        			+ " or (object_type = 'workflow_temp_path' and object_id in (select wtp_id from workflow_temp_path wtp where wtn_id in (select wtn_id from workflow_temp_node wtn where wtn.wt_id = ?)))"
        			+ ")"
        			;
        	List<Map<String, Object>> rs_tag = dc.executeQuery(sql, (String) temp.get("WT_ID"), (String) temp.get("WT_ID"), (String) temp.get("WT_ID"));
        	if (rs_tag == null) {
        		SetErrorMsg(dc);
        		return false;
        	}
        	hm_temp.put("tags", Utility.formatResultMaps(rs_tag));
        }

        mResponseData.put("list", al);

		return true;
	}
}
