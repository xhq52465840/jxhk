
package com.usky.sms.common;

import java.io.Serializable;

import org.apache.commons.lang.builder.ToStringBuilder;

/**
 * Simply an holder for a key value property.
 */
public class LabelValueBean<L extends Comparable<L>, V> implements Comparable<LabelValueBean<L, V>>, ILabelValueBean<L, V>, Serializable {
	
	private static final long serialVersionUID = -5085397483556387710L;
	
	protected V value = null;
	
	protected L label = null;
	
	public LabelValueBean() {
	}
	
	public LabelValueBean(final V value) {
		this.value = value;
	}
	
	public LabelValueBean(final L label, final V value) {
		this.label = label;
		this.value = value;
	}
	
	@Override
	public V getValue() {
		return this.value;
	}
	
	public void setValue(V value) {
		this.value = value;
	}
	
	@Override
	public L getLabel() {
		return this.label;
	}
	
	@Override
	public String toString() {
		ToStringBuilder sb = new ToStringBuilder(this);
		sb.append("key", this.value);
		sb.append("value", this.label);
		return sb.toString();
	}
	
	/*
	 * @see java.lang.Comparable#compareTo(java.lang.Object)
	 */
	@Override
	public int compareTo(LabelValueBean<L, V> o) {
		return this.label.compareTo(o.label);
	}
	
}
