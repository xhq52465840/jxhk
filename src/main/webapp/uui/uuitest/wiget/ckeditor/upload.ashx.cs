using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace uui.uuitest.wiget.ckeditor
{
    /// <summary>
    /// upload 的摘要说明
    /// </summary>
    public class upload : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            String callback = context.Request["CKEditorFuncNum"];
            HttpPostedFile file = context.Request.Files[0];            
            file.SaveAs(context.Request.MapPath(".") + "/uploadImg/" + file.FileName);
            context.Response.Write("<script type=\"text/javascript\">window.parent.CKEDITOR.tools.callFunction(" + callback + ",'" + "/uuitest/wiget/ckeditor/uploadImg/" + file.FileName + "','')</script>");
            context.Response.End();
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