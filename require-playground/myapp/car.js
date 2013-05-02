define(['myapp/engine', 'myapp/breaks'], function() {
  return function Car(myapp_Engine, myapp_Breaks) {
    this.engine = myapp_Engine;
    this.breaks = myapp_Breaks;

    this.toString = function() { return 'sportsCar(' + this.engine + ', ' + this.breaks + ')'};
  };
});
