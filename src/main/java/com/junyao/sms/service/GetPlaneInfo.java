
package com.junyao.sms.service;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;
import com.junyao.sms.entity.req.PlanStaticQuery;


/**
 * 
 * <p>getPlaneInfo complex type�� Java �ࡣ
 * 
 * 
 * <pre>
 * &lt;complexType name="getPlaneInfo"&gt;
 *   &lt;complexContent&gt;
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType"&gt;
 *       &lt;sequence&gt;
 *         &lt;element name="params" type="{http://req.entity.sms.junyao.com}PlanStaticQuery" minOccurs="0"/&gt;
 *       &lt;/sequence&gt;
 *     &lt;/restriction&gt;
 *   &lt;/complexContent&gt;
 * &lt;/complexType&gt;
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "getPlaneInfo", propOrder = {
    "params"
})
public class GetPlaneInfo {

    protected PlanStaticQuery params;

    /**
     * 
     * @return
     *     possible object is
     *     {@link PlanStaticQuery }
     *     
     */
    public PlanStaticQuery getParams() {
        return params;
    }

    /**
     * 
     * 
     * @param value
     *     allowed object is
     *     {@link PlanStaticQuery }
     *     
     */
    public void setParams(PlanStaticQuery value) {
        this.params = value;
    }

}
