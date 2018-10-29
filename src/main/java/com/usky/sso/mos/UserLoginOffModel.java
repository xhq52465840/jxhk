/**
 * UserLoginOffModel.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package com.usky.sso.mos;

public class UserLoginOffModel  implements java.io.Serializable {
    private java.lang.String authorizationAppId;

    private java.lang.String browser;

    private java.lang.String sessionId;

    public UserLoginOffModel() {
    }

    public UserLoginOffModel(
           java.lang.String authorizationAppId,
           java.lang.String browser,
           java.lang.String sessionId) {
           this.authorizationAppId = authorizationAppId;
           this.browser = browser;
           this.sessionId = sessionId;
    }


    /**
     * Gets the authorizationAppId value for this UserLoginOffModel.
     * 
     * @return authorizationAppId
     */
    public java.lang.String getAuthorizationAppId() {
        return authorizationAppId;
    }


    /**
     * Sets the authorizationAppId value for this UserLoginOffModel.
     * 
     * @param authorizationAppId
     */
    public void setAuthorizationAppId(java.lang.String authorizationAppId) {
        this.authorizationAppId = authorizationAppId;
    }


    /**
     * Gets the browser value for this UserLoginOffModel.
     * 
     * @return browser
     */
    public java.lang.String getBrowser() {
        return browser;
    }


    /**
     * Sets the browser value for this UserLoginOffModel.
     * 
     * @param browser
     */
    public void setBrowser(java.lang.String browser) {
        this.browser = browser;
    }


    /**
     * Gets the sessionId value for this UserLoginOffModel.
     * 
     * @return sessionId
     */
    public java.lang.String getSessionId() {
        return sessionId;
    }


    /**
     * Sets the sessionId value for this UserLoginOffModel.
     * 
     * @param sessionId
     */
    public void setSessionId(java.lang.String sessionId) {
        this.sessionId = sessionId;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof UserLoginOffModel)) return false;
        UserLoginOffModel other = (UserLoginOffModel) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            ((this.authorizationAppId==null && other.getAuthorizationAppId()==null) || 
             (this.authorizationAppId!=null &&
              this.authorizationAppId.equals(other.getAuthorizationAppId()))) &&
            ((this.browser==null && other.getBrowser()==null) || 
             (this.browser!=null &&
              this.browser.equals(other.getBrowser()))) &&
            ((this.sessionId==null && other.getSessionId()==null) || 
             (this.sessionId!=null &&
              this.sessionId.equals(other.getSessionId())));
        __equalsCalc = null;
        return _equals;
    }

    private boolean __hashCodeCalc = false;
    public synchronized int hashCode() {
        if (__hashCodeCalc) {
            return 0;
        }
        __hashCodeCalc = true;
        int _hashCode = 1;
        if (getAuthorizationAppId() != null) {
            _hashCode += getAuthorizationAppId().hashCode();
        }
        if (getBrowser() != null) {
            _hashCode += getBrowser().hashCode();
        }
        if (getSessionId() != null) {
            _hashCode += getSessionId().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(UserLoginOffModel.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://schemas.datacontract.org/2004/07/Ceair.Operations.SSO.WCF.Contracts.Model", "UserLoginOffModel"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("authorizationAppId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://schemas.datacontract.org/2004/07/Ceair.Operations.SSO.WCF.Contracts.Model", "AuthorizationAppId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("browser");
        elemField.setXmlName(new javax.xml.namespace.QName("http://schemas.datacontract.org/2004/07/Ceair.Operations.SSO.WCF.Contracts.Model", "Browser"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("sessionId");
        elemField.setXmlName(new javax.xml.namespace.QName("http://schemas.datacontract.org/2004/07/Ceair.Operations.SSO.WCF.Contracts.Model", "SessionId"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
    }

    /**
     * Return type metadata object
     */
    public static org.apache.axis.description.TypeDesc getTypeDesc() {
        return typeDesc;
    }

    /**
     * Get Custom Serializer
     */
    public static org.apache.axis.encoding.Serializer getSerializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new  org.apache.axis.encoding.ser.BeanSerializer(
            _javaType, _xmlType, typeDesc);
    }

    /**
     * Get Custom Deserializer
     */
    public static org.apache.axis.encoding.Deserializer getDeserializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new  org.apache.axis.encoding.ser.BeanDeserializer(
            _javaType, _xmlType, typeDesc);
    }

}
