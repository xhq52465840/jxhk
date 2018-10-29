package com.test;

import java.io.*;
public class readFile {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		 try {
             readfile("C:/Users/usky/git/smsmain/sms/src/main/java/com/usky");
		 } catch (FileNotFoundException ex) {
			 
		 } catch (IOException ex) {
			 
		 }
	}

	 public static boolean readfile(String filepath) throws FileNotFoundException, IOException {
         try {

                 File file = new File(filepath);
                 if (!file.isDirectory()) {
                	 String path = file.getPath();
                	 path = path.replaceAll("\\\\", "\\/");
                	 path = path.replaceAll("C:/Users/usky/git/smsmain/sms/src/main/java", "/WEB-INF/classes");
                	 if(path.indexOf("plugin.xml") > 0){
                		 System.out.print(path+",");
                	 }
                 } else if (file.isDirectory()) {
                         String[] filelist = file.list();
                         for (int i = 0; i < filelist.length; i++) {
                                 File readfile = new File(filepath + "\\" + filelist[i]);
                                 if (!readfile.isDirectory()) {
                                	 
                                	 String path = readfile.getPath();
                                	 path = path.replaceAll("\\\\", "\\/");
                                	 path = path.replaceAll("C:/Users/usky/git/smsmain/sms/src/main/java", "/WEB-INF/classes");
                                	 if(path.indexOf("plugin.xml") > 0){
                                		 System.out.print(path+",");
                                	 }
                                	 
                                 } else if (readfile.isDirectory()) {
                                         readfile(filepath + "\\" + filelist[i]);
                                 }
                         }

                 }

         } catch (FileNotFoundException e) {
                 System.out.println("readfile()   Exception:" + e.getMessage());
         }
         return true;
 }
}
