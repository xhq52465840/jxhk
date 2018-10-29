
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
 *         &lt;element name="ReceiveSmResult" type="{http://tempuri.org/}ArrayOfSmsMessageRev" minOccurs="0"/>
 *         &lt;element name="flag" type="{http://www.w3.org/2001/XMLSchema}int"/>
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
    "receiveSmResult",
    "flag"
})
@XmlRootElement(name = "ReceiveSmResponse")
public class ReceiveSmResponse {

    @XmlElement(name = "ReceiveSmResult")
    protected ArrayOfSmsMessageRev receiveSmResult;
    protected int flag;

    /**
     * 
     * @return
     *     possible object is
     *     {@link ArrayOfSmsMessageRev }
     *     
     */
    public ArrayOfSmsMessageRev getReceiveSmResult() {
        return receiveSmResult;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link ArrayOfSmsMessageRev }
     *     
     */
    public void setReceiveSmResult(ArrayOfSmsMessageRev value) {
        this.receiveSmResult = value;
    }

    /**
     * 
     */
    public int getFlag() {
        return flag;
    }

    /**
     * 
     */
    public void setFlag(int value) {
        this.flag = value;
    }

}
