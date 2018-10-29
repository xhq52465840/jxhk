using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace uui.uui.ide.myide.server
{
    /// <summary>
    /// add 的摘要说明
    /// </summary>
    public class add : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;
            var filepath = request["filepath"];
            ResponseResult result = new ResponseResult();
            if (string.IsNullOrEmpty(filepath))
            {
                result.Fail("路径名字");
            }
            else
            {
                var realpath = context.Server.MapPath("~" + filepath);
                var typeradio = request["typeradio"];
                var filename = request["name"];
                if (string.IsNullOrEmpty(filename) && typeradio != "img")
                {
                    result.Fail("文件名字");
                }
                else
                {
                    try
                    {
                        FileInfo fi = null;
                        switch (typeradio)
                        {
                            case "module":
                                if (File.Exists(realpath + "/" + filename + ".js"))
                                {
                                    result.Fail("模块" + filename + "已存在，请删除后再试");
                                    break;
                                }
                                fi = new FileInfo(realpath + "/" + filename + ".js");
                                var clspath = filepath.Replace('/', '.');
                                if (clspath != "")
                                {
                                    clspath = clspath.Substring(1);
                                }
                                clspath += "." + filename;
                                using (StreamWriter sw = fi.CreateText())
                                {
                                    sw.WriteLine("//@ sourceURL=" + clspath);
                                    sw.WriteLine("$.u.define(\"" + clspath + "\", null, {");
                                    sw.WriteLine("    init: function () {");
                                    sw.WriteLine("");
                                    sw.WriteLine("    },");
                                    sw.WriteLine("    afterrender: function () {");
                                    sw.WriteLine("");
                                    sw.WriteLine("    },");
                                    sw.WriteLine("    resize: function () {");
                                    sw.WriteLine("");
                                    sw.WriteLine("    },");
                                    sw.WriteLine("    destroy: function () {");
                                    sw.WriteLine("        this._super();");
                                    sw.WriteLine("    }");
                                    sw.WriteLine("}, { usehtm: true, usei18n: false });");
                                    sw.WriteLine("");
                                    sw.WriteLine("");
                                    sw.WriteLine(clspath + ".widgetjs = [];");
                                    sw.WriteLine(clspath + ".widgetcss = [];");
                                }
                                fi = new FileInfo(realpath + "/" + filename + ".htm");
                                using (StreamWriter sw = fi.CreateText())
                                {
                                    sw.WriteLine("<!DOCTYPE html>");
                                    sw.WriteLine("<html xmlns=\"http://www.w3.org/1999/xhtml\">");
                                    sw.WriteLine("<head>");
                                    sw.WriteLine("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"/>");
                                    sw.WriteLine("    <title></title>");
                                    sw.WriteLine("</head>");
                                    sw.WriteLine("<body>");
                                    sw.WriteLine("");
                                    sw.WriteLine("</body>");
                                    sw.WriteLine("</html>");
                                }
                                result.Success();
                                break;
                            case "folder":
                                if (File.Exists(realpath + "/" + filename))
                                {
                                    result.Fail("文件夹" + filename + "已存在，请删除后再试");
                                    break;
                                }
                                DirectoryInfo di = new DirectoryInfo(realpath + "/" + filename);
                                di.Create();
                                result.Success().AddData(di.CreationTime.Ticks + "-" + filename);
                                break;
                            case "css":
                                if (File.Exists(realpath + "/" + filename + ".css"))
                                {
                                    result.Fail("样式" + filename + "已存在，请删除后再试");
                                    break;
                                }
                                fi = new FileInfo(realpath + "/" + filename + ".css");
                                using (StreamWriter sw = fi.CreateText())
                                {
                                    sw.WriteLine("body{");
                                    sw.WriteLine("");
                                    sw.WriteLine("}");
                                }
                                result.Success();
                                break;
                            case "html":
                                if (File.Exists(realpath + "/" + filename + ".html"))
                                {
                                    result.Fail("html" + filename + "已存在，请删除后再试");
                                    break;
                                }
                                fi = new FileInfo(realpath + "/" + filename + ".html");
                                using (StreamWriter sw = fi.CreateText())
                                {
                                    sw.WriteLine("<!DOCTYPE html>");
                                    sw.WriteLine("<html xmlns=\"http://www.w3.org/1999/xhtml\">");
                                    sw.WriteLine("<head>");
                                    sw.WriteLine("<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"/>");
                                    sw.WriteLine("    <title></title>");
                                    sw.WriteLine("</head>");
                                    sw.WriteLine("<body>");
                                    sw.WriteLine("");
                                    sw.WriteLine("</body>");
                                    sw.WriteLine("</html>");
                                }
                                result.Success();
                                break;
                            case "js":
                                if (File.Exists(realpath + "/" + filename + ".js"))
                                {
                                    result.Fail("js" + filename + "已存在，请删除后再试");
                                    break;
                                }
                                fi = new FileInfo(realpath + "/" + filename + ".js");
                                using (StreamWriter sw = fi.CreateText())
                                {
                                    sw.WriteLine("//");
                                }
                                result.Success();
                                break;
                            case "img":
                                HttpPostedFile file = request.Files[0];
                                if (File.Exists(realpath + "/" + file.FileName))
                                {
                                    result.Fail("图片" + file.FileName + "已存在，请删除后再试");
                                    break;
                                }
                                file.SaveAs(realpath + "/" + file.FileName);
                                result.Success();
                                break;
                            default:
                                result.Fail("不支持的文件类型");
                                break;
                        }
                    }
                    catch (Exception e)
                    {
                        result.Fail(e.Message.Replace('\n', ' ').Replace('\r', ' '));
                    }
                }
            }
            context.Response.Write(result);
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}