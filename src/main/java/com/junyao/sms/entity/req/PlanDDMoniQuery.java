
package com.junyao.sms.entity.req;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElementRef;
import javax.xml.bind.annotation.XmlType;


/**
 * 
 * 
 * 
 * <pre>
 * &lt;complexType name="PlanDDMoniQuery"&gt;
 *   &lt;complexContent&gt;
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType"&gt;
 *       &lt;sequence&gt;
 *         &lt;element name="acno" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/&gt;
 *         &lt;element name="reportBegin" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/&gt;
 *         &lt;element name="reportEnd" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/&gt;
 *       &lt;/sequence&gt;
 *     &lt;/restriction&gt;
 *   &lt;/complexContent&gt;
 * &lt;/complexType&gt;
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "PlanDDMoniQuery", propOrder = {
    "acno",
    "reportBegin",
    "reportEnd"
})
public class PlanDDMoniQuery {

    @XmlElementRef(name = "acno", namespace = "http://req.entity.sms.junyao.com", type = JAXBElement.class, required = false)
    protected JAXBElement<String> acno;
    @XmlElementRef(name = "reportBegin", namespace = "http://req.entity.sms.junyao.com", type = JAXBElement.class, required = false)
    protected JAXBElement<String> reportBegin;
    @XmlElementRef(name = "reportEnd", namespace = "http://req.entity.sms.junyao.com", type = JAXBElement.class, required = false)
    protected JAXBElement<String> reportEnd;

    /**
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getAcno() {
        return acno;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setAcno(JAXBElement<String> value) {
        this.acno = value;
    }

    /**
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getReportBegin() {
        return reportBegin;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setReportBegin(JAXBElement<String> value) {
        this.reportBegin = value;
    }

    /**
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getReportEnd() {
        return reportEnd;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setReportEnd(JAXBElement<String> value) {
        this.reportEnd = value;
    }

}
