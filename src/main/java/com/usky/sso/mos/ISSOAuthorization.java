/**
 * ISSOAuthorization.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package com.usky.sso.mos;

public interface ISSOAuthorization extends java.rmi.Remote {
    public com.usky.sso.mos.UserLoginResultModel login(com.usky.sso.mos.UserLoginModel user) throws java.rmi.RemoteException;
    public com.usky.sso.mos.UserLoginResultModel getLoginInfo(java.lang.String sessionId) throws java.rmi.RemoteException;
    public com.usky.sso.mos.UserIsLoginResultModel isLogin(java.lang.String sessionId) throws java.rmi.RemoteException;
    public com.usky.sso.mos.UserLoginOffResultModel loginOff(com.usky.sso.mos.UserLoginOffModel userLoginOff) throws java.rmi.RemoteException;
}
