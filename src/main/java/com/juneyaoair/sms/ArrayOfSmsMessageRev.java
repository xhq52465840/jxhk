
package com.juneyaoair.sms;

import java.util.ArrayList;
import java.util.List;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * 
 * 
 * <pre>
 * &lt;complexType name="ArrayOfSmsMessageRev">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="SmsMessageRev" type="{http://tempuri.org/}SmsMessageRev" maxOccurs="unbounded" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "ArrayOfSmsMessageRev", propOrder = {
    "smsMessageRev"
})
public class ArrayOfSmsMessageRev {

    @XmlElement(name = "SmsMessageRev", nillable = true)
    protected List<SmsMessageRev> smsMessageRev;

    /**
     * Gets the value of the smsMessageRev property.
     * 
     * <p>
     * This accessor method returns a reference to the live list,
     * not a snapshot. Therefore any modification you make to the
     * returned list will be present inside the JAXB object.
     * This is why there is not a <CODE>set</CODE> method for the smsMessageRev property.
     * 
     * <p>
     * For example, to add a new item, do as follows:
     * <pre>
     *    getSmsMessageRev().add(newItem);
     * </pre>
     * 
     * 
     * <p>
     * Objects of the following type(s) are allowed in the list
     * {@link SmsMessageRev }
     * 
     * 
     */
    public List<SmsMessageRev> getSmsMessageRev() {
        if (smsMessageRev == null) {
            smsMessageRev = new ArrayList<SmsMessageRev>();
        }
        return this.smsMessageRev;
    }

}
