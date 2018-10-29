package com.usky.sms.common;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;
import org.dom4j.Namespace;
import org.dom4j.QName;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;

public class XmlHelper {
	
	/**
	 * 将xml格式的string转化成map
	 * @param xmlString
	 * @return
	 * @throws DocumentException
	 */
	public static Map<String, Object> xmlToMap(String xmlString) {
		if (StringUtils.isBlank(xmlString)) {
			return null;
		}
		try {
			Document doc = DocumentHelper.parseText(xmlString);
			Element root = doc.getRootElement();
			Map<String, Object> map = new HashMap<String, Object>();
			map.put(root.getName(), getElementMapContent(root));
			return map;
		} catch (DocumentException e) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "解析xml失败!\n" + xmlString + "\nerror message:" + e.getMessage());
		}
	}
	
	/***
	 * 核心方法，里面有递归调用
	 * 
	 * @param element
	 */
	public static Object getElementMapContent(Element element) {
		// 获得当前节点的子节点
		@SuppressWarnings("unchecked")
		List<Element> elements = element.elements();
		if (elements.size() == 0) {
			// 没有子节点说明当前节点是叶子节点，直接取值即可
			return element.getText();
		} else if (elements.size() == 1) {
			// 只有一个子节点说明不用考虑list的情况，直接继续递归即可
			Map<String, Object> tempMap = new HashMap<String, Object>();
			tempMap.put(elements.get(0).getName(), getElementMapContent(elements.get(0)));
			return tempMap;
		} else {
			// 多个子节点的话就得考虑list的情况了，比如多个子节点有节点名称相同的
			// 构造一个map用来去重
			Map<String, Element> tempMap = new HashMap<String, Element>();
			for (Element ele : elements) {
				tempMap.put(ele.getName(), ele);
			}
			Set<String> keySet = tempMap.keySet();
			Map<String, Object> map = new HashMap<String, Object>();
			for (String string : keySet) {
				Namespace namespace = tempMap.get(string).getNamespace();
				@SuppressWarnings("unchecked")
				List<Element> elements2 = element.elements(new QName(string, namespace));
				// 如果同名的数目大于1则表示要构建list
				if (elements2.size() > 1) {
					List<Object> list = new ArrayList<Object>();
					for (Element ele : elements2) {
						list.add(getElementMapContent(ele));
					}
					 map.put(string, list);
				} else {
					// 同名的数量不大于1则直接递归去
					 map.put(string, getElementMapContent(elements2.get(0)));
				}
			}
			return map;
		}
	}

}
