
package com.junyao.sms.service;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the com.junyao.sms.service package. 
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {

    private final static QName _GetPlaneDDMoniInfo_QNAME = new QName("http://service.sms.junyao.com/", "getPlaneDDMoniInfo");
    private final static QName _GetPlaneDDMoniInfoResponse_QNAME = new QName("http://service.sms.junyao.com/", "getPlaneDDMoniInfoResponse");
    private final static QName _GetPlaneInfo_QNAME = new QName("http://service.sms.junyao.com/", "getPlaneInfo");
    private final static QName _GetPlaneInfoResponse_QNAME = new QName("http://service.sms.junyao.com/", "getPlaneInfoResponse");
    private final static QName _GetDefectInfo_QNAME = new QName("http://service.sms.junyao.com/", "getDefectInfo");
    private final static QName _GetDefectInfoResponse_QNAME = new QName("http://service.sms.junyao.com/", "getDefectInfoResponse");
    private final static QName _GetDefectRepairInfo_QNAME = new QName("http://service.sms.junyao.com/", "getDefectRepairInfo");
    private final static QName _GetDefectRepairInfoResponse_QNAME = new QName("http://service.sms.junyao.com/", "getDefectRepairInfoResponse");
    private final static QName _GetDefectRepairInfoResponseResult_QNAME = new QName("", "result");

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: com.junyao.sms.service
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link GetPlaneDDMoniInfo }
     * 
     */
    public GetPlaneDDMoniInfo createGetPlaneDDMoniInfo() {
        return new GetPlaneDDMoniInfo();
    }

    /**
     * Create an instance of {@link GetPlaneDDMoniInfoResponse }
     * 
     */
    public GetPlaneDDMoniInfoResponse createGetPlaneDDMoniInfoResponse() {
        return new GetPlaneDDMoniInfoResponse();
    }

    /**
     * Create an instance of {@link GetPlaneInfo }
     * 
     */
    public GetPlaneInfo createGetPlaneInfo() {
        return new GetPlaneInfo();
    }

    /**
     * Create an instance of {@link GetPlaneInfoResponse }
     * 
     */
    public GetPlaneInfoResponse createGetPlaneInfoResponse() {
        return new GetPlaneInfoResponse();
    }

    /**
     * Create an instance of {@link GetDefectInfo }
     * 
     */
    public GetDefectInfo createGetDefectInfo() {
        return new GetDefectInfo();
    }

    /**
     * Create an instance of {@link GetDefectInfoResponse }
     * 
     */
    public GetDefectInfoResponse createGetDefectInfoResponse() {
        return new GetDefectInfoResponse();
    }

    /**
     * Create an instance of {@link GetDefectRepairInfo }
     * 
     */
    public GetDefectRepairInfo createGetDefectRepairInfo() {
        return new GetDefectRepairInfo();
    }

    /**
     * Create an instance of {@link GetDefectRepairInfoResponse }
     * 
     */
    public GetDefectRepairInfoResponse createGetDefectRepairInfoResponse() {
        return new GetDefectRepairInfoResponse();
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link GetPlaneDDMoniInfo }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://service.sms.junyao.com/", name = "getPlaneDDMoniInfo")
    public JAXBElement<GetPlaneDDMoniInfo> createGetPlaneDDMoniInfo(GetPlaneDDMoniInfo value) {
        return new JAXBElement<GetPlaneDDMoniInfo>(_GetPlaneDDMoniInfo_QNAME, GetPlaneDDMoniInfo.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link GetPlaneDDMoniInfoResponse }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://service.sms.junyao.com/", name = "getPlaneDDMoniInfoResponse")
    public JAXBElement<GetPlaneDDMoniInfoResponse> createGetPlaneDDMoniInfoResponse(GetPlaneDDMoniInfoResponse value) {
        return new JAXBElement<GetPlaneDDMoniInfoResponse>(_GetPlaneDDMoniInfoResponse_QNAME, GetPlaneDDMoniInfoResponse.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link GetPlaneInfo }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://service.sms.junyao.com/", name = "getPlaneInfo")
    public JAXBElement<GetPlaneInfo> createGetPlaneInfo(GetPlaneInfo value) {
        return new JAXBElement<GetPlaneInfo>(_GetPlaneInfo_QNAME, GetPlaneInfo.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link GetPlaneInfoResponse }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://service.sms.junyao.com/", name = "getPlaneInfoResponse")
    public JAXBElement<GetPlaneInfoResponse> createGetPlaneInfoResponse(GetPlaneInfoResponse value) {
        return new JAXBElement<GetPlaneInfoResponse>(_GetPlaneInfoResponse_QNAME, GetPlaneInfoResponse.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link GetDefectInfo }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://service.sms.junyao.com/", name = "getDefectInfo")
    public JAXBElement<GetDefectInfo> createGetDefectInfo(GetDefectInfo value) {
        return new JAXBElement<GetDefectInfo>(_GetDefectInfo_QNAME, GetDefectInfo.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link GetDefectInfoResponse }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://service.sms.junyao.com/", name = "getDefectInfoResponse")
    public JAXBElement<GetDefectInfoResponse> createGetDefectInfoResponse(GetDefectInfoResponse value) {
        return new JAXBElement<GetDefectInfoResponse>(_GetDefectInfoResponse_QNAME, GetDefectInfoResponse.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link GetDefectRepairInfo }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://service.sms.junyao.com/", name = "getDefectRepairInfo")
    public JAXBElement<GetDefectRepairInfo> createGetDefectRepairInfo(GetDefectRepairInfo value) {
        return new JAXBElement<GetDefectRepairInfo>(_GetDefectRepairInfo_QNAME, GetDefectRepairInfo.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link GetDefectRepairInfoResponse }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://service.sms.junyao.com/", name = "getDefectRepairInfoResponse")
    public JAXBElement<GetDefectRepairInfoResponse> createGetDefectRepairInfoResponse(GetDefectRepairInfoResponse value) {
        return new JAXBElement<GetDefectRepairInfoResponse>(_GetDefectRepairInfoResponse_QNAME, GetDefectRepairInfoResponse.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "result", scope = GetDefectRepairInfoResponse.class)
    public JAXBElement<String> createGetDefectRepairInfoResponseResult(String value) {
        return new JAXBElement<String>(_GetDefectRepairInfoResponseResult_QNAME, String.class, GetDefectRepairInfoResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "result", scope = GetDefectInfoResponse.class)
    public JAXBElement<String> createGetDefectInfoResponseResult(String value) {
        return new JAXBElement<String>(_GetDefectRepairInfoResponseResult_QNAME, String.class, GetDefectInfoResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "result", scope = GetPlaneInfoResponse.class)
    public JAXBElement<String> createGetPlaneInfoResponseResult(String value) {
        return new JAXBElement<String>(_GetDefectRepairInfoResponseResult_QNAME, String.class, GetPlaneInfoResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "", name = "result", scope = GetPlaneDDMoniInfoResponse.class)
    public JAXBElement<String> createGetPlaneDDMoniInfoResponseResult(String value) {
        return new JAXBElement<String>(_GetDefectRepairInfoResponseResult_QNAME, String.class, GetPlaneDDMoniInfoResponse.class, value);
    }

}
