using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace uui.uui.ide.myide.server
{
    /// <summary>
    /// get 的摘要说明
    /// </summary>
    public class get : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;
            var filepath = request["filepath"];
            ResponseResult result = new ResponseResult();
            if (string.IsNullOrEmpty(filepath))
            {
                result.Fail("文件名字");
            }
            var realpath = context.Server.MapPath("~" + filepath);
            try
            {
                FileInfo fi = new FileInfo(realpath);
                string total = "";
                string s = "";
                using (StreamReader sr = fi.OpenText())
                {                    
                    while ((s = sr.ReadLine()) != null)
                    {
                        total += s + "\n";
                    }
                }
                result.Success().AddData(total);
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