using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;

namespace uui.uuitest.wiget.layoutajax
{
    /// <summary>
    /// sim 的摘要说明
    /// </summary>
    public class sim : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            // 300s
            Thread.Sleep(300000);
            context.Response.ContentType = "text/plain";
            context.Response.Write("Hello World");
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