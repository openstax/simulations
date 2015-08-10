define(function (require) {

    'use strict';

    var AppView       = require('common/v3/app/app');
    var StopwatchView = require('common/v3/tools/stopwatch');

    var SoundSimView     = require('views/sim');
    var MeasureSceneView = require('views/scene/measure');

    var Constants = require('constants');

    var clearBtnHtml = require('text!templates/clear-btn.html');

    /**
     * 
     */
    var MeasureSimView = SoundSimView.extend({

        /**
         * Dom event listeners
         */
        events: _.extend({}, SoundSimView.prototype.events, {
            'click .btn-clear' : 'clearWave'
        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Measure',
                name: 'measure',
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

        /**
         * Renders everything
         */
        render: function() {
            SoundSimView.prototype.render.apply(this, arguments);

            this.stopwatchView = new StopwatchView({
                dragFrame: this.el,
                units : 'sec',
                unitRatio: Constants.TIME_REPORTING_SCALE,
                decimals: 4,
                position: {
                    x : AppView.windowIsShort() ? 648 : 642,
                    y : AppView.windowIsShort() ? 256 : 328 
                }
            });

            this.stopwatchView.render();

            this.$el.append(this.stopwatchView.el);

            this.$('.sim-controls-column').append(clearBtnHtml);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            SoundSimView.prototype.postRender.apply(this, arguments);

            this.stopwatchView.postRender();
        },

        /**
         * Called with time and deltaTime converted to seconds
         */
        _update: function(time, deltaTime, paused) {
            SoundSimView.prototype._update.apply(this, arguments);

            this.stopwatchView.update(time, deltaTime, paused);
        },

        /**
         * Resets the wavefront in the sim.
         */
        clearWave: function() {
            this.simulation.clearWave();
            this.sceneView.clearWave();
        }

    });

    return MeasureSimView;
});
