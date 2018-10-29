using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Script.Serialization;

namespace uui.com.sms.admin.usermanagement.user.server
{
    /// <summary>
    /// userlist 的摘要说明
    /// </summary>
    public class userlist : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            Thread.Sleep(1000 * 1);
            var Request = context.Request;
            var Response = context.Response;
            PagingUserClass cls = new PagingUserClass();
            cls.iTotalDisplayRecords = 100;
            cls.aaData = new List<PagingUserClass.User>();

            for (int j = 0; j < int.Parse(Request["length"]); j++)
            {
                PagingUserClass.User user = new PagingUserClass.User();
                user.id = j;
                user.username = "测试" + j;
                user.fullname = "测试全称" + j;
                user.email = "test@163" + j + ".com";
                user.logincount = 5 + j;
                user.lastlogin = DateTime.Now.AddDays(-j).ToString("yyyy-MM-dd hh:mm:ss");
                user.groups = "USKY";
                user.source = "UPS";
                cls.aaData.Add(user);
            }
            Response.Write("{\"success\": true, \"data\": " + ToJSON(cls) + "}");

        }

        public class PagingUserClass
        {
            public int iTotalRecords { get; set; }
            public int iTotalDisplayRecords { get; set; }
            public string sEcho { get; set; }
            public List<User> aaData { get; set; }
            public class User
            {
                public int id { get; set; }
                public string username { get; set; }
                public string fullname { get; set; }
                public string email { get; set; }
                public int logincount { get; set; }
                public string lastlogin { get; set; }
                public string groups { get; set; }
                public string source { get; set; }
                
            }
        }

        public static string ToJSON(object obj)
        {
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            return serializer.Serialize(obj);
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