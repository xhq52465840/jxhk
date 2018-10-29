
package com.junyao.sms.service;

/**
 * Please modify this class to meet your needs
 * This class is not complete
 */

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import javax.xml.namespace.QName;
import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.ws.RequestWrapper;
import javax.xml.ws.ResponseWrapper;

/**
 * This class was generated by Apache CXF 3.1.8
 * 2016-11-04T14:39:44.453+08:00
 * Generated source version: 3.1.8
 * 
 */
public final class JwSmsService_JwSmsServiceImplPort_Client {

    private static final QName SERVICE_NAME = new QName("http://service.sms.junyao.com/", "JwSmsServiceImplService");

    private JwSmsService_JwSmsServiceImplPort_Client() {
    }

    public static void main(String args[]) throws java.lang.Exception {
        URL wsdlURL = JwSmsServiceImplService.WSDL_LOCATION;
        if (args.length > 0 && args[0] != null && !"".equals(args[0])) { 
            File wsdlFile = new File(args[0]);
            try {
                if (wsdlFile.exists()) {
                    wsdlURL = wsdlFile.toURI().toURL();
                } else {
                    wsdlURL = new URL(args[0]);
                }
            } catch (MalformedURLException e) {
                e.printStackTrace();
            }
        }
      
        JwSmsServiceImplService ss = new JwSmsServiceImplService(wsdlURL, SERVICE_NAME);
        JwSmsService port = ss.getJwSmsServiceImplPort();  
        
        {
        System.out.println("Invoking getDefectInfo...");
        com.junyao.sms.entity.req.PlaneDDQuery _getDefectInfo_params = new com.junyao.sms.entity.req.PlaneDDQuery();
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectInfo_paramsAcno = null;
        _getDefectInfo_params.setAcno(_getDefectInfo_paramsAcno);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectInfo_paramsDateBegin = null;
        _getDefectInfo_params.setDateBegin(_getDefectInfo_paramsDateBegin);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectInfo_paramsDateEnd = null;
        _getDefectInfo_params.setDateEnd(_getDefectInfo_paramsDateEnd);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectInfo_paramsDdNo = null;
        _getDefectInfo_params.setDdNo(_getDefectInfo_paramsDdNo);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectInfo_paramsPassword = null;
        _getDefectInfo_params.setPassword(_getDefectInfo_paramsPassword);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectInfo_paramsStatus = null;
        _getDefectInfo_params.setStatus(_getDefectInfo_paramsStatus);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectInfo_paramsToken = null;
        _getDefectInfo_params.setToken(_getDefectInfo_paramsToken);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectInfo_paramsUsername = null;
        _getDefectInfo_params.setUsername(_getDefectInfo_paramsUsername);
        java.lang.String _getDefectInfo__return = port.getDefectInfo(_getDefectInfo_params);
        System.out.println("getDefectInfo.result=" + _getDefectInfo__return);


        }
        {
        System.out.println("Invoking getDefectRepairInfo...");
        com.junyao.sms.entity.req.PlanFcQuery _getDefectRepairInfo_params = new com.junyao.sms.entity.req.PlanFcQuery();
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectRepairInfo_paramsAcno = null;
        _getDefectRepairInfo_params.setAcno(_getDefectRepairInfo_paramsAcno);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectRepairInfo_paramsDateBegin = null;
        _getDefectRepairInfo_params.setDateBegin(_getDefectRepairInfo_paramsDateBegin);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectRepairInfo_paramsDateEnd = null;
        _getDefectRepairInfo_params.setDateEnd(_getDefectRepairInfo_paramsDateEnd);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectRepairInfo_paramsFcNo = null;
        _getDefectRepairInfo_params.setFcNo(_getDefectRepairInfo_paramsFcNo);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectRepairInfo_paramsPassword = null;
        _getDefectRepairInfo_params.setPassword(_getDefectRepairInfo_paramsPassword);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectRepairInfo_paramsStatus = null;
        _getDefectRepairInfo_params.setStatus(_getDefectRepairInfo_paramsStatus);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectRepairInfo_paramsToken = null;
        _getDefectRepairInfo_params.setToken(_getDefectRepairInfo_paramsToken);
        javax.xml.bind.JAXBElement<java.lang.String> _getDefectRepairInfo_paramsUsername = null;
        _getDefectRepairInfo_params.setUsername(_getDefectRepairInfo_paramsUsername);
        java.lang.String _getDefectRepairInfo__return = port.getDefectRepairInfo(_getDefectRepairInfo_params);
        System.out.println("getDefectRepairInfo.result=" + _getDefectRepairInfo__return);


        }
        {
        System.out.println("Invoking getPlaneInfo...");
        com.junyao.sms.entity.req.PlanStaticQuery _getPlaneInfo_params = new com.junyao.sms.entity.req.PlanStaticQuery();
        javax.xml.bind.JAXBElement<java.lang.String> _getPlaneInfo_paramsPassword = null;
        _getPlaneInfo_params.setPassword(_getPlaneInfo_paramsPassword);
        javax.xml.bind.JAXBElement<java.lang.String> _getPlaneInfo_paramsTailNo = null;
        _getPlaneInfo_params.setTailNo(_getPlaneInfo_paramsTailNo);
        javax.xml.bind.JAXBElement<java.lang.String> _getPlaneInfo_paramsToken = null;
        _getPlaneInfo_params.setToken(_getPlaneInfo_paramsToken);
        javax.xml.bind.JAXBElement<java.lang.String> _getPlaneInfo_paramsUsername = null;
        _getPlaneInfo_params.setUsername(_getPlaneInfo_paramsUsername);
        java.lang.String _getPlaneInfo__return = port.getPlaneInfo(_getPlaneInfo_params);
        System.out.println("getPlaneInfo.result=" + _getPlaneInfo__return);


        }
        {
        System.out.println("Invoking getPlaneDDMoniInfo...");
        com.junyao.sms.entity.req.PlanDDMoniQuery _getPlaneDDMoniInfo_params = new com.junyao.sms.entity.req.PlanDDMoniQuery();
        javax.xml.bind.JAXBElement<java.lang.String> _getPlaneDDMoniInfo_paramsAcno = null;
        _getPlaneDDMoniInfo_params.setAcno(_getPlaneDDMoniInfo_paramsAcno);
        javax.xml.bind.JAXBElement<java.lang.String> _getPlaneDDMoniInfo_paramsReportBegin = null;
        _getPlaneDDMoniInfo_params.setReportBegin(_getPlaneDDMoniInfo_paramsReportBegin);
        javax.xml.bind.JAXBElement<java.lang.String> _getPlaneDDMoniInfo_paramsReportEnd = null;
        _getPlaneDDMoniInfo_params.setReportEnd(_getPlaneDDMoniInfo_paramsReportEnd);
        java.lang.String _getPlaneDDMoniInfo__return = port.getPlaneDDMoniInfo(_getPlaneDDMoniInfo_params);
        System.out.println("getPlaneDDMoniInfo.result=" + _getPlaneDDMoniInfo__return);


        }

        System.exit(0);
    }

}