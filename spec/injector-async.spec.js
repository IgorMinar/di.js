'use strict';

describe('Async Injector', function() {

  var asyncQueue;

  function GasEngine() {
    this.toString = function() { return 'gasEngine'};
  }

  function AsyncGasEngine($q) {
    var deferred = $q.defer();

    asyncQueue(function() {
      deferred.resolve(new GasEngine);
    });

    return deferred.promise;
  }


  function SportsCar(engine) {
    this.engine = engine;
    this.toString = function() { return 'sportsCar(' + engine + ')'};
  }


  beforeEach(function() {
    asyncQueue = new di.asyncQueue.Mock();
  });


  describe('api', function() {

    describe('get', function() {

      it('should return a promise that resolves to the requested Object', function() {
        var injector = new di.AsyncInjector([{Engine: GasEngine}], asyncQueue);
        var enginePromise = injector.get('Engine');
        var promiseSpy = jasmine.createSpy('promiseSpy');

        enginePromise.then(function(engine) {
          promiseSpy();
          expect(engine).toBeInstanceOf(GasEngine);
        });

        asyncQueue.flush();
        expect(promiseSpy).toHaveBeenCalledOnce();
      });
    });
  });



  describe('Object instantiation', function() {

    it('should resolve promises returned by Providers', function() {
      var injector = new di.AsyncInjector([{
        Engine: AsyncGasEngine
      }], asyncQueue);
      var promiseSpy = jasmine.createSpy('promiseSpy');

      injector.get('Engine').then(function(engine) {
        promiseSpy();
        expect(engine).toBeInstanceOf(GasEngine);
      });

      asyncQueue.flush();
      expect(promiseSpy).toHaveBeenCalledOnce();
    });


   it('should instantiate transitive async Object dependencies', function() {
     var injector = new di.AsyncInjector([{
       Engine: AsyncGasEngine,
       Car: SportsCar
     }], asyncQueue);
     var promiseSpy = jasmine.createSpy('promiseSpy');

     injector.get('Car').then(function(car) {
       promiseSpy();
       expect(car).toBeInstanceOf(SportsCar);
       expect(car.toString()).toBe('sportsCar(gasEngine)');
     });

     asyncQueue.flush();
     expect(promiseSpy).toHaveBeenCalledOnce();
    });
  });
});
