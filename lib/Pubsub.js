;(function (root, factory) {
    if(typeof define === "function" && define.amd) {
        define('PubSub',[],function(){
            return factory(root);
        });
    } else if(typeof module === "object" && module.exports) {
        module.exports = factory(root);
    } else {
        root.PubSub = factory(root);
    }
}(this, function(global) {
    function isArray(obj){
        return typeof Array.isArray === 'function' ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]'
    }
    function forEach(obj, fn, context){
        if(isArray(obj)){
            if(typeof obj.forEach === 'function'){
                obj.forEach(fn, context)
            } else {
                for(var i=0, length=obj.length; i<length; i++){
                    fn.call(context, obj[i], i, obj);
                }
            }
        } else {
            for (var key in obj){
                if(Object.prototype.hasOwnProperty.call(obj, key)){
                    fn.call(context, obj[key], key, obj);
                }
            }
        }
    }

    function getRegExp(text){
        return new RegExp('^'+text.replace('.', '\\.')+'(\\.|$)');
    }

    function PubSub(){
        this._messagePool = {};
    }
    var proto = PubSub.prototype;
    proto.on = function(msg, fn, context){
        var pool = this._messagePool[msg] || (this._messagePool[msg] = []);
        pool.push({callback:fn, context: context || this});
        return this;
    }
    proto.once = function(msg, fn, context){
        var self = this;
        var cb = function(){
            self.off(msg, cb);
            fn.apply(this, arguments);
        }
        return this.on(msg, cb, context);
    }
    proto.off = function(msg, fn){
        var message, listener;
        if(typeof msg === 'string'){
            message = msg;
            listener = fn;
        } else if(typeof msg === 'function') {
            listener = msg;
        }
        if(!message && !listener){
            this._messagePool = {};
        } else {
            forEach(this._messagePool, function(value, key){
                var reg = message ? getRegExp(message) : new RegExp();
                if(message && !listener){
                    if(reg.test(key)) delete this._messagePool[key];
                } else {
                    forEach(value, function(list, index){
                        if(message && listener && reg.test(key) && list.callback === listener){
                            value.splice(index, 1);
                        } else if(!message && listener && list.callback === listener){
                            value.splice(index, 1);
                        }
                    }, this)
                }
            }, this)
        }
        return this;
    }
    proto.trigger = function(msg, data){
        if(typeof msg === 'undefined') return;
        data = Array.prototype.slice.call(arguments, 1);
        forEach(this._messagePool, function(value, key){
            if(getRegExp(msg).test(key))
                forEach(value, function(list, index){
                    list.callback.apply(list.context, data);
                }, this)
        }, this)
    }
    PubSub.mixTo = function(Receiver){
        var obj = Receiver;
        if(Object.prototype.toString.call(Receiver) === '[object Function]'){
            obj = Receiver.prototype;
        }
        obj._messagePool = {};
        forEach(PubSub.prototype, function(value, key){
            obj[key] = value;
        });
        return Receiver;
    }
    return PubSub;
}))