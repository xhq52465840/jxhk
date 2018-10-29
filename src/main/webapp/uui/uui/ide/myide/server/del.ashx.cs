using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace uui.uui.ide.myide.server
{
    /// <summary>
    /// del 的摘要说明
    /// </summary>
    public class del : IHttpHandler
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
                try
                {
                    FileInfo fi = null;
                    switch (typeradio)
                    {
                        case "module":
                            fi = new FileInfo(realpath + ".js");
                            fi.Delete();
                            fi = new FileInfo(realpath + ".htm");
                            fi.Delete();
                            break;
                        case "folder":
                            DirectoryInfo di = new DirectoryInfo(realpath);
                            di.Delete(true);
                            break;
                        default:
                            fi = new FileInfo(realpath);
                            fi.Delete();
                            break;
                    }
                    result.Success();
                }
                catch (Exception e)
                {
                    result.Fail(e.Message.Replace('\n', ' ').Replace('\r', ' '));
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