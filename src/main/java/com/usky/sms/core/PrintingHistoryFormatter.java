// ///////////////////////////////////////////////////////////////////////////
//
// Project ProjectForge Community Edition
// www.projectforge.org
//
// Copyright (C) 2001-2012 Kai Reinhard (k.reinhard@micromata.com)
//
// ProjectForge is dual-licensed.
//
// This community edition is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License as published
// by the Free Software Foundation; version 3 of the License.
//
// This community edition is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General
// Public License for more details.
//
// You should have received a copy of the GNU General Public License along
// with this program; if not, see http://www.gnu.org/licenses/.
//
// ///////////////////////////////////////////////////////////////////////////

package com.usky.sms.core;

import java.util.Locale;

import org.apache.commons.lang.StringUtils;
import org.hibernate.HibernateException;
import org.hibernate.Session;

import com.usky.sms.user.UserDO;

import de.micromata.hibernate.history.HistoryEntry;
import de.micromata.hibernate.history.delta.PropertyDelta;
import de.micromata.hibernate.history.web.DefaultHistoryFormatter;

/**
 * @author wolle
 */
public class PrintingHistoryFormatter extends DefaultHistoryFormatter {
	
	/** The logger */
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(PrintingHistoryFormatter.class);
	
	public PrintingHistoryFormatter(final String resourceBundleName) {
		super(resourceBundleName);
	}
	
	/**
	 * Für alte Browser wird das alt-Attribute für den Tooltip missbraucht. Für
	 * neuere Browser gibt es das title-Attribute. Deshalb wird hier beides
	 * erzeugt.
	 * 
	 * @param tip
	 * @return
	 */
	private String getToolTip(final String tip) {
		return "alt=\"" + tip + "\" title=\"" + tip + "\"";
	}
	
	@Override
	public String formatUser(Session session, final Locale locale, Object changed, HistoryEntry historyEntry, PropertyDelta delta) {
		final String[] users = StringUtils.split(historyEntry.getUserName(), ",");
		if (users != null && users.length > 0) {
			try {
				final UserDO user = (UserDO) session.load(UserDO.class, Integer.valueOf(users[0]));
				final String orgUnit = escapeHtml(user);//escapeHtml(user.getOrganization());
				return "<img src=\"/images/user.gif\" valign=\"middle\" width=\"20\" height=\"20\" border=\"0\" " + getToolTip(orgUnit) + " /> " + escapeHtml(user.getFullname());
			} catch (final HibernateException ex) {
				log.warn("Can't load history-user " + historyEntry.getUserName());
				return "unknown";
			}
		}
		return escapeHtml(historyEntry.getUserName());
	}
	
}
