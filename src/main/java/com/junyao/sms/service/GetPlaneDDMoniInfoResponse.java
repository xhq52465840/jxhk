
package com.junyao.sms.service;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElementRef;
import javax.xml.bind.annotation.XmlType;


/**
 * 
 * public class PlanDDMoniRes extends SmsResultBase{
 * 
 * 	private List<PlanDDMoniInfo> data ;
 * 
 * }
 * 
 * 
 * public class PlanDDMoniInfo {
 * 
 * private String tailno, // 机号
 * actype, // 机型
 * ifdifficult , // 是否为疑难故障
 * controller, // 控制人
 * status, // 状态
 * confirmcontents, // 审核意见
 * confirmperson , // 审核人
 * confirmdate, // 审核日期
 * closereason, // 关闭原因
 * yngzzjstatus ; // 疑难故障总结状态
 
 * }
 * 
 * <p>getPlaneDDMoniInfoResponse complex type�� Java �ࡣ
 * 
 * 
 * <pre>
 * &lt;complexType name="getPlaneDDMoniInfoResponse"&gt;
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
@XmlType(name = "getPlaneDDMoniInfoResponse", propOrder = {
    "result"
})
public class GetPlaneDDMoniInfoResponse {

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
