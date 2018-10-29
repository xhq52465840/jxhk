
package com.junyao.sms.service;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;
import com.junyao.sms.entity.req.PlanFcQuery;


/**
 * 
 * 
 * <pre>
 * &lt;complexType name="getDefectRepairInfo"&gt;
 *   &lt;complexContent&gt;
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType"&gt;
 *       &lt;sequence&gt;
 *         &lt;element name="params" type="{http://req.entity.sms.junyao.com}PlanFcQuery" minOccurs="0"/&gt;
 *       &lt;/sequence&gt;
 *     &lt;/restriction&gt;
 *   &lt;/complexContent&gt;
 * &lt;/complexType&gt;
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "getDefectRepairInfo", propOrder = {
    "params"
})
public class GetDefectRepairInfo {

    protected PlanFcQuery params;

    /**
     * 
     * @return
     *     possible object is
     *     {@link PlanFcQuery }
     *     
     */
    public PlanFcQuery getParams() {
        return params;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link PlanFcQuery }
     *     
     */
    public void setParams(PlanFcQuery value) {
        this.params = value;
    }

}
