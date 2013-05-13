'use strict';

var di = di || {};

di.asyncQueue = {};

di.asyncQueue.SetTimeout = function() {
  return function setTimeoutAsyncQueue(task) {
    window.setTimeout(task, 0);
  };
};

di.asyncQueue.Mock = function() {

  var queue = [];

  function mockAsyncQueue(task) {
    queue.push(task);
  }

  mockAsyncQueue.queue = queue;

  mockAsyncQueue.flush = function() {
    while(queue.length) {
      queue.shift()(); // todo make O(1)
    }
  };

  return mockAsyncQueue;
};


di.exceptionHandler = {};

di.exceptionHandler.Throw = function() {
  return function throwExceptionHandler(e) {
    throw e;
  }
};


di.objectCreator = {};
di.objectCreator.async = function() {

};

di.AsyncObjectResolver = function AsyncObjectResolver($q) {
  return function(fn, objects) {
    return $q.all(objects).then(function(resolvedObject) {
      return fn(resolvedObject);
    });
  }
};


di.AsyncInjector = function AsyncInjector(modules, asyncQueue) {

  var $q = qFactory(
      asyncQueue || new di.asyncQueue.SetTimeout(),
      new di.exceptionHandler.Throw()
  );

  modules.push({
    $q: function() { return $q; }
  });

  return new di.Injector_(
      di.windowSuperProvider,
      di.toStringTokenExtractorFactory(di.upperCasingTokenDeserializer),
      new di.AsyncObjectResolver($q),
      modules
  );
};
