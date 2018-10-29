package com.usky.service;

import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import oracle.sql.CLOB;

import org.apache.commons.lang.StringUtils;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.JsonUtil;
import com.usky.comm.Utility;

public class WfSetupRelease extends WfService {
	String sms_direct_func = "SMS无需工作流参数功能";
	
	@Override
	public String GetDescribe(){
		return "工作流设置数据发布";
	}

	@Override
    protected void DefineParams()
    {
		AddParams("user_id", "用户id", true);
		AddParams("wsd_id", "工作流设置数据id", true);
    }
	
	@SuppressWarnings({ "unused", "rawtypes" })
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
		String user_id = GetParam("user_id");
		String id = GetParam("wsd_id");
		
		int ect;
		String sql = "select wt_id,name,description,active,data from " + WfMng.db_name + "wf_setup_data where wsd_id = " + id;
		ResultSet rs_data = dc.ExecuteQuery(sql);
//		String sql = "select wt_id,name,description,active,data from " + WfMng.db_name + "wf_setup_data where wsd_id = ?";
//		List<Map<String, Object>> rs_data = dc.executeQuery(sql, id);
		if (rs_data == null) {
			SetErrorMsg(dc);
			return false;
		}
		if (!rs_data.next()) {
			SetErrorMsg("工作流配置数据" + id + "不存在");
			return false;
		}

//		String wt_id = (String) rs_data.get(0).get("WT_ID");
//		String name = (String) rs_data.get(0).get("NAME");
//		String desc = (String) rs_data.get(0).get("DESCRIPTION");
//		String active = (String) rs_data.get(0).get("ACTIVE");
		String wt_id = (String) rs_data.getString("WT_ID");
		String name = (String) rs_data.getString("NAME");
		String desc = (String) rs_data.getString("DESCRIPTION");
		String active = (String) rs_data.getString("ACTIVE");
		// TODO
		String data = rs_data.getString("DATA");
		if (rs_data.getObject("DATA").getClass() == CLOB.class) {
			java.sql.Clob c = rs_data.getClob("DATA");
			if (c == null)
				data = "";
			else
				data = c.getSubString(1, (int)c.length());
		}
		
		HashMap hm_data;
		try {
			hm_data = JsonUtil.getGson().fromJson(data, HashMap.class);
		}
		catch (Exception e) {
			SetErrorMsg("解析数据失败：" + Utility.GetExceptionMsg(e));
			return false;
		}
		String first_node_name = "";
		
		if (!Utility.IsEmpty(wt_id)) {
//			sql = "select 1 from " + WfMng.db_name + "workflow_temp where wt_id = " + wt_id;
//			ResultSet rs_wt = dc.ExecuteQuery(sql);
			sql = "select 1 from " + WfMng.db_name + "workflow_temp where wt_id = ?";
			List<Map<String, Object>> rs_wt = dc.executeQuery(sql, wt_id);
			if (rs_wt == null) {
				SetErrorMsg(dc);
				return false;
			}
			if (rs_wt.isEmpty()) 
				wt_id = "";
		}
		dc.BeginTrans();
		if (Utility.IsEmpty(wt_id)) {
			sql = "insert into " + WfMng.db_name + "workflow_temp(wt_id,name,first_node_name,active,last_update) values("
					+ dc.GetSeqNextValue("id_seq") + ","
					+ "'" + dc.FormatString(name) + "',"
					+ "'*',"
					+ "'" + active + "',"
					+ dc.GetSysdate() + ")"
					;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}
			wt_id = dc.GetSequence("id_seq");
			if (Utility.IsEmpty(wt_id)) {
				dc.Rollback();
				return false;
			}
		}
		else {
			sql = "delete from " + WfMng.db_name + "workflow_temp_path where wtn_id in (select wtn_id from  " + WfMng.db_name + "workflow_temp_node where wt_id = " + wt_id + ")";
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}
			
			sql = "delete from " + WfMng.db_name + "workflow_temp_func where wt_id = " + wt_id;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}

			sql = "delete from " + WfMng.db_name + "workflow_temp_argu where wt_id = " + wt_id;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}
			
			sql = "delete from " + WfMng.db_name + "workflow_temp_attr where wt_id = " + wt_id;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}

			sql = "delete from " + WfMng.db_name + "workflow_temp_node where wt_id = " + wt_id;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}
		}
		
//		sql = "select name from " + WfMng.db_name + "workflow_func where jar_name is null and class_name = 'com.usky.function.SmsFunction' and func_name = 'CallWithoutWfParam'";
//		ResultSet rs_sms_direct_func = dc.ExecuteQuery(sql);
		sql = "select name from " + WfMng.db_name + "workflow_func where jar_name is null and class_name = 'com.usky.function.SmsFunction' and func_name = 'CallWithoutWfParam'";
		List<Map<String, Object>> rs_sms_direct_func = dc.executeQuery(sql);
		if (rs_sms_direct_func == null) {
			SetErrorMsg(dc);
			dc.Rollback();
			return false;
		}
		if (!rs_sms_direct_func.isEmpty())
			sms_direct_func = (String) rs_sms_direct_func.get(0).get("NAME");
		else {
			sql = "insert into " + WfMng.db_name + "workflow_func(name,class_name,func_name,description,last_update) values("
					+ "'" + sms_direct_func + "',"
					+ "'com.usky.function.SmsFunction',"
					+ "'CallWithoutWfParam',"
					+ "'转调SMS功能，该功能无需工作流参数',"
					+ dc.GetSysdate() + ")"
					;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}
		}
		
		if (!Utility.HasField(hm_data, "states", Map.class)) {
			mResponseData.put("states", hm_data.get("states").getClass().getName());
			SetErrorMsg("没有定义任何节点");
			dc.Rollback();
			return false;
		}
		
		Map<String, String> hm_state_name = new HashMap<String, String>();
		Map<String, String> hm_state_id = new HashMap<String, String>();
		Map hm_states = (Map)hm_data.get("states");
		for (Iterator it_states = hm_states.keySet().iterator(); it_states.hasNext();) {
			boolean bEnd = false;
			String state_name = (String)it_states.next();
			Object o_states = hm_states.get(state_name);
			if (!Map.class.isAssignableFrom(o_states.getClass()))
				continue;
			Map hm_state = (Map)o_states;
			
			Map hm_state_text = (Map)Utility.GetField(hm_state, "text", Map.class);
			if (hm_state_text == null) {
				SetErrorMsg("节点[" + state_name + "]没有text字段");
				dc.Rollback();
				return false;
			}
			String node_name = (String)Utility.GetField(hm_state_text, "text", String.class);
			if (Utility.IsEmpty(node_name)) {
				SetErrorMsg("节点[" + state_name + "]没有text.text字段");
				dc.Rollback();
				return false;
			}
			if (hm_state_name.containsKey(node_name)) {
				SetErrorMsg("节点名[" + node_name + "]重复定义");
				dc.Rollback();
				return false;
			}
			
			Map hm_props = (Map)Utility.GetField(hm_state, "props", Map.class);
			if (hm_props == null) {
				SetErrorMsg("节点[" + state_name + "]没有props字段");
				dc.Rollback();
				return false;
			}
			String node_type = (String)Utility.GetField(hm_props, "type", String.class);
			if (Utility.IsEmpty(node_type)) {
				SetErrorMsg("节点[" + state_name + "]没有props.type字段");
				dc.Rollback();
				return false;
			}
			if ("start".equalsIgnoreCase(node_type)) {
				node_type = "自动";
				first_node_name = node_name;
			}
			else if ("end".equalsIgnoreCase(node_type)) {
				node_type = "自动";
				bEnd = true;
			}
			else if ("state".equalsIgnoreCase(node_type))
				node_type = "人工";
			else {
				SetErrorMsg("不认识的几点类型【" + node_type + "]");
				dc.Rollback();
				return false;
			}
			
			String activityStatus_id = Utility.GetStringField(hm_props, "id");
			String category = Utility.GetStringField(hm_props, "category");
			
			sql = "insert into " + WfMng.db_name + "workflow_temp_node(wtn_id,wt_id,name,type,category,remark,last_update) values("
					+ dc.GetSeqNextValue("id_seq") + ","
					+ wt_id + ","
					+ "'" + dc.FormatString(node_name) + "',"
					+ "'" + dc.FormatString(node_type) + "',"
					+ "'" + dc.FormatString(category) + "',"
					+ "'" + dc.FormatString(state_name) + "',"
					+ dc.GetSysdate() + ")"
					;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}
			String wtn_id = dc.GetSequence("id_seq");
			if (Utility.IsEmpty(wtn_id)) {
				dc.Rollback();
				return false;
			}
			
			if (!Utility.IsEmpty(activityStatus_id)) {
				if (!AddTag(dc, "activityStatus_id", activityStatus_id, "workflow_temp_node", wtn_id))
					return false;
			}
			
			if (bEnd) {
				String ao = Utility.GetStringField(hm_props, "andor");
				sql = "insert into " + WfMng.db_name + "workflow_temp_path(wtp_id,wtn_id,name,userlist,ops,andor,next_name,remark,last_update) values("
						+ dc.GetSeqNextValue("id_seq") + ","
						+ wtn_id + ","
						+ "'" + dc.FormatString(node_name) + "结束路径',"
						+ "'*',"	//userlist
						+ "'*',"	//ops
						+ "'" + dc.FormatString(StringUtils.isBlank(ao) ? "OR" : ao) + "',"
						+ "'',"
						+ "'TO 结束',"
						+ dc.GetSysdate() + ")"
						;
				if (dc.Execute(sql) < 0) {
					SetErrorMsg(dc);
					dc.Rollback();
					return false;
				}
			}
			
			if (!WriteAttr(dc, hm_state, "节点[" + node_name + "]", wt_id, wtn_id, "0")) {
				dc.Rollback();
				return false;
			}
			
			hm_state_id.put(state_name, wtn_id);
			hm_state_name.put(state_name, node_name);
		}
		if (Utility.IsEmpty(first_node_name)) {
			SetErrorMsg("没有找到开始节点");
			dc.Rollback();
			return false;
		}
		
		Map hm_paths = (Map)Utility.GetField(hm_data, "paths", Map.class);
		if (hm_paths == null) {
			SetErrorMsg("没有定义任何路径");
			dc.Rollback();
			return false;
		}
		for (Iterator it_paths = hm_paths.keySet().iterator(); it_paths.hasNext();) {
			String rect_name = it_paths.next().toString();
			Map hm_path = (Map)Utility.GetField(hm_paths, rect_name, Map.class);
			if (hm_path == null)
				continue;
			
			String from = (String)Utility.GetStringField(hm_path, "from");
			if (Utility.IsEmpty(from)) {
				SetErrorMsg("路径[" + rect_name + "]没有from字段");
				dc.Rollback();
				return false;
			}
			if (!hm_state_name.containsKey(from)) {
				SetErrorMsg("节点[" + from + "]不存在");
				dc.Rollback();
				return false;
			}
			String to = (String)Utility.GetStringField(hm_path, "to");
			if (Utility.IsEmpty(to)) {
				SetErrorMsg("路径[" + rect_name + "]没有to字段");
				dc.Rollback();
				return false;
			}
			if (!hm_state_name.containsKey(to)) {
				SetErrorMsg("节点[" + to + "]不存在");
				dc.Rollback();
				return false;
			}
			
			Map hm_path_text = (Map)Utility.GetField(hm_path, "text", Map.class);
			if (hm_path_text == null) {
				SetErrorMsg("路径【" + rect_name + "]没有text字段");
				dc.Rollback();
				return false;
			}
			String path_text = Utility.GetStringField(hm_path_text, "text");
			if (Utility.IsEmpty(path_text)) {
				SetErrorMsg("路径[" + rect_name + "]没有text.text字段");
				dc.Rollback();
				return false;
			}

			Map hm_props = Utility.GetMapField(hm_path, "props");
			if (hm_props == null) {
				SetErrorMsg("路径【" + rect_name + "]没有props字段");
				return false;
			}
			String path_name = Utility.GetStringField(hm_props, "name");
			if (Utility.IsEmpty(path_name)) {
				SetErrorMsg("路径[" + rect_name + "]没有props.name字段");
				dc.Rollback();
				return false;
			}
			
			String ao = Utility.GetStringField(hm_props, "andor");
			sql = "insert into " + WfMng.db_name + "workflow_temp_path(wtp_id,wtn_id,name,userlist,ops,andor,next_name,remark,last_update) values("
					+ dc.GetSeqNextValue("id_seq") + ","
					+ hm_state_id.get(from) + ","
					+ "'" + dc.FormatString(path_name) + "',"
					+ "'*',"	//userlist
					+ "'*',"	//ops
					+ "'" + dc.FormatString(StringUtils.isBlank(ao) ? "OR" : ao) + "',"
					+ "'" + dc.FormatString(hm_state_name.get(to)) + "',"
					+ "'" + dc.FormatString(hm_state_name.get(from) + " TO " + hm_state_name.get(to)) + "',"
					+ dc.GetSysdate() + ")"
					;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}
			String wtp_id = dc.GetSequence("id_seq");
			if (Utility.IsEmpty(wtp_id)) {
				dc.Rollback();
				return false;
			}
			
			String screen = Utility.GetStringField(hm_props, "screen");
			if (!Utility.IsEmpty(screen)) {
				sql = "insert into " + WfMng.db_name + "workflow_temp_attr(wta_id,wt_id,wtn_id,wtp_id,attr_name,attr_value,last_update) values("
						+ dc.GetSeqNextValue("id_seq") + ","
						+ wt_id + ","
						+ hm_state_id.get(from) + ","
						+ wtp_id + ","
						+ "'screen',"
						+ "'" + dc.FormatString(screen) + "',"
						+ dc.GetSysdate() + ")"
						;
				if (dc.Execute(sql) < 0) {
					SetErrorMsg(dc);
					return false;
				}
			}
			
			String andor = Utility.GetStringField(hm_props, "andor");
			if (!Utility.IsEmpty(andor)) {
				sql = "insert into " + WfMng.db_name + "workflow_temp_attr(wta_id,wt_id,wtn_id,wtp_id,attr_name,attr_value,last_update) values("
						+ dc.GetSeqNextValue("id_seq") + ","
						+ wt_id + ","
						+ hm_state_id.get(from) + ","
						+ wtp_id + ","
						+ "'andor',"
						+ "'" + dc.FormatString(andor) + "',"
						+ dc.GetSysdate() + ")"
						;
				if (dc.Execute(sql) < 0) {
					SetErrorMsg(dc);
					return false;
				}
			}
			
			if (!WriteAttr(dc, hm_path, "路径[" + rect_name + "]", wt_id, hm_state_id.get(from), wtp_id)) {
				dc.Rollback();
				return false;
			}

			if (!WriteSmsPathFunction(dc, hm_path, "路径[" + rect_name + "]的选人功能", "user", "PATH_USERLIST", wt_id, hm_state_id.get(from), wtp_id)) {
				dc.Rollback();
				return false;
			}
			
			if (!WriteSmsPathFunction(dc, hm_path, "路径[" + rect_name + "]的触发条件", "condition", "PATH_TRIGGER", wt_id, hm_state_id.get(from), wtp_id)) {
				dc.Rollback();
				return false;
			}
			
			if (!WriteSmsPathFunction(dc, hm_path, "路径[" + rect_name + "]的有效性检查", "validator", "PATH_VALID", wt_id, hm_state_id.get(from), wtp_id)) {
				dc.Rollback();
				return false;
			}

			if (!WriteSmsPathFunction(dc, hm_path, "路径[" + rect_name + "]的离开功能", "postFunction", "PATH_EXIT", wt_id, hm_state_id.get(from), wtp_id)) {
				dc.Rollback();
				return false;
			}
		}
		
		sql = "update " + WfMng.db_name + "workflow_temp set "
				+ "name = '" + dc.FormatString(name) + "',"
				+ "first_node_name = '" + dc.FormatString(first_node_name) + "',"
				+ "active = '" + active + "',"
				+ "last_update = " + dc.GetSysdate()
				+ " where wt_id = " + wt_id
				;
		ect = dc.Execute(sql);
		if (ect < 0) {
			SetErrorMsg(dc);
			dc.Rollback();
			return false;
		}
		if (ect == 0) {
			SetErrorMsg("工作流模板" + wt_id + "已不存在");
			dc.Rollback();
			return false;
		}
		
		sql = "update " + WfMng.db_name + "wf_setup_data set wt_id = " + wt_id + ",release_user = '" + dc.FormatString(user_id) + "',release_time = " + dc.GetSysdate() + ",release_data = data,last_update = " + dc.GetSysdate() + " where wsd_id = " + id;
		ect = dc.Execute(sql);
		if (ect < 0) {
			SetErrorMsg(dc);
			dc.Rollback();
			return false;
		}
		if (ect == 0) {
			SetErrorMsg("工作流配置数据" + id + "已不存在");
			dc.Rollback();
			return false;
		}
				
		dc.Commit();
		mResponseData.put("wt_id", wt_id);
		return true;
	}
	
	@SuppressWarnings("rawtypes")
	boolean WriteSmsPathFunction(DbClient dc, Map hm, String obj_name, String type_name, String execute_time, String wt_id, String wtn_id, String wtp_id) throws Exception {
		if ("postFunction".equals(type_name)) {
			if (!WriteSetActivityStatusFunc(dc,wt_id,wtn_id,wtp_id,execute_time))
				return false;
		}
		
		Map hm_props = Utility.GetMapField(hm, "props");
		if (hm_props == null) {
			SetErrorMsg(obj_name + "没有props字段");
			return false;
		}
		Map hm_options = Utility.GetMapField(hm_props, "options");
		if (hm_options == null)
			return true;
		Map hm_type = Utility.GetMapField(hm_options, type_name);	//type_name = user or condition or validator or postFunction
		if (hm_type == null)
			return true;
		ArrayList al_value = Utility.GetArrayListField(hm_type, "value");
		if (al_value == null || al_value.size() == 0)
			return true;

		for (Object o_value : al_value) {
			if (!Map.class.isAssignableFrom(o_value.getClass()))
				continue;
			Map hm_value = (Map)o_value;
			//String func_id = Utility.GetStringField(hm_value, "id");
			String name = Utility.GetStringField(hm_value, "name");
			//String umodule = Utility.GetStringField(hm_value, "umodule");
			Object o_argu = Utility.GetField(hm_value, "value");
			String desc = Utility.GetStringField(hm_value, "showname");
			
			if (Utility.IsEmpty(name))
				continue;
			
//			String sql = "select callfunc from t_wf_function where name = '" + dc.FormatString(name) + "'";
//			ResultSet rs_call = dc.ExecuteQuery(sql);
			String sql = "select callfunc from t_wf_function where name = ?";
			List<Map<String, Object>> rs_call = dc.executeQuery(sql, dc.FormatString(name));
			if (rs_call == null) {
				SetErrorMsg(dc);
				return false;
			}
			if (rs_call.isEmpty()) {
				SetErrorMsg(obj_name + "转换" + type_name + "获取调用功能失败：name = " + name);
				return false;
			}
			String call_func = (String) rs_call.get(0).get("CALLFUNC");
			
			String argu = "";
			if (o_argu != null) {
				try {
					argu = JsonUtil.getGson().toJson(o_argu);
				}
				catch(Exception e) {
					SetErrorMsg(obj_name + "转换" + type_name + "参数失败：" + Utility.GetExceptionMsg(e));
					return false;
				}
			}
			
			sql = "insert into " + WfMng.db_name + "workflow_temp_func(wtf_id,wt_id,wtn_id,wtp_id,execute_time,func,remark,last_update) values("
					+ dc.GetSeqNextValue("id_seq") + ","
					+ wt_id + ","
					+ wtn_id + ","
					+ wtp_id + ","
					+ "'" + dc.FormatString(execute_time) + "',"
					+ "'" + dc.FormatString(sms_direct_func) + "',"
					+ "'" + dc.FormatString(desc) + "',"
					+ dc.GetSysdate() + ")"
					;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				return false;
			}
			String wtf_id = dc.GetSequence("id_seq");
			if (Utility.IsEmpty(wtf_id))
				return false;
			
			sql = "insert into " + WfMng.db_name + "workflow_temp_argu(wta_id,wt_id,wtn_id,wtf_id,argu_name,argu_value,last_update) values("
					+ dc.GetSeqNextValue("id_seq") + ","
					+ wt_id + ","
					+ wtn_id + ","
					+ wtf_id + ","
					+ "'call',"
					+ "'" + dc.FormatString(call_func) + "',"
					+ dc.GetSysdate() + ")"
					;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				return false;
			}

			sql = "insert into " + WfMng.db_name + "workflow_temp_argu(wta_id,wt_id,wtn_id,wtf_id,argu_name,argu_value,last_update) values("
					+ dc.GetSeqNextValue("id_seq") + ","
					+ wt_id + ","
					+ wtn_id + ","
					+ wtf_id + ","
					+ "'value',"
					+ "'" + dc.FormatString(argu) + "',"
					+ dc.GetSysdate() + ")"
					;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				return false;
			}
			
		}		
		return true;
	}
	
	//每个路径自动插入com.usky.sms.uwffunc.UwfFuncPlugin.SetActivityStatus
	boolean WriteSetActivityStatusFunc(DbClient dc, String wt_id, String wtn_id, String wtp_id, String execute_time) throws Exception {
//		String sql = "insert into " + WfMng.db_name + "workflow_temp_func(wtf_id,wt_id,wtn_id,wtp_id,execute_time,func,remark,last_update) values("
//				+ dc.GetSeqNextValue("id_seq") + ","
//				+ wt_id + ","
//				+ wtn_id + ","
//				+ wtp_id + ","
//				+ "'" + dc.FormatString(execute_time) + "',"
//				+ "'" + dc.FormatString(sms_direct_func) + "',"
//				+ "'" + dc.FormatString("每条路径自动加入") + "',"
//				+ dc.GetSysdate() + ")"
//				;
//		if (dc.Execute(sql) < 0) {
//			SetErrorMsg(dc);
//			return false;
//		}
//		String wtf_id = dc.GetSequence("id_seq");
//		if (Utility.IsEmpty(wtf_id))
//			return false;
//		
//		sql = "insert into " + WfMng.db_name + "workflow_temp_argu(wta_id,wt_id,wtn_id,wtf_id,argu_name,argu_value,last_update) values("
//				+ dc.GetSeqNextValue("id_seq") + ","
//				+ wt_id + ","
//				+ wtn_id + ","
//				+ wtf_id + ","
//				+ "'call',"
//				+ "'" + dc.FormatString("com.usky.sms.uwffunc.UwfFuncPlugin.SetActivityStatus") + "',"
//				+ dc.GetSysdate() + ")"
//				;
//		if (dc.Execute(sql) < 0) {
//			SetErrorMsg(dc);
//			return false;
//		}
//
//		sql = "insert into " + WfMng.db_name + "workflow_temp_argu(wta_id,wt_id,wtn_id,wtf_id,argu_name,argu_value,last_update) values("
//				+ dc.GetSeqNextValue("id_seq") + ","
//				+ wt_id + ","
//				+ wtn_id + ","
//				+ wtf_id + ","
//				+ "'value',"
//				+ "'" + dc.FormatString("") + "',"
//				+ dc.GetSysdate() + ")"
//				;
//		if (dc.Execute(sql) < 0) {
//			SetErrorMsg(dc);
//			return false;
//		}

		return true;
	}
	
	@SuppressWarnings("rawtypes")
	boolean WriteAttr(DbClient dc, Map hm, String obj_name, String wt_id, String wtn_id, String wtp_id) throws Exception {
		Map hm_props = Utility.GetMapField(hm, "props");
		if (hm_props == null) {
			SetErrorMsg(obj_name + "没有props字段");
			return false;
		}
		Map hm_options = Utility.GetMapField(hm_props, "options");
		if (hm_options == null)
			return true;
		Map hm_property = Utility.GetMapField(hm_options, "property");
		if (hm_property == null)
			return true;
		ArrayList al_value = Utility.GetArrayListField(hm_property, "value");
		if (al_value == null || al_value.size() == 0)
			return true;

		for (Object o_value : al_value) {
			if (!Map.class.isAssignableFrom(o_value.getClass()))
				continue;
			Map hm_value = (Map)o_value;
			String key = Utility.GetStringField(hm_value, "key");
			String value = Utility.GetStringField(hm_value, "value");
			if (Utility.IsEmpty(key) || Utility.IsEmpty(value))
				continue;
			
			String sql = "insert into " + WfMng.db_name + "workflow_temp_attr(wta_id,wt_id,wtn_id,wtp_id,attr_name,attr_value,last_update) values("
					+ dc.GetSeqNextValue("id_seq") + ","
					+ wt_id + ","
					+ wtn_id + ","
					+ wtp_id + ","
					+ "'" + dc.FormatString(key) + "',"
					+ "'" + dc.FormatString(value) + "',"
					+ dc.GetSysdate() + ")"
					;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				return false;
			}
		}
		return true;
	}
}
