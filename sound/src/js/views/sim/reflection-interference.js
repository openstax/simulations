define(function (require) {

    'use strict';


    var SoundSimView = require('views/sim');

    var Constants = require('constants');

    var wallControlsHtml = require('text!templates/wall-controls.html');
    var modeControlsHtml = require('text!templates/mode-controls.html');

    /**
     * 
     */
    var ReflectionInterferenceSimView = SoundSimView.extend({

        wallControlsTemplate: _.template(wallControlsHtml),
        modeControlsTemplate: _.template(modeControlsHtml),

        /**
         * Dom event listeners
         */
        events: _.extend({}, SoundSimView.prototype.events, {
            'slide .wall-angle'    : 'changeWallAngle',
            'slide .wall-position' : 'changeWallPosition'
        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Interference by Reflection',
                name: 'reflection-interference-sim',
            }, options);

            SoundSimView.prototype.initialize.apply(this, [options]);
        },

        /**
         * Renders page content
         */
        renderScaffolding: function() {
            SoundSimView.prototype.renderScaffolding.apply(this, arguments);

            var data = {
                Constants: Constants,
                unique: this.cid
            };

            // Sound mode controls
            this.$('.sim-controls').append(this.modeControlsTemplate(data));

            // Wall property controls
            this.$('.sim-controls-column').append(this.wallControlsTemplate(data));

            this.$('.sim-controls .wall-angle').noUiSlider({
                start: Constants.DEFAULT_WALL_ANGLE,
                connect: 'lower',
                range: {
                    'min': Constants.MIN_WALL_ANGLE,
                    'max': Constants.MAX_WALL_ANGLE
                }
            });

            this.$('.sim-controls .wall-position').noUiSlider({
                start: Constants.DEFAULT_WALL_POSITION,
                connect: 'lower',
                range: {
                    'min': Constants.MIN_WALL_POSITION,
                    'max': Constants.MAX_WALL_POSITION
                }
            });
        },

    });

    return ReflectionInterferenceSimView;
});
