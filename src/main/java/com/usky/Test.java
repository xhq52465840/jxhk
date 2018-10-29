package com.usky;


import javax.servlet.Servlet;

/**
 * Servlet implementation class Test
 */
public class Test extends BasePage implements Servlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see BasePage#BasePage()
     */
    public Test() {
        super();
        // TODO Auto-generated constructor stub
    }

    @Override
	protected void DefineService(){
		log.WriteLine(getClass().getSimpleName() + "服务列表：");
		AddService("Test", new com.usky.service.Test());
    }    
}
