package com.usky.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.JsonUtil;
import com.usky.comm.Utility;
import com.usky.sms.activity.attribute.ActivityStatusDO;
import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.workflow.WorkflowSchemeDao;

public class WfSetupList extends WfService {
	@Autowired
	private ActivityStatusDao activityStatusDao;

	public void setActivityStatusDao(ActivityStatusDao activityStatusDao) {
		this.activityStatusDao = activityStatusDao;
	}

	@Override
	public String GetDescribe(){
		return "获取工作流设置数据列表";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("wsd_id", "工作流设置数据id");
        AddParams("wi_id", "流程实例id");
        AddParams("page_no", "页号，缺省为1");
        AddParams("page_size", "每页记录数，缺省为20");
        AddParams("tag", "标签，标签包括标签名和标签值，标签名和标签值间有冒号分隔，多个标签间用逗号分隔，如：tag1:value1,tag2,tag3:value3");
        AddParams("where", "查询条件");
        AddParams("order", "排序参数");
        AddParams("with_data", "是否包含数据字段，缺省为N", false, "Y,N");
    }
	
	@SuppressWarnings({ "unused", "rawtypes", "unchecked" })
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String wsd_id = GetParam("wsd_id");
        String wi_id = GetParam("wi_id");
        String page_no = GetParam("page_no", "1");
        String page_size = GetParam("page_size", "20");
        String tag = GetParam("tag");
        String where = GetParam("where");
        String order = GetParam("order", "dft desc, last_update desc");
        String with_data = GetParam("with_data", "N");
        
        String sql;
        if (!Utility.IsEmpty(wi_id)) {
        	if (!Utility.IsEmpty(wsd_id)) {
        		SetErrorMsg("wi_id和wsd_id参数不能同时输入");
        		return false;
        	}
//        	sql = "select wsd_id from " + WfMng.db_name + "wf_setup_data where wt_id = (select wt_id from " + WfMng.db_name + "workflow_inst where wi_id = " + wi_id + ")";
//        	ResultSet rs_wsd = dc.ExecuteQuery(sql);
        	sql = "select wsd_id from " + WfMng.db_name + "wf_setup_data where wt_id = (select wt_id from " + WfMng.db_name + "workflow_inst where wi_id = ?)";
        	List<Map<String, Object>> rs_wsd = dc.executeQuery(sql, wi_id);
        	if (rs_wsd == null) {
        		SetErrorMsg(dc);
        		return false;
        	}
        	if (rs_wsd.isEmpty()) {
        		SetErrorMsg("wi_id[" + wi_id + "]不存在");
        		return false;
        	}
        	wsd_id = (String) rs_wsd.get(0).get("WSD_ID");
        	
//        	sql = "select win_id from workflow_inst_node where wi_id = " + wi_id + " and status = '已进入'";
//        	ResultSet rs_win = dc.ExecuteQuery(sql);
        	sql = "select win_id from workflow_inst_node where wi_id = ? and status = '已进入'";
        	List<Map<String, Object>> rs_win = dc.executeQuery(sql, wi_id);
        	if (rs_win == null) {
        		SetErrorMsg(dc);
        		return false;
        	}
        	if (!rs_win.isEmpty()) {
        		mResponseData.put("current_win_id", (String) rs_win.get(0).get("WIN_ID"));
//        		sql = "select attr_value from workflow_inst_attr where wi_id = " + wi_id + " and win_id = " + rs_win.getString("WIN_ID") + " and attr_name = 'state' and wip_id = 0";
//        		ResultSet rs_state = dc.ExecuteQuery(sql);
        		sql = "select attr_value from workflow_inst_attr where wi_id = ? and win_id = ? and attr_name = 'state' and wip_id = 0";
        		List<Map<String, Object>> rs_state = dc.executeQuery(sql, wi_id, (String) rs_win.get(0).get("WIN_ID"));
        		if (rs_state == null) {
        			SetErrorMsg(dc);
        			return false;
        		}
        		if (!rs_state.isEmpty()) {
        			mResponseData.put("current_state", new BigDecimal(Double.parseDouble((String) rs_state.get(0).get("ATTR_VALUE"))).toString());
        		}
        		
        	}
        }
        sql = "select wsd_id,name,description,active,wt_id,release_user,release_time,dft,remark,modify_by,last_update " 
        		+ ("Y".equals(with_data) ? ",data" : "")
        		+ " from " + WfMng.db_name + "wf_setup_data"
        		+ " where 1 = 1"
        		;
        if (!Utility.IsEmpty(wsd_id))
        	sql += " and (wsd_id = " + wsd_id + ")";
        
        if (!Utility.IsEmpty(tag)) {
        	sql += " and exists (select 1 from " + WfMng.db_name + "app_tag_relate atr "
        			+ "where ("
        			+ "(object_type = 'wf_setup_data' and object_id = wsd_id)"
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
        
        Map<String, List<Map<String, Object>>> m_wf_scheme = new HashMap<String, List<Map<String, Object>>>();
        if (Utility.IsEmpty(wsd_id)) {
        	m_wf_scheme = ((WorkflowSchemeDao)GetDao("workflowSchemeDao")).getByWorkflow(null);
        	mResponseData.put("Scheme", m_wf_scheme);
        }
        else
        	mResponseData.put("Scheme",wsd_id);

        List<Map<String, Object>> al = new ArrayList<Map<String, Object>>();
        mResponseData.put("list", al);
        
        for (Map<String, Object> list : rs_list) {
        	Map<String, Object> hm_list = Utility.formatResultMap(list);
        	String wtid = (String) list.get("WT_ID");
//        	String wsdid = rs_list.getString("WSD_ID");
        	hm_list.put("tag", GetTag(dc, "wf_setup_data", wtid));
        	al.add(hm_list);

        	String modify_by = Utility.GetStringField(hm_list, "modify_by");
        	if (!Utility.IsEmpty(modify_by))
        		hm_list.put("modify_by", GetUserName(modify_by));
        	if (m_wf_scheme.containsKey(wtid))
        		hm_list.put("Scheme", m_wf_scheme.get(wtid));
        	else
        		hm_list.put("Scheme", ((WorkflowSchemeDao)GetDao("workflowSchemeDao")).getByWorkflow(wtid));
        	
        	boolean bDataUpdate = false;
        	String data = Utility.GetStringField(hm_list, "data");
        	Map m_data = null;
        	try {
        		m_data = JsonUtil.getGson().fromJson(data, Map.class);
        	}
        	catch (Exception e) {
        		continue;
        	}
        	if (m_data == null)
        		continue;
        	
        	Map m_states = Utility.GetMapField(m_data, "states");
        	if (m_states == null)
        		continue;
        	for (Iterator it_states = m_states.keySet().iterator(); it_states.hasNext();) {
    			String state_name = (String)it_states.next();
    			Object o_states = m_states.get(state_name);
    			if (!Map.class.isAssignableFrom(o_states.getClass()))
    				continue;
    			Map m_state = (Map)o_states;
        		Map m_props = Utility.GetMapField(m_state, "props");
        		if (m_props == null)
        			continue;
        		//if (m_props.containsKey("id"))
        		//	log.WriteLine(m_props.get("id").getClass().getName());
        		if (!Utility.HasField(m_props, "id", Double.class))
        			continue;
        		int id = ((Double)m_props.get("id")).intValue();
        		//log.WriteLine(id + "");
        		ActivityStatusDO status;
        		try {
        			activityStatusDao = (ActivityStatusDao) WebApplicationContextUtils.getRequiredWebApplicationContext(request.getSession().getServletContext()).getBean("activityStatusDao");
        			status = activityStatusDao.internalGetById(id);
        		}
        		catch (Exception e) {
        			log.Write(e);
        			continue;
        		}
        		if (status != null) {
	        		m_props.put("name", status.getName());
	        		m_props.put("description", status.getDescription());
	        		m_props.put("category", status.getCategory());
        		}
        		
        		bDataUpdate = true;
        	}
        	if (bDataUpdate) {
        		hm_list.put("data", JsonUtil.getGson().toJson(m_data));
        		bDataUpdate = false;
        	}
        	
        }
        //log.WriteLine("total = " + total + " list = " + al.size());
        
        return true;
	}
}
