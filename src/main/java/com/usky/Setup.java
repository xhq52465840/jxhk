package com.usky;

import javax.servlet.Servlet;

import com.usky.service.*;

/**
 * Servlet implementation class Setup
 */
public class Setup extends BasePage implements Servlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see BasePage#BasePage()
     */
    public Setup() {
        super();
    }

    @Override
	protected void DefineService(){
		log.WriteLine(getClass().getSimpleName() + "服务列表：");
		//AddService("Test", new Test());
		AddService("List", new WfSetupList());
		AddService("Save", new WfSetupSave());
		AddService("Delete", new WfSetupDelete());
		AddService("Copy", new WfSetupCopy());
		AddService("Release", new WfSetupRelease());
		AddService("Discard", new WfSetupDiscard());
		AddService("FunctionList", new WfFunctionList());
		AddService("FunctionSave", new WfFunctionSave());
		AddService("FunctionDelete", new WfFunctionDelete());
		AddService("PathList", new WfPathList());
	}
}
