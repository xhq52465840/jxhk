/**
 * UserLoginModel.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package com.usky.sso.mos;

public class UserLoginModel  implements java.io.Serializable {
    private java.lang.String authorizationAppId;

    private java.lang.String browser;

    private java.lang.String password;

    private java.lang.String userName;

    public UserLoginModel() {
    }

    public UserLoginModel(
           java.lang.String authorizationAppId,
           java.lang.String browser,
           java.lang.String password,
           java.lang.String userName) {
           this.authorizationAppId = authorizationAppId;
           this.browser = browser;
           this.password = password;
           this.userName = userName;
    }


    /**
     * Gets the authorizationAppId value for this UserLoginModel.
     * 
     * @return authorizationAppId
     */
    public java.lang.String getAuthorizationAppId() {
        return authorizationAppId;
    }


    /**
     * Sets the authorizationAppId value for this UserLoginModel.
     * 
     * @param authorizationAppId
     */
    public void setAuthorizationAppId(java.lang.String authorizationAppId) {
        this.authorizationAppId = authorizationAppId;
    }


    /**
     * Gets the browser value for this UserLoginModel.
     * 
     * @return browser
     */
    public java.lang.String getBrowser() {
        return browser;
    }


    /**
     * Sets the browser value for this UserLoginModel.
     * 
     * @param browser
     */
    public void setBrowser(java.lang.String browser) {
        this.browser = browser;
    }


    /**
     * Gets the password value for this UserLoginModel.
     * 
     * @return password
     */
    public java.lang.String getPassword() {
        return password;
    }


    /**
     * Sets the password value for this UserLoginModel.
     * 
     * @param password
     */
    public void setPassword(java.lang.String password) {
        this.password = password;
    }


    /**
     * Gets the userName value for this UserLoginModel.
     * 
     * @return userName
     */
    public java.lang.String getUserName() {
        return userName;
    }


    /**
     * Sets the userName value for this UserLoginModel.
     * 
     * @param userName
     */
    public void setUserName(java.lang.String userName) {
        this.userName = userName;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof UserLoginModel)) return false;
        UserLoginModel other = (UserLoginModel) obj;
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
            ((this.password==null && other.getPassword()==null) || 
             (this.password!=null &&
              this.password.equals(other.getPassword()))) &&
            ((this.userName==null && other.getUserName()==null) || 
             (this.userName!=null &&
              this.userName.equals(other.getUserName())));
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
        if (getPassword() != null) {
            _hashCode += getPassword().hashCode();
        }
        if (getUserName() != null) {
            _hashCode += getUserName().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(UserLoginModel.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://schemas.datacontract.org/2004/07/Ceair.Operations.SSO.WCF.Contracts.Model", "UserLoginModel"));
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
        elemField.setFieldName("password");
        elemField.setXmlName(new javax.xml.namespace.QName("http://schemas.datacontract.org/2004/07/Ceair.Operations.SSO.WCF.Contracts.Model", "Password"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(true);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("userName");
        elemField.setXmlName(new javax.xml.namespace.QName("http://schemas.datacontract.org/2004/07/Ceair.Operations.SSO.WCF.Contracts.Model", "UserName"));
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
