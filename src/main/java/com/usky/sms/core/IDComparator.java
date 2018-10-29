
package com.usky.sms.core;

import java.util.Comparator;

public class IDComparator implements Comparator<AbstractBaseDO> {
	
	private static IDComparator instance = null;
	
	public static IDComparator getInstance() {
		if (instance == null) {
			instance = new IDComparator();
		}
		return instance;
	}
	
	@Override
	public int compare(AbstractBaseDO o1, AbstractBaseDO o2) {
		return o1.getId() - o2.getId();
	}
	
}
