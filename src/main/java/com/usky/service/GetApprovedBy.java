package com.usky.service;

import java.util.List;
import java.util.Map;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;

public class GetApprovedBy extends WfService {
	@Override
	public String GetDescribe(){
		return "获取待我审批列表";
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

        String sql = "select a.* from (select a.wiu_id tid,b.wi_id,c.wt_id,b.win_id,c.title,c.brief,c.status,b.name node_name,c.remark description,c.start_time,c.end_time,c.applyer,c.last_user,a.wiu_id,c.last_update from " + WfMng.db_name + "workflow_inst_user a," + WfMng.db_name + "workflow_inst_node b," + WfMng.db_name + "workflow_inst c," + WfMng.db_name + "workflow_inst_path d where a.wip_id = d.wip_id and d.win_id = b.win_id and b.wi_id = c.wi_id and user_id = '" + user_id + "' and finished = 'Y' and a.status = '已完成') a where 1 = 1";

        if (!Utility.IsEmpty(tag)) {
        	sql += " and exists (select 1 from app_tag_relate atr "
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
