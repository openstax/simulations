define(function(require) {

    'use strict';

    var _ = require('underscore');

    var EnergySystemsElementView = require('views/energy-systems-element');

    var Constants = require('constants');

    /**
     * A view that represents an element model
     */
    var EnergySourceView = EnergySystemsElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            EnergySystemsElementView.prototype.initialize.apply(this, [options]);
        },

        showEnergyChunks: function() {},

        hideEnergyChunks: function() {}

    });

    return EnergySourceView;
});