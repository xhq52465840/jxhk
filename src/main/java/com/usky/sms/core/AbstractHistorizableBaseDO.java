
package com.usky.sms.core;
import org.hibernate.cfg.Comment;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.MappedSuperclass;
import javax.persistence.Transient;

import de.micromata.hibernate.history.ExtendedHistorizable;

@MappedSuperclass
public abstract class AbstractHistorizableBaseDO extends AbstractBaseDO implements ExtendedHistorizable {
	
	protected static final Set<String> invalidHistorizableProperties;
	
	static {
		invalidHistorizableProperties = new HashSet<String>();
		invalidHistorizableProperties.add("lastUpdate");
		invalidHistorizableProperties.add("created");
	}
	
	public static Set<String> getInvalidHistorizableProperties() {
		return invalidHistorizableProperties;
	}
	
	@Override
	@Transient
	public Set<String> getHistorizableAttributes() {
		return null;
	}
	
	@Override
	@Transient
	public Set<String> getNonHistorizableAttributes() {
		return invalidHistorizableProperties;
	}
	
}
