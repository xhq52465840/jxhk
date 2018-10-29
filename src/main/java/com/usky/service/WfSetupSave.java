package com.usky.service;

import java.sql.ResultSet;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;

public class WfSetupSave extends WfService {
	@Override
	public String GetDescribe(){
		return "保存工作流设置数据";
	}

	@Override
    protected void DefineParams()
    {
		AddParams("user_id", "用户id", true);
		AddParams("wsd_id", "工作流设置数据id，为空时表示新增，不为空时表示修改");
		AddParams("name", "工作流设置数据名");
		AddParams("description", "工作流设置设局描述");
		AddParams("active", "是否启用，缺省为Y", false, "Y,N");
		AddParams("dft", "是否缺省工作流，缺省为N", false, "Y,N");
		AddParams("tag", "标签，标签包括标签名和标签值，标签名和标签值间有冒号分隔，多个标签间用逗号分隔，如：tag1:value1,tag2,tag3:value3");
		AddParams("data", "json格式的工作流设置数据");
		AddParams("remark", "备注");
    }
	
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
		String user_id = GetParam("user_id");
		String id = GetParam("wsd_id");
		String name = GetParam("name");
		String desc = GetParam("description");
		String active = GetParam("active", "Y");
		String dft = GetParam("dft", "N");
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
			sql = "insert into " + WfMng.db_name + "wf_setup_data(wsd_id,name,description,active,dft,data,remark,modify_by,last_update) values("
					+ dc.GetSeqNextValue("id_seq") + ","
					+ "'" + dc.FormatString(name) + "',"
					+ "'" + dc.FormatString(desc) + "',"
					+ "'" + active + "',"
					+ "'" + dft + "',"
					+ (dc.IsOracle() ? "empty_clob()," : "'" + dc.FormatString(data) + "',")
					+ "'" + dc.FormatString(remark) + "',"
					+ "'" + dc.FormatString(user_id) + "',"
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
			sql = "update " + WfMng.db_name + "wf_setup_data set "
					+ (Utility.IsEmpty(name) ? "" : "name = '" + dc.FormatString(name) + "',")
					+ (Utility.IsEmpty(desc) ? "" : "description = '" + dc.FormatString(desc) + "',")
					+ (Utility.IsEmpty(active) ? "" : "active = '" + active + "',")
					+ (Utility.IsEmpty(dft) ? "" : "dft = '" + dft + "',")
					+ (Utility.IsEmpty(data) ? "" : "data = " + (dc.IsOracle() ? "empty_clob()," : "'" + dc.FormatString(data) + "',"))
					+ (Utility.IsEmpty(remark) ? "" : "remark = '" + dc.FormatString(remark) + "',")
					+ "modify_by = '" + dc.FormatString(user_id) + "',"
					+ "last_update = " + dc.GetSysdate()
					+ " where wsd_id = " + id
					;
			ect = dc.Execute(sql);
			if (ect < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}
			if (ect == 0) {
				SetErrorMsg("工作流设置数据" + id + "不存在");
				dc.Rollback();
				return false;
			}
		}
		
		if ("Y".equals(dft)) {
			sql = "update " + WfMng.db_name + "wf_setup_data set dft = 'N', last_update = " + dc.GetSysdate() + " where wsd_id = " + id;
			if (dc.Execute(sql) < 0) {
				SetErrorMsg(dc);
				dc.Rollback();
				return false;
			}
		}
		
        if (dc.IsOracle() && !Utility.IsEmpty(data)) {
        	sql = "select wsd_id,data from " + WfMng.db_name + "wf_setup_data where wsd_id = " + id;
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
        
        if (!InsertTag(dc, tag, "wf_setup_data", id)) {
        	dc.Rollback();
        	return false;
        }
		
		dc.Commit();
		mResponseData.put("id", id);
		
		return true;
	}
}
