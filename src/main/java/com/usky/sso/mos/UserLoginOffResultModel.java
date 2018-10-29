/**
 * UserLoginOffResultModel.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package com.usky.sso.mos;

public class UserLoginOffResultModel  extends com.usky.sso.mos.BaseResultModel  implements java.io.Serializable {
    private java.lang.Boolean isLoginOff;

    public UserLoginOffResultModel() {
    }

    public UserLoginOffResultModel(
           com.usky.sso.mos.ErrorCode erroCode,
           java.lang.String message,
           java.lang.Boolean isLoginOff) {
        super(
            erroCode,
            message);
        this.isLoginOff = isLoginOff;
    }


    /**
     * Gets the isLoginOff value for this UserLoginOffResultModel.
     * 
     * @return isLoginOff
     */
    public java.lang.Boolean getIsLoginOff() {
        return isLoginOff;
    }


    /**
     * Sets the isLoginOff value for this UserLoginOffResultModel.
     * 
     * @param isLoginOff
     */
    public void setIsLoginOff(java.lang.Boolean isLoginOff) {
        this.isLoginOff = isLoginOff;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof UserLoginOffResultModel)) return false;
        UserLoginOffResultModel other = (UserLoginOffResultModel) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = super.equals(obj) && 
            ((this.isLoginOff==null && other.getIsLoginOff()==null) || 
             (this.isLoginOff!=null &&
              this.isLoginOff.equals(other.getIsLoginOff())));
        __equalsCalc = null;
        return _equals;
    }

    private boolean __hashCodeCalc = false;
    public synchronized int hashCode() {
        if (__hashCodeCalc) {
            return 0;
        }
        __hashCodeCalc = true;
        int _hashCode = super.hashCode();
        if (getIsLoginOff() != null) {
            _hashCode += getIsLoginOff().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(UserLoginOffResultModel.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://schemas.datacontract.org/2004/07/Ceair.Operations.SSO.WCF.Contracts.Model", "UserLoginOffResultModel"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("isLoginOff");
        elemField.setXmlName(new javax.xml.namespace.QName("http://schemas.datacontract.org/2004/07/Ceair.Operations.SSO.WCF.Contracts.Model", "IsLoginOff"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "boolean"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
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
