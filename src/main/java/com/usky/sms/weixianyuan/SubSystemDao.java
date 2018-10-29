
package com.usky.sms.weixianyuan;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;

public class SubSystemDao extends BaseDao<SubSystemDO> {
	
	public SubSystemDao() {
		super(SubSystemDO.class);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
}
