package com.juneyaoair.sms;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;
import javax.xml.bind.annotation.XmlSeeAlso;
import javax.xml.ws.RequestWrapper;
import javax.xml.ws.ResponseWrapper;

/**
 * This class was generated by Apache CXF 2.7.18
 * 2016-08-25T15:12:04.795+08:00
 * Generated source version: 2.7.18
 * 
 */
@WebService(targetNamespace = "http://tempuri.org/", name = "SmServiceSoap")
@XmlSeeAlso({ObjectFactory.class})
public interface SmServiceSoap {

    @RequestWrapper(localName = "ReceiveSm", targetNamespace = "http://tempuri.org/", className = "com.juneyaoair.sms.ReceiveSm")
    @WebMethod(operationName = "ReceiveSm", action = "http://tempuri.org/ReceiveSm")
    @ResponseWrapper(localName = "ReceiveSmResponse", targetNamespace = "http://tempuri.org/", className = "com.juneyaoair.sms.ReceiveSmResponse")
    public void receiveSm(
        @WebParam(name = "mobile", targetNamespace = "http://tempuri.org/")
        java.lang.String mobile,
        @WebParam(name = "userName", targetNamespace = "http://tempuri.org/")
        java.lang.String userName,
        @WebParam(name = "userPwd", targetNamespace = "http://tempuri.org/")
        java.lang.String userPwd,
        @WebParam(mode = WebParam.Mode.OUT, name = "ReceiveSmResult", targetNamespace = "http://tempuri.org/")
        javax.xml.ws.Holder<ArrayOfSmsMessageRev> receiveSmResult,
        @WebParam(mode = WebParam.Mode.OUT, name = "flag", targetNamespace = "http://tempuri.org/")
        javax.xml.ws.Holder<java.lang.Integer> flag
    );

    @WebResult(name = "ReceiveSmExtResult", targetNamespace = "http://tempuri.org/")
    @RequestWrapper(localName = "ReceiveSmExt", targetNamespace = "http://tempuri.org/", className = "com.juneyaoair.sms.ReceiveSmExt")
    @WebMethod(operationName = "ReceiveSmExt", action = "http://tempuri.org/ReceiveSmExt")
    @ResponseWrapper(localName = "ReceiveSmExtResponse", targetNamespace = "http://tempuri.org/", className = "com.juneyaoair.sms.ReceiveSmExtResponse")
    public com.juneyaoair.sms.ArrayOfSmsMessageRev receiveSmExt(
        @WebParam(name = "mobile", targetNamespace = "http://tempuri.org/")
        java.lang.String mobile,
        @WebParam(name = "userName", targetNamespace = "http://tempuri.org/")
        java.lang.String userName,
        @WebParam(name = "userPwd", targetNamespace = "http://tempuri.org/")
        java.lang.String userPwd
    );

    @WebResult(name = "SendSmExtResult", targetNamespace = "http://tempuri.org/")
    @RequestWrapper(localName = "SendSmExt", targetNamespace = "http://tempuri.org/", className = "com.juneyaoair.sms.SendSmExt")
    @WebMethod(operationName = "SendSmExt", action = "http://tempuri.org/SendSmExt")
    @ResponseWrapper(localName = "SendSmExtResponse", targetNamespace = "http://tempuri.org/", className = "com.juneyaoair.sms.SendSmExtResponse")
    public int sendSmExt(
        @WebParam(name = "smContent", targetNamespace = "http://tempuri.org/")
        java.lang.String smContent,
        @WebParam(name = "mobiles", targetNamespace = "http://tempuri.org/")
        java.lang.String mobiles,
        @WebParam(name = "timingTime", targetNamespace = "http://tempuri.org/")
        java.lang.String timingTime,
        @WebParam(name = "userName", targetNamespace = "http://tempuri.org/")
        java.lang.String userName,
        @WebParam(name = "userPwd", targetNamespace = "http://tempuri.org/")
        java.lang.String userPwd,
        @WebParam(name = "smSign", targetNamespace = "http://tempuri.org/")
        java.lang.String smSign
    );

    @WebResult(name = "SendSmResult", targetNamespace = "http://tempuri.org/")
    @RequestWrapper(localName = "SendSm", targetNamespace = "http://tempuri.org/", className = "com.juneyaoair.sms.SendSm")
    @WebMethod(operationName = "SendSm", action = "http://tempuri.org/SendSm")
    @ResponseWrapper(localName = "SendSmResponse", targetNamespace = "http://tempuri.org/", className = "com.juneyaoair.sms.SendSmResponse")
    public int sendSm(
        @WebParam(name = "smContent", targetNamespace = "http://tempuri.org/")
        java.lang.String smContent,
        @WebParam(name = "mobiles", targetNamespace = "http://tempuri.org/")
        java.lang.String mobiles,
        @WebParam(name = "userName", targetNamespace = "http://tempuri.org/")
        java.lang.String userName,
        @WebParam(name = "userPwd", targetNamespace = "http://tempuri.org/")
        java.lang.String userPwd,
        @WebParam(name = "smSign", targetNamespace = "http://tempuri.org/")
        java.lang.String smSign
    );
}
