using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Script.Serialization;

namespace uui.com.sms.admin.usermanagement.server
{
    /// <summary>
    /// rolelist 的摘要说明
    /// </summary>
    public class rolelist : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            Thread.Sleep(1000 * 1);
            var Request = context.Request;
            var Response = context.Response;
            PagingRoleClass cls = new PagingRoleClass();
            cls.iTotalDisplayRecords = 100;
            cls.aaData = new List<PagingRoleClass.Role>();

            for (int j = 0; j < int.Parse(Request["length"]); j++)
            {
                PagingRoleClass.Role role = new PagingRoleClass.Role();
                role.id = j;
                role.name = "角色" + j;
                role.desc = "备注"+j;
                cls.aaData.Add(role);
            }
            Response.Write("{\"success\": true, \"data\": " + ToJSON(cls) + "}");
        }


        public class PagingRoleClass
        {
            public int iTotalRecords { get; set; }
            public int iTotalDisplayRecords { get; set; }
            public string sEcho { get; set; }
            public List<Role> aaData { get; set; }
            public class Role
            {
                public int id { get; set; }
                public string name { get; set; }
                public string desc { get; set; }

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