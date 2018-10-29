/**
* Remark by wayne ,提供三个方法
* clazz.extend
* clazz.impl
* clazzobject.override
* 继承的类最好有_init方法进行初始化
*/
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
//Inspired by base2 and Prototype
(function () {
    $.u = $.u || {};
    var initializing = false, fnTest = /xyz/.test(function () { xyz; }) ? /\b_super\b/ : /.*/;

    // The base clazz implementation (does nothing)
    $.u.clazz = function () { };

    // Create a new clazz that inherits from this clazz
    $.u.clazz.extend = function (prop) {

        var _super = this.prototype;

        // Instantiate a base clazz (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == 'function' &&
              typeof _super[name] == 'function' && fnTest.test(prop[name]) ?
              (function (name, fn) {
                  return function () {
                      var tmp = this._super;

                      // Add a new ._super() method that is the same method
                      // but on the super-clazz
                      this._super = _super[name];

                      // The method only need to be bound temporarily, so we
                      // remove it when we're done executing
                      var ret = fn.apply(this, arguments);
                      this._super = tmp;

                      return ret;
                  };
              })(name, prop[name]) :
              prop[name];
        }

        // The dummy clazz constructor
        function clazz() {
            // All construction is actually done in the init method
            if (!initializing && this._init)
                this._init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        clazz.prototype = prototype;

        // Enforce the constructor to be what we expect
        clazz.prototype.constructor = clazz;
        // add by wayne in 20131011, 增加对象的override方法，针对象进行方法扩展
        clazz.prototype.override = function (im) {
            $.extend(this, im);
        }
        // add end
        // And make this clazz extendable        
        clazz.extend = arguments.callee;
        return clazz;
    };
})();