package com.usky.service;

import java.util.List;
import java.util.Map;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;

public class GetApplyList extends WfService {
	@Override
	public String GetDescribe(){
		return "获取我的申请列表";
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
	
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String page_no = GetParam("page_no", "1");
        String page_size = GetParam("page_size", "20");
        String tag = GetParam("tag");
        String where = GetParam("where");
        String order = GetParam("order", "last_update desc");

        String sql = "select a.* from (select wi_id,wt_id,status,title,brief,start_time,end_time,last_user,remark description,last_update from " + WfMng.db_name + "workflow_inst wi where applyer = '" + user_id + "') a where 1 = 1";
        
        if (!Utility.IsEmpty(tag)) {
        	sql += " and exists (select 1 from " + WfMng.db_name + "app_tag_relate atr "
        			+ "where ("
        			+ "(object_type = 'workflow_inst' and object_id = wi_id)"
        			+ " or (object_type = 'workflow_inst_node' and object_id = win_id)"
        			+ " or (object_type = 'workflow_inst_path' and object_id = wip_id)"
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
//        ResultSet rs_apply = dc.ExecuteQuery(sql);
        List<Map<String, Object>> rs_apply = dc.executeQuery(sql);
        if (rs_apply == null) {
        	SetErrorMsg(dc);
        	return false;
        }
        
        //mResponseData.put("sql", sql);
        mResponseData.put("total", total);
        mResponseData.put("list", Utility.formatResultMaps(rs_apply));
		
		return true;
	}
}
