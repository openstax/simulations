define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');
    var Rectangle  = require('common/math/rectangle');
    var Vector2    = require('common/math/vector2');

    var Atmosphere     = require('models/atmosphere');
    var Earth          = require('models/earth');
    var BlackHole      = require('models/black-hole');
    var Star           = require('models/star');
    var PhotonAbsorber = require('models/photon-absorber');
    var PhotonEmitter  = require('models/photon-emitter');
    var Thermometer    = require('models/thermometer');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * The base simulation model for the "Greenhouse Effect" and 
     *   "Glass Layers" tabs.
     */
    var GreenhouseSimulation = Simulation.extend({

        exposedEarth: 1,

        defaults: _.extend(Simulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.initBounds();
            this.initEarth();
            this.initAtmosphere();
            this.initSun();
            this.initBlackHole();
            this.initThermometer();
        },

        initBounds: function() {
            var modelHeight = this.exposedEarth + Atmosphere.TROPOSPHERE_THICKNESS;

            this.bounds = new Rectangle(
                -modelHeight * 4 / 3 / 2,
                -this.exposedEarth,
                modelHeight * 4 / 3,
                modelHeight
            );
        },

        initEarth: function() {
            var gamma = Math.atan2(this.bounds.w / 2, Earth.RADIUS);

            this.earth = new Earth({
                position: new Vector2(0, -Earth.RADIUS + this.exposedEarth)
            }, {
                alpha: Math.PI / 2 - gamma,
                beta:  Math.PI / 2 + gamma 
            });

            this.earth.setProductionRate(1E-2);
        },

        initAtmosphere: function() {
            this.atmosphere = new Atmosphere({}, {
                earth: this.earth
            });
        },

        initSun: function() {
            this.sun = new Star({
                radius: Sun.DIAMETER,
                position: new Vector2(0, Earth.DIAMETER + Sun.DISTANCE_FROM_EARTH + Sun.RADIUS),
                bounds: new Rectangle(this.bounds.x, this.bounds.y + this.bounds.h, this.bounds.w / 1, 1)
            });

            this.sun.setProductionRate(0);
        },

        initBlackHole: function() {
            this.blackHole = new BlackHole({}, {
                simulation: this
            });
        },

        initThermometer: function() {
            this.thermometer = new Thermometer({
                position: new Vector2(this.bounds.x + 2, 0.5)
            }, {
                body: this.earth
            });
        },

        _update: function(time, deltaTime) {
            
        },

        setEarthReflectivityAssessor: function(reflectivityAssessor) {
            this.earth.setReflectivityAssessor(reflectivityAssessor);
        }

    });

    return GreenhouseSimulation;
});
