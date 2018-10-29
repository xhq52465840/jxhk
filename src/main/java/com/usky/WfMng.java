package com.usky;

import java.io.File;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.BeansException;

import com.google.gson.Gson;
import com.google.gson.internal.StringMap;
import com.usky.comm.DbClient;
import com.usky.comm.JsonUtil;
import com.usky.comm.Log;
import com.usky.comm.Utility;
import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.activity.attribute.ActivityStatusDO;
import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.email.EmailDO;
import com.usky.sms.email.EmailDao;
import com.usky.sms.email.EnumSendStatus;
import com.usky.sms.email.SmtpDO;
import com.usky.sms.email.SmtpDao;
import com.usky.sms.message.MessageDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.utils.SpringBeanUtils;
import com.usky.sms.uwffunc.IUwfFuncPlugin;
import com.usky.sms.uwffunc.UwfFuncPlugin;

//执行时机：TEMP_BEGIN_TRANS TEMP_COMMIT TEMP_ROLLBACK TEMP_CHECK_DATA INST_INIT INST_SAVE_DATA NODE_INIT

public class WfMng {
	private static final Config config = Config.getInstance();
	//public static final String db_name = "smsuwf.";
	public static final String db_name = "";
	public static final String ups_name = "ups.";
	protected WfService service;
	protected String wt_id = "";	//模板id
	protected String trace_id = "";	//app_trace id
	protected String user_id = "";
	protected String sv_name = "";
	protected Log log = null;
	public HashMap<String, Object> mResponseData = null;
	public HashMap<String, Object> mResponseHeader = null;
	protected DbClient dc = null;
	protected HashMap<String, Object> h_param;
	protected String wit_id = "";	//本次事务id
	protected String wi_id = "";	//实例id
	protected String wtn_id = "";
	protected String win_id = "";	//实例节点id
	protected String wip_id = "";
	protected String tid = "";
	protected HashMap<String, Object> h_data = null;
	protected String applyer = "";
	protected String operate = "";
	
	protected ArrayList<String> a_temp_log_ids = new ArrayList<String>();

	public enum LogLevel{
		Normal,Sys,Debug
	}
	
	public WfMng(String uid, String sv, String tid, String wiid, String traceid, HashMap<String, Object> param, WfService serv, DbClient dbclient, Log l) {
		service = serv;
		if (service == null)
			service = new WfService();
		user_id = uid;
		sv_name = sv;
		wt_id = tid;
		wi_id = wiid;
		trace_id = traceid;
		if (Utility.IsEmpty(trace_id))
			trace_id = sv;
		mResponseHeader = serv.mResponseHeader;
		if (mResponseHeader == null)
			mResponseHeader = new LinkedHashMap<String, Object>();
		mResponseData = serv.mResponseData;
		if (mResponseData == null)
			mResponseData = new LinkedHashMap<String, Object>();
		dc = dbclient;
		log = l;
		if (log == null)
			log = new Log("log/" + getClass().getName());			
		if (param == null)
			h_param = new HashMap<String, Object>();
		else
			h_param = param;
	}
	
	public boolean Submit(String title, String brief) throws Exception {
		if (!BeginTrans("0"))
			return false;
        String sql = "select active,first_node_name from " + db_name + "workflow_temp where wt_id = ?";
        List<Map<String, Object>> rs_temp = dc.executeQuery(sql, wt_id);
        if (rs_temp == null) {
            SetErrorMsg(dc);
            Rollback();
            return false;
        }
        if (!rs_temp.iterator().hasNext())
        {
            SetErrorMsg("工作流模板[" + wt_id + "]不存在");
            Rollback();
            return false;
        }
        if (!"Y".equals(rs_temp.get(0).get("ACTIVE").toString()))
        {
            SetErrorMsg("工作流模板[" + wt_id + "]未激活");
            Rollback();
            return false;
        }
        
        applyer = user_id;
        if (!CreateInstance(title, brief)) {
        	Rollback();
        	return false;
        }
        else
        	mResponseData.put("wi_id", wi_id);
        
        String first_node_name = (String) rs_temp.get(0).get("FIRST_NODE_NAME");
        
        sql = "select name from " + db_name + "workflow_temp_node where wt_id = ? order by wtn_id";
        List<Map<String, Object>> rs_node = dc.executeQuery(sql, wt_id);
        if (rs_node == null) {
        	SetErrorMsg(dc);
        	Rollback();
        	return false;
        }
        
        win_id = "";
        for (Map<String, Object> entry : rs_node){
        	String nid = CreateNodeByName((String)entry.get("NAME"), "", "从模板复制生成");
        	if (Utility.IsEmpty(nid)) {
        		Rollback();
        		return false;
        	}
        	if (first_node_name.equals((String)entry.get("NAME")))
        		win_id = nid;
        	
        }
        if (Utility.IsEmpty(win_id)) {
        	SetErrorMsg("设置错误：第一个节点[" + first_node_name + "]没有创建");
        	Rollback();
        	return false;
        }

        if (!SaveInstData(h_param)) {
        	Rollback();
        	return false;
        }
        
        if (!CallFuncList("INST_INIT")) {
        	Rollback();
        	return false;
        }
        
        if (!WriteWfLog("工作流" + (Utility.IsEmpty(title) ? "" : "[" + title + "]") + "开始")) {
        	Rollback();
        	return false;
        }
        
        sql = "update " + db_name + "workflow_inst set status = '正在审批',last_update = " + dc.GetSysdate() + " where wi_id = " + wi_id;
        int ect = dc.Execute(sql);
        if (ect < 0)
        {
            SetErrorMsg(dc);
            Rollback();
            return false;
        }
        if (ect == 0)
        {
            SetErrorMsg("内部错误：流程实例[" + wi_id + "]已不存在");
            Rollback();
            return false;
        }
        
        if (!EnterNode(win_id)) {
        	Rollback();
        	return false;
        }
        
        if (!Utility.HasField(mResponseHeader, "status"))
        	mResponseHeader.put("status", 0);
        
		return Commit();
	}

	public boolean Operate(String wipid, String remark) throws Exception {
		wip_id = wipid;
		
//		String sql = "select wiu_id,finished from workflow_inst_user where wip_id = " + wip_id + " and to_number(user_id) = " + user_id;
//		ResultSet rs_user = dc.ExecuteQuery(sql);
		String sql = "select wiu_id,finished from workflow_inst_user where wip_id = ? and to_number(user_id) = ?";
		List<Map<String, Object>> rs_user = dc.executeQuery(sql, wip_id, user_id);
		if (rs_user == null) {
			SetErrorMsg(dc);
			return false;
		}
		if (rs_user.isEmpty()) {
			SetErrorMsg(wip_id + "不能操作");
			return false;
		}
		if (!"N".equals((String) rs_user.get(0).get("FINISHED"))) {
			SetErrorMsg("路径" + wip_id + "已操作");
			return false;
		}
		tid = (String) rs_user.get(0).get("WIU_ID");
		
//		sql = "select win_id,andor from workflow_inst_path where wip_id = " + wip_id;
//		ResultSet rs_path = dc.ExecuteQuery(sql);
		sql = "select win_id,andor from workflow_inst_path where wip_id = ?";
		List<Map<String, Object>> rs_path = dc.executeQuery(sql, wip_id);
		if (rs_path == null) {
			SetErrorMsg(dc);
			return false;
		}
		if (rs_path.isEmpty()) {
			SetErrorMsg("路径[" + wip_id + "]不存在");
			return false;
		}
		String win_id = (String) rs_path.get(0).get("WIN_ID");
		String andor = (String) rs_path.get(0).get("ANDOR");
		
//		sql = "select wi_id,name from workflow_inst_node where win_id = " + win_id;
//		ResultSet rs_node = dc.ExecuteQuery(sql);
		sql = "select wi_id,name from workflow_inst_node where win_id = ?";
		List<Map<String, Object>> rs_node = dc.executeQuery(sql, win_id);
		if (rs_node == null) {
			SetErrorMsg(dc);
			return false;
		}
		if (rs_node.isEmpty()) {
			SetErrorMsg("节点" + win_id + "不存在");
			return false;
		}
		wi_id = (String) rs_node.get(0).get("WI_ID");
		String node_name = (String) rs_node.get(0).get("NAME");
		
//		sql = "select status from workflow_inst where wi_id = " + wi_id;
//		ResultSet rs_inst = dc.ExecuteQuery(sql);
		sql = "select status from workflow_inst where wi_id = ?";
		List<Map<String, Object>> rs_inst = dc.executeQuery(sql, wi_id);
		if (rs_inst == null) {
			SetErrorMsg(dc.ErrorMessage);
			return false;
		}
		if (rs_inst.isEmpty()) {
			SetErrorMsg("实例" + wi_id + "不存在");
			return false;
		}
		String inst_status = (String) rs_inst.get(0).get("STATUS");
		
		if (!"正在审批".equals(inst_status)) {
			SetErrorMsg("任务关联的工作流实例[" + wi_id + "]" + inst_status);
			return false;
		}
		
		if (!BeginTrans(wi_id))
			return false;
		
		if (!FinishTask("执行操作完成")) {
			Rollback();
			return false;
		}
		
		if (!WriteWfLog("执行了操作")) {
			Rollback();
			return false;
		}
		if (!Utility.IsEmpty(remark)) {
			if (!WriteWfLog(remark)) {
				Rollback();
				return false;
			}
		}
		
        sql = "update " + db_name + "workflow_inst set last_user = '" + dc.FormatString(user_id) + "',last_update = " + dc.GetSysdate() + " where wi_id = " + wi_id;
        int ect = dc.Execute(sql);
        if (ect < 0) {
            SetErrorMsg(dc);
            Rollback();
            return false;
        }
        if (ect == 0) {
            SetErrorMsg("内部错误：工作流[" + wi_id + "]已不存在");
            Rollback();
            return false;
        }

        if (!WriteWfLog("在任务节点[" + node_name + "]执行了操作", LogLevel.Sys)) {
        	Rollback();
        	return false;
        }
		
        if ("OR".equals(andor)) {
        	sql = "update " + db_name + "workflow_inst_user set finished = 'Y',remark = '用户[" + user_id + "]执行了操作，自动结束操作',last_update = " + dc.GetSysdate() + " where wip_id = " + wip_id + " and wiu_id <> " + tid;
        	if (dc.Execute(sql) < 0) {
        		SetErrorMsg(dc);
        		Rollback();
        		return false;
        	}
        }
        else {
//        	sql = "select 1 from " + db_name + "workflow_inst_user where wip_id = " + wip_id + " and finished = 'N'";
//        	ResultSet rs_other = dc.ExecuteQuery(sql);
        	sql = "select 1 from " + db_name + "workflow_inst_user where wip_id = ? and finished = 'N'";
        	List<Map<String, Object>> rs_other = dc.executeQuery(sql, wip_id);
        	if (rs_other == null) {
        		SetErrorMsg(dc);
        		Rollback();
        		return false;
        	}
        	if (!rs_other.isEmpty())
        		return Commit();
        }
		if (!ExitNode(win_id, wip_id)) {
			Rollback();
			return false;
		}
		
		return Commit();
	}

	public boolean Operate(String t_id, String op, String remark) throws Exception {
		tid = t_id;
		operate = op;
//		String sql = "select wi.wi_id,wi.wt_id,win.win_id,wip.wip_id,user_id,wiu.ops,wiu.status,finished,andorwin.name node_name,wi.status inst_status "
//				+ "from " + db_name + "workflow_inst wi," + db_name + "workflow_inst_node win," + db_name + "workflow_inst_path wip," + db_name + "workflow_inst_user wiu "
//				+ "where wiu.wip_id = wip.wip_id "
//				+ "and wip.win_id = win.win_id "
//				+ "and win.wi_id = wi.wi_id "
//				+ "and wiu_id = " + tid
//				;
//		ResultSet rs_tid = dc.ExecuteQuery(sql);
		String sql = "select wi.wi_id,wi.wt_id,win.win_id,wip.wip_id,user_id,wiu.ops,wiu.status,finished,andorwin.name node_name,wi.status inst_status "
				+ "from " + db_name + "workflow_inst wi," + db_name + "workflow_inst_node win," + db_name + "workflow_inst_path wip," + db_name + "workflow_inst_user wiu "
				+ "where wiu.wip_id = wip.wip_id "
				+ "and wip.win_id = win.win_id "
				+ "and win.wi_id = wi.wi_id "
				+ "and wiu_id = ?"
				;
		List<Map<String, Object>> rs_tid = dc.executeQuery(sql, tid);
		if (rs_tid == null) {
			SetErrorMsg(dc);
			return false;
		}
		if (rs_tid.isEmpty()) {
			SetErrorMsg("任务[" + tid + "]不存在");
			return false;
		}
		
		wi_id = (String) rs_tid.get(0).get("WI_ID");
		wt_id = (String) rs_tid.get(0).get("WT_ID");
		win_id = (String) rs_tid.get(0).get("WIN_ID");
		wip_id = (String) rs_tid.get(0).get("WIP_ID");
		
		String uid = (String) rs_tid.get(0).get("USER_ID");
		String ops = (String) rs_tid.get(0).get("OPS");
		String status = (String) rs_tid.get(0).get("STATUS");
		String finished = (String) rs_tid.get(0).get("FINISHED");
		String andor = (String) rs_tid.get(0).get("ANDOR");
		String node_name = (String) rs_tid.get(0).get("NODE_NAME");
		String inst_status = (String) rs_tid.get(0).get("INST_STATUS");
		
		if (!uid.equals(user_id)) {
			SetErrorMsg("任务[" + tid + "]应由[" + uid + "]执行，而不是[" + user_id + "]");
			return false;
		}
		if (("," + ops + ",").indexOf("," + operate + ",") < 0) {
			SetErrorMsg("任务[" + tid + "]只能执行[" + ops + "]操作，不能执行[" + operate + "]操作");
			return false;
		}
		if (!"等待操作".equals(status)) {
			SetErrorMsg("任务[" + tid + "]的状态是[" + status + "]，而不是等待操作");
			return false;
		}
		if (!"N".equals(finished)) {
			SetErrorMsg("任务[" + tid + "]已结束");
			return false;
		}
		if (!"正在审批".equals(inst_status)) {
			SetErrorMsg("任务[" + tid + "]关联的工作流实例[" + wi_id + "]" + status + "，不能执行[" + operate + "]操作");
			return false;
		}
		
		if (!BeginTrans(wi_id))
			return false;
		
		if (!FinishTask("执行操作[" + operate + "]完成")) {
			Rollback();
			return false;
		}
		
		if (!WriteWfLog("执行了[" + operate + "]操作")) {
			Rollback();
			return false;
		}
		if (!Utility.IsEmpty(remark)) {
			if (!WriteWfLog(remark)) {
				Rollback();
				return false;
			}
		}
		
        sql = "update " + db_name + "workflow_inst set last_user = '" + dc.FormatString(user_id) + "',last_update = " + dc.GetSysdate() + " where wi_id = " + wi_id;
        int ect = dc.Execute(sql);
        if (ect < 0) {
            SetErrorMsg(dc);
            Rollback();
            return false;
        }
        if (ect == 0) {
            SetErrorMsg("内部错误：工作流[" + wi_id + "]已不存在");
            Rollback();
            return false;
        }

        if (!WriteWfLog("在任务节点[" + node_name + "]执行了[" + operate + "]操作", LogLevel.Sys)) {
        	Rollback();
        	return false;
        }
		
        if ("OR".equals(andor)) {
        	sql = "update " + db_name + "workflow_inst_user set finished = 'Y',remark = '用户[" + user_id + "]执行了操作" + operate + "，自动结束操作',last_update = " + dc.GetSysdate() + " where wip_id = " + wip_id + " and wiu_id <> " + tid;
        	if (dc.Execute(sql) < 0) {
        		SetErrorMsg(dc);
        		Rollback();
        		return false;
        	}
        }
        else {
//        	sql = "select 1 from " + db_name + "workflow_inst_user where wip_id = " + wip_id + " and finished = 'N'";
//        	ResultSet rs_other = dc.ExecuteQuery(sql);
        	sql = "select 1 from " + db_name + "workflow_inst_user where wip_id = ? and finished = 'N'";
        	List<Map<String, Object>> rs_other = dc.executeQuery(sql, wip_id);
        	if (rs_other == null) {
        		SetErrorMsg(dc);
        		Rollback();
        		return false;
        	}
        	if (!rs_other.isEmpty())
        		return Commit();
        }
		if (!ExitNode(win_id)) {
			Rollback();
			return false;
		}
		
		return Commit();
	}
	
	public boolean Suspend(String remark) throws Exception {
		if (Utility.IsEmpty(remark))
			remark = "工作流被挂起";
		else
			remark = "工作流被挂起，" + remark;

		if (!BeginTrans(wi_id))
			return false;
		
		if (!CallFuncList("INST_SUSPEND")) {
			Rollback();
			return false;
		}
		
        String sql = "update " + db_name + "workflow_inst set status = '已挂起',last_update = " + dc.GetSysdate() + " where wi_id = " + wi_id;
        int ect = dc.Execute(sql);
        if (ect < 0)
        {
            SetErrorMsg(dc);
            Rollback();
            return false;
        }
        if (ect == 0)
        {
            SetErrorMsg("工作流实例[" + wi_id + "]不存在");
            Rollback();
            return false;
        }
        if (!WriteWfLog(remark)) {
        	Rollback();
        	return false;
        }

        if (!Commit())
        	return false;

        return true;
	}
	
	public boolean Resume() throws Exception {
		if (!BeginTrans(wi_id))
			return false;
		
		if (!CallFuncList("INST_RESUME")) {
			Rollback();
			return false;
		}
		
        String sql = "update " + db_name + "workflow_inst set status = '正在审批',last_update = " + dc.GetSysdate() + " where wi_id = " + wi_id;
        int ect = dc.Execute(sql);
        if (ect < 0)
        {
            SetErrorMsg(dc);
            Rollback();
            return false;
        }
        if (ect == 0)
        {
            SetErrorMsg("工作流实例[" + wi_id + "]不存在");
            Rollback();
            return false;
        }
        
        String remark = "工作流解除挂起状态，恢复执行";
        if (!WriteWfLog(remark)) {
        	Rollback();
        	return false;
        }

        if (!Commit())
        	return false;

        return true;
	}
	
	public boolean GetData() throws Exception {
		if (!GetInstData())
			return false;
		mResponseData.put("data", h_data);
		return true;
	}
	
	public boolean SaveData(String wiid, String data) throws Exception {
		wi_id = wiid;
		if (!BeginTrans(wi_id))
			return false;
		if (!SaveInstData(data)) {
			Rollback();
			return false;
		}
		if (!Commit())
			return false;
		
		return true;
	}
	
    //创建工作流程实例
    public boolean CreateInstance(String title, String brief) throws Exception {
    	if (!CallTempFuncList("TEMP_CHECK_DATA"))
    		return false;
    	
        String sql = "insert into " + db_name + "workflow_inst(wi_id,wt_id,applyer,title,first_node_name,brief,last_user,start_time,last_update) select "
                + dc.GetSeqNextValue("id_seq") + ","
                + wt_id + ","
                + "'" + dc.FormatString(user_id) + "',"
                + (Utility.IsEmpty(title) ? "title," : "'" + dc.FormatString(title) + "',")
                + "first_node_name,"
                + "'" + dc.FormatString(brief) + "',"
                + "'" + dc.FormatString(user_id) + "',"
                + dc.GetSysdate() + ","   //start_time
                + dc.GetSysdate() + " from " + db_name + "workflow_temp "
                + "where wt_id = " + wt_id
                ;
        int ect = dc.Execute(sql);
        if (ect < 0)
        {
            SetErrorMsg(dc);
            return false;
        }
        if (ect == 0)
        {
            SetErrorMsg("模板" + wt_id + "不存在");
            return false;
        }
        wi_id = dc.GetSequence("id_seq");
        
        sql = "insert into " + db_name + "app_tag_relate(rid,tid,object_type,object_id,tag_value,last_update) select " + dc.GetSeqNextValue("id_seq") + ",tid,'workflow_inst'," + wi_id + ",tag_value," + dc.GetSysdate() + " from " + db_name + "app_tag_relate where object_type = 'workflow_temp' and object_id = " + wt_id;
        if (dc.Execute(sql) < 0) {
        	SetErrorMsg(dc);
        	return false;
        }
        
        sql = "insert into " + db_name + "workflow_inst_func(wif_id,wtf_id,wi_id,win_id,wip_id,execute_time,func,order_num,remark,last_update) select "
                + dc.GetSeqNextValue("id_seq") + ","
                + "wtf_id,"
                + wi_id + ","
                + "0,"
                + "0,"
                + "execute_time,"
                + "func,"
                + "order_num,"
                + "remark,"
                + dc.GetSysdate() + " from " + db_name + "workflow_temp_func "
                + "where wt_id = " + wt_id + " and wtn_id = 0 and wtp_id = 0"
                ;
        ect = dc.Execute(sql);
        if (ect < 0)
        {
            SetErrorMsg(dc);
            return false;
        }
        
        sql = "insert into " + db_name + "workflow_inst_argu(wia_id,wi_id,win_id,wta_id,wif_id,argu_name,argu_value,last_update) select "
                + dc.GetSeqNextValue("id_seq") + ","
                + wi_id + ","
                + "0," //win_id
                + "wta_id,"
                + "wif.wif_id,"
                + "argu_name,"
                + "argu_value,"
                + dc.GetSysdate() + " "
                + "from " + db_name + "workflow_temp_argu wta," + db_name + "workflow_inst_func wif "
                + "where wt_id = " + wt_id + " and wtn_id = 0 and wta.wtf_id = wif.wtf_id and wif.wi_id = " + wi_id + " and wif.win_id = 0 "
                ;
        if (dc.Execute(sql) < 0)
        {
            SetErrorMsg(dc);
            return false;
        }
        
        sql = "insert into " + db_name + "workflow_inst_attr(wia_id,wta_id,wi_id,attr_name,attr_value,last_update) select "
        		+ dc.GetSeqNextValue("id_seq") + ","
        		+ "wta_id,"
        		+ wi_id + ","
        		+ "attr_name,"
        		+ "attr_value,"
        		+ dc.GetSysdate() + " from " + db_name + "workflow_temp_attr where wt_id = " + wt_id + " and wtn_id = 0"
        		;
        ect = dc.Execute(sql);
        if (ect < 0) {
        	SetErrorMsg(dc);
        	return false;
        }
        
    	return true;
    }
    
    @SuppressWarnings({ "unused", "rawtypes", "unchecked" })
	protected boolean EnterNode(String nid) throws Exception {
    	if ("0".equals(nid)) 
    		return FinishInstance();
    	
//    	String sql = "select wi_id,wtn_id,name,type,status from " + db_name + "workflow_inst_node where win_id = " + nid;
//    	ResultSet rs_node = dc.ExecuteQuery(sql);
    	String sql = "select wi_id,wtn_id,name,type,status from " + db_name + "workflow_inst_node where win_id = ?";
    	List<Map<String, Object>> rs_nodes = dc.executeQuery(sql, nid);
    	if (rs_nodes == null) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	if (rs_nodes.isEmpty()) {
    		SetErrorMsg("工作流节点[" + nid + "]不存在");
    		return false;
    	}
    	wi_id = (String) rs_nodes.get(0).get("WI_ID");
    	win_id = nid;
    	wtn_id = (String) rs_nodes.get(0).get("WTN_ID");
    	String node_name = (String) rs_nodes.get(0).get("NAME");
    	String node_type = (String) rs_nodes.get(0).get("TYPE");
    	String status = (String) rs_nodes.get(0).get("STATUS");

    	if ("聚合".equals(node_type)) {
    		//检查是否所有路径都到达
//    		sql = "select 1 from " + db_name + "workflow_temp_path wtp where wtn_id in (select wtn_id from " + db_name + "workflow_temp_node where wt_id = (select wt_id from " + db_name + "workflow_temp_node where wtn_id = " + wtn_id + ")) and next_name = '" + dc.FormatString(node_name) + "' and not exists (select 1 from " + db_name + "workflow_inst_path wip where next_id = " + win_id + " and wtp.wtp_id = wip.wtp_id)";
//    		ResultSet rs_path = dc.ExecuteQuery(sql);
    		sql = "select 1 from " + db_name + "workflow_temp_path wtp where wtn_id in (select wtn_id from " + db_name + "workflow_temp_node where wt_id = (select wt_id from " + db_name + "workflow_temp_node where wtn_id = ?)) and next_name = ? and not exists (select 1 from " + db_name + "workflow_inst_path wip where next_id = ? and wtp.wtp_id = wip.wtp_id)";
    		List<Map<String, Object>> rs_paths = dc.executeQuery(sql, wtn_id, dc.FormatString(node_name), win_id);
    		if (rs_paths == null) {
    			SetErrorMsg(dc);
    			return false;
    		}
    		if (!rs_paths.isEmpty())
    			return true;
    	}
    	
    	ArrayList list_node;
    	if (Utility.HasField(mResponseHeader, "workflow_node_list", ArrayList.class))
    		list_node = (ArrayList)mResponseHeader.get("workflow_node_list");
    	else {
    		list_node = new ArrayList();
    		mResponseHeader.put("workflow_node_list", list_node);
    	}
    	if (list_node.size() >= 99) {
    		SetErrorMsg("设置错误：达到了进入节点的次数上限，可能路径设置死循环");
    		return false;
    	}
    	
    	HashMap<String, Object> h_node = null;
		for (Object o_node : list_node) {
			if (o_node.getClass().isAssignableFrom(HashMap.class))
				continue;
			h_node = (HashMap<String, Object>)o_node;
			if (Utility.HasField(h_node, "win_id", String.class) && h_node.get("win_id").toString().equals(nid))
				break;
			else
				h_node = null;
		}
    	
		if (h_node == null) {
	    	h_node = new LinkedHashMap();
	    	h_node.put("win_id", win_id);
	    	h_node.put("wtn_id", wtn_id);
	    	h_node.put("enter_time", Utility.NowStrMs());
	    	h_node.put("name", node_name);
	    	h_node.put("type", node_type);
	    	list_node.add(h_node);
		}
    	
    	if (!CallFuncList("NODE_ENTER"))
    		return false;
    	
    	sql = "update " + db_name + "workflow_inst_node set status = '已进入',start_time = " + dc.GetSysdate() + ",last_update = " + dc.GetSysdate() + " where win_id = " + win_id;
    	int ect = dc.Execute(sql);
    	if (ect < 0) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	if (ect == 0) {
    		SetErrorMsg("内部错误：工作流节点[" + win_id + "]已不存在");
    		return false;
    	}
    	if (!WriteWfLog("进入" + node_type + "节点[" + node_name + "]", LogLevel.Sys))
    		return false;
    	
    	{
//	    	sql = "select wip_id,name,userlist from " + db_name + "workflow_inst_path where win_id = " + win_id;
//	    	ResultSet rs_path = dc.ExecuteQuery(sql);
	    	sql = "select wip_id,name,userlist from " + db_name + "workflow_inst_path where win_id = ?";
	    	List<Map<String, Object>> rs_paths = dc.executeQuery(sql, win_id);
	    	if (rs_paths == null) {
	    		SetErrorMsg(dc);
	    		return false;
	    	}
	    	boolean bHasPath = false;
			for (Map<String, Object> rs_path : rs_paths) {
	    		wip_id = (String) rs_path.get("WIP_ID");
	    		String path_name = (String) rs_path.get("NAME");
	    		String userlist = (String) rs_path.get("USERLIST");
	    		
	    		if (!"人工".equals(node_type) && !"机器人".equals(node_type) && !"*".equals(userlist) && ("," + userlist + ",").indexOf("," + user_id + ".0,") < 0)
	    			continue;
	    		
	    		mResponseHeader.put("status", 0);
	    		if (!CallBoolFunc("PATH_TRIGGER")) {
	    			if (HasError())
	    				return false;
	    			else
	    				continue;
	    		}
	    		bHasPath = true;
	    		sql = "update " + db_name + "workflow_inst_path set status = '已进入',remark = '已进入',last_update = " + dc.GetSysdate() + " where wip_id = " + wip_id;
	    		ect = dc.Execute(sql);
	    		if (ect < 0) {
	    			SetErrorMsg(dc);
	    			return false;
	    		}
	    		if (ect == 0) {
	    			SetErrorMsg("内部错误：路径[" + wip_id + "]已不存在");
	    			return false;
	    		}
	    	}
	    	/*
	    	if (!bHasPath) {
	    		SetErrorMsg("节点[" + node_name + "]无法生成有效的路径");
	    		return false;
	    	}
	    	*/
    	}
   	
    	if (!"人工".equals(node_type) && !"机器人".equals(node_type)) 
    		return ExitNode(win_id);
    	
    	if ("人工".equals(node_type) || "机器人".equals(node_type)) {
//    		sql = "select wip_id,userlist,ops,andor from " + db_name + "workflow_inst_path where win_id = " + win_id + " and status = '已进入'";
//    		ResultSet rs_path = dc.ExecuteQuery(sql);
    		Map<String, Object> pathInfo = new HashMap<String, Object>();
    		if (!this.getNodeExitPathInfo(pathInfo, win_id, "已进入")) {
//    			SetErrorMsg(dc);
    			return false;
    		}
    		
    		for (Entry<String, Object> entry : pathInfo.entrySet()) {
    			wip_id = entry.getKey();
    			Map<String, Object> infoMap = (Map<String, Object>) entry.getValue();
    			String userlist = (String) infoMap.get("userlist");
    			String ops = (String) infoMap.get("ops");
    			String andor = (String) infoMap.get("andor");
    			Map<String, Object> attribute = (Map<String, Object>) infoMap.get("attribute");
				sql = "update " + db_name + "workflow_inst_path set userlist = '" + dc.FormatString(userlist) + "', andor = '" + andor + "',last_update = " + dc.GetSysdate() + " where wip_id = " + wip_id;
				ect = dc.Execute(sql);
				if (ect < 0) {
					SetErrorMsg(dc);
					return false;
				}
				if (ect == 0) {
					SetErrorMsg("内部错误：wip_id " + wip_id + "已不存在");
					return false;
				}
    			if (Utility.IsEmpty(userlist) || "*".equals(userlist)) {
    				SetErrorMsg("路径[" + wip_id + "]没有定义用户列表");
    				return false;
    			}
    			sql = "delete from " + db_name + "workflow_inst_user where wip_id = " + wip_id;
    			if (dc.Execute(sql) < 0) {
    				SetErrorMsg(dc);
    				return false;
    			}
    			for (String user_id : userlist.split(",")) {
    				sql = "insert into " + db_name + "workflow_inst_user(wiu_id,wip_id,user_id,ops,status,last_update) values("
    						+ dc.GetSeqNextValue("id_seq") + ","
    						+ wip_id + ","
    						+ "'" + dc.FormatString(user_id) + "',"
    						+ "'" + dc.FormatString(ops) + "',"
    						+ "'等待操作',"
    						+ dc.GetSysdate() + ")"
    						;
    				if (dc.Execute(sql) < 0) {
    					SetErrorMsg(dc);
    					return false;
    				}
    			}
    			
    			// 如果线上有配置sendNoticeMsgMode(MESSAGE,SHORT_MESSAGE,EMAIL)的属性则发送通知信息
    			if (StringUtils.isNotBlank((String) attribute.get("sendNoticeMsgMode"))) {
    				sendNoticeMsg(userlist, (String) attribute.get("sendNoticeMsgMode"));
    			}
    		}
    		// 回写处理人
			if (!pathInfo.isEmpty()) {
				WriteUser();
			}
    		return true;
    	}
    	
    	return true;
    }
    
    /**
     * 获取节点后面的线的信息
     * @param pathInfo
     * @param status 状态
     * @return
     * @throws Exception
     */
    public boolean getNodeExitPathInfo(Map<String, Object> pathInfo, String win_id, String status) throws Exception {

//		sql = "select wip_id,userlist,ops,andor from " + db_name + "workflow_inst_path where win_id = " + win_id + " and status = '已进入'";
//		ResultSet rs_path = dc.ExecuteQuery(sql);
		String sql = "select wip_id,ops,andor,name from " + db_name + "workflow_inst_path where win_id = ?";
		if (status != null) {
			sql = sql + " and status = '" + status + "'";
		}
		List<Map<String, Object>> rs_paths = dc.executeQuery(sql, win_id);
		if (rs_paths == null) {
			SetErrorMsg(dc);
			return false;
		}
		Map<String, Object> actionUsers = (Map<String, Object>) h_param.get("actionUsers");
		for (Map<String, Object> rs_path : rs_paths) {
			wip_id = (String) rs_path.get("WIP_ID");
			String userlist = "";	//防止重复进入时用户重复
			String pathName = (String) rs_path.get("NAME");
			String ops = (String) rs_path.get("OPS");
			String andor = (String) rs_path.get("ANDOR");

			// 线上所有属性
			sql = "select attr_name, attr_value from workflow_inst_attr where wip_id = ?";
			List<Map<String, Object>> attributes = dc.executeQuery(sql, wip_id);
			if (attributes == null) {
				SetErrorMsg(dc);
				return false;
			}
			Map<String, Object> attributeMap = new HashMap<String, Object>();
			for (Map<String, Object> map : attributes) {
				attributeMap.put((String) map.get("ATTR_NAME"), map.get("ATTR_VALUE"));
			}
			
			if (!Utility.IsEmpty(attributeMap, "andor")) {
				andor = (String) attributeMap.get("andor");
			}
			
			if ("true".equals(attributeMap.get("specifyUser")) && actionUsers != null && StringUtils.isNotBlank((String) actionUsers.get(wip_id))) {
				userlist = (String) actionUsers.get(wip_id);
			} else {
				ArrayList list_function = GetListFunction();
				int n_function = list_function.size();
				// 选人
				if (!CallFuncList("PATH_USERLIST")){
					return false;
				}
				if (list_function.size() > n_function) {
					for (int i = n_function; i < list_function.size(); i++) {
						Object o_function = list_function.get(i);
						if (HashMap.class.isAssignableFrom(o_function.getClass())) {
							HashMap h_func = (HashMap)o_function;
							if (Utility.HasField(h_func, "return_value", String.class)) {
								if ("*".equals(userlist))
									userlist = "";
								String return_value = h_func.get("return_value").toString();
								if (return_value.toUpperCase().startsWith("OR,")) {
									andor = "OR";
									return_value = return_value.substring(3);
								}
								else if (return_value.toUpperCase().startsWith("AND,")) {
									andor = "AND";
									return_value = return_value.substring(4);
								}
								if (Utility.IsEmpty(userlist))
									userlist = return_value;
								else if (!Utility.IsEmpty(return_value))
									userlist += "," + return_value;
							}
						}
					}
					if (Utility.IsEmpty(userlist)) {
						SetErrorMsg(pathName + "操作的选人功能没有返回任何人员");
						return false;
					}
				}
				if (Utility.IsEmpty(userlist) || "*".equals(userlist)) {
					SetErrorMsg("路径[" + wip_id + pathName + "]没有定义用户列表");
					return false;
				}
			}
			
			Map<String, Object> infoMap = new HashMap<String, Object>();
			infoMap.put("andor", andor);
			infoMap.put("ops", ops);
			infoMap.put("userlist", userlist);
			infoMap.put("pathName", pathName);
			infoMap.put("attribute", attributeMap);
			pathInfo.put(wip_id, infoMap);
		}
		return true;
    }
    
    //保存当前审批用户
  	@SuppressWarnings("unchecked")
	private void WriteUser() throws Exception {
  		
  		// 获取当前用户列表
//  		String sql = "select distinct trunc(user_id) user_id from workflow_inst_user where wip_id in (select wip_id from workflow_inst_path where win_id in (select win_id from workflow_inst_node where wi_id = " + wi_id + " and status = '已进入')) and finished = 'N'";
//		ResultSet rs_user = dc.ExecuteQuery(sql);
  		String sql = "select distinct trunc(user_id) user_id from workflow_inst_user where wip_id in (select wip_id from workflow_inst_path where win_id in (select win_id from workflow_inst_node where wi_id = ? and status = '已进入')) and finished = 'N'";
		List<Map<String, Object>> rs_users = dc.executeQuery(sql, wi_id);
		if (rs_users == null) 
			throw new Exception(dc.ErrorMessage);
		Set<String> userList = new HashSet<String>();
		for (Map<String, Object> rs_user : rs_users) {
			userList.add((String) rs_user.get("USER_ID"));
		}
		
  		if (userList.size() == 0) {
  			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有处理人，请联系管理员！");
  		}
  		int id = ((Double)h_param.get("id")).intValue();
  		String objectName = (String)h_param.get("dataobject");
  		BaseDao<? extends AbstractBaseDO> baseDao = null;
  		try {
			baseDao = (BaseDao<? extends AbstractBaseDO>) SpringBeanUtils.getBean(objectName + "Dao");
		} catch (BeansException e) {
			throw SMSException.NO_MATCHABLE_OBJECT;
		}
  		String[] userIds = (String[]) userList.toArray(new String[0]);
  		if (baseDao instanceof IUwfFuncPlugin) {
  			((IUwfFuncPlugin) baseDao).writeUser(id, userIds);
  		}
  		// 发送站内消息(信息为安全信息，并且配置文件中流程变更状态后是否发送通知为Y时)
//  		if ("activity".equals(objectName) && "Y".equals(config.getSendMessageIfWorkflowStatusChanged())) {
//  			postMessage(id, userIds);
//  		}
  	}
  	
  	@SuppressWarnings("unchecked")
	private void sendNoticeMsg(String userlist, String mode) {
  		int id = ((Double) h_param.get("id")).intValue();
  		String objectName = (String)h_param.get("dataobject");
  		BaseDao<? extends AbstractBaseDO> baseDao = null;
  		try {
			baseDao = (BaseDao<? extends AbstractBaseDO>) SpringBeanUtils.getBean(objectName + "Dao");
		} catch (BeansException e) {
			throw SMSException.NO_MATCHABLE_OBJECT;
		}
  		List<Integer> userIds = new ArrayList<Integer>();
  		for (String userId : userlist.split(",")) {
  			if (!Utility.IsEmpty(userId)) {
  				userIds.add(((Double)Double.parseDouble((userId))).intValue());
  			}
  		}
  		List<String> modes = new ArrayList<String>();
  		for (String m : StringUtils.split(mode, ",")) {
  			modes.add(m);
  		}
		if (baseDao instanceof IUwfFuncPlugin) {
			((IUwfFuncPlugin) baseDao).sendTodoMsg(id, userIds, modes);
		}
  	}
  	
  	/**
  	 * 消息推送
  	 * @param m_param
  	 * @return
  	 * @throws Exception
  	 */
  	private void postMessage(Integer activityId, String[] userIds) throws Exception {
  		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
  		ActivityDO activity = activityDao.internalGetById(activityId);
  		if (null != activity) {
  			// 处理人
  			UserDao userDao = (UserDao) SpringBeanUtils.getBean("userDao");
  			List<UserDO> users = userDao.internalGetByIds(userIds);
  			Date date = new Date();
  			String title = "SMS 安全信息分配";
  			StringBuffer content = new StringBuffer();
  			content.append("主题：");
  			content.append(activity.getSummary());
  			content.append(" 描述：");
  			content.append(activity.getDescription());
  			if (null != activity.getStatus()) {
  				ActivityStatusDao activityStatusDao = (ActivityStatusDao) SpringBeanUtils.getBean("activityStatusDao");
  				ActivityStatusDO status = activityStatusDao.internalGetById(activity.getStatus().getId());
  				content.append(" 当前状态：");
  				content.append(status.getName());
  			}
  			content.append(" 创建人：");
  			content.append(activity.getCreator().getDisplayName());
  			MessageDao messageDao = (MessageDao) SpringBeanUtils.getBean("messageDao");
  			SmtpDao smtpDao = (SmtpDao) SpringBeanUtils.getBean("smtpDao");
  			EmailDao emailDao = (EmailDao) SpringBeanUtils.getBean("emailDao");
  			
  			List<SmtpDO> list = smtpDao.getAllList();
  			if (list.size() == 0) {
  				Logger log = Logger.getLogger(UwfFuncPlugin.class);
  				log.warn("没有配置smtp,无法发送邮件！");
  			}
  			for (UserDO user : users) {
  				MessageDO message = new MessageDO();
  				// 发送人取当前用户
  				message.setSender(UserContext.getUser());
  				message.setReceiver(user);
  				message.setSendTime(date);
  				message.setTitle(title);
  				message.setContent(content.toString());
  				message.setChecked(false);
  				message.setLink(activityId.toString());
  				message.setSourceType("ACTIVITY");
  				messageDao.internalSave(message);
  				if (list.size() > 0) {
  					EmailDO email = new EmailDO();
  					// 发件人
  					email.setFrom(list.get(0).getAddress());
  					// 收件人
  					email.setTo(user.getEmail());
  					email.setSubject(title);
  					email.setContent(content.toString());
  					// 等待发送
  					email.setSendStatus(EnumSendStatus.WAITING.getCode());
  					emailDao.internalSave(email);
  				}
  			}
  			
  		}
  	}

	protected boolean ExitNode(String nid, String exit_path_id) throws Exception {
    	String win_id_bak = win_id;
    	ArrayList list_path = null;
    	HashMap<String, Object> h_node = null;
    	if (Utility.HasField(mResponseHeader, "workflow_node_list", ArrayList.class)) {
    		ArrayList list_node = (ArrayList)mResponseHeader.get("workflow_node_list");
    		for (Object o_node : list_node) {
    			if (o_node.getClass().isAssignableFrom(HashMap.class))
    				continue;
    			h_node = (HashMap<String, Object>)o_node;
    			if (Utility.HasField(h_node, "win_id", String.class) && h_node.get("win_id").toString().equals(nid)) {
    				list_path = new ArrayList();
    				h_node.put("path", list_path);
    				break;
    			}
    			else
    				h_node = null;
    		}
    	}

    	int ect;
    	
    	String sql = "update " + db_name + "workflow_inst_node set status = '已完成',end_time = " + dc.GetSysdate() + ",remark = '节点完成',last_update = " + dc.GetSysdate() + " where win_id = " + nid;
    	ect = dc.Execute(sql);
    	if (ect < 0) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	if (ect == 0) {
    		SetErrorMsg("内部错误：节点[" + nid + "]已不存在");
    		return false;
    	}
    	if (h_node != null)
    		h_node.put("end_time", Utility.NowStrMs());
    	
    	boolean bExit = false;
//    	sql = "select wip_id,userlist,ops,next_name,next_id,(select type from " + db_name + "workflow_inst_node where win_id = " + nid + ") node_type from " + db_name + "workflow_inst_path where wip_id = " + exit_path_id;
//    	ResultSet rs_path = dc.ExecuteQuery(sql);
    	sql = "select wip_id,userlist,ops,next_name,next_id,(select type from " + db_name + "workflow_inst_node where win_id = ?) node_type from " + db_name + "workflow_inst_path where wip_id = ?";
    	List<Map<String, Object>> rs_path = dc.executeQuery(sql, nid, exit_path_id);
    	if (rs_path == null) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	if (rs_path.isEmpty()) {
    		SetErrorMsg("路径[" + exit_path_id + "]不存在");
    		return false;
    	}
    	//while (rs_path.next()) {
    		wip_id = (String) rs_path.get(0).get("WIP_ID");
    		String userlist = (String) rs_path.get(0).get("USERLIST");
    		String ops = (String) rs_path.get(0).get("OPS");
    		String next_name = (String) rs_path.get(0).get("NEXT_NAME");
    		String next_id = (String) rs_path.get(0).get("NEXT_ID");
    		String node_type = (String) rs_path.get(0).get("NODE_TYPE");
    		
    		HashMap<String, Object> h_path = null;
    		if (list_path != null) {
    			h_path = new LinkedHashMap<String, Object>();
    			list_path.add(h_path);
    			
    			h_path.put("wip_id", wip_id);
    			h_path.put("userlist", userlist);
    			h_path.put("ops", ops);
    			h_path.put("next_name", next_name);
    			h_path.put("next_id", next_id);
    		}
    		
    		win_id = nid;
    		if (!CallBoolFunc("PATH_VALID")) {
    			win_id = win_id_bak;
    			if (HasError())
    				return false;
    			else
    				return false;
    		}
    		win_id = win_id_bak;
    		
    		if (Utility.IsEmpty(next_id)) {
	    		if (!"*".equals(userlist) && ("," + userlist + ",").indexOf("," + user_id + ",") < 0) {
	    			SetErrorMsg("用户[" + user_id + "]无权走路径[" + wip_id + "]");
	    			return false;
	    		}
	    		
	    		if (Utility.IsEmpty(next_name)) 
	    			next_id = "0";
	    		else {
//	    			sql = "select win_id,status from " + db_name + "workflow_inst_node where wi_id = " + wi_id + " and name = '" + dc.FormatString(next_name) + "' and (status = '已生成' or status = '已完成')";
//	    			ResultSet rs_next = dc.ExecuteQuery(sql);
	    			sql = "select win_id,status from " + db_name + "workflow_inst_node where wi_id = ? and name = ? and (status = '已生成' or status = '已完成')";
	    			List<Map<String, Object>> rs_next = dc.executeQuery(sql, wi_id, dc.FormatString(next_name));
	    			if (rs_next == null) {
	    				SetErrorMsg(dc);
	    				return false;
	    			}
	    			if (rs_next.isEmpty()) {
	    				SetErrorMsg("下一个节点[" + next_name + "]已不存在");
	    				return false;
	    			}
	    			next_id = (String) rs_next.get(0).get("WIN_ID");
	    		}
    		}
    		sql = "update " + db_name + "workflow_inst_path set next_id = " + next_id + ",remark = '进入节点" + dc.FormatString(next_name + "[" + next_id + "]") + "',last_update = " + dc.GetSysdate() + " where wip_id = " + wip_id;
    		ect = dc.Execute(sql);
    		if (ect < 0) {
    			SetErrorMsg(dc);
    			return false;
    		}
    		if (ect == 0) {
    			SetErrorMsg("内部错误：路径[" + wip_id + "]已不存在");
    			return false;
    		}
    		win_id = nid;
    		if (!CallFuncList("PATH_EXIT")) {
    			win_id = win_id_bak;
    			return false;
    		}
    		win_id = win_id_bak;
    		
    		if (!bExit) {
    			bExit = true;
    			win_id = nid;
    			if (!WriteWfLog("离开节点")) {
    				win_id = win_id_bak;
    				return false;
    			}
    			win_id = nid;
    			if (!CallFuncList("NODE_EXIT")) {
    				win_id = win_id_bak;
    				return false;
    			}
    			win_id = win_id_bak;
    		}

    		win_id = nid;
    		if (!WriteWfLog("选择路径[" + wip_id + "]离开，进入节点" + next_name + "[" + next_id + "]", LogLevel.Sys)) {
    			win_id = win_id_bak;
    			return false;
    		}
    		
    		if (h_path != null)
    			h_path.put("result", "选择路径[" + wip_id + "]离开，进入节点" + next_name + "[" + next_id + "]");
    		
    		win_id = nid;
			if (!EnterNode(next_id)) {
				win_id = win_id_bak;
				return false;
			}
			win_id = win_id_bak;
    	//}
    	if (!bExit) {
    		SetErrorMsg("节点[" + win_id + "]没有可走的路径");
    		return false;
    	}
    	
    	return true;
    }
    
    @SuppressWarnings({ "unchecked", "rawtypes", "unused" })
	protected boolean ExitNode(String nid) throws Exception {
    	String win_id_bak = win_id;
    	ArrayList list_path = null;
    	HashMap<String, Object> h_node = null;
    	if (Utility.HasField(mResponseHeader, "workflow_node_list", ArrayList.class)) {
    		ArrayList list_node = (ArrayList)mResponseHeader.get("workflow_node_list");
    		for (Object o_node : list_node) {
    			if (o_node.getClass().isAssignableFrom(HashMap.class))
    				continue;
    			h_node = (HashMap<String, Object>)o_node;
    			if (Utility.HasField(h_node, "win_id", String.class) && h_node.get("win_id").toString().equals(nid)) {
    				list_path = new ArrayList();
    				h_node.put("path", list_path);
    				break;
    			}
    			else
    				h_node = null;
    		}
    	}

    	int ect;
    	
    	String sql = "update " + db_name + "workflow_inst_node set status = '已完成',end_time = " + dc.GetSysdate() + ",remark = '节点完成',last_update = " + dc.GetSysdate() + " where win_id = " + nid;
    	ect = dc.Execute(sql);
    	if (ect < 0) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	if (ect == 0) {
    		SetErrorMsg("内部错误：节点[" + nid + "]已不存在");
    		return false;
    	}
    	if (h_node != null)
    		h_node.put("end_time", Utility.NowStrMs());
    	
    	boolean bExit = false;
//    	sql = "select wip_id,userlist,ops,next_name,next_id,(select type from " + db_name + "workflow_inst_node where win_id = " + nid + ") node_type from " + db_name + "workflow_inst_path where win_id = " + nid + " and status = '已进入'";
//    	ResultSet rs_path = dc.ExecuteQuery(sql);
    	sql = "select wip_id,userlist,ops,next_name,next_id,(select type from " + db_name + "workflow_inst_node where win_id = ?) node_type from " + db_name + "workflow_inst_path where win_id = ? and status = '已进入'";
    	List<Map<String, Object>> rs_paths = dc.executeQuery(sql, nid, nid);
    	if (rs_paths == null) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	for(Map<String, Object> rs_path : rs_paths) {
    		wip_id = (String) rs_path.get("WIP_ID");
    		String userlist = (String) rs_path.get("USERLIST");
    		String ops = (String) rs_path.get("OPS");
    		String next_name = (String) rs_path.get("NEXT_NAME");
    		String next_id = (String) rs_path.get("NEXT_ID");
    		String node_type = (String) rs_path.get("NODE_TYPE");
    		
    		HashMap<String, Object> h_path = null;
    		if (list_path != null) {
    			h_path = new LinkedHashMap<String, Object>();
    			list_path.add(h_path);
    			
    			h_path.put("wip_id", wip_id);
    			h_path.put("userlist", userlist);
    			h_path.put("ops", ops);
    			h_path.put("next_name", next_name);
    			h_path.put("next_id", next_id);
    		}
    		
    		win_id = nid;
    		if (!CallBoolFunc("PATH_VALID")) {
    			win_id = win_id_bak;
    			if (HasError())
    				return false;
    			else
    				continue;
    		}
    		win_id = win_id_bak;
    		
    		if (Utility.IsEmpty(next_id)) {
	    		if (!"*".equals(userlist) && ("," + userlist + ",").indexOf("," + user_id + ".0,") < 0)
	    			continue;
	    		
	    		if (Utility.IsEmpty(next_name)) 
	    			next_id = "0";
	    		else {
//	    			sql = "select win_id,status from " + db_name + "workflow_inst_node where wi_id = " + wi_id + " and name = '" + dc.FormatString(next_name) + "' and status = '已生成'";
//	    			ResultSet rs_next = dc.ExecuteQuery(sql);
	    			sql = "select win_id,status from " + db_name + "workflow_inst_node where wi_id = ? and name = ? and status = '已生成'";
	    			List<Map<String, Object>> rs_nexts = dc.executeQuery(sql, wi_id, dc.FormatString(next_name));
	    			if (rs_nexts == null) {
	    				SetErrorMsg(dc);
	    				return false;
	    			}
	    			if (rs_nexts.isEmpty()) {
	    				SetErrorMsg("下一个节点[" + next_name + "]已不存在");
	    				return false;
	    			}
	    			next_id = (String) rs_nexts.get(0).get("WIN_ID");
	    		}
    		}
    		sql = "update " + db_name + "workflow_inst_path set next_id = " + next_id + ",remark = '进入节点" + dc.FormatString(next_name + "[" + next_id + "]") + "',last_update = " + dc.GetSysdate() + " where wip_id = " + wip_id;
    		ect = dc.Execute(sql);
    		if (ect < 0) {
    			SetErrorMsg(dc);
    			return false;
    		}
    		if (ect == 0) {
    			SetErrorMsg("内部错误：路径[" + wip_id + "]已不存在");
    			return false;
    		}
    		win_id = nid;
    		if (!CallFuncList("PATH_EXIT")) {
    			win_id = win_id_bak;
    			return false;
    		}
    		win_id = win_id_bak;
    		
    		if (!bExit) {
    			bExit = true;
    			win_id = nid;
    			if (!WriteWfLog("离开节点")) {
    				win_id = win_id_bak;
    				return false;
    			}
    			win_id = nid;
    			if (!CallFuncList("NODE_EXIT")) {
    				win_id = win_id_bak;
    				return false;
    			}
    			win_id = win_id_bak;
    		}

    		win_id = nid;
    		if (!WriteWfLog("选择路径[" + wip_id + "]离开，进入节点" + next_name + "[" + next_id + "]", LogLevel.Sys)) {
    			win_id = win_id_bak;
    			return false;
    		}
    		
    		if (h_path != null)
    			h_path.put("result", "选择路径[" + wip_id + "]离开，进入节点" + next_name + "[" + next_id + "]");
    		
    		win_id = nid;
			if (!EnterNode(next_id)) {
				win_id = win_id_bak;
				return false;
			}
			win_id = win_id_bak;
    	}
    	if (!bExit) {
    		SetErrorMsg("节点[" + win_id + "]没有可走的路径");
    		return false;
    	}
    	
    	return true;
    }
    
    protected boolean FinishInstance() throws Exception {
    	if (!CallFuncList("INST_FINISH"))
    		return false;
    	
    	if (!WriteWfLog("工作流结束"))
    		return false;
    	
    	String sql = "update " + db_name + "workflow_inst set status = '已结束',remark = '结束',end_time = " + dc.GetSysdate() + ",last_update = " + dc.GetSysdate() + " where wi_id = " + wi_id;
    	int ect = dc.Execute(sql);
    	if (ect < 0) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	if (ect == 0) {
    		SetErrorMsg("内部错误：工作流实例[" + wi_id + "]已不存在");
    		return false;
    	}
    	
    	return true;
    }
    
    //创建工作流节点
    protected String CreateNodeByName(String node_name, String last_node, String remark) throws Exception {
        //根据node_name获取wtn_id
        String sql = "select wtn_id from " + db_name + "workflow_temp_node where wt_id = ? and name = ?";
        List<Map<String,Object>> rs_node = dc.executeQuery(sql, wt_id, dc.FormatString(node_name));
        if (rs_node == null)
        {
            SetErrorMsg(dc);
            return "";
        }
        if (!rs_node.iterator().hasNext())
        {
            SetErrorMsg("模板[" + wt_id + "]节点[" + node_name + "]不存在");
            return "";
        }
        String wtn_id = (String) rs_node.get(0).get("WTN_ID");

    	return CreateNode(wtn_id, last_node, remark);
    }
    
    public String CreateNode(String wtn_id, String last_node, String remark) throws Exception {
    	String sql = "select win_id from " + db_name + "workflow_inst_node where wi_id = " + wi_id + " and wtn_id = " + wtn_id + " and end_time is null";
    	String sqltemp = "select win_id from " + db_name + "workflow_inst_node where wi_id = ? and wtn_id = ? and end_time is null";
    	List<Map<String,Object>> rs_node = dc.executeQuery(sqltemp, wi_id, wtn_id);
    	if (rs_node == null) {
    		SetErrorMsg(dc);
    		return "";
    	}
    	if (rs_node.iterator().hasNext())
    		return (String) rs_node.iterator().next().get("WIN_ID");
    	
        sql = "insert into " + db_name + "workflow_inst_node(win_id,wi_id,wtn_id,name,type,category,last_node,start_time,remark,last_update) select "
                + dc.GetSeqNextValue("id_seq") + ","
                + wi_id + ","
                + "wtn_id,"
                + "name,"
                + "type,"
                + "category,"
                + (Utility.IsEmpty(last_node) ? "null," : last_node + ",")
                + "null,"   //start_time
                + "'" + dc.FormatString(remark) + "',"
                + dc.GetSysdate() + " from " + db_name + "workflow_temp_node "
                + "where wtn_id = " + wtn_id
                ;
        int ect = dc.Execute(sql);
        if (ect < 0)
        {
            SetErrorMsg(dc);
            return "";
        }
        if (ect == 0)
        {
            SetErrorMsg("模板没有定义节点[" + wtn_id + "]，有可能原模板已被修改");
            return "";
        }
        String nid = dc.GetSequence("id_seq");
        
        sql = "insert into " + db_name + "workflow_inst_func(wif_id,wtf_id,wi_id,win_id,wip_id,execute_time,func,order_num,remark,last_update) select "
                + dc.GetSeqNextValue("id_seq") + ","
                + "wtf_id,"
                + wi_id + ","
                + nid + ","
                + "0,"
                + "execute_time,"
                + "func,"
                + "order_num,"
                + "remark,"
                + dc.GetSysdate() + " from " + db_name + "workflow_temp_func "
                + "where wtn_id = " + wtn_id + " and wtp_id = 0"
                ;
        ect = dc.Execute(sql);
        if (ect < 0)
        {
            SetErrorMsg(dc);
            return "";
        }
        
        sql = "insert into " + db_name + "workflow_inst_argu(wia_id,wi_id,win_id,wta_id,wif_id,argu_name,argu_value,last_update) select "
                + dc.GetSeqNextValue("id_seq") + ","
                + wi_id + ","
                + nid + ","
                + "wta.wta_id,"
                + "wif.wif_id,"
                + "wta.argu_name,"
                + "wta.argu_value,"
                + dc.GetSysdate() + " "
                + "from " + db_name + "workflow_temp_argu wta," + db_name + "workflow_inst_func wif "
                + "where wtn_id = " + wtn_id + " "
                + "and wta.wtf_id = wif.wtf_id "
                + "and wif.win_id = " + nid
                ;
        ect = dc.Execute(sql);
        if (ect < 0)
        {
            SetErrorMsg(dc);
            return "";
        }
        //mResponseData.put("argu_sql", sql);
        
        sql = "insert into " + db_name + "app_tag_relate(rid,tid,object_type,object_id,tag_value,last_update) select " + dc.GetSeqNextValue("id_seq") + ",tid,'workflow_inst_node'," + nid + ",tag_value," + dc.GetSysdate() + " from " + db_name + "app_tag_relate where object_type = 'workflow_temp_node' and object_id = " + wtn_id;
        ect = dc.Execute(sql);
        if (ect < 0) {
        	SetErrorMsg(dc);
        	return "";
        }
        
        sql = "insert into " + db_name + "workflow_inst_attr(wia_id,wta_id,wi_id,win_id,wip_id,attr_name,attr_value,last_update) select "
        		+ dc.GetSeqNextValue("id_seq") + ","
        		+ "wta_id,"
        		+ wi_id + ","
        		+ nid + ","
        		+ "0,"
        		+ "attr_name,"
        		+ "attr_value,"
        		+ dc.GetSysdate() + " from " + db_name + "workflow_temp_attr where wt_id = " + wt_id + " and wtn_id = " + wtn_id + " and wtp_id = 0"
        		;
        ect = dc.Execute(sql);
        if (ect < 0) {
        	SetErrorMsg(dc);
        	return "";
        }
        
        sql = "insert into " + db_name + "workflow_inst_path(wip_id,wtp_id,name,win_id,userlist,ops,andor,next_name,last_update) select "
        		+ dc.GetSeqNextValue("id_seq") + ","
        		+ "wtp_id,"
        		+ "name,"
        		+ nid + ","
        		+ "userlist,"
        		+ "ops,"
        		+ "andor,"
        		+ "next_name,"
        		+ dc.GetSysdate() + " from " + db_name + "workflow_temp_path wtp where wtn_id = " + wtn_id
        		;
        ect = dc.Execute(sql);
        if (ect < 0) {
        	SetErrorMsg(dc);
        	return "";
        }

        sql = "insert into " + db_name + "workflow_inst_func(wif_id,wtf_id,wi_id,win_id,wip_id,execute_time,func,order_num,remark,last_update) select "
                + dc.GetSeqNextValue("id_seq") + ","
                + "wtf.wtf_id,"
                + wi_id + ","
                + nid + ","
                + "wip.wip_id,"
                + "wtf.execute_time,"
                + "wtf.func,"
                + "wtf.order_num,"
                + "wtf.remark,"
                + dc.GetSysdate() + " from " + db_name + "workflow_temp_func wtf, " + db_name + "workflow_inst_path wip "
                + "where wtf.wtp_id = wip.wtp_id and wip.win_id = " + nid + " and wtf.wtn_id = " + wtn_id + " and wtf.wtp_id <> 0"
                ;
        ect = dc.Execute(sql);
        if (ect < 0)
        {
            SetErrorMsg(dc);
            return "";
        }
        
        sql = "insert into " + db_name + "workflow_inst_argu(wia_id,wi_id,win_id,wta_id,wif_id,argu_name,argu_value,last_update) select "
                + dc.GetSeqNextValue("id_seq") + ","
                + wi_id + ","
                + nid + ","
                + "wta.wta_id,"
                + "wif.wif_id,"
                + "wta.argu_name,"
                + "wta.argu_value,"
                + dc.GetSysdate() + " "
                + "from " + db_name + "workflow_temp_argu wta," + db_name + "workflow_inst_func wif "
                + "where wtn_id = " + wtn_id + " "
                + "and wta.wtf_id = wif.wtf_id "
                + "and wif.win_id = " + nid + " "
                + "and wif.wip_id <> 0"
                ;
        ect = dc.Execute(sql);
        if (ect < 0)
        {
            SetErrorMsg(dc);
            return "";
        }
        
        sql = "insert into " + db_name + "workflow_inst_attr(wia_id,wta_id,wi_id,win_id,wip_id,attr_name,attr_value,last_update) select "
        		+ dc.GetSeqNextValue("id_seq") + ","
        		+ "wta_id,"
        		+ wi_id + ","
        		+ nid + ","
        		+ "wip_id,"
        		+ "attr_name,"
        		+ "attr_value,"
        		+ dc.GetSysdate() + " from " + db_name + "workflow_temp_attr wta," + db_name + "workflow_inst_path wip where wt_id = " + wt_id + " and wip.win_id = " + nid + " and wta.wtp_id = wip.wtp_id and wtn_id = " + wtn_id + " and wta.wtp_id <> 0"
        		;
        ect = dc.Execute(sql);
        if (ect < 0) {
        	SetErrorMsg(dc);
        	return "";
        }
        
        sql = "insert into " + db_name + "app_tag_relate(rid,tid,object_type,object_id,tag_value,last_update) select " + dc.GetSeqNextValue("id_seq") + ",tid,'workflow_inst_path',wip_id,tag_value," + dc.GetSysdate() + " from " + db_name + "app_tag_relate atr," + db_name + "workflow_inst_path wip where object_type = 'workflow_temp_path' and object_id = wip.wtp_id and win_id = " + nid;
        ect = dc.Execute(sql);
        if (ect < 0) {
        	SetErrorMsg(dc);
        	return "";
        }
        
        if (!CallFuncList("NODE_INIT"))
        	return "";

    	return nid;
    }
    
    protected boolean FinishTask(String remark) throws Exception {
        String sql = "update " + db_name + "workflow_inst_user set operate = '" + dc.FormatString(operate) + "',status = '已完成',finished = 'Y',remark = '" + remark + "' where wiu_id = " + tid;
        int ect = dc.Execute(sql);
        if (ect < 0)
        {
            SetErrorMsg(dc);
            return false;
        }
        if (ect == 0)
        {
            SetErrorMsg("任务[" + tid + "]不存在");
            return false;
        }
        return true;
    }
    
    protected String JSEval(String expr) throws Exception {
    	SetErrorMsg("", 0, false);
    	
    	if (h_data == null) {
    		if (!GetInstData())
    			return "";
    	}
    	if (!Utility.IsEmpty(applyer)) {
    		if (!GetInstApplyer())
    			return "";
    	}
    	
    	String sql;
    	HashMap<String, Object> h_attr = new LinkedHashMap<String, Object>();
    	HashMap<String, Object> h_node_attr = new LinkedHashMap<String, Object>();
    	
    	if (!Utility.IsEmpty(wi_id)) {
//    		sql = "select win_id,attr_name,attr_value from " + db_name + "workflow_inst_attr where wi_id = " + wi_id + " and (win_id = 0 or win_id = " + win_id + ") order by wia_id";
//    		ResultSet rs_attr = dc.ExecuteQuery(sql);
    		sql = "select win_id,attr_name,attr_value from " + db_name + "workflow_inst_attr where wi_id = ? and (win_id = 0 or win_id = ?) order by wia_id";
    		List<Map<String, Object>> rs_attrs = dc.executeQuery(sql, wi_id, win_id);
    		if (rs_attrs == null) {
    			SetErrorMsg(dc);
    			return "";
    		}
    		for (Map<String, Object> rs_attr : rs_attrs) {
    			String nid = (String) rs_attr.get("WIN_ID");
    			String attr_name = (String) rs_attr.get("ATTR_NAME");
    			String attr_value = (String) rs_attr.get("ATTR_VALUE");
    			
    			if ("0".equals(nid))
    				h_attr.put(attr_name, JsonUtil.getGson().fromJson(attr_value, Object.class));
    			else
    				h_node_attr.put(attr_name, JsonUtil.getGson().fromJson(attr_value, Object.class));
    		}
    	}

    	StringBuilder sb = new StringBuilder();
    	sb.append("function Eval(expr) { \n");
    	sb.append("var user_id = \"" + user_id + "\";\n");
    	sb.append("var applyer = \"" + applyer + "\";\n");
    	sb.append("var sv_name = \"" + sv_name + "\";\n");
    	sb.append("var data = " + JsonUtil.getGson().toJson(h_data) + ";\n");
    	sb.append("var attr = " + JsonUtil.getGson().toJson(h_attr) + ";\n");
    	sb.append("var node_attr = " + JsonUtil.getGson().toJson(h_node_attr) + ";\n");
    	sb.append("return eval(expr); }");
    	
    	String script = sb.toString();

        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine eng = manager.getEngineByName("js");
    	
        try {
        	eng.eval(script);
        	Invocable jsInvoke = (Invocable)eng;
        	Object result = jsInvoke.invokeFunction("Eval", new Object[] {expr});
        	if (result == null || result.getClass() != Boolean.class) {
        		SetErrorMsg("条件表达式返回的值不是boolean，而是" + (result == "null" ? "空" : result.getClass().getName()));
        		return "";
        	}
        	Boolean bResult = (Boolean)result;
        	
        	return (bResult? "Y" : "N");
        }
        catch (Exception e) {
    		String msg = Utility.GetExceptionMsg(e);
    		Throwable t = e.getCause();
    		if (t != null) {
    			msg += " 原因：" + t.getMessage();
    			log.Write((Exception) t);
    		}
    		else
    			log.Write(e);
    		SetErrorMsg(msg);
        	mResponseHeader.put("expr", expr);
        	mResponseHeader.put("script", sb);
        	return "";
        }
    }
    
    protected boolean GetInstApplyer() throws Exception {
//    	String sql = "select applyer from " + db_name + "workflow_inst where wi_id = " + wi_id;
//    	ResultSet rs_inst = dc.ExecuteQuery(sql);
    	String sql = "select applyer from " + db_name + "workflow_inst where wi_id = ?";
    	List<Map<String, Object>> rs_insts = dc.executeQuery(sql, wi_id);
    	if (rs_insts == null) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	if (rs_insts.isEmpty()) {
    		SetErrorMsg("内部错误：工作流实例[" + wi_id + "]不存在");
    		return false;
    	}
    	
    	applyer = (String) rs_insts.get(0).get("APPLYER");
    	return true;
    }

    protected boolean SaveInstData(HashMap<String, Object> h_data) throws Exception {
    	String data = "";
    	try {
			Gson gson = JsonUtil.getGson();
			//HashMap<String, Object> m = (HashMap<String, Object>)gson.fromJson(gson.toJson(mResponse), mResponse.getClass());
			data = gson.toJson(h_data);
    	}
    	catch(Exception e) {
    		this.SetErrorMsg("工作流数据转换失败：" + Utility.GetExceptionMsg(e), -10001, true);
    	}
    	return SaveInstData(data);
    }
    
    protected boolean SaveInstData(String data) throws Exception {
        String sql = "insert into " + db_name + "workflow_inst_data(wid_id,wi_id,data,last_update) values("
                + dc.GetSeqNextValue("id_seq") + ","
                + wi_id + ","
                + (dc.IsOracle() ? "empty_clob()" : "'" + dc.FormatString(data) + "'") + ","
                + dc.GetSysdate() + ")"
                ;
        if (dc.Execute(sql) < 0) {
        	SetErrorMsg(dc);
        	return false;
        }
        
        if (dc.IsOracle()) {
        	String id = dc.GetSequence("id_seq");
        	sql = "select data from " + db_name + "workflow_inst_data where wid_id = " + id;
        	ResultSet rs_data = dc.ExecuteQuery(sql);
        	if (rs_data == null) {
        		SetErrorMsg(dc);
        		return false;
        	}
        	if (!rs_data.next()) {
        		SetErrorMsg("插入工作流数据失败");
        		return false;
        	}
        	if (!dc.UpdateClob(rs_data, "data", data)) {
        		SetErrorMsg(dc);
        		return false;
        	}
        }
    	
    	return CallFuncList("INST_SAVE_DATA");
    }
    
    @SuppressWarnings("unchecked")
	public boolean GetInstData() throws Exception {
    	h_data = null;
    	if (!CallFuncList("INST_GET_DATA"))
    		return false;
    	
    	if (h_data == null) {
            String sql = "select * from (select data from " + db_name + "workflow_inst_data where wi_id = " + wi_id + " order by wid_id desc) a";
            if (dc.IsOracle())
                sql += " where rownum = 1";
            else if (dc.IsMySQL())
                sql += " limit 1";
            else
            {
                SetErrorMsg("数据库" + dc.GetType() + "不支持");
                return false;
            }
    		
            ResultSet rs_data = dc.ExecuteQuery(sql);
            if (rs_data == null) {
            	SetErrorMsg(dc);
            	return false;
            }
            if (!rs_data.next()) {
            	SetErrorMsg("工作流实例[" + wi_id + "]没有数据");
            	return false;
            }
            
            String data = rs_data.getString("DATA");
            try {
            	h_data = JsonUtil.getGson().fromJson(data, HashMap.class);
            }
            catch (Exception e) {
            	SetErrorMsg("工作流实例[" + wi_id + "]的数据不是HashMap类型");
            	return false;
            }
    	}
    	
    	return true;
    }
	
    public boolean CallTempFuncList(String execute_time) throws Exception {
//    	String sql = "select wtf_id,func from " + db_name + "workflow_temp_func where wt_id = " + wt_id + " and wtn_id = 0 and execute_time = '" + dc.FormatString(execute_time) + "' order by order_num";
//    	ResultSet rs_func = dc.ExecuteQuery(sql);
    	String sql = "select wtf_id,func from " + db_name + "workflow_temp_func where wt_id = ? and wtn_id = 0 and execute_time = ? order by order_num";
    	List<Map<String, Object>> rs_funcs = dc.executeQuery(sql, wt_id, dc.FormatString(execute_time));
    	if (rs_funcs == null) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	if (rs_funcs.isEmpty())
    		return true;
    	
    	for (Map<String, Object> rs_func : rs_funcs) {
            //获取参数
//            sql = "select argu_name,argu_value from " + db_name + "workflow_temp_argu where wtf_id = " + rs_func.getObject("WTF_ID");
//            ResultSet rs_argu = dc.ExecuteQuery(sql);
            sql = "select argu_name,argu_value from " + db_name + "workflow_temp_argu where wtf_id = ?";
            List<Map<String, Object>> rs_argus = dc.executeQuery(sql, (String) rs_func.get("WTF_ID"));
            if (rs_argus == null) {
            	SetErrorMsg(dc);
            	return false;
            }
            HashMap<String, Object> h_argu = new HashMap<String, Object>();
            h_argu.put("wf_func", (String) rs_func.get("FUNC"));
			h_argu.put("wf_wt_id", wt_id);
			h_argu.put("wf_trace_id", trace_id);
			h_argu.put("wf_user_id", user_id);
			h_argu.put("wf_sv_name", sv_name);
			h_argu.put("wf_wit_id", wit_id);
			h_argu.put("wf_wi_id", wi_id);
			h_argu.put("wf_wtn_id", wtn_id);
			h_argu.put("wf_win_id", win_id);
			h_argu.put("wf_operate", operate);
            
			if (!rs_argus.isEmpty()) {
	            for(Map<String, Object> rs_argu : rs_argus) {
	        		String argu_name = (String) rs_argu.get("ARGU_NAME");
	        		String argu_value = (String) rs_argu.get("ARGU_VALUE");
	        		
	        		h_argu.put(argu_name, argu_value);
	            }
			} else if (!CallFunc((String) rs_func.get("FUNC"), h_argu, execute_time)) {
            	if (Utility.HasField(mResponseHeader, "msg"))
            		log.WriteLine("调用[" + (String) rs_func.get("FUNC") + "]失败：" + mResponseHeader.get("msg").toString());
            	return false;
            }
    	}
    	
    	return true;
    }
    
    public boolean CallFuncList(String execute_time) throws Exception {
    	String wiid = wi_id;
    	String winid = win_id;
    	String wipid = wip_id;
    	
    	if (execute_time.startsWith("INST_")) {
    		winid = "0";
    		wipid = "0";
    	}
    	else if (execute_time.startsWith("NODE_"))
    		wipid = "0";
    	
//    	String sql = "select wif_id,func,execute_time from " + db_name + "workflow_inst_func where wi_id = ? and (win_id = 0 or win_id = ?) and (wip_id = 0 or wip_id = ?) and execute_time = ? order by order_num,wif_id";
    	String sql = "select wif_id,func,execute_time from " + db_name + "workflow_inst_func where wip_id = ? and execute_time = ? order by order_num,wif_id";
    	List<Map<String, Object>> rs_func = dc.executeQuery(sql, (Utility.IsEmpty(wipid) ? "0" : wipid), execute_time);
    	if (rs_func == null) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	
    	for (Map<String, Object> entry : rs_func){
    		if (!CallFunc(entry))
    			return false;
    		
    	}
    	return true;
    }
    
    @SuppressWarnings("rawtypes")
	public boolean CallBoolFunc(String execute_time) throws Exception {
    	String sql = "select wif_id,func,execute_time from " + db_name + "workflow_inst_func where wi_id = ? and (win_id = 0 or win_id = ?) and wip_id = 0 or wip_id = ? and execute_time = ? order by order_num,wif_id";
    	List<Map<String, Object>> rs_func = dc.executeQuery(sql, wi_id, (Utility.IsEmpty(win_id) ? "0" : win_id), (Utility.IsEmpty(wip_id) ? "0" : wip_id), execute_time);
    	if (rs_func == null) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	for (Map<String,Object> entry : rs_func){
			if (!CallFunc(entry))
				return false;
			ArrayList list_function = GetListFunction();
			if (list_function.size() == 0)
				continue;
			Object o = list_function.get(list_function.size() - 1);
			// TODO 不注释的时候会报错
//    		if (!o.getClass().isAssignableFrom(HashMap.class)) {
//    			log.WriteLine("内部错误：list_function的成员不是HashMap而是" + o.getClass().getName());
//    			SetErrorMsg("CallBoolFunc内部错误");
//    			return false;
//    		}
			HashMap hm = (HashMap)o;
			if (!Utility.HasField(hm, "return_value", Boolean.class)) {
				log.WriteLine("内部错误：功能没有返回boolean");
				return false;
			}
			if (!((Boolean)hm.get("return_value")))
				return false;
    	}
    	
    	return true;
    }
    
    protected boolean CallFunc(String wif_id) throws Exception {
    	String sql = "select wif_id,func,execute_time from " + db_name + "workflow_inst_func where wif_id = ?";
    	List<Map<String, Object>> rs_func = dc.executeQuery(sql, wif_id);
    	if (rs_func == null) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	if (rs_func.size() == 0) {
    		SetErrorMsg("内部错误：功能id[" + wif_id + "不存在");
    		return false;
    	}
    	
    	return CallFunc(rs_func.get(0));
    }
    
    protected boolean CallFunc(Map<String, Object> rs_func) throws Exception {
        //获取参数
        String sql = "select argu_name,argu_value from " + db_name + "workflow_inst_argu where wif_id = ?";
        List<Map<String, Object>> rs_argu = dc.executeQuery(sql, (String) rs_func.get("WIF_ID"));
        if (rs_argu == null) {
        	SetErrorMsg(dc);
        	return false;
        }
        
        HashMap<String, Object> h_argu = new LinkedHashMap<String, Object>();
        h_argu.put("func", (String) rs_func.get("FUNC"));
        h_argu.put("execute_time", (String) rs_func.get("EXECUTE_TIME"));
		h_argu.put("wt_id", wt_id);
		h_argu.put("trace_id", trace_id);
		h_argu.put("user_id", user_id);
		h_argu.put("sv_name", sv_name);
		h_argu.put("wit_id", wit_id);
		h_argu.put("wi_id", wi_id);
		h_argu.put("wtn_id", wtn_id);
		h_argu.put("win_id", win_id);
		h_argu.put("wip_id", wip_id);
		h_argu.put("wif_id", (String) rs_func.get("WIF_ID"));
		h_argu.put("tid", tid);
		h_argu.put("operate", operate);
		h_argu.put("dc", dc);
		h_argu.put("serv", service);
		h_argu.put("wfmng", this);
		if (Utility.IsEmpty(applyer)) {
			if (!GetInstApplyer())
				return false;
		}
		// BUG修改：工作流中第一节点的选人方式设置为报告人时出错
		h_argu.put("wf_applyer", applyer);

		HashMap<String, String> h_arguments = null;
        if (rs_argu != null) {
        	h_arguments = new LinkedHashMap<String, String>();
        	for (Map<String, Object> entry : rs_argu){
        		String argu_name = (String) entry.get("ARGU_NAME");
        		String argu_value = (String) entry.get("ARGU_VALUE");
        		h_arguments.put(argu_name, argu_value);
        	}
        }
        h_argu.put("arguments", h_arguments);
        
        if (!CallFunc((String) rs_func.get("FUNC"), h_argu, (String) rs_func.get("EXECUTE_TIME"))) {
        	if (Utility.HasField(mResponseHeader, "msg"))
        		log.WriteLine("调用[" + (String) rs_func.get("FUNC") + "]失败：" + mResponseHeader.get("msg").toString());
        	return false;
        }
    	
    	return true;
    }
    
    @SuppressWarnings({ "rawtypes", "unchecked" })
	protected boolean CallFunc(String name, HashMap<String, Object> h_wf_param, String execute_time) throws Exception {
    	if (Utility.IsEmpty(name))
    		return true;

        if (!WriteWfLog("调用功能[" + name + "]，执行时机[" + execute_time + "]", LogLevel.Debug))
        	return false;
    	
    	ArrayList list_function = GetListFunction();
    	if (list_function.size() >= 99) {
    		SetErrorMsg("调用的功能超过99个，可能死循环了");
    		return false;
    	}
    	
    	HashMap<String, Object> h_func = new LinkedHashMap();
    	h_func.put("start_time", Utility.NowStrMs());
    	h_func.put("name", name);
    	h_func.put("execute_time", execute_time);
    	list_function.add(h_func);
    	
    	String sql = "select jar_name,class_name,func_name,return_field from " + db_name + "workflow_func where name = ?";
    	List<Map<String, Object>> rs_func = dc.executeQuery(sql, dc.FormatString(name));
    	if (rs_func == null) {
    		SetErrorMsg(dc);
    		h_func.put("end_time", Utility.NowStrMs());
    		return false;
    	}
    	if (!rs_func.iterator().hasNext()) {
    		SetErrorMsg("功能[" + name + "]未定义");
    		h_func.put("end_time", Utility.NowStrMs());
    		return false;
    	}
    	
    	String jar_name = (String) rs_func.get(0).get("JAR_NAME");
    	String class_name = (String) rs_func.get(0).get("CLASS_NAME");
    	String func_name = (String) rs_func.get(0).get("FUNC_NAME");
    	String return_field = (String) rs_func.get(0).get("RETURN_FIELD");
    	
    	if (class_name.indexOf(".") < 0)
    		class_name = "com.usky.function." + class_name;
    	String cls_name = (Utility.IsEmpty(jar_name) ? "" : jar_name + ":") + class_name;
    	h_func.put("func_name", cls_name + "." + func_name);
    	if (!Utility.IsEmpty(return_field))
    		h_func.put("return_field", return_field);
    	
    	Class cls;
    	try {
	    	if (!Utility.IsEmpty(jar_name)) {
				File f = new File(jar_name);
				URL u = f.toURI().toURL();
				URLClassLoader cl = new URLClassLoader(new URL[]{u});
					cls = cl.loadClass(class_name);
	    	}
	    	else 
				cls = Class.forName(class_name);
    	}
		catch (ClassNotFoundException e) {
			SetErrorMsg("类[" + cls_name + "]不存在");
			h_func.put("end_time", Utility.NowStrMs());
			return false;
		}

    	Method m;
    	try {
    		//Object inst = cls.newInstance();
    		m = cls.getMethod(func_name, new Class[]{Map.class, Map.class, Map.class, Map.class, Log.class});
    	}
    	catch (NoSuchMethodException e) {
    		SetErrorMsg("类[" + cls_name + "]中没有功能[" + func_name + "]");
    		h_func.put("end_time", Utility.NowStrMs());
    		return false;
    	}
    	
        if (mResponseHeader.containsKey("bSaveData"))
        	mResponseHeader.remove("bSaveData");
        if (mResponseHeader.containsKey("DataField"))
        	mResponseHeader.remove("DataField");

    	try {
    		h_func.put("return_value", m.invoke(null, new Object[]{h_param, h_wf_param, mResponseHeader, mResponseData, log}));
    	}
    	catch (Exception e) {
    		e.printStackTrace();
    		if(e.getCause() != null && e.getCause().getClass() == SMSException.class){
    			throw (SMSException)e.getCause();
    		}
    		String msg = cls_name + "." + func_name + "执行异常：" + Utility.GetExceptionMsg(e);
    		Throwable t = e.getCause();
    		if (t != null) {
    			msg += " 原因：" + t.getMessage();
    			log.Write((Exception) t);
    		}
    		SetErrorMsg(msg);
    		h_func.put("end_time", Utility.NowStrMs());
    		return false;
    	}
    	
    	if (!mResponseHeader.containsKey("status") || mResponseHeader.get("status") == null) {
    		SetErrorMsg(cls_name + "." + func_name + "返回的结果中没有包含status字段");
    		h_func.put("end_time", Utility.NowStrMs());
    		return false;
    	}
    	if (mResponseHeader.get("status").getClass() != Integer.class) {
    		SetErrorMsg(cls_name + "." + func_name + "返回的status字段类型是" + mResponseHeader.get("status").getClass().getSimpleName() + "，应该是整数");
    		h_func.put("end_time", Utility.NowStrMs());
    		return false;
    	}
    	if (!"0".equals(mResponseHeader.get("status").toString())){
    		if (!mResponseHeader.containsKey("msg") || mResponseHeader.get("msg") == null) {
    			SetErrorMsg(class_name + "." + func_name + "返回的status为非0值时，必须同时返回msg字段数据");
    			h_func.put("end_time", Utility.NowStrMs());
    			return false;
    		}
    		if (mResponseHeader.get("msg").getClass() != String.class) {
    			SetErrorMsg(class_name + "." + func_name + "返回的status为非0值时，返回的msg字段数据类型必须是字符串，而不是" + mResponseHeader.get("msg").getClass().getName());
    			h_func.put("end_time", Utility.NowStrMs());
    			return false;
    		}
    	}
    	if (!CheckReturnField(class_name + "." + func_name, h_func, return_field)) {
    		h_func.put("end_time", Utility.NowStrMs());
    		return false;
    	}

        //返回的ResponseHeader中如果bSaveData为true则保存ResponseData为工作了数据
        if (!Utility.IsEmpty(wi_id) && Utility.HasField(mResponseHeader, "bSaveData", Boolean.class) && (Boolean)mResponseHeader.get("bSaveData")) {
        	if (!SaveInstData(mResponseData)) {
        		h_func.put("end_time", Utility.NowStrMs());
        		return false;
        	}
        	mResponseHeader.remove("bSaveData");
        }
        
        //返回的ResponseHeader中如果DataField不为空，则覆盖h_data
        if (Utility.HasField(mResponseHeader, "DataField", String.class)) {
        	String data_field = mResponseHeader.get("DataField").toString();
        	mResponseHeader.remove("DataField");
        	if (!Utility.HasField(mResponseData, data_field)) {
        		SetErrorMsg(class_name + "." + func_name + "返回的DataField为[" + data_field + "]，但是在ResponseData中没有这个字段");
        		h_func.put("end_time", Utility.NowStrMs());
        		return false;
        	}
        	if (mResponseData.get(data_field).getClass() != HashMap.class) {
        		SetErrorMsg(class_name + "." + func_name + "返回的DataField为[" + data_field + "]，但是在ResponseData中的[" + data_field + "]字段的类型不是HashMap，而是" + mResponseData.get(data_field).getClass().getName());
        		h_func.put("end_time", Utility.NowStrMs());
        		return false;
        	}
        	h_data = (HashMap<String, Object>)mResponseData.get(data_field);
        }
    	
    	h_func.put("end_time", Utility.NowStrMs());
    	return true;
    }
    
    @SuppressWarnings("rawtypes")
	protected ArrayList GetListFunction() {
    	ArrayList list_function;
    	if (Utility.HasField(mResponseHeader, "workflow_function_list", ArrayList.class))
    		list_function = (ArrayList)mResponseHeader.get("workflow_function_list");
    	else {
    		list_function = new ArrayList();
    		mResponseHeader.put("workflow_function_list", list_function);
    	}
    	return list_function;
    }
    
    //检查是否含有必须返回的字段，return_field为json数组，每个元素应包含Name和Desc字段
    @SuppressWarnings("rawtypes")
	protected boolean CheckReturnField(String func_name, HashMap<String, Object> h_func, String return_field) {
    	if (Utility.IsEmpty(return_field))
    		return true;
    	
    	Object[] oa_return_field;
    	try {
    		oa_return_field = JsonUtil.getGson().fromJson(return_field, Object[].class);
    	}
    	catch (Exception e) {
    		SetErrorMsg("功能[" + func_name + "]定义的返回字段数据[" + return_field + "]类型不是数组：" + Utility.GetExceptionMsg(e));
    		log.Write(e);
    		return false;
    	}
    	h_func.put("return_field", oa_return_field);
    	
    	for (Object o_return_field:oa_return_field) {
    		if (o_return_field == null || o_return_field.getClass() != StringMap.class)
    			continue;
    		StringMap h_return_field = (StringMap)o_return_field;
    		if (Utility.IsEmpty(h_return_field, "Name"))
    			continue;
    		if (Utility.HasField(h_return_field, "Required", Boolean.class) && !(Boolean)h_return_field.get("Required"))
    			continue;
    		
    		String field_name = h_return_field.get("Name").toString();
    		if (!Utility.HasField(mResponseData, field_name)){
    			if (Utility.HasField(h_return_field, "Desc"))
    				SetErrorMsg("功能[" + func_name + "]没有返回必须字段[" + h_return_field.get("Desc") + "(" + field_name + ")]");
    			else
    				SetErrorMsg("功能[" + func_name + "]没有返回必须字段[" + field_name + "]");
    			log.WriteLine(field_name);
    			return false;
    		}
    	}
    	
    	return true;
    }
    
    protected boolean WriteWfLog(String doStr) throws Exception {
    	return WriteWfLog(doStr, LogLevel.Normal);
    }
    
    public boolean WriteWfLog(String doStr, LogLevel level) throws Exception {
    	return WriteWfLog(doStr, GetLogLevel(level));
    }
    
    protected boolean WriteWfLog(String doStr, int level) throws Exception {
        String sql = "insert into " + db_name + "workflow_inst_log(wil_id,wi_id,win_id,user_id,lv,do,last_update) values("
                + dc.GetSeqNextValue("id_seq") + ","
                + (Utility.IsEmpty(wi_id) ? "0" : wi_id) + ","
                + (Utility.IsEmpty(win_id) ? "null," : win_id + ",")
                + "'" + dc.FormatString(user_id) + "',"
                + String.valueOf(level) + ","
                + "'" + dc.FormatString(doStr) + "',"
                + dc.GetSysdate() + ")"
                ;
        if (dc.Execute(sql) < 0)
        {
            SetErrorMsg(dc);
            return false;
        }
        if (Utility.IsEmpty(wi_id))
        	a_temp_log_ids.add(dc.GetSequence("id_seq"));
    	return true;
    }
    
    protected synchronized boolean BeginTrans(String wi_id) throws Exception {
    	return true;
    	/*
    	String sql;
    	
    	if (!Utility.IsEmpty(wi_id) && !"0".equals(wi_id)) {
    		sql = "select 1 from " + db_name + "workflow_inst_trans where wi_id = " + wi_id + " and end_time is null";
    		ResultSet rs_trans = dc.ExecuteQuery(sql);
    		if (rs_trans == null) {
    			SetErrorMsg(dc);
    			return false;
    		}
    		if (rs_trans.next()) {
    			SetErrorMsg("流程[" + wi_id + "]有其他事务正在处理或处理异常");
    			return false;
    		}
    	}
    	else
    		wi_id = "0";
    	dc.BeginTrans();
    	sql = "insert into " + db_name + "workflow_inst_trans(wit_id,wi_id,trace_id,user_id,sv_name,start_time,last_update) values("
    			+ dc.GetSeqNextValue("id_seq") + ","
    			+ wi_id + ","
    			+ "'" + trace_id + "',"
    			+ "'" + dc.FormatString(user_id) + "',"
    			+ "'" + dc.FormatString(sv_name) + "',"
    			+ dc.GetSysdate() + ","
    			+ dc.GetSysdate() + ")"
    			;
    	if (dc.Execute(sql) < 0) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	wit_id = dc.GetSequence("id_seq");
    	if (Utility.IsEmpty(wit_id)) 
    		return false;
    	dc.Commit();
    	dc.BeginTrans();
    	mResponseData.put("wit_id", wit_id);
    	
    	return true;
    	*/
    }
    
    protected boolean Commit() throws Exception {
    	return true;
    	/*
    	String remark = "Commit";
    	if (!CallTempFuncList("TEMP_COMMIT")) {
    		dc.Rollback();
    		remark += " failed";
    	}
    	String sql;
    	if (!Utility.IsEmpty(wi_id) && a_temp_log_ids.size() > 0) {
    		String ids = "";
    		for (String id : a_temp_log_ids) {
    			if (Utility.IsEmpty(id))
    				continue;
    			if (Utility.IsEmpty(ids))
    				ids = id;
    			else
    				ids += "," + id;
    		}
    		if (!Utility.IsEmpty(ids)) {
    			sql = "update " + db_name + "workflow_inst_log set wi_id = " + wi_id + " where wil_id in (" + ids + ")";
    			if (dc.Execute(sql) < 0) {
    				SetErrorMsg(dc);
    				dc.Rollback();
    				return false;
    			}
    		}
    	}
    	sql = "update " + db_name + "workflow_inst_trans set " + (Utility.IsEmpty(wi_id) ? "" : "wi_id = " + wi_id + ",") + "end_time = " + dc.GetSysdate() + ",remark = '" + remark + "',last_update = " + dc.GetSysdate() + " where wit_id = " + wit_id;
    	int ect = dc.Execute(sql);
    	if (ect < 0) {
    		SetErrorMsg(dc);
    		dc.Rollback();
    		return false;
    	}
    	if (ect == 0) {
    		log.WriteLine("事务[" + wit_id + "]不存在");
    	}
    	dc.Commit();
    	return true;
    	*/
    }
    
    protected boolean Rollback() throws Exception {
    	return true;
    	/*
    	dc.Rollback();
    	
    	String remark = "Rollback";
    	if (!CallTempFuncList("TEMP_ROLLBACK"))
    		remark += " failed";

    	dc.BeginTrans();
    	String sql = "update " + db_name + "workflow_inst_trans set " + (Utility.IsEmpty(wi_id) ? "" : "wi_id = " + wi_id + ",") + "end_time = " + dc.GetSysdate() + ",remark = '" + remark + "',last_update = " + dc.GetSysdate() + " where wit_id = " + wit_id;
    	int ect = dc.Execute(sql);
    	if (ect < 0) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	if (ect == 0) {
    		log.WriteLine("事务[" + wit_id + "]不存在");
    	}
    	dc.Commit();
    	
    	return true;
    	*/
    }
    
    protected int GetLogLevel(LogLevel l) {
    	switch (l) {
    	case Sys:
    		return 80;
    	case Debug:
    		return 90;
    	default:
    		return 10;
    	}
    }
    
    protected boolean HasError() {
    	return mResponseHeader != null && mResponseHeader.containsKey("status") && !"0".equals(mResponseHeader.get("status").toString());
    }
	
	protected void SetErrorMsg(DbClient dc) {
		SetErrorMsg(dc, false);
	}
	
	protected void SetErrorMsg(DbClient dc, boolean bLog) {
		SetErrorMsg(dc.ErrorMessage, -10002, bLog);
	}
	
	protected void SetErrorMsg(String msg) {
		SetErrorMsg(msg, -10001, false);
	}
	
	protected void SetErrorMsg(String msg, int status, boolean bLog) {
		mResponseHeader.put("status", status);
		mResponseHeader.put("msg", msg);
		
		if (bLog)
			log.WriteLine(msg);
	}
}
