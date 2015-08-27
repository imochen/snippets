/**
 * 
 * Copyright (c) skycamp 2013
 *
 * last-modifiy : 2015.08.27
 * 
 * author: mochen
 * 
 * ----------------------------------------------
 *
 * Tips : 使用Zepto需引入 callback 、 deferred 模块
 * 
 */

(function( window ){

	"use strict";

	var $ = window.jQuery ? jQuery : Zepto,


		/**
		 * [MFrame 核心命名空间]
		 */
		MFrame = window.MFrame = {

			$ : $, //框架
			
			utils : {}, //通用工具模块
			
			ui : {}, //UI操作模块
			
			data : {}, //数据处理模块
			
			events : {} //事件模块

		},


		$ = MFrame.$,

		$events = $( MFrame.events ),


		guid = parseInt(new Date().getTime().toString().substr(4), 10),

		getUid = function(){
			return guid++;
		},

		Logic = function(props) {

			this.name = 'func_' + getUid();
			this.extend(props);

			this._initFlag = false;
			this._data = {};

		};

	$.extend( Logic.prototype , {
		/**
		 * 初始化函数
		 */
		init : function() {
			var self = this;
			if (!self._initFlag) {
				self._initFlag = true;
				MFrame.ui[self.name].init(self);
			}
			return self;
		},
		/**
		 * 获取是否已经初始化的标记
		 * @returns {boolean}
		 */
		isInit: function() {
			return this._initFlag;
		},
		/**
		 * 获取数据
		 * @param {String} key
		 * @param {*} defaultValue
		 * @returns {*}
		 */
		get : function(key, defaultValue) {
			var value = this._data[key];
			return value !== undefined ? value : defaultValue;
		},
		/**
		 * 设置数据
		 * @param {String|Object} key
		 * @param {*} value
		 */
		set : function(key, value) {
			if ( $.isPlainObject(key) ) {
				$.extend( this._data , key );
			} else {
				this._data[key] = value;
			}
			return this;
		},
		/**
		 * 清理数据
		 */
		clear : function() {
			this._data = {};
			return this;
		},
		
		/**
		 * 扩展实例方法
		 */
		extend : function() {
			var args = [].slice.apply(arguments);
			args.unshift(this);
			$.extend.apply(null, args);
		}
	});
	
	$.each(['on', 'off', 'one', 'trigger'], function(i, type) {
		Logic.prototype[type] = function() {
			$.fn[type].apply($events, arguments);
			return this;
		};
	});

	MFrame.getLogic = function(props) {
		return new Logic(props);
	};


	var Sync = function(param, ajaxOpt) {
		if(!param) {
            return;
        }
        var protocol = this.protocol = 'http';
 
        var ajaxOptDefault = {
            url: protocol + '://'+location.host,
            type: 'GET',
            dataType: 'jsonp',
            timeout: 20000
        };
 
        this.protocol = protocol;
        this.param = $.extend({}, param);
        this.ajaxOpt = $.extend({data: this.param}, ajaxOptDefault, ajaxOpt);
        this.HOST = protocol + '://'+location.host;
    };
	
 
    $.extend( Sync.prototype , {
        /**
         * 通过get方式(jsonp)提交
         * @param {String} [url] 请求链接
         * @return {Object} promise对象
         */
        get: function(url) {
            var self = this;
            var send = $.ajax( $.extend( this.ajaxOpt ,{ url : url}) );
            return send.then( this.done, function( status ) {
                return self.fail( status );
            });
        },
        /**
         * 收到响应时默认回调
         * @param {Object} data 数据
         * @return {Object}
         */
        done: function (data) {
            var deferred = $.Deferred();
			deferred.resolve(data);
            return deferred.promise();
        },
        /**
         * 未收到响应时默认回调
         * @param {Object} error 错误信息
         * @return {Object}
         */
        fail: function(error) {
            var deferred = $.Deferred();
            deferred.reject({
                errno: 999999,
                errmsg: '网络连接超时，请稍后尝试！'
            });
            return deferred.promise();
        }
    });
	
	MFrame.Sync = Sync;

})( window );
