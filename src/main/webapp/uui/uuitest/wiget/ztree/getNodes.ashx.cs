using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace uui.uuitest.wiget.ztree
{
    /// <summary>
    /// getNodes 的摘要说明
    /// </summary>
    public class getNodes : IHttpHandler
    {
        public void ProcessRequest(HttpContext context)
        {
            var pid = context.Request["id"];
            List<KVPair> children = new List<KVPair>();
            if (string.IsNullOrEmpty(pid))
            {
                for (int i = 1; i < 5; i++)
                    children.Add(new KVPair() { id = i, name = "节点" + i, isParent = true });
            }
            else
            {
                for (int i = 1; i < 5; i++)
                {
                    children.Add(new KVPair() { id = int.Parse(pid + i), name = "节点" + int.Parse(pid + i) , isParent = true});
                }
            }
            context.Response.Write(ToJSON(children));
        }

        public static string ToJSON(object obj)
        {
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            return serializer.Serialize(obj);
        }

        public class KVPair
        {
            public int id { get; set; }
            public string name { get; set; }
            public bool isParent { get; set; }
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