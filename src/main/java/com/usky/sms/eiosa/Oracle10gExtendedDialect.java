package com.usky.sms.eiosa;

import org.hibernate.dialect.Oracle10gDialect;
import org.hibernate.dialect.function.SQLFunctionTemplate;
import org.hibernate.type.StandardBasicTypes;

/**
 * HQL支持oracle10g正则表达式的创建的专用类
 * 
 * 
 */
public class Oracle10gExtendedDialect extends Oracle10gDialect {

	public Oracle10gExtendedDialect() {
		super();
		registerFunction("regexp_like", new SQLFunctionTemplate(StandardBasicTypes.BOOLEAN,
				"(case when (regexp_like(?1, ?2)) then 1 else 0 end)"));
	}

	/**
	 * http://viralpatel.net/blogs/oracle-pagination-using-rownum-limiting-
	 * result-set/
	 * 
	 * @param sql
	 * @param hasOffset
	 * @return
	 */
	public String getLimitString1(String sql, boolean hasOffset) {
		sql = sql.trim();
		boolean isForUpdate = false;
		if (sql.toLowerCase().endsWith(" for update")) {
			sql = sql.substring(0, sql.length() - 11);
			isForUpdate = true;
		}
		StringBuilder pagingSelect = new StringBuilder(sql.length() + 100);
		if (hasOffset) {
			pagingSelect.append("select outer.* from (select inner.*, rownum rownum_ from (");
		} else {
			pagingSelect.append("select * from ( ");
		}
		pagingSelect.append(sql);
		if (hasOffset) {
			pagingSelect.append(" ) inner) outer where outer.rownum_ <= ? and outer.rownum_ > ?");
		} else {
			pagingSelect.append(" ) where rownum <= ?");
		}
		if (isForUpdate) {
			pagingSelect.append(" for update");
		}
		return pagingSelect.toString();
	}

	@Override
	public String getLimitString(String sql, boolean hasOffset) {
		sql = sql.trim();
		String forUpdateClause = null;
		boolean isForUpdate = false;
		final int forUpdateIndex = sql.toLowerCase().lastIndexOf("for update");
		if (forUpdateIndex > -1) {
			// save 'for update ...' and then remove it
			forUpdateClause = sql.substring(forUpdateIndex);
			sql = sql.substring(0, forUpdateIndex - 1);
			isForUpdate = true;
		}

		StringBuilder pagingSelect = new StringBuilder(sql.length() + 100);
		pagingSelect.append("select * from ( select row_.*, rownum rownum_ from ( ");

		pagingSelect.append(sql);
		if (hasOffset) {
			pagingSelect.append(" ) row_) where rownum_ <= ? and rownum_ > ?");
		} else {
			pagingSelect.append(" ) row_) where rownum_ <= ?");
		}

		if (isForUpdate) {
			pagingSelect.append(" ");
			pagingSelect.append(forUpdateClause);
		}

		return pagingSelect.toString();
	}
}
