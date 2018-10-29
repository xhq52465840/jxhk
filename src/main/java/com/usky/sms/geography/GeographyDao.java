package com.usky.sms.geography;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.BaseDao;
import com.usky.sms.unit.UnitDao;

public class GeographyDao extends BaseDao<GeographyDO> {

	@Autowired
	private UnitDao unitDao;

	public GeographyDao() {
		super(GeographyDO.class);
	}
	
}
