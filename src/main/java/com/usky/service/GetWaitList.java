package com.usky.service;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;

public class GetWaitList extends WfService {
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
        String order = GetParam("order", "wiu_id desc");
		
        String sql = "select a.* from (select a.wiu_id tid,b.wi_id,c.wt_id,c.status inst_status,a.status task_status,(select wt.name from " + WfMng.db_name + "workflow_temp wt where wt.wt_id = c.wt_id) temp_name,b.win_id,d.wip_id,a.ops,c.title,c.brief,c.start_time,c.applyer,c.last_user,a.wiu_id,d.next_name from " + WfMng.db_name + "workflow_inst_user a," + WfMng.db_name + "workflow_inst_node b," + WfMng.db_name + "workflow_inst c," + WfMng.db_name + "workflow_inst_path d where c.status = '正在审批' and a.wip_id = d.wip_id and d.win_id = b.win_id and b.wi_id = c.wi_id and user_id = '" + user_id + "' and a.finished = 'N' and a.status = '等待操作') a where 1 = 1";
        
        if (!Utility.IsEmpty(tag)) {
        	sql += " and exists (select 1 from  " + WfMng.db_name + "app_tag_relate atr "
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
//        ResultSet rs_wiu = dc.ExecuteQuery(sql);
        List<Map<String, Object>> rs_wiu = dc.executeQuery(sql);
        if (rs_wiu == null) {
        	SetErrorMsg(dc);
        	return false;
        }
        
        //mResponseData.put("sql", sql);
        mResponseData.put("total", total);

        List<Map<String, Object>> al = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> wiu : rs_wiu) {
        	Map<String, Object> hm_wiu = Utility.formatResultMap(wiu);
        	al.add(hm_wiu);
        	
//        	sql = "select object_type,object_id,name tag_name,tag_value from " + WfMng.db_name + "app_tag_info ati," + WfMng.db_name + "app_tag_relate atr where ati.tid = atr.tid "
//        			+ "and ("
//        			+ " (object_type = 'workflow_inst_node' and object_id = " + rs_wiu.getString("WIN_ID") + ")"
//        			+ " or (object_type = 'workflow_inst_path' and object_id = " + rs_wiu.getString("WIP_ID") + ")"
//        			+ ")"
//        			;
//        	ResultSet rs_tag = dc.ExecuteQuery(sql);
        	sql = "select object_type,object_id,name tag_name,tag_value from " + WfMng.db_name + "app_tag_info ati," + WfMng.db_name + "app_tag_relate atr where ati.tid = atr.tid "
        			+ "and ("
        			+ " (object_type = 'workflow_inst_node' and object_id = ?)"
        			+ " or (object_type = 'workflow_inst_path' and object_id = ?)"
        			+ ")"
        			;
        	List<Map<String, Object>> rs_tag = dc.executeQuery(sql, (String) wiu.get("WIN_ID"), (String) wiu.get("WIP_ID"));
        	if (rs_tag == null) {
        		SetErrorMsg(dc);
        		return false;
        	}
        	hm_wiu.put("tags", Utility.formatResultMaps(rs_tag));
        	
        	HashMap<String, Object> hm_inst_attr = GetInstAttr(dc, (String) wiu.get("WI_ID"));
        	if (hm_inst_attr == null)
        		return false;
        	hm_wiu.put("inst_attr", hm_inst_attr);
        	
        	HashMap<String, Object> hm_node_attr = GetNodeAttr(dc, (String) wiu.get("WIN_ID"));
        	if (hm_node_attr == null)
        		return false;
        	hm_wiu.put("node_attr", hm_node_attr);

        	
        	HashMap<String, Object> hm_path_attr = GetInstAttr(dc, (String) wiu.get("WIP_ID"));
        	if (hm_path_attr == null)
        		return false;
        	hm_wiu.put("path_attr", hm_path_attr);
        	
        }

        mResponseData.put("list", al);
        
		return true;
	}
}
