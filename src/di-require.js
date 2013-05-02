'use strict';

(function() {

  console.log('di-require.js')

  var originalRequire = window.require;
  var originalDefine = window.define;
  var module;
  var dependenciesToResolve = [];

  function require(dependencies, wrapper) {
    require.module = module = {};
    console.log('requiring ', dependencies);
    dependenciesToResolve.push.apply(dependenciesToResolve, dependencies);
    originalRequire.apply(null, arguments);
    return module;
  }


  function define(d, f) {
    var currentId = dependenciesToResolve.shift()
    var dependencies, factory;

    if (isArray(d)) {
      dependencies = d;
      factory = f;
      dependenciesToResolve.push.apply(dependenciesToResolve, dependencies);
      console.log('defining ' + currentId + ' which requires', dependencies);
    } else {
      dependencies = [];
      factory = d;
      console.log('defining ' + currentId);
    }

    function factoryWrapper() {
      var obj = factory.apply(this, arguments);
      var token = id2Token(currentId);
      module[token] = obj;
      return obj;
    }

    originalDefine.apply(null, [dependencies, factoryWrapper]);
  }


  function isArray(obj) {
    return Object.prototype.toString.apply(obj) == '[object Array]';
  }


  function id2Token(id) {
    return id.replace(/\//g, '.').replace(/(.+\.)?(\w)(.*)$/, function(all, prefix, firstChar, rest) {
      return prefix + firstChar.toUpperCase() + rest;
    })
  }

  window.require = require;
  window.define = define;
}());
