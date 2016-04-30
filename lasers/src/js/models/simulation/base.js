define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var VanillaCollection = require('common/collections/vanilla');

    // Local dependencies need to be referenced by relative paths
    //   so we can use this in other projects.
    var LasersSimulation = require('../simulation');

    /**
     * Constants
     */
    var Constants = require('../../constants');

    /**
     * 
     */
    var BaseLasersSimulation = LasersSimulation.extend({

        defaults: _.extend(LasersSimulation.prototype.defaults, {
            
        }),
        
        initialize: function(attributes, options) {
            LasersSimulation.prototype.initialize.apply(this, [attributes, options]);

            
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            LasersSimulation.prototype.initComponents.apply(this, arguments);

            
        },

        resetComponents: function() {
            LasersSimulation.prototype.resetComponents.apply(this, arguments);

        },

        _update: function(time, deltaTime) {
            LasersSimulation.prototype._update.apply(this, arguments);

            
        }

    }, Constants.BaseLasersSimulation);

    return BaseLasersSimulation;
});
