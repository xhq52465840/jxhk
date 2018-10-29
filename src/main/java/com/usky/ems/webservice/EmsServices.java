/**
 * EmsServices.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package com.usky.ems.webservice;

public interface EmsServices extends java.rmi.Remote {
    public java.lang.String getUserInfo(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password) throws java.rmi.RemoteException;
    public java.lang.String getSmsBalance(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password) throws java.rmi.RemoteException;
    public java.lang.String sendSMS(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password, java.lang.String smsId, java.lang.String subPort, java.lang.String content, java.lang.String mobiles, java.lang.String sendTime) throws java.rmi.RemoteException;
    public java.lang.String batchSingleSendSMS(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password, java.lang.String[] batchSmsId, java.lang.String subPort, java.lang.String[] batchContent, java.lang.String[] batchMobiles, java.lang.String sendTime) throws java.rmi.RemoteException;
    public java.lang.String getSmsReport(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password) throws java.rmi.RemoteException;
    public java.lang.String getSmsMo(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password) throws java.rmi.RemoteException;
    public java.lang.String getSmsFiltrates(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password, java.lang.String content) throws java.rmi.RemoteException;
}
