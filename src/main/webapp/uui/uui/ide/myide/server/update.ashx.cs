using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace uui.uui.ide.myide.server
{
    /// <summary>
    /// write 的摘要说明
    /// </summary>
    public class update : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;
            var filepath = request["filepath"];
            var filecontent = request["filecontent"];
            ResponseResult result = new ResponseResult();
            if (string.IsNullOrEmpty(filepath))
            {
                result.Fail("文件名字");
            }
            if (string.IsNullOrEmpty(filecontent))
            {
                filecontent = "";
            }
            var realpath = context.Server.MapPath("~" + filepath);
            try
            {
                File.WriteAllText(realpath, filecontent);
                result.Success();
            }
            catch (Exception e)
            {
                result.Fail(e.Message.Replace('\n', ' ').Replace('\r', ' '));
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