define(function (require, exports, module) {

    'use strict';

    var _ = require('underscore');

    var Simulation = require('common/simulation/simulation');

    var Lens         = require('models/lens');
    var SourceObject = require('models/source-object');
    var TargetImage  = require('models/target-image');

    /**
     * Constants
     */
    var Constants = require('constants');

    /**
     * Wraps the update function in 
     */
    var GeometricOpticsSimulation = Simulation.extend({

        defaults: _.extend(Simulation.prototype.defaults, {

        }),
        
        initialize: function(attributes, options) {
            Simulation.prototype.initialize.apply(this, [attributes, options]);

        },

        /**
         * Initializes the models used in the simulation
         */
        initComponents: function() {
            this.lens = new Lens();

            this.sourceObject = new SourceObject({ 
                position:    Constants.DEFAULT_SOURCE_POINT_1,
                secondPoint: Constants.DEFAULT_SOURCE_POINT_2
            });

            this.targetImage = new TargetImage({}, {
                lens:         this.lens,
                sourceObject: this.sourceObject
            });
        }

    });

    return GeometricOpticsSimulation;
});
