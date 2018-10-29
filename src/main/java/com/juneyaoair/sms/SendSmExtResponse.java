
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
 *         &lt;element name="SendSmExtResult" type="{http://www.w3.org/2001/XMLSchema}int"/>
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
    "sendSmExtResult"
})
@XmlRootElement(name = "SendSmExtResponse")
public class SendSmExtResponse {

    @XmlElement(name = "SendSmExtResult")
    protected int sendSmExtResult;

    /**
     * 
     */
    public int getSendSmExtResult() {
        return sendSmExtResult;
    }

    /**
     * 
     */
    public void setSendSmExtResult(int value) {
        this.sendSmExtResult = value;
    }

}
