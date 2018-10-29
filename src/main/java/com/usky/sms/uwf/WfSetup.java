package com.usky.sms.uwf;

import java.sql.Connection;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang.StringUtils;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.JsonUtil;
import com.usky.comm.Utility;
import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.utils.SpringBeanUtils;

public class WfSetup {
	public static int count = 0;
	public static String GetDefaultId(Connection conn) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn))
			throw new Exception(dc.ErrorMessage);
		
//		String sql = "select wt_id from  " + WfMng.db_name + "wf_setup_data where dft = 'Y'";
//		ResultSet rs = dc.ExecuteQuery(sql);
		String sql = "select wt_id from  " + WfMng.db_name + "wf_setup_data where dft = 'Y'";
		List<Map<String, Object>> rs = dc.executeQuery(sql);
		if (rs == null)
			throw new Exception(dc.ErrorMessage);
		if (!rs.isEmpty())
			return (String) rs.get(0).get("WT_ID");
		else
			return null;
	}
	
	@SuppressWarnings("unchecked")
	public static List<Map<String, Object>> GetSetupList(Connection conn, String wt_id) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn))
			throw new Exception(dc.ErrorMessage);

		String sql = "select * from  " + WfMng.db_name + "wf_setup_data where 1 = 1 ";
		if (!Utility.IsEmpty(wt_id))
			sql += " and wt_id = " + wt_id;
//		ResultSet rs = dc.ExecuteQuery(sql);
		List<Map<String, Object>> rs = dc.executeQuery(sql);
		if (rs == null)
			throw new Exception(dc.ErrorMessage);
		return Utility.formatResultMaps(rs);
	}
	
	public static Map<String, Object> GetActivityStatusList(Connection conn, String ids) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn))
			throw new Exception(dc.ErrorMessage);
	
		Map<String, Object> m_result = new LinkedHashMap<String, Object>();
		for (String id : ids.split(",")) {
//			String sql = "select wsd_id,name from " + WfMng.db_name + "wf_setup_data "
//					+ "where wt_id in (select wt_id from  " + WfMng.db_name + "workflow_temp_node "
//					+ "where wtn_id in (select object_id from  " + WfMng.db_name + "app_tag_relate "
//					+ "where tid = (select tid from  " + WfMng.db_name + "app_tag_info "
//					+ "where name = 'activityStatus_id') and object_type = 'workflow_temp_node' and tag_value = " + id + "))"
//					;
//			ResultSet rs = dc.ExecuteQuery(sql);
			String sql = "select wsd_id,name from " + WfMng.db_name + "wf_setup_data "
					+ "where wt_id in (select wt_id from  " + WfMng.db_name + "workflow_temp_node "
					+ "where wtn_id in (select object_id from  " + WfMng.db_name + "app_tag_relate "
					+ "where tid = (select tid from  " + WfMng.db_name + "app_tag_info "
					+ "where name = 'activityStatus_id') and object_type = 'workflow_temp_node' and to_number(tag_value) = ?))"
					;
			List<Map<String, Object>> rs = dc.executeQuery(sql, id);
			if (rs == null)
				throw new Exception(dc.ErrorMessage);
			m_result.put(id, Utility.formatResultMaps(rs));
		}
		
		return m_result;
	}
	
	public static Map<String, Object> GetScreenList(Connection conn, String ids) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn))
			throw new Exception(dc.ErrorMessage);
	
		Map<String, Object> m_result = new LinkedHashMap<String, Object>();
		for (String id : ids.split(",")) {
//			String sql = "select wsd_id,name from " + WfMng.db_name + "wf_setup_data "
//					+ "where wt_id in (select wt_id from  " + WfMng.db_name + "workflow_temp_attr "
//					+ "where attr_name = 'screen' and attr_value = '" + id + "')"
//					;
//			ResultSet rs = dc.ExecuteQuery(sql);
			String sql = "select wsd_id,name from " + WfMng.db_name + "wf_setup_data "
					+ "where wt_id in (select wt_id from  " + WfMng.db_name + "workflow_temp_attr "
					+ "where attr_name = 'screen' and attr_value = ?)"
					;
			List<Map<String, Object>> rs = dc.executeQuery(sql, id);
			if (rs == null)
				throw new Exception(dc.ErrorMessage);
			m_result.put(id, Utility.formatResultMaps(rs));
		}
		
		return m_result;
	}
	
	@SuppressWarnings("unchecked")
	public static String Submit(Connection conn, String user_id, String wt_id, String title, String brief, String data) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn))
			throw new Exception(dc.ErrorMessage);
		
        HashMap<String, Object> h_param = null; 
        if (Utility.IsEmpty(data))
        	h_param = new HashMap<String, Object>();
        else {
       		h_param = JsonUtil.getGson().fromJson(data, HashMap.class);
        }
        
        WfService wf = new WfService();
        WfMng mng = new WfMng(user_id, "Submit", wt_id, "", null, h_param, wf, dc, null);
        if (!mng.Submit(title, brief))
        {
            ParseWorkflowFuncResult("Submit", wf.mResponseHeader, wf.mResponseData);
            return null;
        }
		
		return Utility.GetStringField(wf.mResponseData, "wi_id");
	}
	
    private static void ParseWorkflowFuncResult(String code, Map<String, Object> mResponseHeader, Map<String, Object>mResponseData) throws Exception
    {
    	if (!mResponseHeader.containsKey("status")) {
            throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "工作流服务[" + code + "]返回的数据中没有[status]字段");
        }
    	if (!"0".equals(mResponseHeader.get("status").toString())) {
    		if (mResponseHeader.containsKey("msg")) {
    			int status = Integer.parseInt(mResponseHeader.get("status").toString());
    			String msg = mResponseHeader.get("msg").toString();
    			if (status < -9999) {
                    throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "工作流服务[" + code + "]返回错误" + status + "：" + msg);
    			}
                else
                    throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "工作流服务[" + code + "]返回错误：" + msg);
            }
            else
                throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "工作流服务[" + code + "]发生错误，但原因未知");
        }
        throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "工作流服务[" + code + "]执行失败，但是返回status为0，可能有函数return false前没有SetErrorMsg");
    }
	
    public static List<Map<String, Object>> GetTaskList(Connection conn, String user_id, String wi_id) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn))
			throw new Exception(dc.ErrorMessage);
		
//		String sql = "select wiu_id,wip_id,ops,(select next_name from workflow_inst_path wip where wiu.wip_id = wip.wip_id) next_name from workflow_inst_user wiu where user_id = '" + dc.FormatString(user_id) + "' and finished = 'N' and wip_id in (select wip_id from workflow_inst_path) wip where wip.wip_id = wiu.wip_id and win_id in (select win_id from workflow_inst_node win where win.win_id = wip.win_id and status = '已进入' and wi_id = " + wi_id + ")";
//		ResultSet rs_wiu = dc.ExecuteQuery(sql);
		String sql = "select wiu_id,wip_id,ops,(select next_name from workflow_inst_path wip where wiu.wip_id = wip.wip_id) next_name from workflow_inst_user wiu where user_id = ? and finished = 'N' and wip_id in (select wip_id from workflow_inst_path) wip where wip.wip_id = wiu.wip_id and win_id in (select win_id from workflow_inst_node win where win.win_id = wip.win_id and status = '已进入' and wi_id = ?)";
		List<Map<String, Object>> rs_wiu = dc.executeQuery(sql, dc.FormatString(user_id), wi_id);
		if (rs_wiu == null)
			throw new Exception(dc.ErrorMessage);
		
		List<Map<String, Object>> list_result = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> wiu : rs_wiu) {
			Map<String, Object> m_result = new LinkedHashMap<String, Object>();
			list_result.add(m_result);
			
			m_result.put("wiu_id", (String) wiu.get("WIU_ID"));
			m_result.put("wip_id", (String) wiu.get("WIP_ID"));
			m_result.put("ops", (String) wiu.get("OPS"));
			m_result.put("next_name", (String) wiu.get("NEXT_NAME"));
		}
		
		return list_result;
    }
    
    @SuppressWarnings("unchecked")
	public static List<Map<String, Object>> GetUserPathList(Connection conn, String user_id, String wi_id) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn))
			throw new Exception(dc.ErrorMessage);
		
//		String sql = "select win_id from workflow_inst_node where wi_id = " + wi_id + " and status = '已进入'";
//		ResultSet rs_node = dc.ExecuteQuery(sql);
		String sql = "select win_id from workflow_inst_node where wi_id = ? and status = '已进入'";
		List<Map<String, Object>> rs_node = dc.executeQuery(sql, wi_id);
		if (rs_node == null)
			throw new Exception(dc.ErrorMessage);
		
		if (rs_node.isEmpty())
			//throw new Exception("流程不存在或已结束" + wi_id);
			return new ArrayList<Map<String, Object>>();
		
		String win_id = (String) rs_node.get(0).get("WIN_ID");
		
//		sql = "select wip_id,name,(select attr_value from workflow_inst_attr wia where wip.wip_id = wia.wip_id and wia.win_id = wip.win_id and attr_name = 'screen') screen from workflow_inst_path wip where win_id = " + win_id + " and exists (select 1 from workflow_inst_user wiu where wiu.wip_id = wip.wip_id and to_number(user_id) = " + user_id + " and finished = 'N')";
//		ResultSet rs_path = dc.ExecuteQuery(sql);
		sql = "select wip_id,name,(select attr_value from workflow_inst_attr wia where wip.wip_id = wia.wip_id and wia.win_id = wip.win_id and attr_name = 'screen') screen from workflow_inst_path wip where win_id = ? and exists (select 1 from workflow_inst_user wiu where wiu.wip_id = wip.wip_id and to_number(user_id) = ? and finished = 'N')";
		List<Map<String, Object>> rs_path = dc.executeQuery(sql, win_id, user_id);
		if (rs_path == null)
			throw new Exception(dc.ErrorMessage);
		
		return Utility.formatResultMaps(rs_path);
    }

	public static List<Map<String, Object>> GetCurrentNodeAttributes(Connection conn, String wi_id) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn)) {
			throw new Exception(dc.ErrorMessage);
		}

		String sql = "select win_id from workflow_inst_node where wi_id = ? and status = '已进入'";
		List<Map<String, Object>> queryResult = dc.executeQuery(sql, wi_id);
		if (queryResult == null) {
			throw new Exception(dc.ErrorMessage);
		}

		if (queryResult.isEmpty()) {
			// throw new Exception("流程不存在或已结束" + wi_id);
			return new ArrayList<Map<String, Object>>();
		}

		String win_id = (String)queryResult.get(0).get("WIN_ID");

		sql = "select attr_name, attr_value from workflow_inst_attr wia where wia.wip_id = '0' and wia.win_id = " + "?"
				+ "and wia.wi_id = " + "?";
		queryResult = dc.executeQuery(sql, win_id, wi_id);
		if (queryResult == null) {
			throw new Exception(dc.ErrorMessage);
		}

		return queryResult;
	}

	@SuppressWarnings("unchecked")
	public static ArrayList<Object> GetUserPathListWithAttibutes(Connection conn, String user_id, String wi_id)
			throws Exception {
		if (null == user_id) {
			throw new Exception("用户ID不能为空！");
		}
		return GetPathListWithAttibutes(conn, user_id, wi_id);
//		DbClient dc = new DbClient();
//		if (!dc.Open(conn)) {
//			throw new Exception(dc.ErrorMessage);
//		}
//
//		String sql = "select win_id from workflow_inst_node where wi_id = ? and status = '已进入'";
//		List<Map<String, Object>> queryResult = dc.executeQuery(sql, wi_id);
//		if (queryResult == null)
//			throw new Exception(dc.ErrorMessage);
//
//		if (queryResult.isEmpty()) {
//			// throw new Exception("流程不存在或已结束" + wi_id);
//			return new ArrayList<Object>();
//		}
//
//		String win_id = (String) queryResult.get(0).get("WIN_ID");
//
//		sql = "select wip.wip_id, wip.name, wia.attr_name, wia.attr_value from workflow_inst_path wip left join workflow_inst_attr wia on (wip.wip_id = wia.wip_id and wia.win_id = wip.win_id) where wip.win_id = "
//				+ "?"
//				+ " and exists (select 1 from workflow_inst_user wiu where wiu.wip_id = wip.wip_id and to_number(user_id) = "
//				+ "?" + " and finished = 'N')";
//		queryResult = dc.executeQuery(sql, win_id, user_id);
//
//		Map<String, Object> result = new LinkedHashMap<String, Object>();
//		Map<String, Object> resultMap = null;
//		for (Map<String, Object> map : queryResult) {
//			String wipId = map.get("WIP_ID").toString();
//			String name = (String)map.get("NAME");
//			String attrName = (String)map.get("ATTR_NAME");
//			String attrValue = (String)map.get("ATTR_VALUE");
//			Map<String, Object> attributes = null;
//			if (result.containsKey(wipId)) {
//				resultMap = (Map<String, Object>) result.get(wipId);
//				if (null != attrName) {
//					attributes = (Map<String, Object>) resultMap.get("attributes");
//					attributes.put(attrName, attrValue);
//				}
//			} else {
//				resultMap = new HashMap<String, Object>();
//				resultMap.put("wipId", wipId);
//				resultMap.put("name", name);
//				attributes = new HashMap<String, Object>();
//				if (null != attrName) {
//					attributes.put(attrName, attrValue);
//				}
//				resultMap.put("attributes", attributes);
//				result.put(wipId, resultMap);
//			}
//		}
//		return new ArrayList<Object>(result.values());
	}
	
	/**
	 * 如果user_id为null则获取当前节点的所有的线和线上的属性
	 * @param conn
	 * @param user_id
	 * @param wi_id
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public static ArrayList<Object> GetPathListWithAttibutes(Connection conn, String user_id, String wi_id)
			throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn)) {
			throw new Exception(dc.ErrorMessage);
		}

		String sql = "select win_id from workflow_inst_node where wi_id = ? and status = '已进入'";
		List<Map<String, Object>> queryResult = dc.executeQuery(sql, wi_id);
		if (queryResult == null)
			throw new Exception(dc.ErrorMessage);

		if (queryResult.isEmpty()) {
			// throw new Exception("流程不存在或已结束" + wi_id);
			return new ArrayList<Object>();
		}

		String win_id = (String) queryResult.get(0).get("WIN_ID");

		sql = "select wip.wip_id, wip.name, wia.attr_name, wia.attr_value from workflow_inst_path wip left join workflow_inst_attr wia on (wip.wip_id = wia.wip_id and wia.win_id = wip.win_id) where wip.win_id = "
				+ "?";
		if (!StringUtils.isBlank(user_id)) {
			sql = sql
					+ " and exists (select 1 from workflow_inst_user wiu where wiu.wip_id = wip.wip_id and to_number(user_id) = "
					+ "?" + " and finished = 'N') order by wip.name";
			queryResult = dc.executeQuery(sql, win_id, user_id);
		} else {
			sql = sql + " order by wip.name";
			queryResult = dc.executeQuery(sql, win_id);
		}

		Map<String, Object> result = new LinkedHashMap<String, Object>();
		Map<String, Object> resultMap = null;
		for (Map<String, Object> map : queryResult) {
			String wipId = map.get("WIP_ID").toString();
			String name = (String)map.get("NAME");
			String attrName = (String)map.get("ATTR_NAME");
			String attrValue = (String)map.get("ATTR_VALUE");
			Map<String, Object> attributes = null;
			if (result.containsKey(wipId)) {
				resultMap = (Map<String, Object>) result.get(wipId);
				if (null != attrName) {
					attributes = (Map<String, Object>) resultMap.get("attributes");
					attributes.put(attrName, attrValue);
				}
			} else {
				resultMap = new HashMap<String, Object>();
				resultMap.put("wipId", wipId);
				resultMap.put("name", name);
				attributes = new HashMap<String, Object>();
				if (null != attrName) {
					attributes.put(attrName, attrValue);
				}
				resultMap.put("attributes", attributes);
				result.put(wipId, resultMap);
			}
		}
		return new ArrayList<Object>(result.values());
	}

	@SuppressWarnings("unchecked")
	public static void Operate(Connection conn, String user_id, String wip_id, String remark, String data) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn))
			throw new Exception(dc.ErrorMessage);
		
        HashMap<String, Object> h_param = null; 
        if (Utility.IsEmpty(data))
        	h_param = new HashMap<String, Object>();
        else {
       		h_param = JsonUtil.getGson().fromJson(data, HashMap.class);
        }
        
//        String sql = "select wt_id from workflow_inst wi where wi_id = (select wi_id from workflow_inst_node where win_id = (select win_id from workflow_inst_path where wip_id = " + wip_id + "))";
//        ResultSet rs_wt = dc.ExecuteQuery(sql);
        String sql = "select wt_id from workflow_inst wi where wi_id = (select wi_id from workflow_inst_node where win_id = (select win_id from workflow_inst_path where wip_id = ?))";
        List<Map<String, Object>> rs_wt = dc.executeQuery(sql, wip_id);
        if (rs_wt == null)
        	throw new Exception(dc.ErrorMessage);
        if (rs_wt.isEmpty())
        	throw new Exception(wip_id + "不存在" + sql);
        String wt_id = (String) rs_wt.get(0).get("WT_ID");
        
        WfService wf = new WfService();
        WfMng mng = new WfMng(user_id, "Operate", wt_id, "", null, h_param, wf, dc, null);
        if (!mng.Operate(wip_id, remark))
        {
            ParseWorkflowFuncResult("Operate", wf.mResponseHeader, wf.mResponseData);
            return;
        }
		
		return;
	}
	
	//获取工作流当前操作用户列表
	public static List<String> GetWfCurrentUserList(Connection conn, String wi_id) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn))
			throw new Exception(dc.ErrorMessage);

//		String sql = "select distinct trunc(user_id) user_id from workflow_inst_user where wip_id in (select wip_id from workflow_inst_path where win_id in (select win_id from workflow_inst_node where wi_id = " + wi_id + " and status = '已进入')) and finished = 'N'";
//		ResultSet rs_user = dc.ExecuteQuery(sql);
		String sql = "select distinct trunc(user_id) user_id from workflow_inst_user where wip_id in (select wip_id from workflow_inst_path where win_id in (select win_id from workflow_inst_node where wi_id = ? and status = '已进入')) and finished = 'N'";
		List<Map<String, Object>> rs_user = dc.executeQuery(sql, wi_id);
		if (rs_user == null) 
			throw new Exception(dc.ErrorMessage);
		List<String> list_user = new ArrayList<String>();
		for (Map<String, Object> user : rs_user) {
			list_user.add((String) user.get("USER_ID"));
		}
		
		return list_user;
	}
	
	public static List<Map<String, Object>> GetWfActivityStatusLog(Connection conn, String wi_id) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn))
			throw new Exception(dc.ErrorMessage);
		
//		String sql = "select status,user_id,last_update from wf_activity_status where wi_id = " + wi_id + " order by was_id";
//		ResultSet rs_status = dc.ExecuteQuery(sql);
		String sql = "select status,user_id,last_update from wf_activity_status where wi_id = ? order by was_id";
		List<Map<String, Object>> rs_status = dc.executeQuery(sql, wi_id);
		if (rs_status == null)
			throw new Exception(dc.ErrorMessage);
		
		/*
		if (!rs_status.next())
			return new ArrayList<Map<String, Object>>();
		
		String from_status = rs_status.getString("STATUS");
		String user_id = rs_status.getString("USER_ID");
		Timestamp from_date = rs_status.getTimestamp("LAST_UPDATE");
		*/
		String from_status = null;
		Timestamp from_date = null;
		String user_id = "";

		ActivityStatusDao asd = (ActivityStatusDao) SpringBeanUtils.getBean("activityStatusDao");
		if (asd == null)
			throw new Exception("无法获得ActivityStatusDao");
		UserDao ud = (UserDao) SpringBeanUtils.getBean("userDao");
		if (ud == null)
			throw new Exception("无法获得UserDao");

		List<Map<String, Object>> list_status = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> status : rs_status) {
			Map<String, Object> m_status = new HashMap<String, Object>();
			list_status.add(m_status);
			
			String to_status = (String) status.get("STATUS");
			user_id = (String) status.get("USER_ID");
			Timestamp to_date = (Timestamp) status.get("LAST_UPDATE");
			
			if (from_status == null) {
				Map<String, Object> m_as = new HashMap<String, Object>();
				m_as.put("id", 0);
				m_as.put("name", "创建");
				m_as.put("category", "NEW");
				m_status.put("from_status", m_as);
			}
			else
				m_status.put("from_status", asd.getById(Integer.parseInt(from_status)));
			m_status.put("to_status", asd.getById(Integer.parseInt(to_status)));
			m_status.put("user", ud.getById(Integer.parseInt(user_id)));
			if (from_date == null)
				from_date = to_date;
			m_status.put("time_in", to_date.getTime() - from_date.getTime());
			m_status.put("last_update", DateHelper.formatIsoSecond(new Date(to_date.getTime())));
			
			from_status = to_status;
			from_date = to_date;
		}
		return list_status;
	}
	
	/**
	 * 获取流程日志和当前状态及处理人
	 * @param conn
	 * @param wi_id
	 * @return
	 * @throws Exception
	 */
	public static List<Map<String, Object>> getWfActivityStatusLogAndCurrentStatus(Connection conn, String wi_id) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn)) {
			throw new Exception(dc.ErrorMessage);
		}
		
		StringBuffer sql = new StringBuffer();
		sql.append("select tas.id as STATUS_ID,");
		sql.append("       tas.category as STATUS_CATEGORY,");
		sql.append("       tas.name as STATUS_NAME,");
		sql.append("       wfs.last_update as WFS_LAST_UPDATE,");
		sql.append("       u.id as USER_ID,");
		sql.append("       u.fullname as USER_FULL_NAME");
		sql.append("  from wf_activity_status wfs");
		sql.append("  left join t_user u on wfs.user_id = u.id");
		sql.append("  left join T_ACTIVITY_STATUS tas on wfs.status = tas.id");
		sql.append(" where wfs.wi_id = ?");
		sql.append(" order by wfs.was_id");
		
		List<Map<String, Object>> queryResult = dc.executeQuery(sql.toString(), wi_id);
		if (queryResult == null) {
			throw new Exception(dc.ErrorMessage);
		}

		UserDao ud = (UserDao) SpringBeanUtils.getBean("userDao");
		if (ud == null) {
			throw new Exception("无法获得UserDao");
		}

		List<Map<String, Object>> logMaps = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> userMaps = null;
		Map<String, Object> logMap = null;
		Map<String, Object> userMap = null;
		Map<String, Object> fromStatusMap = null;
		Map<String, Object> toStatusMap = null;
		Timestamp from_date = null;
		for (Map<String, Object> result : queryResult) {
			logMap = new HashMap<String, Object>();
			// 处理人
			userMaps = new ArrayList<Map<String, Object>>();
			userMap = new HashMap<String, Object>();
			userMap.put("id", result.get("USER_ID"));
			userMap.put("fullname", result.get("USER_FULL_NAME"));
			userMaps.add(userMap);
			logMap.put("users", userMaps);
			
			// 起始状态
			if (null == fromStatusMap) {
				fromStatusMap = new HashMap<String, Object>();
				fromStatusMap.put("id", 0);
				fromStatusMap.put("name", "创建");
				fromStatusMap.put("category", "NEW");
				logMap.put("from_status", fromStatusMap);
			}
			logMap.put("from_status", fromStatusMap);
			// 到达状态
			toStatusMap = new HashMap<String, Object>();
			toStatusMap.put("id", result.get("STATUS_ID"));
			toStatusMap.put("category", result.get("STATUS_CATEGORY"));
			toStatusMap.put("name", result.get("STATUS_NAME"));
			logMap.put("to_status", toStatusMap);
			fromStatusMap = toStatusMap;
			
			Timestamp to_date = (Timestamp) result.get("WFS_LAST_UPDATE");
			
			if (from_date == null) {
				from_date = to_date;
			}
			logMap.put("time_in", to_date.getTime() - from_date.getTime());
			logMap.put("last_update", DateHelper.formatIsoSecond(new Date(to_date.getTime())));
			logMaps.add(logMap);
			
			from_date = to_date;
		}
		logMap = new HashMap<String, Object>();
		logMap.put("from_status", fromStatusMap);
		List<String> userIdList = GetWfCurrentUserList(conn, wi_id);
		List<Map<String, Object>> users = null;
		if (userIdList.isEmpty()) {
			users = new ArrayList<Map<String, Object>>();
		} else {
			users = ud.convert(ud.internalGetByIds(userIdList.toArray(new String[0])), Arrays.asList(new String[]{"id", "fullname"}), false);
		}
		logMap.put("users", users);
		logMaps.add(logMap);
		return logMaps;
	}
	
	public List<Map<String, Object>> getWorkflowTemplates(Connection conn, String name) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn)) {
			throw new Exception(dc.ErrorMessage);
		}
		List<Map<String, Object>> rs = null;
		StringBuffer sql = new StringBuffer("select * from workflow_temp t");
		if (!StringUtils.isBlank(name)) {
			String transferredName = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			transferredName = "%" + transferredName + "%";
			sql.append(" where upper(t.name) like upper(?) escape '/'");
			sql.append(" order by t.name");
			rs = dc.executeQuery(sql.toString(), transferredName);
		} else {
			sql.append(" order by t.name");
			rs = dc.executeQuery(sql.toString());
			
		}
		if (rs == null) {
			throw new Exception(dc.ErrorMessage);
		}
		return Utility.formatResultMaps(rs);
	}
	
	/**
	 * 
	 * 获取节点的下一步的根据选人方式获取的处理人
	 * @return
	 */
	public Map<String, Object> getNodeExitPathInfo(Connection conn, String userId, String winId, Map<String, Object> dataMap) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn)) {
			throw new Exception(dc.ErrorMessage);
		}
		String sql = "select wi_id from workflow_inst_node t where t.win_id = ?";
		List<Map<String, Object>> rs = dc.executeQuery(sql, winId);
		if (rs == null) {
			throw new Exception(dc.ErrorMessage);
		}
		if (!rs.isEmpty()) {
			String wiId = (String) rs.get(0).get("WI_ID");
			WfService wf = new WfService();
			WfMng mng = new WfMng(userId, "getNodeExitPathInfo", null, wiId, null, (HashMap<String, Object>) dataMap, wf, dc, null);
			
			Map<String, Object> pathInfo = new HashMap<String, Object>();
			if (!mng.getNodeExitPathInfo(pathInfo, winId, null)) {
				Map<String, Object> responseHeader = mng.mResponseHeader;
				if (responseHeader != null && responseHeader.get("msg") != null) {
					throw new Exception((String) responseHeader.get("msg"));
				} else {
					throw new Exception(dc.ErrorMessage);
				}
			}
			UserDao userDao = (UserDao) SpringBeanUtils.getBean("userDao");
			if (userDao == null) {
				throw new Exception("无法获得UserDao");
			}
			for (Entry<String, Object> entry : pathInfo.entrySet()) {
				Map<String, Object> infoMap = (Map<String, Object>) entry.getValue();
				String userlist = (String) infoMap.get("userlist");
				if (StringUtils.isNotBlank(userlist)) {
					List<UserDO> users = userDao.internalGetByIds(userlist.split(","));
					List<Map<String, Object>> userMaps = userDao.convert(users, Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false);
					infoMap.put("users", userMaps);
				}
				infoMap.remove("userlist");
			}
			return pathInfo;
		}
		return null;
	}
	
	/**
	 * 获取指定路径的下一节点的处理人
	 * @param conn
	 * @param wipId
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getNextStepProcessors(Connection conn, String userId, String wipId, String data) throws Exception {
		DbClient dc = new DbClient();
		if (!dc.Open(conn)) {
			throw new Exception(dc.ErrorMessage);
		}
//		String sql = "select win_id, next_name from workflow_inst_path t where t.wip_id = ?";
		StringBuffer sql = new StringBuffer();
		sql.append("select n1.win_id from workflow_inst_node n1");
		sql.append(" left join workflow_inst_node n2");
		sql.append(" on (n1.wi_id = n2.wi_id)");
		sql.append(" left join workflow_inst_path p");
		sql.append(" on (n2.win_id = p.win_id)");
		sql.append(" where p.wip_id = ?");
		sql.append(" and n1.name = p.next_name");
		List<Map<String, Object>> rs = dc.executeQuery(sql.toString(), wipId);
		if (rs == null) {
			throw new Exception(dc.ErrorMessage);
		}
		if (!rs.isEmpty()) {
			String winId = (String) rs.get(0).get("WIN_ID");
			if (StringUtils.isBlank(winId)) {
				throw new Exception("路径:" + wipId + "没有下一节点");
			}
			Map<String, Object> dataMap = null;
			if (Utility.IsEmpty(data))
				dataMap = new HashMap<String, Object>();
			else {
				dataMap = JsonUtil.getGson().fromJson(data, Map.class);
			}
			return this.getNodeExitPathInfo(conn, userId, winId, dataMap);
		}
		throw new Exception("路径:" + wipId + "没有下一节点");
	}
}
