define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Simulation = require('common/simulation/simulation');
    var Rectangle  = require('common/math/rectangle');
    var Vector2    = require('common/math/vector2');

    var Atmosphere     = require('models/atmosphere');
    var Earth          = require('models/earth');
    var BlackHole      = require('models/black-hole');
    var Sun            = require('models/sun');
    var Photon         = require('models/photon');
    var Thermometer    = require('models/thermometer');
    var PhotonEarthCollisionModel = require('models/collision-model/photon-earth');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * The base simulation model for the "Greenhouse Effect" and 
     *   "Glass Layers" tabs.
     */
    var BaseGreenhouseSimulation = Simulation.extend({

        exposedEarth: 1,

        defaults: _.extend(Simulation.prototype.defaults, {
            timeScale: 0.5
        }),
        
        /**
         * 
         */
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.initPhotons();
            this.initBounds();
            this.initEarth();
            this.initAtmosphere();
            this.initSun();
            this.initBlackHole();
            this.initThermometer();


            // TODO: This is just testing code
            this.atmosphere.set('greenhouseGasConcentration', Atmosphere.GREENHOUSE_GAS_CONCENTRATION_TODAY);
        },

        /**
         * Initializes the photon collection
         */
        initPhotons: function() {
            this.photons = new Backbone.Collection([], { model: Photon });
        },

        /**
         * Calculates the simulation bounds and initializes the rectangle
         */
        initBounds: function() {
            var modelHeight = this.exposedEarth + Atmosphere.TROPOSPHERE_THICKNESS;

            this.bounds = new Rectangle(
                -modelHeight * 4 / 3 / 2,
                -this.exposedEarth,
                modelHeight * 4 / 3,
                modelHeight
            );
        },

        /**
         * Initializes the earth model
         */
        initEarth: function() {
            var gamma = Math.atan2(this.bounds.w / 2, Earth.RADIUS);

            this.earth = this.createEarth({
                position: new Vector2(0, -Earth.RADIUS + this.exposedEarth)
            }, {
                alpha: Math.PI / 2 - gamma,
                beta:  Math.PI / 2 + gamma 
            });

            this.earth.setProductionRate(1E-2);
            this.listenTo(this.earth, 'photon-emitted',  this.photonEmitted);
            this.listenTo(this.earth, 'photon-absorbed', this.photonAbsorbed);
        },

        /**
         * Returns a new Earth instance.  Separating this out
         *   so it can be overridden.
         */
        createEarth: function(attributes, options) {
            return new Earth(attributes, options);
        },

        /**
         * Initializes the atmosphere model
         */
        initAtmosphere: function() {
            this.atmosphere = new Atmosphere({}, {
                earth: this.earth
            });
        },

        /**
         * Initializes the sun model
         */
        initSun: function() {
            this.sun = new Sun({
                radius: Sun.DIAMETER,
                position: new Vector2(0, Earth.DIAMETER + Sun.DISTANCE_FROM_EARTH + Sun.RADIUS),
                bounds: new Rectangle(this.bounds.x, this.bounds.y + this.bounds.h, this.bounds.w / 1, 1)
            });

            // this.sun.setProductionRate(0); it's set to zero until the view has loaded, but I don't know if this will be necessary in mine
            this.sun.setProductionRate(Sun.DEFAULT_PRODUCTION_RATE);
            this.listenTo(this.sun, 'photon-emitted', this.photonEmitted);
        },

        /**
         * Initializes the black hole model
         */
        initBlackHole: function() {
            this.blackHole = new BlackHole({}, {
                simulation: this
            });
        },

        /**
         * Initializes the thermometer model
         */
        initThermometer: function() {
            this.thermometer = new Thermometer({
                position: new Vector2(this.bounds.x + 2, 0.5)
            }, {
                body: this.earth
            });
        },

        /**
         * Resets all component models
         */
        resetComponents: function() {
            // Reset photons
            this.photons.reset();

            // Reset earth
            this.earth.setProductionRate(1E-2);
            this.earth.reset();

            // Reset sun
            this.sun.setProductionRate(Sun.DEFAULT_PRODUCTION_RATE);
        },

        /**
         * Updates models and handles interactions between photons
         *   and other objects.
         */
        _update: function(time, deltaTime) {
            var i;

            // Update all the photons
            for (i = this.photons.length - 1; i >= 0; i--)
                this.photons.at(i).update(deltaTime);

            this.earth.update(deltaTime);
            this.atmosphere.update(deltaTime);
            this.sun.update(deltaTime);
            this.blackHole.update(deltaTime);

            // Make the photons interact with other objects
            for (i = this.photons.length - 1; i >= 0; i--)
                this.handlePhotonInteractions(this.photons.at(i));

            //console.log(this.photons.length)
        },

        /**
         * Make the photon interact with the objects in the sim.
         */
        handlePhotonInteractions: function(photon) {
            // Check for collisions with earth
            PhotonEarthCollisionModel.handle(photon, this.earth);

            // Interact with the atmosphere
            this.atmosphere.interactWithPhoton(photon);
        },

        /**
         * 
         */
        setEarthReflectivityAssessor: function(reflectivityAssessor) {
            this.earth.setReflectivityAssessor(reflectivityAssessor);
        },

        /**
         * Listens for any absorption events in the system
         *   and removes the photon that was absorbed by
         *   something from the master list.  If a photon
         *   is absorbed by an object in the system, it is
         *   destroyed forever; the energy of the photon
         *   is added to that object, and the object may
         *   emit a new photon later with some of that
         *   energy.
         */
        photonAbsorbed: function(photon) {
            this.photons.remove(photon);
        },

        /**
         * Listens for any emission events in the system
         *   and adds the photon that was emitted to the
         *   master photon collection.  Photons in this 
         *   list will be rendered on the screen.  Any
         *   photon that is not in this list will not be
         *   rendered to the screen, so every photon
         *   emission that occurs needs to trigger this
         *   function.
         */
        photonEmitted: function(photon) {
            this.photons.add(photon);
        }

    });

    return BaseGreenhouseSimulation;
});
