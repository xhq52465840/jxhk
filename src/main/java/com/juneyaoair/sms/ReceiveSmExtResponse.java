
package com.juneyaoair.sms;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;


/**
 * 
 * 
 * <pre>
 * &lt;complexType>
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="ReceiveSmExtResult" type="{http://tempuri.org/}ArrayOfSmsMessageRev" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "receiveSmExtResult"
})
@XmlRootElement(name = "ReceiveSmExtResponse")
public class ReceiveSmExtResponse {

    @XmlElement(name = "ReceiveSmExtResult")
    protected ArrayOfSmsMessageRev receiveSmExtResult;

    /**
     * 
     * @return
     *     possible object is
     *     {@link ArrayOfSmsMessageRev }
     *     
     */
    public ArrayOfSmsMessageRev getReceiveSmExtResult() {
        return receiveSmExtResult;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link ArrayOfSmsMessageRev }
     *     
     */
    public void setReceiveSmExtResult(ArrayOfSmsMessageRev value) {
        this.receiveSmExtResult = value;
    }

}
