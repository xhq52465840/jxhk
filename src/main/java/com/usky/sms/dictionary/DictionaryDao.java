
package com.usky.sms.dictionary;

import java.util.List;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;

public class DictionaryDao extends BaseDao<DictionaryDO> {
	
	final static public String USER_DEFAULT_SETTING = "用户缺省设置";
	
	final static public String[] USER_DEFAULT_SETTING_KEYS = new String[] { "emailFormat", "pageDisplayNum", "defaultAccess", "emailUser", "autoWatch" };
	
	final static private String[] USER_DEFAULT_SETTING_NAMES = new String[] { "默认发送个邮件的格式", "安全信息导航每页显示的信息数量", "过滤器和面板的默认共享模式", "通知用户他们自己的变更", "自动关注自己的安全信息" };
	
	final static private String[] USER_DEFAULT_SETTING_VALUES = new String[] { "html", "50", "私有", "否", "是" };
	
	public DictionaryDao() {
		super(DictionaryDO.class);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	public void initialize() {
		List<DictionaryDO> list = this.getList();
		initUserDefaultSettings(list);
	}
	
	private void initUserDefaultSettings(List<DictionaryDO> list) {
		for (int i = 0; i < USER_DEFAULT_SETTING_NAMES.length; i++) {
			initDict(list, USER_DEFAULT_SETTING, USER_DEFAULT_SETTING_KEYS[i], USER_DEFAULT_SETTING_NAMES[i], USER_DEFAULT_SETTING_VALUES[i]);
		}
	}
	
	private void initDict(List<DictionaryDO> list, String type, String key, String name, String value) {
		DictionaryDO dictionary = null;
		for (DictionaryDO dict : list) {
			if (type != null && !type.equals(dict.getType())) continue;
			if (key != null && !key.equals(dict.getKey())) continue;
			dictionary = dict;
			break;
		}
		if (dictionary != null) return;
		dictionary = new DictionaryDO();
		dictionary.setKey(key);
		dictionary.setName(name);
		dictionary.setType(type);
		dictionary.setValue(value);
		this.internalSave(dictionary);
	}
	
	public List<DictionaryDO> getListByType(String type) {
		@SuppressWarnings("unchecked")
		List<DictionaryDO> list = this.getHibernateTemplate().find("from DictionaryDO t where t.deleted = false and t.type = ?", type);
		return list;
	}
	
	public List<DictionaryDO> getListByKey(String key) {
		@SuppressWarnings("unchecked")
		List<DictionaryDO> list = this.getHibernateTemplate().find("from DictionaryDO t where t.deleted = false and t.key = ?", key);
		return list;
	}
	
	/**
	 * 通过类型和名称查找对应的记录，如果没有则返回null，否则返回第一条数据
	 */
	public DictionaryDO getByTypeAndName(String type, String name){
		if (null == type || null == name) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<DictionaryDO> list = (List<DictionaryDO>) this.query("from DictionaryDO t where t.deleted = false and t.type = ? and t.name = ?", type, name);
		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}
	
	/**
	 * 通过类型和key查找对应的记录，如果没有则返回null，否则返回第一条数据
	 */
	public DictionaryDO getByTypeAndKey(String type, String key){
		if (null == type || null == key) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<DictionaryDO> list = (List<DictionaryDO>) this.query("from DictionaryDO t where t.deleted = false and t.type = ? and t.key = ?", type, key);
		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}
	
}
