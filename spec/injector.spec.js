'use strict';


describe('Injector', function() {

  afterEach(function() {
    delete window.Engine;
    delete window.Brakes;
    delete window.Car;
  });


  function GasEngine() {
    this.toString = function() { return 'gasEngine'};
  }

  function ElectricEngine() {
    this.toString = function() { return 'electricEngine'};
  }


  function SportsCar(Engine) {
    this.engine = Engine;
    this.toString = function() { return 'sportsCar(' + Engine + ')'};
  }


/*
  function FamilyCar(Engine) {
    this.engine = Engine;
    this.toString = function() { return 'familyCar(' + Engine + ')'};
  }


  function DiskBrakes() {
    this.toString = function() {
      return 'diskBrakes';
    };
  }


  function RegenerativeBrakes() {
    this.toString = function() {
      return 'regenerativeBrakes';
    }
  }
*/


  describe('api', function() {

    describe('get', function() {

      it('should serve as service locator and look up and instantiate an Object identified by a Token', function() {
        window.Engine = ElectricEngine;
        var injector = new di.Injector();

        expect(injector.get('Engine')).toBeInstanceOf(ElectricEngine);
      });
    });


    describe('invoke', function() {

      it('should infer dependencies from a function and invoke it once with the requested Objects', function() {
        window.Engine = ElectricEngine;
        var injector = new di.Injector();
        var fnSpy = jasmine.createSpy('invoked');
        var fn = function(Engine) {
          fnSpy(Engine.toString());
        };

        injector.invoke(fn);

        expect(fnSpy).toHaveBeenCalledOnceWith('electricEngine');
      });


      it('should propagate the return value from invoking the function', function() {
        window.Engine = ElectricEngine;
        var injector = new di.Injector();
        var fn = function(Engine) {
          return 'got engine: ' + Engine;
        };

        var returnValue = injector.invoke(fn);

        expect(returnValue).toBe('got engine: electricEngine');
      });
    });


    describe('instantiate', function() {

      it('should infer dependencies from a constructor, create a new object and make it look like it was created by ' +
         'calling new operator on the constructor with the requested Objects as arguments', function() {
        window.Engine = ElectricEngine;
        var injector = new di.Injector();
        var CustomCar = function CustomCar(Engine) {
          this.engine = Engine;
        };

        var car = injector.instantiate(CustomCar);

        expect(car).toBeInstanceOf(CustomCar);
        expect(car.engine).toBeInstanceOf(ElectricEngine);
      });

      it('should honor return value from the injected constructor and use it as the provided Object', function() {
        window.Engine = ElectricEngine;
        var injector = new di.Injector();
        var VeryCustomCar = function VeryCustomCar() {
          return '@/==\@';
        };

        var car = injector.invoke(VeryCustomCar);

        expect(car).toBe('@/==\@');
      });
    });
  });


  describe('Object instantiation', function() {

    it('should always create singletons', function() {
      window.Engine = GasEngine;
      window.Car = SportsCar;
      var injector = new di.Injector();

      var car = injector.get('Car');
      var engine = injector.get('Engine');

      expect(engine).toBe(car.engine);
      expect(injector.get('Engine')).toBe(engine);
      expect(injector.get('Car')).toBe(car);
    });


    it('should instantiate transitive Object dependencies', function() {
      window.Engine = GasEngine;
      window.Car = SportsCar;
      var injector = new di.Injector([{
        Engine: GasEngine,
        Car: SportsCar
      }]);

      var car = injector.get('Car');

      expect(car).toBeInstanceOf(Car);
      expect(car.toString()).toBe('sportsCar(gasEngine)');
    });
  });


  describe('dependency resolution', function() {

    describe('configuration via super providers (aka implicit module)', function() {

      it('should create default injector when called with no args', function() {
        var injector = new di.Injector();
        expect(injector).toBeInstanceOf(di.Injector_);
      });


      it('should instantiate an Object with no dependencies', function() {
        window.Engine = GasEngine;
        var injector = new di.Injector();

        var engine = injector.get('Engine');

        expect(engine).toBeInstanceOf(Engine);
      });


      it('should instantiate an Object with dependencies', function() {
        window.Engine = GasEngine;
        window.Car = SportsCar;
        var injector = new di.Injector();

        var car = injector.get('Car');

        expect(car).toBeInstanceOf(Car);
        expect(car.toString()).toBe('sportsCar(gasEngine)');
      });


      it("should throw an error if a provider can't be found", function() {
        var injector = new di.Injector();

        expect(function() {
          injector.get('DoesntExist');
        }).toThrow("Can't find provider for DoesntExist!");
      });


      it("should instantiate an object from a namespaced provider", function() {
        window.my = {name: {space: {Engine: GasEngine}}};
        var injector = new di.Injector();

        var engine = injector.get('my.name.space.Engine');

        expect(engine).toBeInstanceOf(GasEngine);
      });
    });


    describe('configuration via modules', function() {

      it('should allow bindings to be defined via a module', function() {
        var injector = new di.Injector([{
          Engine: GasEngine
        }]);

        var engine = injector.get('Engine');

        expect(engine).toBeInstanceOf(GasEngine);
      });



      it('should allow the implicit bindings to be overridden via a module', function() {
        window.Engine = GasEngine;
        var injector = new di.Injector([{
          Engine: ElectricEngine //overrides window.GasEngine
        }]);

        var engine = injector.get('Engine');

        expect(engine).toBeInstanceOf(ElectricEngine);
      });


      it('should flatten binding from multiple modules with the last definition taking precedence', function() {
        var injector = new di.Injector([{
          Engine: GasEngine
        }, {
          Engine: ElectricEngine // overrides GasEngine from previous module
        }]);

        var engine = injector.get('Engine');

        expect(engine).toBeInstanceOf(ElectricEngine);
      });


      it('should fall back to delegating binding resolution to super provider', function() {
        window.Engine = GasEngine;
        var injector = new di.Injector([{
          Car: SportsCar
        }]);

        var engine = injector.get('Engine');

        expect(engine).toBeInstanceOf(GasEngine);
      });


      it("should throw an Error if provider can't be found via modules or super provider", function() {
        var injector = new di.Injector([{}]);

        expect(function() {
          injector.get('DoesntExist');
        }).toThrow("Can't find provider for DoesntExist!");
      });
    });
  });


  describe('Tokens', function() {

    describe('extraction', function() {

      it('should use token extraction during injection', function() {
        var spyExtractor = jasmine.createSpy('spyExtractor').andReturn(['fakeToKeN']);
        var injector = new di.Injector_(null, spyExtractor);
        var fn = function(){};

        expect(function() {
          injector.invoke(fn);
        }).toThrow("Can't find provider for fakeToKeN!");

        expect(spyExtractor).toHaveBeenCalledOnceWith(fn);
      });
    });


    describe('deserialization', function() {

      it('should use token deserializer during token extraction', function() {
        var testToken = {};
        var spyDeserializer = jasmine.createSpy('spyDeserializer').andReturn(testToken);
        var extractor = di.toStringTokenExtractorFactory(spyDeserializer);
        var fn = function(dependency1) {};

        var tokens = extractor(fn);

        expect(spyDeserializer).toHaveBeenCalledOnceWith('dependency1');
        expect(tokens).toEqual([testToken]);
      });


      describe('upperCasingTokenDeserializer', function() {

        it('should uppercase the first alpha character in the token', function() {
          expect(di.upperCasingTokenDeserializer('authenticator')).toBe('Authenticator');
        });


        it('should support tokens that are already uppercased', function() {
          expect(di.upperCasingTokenDeserializer('Authenticator')).toBe('Authenticator');
        });


        it('should skip leading non-alpha characters when uppercasing', function() {
          expect(di.upperCasingTokenDeserializer('$location')).toBe('$Location');
        });
      });


      describe('nameSpacingTokenDeserializer', function() {

        it('should replace underscores with dots', function() {
          expect(di.nameSpacingTokenDeserializer('com_google_calendar_Scheduler')).toBe('com.google.calendar.Scheduler');
        });
      });
    });
  });
});
