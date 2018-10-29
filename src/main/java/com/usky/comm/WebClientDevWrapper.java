package com.usky.comm;

import java.security.SecureRandom;
import java.security.cert.CertificateException;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import org.apache.http.client.HttpClient;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.scheme.SchemeSocketFactory;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.conn.BasicClientConnectionManager;



public class WebClientDevWrapper {
	
	public static HttpClient wrapClient(org.apache.http.client.HttpClient base) {
		try {
			SSLContext ctx = SSLContext.getInstance("TLS");
			TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
				@Override
				public void checkClientTrusted(java.security.cert.X509Certificate[] ax509certificate, String s)
						throws CertificateException {
					
				}
				@Override
				public void checkServerTrusted(java.security.cert.X509Certificate[] ax509certificate, String s)
						throws CertificateException {
					
				}
				@Override
				public java.security.cert.X509Certificate[] getAcceptedIssuers() {
					return null;
				}
			} };
			ctx.init(null, trustAllCerts, new SecureRandom());
			SchemeSocketFactory ssf = (SchemeSocketFactory) new SSLSocketFactory(ctx, SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER);
			SchemeRegistry registry = new SchemeRegistry();
			registry.register(new Scheme("https", 443, ssf));
			ClientConnectionManager mgr = new BasicClientConnectionManager(registry);
			return new DefaultHttpClient(mgr, base.getParams());
		} catch (Exception ex) {
			ex.printStackTrace();
			return null;
		}
	}
}
