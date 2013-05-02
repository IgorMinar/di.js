define(['myapp/engine', 'myapp/brakes'], function() {
  return function Car(myapp_Engine, myapp_Brakes) {
    this.engine = myapp_Engine;
    this.brakes = myapp_Brakes;

    this.toString = function() { return 'sportsCar(' + this.engine + ', ' + this.brakes + ')'};
  };
});
