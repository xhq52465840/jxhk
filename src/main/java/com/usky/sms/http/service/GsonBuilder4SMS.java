
package com.usky.sms.http.service;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.usky.sms.eiosa.HibernateProxyTypeAdapter;

public class GsonBuilder4SMS {
	
	private static Gson instance = null;
	
	public static Gson getInstance() {
		if (instance == null) {
			GsonBuilder gsonBuilder = new GsonBuilder();
			gsonBuilder.registerTypeAdapter(Object.class, new GsonNaturalDeserializer());
			gsonBuilder.registerTypeAdapterFactory(HibernateProxyTypeAdapter.FACTORY); 
			return gsonBuilder.serializeNulls().create();
		}
		return instance;
	}
	
}
