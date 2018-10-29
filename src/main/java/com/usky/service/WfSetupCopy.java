package com.usky.service;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;

public class WfSetupCopy extends WfService {
	@Override
	public String GetDescribe(){
		return "工作流设置数据复制";
	}

	@Override
    protected void DefineParams()
    {
		AddParams("user_id", "用户id", true);
		AddParams("wsd_id", "工作流设置数据id", true);
		AddParams("name", "工作流设置数据名");
		AddParams("description", "工作流设置设局描述");
    }
	
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
		String user_id = GetParam("user_id");
		String id = GetParam("wsd_id");
		String name = GetParam("name");
		String desc = GetParam("description");
		
		String sql = "insert into " + WfMng.db_name + "wf_setup_data(wsd_id,name,description,active,dft,data,modify_by,remark,last_update) select "
				+ dc.GetSeqNextValue("id_seq") + ","
				+ "'" + dc.FormatString(name) + "',"
				+ "'" + dc.FormatString(desc) + "',"
				+ "'Y',"
				+ "'N',"
				+ "data,"
				+ "'" + dc.FormatString(user_id) + "',"
				+ "concat('Copy from ', wsd_id),"
				+ dc.GetSysdate() + " from "
				+ WfMng.db_name + "wf_setup_data "
				+ "where wsd_id = " + id
				;
		dc.BeginTrans();
		int ect = dc.Execute(sql);
		if (ect < 0) {
			SetErrorMsg(dc);
			dc.Rollback();
			return false;
		}
		if (ect == 0) {
			SetErrorMsg("工作流设置数据id[" + id + "]不存在");
			dc.Rollback();
			return false;
		}
		String new_id = dc.GetSequence("id_seq");
		if (!CopyTag(dc, "wf_setup_data", id, "wf_setup_data", new_id)) {
			dc.Rollback();
			return false;
		}
		dc.Commit();
		
		mResponseData.put("new_id", new_id);

		return true;
	}
}
