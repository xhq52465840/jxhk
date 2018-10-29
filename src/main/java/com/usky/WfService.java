package com.usky;

import java.sql.*;
import java.util.*;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.usky.comm.DbClient;
import com.usky.comm.JsonUtil;
import com.usky.comm.Utility;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class WfService extends SmsService {
	protected Object GetDao(String daoName) {
		return WebApplicationContextUtils.getRequiredWebApplicationContext(request.getSession().getServletContext()).getBean(daoName);
	}
	
    protected boolean ParseWorkflowFuncResult()
    {
    	if (!mResponseHeader.containsKey("status")) {
            SetErrorMsg("工作流服务[" + code + "]返回的数据中没有[status]字段");
            return false;
        }
    	if (!"0".equals(mResponseHeader.get("status").toString())) {
    		if (mResponseHeader.containsKey("msg")) {
    			int status = Integer.parseInt(mResponseHeader.get("status").toString());
    			String msg = mResponseHeader.get("msg").toString();
    			if (status < -9999) {
                    SetErrorMsg(msg, status, false);
                    log.WriteLine("工作流服务[" + code + "]返回错误" + status + "：" + msg);
    			}
                else
                    SetErrorMsg("工作流服务[" + code + "]返回错误：" + msg, status, true);
            }
            else
                SetErrorMsg("工作流服务[" + code + "]发生错误，但原因未知", -1, true);
            return false;
        }
        SetErrorMsg("工作流服务[" + code + "]执行失败，但是返回status为0，可能有函数return false前没有SetErrorMsg");
        return true;
    }

    protected String GetTagSql(DbClient dc, String tag) {
		String sql = "rid in (select rid from " + WfMng.db_name + "app_tag_relate atr,app_tag_info ati where ati.tid = atr.tid and (";

		boolean bFirst = true;
		for (String t : tag.split(",")) {
			int p = t.indexOf(":");
			String tag_name = "";
			String tag_value = null;
			if (p <= 0)
				tag_name = t;
			else {
				tag_name = t.substring(0, p);
				tag_value = t.substring(p + 1);
			}
			if (!bFirst)
				sql += " or ";
			else
				bFirst = false;
			sql += "(name = '" + dc.FormatString(tag_name) + "'" + (tag_value == null ? "" : " and tag_value " + ("".equals(tag_value) ? "is null" : "= '" + dc.FormatString(tag_value) + "'")) + ")";
		}
		sql += "))";

		return sql;
    }
    
    protected HashMap<String, Object> GetPathAttr(DbClient dc, String wip_id) throws Exception {
    	String sql = "select attr_name,attr_value from " + WfMng.db_name + "workflow_inst_attr where wip_id = " + wip_id;
    	return GetAttr(dc, sql);
    }
    
    protected HashMap<String, Object> GetNodeAttr(DbClient dc, String win_id) throws Exception {
    	String sql = "select attr_name,attr_value from " + WfMng.db_name + "workflow_inst_attr where win_id = " + win_id + " and wip_id = 0";
    	return GetAttr(dc, sql);
    }

    protected HashMap<String, Object> GetInstAttr(DbClient dc, String wi_id) throws Exception {
    	String sql = "select attr_name,attr_value from " + WfMng.db_name + "workflow_inst_attr where wi_id = " + wi_id + " and win_id = 0 and wip_id = 0";
    	return GetAttr(dc, sql);
    }
    
    protected HashMap<String, Object> GetAttr(DbClient dc, String sql) throws Exception {
//    	ResultSet rs_attr = dc.ExecuteQuery(sql);
    	List<Map<String, Object>> rs_attr = dc.executeQuery(sql);
    	if (rs_attr == null) {
    		SetErrorMsg(dc);
    		return null;
    	}
    	HashMap<String, Object> hm_attr = new HashMap<String, Object>();
    	for (Map<String, Object> attr : rs_attr) {
    		String value = (String) attr.get("ATTR_VALUE");
    		Object o = JsonUtil.getGson().fromJson((String) attr.get("ATTR_VALUE"), Object.class);
    		if (o == null)
    			hm_attr.put((String) attr.get("ATTR_NAME"), value);
    		else
    			hm_attr.put((String) attr.get("ATTR_NAME"), o);
    		//log.WriteLine(rs_attr.getString("ATTR_NAME") + " " + value + " " + (o == null ? "null" : o.toString()));
    	}
    	
    	return hm_attr;
    }
    
    protected boolean AddTag(DbClient dc, String tag_name, String tag_value, String object_type, String object_id) throws Exception {
//		String sql = "select tid from " + WfMng.db_name + "app_tag_info where name = '" + dc.FormatString(tag_name) + "'";
//		ResultSet rs_info = dc.ExecuteQuery(sql);
		String sql = "select tid from " + WfMng.db_name + "app_tag_info where name = ?";
		List<Map<String, Object>> rs_info = dc.executeQuery(sql, dc.FormatString(tag_name));
		if (rs_info == null) {
			SetErrorMsg(dc);
			return false;
		}
		String tid;
		if (rs_info.isEmpty()) {
			sql = "insert into " + WfMng.db_name + "app_tag_info(tid,name) values("
					+ dc.GetSeqNextValue("id_seq") + ","
					+ "'" + dc.FormatString(tag_name) + "')"
					;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				return false;
			}
			tid = dc.GetSequence("id_seq");
		}
		else
			tid = (String) rs_info.get(0).get("TID");
		
		sql = "update " + WfMng.db_name + "app_tag_relate set "
				+ "tag_value = '" + dc.FormatString(tag_value) + "',"
				+ "last_update = " + dc.GetSysdate()
				+ " where tid = " + tid
				+ " and object_type = '" + dc.FormatString(object_type) + "'"
				+ " and object_id = " + object_id
				;
		int ect = dc.Execute(sql);
		if (ect < 0) {
			SetErrorMsg(dc);
			return false;
		}
		if (ect == 0) {
			sql = "insert into " + WfMng.db_name + "app_tag_relate(rid,tid,object_type,object_id,tag_value,last_update) values("
					+ dc.GetSeqNextValue("id_seq") + ","
					+ tid + ","
					+ "'" + dc.FormatString(object_type) + "',"
					+ object_id + ","
					+ "'" + dc.FormatString(tag_value) + "',"
					+ dc.GetSysdate() + ")"
					;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				return false;
			}
		}

    	return true;
    }
    
    protected boolean CopyTag(DbClient dc, String from_object_type, String from_object_id, String to_object_type, String to_object_id) throws Exception {
    	String sql = "insert into " + WfMng.db_name + "app_tag_relate(rid,tid,object_type,object_id,tag_value,last_update) select "
    			+ dc.GetSeqNextValue("id_seq") + ","
    			+ "tid,"
    			+ "'" + dc.FormatString(to_object_type) + "',"
    			+ "'" + dc.FormatString(to_object_id) + "',"
    			+ "tag_value,"
    			+ dc.GetSysdate()
    			+ " from " + WfMng.db_name + "app_tag_relate "
    			+ "where object_type = '" + dc.FormatString(from_object_type) + "' "
    			+ " and object_id = '" + dc.FormatString(from_object_id) + "'"
    			;
    	if (dc.Execute(sql) < 0) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	return true;
    }
    
    protected boolean InsertTag(DbClient dc, String tags, String object_type, String object_id) throws Exception {
    	if (Utility.IsEmpty(tags))
    		return true;
    	
    	String old_tag = GetTag(dc, object_type, object_id);
    	if (tags.equals(old_tag))
    		return true;
    	
    	String sql = "delete from " + WfMng.db_name + "app_tag_relate where object_type = '" + dc.FormatString(object_type) + "' and object_id = " + object_id;
    	if (dc.Execute(sql) < 0) {
    		SetErrorMsg(dc);
    		return false;
    	}
    	
		for (String t : tags.split(",")) {
			int p = t.indexOf(":");
			String tag_name = "";
			String tag_value = "";
			if (p <= 0)
				tag_name = t;
			else {
				tag_name = t.substring(0, p);
				tag_value = t.substring(p + 1);
			}
			if (Utility.IsEmpty(tag_name))
				continue;
			
//			sql = "select tid from " + WfMng.db_name + "app_tag_info where name = '" + dc.FormatString(tag_name) + "'";
//			ResultSet rs_info = dc.ExecuteQuery(sql);
			sql = "select tid from " + WfMng.db_name + "app_tag_info where name = ?";
			List<Map<String, Object>> rs_info = dc.executeQuery(sql, dc.FormatString(tag_name));
			if (rs_info == null) {
				SetErrorMsg(dc);
				return false;
			}
			String tid;
			if (rs_info.isEmpty()) {
				sql = "insert into " + WfMng.db_name + "app_tag_info(tid,name) values("
						+ dc.GetSeqNextValue("id_seq") + ","
						+ "'" + dc.FormatString(tag_name) + "')"
						;
				if (dc.Execute(sql) < 0) {
					SetErrorMsg(dc);
					return false;
				}
				tid = dc.GetSequence("id_seq");
			}
			else
				tid = (String) rs_info.get(0).get("TID");
			
			sql = "update " + WfMng.db_name + "app_tag_relate set "
					+ "tag_value = '" + dc.FormatString(tag_value) + "',"
					+ "last_update = " + dc.GetSysdate()
					+ " where tid = " + tid
					+ " and object_type = '" + dc.FormatString(object_type) + "'"
					+ " and object_id = " + object_id
					;
			int ect = dc.Execute(sql);
			if (ect < 0) {
				SetErrorMsg(dc);
				return false;
			}
			if (ect == 0) {
				sql = "insert into " + WfMng.db_name + "app_tag_relate(rid,tid,object_type,object_id,tag_value,last_update) values("
						+ dc.GetSeqNextValue("id_seq") + ","
						+ tid + ","
						+ "'" + dc.FormatString(object_type) + "',"
						+ object_id + ","
						+ "'" + dc.FormatString(tag_value) + "',"
						+ dc.GetSysdate() + ")"
						;
				if (dc.Execute(sql) < 0) {
					SetErrorMsg(dc);
					return false;
				}
			}
		}

    	return true;
    }
    
    protected String GetTag(DbClient dc, String type, String id) throws Exception {
//        String sql = "select name,tag_value value from " + WfMng.db_name + "app_tag_info ati," + WfMng.db_name + "app_tag_relate atr where ati.tid = atr.tid and object_type = '" + dc.FormatString(type) + "' and object_id = " + id;
//        ResultSet rs_tag = dc.ExecuteQuery(sql);
        String sql = "select name,tag_value value from " + WfMng.db_name + "app_tag_info ati," + WfMng.db_name + "app_tag_relate atr where ati.tid = atr.tid and object_type = ? and object_id = ?";
        List<Map<String, Object>> rs_tags = dc.executeQuery(sql, dc.FormatString(type), id);
        if (rs_tags == null) 
        	throw new Exception(dc.ErrorMessage);

        String tag = "";
        for (Map<String, Object> rs_tag : rs_tags) {
        	if (!Utility.IsEmpty(tag))
        		tag += ",";
        	String value = (String) rs_tag.get("VALUE");
        	tag += (String) rs_tag.get("NAME") + (Utility.IsEmpty(value) ? "" : ":" + value);
        }
        
        return tag;
    }
    
    protected String GetUserName(String user_id) {
		UserDO user;
		try {
			UserDao ud = (UserDao) WebApplicationContextUtils.getRequiredWebApplicationContext(request.getSession().getServletContext()).getBean("userDao");
			user = ud.internalGetById(Integer.parseInt(user_id));
		}
		catch (Exception e) {
			log.Write(e);
			return null;
		}
		if (user != null) {
			return user.getFullname();
		}
    	return null;
    }
}
