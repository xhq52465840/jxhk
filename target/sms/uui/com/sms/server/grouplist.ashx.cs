using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Script.Serialization;

namespace uui.com.sms.admin.usermanagement.server
{
    /// <summary>
    /// grouplist 的摘要说明
    /// </summary>
    public class grouplist : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            Thread.Sleep(1000 * 1);
            var Request = context.Request;
            var Response = context.Response;
            PagingGroupClass cls = new PagingGroupClass();
            cls.iTotalDisplayRecords = 100;
            cls.aaData = new List<PagingGroupClass.Group>();

            for (int j = 0; j < int.Parse(Request["length"]); j++)
            {
                PagingGroupClass.Group group = new PagingGroupClass.Group();
                group.id = j;
                group.name = "测试用户组" + j;
                group.usercount = j;
                group.permissionscheme = "权限方案" + j;
                cls.aaData.Add(group);
            }
            Response.Write("{\"success\": true, \"data\": " + ToJSON(cls) + "}");
        }


        public class PagingGroupClass
        {
            public int iTotalRecords { get; set; }
            public int iTotalDisplayRecords { get; set; }
            public string sEcho { get; set; }
            public List<Group> aaData { get; set; }
            public class Group
            {
                public int id { get; set; }
                public string name { get; set; }
                public int usercount { get; set; }
                public string permissionscheme { get; set; }

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