function bootstrap(myapp_Car) {
  console.log('----------------------------------------------------------------------------');
  console.log('Yay! A new car was constructed for us: ' + myapp_Car);
}



// Example 1: Simple case when we use only default providers to instantiate tokens

var module1 = require(["myapp/car"], function() {
  var injector = new di.Injector_(
      null, // no super provider
      di.toStringTokenExtractorFactory(di.nameSpacingTokenDeserializer),
      [module1]
  );

  injector.invoke(bootstrap);
  window.injector = injector;
});



// Example 2: Overrides the default engine implementation with ElectricEngine during bootstrap
// (this could also be achieved by reconfiguring require.js via a config file, which
//  would be a preferred solution since the code below pulls in both gas and electric engine
//  implementations but only instantiates the electric variant)


// To run this uncomment the code below and comment out the code above
//
// TODO: allow multiple isolated require invocations without global state clash

/*
var module2 = require(["myapp/car", "myapp/electricEngine"], function(Car, ElectricEngine) {
  var injector = new di.Injector_(
      null, // no super provider
      di.toStringTokenExtractorFactory(di.nameSpacingTokenDeserializer),
      [module2, {
        'myapp.Engine': ElectricEngine
      }]
  );

 injector.invoke(bootstrap);
 window.injector = injector;
});

*/


