package com.usky.sso.mos;

public class ISSOAuthorizationProxy implements com.usky.sso.mos.ISSOAuthorization {
  private String _endpoint = null;
  private com.usky.sso.mos.ISSOAuthorization iSSOAuthorization = null;
  
  public ISSOAuthorizationProxy() {
    _initISSOAuthorizationProxy();
  }
  
  public ISSOAuthorizationProxy(String endpoint) {
    _endpoint = endpoint;
    _initISSOAuthorizationProxy();
  }
  
  private void _initISSOAuthorizationProxy() {
    try {
      iSSOAuthorization = (new com.usky.sso.mos.SSOAuthorizationLocator()).getBasicHttpBinding_ISSOAuthorization();
      if (iSSOAuthorization != null) {
        if (_endpoint != null)
          ((javax.xml.rpc.Stub)iSSOAuthorization)._setProperty("javax.xml.rpc.service.endpoint.address", _endpoint);
        else
          _endpoint = (String)((javax.xml.rpc.Stub)iSSOAuthorization)._getProperty("javax.xml.rpc.service.endpoint.address");
      }
      
    }
    catch (javax.xml.rpc.ServiceException serviceException) {}
  }
  
  public String getEndpoint() {
    return _endpoint;
  }
  
  public void setEndpoint(String endpoint) {
    _endpoint = endpoint;
    if (iSSOAuthorization != null)
      ((javax.xml.rpc.Stub)iSSOAuthorization)._setProperty("javax.xml.rpc.service.endpoint.address", _endpoint);
    
  }
  
  public com.usky.sso.mos.ISSOAuthorization getISSOAuthorization() {
    if (iSSOAuthorization == null)
      _initISSOAuthorizationProxy();
    return iSSOAuthorization;
  }
  
  public com.usky.sso.mos.UserLoginResultModel login(com.usky.sso.mos.UserLoginModel user) throws java.rmi.RemoteException{
    if (iSSOAuthorization == null)
      _initISSOAuthorizationProxy();
    return iSSOAuthorization.login(user);
  }
  
  public com.usky.sso.mos.UserLoginResultModel getLoginInfo(java.lang.String sessionId) throws java.rmi.RemoteException{
    if (iSSOAuthorization == null)
      _initISSOAuthorizationProxy();
    return iSSOAuthorization.getLoginInfo(sessionId);
  }
  
  public com.usky.sso.mos.UserIsLoginResultModel isLogin(java.lang.String sessionId) throws java.rmi.RemoteException{
    if (iSSOAuthorization == null)
      _initISSOAuthorizationProxy();
    return iSSOAuthorization.isLogin(sessionId);
  }
  
  public com.usky.sso.mos.UserLoginOffResultModel loginOff(com.usky.sso.mos.UserLoginOffModel userLoginOff) throws java.rmi.RemoteException{
    if (iSSOAuthorization == null)
      _initISSOAuthorizationProxy();
    return iSSOAuthorization.loginOff(userLoginOff);
  }
  
  
}