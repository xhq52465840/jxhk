package com.usky.sms.eiosa;

import java.util.Collection;
import java.util.List;

import org.hibernate.HibernateException;
import org.hibernate.Query;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.BaseDao;

@Transactional(readOnly = true, propagation = Propagation.SUPPORTS)
public class IsarpBaseDao<O extends AbstractBaseDO> extends BaseDao<AbstractBaseDO>{

	protected IsarpBaseDao(Class clazz) {
		super(clazz);
		// TODO Auto-generated constructor stub
	}
	
	
	//传入params，values键值对，设置进入hibernate query对象
	protected void setNamedParameterToQuery(Query queryObject, List<String> params, List<Object> values) throws HibernateException {
		for (int i = 0; i < params.size(); i++) {
			if (values.get(i) instanceof Collection) {
				queryObject.setParameterList(params.get(i), (Collection<?>) values.get(i));
			} else if (values.get(i) instanceof Object[]) {
				queryObject.setParameterList(params.get(i), (Object[]) values.get(i));
			} else {
				queryObject.setParameter(params.get(i), values.get(i));
			}

		}
	}
	
}
