package com.usky.service;

import java.sql.*;
import java.util.*;

import com.usky.*;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;

public class GetInstanceDetail extends WfService {
	@Override
	public String GetDescribe(){
		return "获取工作流实例详情";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("wi_id", "工作流实例id", true);
    }
	
	@SuppressWarnings("unused")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String wi_id = GetParam("wi_id");
        
//        String sql = "select wt_id,title,brief,status,applyer,first_node_name,last_user,start_time,end_time,remark from " + WfMng.db_name + "workflow_inst where wi_id = " + wi_id;
//        ResultSet rs_inst = dc.ExecuteQuery(sql);
        String sql = "select wt_id,title,brief,status,applyer,first_node_name,last_user,start_time,end_time,remark from " + WfMng.db_name + "workflow_inst where wi_id = ?";
        List<Map<String, Object>> rs_inst = dc.executeQuery(sql, wi_id);
        if (rs_inst == null) {
        	SetErrorMsg(dc);
        	return false;
        }
        if (rs_inst.isEmpty()) {
        	SetErrorMsg("工作流实例[" + wi_id + "]不存在");
        	return false;
        }
        
        Utility.formatResultMap(rs_inst.get(0), mResponseData);
        
        mResponseData.put("attr", GetInstAttr(dc, wi_id));
        mResponseData.put("tag", GetTag(dc,"workflow_inst", wi_id));
        
//        sql = "select win_id,wtn_id,name,type,last_node,status,type,start_time,end_time,remark from " + WfMng.db_name + "workflow_inst_node where wi_id = " + wi_id + " order by win_id";
//        ResultSet rs_node = dc.ExecuteQuery(sql);
        sql = "select win_id,wtn_id,name,type,last_node,status,type,start_time,end_time,remark from " + WfMng.db_name + "workflow_inst_node where wi_id = ? order by win_id";
        List<Map<String, Object>> rs_node = dc.executeQuery(sql, wi_id);
        if (rs_node == null) {
        	SetErrorMsg(dc);
        	return false;
        }
        
        List<Map<String, Object>> list_node = new ArrayList<Map<String, Object>>();
        for(Map<String, Object> node : rs_node) {
        	Map<String, Object> hm_node = Utility.formatResultMap(node);
        	list_node.add(hm_node);
        	
            hm_node.put("attr", GetNodeAttr(dc, (String) node.get("WIN_ID")));
            hm_node.put("tag", GetTag(dc,"workflow_inst_node", (String) node.get("WIN_ID")));
            
//            sql = "select wip_id,wtp_id,userlist,ops,next_name,next_id,remark,condition from " + WfMng.db_name + "workflow_inst_path where win_id = " + rs_node.getString("WIN_ID");
//            ResultSet rs_path = dc.ExecuteQuery(sql);
            sql = "select wip_id,wtp_id,userlist,ops,next_name,next_id,remark,condition from " + WfMng.db_name + "workflow_inst_path where win_id = ?";
            List<Map<String, Object>> rs_path = dc.executeQuery(sql, (String) node.get("WIN_ID"));
            if (rs_path == null) {
            	SetErrorMsg(dc);
            	return false;
            }
            List<Map<String, Object>> al_path = new ArrayList<Map<String, Object>>();
            hm_node.put("path", al_path);
            for (Map<String, Object> path : rs_path) {
            	Map<String, Object> hm_path = Utility.formatResultMap(path);
            	al_path.add(hm_path);
            	if ("人工".equals((String) node.get("TYPE")) || "机器人".equals((String) node.get("TYPE"))) {
            		hm_path.remove("condition");
            		hm_path.put("andor", (String) path.get("CONDITION"));
//            		sql = "select wiu_id,user_id,ops,operate,status,finished,remark,last_update from " + WfMng.db_name + "workflow_inst_user where wip_id = " + rs_path.getString("WIP_ID");
//            		ResultSet rs_user = dc.ExecuteQuery(sql);
            		sql = "select wiu_id,user_id,ops,operate,status,finished,remark,last_update from " + WfMng.db_name + "workflow_inst_user where wip_id = ?";
            		List<Map<String, Object>> rs_user = dc.executeQuery(sql, (String) path.get("WIP_ID"));
            		if (rs_user == null) {
            			SetErrorMsg(dc);
            			return false;
            		}
            		hm_path.put("operates", Utility.formatResultMaps(rs_user));
            	}
            	
                hm_path.put("attr", GetPathAttr(dc, (String) path.get("WIP_ID")));
                hm_path.put("tag", GetTag(dc,"workflow_inst_path", (String) path.get("WIP_ID")));
            }
        }
        mResponseData.put("nodes", list_node);

        return true;
	}
}
