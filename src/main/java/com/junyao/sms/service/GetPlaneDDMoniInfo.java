
package com.junyao.sms.service;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;
import com.junyao.sms.entity.req.PlanDDMoniQuery;


/**
 * 
 * 
 * <pre>
 * &lt;complexType name="getPlaneDDMoniInfo"&gt;
 *   &lt;complexContent&gt;
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType"&gt;
 *       &lt;sequence&gt;
 *         &lt;element name="params" type="{http://req.entity.sms.junyao.com}PlanDDMoniQuery" minOccurs="0"/&gt;
 *       &lt;/sequence&gt;
 *     &lt;/restriction&gt;
 *   &lt;/complexContent&gt;
 * &lt;/complexType&gt;
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "getPlaneDDMoniInfo", propOrder = {
    "params"
})
public class GetPlaneDDMoniInfo {

    protected PlanDDMoniQuery params;

    /**
     * 
     * @return
     *     possible object is
     *     {@link PlanDDMoniQuery }
     *     
     */
    public PlanDDMoniQuery getParams() {
        return params;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link PlanDDMoniQuery }
     *     
     */
    public void setParams(PlanDDMoniQuery value) {
        this.params = value;
    }

}
