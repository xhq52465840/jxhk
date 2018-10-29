
package com.usky.sms.temptable;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.hibernate.Session;
import org.hibernate.jdbc.Work;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;
import org.springframework.transaction.annotation.Transactional;

public class TempTableDao extends HibernateDaoSupport {
	
	private static final Logger logger = Logger.getLogger(TempTableDao.class);
	
	@Transactional
	public void insertIds(Collection<Integer> ids) throws Exception {
		if (ids != null) {
			try {
				String procName = "Call INSERT_IDS(?)";
				Set<Integer> idSet = new HashSet<Integer>(ids);
				this.executeVoidProcedureSql(procName, StringUtils.join(idSet, ","));
			} catch (Exception e) {
				logger.error("创建临时表数据失败", e);
				throw new Exception("创建临时表数据失败");
			}
		}
	}
	
	/**
	 * 通过SQL执行无返回结果的存储过程(仅限于存储过程)
	 * 
	 * @param queryString
	 * @param params
	 */
	public void executeVoidProcedureSql(final String queryString, final Object... params) throws Exception {
		Session session = getHibernateTemplate().getSessionFactory().getCurrentSession();
		session.doWork(new Work() {
			public void execute(Connection conn) throws SQLException {
				ResultSet rs = null;
				CallableStatement call = conn.prepareCall("{" + queryString + "}");
				if (null != params) {
					for (int i = 0; i < params.length; i++) {
						call.setObject(i + 1, params[i]);
					}
				}
				rs = call.executeQuery();
				call.close();
				if (rs != null) {
					rs.close();
				}
			}
		});
	}
}
