define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2  = require('common/math/vector2');
    var Particle = require('common/mechanics/models/particle');
    
    var PhysicsUtil = require('./physics-util');

    /**
     * This model represents a photon and includes functionality that was previously
     *   separated into the CollidableAdapter class in the original PhET sims.
     */
    var Photon = Particle.extend({

        collidable: true,

        defaults: _.extend({}, Particle.prototype.defaults, {
            wavelength: undefined,
            // If this photon was produced by the stimulation of another, this
            // is a reference to that photon.
            parentPhoton: null,
            // If this photon has stimulated the production of another photon, this
            // is a reference to that photon
            childPhoton: null
        }),

        initialize: function(attributes, options) {
            Particle.prototype.initialize.apply(this, [attributes, options]);

            this.prevPosition = new Vector2(this.get('position'));
            this.prevVelocity = new Vector2(this.get('velocity'));
        },

        /**
         * Overrides setPosition function to keep track of the previous position
         */
        setPosition: function(x, y, options) {
            this.prevPosition.set(this.get('acceleration'));

            Particle.prototype.setPosition.apply(this, arguments);
        },

        /**
         * Overrides setVelocity function to keep track of the previous velocity
         */
        setVelocity: function(x, y, options) {
            this.prevVelocity.set(this.get('acceleration'));

            Particle.prototype.setVelocity.apply(this, arguments);
        },

        getPreviousPosition: function() {
            return this.prevPosition;
        },

        getPreviousVelocity: function() {
            return this.prevVelocity;
        },

        /**
         * Converts wavelength to energy and returns it.
         */
        getEnergy: funciton() {
            return PhysicsUtil.wavelengthToEnergy(this.get('wavelength'));
        }

    }, {

        // Defaults
        DEFAULT_SPEED:          1,
        RADIUS:                 10,

        // Savelength constants
        RED:                    680,
        DEEP_RED:               640,
        BLUE:                   440,
        MIN_VISIBLE_WAVELENGTH: 380,
        MAX_VISIBLE_WAVELENGTH: 710,
        GRAY:                   5000

    });

    return Photon;
});