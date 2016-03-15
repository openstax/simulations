define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Vector2         = require('../../math/vector2');
    var VanillaParticle = require('../../mechanics/models/particle-vanilla');
    
    var PhysicsUtil = require('./physics-util');

    /**
     * This model represents a photon and includes functionality that was previously
     *   separated into the CollidableAdapter class in the original PhET sims.
     */
    var VanillaPhoton = VanillaParticle.extend({

        collidable: true,

        init: function() {
            VanillaParticle.prototype.init.apply(this, arguments);

            this.prevPosition = new Vector2();
            this.prevVelocity = new Vector2();
        },

        defaults: _.extend({}, VanillaParticle.prototype.defaults, {
            wavelength: undefined,
            // If this photon was produced by the stimulation of another, this
            // is a reference to that photon.
            parentPhoton: null,
            // If this photon has stimulated the production of another photon, this
            // is a reference to that photon
            childPhoton: null
        }),

        onCreate: function(attributes, options) {
            VanillaParticle.prototype.onCreate.apply(this, [attributes, options]);

            this.prevPosition.set(this.get('position'));
            this.prevVelocity.set(this.get('velocity'));

            this._markedForDestruction = false;
        },

        /**
         * Sets a flag for the electron to be destroyed on the next loop
         */
        markForDestruction: function() {
            this._markedForDestruction = true;
        },

        /**
         * Returns whether the electron has been marked for destruction
         */
        markedForDestruction: function() {
            return this._markedForDestruction;
        },

        /**
         * Overrides setPosition function to keep track of the previous position
         */
        setPosition: function(x, y, options) {
            this.prevPosition.set(this.get('position'));

            VanillaParticle.prototype.setPosition.apply(this, arguments);
        },

        /**
         * Overrides setVelocity function to keep track of the previous velocity
         */
        setVelocity: function(x, y, options) {
            this.prevVelocity.set(this.get('velocity'));

            VanillaParticle.prototype.setVelocity.apply(this, arguments);
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
        getEnergy: function() {
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

    return VanillaPhoton;
});