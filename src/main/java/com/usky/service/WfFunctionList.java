package com.usky.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;

public class WfFunctionList extends WfService {
	@Override
	public String GetDescribe(){
		return "获取工作流功能信息列表";
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
        AddParams("with_data", "是否包含数据字段，缺省为N", false, "Y,N");
    }
	
	//type 触发条件 校验条件 结果处理
	@SuppressWarnings("unused")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String page_no = GetParam("page_no", "1");
        String page_size = GetParam("page_size", "20");
        String tag = GetParam("tag");
        String where = GetParam("where");
        String order = GetParam("order", "last_update desc");
        String with_data = GetParam("with_data", "N");
        
        String sql = "select id,name,showname,description,active,type,umodule,remark" 
        		+ ("Y".equals(with_data) ? ",data" : "")
        		+ " from t_wf_function"
        		+ " where 1 = 1"
        		;
        
        if (!Utility.IsEmpty(tag)) {
        	sql += " and exists (select 1 from " + WfMng.db_name + "app_tag_relate atr "
        			+ "where ("
        			+ "(object_type = 't_wf_function' and object_id = id)"
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
//        ResultSet rs_list = dc.ExecuteQuery(sql);
        List<Map<String, Object>> rs_list = dc.executeQuery(sql);
        if (rs_list == null) {
        	SetErrorMsg(dc);
        	return false;
        }
        
        //mResponseData.put("sql", sql);
        mResponseData.put("total", total);
        
        List<Map<String, Object>> al = new ArrayList<Map<String, Object>>();
        mResponseData.put("list", al);
        
        for (Map<String, Object> list : rs_list) {
        	Map<String, Object> hm_list = Utility.formatResultMap(list);
        	hm_list.put("tag", GetTag(dc, "t_wf_function", (String) list.get("ID")));
        	
        	al.add(hm_list);
        }
        
        return true;
	}
}
