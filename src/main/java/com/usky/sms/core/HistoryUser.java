
package com.usky.sms.core;

import java.util.Locale;

import org.hibernate.Session;

import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

import de.micromata.hibernate.history.HistoryEntry;
import de.micromata.hibernate.history.HistoryUserRetriever;
import de.micromata.hibernate.history.delta.PropertyDelta;
import de.micromata.hibernate.history.web.HistoryTable;
import de.micromata.hibernate.history.web.HistoryTag;

public class HistoryUser implements HistoryUserRetriever {
	
	public static final String RESOURCE_BUNDLE_NAME = "Printing";
	
	public HistoryUser() {
		HistoryTag.setDefaultBundle(RESOURCE_BUNDLE_NAME);
		// Hook zum Registrieren des Defaultformatters
		HistoryTable.setDefaultFormat(new PrintingHistoryFormatter(RESOURCE_BUNDLE_NAME));
		HistoryTable.registerFormatter(UserDO.class, "lastLogin", new PrintingHistoryFormatter(RESOURCE_BUNDLE_NAME) {
			
			@Override
			public boolean isVisible(Session session, Locale locale, Object changed, HistoryEntry historyEntry, PropertyDelta delta) {
				return false;
			}
		});
		
		// Formatierung der History-Tabelle
		HistoryTable.registerFormatter(UserDO.class, "password", new PrintingHistoryFormatter(RESOURCE_BUNDLE_NAME) {
			
			@Override
			public String asString(Session session, final Locale locale, String className, String property, Object value) {
				return "*****"; // escapeHtml wird nicht benötigt.
			}
		});
	}
	
	////////////////////////////////	
	/**
	 * get the principal from the ThreadLocal
	 * 
	 * @see org.hibernate.HistoryUserRetriever#getPrincipal()
	 */
	@Override
	public String getPrincipal() {
		final UserDO user = UserContext.getUser();
		if (user == null) {
			return null;
		}
		return user.getUsername();
	}
	
}
