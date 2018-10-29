
package com.juneyaoair.sms;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlSchemaType;
import javax.xml.bind.annotation.XmlType;
import javax.xml.datatype.XMLGregorianCalendar;


/**
 * 
 * 
 * <pre>
 * &lt;complexType name="SmsMessageRev">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="SmId" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="Mobile" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="SmContent" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="SmRevTime" type="{http://www.w3.org/2001/XMLSchema}dateTime"/>
 *         &lt;element name="AddSerial" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="AddSerialRev" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="ChannelNumber" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="Readed" type="{http://www.w3.org/2001/XMLSchema}int"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "SmsMessageRev", propOrder = {
    "smId",
    "mobile",
    "smContent",
    "smRevTime",
    "addSerial",
    "addSerialRev",
    "channelNumber",
    "readed"
})
public class SmsMessageRev {

    @XmlElement(name = "SmId")
    protected String smId;
    @XmlElement(name = "Mobile")
    protected String mobile;
    @XmlElement(name = "SmContent")
    protected String smContent;
    @XmlElement(name = "SmRevTime", required = true)
    @XmlSchemaType(name = "dateTime")
    protected XMLGregorianCalendar smRevTime;
    @XmlElement(name = "AddSerial")
    protected String addSerial;
    @XmlElement(name = "AddSerialRev")
    protected String addSerialRev;
    @XmlElement(name = "ChannelNumber")
    protected String channelNumber;
    @XmlElement(name = "Readed")
    protected int readed;

    /**
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSmId() {
        return smId;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSmId(String value) {
        this.smId = value;
    }

    /**
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMobile() {
        return mobile;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMobile(String value) {
        this.mobile = value;
    }

    /**
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSmContent() {
        return smContent;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSmContent(String value) {
        this.smContent = value;
    }

    /**
     * 
     * @return
     *     possible object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public XMLGregorianCalendar getSmRevTime() {
        return smRevTime;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link XMLGregorianCalendar }
     *     
     */
    public void setSmRevTime(XMLGregorianCalendar value) {
        this.smRevTime = value;
    }

    /**
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAddSerial() {
        return addSerial;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAddSerial(String value) {
        this.addSerial = value;
    }

    /**
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getAddSerialRev() {
        return addSerialRev;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setAddSerialRev(String value) {
        this.addSerialRev = value;
    }

    /**
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getChannelNumber() {
        return channelNumber;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setChannelNumber(String value) {
        this.channelNumber = value;
    }

    /**
     * 
     */
    public int getReaded() {
        return readed;
    }

    /**
     * 
     */
    public void setReaded(int value) {
        this.readed = value;
    }

}
