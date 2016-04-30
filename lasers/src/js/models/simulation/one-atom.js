define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var VanillaCollection = require('common/collections/vanilla');

    // Local dependencies need to be referenced by relative paths
    //   so we can use this in other projects.
    var BaseLasersSimulation = require('./base');

    /**
     * Constants
     */
    var Constants = require('../../constants');

    /**
     * 
     */
    var OneAtomLasersSimulation = BaseLasersSimulation.extend({

        defaults: _.extend(BaseLasersSimulation.prototype.defaults, {
            
        }),
        
        initialize: function(attributes, options) {
            BaseLasersSimulation.prototype.initialize.apply(this, [attributes, options]);

            
        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            BaseLasersSimulation.prototype.initComponents.apply(this, arguments);

            
        },

        resetComponents: function() {
            BaseLasersSimulation.prototype.resetComponents.apply(this, arguments);

        },

        _update: function(time, deltaTime) {
            BaseLasersSimulation.prototype._update.apply(this, arguments);

            
        }

    }, Constants.OneAtomLasersSimulation);

    return OneAtomLasersSimulation;
});
