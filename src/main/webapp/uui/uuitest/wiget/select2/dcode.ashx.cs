using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace uui.uuitest.wiget.select2
{
    /// <summary>
    /// dcode 的摘要说明
    /// </summary>
    public class dcode : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string id = context.Request["id"];
            List<IDTextPair> data = new List<IDTextPair>();
            foreach (string n in getNames(id))
            {
                data.Add(new IDTextPair() { id = n, text = n });
            }
            context.Response.Write(ToJSON(data));
        }

        public static string ToJSON(object obj)
        {
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            return serializer.Serialize(obj);
        }

        public class IDTextPair
        {
            public string id { get; set; }
            public string text { get; set; }
        }

        private static List<string> generatedNames = null;

        private static List<string> getNames(string queryname)
        {
            if (generatedNames == null)
            {
                generatedNames = new List<string>();
                string[] prefixs = new string[] { "A", "B", "a", "测", "试" };
                foreach (string prefix in prefixs)
                {
                    for (int i = 0; i < 20; i++)
                    {
                        generatedNames.Add(prefix + i);
                    }
                }
            }
            if (string.IsNullOrEmpty(queryname))
            {
                return generatedNames;
            }
            else
            {
                var result = from n in generatedNames where n.Contains(queryname) select n;
                return new List<string>(result);
            }
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