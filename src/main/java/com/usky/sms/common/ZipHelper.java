package com.usky.sms.common;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

import org.apache.commons.io.IOUtils;
import org.apache.tools.zip.ZipEntry;
import org.apache.tools.zip.ZipFile;
import org.apache.tools.zip.ZipOutputStream;

public class ZipHelper {

	public static void zip(String src, String dest, List<String> filter)
			throws Exception {
		ZipOutputStream out = new ZipOutputStream(new FileOutputStream(dest));
		File srcFile = new File(src);
		zip(out, srcFile, "", filter);
		out.close();
	}

	public static void zip(ZipOutputStream out, File srcFile, String base,
			List<String> filter) throws Exception {
		if (srcFile.exists() == false) {
			throw new Exception("压缩目录不存在!");
		}

		if (srcFile.isDirectory()) {
			File[] files = srcFile.listFiles();
			base = base.length() == 0 ? "" : base + "/";
			if (isExist(base, filter)) {
				out.putNextEntry(new ZipEntry(base));
			}
			for (int i = 0; i < files.length; i++) {
				zip(out, files[i], base + files[i].getName(), filter);
			}
		} else {
			if (isExist(base, filter)) {
				base = base.length() == 0 ? srcFile.getName() : base;
				ZipEntry zipEntry = new ZipEntry(base);
				out.putNextEntry(zipEntry);
				FileInputStream in = new FileInputStream(srcFile);
				int length = 0;
				byte[] b = new byte[1024];
				while ((length = in.read(b, 0, 1024)) != -1) {
					out.write(b, 0, length);
				}
				in.close();
			}
		}

	}

	public static boolean isExist(String base, List<String> list) {
		if (list != null && !list.isEmpty()) {
			for (int i = 0; i < list.size(); i++) {
				if (base.indexOf(list.get(i)) >= 0) {
					return true;
				}
			}
		}
		return false;
	}

	public static void unZip(String srcFile, String dest, boolean deleteFile)
			throws Exception {
		unZip(new File(srcFile), dest, deleteFile);
	}

	public static void unZip(File srcFile, String dest, boolean deleteFile)
			throws Exception {
		if (!srcFile.exists()) {
			throw new Exception("解压文件不存在!");
		}
		ZipFile zipFile = new ZipFile(srcFile);
		Enumeration<ZipEntry> e = zipFile.getEntries();
		char lastChar = dest.charAt(dest.length() - 1);
		if (lastChar != '/')
			dest = dest + "/";
		while (e.hasMoreElements()) {
			ZipEntry zipEntry = e.nextElement();
			if (zipEntry.isDirectory()) {
				String name = zipEntry.getName();
				name = name.substring(0, name.length() - 1);
				File f = new File(dest + name);
				f.mkdirs();
			} else {
				File f = new File(dest + zipEntry.getName());
				f.getParentFile().mkdirs();
				f.createNewFile();
				InputStream is = zipFile.getInputStream(zipEntry);
				FileOutputStream fos = new FileOutputStream(f);
				int length = 0;
				byte[] b = new byte[1024];
				while ((length = is.read(b, 0, 1024)) != -1) {
					fos.write(b, 0, length);
				}
				is.close();
				fos.close();
			}
		}

		if (zipFile != null) {
			zipFile.close();
		}

		if (deleteFile) {
			srcFile.deleteOnExit();
		}
	}

	public static String getZipComment(String srcFile) {
		String comment = "";
		try {
			ZipFile zipFile = new ZipFile(srcFile);
			Enumeration<ZipEntry> e = zipFile.getEntries();

			while (e.hasMoreElements()) {
				ZipEntry ze = e.nextElement();

				comment = ze.getComment();
				if (comment != null && !comment.equals("")
						&& !comment.equals("null")) {
					break;
				}
			}

			zipFile.close();
		} catch (Exception e) {
			System.out.println("获取zip文件注释信息失败:" + e.getMessage());
		}

		return comment;
	}

	/**
	 * @description 压缩文件或目录（包含子目录压缩）
	 * @param baseDir
	 *            待压缩目录或文件
	 * @param dest
	 *            压缩后的文件名
	 */
	public static void zip(String baseDir, String dest) {
		File sourceFile = new File(baseDir);
		File destFile = new File(dest);
		ZipOutputStream zos = null;
		try {
			if (sourceFile.isFile()) {// 单个文件压缩
				zos = new ZipOutputStream(new FileOutputStream(destFile));
				zipFile(baseDir, sourceFile, zos);
			} else {// 文件夹压缩
				List<File> fileList = getSubFiles(sourceFile);
				zos = new ZipOutputStream(new FileOutputStream(destFile));
				for (int i = 0; i < fileList.size(); i++) {
					File subFile = (File) fileList.get(i);
					zipFile(baseDir, subFile, zos);
				}
			}
		} catch (IOException e) {
			e.getMessage();
		} finally {
			IOUtils.closeQuietly(zos);
		}
	}

	/**
	 * @description 压缩文件
	 * @param baseDir
	 *            基本目录
	 * @param file
	 *            本次压缩的文件
	 * @param zos
	 * @throws IOException
	 * @throws FileNotFoundException
	 */
	private static void zipFile(String baseDir, File file, ZipOutputStream zos)
			throws IOException, FileNotFoundException {
		byte[] buf = new byte[1024];
		int readLen = 0;
		ZipEntry ze = new ZipEntry(getAbsFileName(baseDir, file));
		ze.setSize(file.length());
		ze.setTime(file.lastModified());
		zos.putNextEntry(ze);
		// 支持中文
		zos.setEncoding("GBK");
		InputStream is = new BufferedInputStream(new FileInputStream(file));
		while ((readLen = is.read(buf, 0, 1024)) != -1) {
			zos.write(buf, 0, readLen);
		}
		IOUtils.closeQuietly(is);
	}

	/**
	 * 给定根目录，返回另一个文件名的相对路径，用于zip文件中的路径.
	 * 
	 * @param baseDir
	 *            java.lang.String 根目录
	 * @param realFileName
	 *            java.io.File 实际的文件名
	 * @return 相对文件名
	 */
	private static String getAbsFileName(String baseDir, File realFileName) {
		File real = realFileName;
		File base = new File(baseDir);
		String ret = real.getName();
		// baseDir 为文件时，直接返回
		if (real.equals(base)) {
			return ret;
		} else {
			while (true) {
				real = real.getParentFile();
				if (real == null || real.equals(base)) {
					break;
				} else {
					ret = real.getName() + "/" + ret;
				}
			}
		}
		return ret;
	}

	/**
	 * 取得指定目录下的所有文件列表，包括子目录下的文件.
	 * 
	 * @param baseDir
	 *            File 指定的目录
	 * @return 包含java.io.File的List
	 */
	private static List<File> getSubFiles(File baseDir) {
		List<File> ret = new ArrayList<File>();
		File[] tmp = baseDir.listFiles();
		for (int i = 0; i < tmp.length; i++) {
			if (tmp[i].isFile()) {
				ret.add(tmp[i]);
			}
			if (tmp[i].isDirectory()) {
				ret.addAll(getSubFiles(tmp[i]));
			}
		}
		return ret;
	}

}
