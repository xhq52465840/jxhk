/**
 * ErrorCode.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package com.usky.sso.mos;

public class ErrorCode implements java.io.Serializable {
    private java.lang.String _value_;
    private static java.util.HashMap _table_ = new java.util.HashMap();

    // Constructor
    protected ErrorCode(java.lang.String value) {
        _value_ = value;
        _table_.put(_value_,this);
    }

    public static final java.lang.String _ServerSuccess = "ServerSuccess";
    public static final java.lang.String _ServerError = "ServerError";
    public static final java.lang.String _BusinessError = "BusinessError";
    public static final java.lang.String _ValueIsNull = "ValueIsNull";
    public static final java.lang.String _UnfoundedData = "UnfoundedData";
    public static final java.lang.String _Unauthorized = "Unauthorized";
    public static final ErrorCode ServerSuccess = new ErrorCode(_ServerSuccess);
    public static final ErrorCode ServerError = new ErrorCode(_ServerError);
    public static final ErrorCode BusinessError = new ErrorCode(_BusinessError);
    public static final ErrorCode ValueIsNull = new ErrorCode(_ValueIsNull);
    public static final ErrorCode UnfoundedData = new ErrorCode(_UnfoundedData);
    public static final ErrorCode Unauthorized = new ErrorCode(_Unauthorized);
    public java.lang.String getValue() { return _value_;}
    public static ErrorCode fromValue(java.lang.String value)
          throws java.lang.IllegalArgumentException {
        ErrorCode enumeration = (ErrorCode)
            _table_.get(value);
        if (enumeration==null) throw new java.lang.IllegalArgumentException();
        return enumeration;
    }
    public static ErrorCode fromString(java.lang.String value)
          throws java.lang.IllegalArgumentException {
        return fromValue(value);
    }
    public boolean equals(java.lang.Object obj) {return (obj == this);}
    public int hashCode() { return toString().hashCode();}
    public java.lang.String toString() { return _value_;}
    public java.lang.Object readResolve() throws java.io.ObjectStreamException { return fromValue(_value_);}
    public static org.apache.axis.encoding.Serializer getSerializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new org.apache.axis.encoding.ser.EnumSerializer(
            _javaType, _xmlType);
    }
    public static org.apache.axis.encoding.Deserializer getDeserializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new org.apache.axis.encoding.ser.EnumDeserializer(
            _javaType, _xmlType);
    }
    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(ErrorCode.class);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://schemas.datacontract.org/2004/07/Ceair.Operations.SSO.WCF.Contracts.Enum", "ErrorCode"));
    }
    /**
     * Return type metadata object
     */
    public static org.apache.axis.description.TypeDesc getTypeDesc() {
        return typeDesc;
    }

}
