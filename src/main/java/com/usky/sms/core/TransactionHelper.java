
package com.usky.sms.core;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.Session;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.constant.MessageCodeConstant;

public class TransactionHelper extends HibernateDaoSupport {
	
	public Object doInTransaction(final Object obj, final String methodName, final Object... params) {
		Object result = this.getHibernateTemplate().execute(new HibernateCallback<Object>() {
			
			@Override
			public Object doInHibernate(Session session) {
				Connection connection = session.connection();
//				connection.setAutoCommit(false);
				try {
					List<Object> paramList = new ArrayList<Object>();
					List<Class<?>> classes = new ArrayList<Class<?>>();
					paramList.add(connection);
					classes.add(Connection.class);
					for (Object param : params) {
						paramList.add(param);
						classes.add(param.getClass());
					}
					Method method = obj.getClass().getMethod(methodName, classes.toArray(new Class[0]));
					Object result = method.invoke(obj, paramList.toArray(new Object[0]));
//					connection.commit();
					if (method.getReturnType() == void.class) result = true;
					return result;
				} catch (Exception e) {
					if (e.getCause() != null && SMSException.class.isAssignableFrom(e.getCause().getClass())) {
						throw (SMSException) e.getCause();
					} else {
						if(e instanceof SMSException){
							throw (SMSException)e;
						}
						if (e instanceof InvocationTargetException) {
							throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, ((InvocationTargetException) e).getTargetException().getMessage());
						}
						throw new SMSException(e);
					}
				}
//				connection.rollback();
//				connection.close();
//				return null;
			}
		});
		if (result == null) throw SMSException.UNKNOWN_EXCEPTION;
		return result;
	}
	
}
