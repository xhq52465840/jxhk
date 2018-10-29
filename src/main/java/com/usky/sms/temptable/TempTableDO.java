package com.usky.sms.temptable;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

/**
 * 创建临时表：
 * <br>
 * create global temporary table T_TEMP_TABLE
 * (
 *   id NUMBER(10)
 * )
 * on commit preserve rows;
 * <br>
 * 创建类型：
 * <br>
 * CREATE OR REPLACE TYPE ty_row_str_split  as object (strValue VARCHAR2 (4000));
 * <br>
 * CREATE OR REPLACE TYPE ty_tbl_str_split IS TABLE OF ty_row_str_split;
 * <br>
 * 创建函数：
 * <br>
 * <code>
 * CREATE OR REPLACE FUNCTION fn_split(p_str IN clob, p_delimiter IN VARCHAR2)
 *   RETURN ty_tbl_str_split IS
 * 
 *   j         INT := 0;
 *   i         INT := 1;
 *   len       INT := 0;
 *   len1      INT := 0;
 *   str       VARCHAR2(4000);
 *   str_split ty_tbl_str_split := ty_tbl_str_split();
 * BEGIN
 *   len  := LENGTH(p_str);
 *   len1 := LENGTH(p_delimiter);
 * 
 *   WHILE j < len LOOP
 *     j := INSTR(p_str, p_delimiter, i);
 * 
 *     IF j = 0 THEN
 *       j   := len;
 *       str := SUBSTR(p_str, i);
 *       str_split.EXTEND;
 *       str_split(str_split.COUNT) := ty_row_str_split(strValue => str);
 * 
 *       IF i >= len THEN
 *         EXIT;
 *       END IF;
 *     ELSE
 *       str := SUBSTR(p_str, i, j - i);
 *       i   := j + len1;
 *       str_split.EXTEND;
 *       str_split(str_split.COUNT) := ty_row_str_split(strValue => str);
 *     END IF;
 *   END LOOP;
 * 
 *   RETURN str_split;
 * END fn_split;
 * </code>
 * <br>
 * 创建存储过程：
 * <br>
 * CREATE OR REPLACE PROCEDURE INSERT_IDS(idstr in clob) AS
 * BEGIN
 *   insert into T_TEMP_TABLE select * from table(fn_split(idstr,','));
 * END;
 */
@Entity
@Table(name = "T_TEMP_TABLE")
public class TempTableDO {
	
	/** 主键 */
	private Integer id;
	
	@Id
	@GeneratedValue
	@Column
	@Comment("主键")
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

}
