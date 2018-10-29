using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Web;
using System.Web.Script.Serialization;

namespace uui.uui.ide.myide.server
{
    public class Common
    {
        /// <summary>
        /// obj转json
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static string ToJSON(object obj)
        {
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            return serializer.Serialize(obj);
        }

        /// <summary>
        /// JSON转obj
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="json"></param>
        /// <returns></returns>
        public static T JSONToObj<T>(string json)
        {
            if (string.IsNullOrEmpty(json))
                return default(T);
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            return serializer.Deserialize<T>(json);
        }

        private static T Deserialize<T>(string json)
        {
            T obj = Activator.CreateInstance<T>();
            using (MemoryStream ms = new MemoryStream(Encoding.UTF8.GetBytes(json)))
            {
                DataContractJsonSerializer serializer = new DataContractJsonSerializer(obj.GetType());
                return (T)serializer.ReadObject(ms);
            }
        }
    }

    /// <summary>
    /// 返回对象
    /// </summary>
    public class ResponseResult
    {
        public List<string> tmp = new List<string>();

        /// <summary>
        /// 构造函数，不带data的，可创建正确错误的
        /// </summary>
        /// <param name="success"></param>
        /// <param name="failreason"></param>
        /// <returns></returns>
        public static ResponseResult Create(bool success, string failreason)
        {
            if (success)
            {
                return new ResponseResult().Success();
            }
            else
            {
                return new ResponseResult().Fail(failreason);
            }
        }

        /// <summary>
        /// 只创建个success的
        /// </summary>
        /// <returns></returns>
        public static ResponseResult Create()
        {
            return new ResponseResult().Success();
        }

        public ResponseResult Success()
        {
            tmp.Add("\"success\":true");
            return this;
        }

        public ResponseResult Fail(string reason)
        {
            tmp.Add("\"success\":false,\"reason\":\"" + reason + "\"");
            return this;
        }

        public ResponseResult AddData(object obj)
        {
            tmp.Add("\"data\":" + Common.ToJSON(obj));
            return this;
        }

        public override string ToString()
        {
            string result = "{";
            for (int i = 0; i < tmp.Count; i++)
            {
                if (i > 0)
                {
                    result += "," + tmp[i];
                }
                else
                {
                    result += tmp[0];
                }
            }
            result += "}";
            return result;
        }

        public void clear()
        {
            tmp.Clear();
        }
    }
}