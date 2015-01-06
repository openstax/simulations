define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var Positionable = require('models/positionable');
    var EnergyChunkCollection = require('models/energy-chunk-collection');

    /**
     * Basic building block model for all the elements in the intro tab scene
     */
    var EnergySystemsElement = Positionable.extend({

        defaults: {
            active: false,
            opacity: 0
        },
        
        initialize: function(attributes, options) {
            Positionable.prototype.initialize.apply(this, [attributes, options]);

            this.energyChunks = new EnergyChunkCollection();

            this._translation = new Vector2();

            this.on('change:position', this.positionChanged);
        },

        clearEnergyChunks: function() {
            this.energyChunks.reset();
        },

        activate: function() {
            this.set('active', true);
        },

        deactivate: function() {
            this.set('active', false);

            this.clearEnergyChunks();
        },

        active: function() {
            return this.get('active');
        },

        update: function(time, delta) {},

        positionChanged: function(model, position) {
            var translation = this._translation.set(position).sub(model.previous('position'));
            for (var i = this.energyChunks.length - 1; i >= 0; i--) {
                this.energyChunks[i].translate(translation);
            }
        }

    });

    return EnergySystemsElement;
});
