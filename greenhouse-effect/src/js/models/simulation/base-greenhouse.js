define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var FixedIntervalSimulation = require('common/simulation/fixed-interval-simulation');
    var Rectangle               = require('common/math/rectangle');
    var Vector2                 = require('common/math/vector2');

    var Atmosphere     = require('models/atmosphere');
    var Earth          = require('models/earth');
    var BlackHole      = require('models/black-hole');
    var Sun            = require('models/sun');
    var Photon         = require('models/photon-basic');
    var Thermometer    = require('models/thermometer');
    var PhotonEarthCollisionModel = require('models/collision-model/photon-earth');

    var Constants = require('constants');

    /**
     * The base simulation model for the "Greenhouse Effect" and 
     *   "Glass Layers" tabs.
     */
    var BaseGreenhouseSimulation = FixedIntervalSimulation.extend({

        exposedEarth: 1,
        
        /**
         * 
         */
        initialize: function(attributes, options) {
            options = _.extend({
                framesPerSecond: Constants.FRAMES_PER_SECOND,
                deltaTimePerFrame: Constants.DELTA_TIME_PER_FRAME
            }, options);

            FixedIntervalSimulation.prototype.initialize.apply(this, [attributes, options]);

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
        },

        /**
         * Initializes the photon collection
         */
        initPhotons: function() {
            this.photons = [];
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
            this.resetPhotons();

            // Reset earth
            this.earth.setProductionRate(1E-2);
            this.earth.reset();

            // Reset sun
            this.sun.setProductionRate(Sun.DEFAULT_PRODUCTION_RATE);
        },

        /**
         * Reset photons and trigger a reset event
         */
        resetPhotons: function() {
            this.photons = [];
            this.trigger('photons-reset');
        },

        /**
         * Updates models and handles interactions between photons
         *   and other objects.
         */
        _update: function(time, deltaTime) {
            var i;

            // Update all the photons
            for (i = this.photons.length - 1; i >= 0; i--)
                this.photons[i].update(deltaTime);

            this.earth.update(deltaTime);
            this.atmosphere.update(deltaTime);
            this.sun.update(deltaTime);
            this.blackHole.update(deltaTime);

            // Make the photons interact with other objects
            for (i = this.photons.length - 1; i >= 0; i--)
                this.handlePhotonInteractions(this.photons[i], deltaTime);
        },

        /**
         * Make the photon interact with the objects in the sim.
         */
        handlePhotonInteractions: function(photon, deltaTime) {
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
            this.removePhoton(photon);
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
            this.photons.push(photon);
            this.trigger('photon-added', photon);
        },

        removePhoton: function(photon) {
            var index;
            if (_.isNumber(photon)) {
                index = photon;
            }
            else {
                var index = _.indexOf(this.photons, photon);
                if (index === -1)
                    return;
            }
            this.photons.splice(index, 1);
            this.trigger('photon-removed', photon);
        }

    });

    return BaseGreenhouseSimulation;
});
