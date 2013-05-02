'use strict';


var di = {};

//////

di.Injector = function Injector(modules) {
  return new di.Injector_(
      di.windowSuperProvider,
      di.toStringTokenExtractorFactory(di.upperCasingTokenDeserializer),
      modules
  );
};


//////


di.Injector_ = function Injector_(superProvider, tokenExtractor, modules) {
  this.superProvider_ = superProvider || di.errorSuperProvider;
  this.tokenExtractor_ = tokenExtractor;
  this.modules_ = modules;
  this.providers_ = {};
  this.cache_ = {};

  var self = this;

  if (modules) {
    modules.forEach(function(module) {
      if (module) {
        Object.keys(module).forEach(function(tokenString) {
          self.providers_[tokenString] = module[tokenString];
        });
      }
    });
  }
};


di.Injector_.prototype.get = function(token) {
  var object = this.cache_[token];

  if (object) return object;

  var provider = this.providers_[token];

  if (provider) return (this.cache_[token] = this.instantiate(provider));

  return (this.cache_[token] = this.instantiate(this.superProvider_(token)));
};


di.Injector_.prototype.invoke = function(fn) {
  return this.inject_(fn);
};


di.Injector_.prototype.instantiate = function(constructor) {
  var TempType = function() {};
  TempType.prototype = constructor.prototype;
  var instance = new TempType();
  instance.constructor = constructor;

  return this.inject_(constructor, instance);
};


di.Injector_.prototype.inject_ = function(fn, context) {
  var tokens = this.tokenExtractor_(fn);
  var objects = [];
  var self = this;

  tokens.forEach(function(token) {
    objects.push(self.get(token));
  });

  return fn.apply(context, objects) || context;
}


///////


di.windowSuperProvider = function windowSuperProvider(token) {
  var type;

  if (!token || !(type = token.toString())) return;

  var segments = type.split('.');
  var provider = window;


  segments.forEach(function(segment) {
    provider = provider[segment];
  });

  if (!provider) di.errorSuperProvider(token);

  return provider;
};


///////


di.errorSuperProvider = function errorSuperProvider(token) {
  throw new Error("Can't find provider for " + token + "!");
}


///////


di.toStringTokenExtractorFactory = function(tokenDeserializer) {
  return function toStringTokenExtractor(fn) {
    if (!fn || typeof fn != 'function') return [];

    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    var fnText = fn.toString().replace(STRIP_COMMENTS, '');
    var argDecl = fnText.match(FN_ARGS)[1];
    var tokens = [];

    argDecl.split(FN_ARG_SPLIT).forEach(function(arg){
      arg.replace(FN_ARG, function(all, underscore, name){
        if (tokenDeserializer) {
          name = tokenDeserializer(name);
        }
        tokens.push(name);
      });
    });

    return tokens;
  };
};



di.upperCasingTokenDeserializer = function(string) {
  return string.replace(/\w(?=.+)/, function(firstChar) { return firstChar.toUpperCase(); })
};


di.nameSpacingTokenDeserializer = function(string) {
  return string.replace(/_/g, '.');
};
