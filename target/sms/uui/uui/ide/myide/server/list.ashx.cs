using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Web;

namespace uui.uui.ide.myide.server
{
    /// <summary>
    /// list 的摘要说明
    /// </summary>
    public class list : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            var request = context.Request;
            var response = context.Response;
            var dirname = request["dirname"];
            if (string.IsNullOrEmpty(dirname))
            {
                dirname = "";
            }
            var realpath = context.Server.MapPath("~" + dirname);
            try
            {
                List<FolderItem> allnames = new List<FolderItem>();
                DirectoryInfo adirfolder = new DirectoryInfo(realpath);
                string parentId = "0";
                if (!string.IsNullOrEmpty(dirname))
                {
                    parentId = adirfolder.CreationTime.Ticks + "-" + adirfolder.Name;
                }
                DirectoryInfo[] dirs = adirfolder.GetDirectories();
                foreach (DirectoryInfo adir in dirs)
                {
                    var dirName = adir.Name;
                    if (dirName.Equals("bin") || dirName.Equals("obj") || dirName.Equals("aspnet_client") || dirName.Equals("Properties") || dirName.StartsWith("_") || dirName.StartsWith("uui"))
                    {
                        continue;
                    }
                    else
                    {
                        allnames.Add(new FolderItem() { id = adir.CreationTime.Ticks + "-" + dirName, name = dirName, isParent = true, pId = parentId });
                    }
                }
                FileInfo[] files = adirfolder.GetFiles();
                foreach (FileInfo afile in files)
                {
                    var fileName = afile.Name;
                    if (fileName.EndsWith(".htm") && File.Exists(afile.FullName.Substring(0, afile.FullName.Length - 3) + "js"))
                    {
                        continue;
                    }
                    else
                    {
                        if (fileName.Contains(".csproj") || fileName.StartsWith("Web."))
                        {
                            continue;
                        }
                        else
                        {
                            if (fileName.EndsWith(".js") && File.Exists(afile.FullName.Substring(0, afile.FullName.Length - 2) + "htm"))
                            {
                                allnames.Add(new FolderItem() { id = afile.CreationTime.Ticks + "-" + fileName, name = fileName.Substring(0, fileName.Length - 3), isParent = false, iconSkin = "module", pId = parentId });
                            }
                            else
                            {
                                var fitem = new FolderItem() { id = afile.CreationTime.Ticks + "-" + fileName, name = fileName, isParent = false, pId = parentId };
                                if (fileName.EndsWith(".js"))
                                {
                                    fitem.iconSkin = "js";
                                }
                                else if (fileName.EndsWith(".css"))
                                {
                                    fitem.iconSkin = "css";
                                }
                                else if (fileName.EndsWith(".htm") || fileName.EndsWith(".html"))
                                {
                                    fitem.iconSkin = "html";
                                }
                                else if (fileName.EndsWith(".jpg") || fileName.EndsWith(".png") || fileName.EndsWith(".gif"))
                                {
                                    fitem.iconSkin = "img";
                                }
                                allnames.Add(fitem);
                            }
                        }
                    }
                }
                context.Response.Write(ResponseResult.Create().AddData(allnames));
            }
            catch (Exception e)
            {
                context.Response.Write(ResponseResult.Create(false, "文件目录读取错误：" + e.Message.Replace('\n', ' ').Replace('\r', ' ')));
            }

        }

        public class FolderItem
        {
            public string id { set; get; }
            public string name { set; get; }
            public bool isParent { set; get; }
            public string iconSkin { set; get; }
            public string pId { set; get; }
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