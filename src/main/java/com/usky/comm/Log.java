package com.usky.comm;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class Log {
	private final boolean dft_with_console = true;
	
	protected String fileName = "";
	protected String lastFileName = "";
	protected PrintWriter pw = null;
	
	public Log(String fn){
		fileName = fn;
	}
	
	protected void finalize(){
		Close();
		
		try {
			super.finalize();
		} catch (Throwable e) {
			e.printStackTrace();
		}
	}
	
	protected void Close(){
		if (pw != null){
			pw.close();
			//System.out.println((new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).format(new Date()) + " 关闭日志文件" + lastFileName);
			pw = null;
			lastFileName = fileName;
			fileName = "";
		}
	}
	
	public String GetFilename(){
		return lastFileName;
	}
	
	public void Write(Exception e, String msg, boolean withconsole) {
		if (e == null)
			return;
		StackTraceElement[] ste = e.getStackTrace();
		for (int i = ste.length - 1; i >= 0; i--) {
			Write(ste[i].toString(), true, true, withconsole);
		}
		Write((msg + Utility.GetExceptionMsg(e)).trim(), true, true, withconsole);
	}
	
	public void Write(Exception e) {
		Write(e, "");
	}
	
	public void Write(Exception e, String msg) {
		Write(e, msg, dft_with_console);
	}
	
	public synchronized void Write(String msg, boolean withtime, boolean withreturn, boolean withconsole){
		if ("".equals(fileName))
			return;
		
		String fn = fileName + "." + (new SimpleDateFormat("EEEE", Locale.US)).format(new Date()) + ".log";
		if (!fn.equals(lastFileName))
			Close();

		if (pw == null){
			boolean bNew = false;
			
			File f = new File(fn);
			if (f.exists() && (new Date()).getTime() - f.lastModified() > 2 * 86400 * 100)
				bNew = true;
			
			@SuppressWarnings("unused")
			long lm = 0;	//for debug
			if (f.exists())
				lm = f.lastModified();
			else
				bNew = true;

			if (f.getParentFile() != null && !f.getParentFile().exists())
				f.getParentFile().mkdirs();
			try {
				if (bNew){
					pw = new PrintWriter(new FileWriter(f), true);
					System.out.println((new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).format(new Date()) + " 创建日志文件" + f.getAbsolutePath());
				}
				else{
					pw = new PrintWriter(new FileWriter(f, true), true);
					pw.println();
					pw.println();
					System.out.println((new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).format(new Date()) + " 打开日志文件" + f.getAbsolutePath());
				}
			} catch (IOException e) {
				System.out.println((new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).format(new Date()) + " 打开日志文件" + fn + "失败：" + e.getLocalizedMessage());
				return;
			}
			lastFileName = fn;
			//pw.printf("%d - %d = %d\r\n", (new Date()).getTime(),lm,(new Date()).getTime() - lm);	//for debug
			//pw.println(String.valueOf((new Date()).getTime()) + " " + String.valueOf(lm) + " " + String.valueOf((new Date()).getTime() - lm));	//for debug
		}
		
		String text = "";
		if (withtime)
			text = (new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).format(new Date()) + " " + msg;
		else
			text = msg;

		if (withreturn)
			pw.println(text);
		else
			pw.print(text);
		if (withconsole){
			if (withreturn)
				System.out.println(text);
			else
				System.out.println(text);
		}
		pw.flush();
	}
	
    public void WriteLine(String text)
    {
        WriteLine(text, true);
    }

    public void WriteLine(String text, boolean withtime)
    {
        Write(text, withtime, true);
    }

    public void WriteLine()  //写一空行
    {
        Write("", false);
    }

    public void Write(String text)
    {
        Write(text, true, false);
    }

    public void Write(String text, boolean withtime)
    {
        Write(text, withtime, false);
    }

    public void Write(String text, boolean withtime, boolean withreturn)
    {
        Write(text, withtime, withreturn, dft_with_console);
    }
}
