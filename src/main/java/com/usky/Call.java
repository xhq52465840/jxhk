package com.usky;

import javax.servlet.Servlet;
import javax.servlet.http.HttpServlet;

import com.usky.service.*;

/**
 * Servlet implementation class Call
 */
public class Call extends BasePage implements Servlet {
	private static final long serialVersionUID = 1L;
    
    /**
     * @see HttpServlet#HttpServlet()
     */
    public Call() {
        super();

    }

    @Override
	protected void DefineService(){
		log.WriteLine(getClass().getSimpleName() + "服务列表：");
		AddService("Test", new com.usky.service.Test(), false);
		
		AddService("Submit", new Submit());
		AddService("GetWaitList", new GetWaitList());
		AddService("GetTemplateList", new GetTemplateList());
		AddService("Operate", new Operate());
		AddService("GetData", new GetData());
		AddService("SaveData", new SaveData());
		AddService("Suspend", new Suspend());
		AddService("Resume", new Resume());
		AddService("GetLog", new GetLog());
		AddService("GetActivityStatusLog", new GetActivityStatusLog());
		AddService("GetApplyList", new GetApplyList());
		AddService("GetApprovedBy", new GetApprovedBy());
		AddService("GetInstanceList", new GetInstanceList());
		AddService("GetInstanceDetail", new GetInstanceDetail());
	}
}
