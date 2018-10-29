package com.usky.service;

import java.util.*;
import java.sql.ResultSet;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.sms.field.screen.FieldScreenDO;
import com.usky.sms.field.screen.FieldScreenDao;

public class WfPathList extends WfService {
	@Override
	public String GetDescribe(){
		return "工作流路径列表";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("wt_id", "工作流模板id", true);
    }
	
	@SuppressWarnings("unused")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String id = GetParam("wt_id");
        
        FieldScreenDao fsd = (FieldScreenDao) WebApplicationContextUtils.getRequiredWebApplicationContext(request.getSession().getServletContext()).getBean("fieldScreenDao");
//        String sql = "select wtn_id,name,category from " + WfMng.db_name + "workflow_temp_node where wt_id = " + id + " order by wtn_id";
//        ResultSet rs_node = dc.ExecuteQuery(sql);
        String sql = "select wtn_id,name,category from " + WfMng.db_name + "workflow_temp_node where wt_id = ? order by wtn_id";
        List<Map<String, Object>> rs_node = dc.executeQuery(sql, id);
        if (rs_node == null) {
        	SetErrorMsg(dc);
        	return false;
        }
        List<Map<String, Object>> list_node = new ArrayList<Map<String, Object>>();
        Map<String, String> m_cate = new HashMap<String, String>();
        for (Map<String, Object> node : rs_node) {
        	Map<String, Object> m_node = new HashMap<String, Object>();
        	list_node.add(m_node);
        	
        	String wtn_id = (String) node.get("WTN_ID");
        	String name = (String) node.get("NAME");
        	String cate = (String) node.get("CATEGORY");
        	m_cate.put(name, cate);
        	
        	m_node.put("WTN_ID", wtn_id);
        	m_node.put("NAME", name);
        	m_node.put("CATEGORY", cate);
        }
        //rs_node.beforeFirst();
        
        Map<String, Object> m_path = new HashMap<String, Object>();
        //while (rs_node.next()) {
        for (Map<String, Object> m_node : list_node) {
        	/*
        	String wtn_id = rs_node.getString("WTN_ID");
        	String name = rs_node.getString("NAME");
        	String from_category = rs_node.getString("CATEGORY");
        	*/
        	String wtn_id = (String) m_node.get("WTN_ID");
        	String name = (String) m_node.get("NAME");
        	String from_category = (String) m_node.get("CATEGORY");
        	
//        	sql = "select wtp_id,name,next_name from " + WfMng.db_name + "workflow_temp_path wtp where wtn_id = " + wtn_id + " and next_name is not null order by wtp_id";
//        	ResultSet rs_path = dc.ExecuteQuery(sql);
        	sql = "select wtp_id,name,next_name from " + WfMng.db_name + "workflow_temp_path wtp where wtn_id = ? and next_name is not null order by wtp_id";
        	List<Map<String, Object>> rs_path = dc.executeQuery(sql, wtn_id);
        	if (rs_path == null) {
        		SetErrorMsg(dc);
        		return false;
        	}
        	List<Map<String, Object>> list_path = new ArrayList<Map<String, Object>>();
        	for (Map<String, Object> path : rs_path) {
        		String wtp_id = (String) path.get("WTP_ID");
        		String path_name = (String) path.get("NAME");
        		String next_name = (String) path.get("NEXT_NAME");
        		String to_category = m_cate.get(next_name);
        		
        		Map<String, Object> m_node_path = new LinkedHashMap<String, Object>();
        		m_node_path.put("path_name", path_name);
        		m_node_path.put("from_category", from_category);
        		m_node_path.put("to", next_name);
        		m_node_path.put("to_category", to_category);
        		
//        		sql = "select attr_value from " + WfMng.db_name + "workflow_temp_attr where wt_id = " + id + " and wtn_id = " + wtn_id + " and wtp_id = " + wtp_id + " and attr_name = 'screen'";
//        		ResultSet rs_screen = dc.ExecuteQuery(sql);
        		sql = "select attr_value from " + WfMng.db_name + "workflow_temp_attr where wt_id = ? and wtn_id = ? and wtp_id = ? and attr_name = 'screen'";
        		List<Map<String, Object>> rs_screen = dc.executeQuery(sql, id, wtn_id, wtp_id);
        		if (rs_screen == null) {
        			SetErrorMsg(dc);
        			return false;
        		}
        		m_node_path.put("screen_id", null);
        		m_node_path.put("screen", null);
        		for (Map<String, Object> screen : rs_screen) {
        			m_node_path.put("screen_id", (String) screen.get("ATTR_VALUE"));
        			List<FieldScreenDO> list_fs = fsd.internalGetByIds(new String[] {(String) screen.get("ATTR_VALUE")});
        			if (list_fs != null && list_fs.size() > 0) {
        				FieldScreenDO fs = list_fs.get(0);
        				m_node_path.put("screen", fs.getDisplayName());
        			}
        		}
        		list_path.add(m_node_path);
        	}
        	if (list_path.size() > 0)
        		m_path.put(name, list_path);
        }
        mResponseData.put("list", m_path);

        return true;
	}
}
