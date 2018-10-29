
package com.junyao.sms.service;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;
import com.junyao.sms.entity.req.PlaneDDQuery;


/**
 * 
 * 
 * <pre>
 * &lt;complexType name="getDefectInfo"&gt;
 *   &lt;complexContent&gt;
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType"&gt;
 *       &lt;sequence&gt;
 *         &lt;element name="params" type="{http://req.entity.sms.junyao.com}PlaneDDQuery" minOccurs="0"/&gt;
 *       &lt;/sequence&gt;
 *     &lt;/restriction&gt;
 *   &lt;/complexContent&gt;
 * &lt;/complexType&gt;
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "getDefectInfo", propOrder = {
    "params"
})
public class GetDefectInfo {

    protected PlaneDDQuery params;

    /**
     * 
     * @return
     *     possible object is
     *     {@link PlaneDDQuery }
     *     
     */
    public PlaneDDQuery getParams() {
        return params;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link PlaneDDQuery }
     *     
     */
    public void setParams(PlaneDDQuery value) {
        this.params = value;
    }

}
