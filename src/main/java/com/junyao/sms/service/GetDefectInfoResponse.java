
package com.junyao.sms.service;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElementRef;
import javax.xml.bind.annotation.XmlType;


/**
 * public class PlaneDDRes extends SmsResultBase{
 * 	private List<DDBillInfo>  data ;
 * }
 * 
 * public class DDBillInfo {
 * 
 * private String taskcode ; // 编号
 * private String applydate ; // 申请签字日期
 * private String expiredate ; // 到期日期
 * private String ddfType; // 保留类型
 * private String limitend ; // 批准修复时限止
 * private String deferend ; // 延期修复时限止
 * private String info ; // 故障描述/损伤情况
 * private String haslimit ; // 是否有限制
 * }
 * 
 * <p>getDefectInfoResponse complex type�� Java �ࡣ
 * 
 * 
 * <pre>
 * &lt;complexType name="getDefectInfoResponse"&gt;
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
@XmlType(name = "getDefectInfoResponse", propOrder = {
    "result"
})
public class GetDefectInfoResponse {

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
