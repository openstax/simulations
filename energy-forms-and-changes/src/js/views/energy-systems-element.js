define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');

    var PositionableView = require('views/positionable');

    var Constants = require('constants');

    /**
     * A view that represents an element model
     */
    var EnergySystemsElementView = PositionableView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            PositionableView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            this.energyChunkLayer = new PIXI.DisplayObjectContainer();
            this.energyChunkLayer.visible = false;
        },

        showEnergyChunks: function() {
            this.energyChunkLayer.visible = true;
        },

        hideEnergyChunks: function() {
            this.energyChunkLayer.visible = false;
        }

    });

    return EnergySystemsElementView;
});