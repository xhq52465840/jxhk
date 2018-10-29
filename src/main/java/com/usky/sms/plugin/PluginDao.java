
package com.usky.sms.plugin;

import java.util.List;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.support.XmlWebApplicationContext;

import com.usky.sms.core.AbstractPlugin;
import com.usky.sms.core.BaseDao;

public class PluginDao extends BaseDao<PluginDO> {
	
	private XmlWebApplicationContext context;
	
	public PluginDao() {
		super(PluginDO.class);
	}
	
	public void initialize() throws Exception {
		List<PluginDO> plugins = this.getAllList();
		String[] locations = context.getConfigLocations();
		String[] newLocations = new String[locations.length + plugins.size()];
		System.arraycopy(locations, 0, newLocations, 0, locations.length);
		for (int i = 0; i < plugins.size(); i++) {
			newLocations[locations.length + i] = "classpath:/com/usky/sms/" + plugins.get(i).getKey() + "/plugin.xml";
		}
		context.setConfigLocations(newLocations);
		context.refresh();
		for (PluginDO plugin : plugins) {
			AbstractPlugin pluginBean = (AbstractPlugin) context.getBean(plugin.getKey() + "Plugin");
			pluginBean.initialize(context);
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void deleteByKey(String key) {
		@SuppressWarnings("unchecked")
		List<PluginDO> plugins = this.getHibernateTemplate().find("from PluginDO where key = ?", key);
		this.getHibernateTemplate().deleteAll(plugins);
	}
	
	public void setContext(XmlWebApplicationContext context) {
		this.context = context;
	}
	
}
