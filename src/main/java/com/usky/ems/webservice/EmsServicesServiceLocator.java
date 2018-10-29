/**
 * EmsServicesServiceLocator.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package com.usky.ems.webservice;

public class EmsServicesServiceLocator extends org.apache.axis.client.Service implements com.usky.ems.webservice.EmsServicesService {

    public EmsServicesServiceLocator() {
    }


    public EmsServicesServiceLocator(org.apache.axis.EngineConfiguration config) {
        super(config);
    }

    public EmsServicesServiceLocator(java.lang.String wsdlLoc, javax.xml.namespace.QName sName) throws javax.xml.rpc.ServiceException {
        super(wsdlLoc, sName);
    }

    // Use to get a proxy class for emsServices
    private java.lang.String emsServices_address = "http://172.28.34.23:9080/services/emsServices";

    public java.lang.String getemsServicesAddress() {
        return emsServices_address;
    }

    // The WSDD service name defaults to the port name.
    private java.lang.String emsServicesWSDDServiceName = "emsServices";

    public java.lang.String getemsServicesWSDDServiceName() {
        return emsServicesWSDDServiceName;
    }

    public void setemsServicesWSDDServiceName(java.lang.String name) {
        emsServicesWSDDServiceName = name;
    }

    public com.usky.ems.webservice.EmsServices getemsServices() throws javax.xml.rpc.ServiceException {
       java.net.URL endpoint;
        try {
            endpoint = new java.net.URL(emsServices_address);
        }
        catch (java.net.MalformedURLException e) {
            throw new javax.xml.rpc.ServiceException(e);
        }
        return getemsServices(endpoint);
    }

    public com.usky.ems.webservice.EmsServices getemsServices(java.net.URL portAddress) throws javax.xml.rpc.ServiceException {
        try {
            com.usky.ems.webservice.EmsServicesSoapBindingStub _stub = new com.usky.ems.webservice.EmsServicesSoapBindingStub(portAddress, this);
            _stub.setPortName(getemsServicesWSDDServiceName());
            return _stub;
        }
        catch (org.apache.axis.AxisFault e) {
            return null;
        }
    }

    public void setemsServicesEndpointAddress(java.lang.String address) {
        emsServices_address = address;
    }

    /**
     * For the given interface, get the stub implementation.
     * If this service has no port for the given interface,
     * then ServiceException is thrown.
     */
    public java.rmi.Remote getPort(Class serviceEndpointInterface) throws javax.xml.rpc.ServiceException {
        try {
            if (com.usky.ems.webservice.EmsServices.class.isAssignableFrom(serviceEndpointInterface)) {
                com.usky.ems.webservice.EmsServicesSoapBindingStub _stub = new com.usky.ems.webservice.EmsServicesSoapBindingStub(new java.net.URL(emsServices_address), this);
                _stub.setPortName(getemsServicesWSDDServiceName());
                return _stub;
            }
        }
        catch (java.lang.Throwable t) {
            throw new javax.xml.rpc.ServiceException(t);
        }
        throw new javax.xml.rpc.ServiceException("There is no stub implementation for the interface:  " + (serviceEndpointInterface == null ? "null" : serviceEndpointInterface.getName()));
    }

    /**
     * For the given interface, get the stub implementation.
     * If this service has no port for the given interface,
     * then ServiceException is thrown.
     */
    public java.rmi.Remote getPort(javax.xml.namespace.QName portName, Class serviceEndpointInterface) throws javax.xml.rpc.ServiceException {
        if (portName == null) {
            return getPort(serviceEndpointInterface);
        }
        java.lang.String inputPortName = portName.getLocalPart();
        if ("emsServices".equals(inputPortName)) {
            return getemsServices();
        }
        else  {
            java.rmi.Remote _stub = getPort(serviceEndpointInterface);
            ((org.apache.axis.client.Stub) _stub).setPortName(portName);
            return _stub;
        }
    }

    public javax.xml.namespace.QName getServiceName() {
        return new javax.xml.namespace.QName(emsServices_address, "EmsServicesService");
    }

    private java.util.HashSet ports = null;

    public java.util.Iterator getPorts() {
        if (ports == null) {
            ports = new java.util.HashSet();
            ports.add(new javax.xml.namespace.QName(emsServices_address, "emsServices"));
        }
        return ports.iterator();
    }

    /**
    * Set the endpoint address for the specified port name.
    */
    public void setEndpointAddress(java.lang.String portName, java.lang.String address) throws javax.xml.rpc.ServiceException {
        
if ("emsServices".equals(portName)) {
            setemsServicesEndpointAddress(address);
        }
        else 
{ // Unknown Port Name
            throw new javax.xml.rpc.ServiceException(" Cannot set Endpoint Address for Unknown Port" + portName);
        }
    }

    /**
    * Set the endpoint address for the specified port name.
    */
    public void setEndpointAddress(javax.xml.namespace.QName portName, java.lang.String address) throws javax.xml.rpc.ServiceException {
        setEndpointAddress(portName.getLocalPart(), address);
    }

}
