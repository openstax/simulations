define(function (require) {

    'use strict';

    var _ = require('underscore');

    var SoundSimView          = require('views/sim');
    var SingleSourceSceneView = require('views/scene/single-source');

    var Constants = require('constants');

    var audioControlsHtml = require('text!templates/audio-controls.html');

    /**
     * 
     */
    var SingleSourceSimView = SoundSimView.extend({

        audioControlsTemplate: _.template(audioControlsHtml),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Single Source',
                name: 'single-source-sim',
            }, options);

            SoundSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new SingleSourceSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            SoundSimView.prototype.render.apply(this, arguments);

            var data = {
                Constants: Constants,
                simulation: this.simulation,
                unique: this.cid
            };
            this.$('.sim-controls').append(this.audioControlsTemplate(data))
        },

    });

    return SingleSourceSimView;
});
