
package com.junyao.sms.service;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElementRef;
import javax.xml.bind.annotation.XmlType;


/**
 * public class PlanFcRes extends SmsResultBase{
 * 	private List<DeferredRepairInfo> data ;
 * }
 * 
 * 
 * public class DeferredRepairInfo {
 * 
 * private String taskcode ; // 编号
 * private String happendate ; // 发生日期
 * private String chapter ; // ATA
 * private String resolvelimit ; // 修复期限
 * private String cancelreason ; // 取消原因
 * private String controlscheme ; // 监控方案
 * 
 * }
 * 
 * 
 * 
 * <pre>
 * &lt;complexType name="getDefectRepairInfoResponse"&gt;
 *   &lt;complexContent&gt;
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType"&gt;
 *       &lt;sequence&gt;
 *         &lt;element name="result" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/&gt;
 *       &lt;/sequence&gt;
 *     &lt;/restriction&gt;
 *   &lt;/complexContent&gt;
 * &lt;/complexType&gt;
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "getDefectRepairInfoResponse", propOrder = {
    "result"
})
public class GetDefectRepairInfoResponse {

    @XmlElementRef(name = "result", type = JAXBElement.class, required = false)
    protected JAXBElement<String> result;

    /**
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getResult() {
        return result;
    }

    /**
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setResult(JAXBElement<String> value) {
        this.result = value;
    }

}
