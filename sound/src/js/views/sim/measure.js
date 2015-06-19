define(function (require) {

    'use strict';


    var SoundSimView     = require('views/sim');
    var MeasureSceneView = require('views/scene/measure');

    var Constants = require('constants');

    /**
     * 
     */
    var MeasureSimView = SoundSimView.extend({

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Measure',
                name: 'measure-sim',
            }, options);

            SoundSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new MeasureSceneView({
                simulation: this.simulation
            });
        },

    });

    return MeasureSimView;
});
