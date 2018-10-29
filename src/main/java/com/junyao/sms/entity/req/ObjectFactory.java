
package com.junyao.sms.entity.req;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the com.junyao.sms.entity.req package. 
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

    private final static QName _PlanStaticQueryPassword_QNAME = new QName("http://req.entity.sms.junyao.com", "password");
    private final static QName _PlanStaticQueryTailNo_QNAME = new QName("http://req.entity.sms.junyao.com", "tailNo");
    private final static QName _PlanStaticQueryToken_QNAME = new QName("http://req.entity.sms.junyao.com", "token");
    private final static QName _PlanStaticQueryUsername_QNAME = new QName("http://req.entity.sms.junyao.com", "username");
    private final static QName _PlanDDMoniQueryAcno_QNAME = new QName("http://req.entity.sms.junyao.com", "acno");
    private final static QName _PlanDDMoniQueryReportBegin_QNAME = new QName("http://req.entity.sms.junyao.com", "reportBegin");
    private final static QName _PlanDDMoniQueryReportEnd_QNAME = new QName("http://req.entity.sms.junyao.com", "reportEnd");
    private final static QName _PlaneDDQueryDateBegin_QNAME = new QName("http://req.entity.sms.junyao.com", "dateBegin");
    private final static QName _PlaneDDQueryDateEnd_QNAME = new QName("http://req.entity.sms.junyao.com", "dateEnd");
    private final static QName _PlaneDDQueryDdNo_QNAME = new QName("http://req.entity.sms.junyao.com", "ddNo");
    private final static QName _PlaneDDQueryStatus_QNAME = new QName("http://req.entity.sms.junyao.com", "status");
    private final static QName _PlanFcQueryFcNo_QNAME = new QName("http://req.entity.sms.junyao.com", "fcNo");

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: com.junyao.sms.entity.req
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link PlanFcQuery }
     * 
     */
    public PlanFcQuery createPlanFcQuery() {
        return new PlanFcQuery();
    }

    /**
     * Create an instance of {@link PlaneDDQuery }
     * 
     */
    public PlaneDDQuery createPlaneDDQuery() {
        return new PlaneDDQuery();
    }

    /**
     * Create an instance of {@link PlanDDMoniQuery }
     * 
     */
    public PlanDDMoniQuery createPlanDDMoniQuery() {
        return new PlanDDMoniQuery();
    }

    /**
     * Create an instance of {@link PlanStaticQuery }
     * 
     */
    public PlanStaticQuery createPlanStaticQuery() {
        return new PlanStaticQuery();
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "password", scope = PlanStaticQuery.class)
    public JAXBElement<String> createPlanStaticQueryPassword(String value) {
        return new JAXBElement<String>(_PlanStaticQueryPassword_QNAME, String.class, PlanStaticQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "tailNo", scope = PlanStaticQuery.class)
    public JAXBElement<String> createPlanStaticQueryTailNo(String value) {
        return new JAXBElement<String>(_PlanStaticQueryTailNo_QNAME, String.class, PlanStaticQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "token", scope = PlanStaticQuery.class)
    public JAXBElement<String> createPlanStaticQueryToken(String value) {
        return new JAXBElement<String>(_PlanStaticQueryToken_QNAME, String.class, PlanStaticQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "username", scope = PlanStaticQuery.class)
    public JAXBElement<String> createPlanStaticQueryUsername(String value) {
        return new JAXBElement<String>(_PlanStaticQueryUsername_QNAME, String.class, PlanStaticQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "acno", scope = PlanDDMoniQuery.class)
    public JAXBElement<String> createPlanDDMoniQueryAcno(String value) {
        return new JAXBElement<String>(_PlanDDMoniQueryAcno_QNAME, String.class, PlanDDMoniQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "reportBegin", scope = PlanDDMoniQuery.class)
    public JAXBElement<String> createPlanDDMoniQueryReportBegin(String value) {
        return new JAXBElement<String>(_PlanDDMoniQueryReportBegin_QNAME, String.class, PlanDDMoniQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "reportEnd", scope = PlanDDMoniQuery.class)
    public JAXBElement<String> createPlanDDMoniQueryReportEnd(String value) {
        return new JAXBElement<String>(_PlanDDMoniQueryReportEnd_QNAME, String.class, PlanDDMoniQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "acno", scope = PlaneDDQuery.class)
    public JAXBElement<String> createPlaneDDQueryAcno(String value) {
        return new JAXBElement<String>(_PlanDDMoniQueryAcno_QNAME, String.class, PlaneDDQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "dateBegin", scope = PlaneDDQuery.class)
    public JAXBElement<String> createPlaneDDQueryDateBegin(String value) {
        return new JAXBElement<String>(_PlaneDDQueryDateBegin_QNAME, String.class, PlaneDDQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "dateEnd", scope = PlaneDDQuery.class)
    public JAXBElement<String> createPlaneDDQueryDateEnd(String value) {
        return new JAXBElement<String>(_PlaneDDQueryDateEnd_QNAME, String.class, PlaneDDQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "ddNo", scope = PlaneDDQuery.class)
    public JAXBElement<String> createPlaneDDQueryDdNo(String value) {
        return new JAXBElement<String>(_PlaneDDQueryDdNo_QNAME, String.class, PlaneDDQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "password", scope = PlaneDDQuery.class)
    public JAXBElement<String> createPlaneDDQueryPassword(String value) {
        return new JAXBElement<String>(_PlanStaticQueryPassword_QNAME, String.class, PlaneDDQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "status", scope = PlaneDDQuery.class)
    public JAXBElement<String> createPlaneDDQueryStatus(String value) {
        return new JAXBElement<String>(_PlaneDDQueryStatus_QNAME, String.class, PlaneDDQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "token", scope = PlaneDDQuery.class)
    public JAXBElement<String> createPlaneDDQueryToken(String value) {
        return new JAXBElement<String>(_PlanStaticQueryToken_QNAME, String.class, PlaneDDQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "username", scope = PlaneDDQuery.class)
    public JAXBElement<String> createPlaneDDQueryUsername(String value) {
        return new JAXBElement<String>(_PlanStaticQueryUsername_QNAME, String.class, PlaneDDQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "acno", scope = PlanFcQuery.class)
    public JAXBElement<String> createPlanFcQueryAcno(String value) {
        return new JAXBElement<String>(_PlanDDMoniQueryAcno_QNAME, String.class, PlanFcQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "dateBegin", scope = PlanFcQuery.class)
    public JAXBElement<String> createPlanFcQueryDateBegin(String value) {
        return new JAXBElement<String>(_PlaneDDQueryDateBegin_QNAME, String.class, PlanFcQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "dateEnd", scope = PlanFcQuery.class)
    public JAXBElement<String> createPlanFcQueryDateEnd(String value) {
        return new JAXBElement<String>(_PlaneDDQueryDateEnd_QNAME, String.class, PlanFcQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "fcNo", scope = PlanFcQuery.class)
    public JAXBElement<String> createPlanFcQueryFcNo(String value) {
        return new JAXBElement<String>(_PlanFcQueryFcNo_QNAME, String.class, PlanFcQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "password", scope = PlanFcQuery.class)
    public JAXBElement<String> createPlanFcQueryPassword(String value) {
        return new JAXBElement<String>(_PlanStaticQueryPassword_QNAME, String.class, PlanFcQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "status", scope = PlanFcQuery.class)
    public JAXBElement<String> createPlanFcQueryStatus(String value) {
        return new JAXBElement<String>(_PlaneDDQueryStatus_QNAME, String.class, PlanFcQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "token", scope = PlanFcQuery.class)
    public JAXBElement<String> createPlanFcQueryToken(String value) {
        return new JAXBElement<String>(_PlanStaticQueryToken_QNAME, String.class, PlanFcQuery.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://req.entity.sms.junyao.com", name = "username", scope = PlanFcQuery.class)
    public JAXBElement<String> createPlanFcQueryUsername(String value) {
        return new JAXBElement<String>(_PlanStaticQueryUsername_QNAME, String.class, PlanFcQuery.class, value);
    }

}
