
package com.junyao.sms.service;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElementRef;
import javax.xml.bind.annotation.XmlType;


/**
 * public class PlanStaticRes extends SmsResultBase{
 * 	private List<PlaneStaticInfo>  data ;
 * }
 * 
 * public class PlaneStaticInfo {
 * private String acno ;	// 机号
 * private String actype ;	// 机型 
 * private String engineno; // 发动机型号
 * private String tsn ; // TSN(总飞行小时)
 * private String enginenum; // 发动机装机数
 * private String outdate ; // 出厂日期
 * private String apuno ; // APU型号
 * private String fsn ; // FSN 机队序号
 * private String csn ; // CSN 总飞行循环小时
 * private String manufacturer ; // 飞机制造商(英文名)
 * private String status ; // 飞机状态
 * private String maintdeptid ;	// 执管单位
 * private String msn ; // 出厂序号
 * private String transflag ; // 转移或卖出标记
 * private String description ; // 飞机描述
 * private String crafter ; // 营运人
 
 * }
 * 
 * <p>getPlaneInfoResponse complex type�� Java �ࡣ
 * 
 * 
 * <pre>
 * &lt;complexType name="getPlaneInfoResponse"&gt;
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
@XmlType(name = "getPlaneInfoResponse", propOrder = {
    "result"
})
public class GetPlaneInfoResponse {

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
