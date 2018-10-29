using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Web;
using System.Web.Script.Serialization;

namespace uui.com.sms.admin.usermanagement.server
{
    /// <summary>
    /// globalpermissionlist 的摘要说明
    /// </summary>
    public class globalpermissionlist : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            Thread.Sleep(1000 * 1);
            var Request = context.Request;
            var Response = context.Response;
            PagingGlobaPermissionClass cls = new PagingGlobaPermissionClass();
            cls.iTotalDisplayRecords = 100;
            cls.iTotalRecords = 100;
            cls.aaData = new List<PagingGlobaPermissionClass.GlobalPermission>();

            for (int j = 0; j < int.Parse(Request["length"]); j++)
            {
                PagingGlobaPermissionClass.GlobalPermission globalPermission = new PagingGlobaPermissionClass.GlobalPermission();
                globalPermission.id = j;
                globalPermission.name = "测试权限集" + j;
                globalPermission.desc = "此权限集的描述"+j;
                globalPermission.note = "此权限集的备注====+++" + j;
                globalPermission.items=new List<PagingGlobaPermissionClass.GlobalPermission.UserOrGroup>();
                for (int k = 0; k < 2; k++) {
                    PagingGlobaPermissionClass.GlobalPermission.UserOrGroup userOrGroup = new PagingGlobaPermissionClass.GlobalPermission.UserOrGroup();
                    userOrGroup.id = k;
                    if (k < 1)
                    {
                        userOrGroup.name = "zhangshan" + j;
                        userOrGroup.type = "user";
                    }
                    else {
                        userOrGroup.name = "sms-groups" + j;
                        userOrGroup.type = "group";
                    }
                    globalPermission.items.Add(userOrGroup);
                }
                    cls.aaData.Add(globalPermission);
            }
            Response.Write("{\"success\": true, \"data\": " + ToJSON(cls) + "}");
        }


        public class PagingGlobaPermissionClass
        {
            public int iTotalRecords { get; set; }
            public int iTotalDisplayRecords { get; set; }
            public string sEcho { get; set; }
            public List<GlobalPermission> aaData { get; set; }
            public class GlobalPermission
            {
                public int id { get; set; }
                public string name { get; set; }
                public string desc { get; set; }
                public string note { get; set; }
                public List<UserOrGroup> items { get; set; }
                public class UserOrGroup {
                    public int id { get; set; }
                    public string name { get; set; }
                    public string type { get; set; }
                }

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