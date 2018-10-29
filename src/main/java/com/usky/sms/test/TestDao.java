
package com.usky.sms.test;

import java.sql.Connection;
import java.sql.PreparedStatement;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.core.TransactionHelper;

public class TestDao extends BaseDao<TestDO> {
	
	@Autowired
	private TransactionHelper transactionHelper;
	
	public TestDao() {
		super(TestDO.class);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void testTransaction() throws Exception {
		TestDO testA = new TestDO();
		testA.setName("556");
		this.internalSave(testA);
		transactionHelper.doInTransaction(this, "updateTest");
		TestDO testB = new TestDO();
		testB.setName("665");
		this.internalSave(testB);
	}
	
	public void testTransaction2() throws Exception {
		transactionHelper.doInTransaction(this, "updateTest2");
	}
	
	public void updateTest(Connection connection) throws Exception {
		PreparedStatement ps = connection.prepareStatement("update t_test set name = '777'");
		ps.execute();
		//		if (true) throw new Exception();
	}
	
	public void updateTest2(Connection connection) throws Exception {
		PreparedStatement ps = connection.prepareStatement("update t_test set name = '777'");
		ps.execute();
		this.addTest("abc");
		ps = connection.prepareStatement("update t_test set name = '888'");
		ps.execute();
		//		if (true) throw new Exception();
	}
	
	private void addTest(String name) throws Exception {
		TestDO test = new TestDO();
		test.setName(name);
		this.internalSave(test);
		//		if (true) throw new Exception();
	}
	
	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}
	
}
