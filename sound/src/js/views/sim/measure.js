define(function (require) {

    'use strict';

    var AppView       = require('common/app/app');
    var StopwatchView = require('common/tools/stopwatch');

    var SoundSimView     = require('views/sim');
    var MeasureSceneView = require('views/scene/measure');

    var Constants = require('constants');

    var clearBtnHtml = require('text!templates/clear-btn.html');

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

        /**
         * Renders everything
         */
        render: function() {
            SoundSimView.prototype.render.apply(this, arguments);

            this.stopwatchView = new StopwatchView({
                dragFrame: this.el,
                units : 'sec',
                position: {
                    x : 642,
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
        }

    });

    return MeasureSimView;
});
