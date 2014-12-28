define(function(require) {

    'use strict';

    var _ = require('underscore');

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

        showEnergyChunks: function() {},

        hideEnergyChunks: function() {}

    });

    return EnergySystemsElementView;
});