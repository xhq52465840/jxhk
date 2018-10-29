using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace uui.uuitest.wiget.fullcalendar.demos
{
    /// <summary>
    /// events 的摘要说明
    /// </summary>
    public class events : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string val = "[{\"id\":111,\"title\":\"Event1\",\"start\":\"2014-02-15\",\"url\":\"http:\\/\\/yahoo.com\\/\"},{\"id\":222,\"title\":\"Event2\",\"start\":\"2014-02-20\",\"end\":\"2014-02-22\",\"url\":\"http:\\/\\/yahoo.com\\/\"}]"; 
            context.Response.Write(val);
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