(function(window, undefined) {
  var dictionary = {
    "c287aa15-42a2-4770-ad83-6d82573f24d2": "jan",
    "d12245cc-1680-458d-89dd-4f0d7fb22724": "Screen 1",
    "3b032d7e-8594-4f37-88c5-23bc8a64b910": "山西分公司",
    "08fca7ff-8ec2-48c1-8322-a431be118e7d": "feb",
    "79f2e492-67eb-4e6b-9769-1d612c435860": "四川分公司",
    "58049788-df7e-422e-b3db-030d2db20551": "所有告警",
    "87db3cf7-6bd4-40c3-b29c-45680fb11462": "960 grid - 16 columns",
    "e5f958a4-53ae-426e-8c05-2f7d8e00b762": "960 grid - 12 columns",
    "f39803f7-df02-4169-93eb-7547fb8c961a": "Template 1"
  };

  var uriRE = /^(\/#)?(screens|templates|masters)\/(.*)(\.html)?/;
  window.lookUpURL = function(fragment) {
    var matches = uriRE.exec(fragment || "") || [],
        folder = matches[2] || "",
        canvas = matches[3] || "",
        name, url;
    if(dictionary.hasOwnProperty(canvas)) { /* search by name */
      url = folder + "/" + canvas;
    }
    return url;
  };

  window.lookUpName = function(fragment) {
    var matches = uriRE.exec(fragment || "") || [],
        folder = matches[2] || "",
        canvas = matches[3] || "",
        name, canvasName;
    if(dictionary.hasOwnProperty(canvas)) { /* search by name */
      canvasName = dictionary[canvas];
    }
    return canvasName;
  };
})(window);