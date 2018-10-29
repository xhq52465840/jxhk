
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
 *         &lt;element name="SendSmResult" type="{http://www.w3.org/2001/XMLSchema}int"/>
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
    "sendSmResult"
})
@XmlRootElement(name = "SendSmResponse")
public class SendSmResponse {

    @XmlElement(name = "SendSmResult")
    protected int sendSmResult;

    /**
     * 
     */
    public int getSendSmResult() {
        return sendSmResult;
    }

    /**
     * 
     */
    public void setSendSmResult(int value) {
        this.sendSmResult = value;
    }

}
