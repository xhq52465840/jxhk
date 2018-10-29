
package com.usky.sms.common;

/**
 * Simply an holder for a key value property.
 */
public interface ILabelValueBean<L, V> {
	
	public V getValue();
	
	public L getLabel();
	
}
