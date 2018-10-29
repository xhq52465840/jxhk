package com.usky.service;

import java.sql.ResultSet;

import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;

public class WfFunctionSave extends WfService {
	@Override
	public String GetDescribe(){
		return "保存工作流功能信息";
	}

	@Override
    protected void DefineParams()
    {
		AddParams("user_id", "用户id", true);
		AddParams("id", "工作流功能信息id，为空时表示新增，不为空时表示修改");
		AddParams("name", "工作流功能信息名");
		AddParams("description", "工作流功能信息描述");
		AddParams("type", "工作流功能信息类型");
		AddParams("model", "model");
		AddParams("active", "是否启用，缺省为Y", false, "Y,N");
		AddParams("tag", "标签，标签包括标签名和标签值，标签名和标签值间有冒号分隔，多个标签间用逗号分隔，如：tag1:value1,tag2,tag3:value3");
		AddParams("data", "工作流功能信息");
		AddParams("remark", "备注");
    }
	
	@SuppressWarnings("unused")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
		String user_id = GetParam("user_id");
		String id = GetParam("id");
		String name = GetParam("name");
		String desc = GetParam("description");
		String type = GetParam("type");
		String model = GetParam("model");
		String active = GetParam("active", "Y");
		String tag = GetParam("tag");
		String data = GetParam("data");
		String remark = GetParam("remark");
		
		String sql;
		int ect;
		
		dc.BeginTrans();
		if (Utility.IsEmpty(id)) {
			if (Utility.IsEmpty(name)) {
				SetErrorMsg("name参数不能为空");
				dc.Rollback();
				return false;
			}
			sql = "insert into t_wf_function(id,name,description,active,type,umodule,data,remark,last_update) values("
					+ dc.GetSeqNextValue("id_seq") + ","
					+ "'" + dc.FormatString(name) + "',"
					+ "'" + dc.FormatString(desc) + "',"
					+ "'" + active + "',"
					+ "'" + dc.FormatString(type) + "',"
					+ "'" + dc.FormatString(model) + "',"
					+ (dc.IsOracle() ? "empty_clob()," : "'" + dc.FormatString(data) + "',")
					+ "'" + dc.FormatString(remark) + "',"
					+ dc.GetSysdate() + ")"
					;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}
	        id = dc.GetSequence("id_seq");
	        if (Utility.IsEmpty(id)) {
	        	dc.Rollback();
	        	return false;
	        }
		}
		else {
			sql = "update t_wf_function set "
					+ (Utility.IsEmpty(name) ? "" : "name = '" + dc.FormatString(name) + "',")
					+ (Utility.IsEmpty(desc) ? "" : "description = '" + dc.FormatString(desc) + "',")
					+ (Utility.IsEmpty(active) ? "" : "active = '" + active + "',")
					+ (Utility.IsEmpty(type) ? "" : "type = '" + dc.FormatString(type) + "',")
					+ (Utility.IsEmpty(model) ? "" : "umodule = '" + dc.FormatString(model) + "',")
					+ (Utility.IsEmpty(data) ? "" : "data = " + (dc.IsOracle() ? "empty_clob()," : "'" + dc.FormatString(data) + "',"))
					+ (Utility.IsEmpty(remark) ? "" : "remark = '" + dc.FormatString(remark) + "',")
					+ "last_update = " + dc.GetSysdate()
					+ " where id = " + id
					;
			ect = dc.Execute(sql);
			if (ect < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}
			if (ect == 0) {
				SetErrorMsg("工作流功能信息" + id + "不存在");
				dc.Rollback();
				return false;
			}
		}
		
        if (dc.IsOracle() && !Utility.IsEmpty(data)) {
        	sql = "select wfi_id,data from t_wf_function where id = " + id;
        	ResultSet rs_data = dc.ExecuteQuery(sql);
        	if (rs_data == null) {
        		SetErrorMsg(dc);
        		dc.Rollback();
        		return false;
        	}
        	if (!rs_data.next()) {
        		SetErrorMsg("内部错误： 无法找到id " + id);
        		dc.Rollback();
        		return false;
        	}
        	if (!dc.UpdateClob(rs_data, "data", data)) {
        		SetErrorMsg(dc);
        		dc.Rollback();
        		return false;
        	}
        }
        
        if (!InsertTag(dc, tag, "t_wf_function", id)) {
        	dc.Rollback();
        	return false;
        }
		
		dc.Commit();
		mResponseData.put("id", id);
		
		return true;
	}
}
