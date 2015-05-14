define(function (require, exports, module) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var Simulation = require('common/simulation/simulation');
    var Rectangle  = require('common/math/rectangle');
    var Vector2    = require('common/math/vector2');

    var Photon         = require('models/photon');
    var Molecule       = require('models/molecule');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * The base simulation model for the "Photon Absorption" tab
     *
     * Original description from PhET:
     *
     *   Primary model for the Photon Absorption tab.  This models photons being
     *   absorbed (or often NOT absorbed) by various molecules.  The scale for this
     *   model is picometers (10E-12 meters).
     *   
     *   The basic idea for this model is that there is some sort of photon emitter
     *   that emits photons, and some sort of photon target that could potentially
     *   some of the emitted photons and react in some way.  In many cases, the
     *   photon target can re-emit one or more photons after absorption.
     *  
     *                                               - John Blanco
     */
    var PhotonAbsorptionSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {
            
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
            this.initMolecules();
        },

        /**
         * Initializes the photon collection
         */
        initPhotons: function() {
            this.photons = new Backbone.Collection([], { model: Photon });
        },

        /**
         * Initializes the photon collection
         */
        initMolecules: function() {
            this.molecules = new Backbone.Collection([], { model: Molecule });
        },

        /**
         * Resets all component models
         */
        resetComponents: function() {
            
        },

        /**
         * Updates models
         */
        _update: function(time, deltaTime) {
            
        }

    }, Constants.PhotonAbsorptionSimulation);

    return PhotonAbsorptionSimulation;
});
