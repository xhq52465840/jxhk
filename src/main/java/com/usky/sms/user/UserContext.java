
package com.usky.sms.user;

public class UserContext {
	
	private static ThreadLocal<UserDO> context = new ThreadLocal<UserDO>();
	
	/**
	 * @return The user of ThreadLocal if exists.
	 */
	public final static UserDO getUser() {
		return context.get();
	}
	
	/**
	 * @param user
	 */
	public final static void setUser(final UserDO user) {
		context.set(user);
	}
	
	/**
	 * @return The user id of the ThreadLocal user if exists.
	 * @see #getUser()
	 */
	public final static Integer getUserId() {
		final UserDO user = getUser();
		return user != null ? user.getId() : null;
	}
	
	/**
	 * @return The user id of the ThreadLocal user if exists.
	 * @see #getUser()
	 */
	public final static String getUsername() {
		final UserDO user = getUser();
		return user != null ? user.getUsername() : null;
	}
	
}
