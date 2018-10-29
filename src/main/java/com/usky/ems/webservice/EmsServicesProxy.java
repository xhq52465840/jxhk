package com.usky.ems.webservice;

public class EmsServicesProxy implements com.usky.ems.webservice.EmsServices {
  private String _endpoint = null;
  private com.usky.ems.webservice.EmsServices emsServices = null;
  
  public EmsServicesProxy() {
    _initEmsServicesProxy();
  }
  
  public EmsServicesProxy(String endpoint) {
    _endpoint = endpoint;
    _initEmsServicesProxy();
  }
  
  private void _initEmsServicesProxy() {
    try {
      emsServices = (new com.usky.ems.webservice.EmsServicesServiceLocator()).getemsServices();
      if (emsServices != null) {
        if (_endpoint != null)
          ((javax.xml.rpc.Stub)emsServices)._setProperty("javax.xml.rpc.service.endpoint.address", _endpoint);
        else
          _endpoint = (String)((javax.xml.rpc.Stub)emsServices)._getProperty("javax.xml.rpc.service.endpoint.address");
      }
      
    }
    catch (javax.xml.rpc.ServiceException serviceException) {}
  }
  
  public String getEndpoint() {
    return _endpoint;
  }
  
  public void setEndpoint(String endpoint) {
    _endpoint = endpoint;
    if (emsServices != null)
      ((javax.xml.rpc.Stub)emsServices)._setProperty("javax.xml.rpc.service.endpoint.address", _endpoint);
    
  }
  
  public com.usky.ems.webservice.EmsServices getEmsServices() {
    if (emsServices == null)
      _initEmsServicesProxy();
    return emsServices;
  }
  
  public java.lang.String getUserInfo(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password) throws java.rmi.RemoteException{
    if (emsServices == null)
      _initEmsServicesProxy();
    return emsServices.getUserInfo(enterpriseID, loginName, password);
  }
  
  public java.lang.String getSmsBalance(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password) throws java.rmi.RemoteException{
    if (emsServices == null)
      _initEmsServicesProxy();
    return emsServices.getSmsBalance(enterpriseID, loginName, password);
  }
  
  public java.lang.String sendSMS(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password, java.lang.String smsId, java.lang.String subPort, java.lang.String content, java.lang.String mobiles, java.lang.String sendTime) throws java.rmi.RemoteException{
    if (emsServices == null)
      _initEmsServicesProxy();
    return emsServices.sendSMS(enterpriseID, loginName, password, smsId, subPort, content, mobiles, sendTime);
  }
  
  public java.lang.String batchSingleSendSMS(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password, java.lang.String[] batchSmsId, java.lang.String subPort, java.lang.String[] batchContent, java.lang.String[] batchMobiles, java.lang.String sendTime) throws java.rmi.RemoteException{
    if (emsServices == null)
      _initEmsServicesProxy();
    return emsServices.batchSingleSendSMS(enterpriseID, loginName, password, batchSmsId, subPort, batchContent, batchMobiles, sendTime);
  }
  
  public java.lang.String getSmsReport(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password) throws java.rmi.RemoteException{
    if (emsServices == null)
      _initEmsServicesProxy();
    return emsServices.getSmsReport(enterpriseID, loginName, password);
  }
  
  public java.lang.String getSmsMo(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password) throws java.rmi.RemoteException{
    if (emsServices == null)
      _initEmsServicesProxy();
    return emsServices.getSmsMo(enterpriseID, loginName, password);
  }
  
  public java.lang.String getSmsFiltrates(java.lang.String enterpriseID, java.lang.String loginName, java.lang.String password, java.lang.String content) throws java.rmi.RemoteException{
    if (emsServices == null)
      _initEmsServicesProxy();
    return emsServices.getSmsFiltrates(enterpriseID, loginName, password, content);
  }
  
  
}