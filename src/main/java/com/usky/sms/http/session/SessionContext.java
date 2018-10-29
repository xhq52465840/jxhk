
package com.usky.sms.http.session;

import javax.servlet.http.HttpSession;

	
public class SessionContext {
	
	private static ThreadLocal<HttpSession> context = new ThreadLocal<HttpSession>();
	
	/**
	 * @return The session of ThreadLocal if exists.
	 */
	public final static HttpSession getHttpSession() {
		return context.get();
	}
	
	/**
	 * @param session
	 */
	public final static void setSession(final HttpSession session) {
		context.set(session);
	}
	
	/**
	 * @param session
	 */
	public final static Object getAttribute(final String key) {
		return context.get() == null ? null : context.get().getAttribute(key);
	}
	
}
