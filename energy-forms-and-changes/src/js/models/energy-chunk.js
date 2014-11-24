define(function (require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone';)
    var Vector2  = require('vector2-node');

    /**
     * Energy types
     */
    var EnergyTypes = {
        THERMAL:    0,
        ELECTRICAL: 1,
        MECHANICAL: 2,
        LIGHT:      3,
        CHEMICAL:   4,
        HIDDEN:     5
    };

    /**
     * 
     */
    var EnergyChunk = Backbone.Model.extend({
        defaults: {
            // Position in model space.
            position: null,
            // Used for some simple 3D layering effects.
            zPosition: 0,
            // At the time of this writing, this is only used in the
            // algorithms that distribute energy chunks in a container.
            velocity: null, // In meters/sec.
            // Property that controls visibility in view.
            visible: true,
            // Energy type.  This can change during the life of the energy chunk.
            energyType: EnergyTypes.THERMAL
        },

        initialize: function(attributes, options) {
            // Create new vectors
            if (!this.get('position'))
                this.set('position', new Vector2(0, 0));
            if (!this.get('velocity'))
                this.set('velocity', new Vector2(0, 0)); 

            // For internal use to avoid creating and destroying objects
            this._vec2 = new Vector2(0, 0);
        }

        translate: function(movement) {
            this.set('position', this.get('position').add(movement));
        },

        translateBasedOnVelocity: function(time) {
            this._vec2.set(this.get('velocity'));
            this.translate(this._vec2.scale(time));
        },

        /**
         * Shortcut function that allows setting position to the values
         *   from an arbitrary vector but still triggering a change.
         */
        setPosition: function(position) {
            this.set('position', this.get('position').set(position));
        },

        /**
         * Shortcut function that allows setting velocity to the values
         *   from an arbitrary vector but still triggering a change.
         */
        setVelocity: function(velocity) {
            this.set('velocity', this.get('velocity').set(velocity));
        }

    }, EnergyTypes);

    return EnergyChunk;
});
