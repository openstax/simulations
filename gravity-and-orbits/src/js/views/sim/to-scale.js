define(function(require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var MeasuringTapeView = require('common/v3/tools/measuring-tape');

    var GOSimulation = require('models/simulation');
    var GOSimView    = require('views/sim');

    var Scenarios = require('scenarios');
    var Constants = require('constants');

    var advancedVisibilityControlsHtml = require('text!templates/advanced-visibility-controls.html');

    /**
     *
     */
    var ToScaleSimView = GOSimView.extend({

        advancedVisibilityControlsTemplate: _.template(advancedVisibilityControlsHtml),

        events: _.extend(GOSimView.prototype.events, {
            'click .mass-check'           : 'toggleMassLabels',
            'click .measuring-tape-check' : 'toggleMeasuringTape',
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'Actual Scale',
                name:  'to-scale'
            }, options);
            
            GOSimView.prototype.initialize.apply(this, [ options ]);

            this.initMeasuringTapeView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new GOSimulation({
                scenario: Scenarios.ToScale[0]
            });
        },

        /**
         * Initializes the MeasuringTapeView.
         */
        initMeasuringTapeView: function() {
            this.measuringTapeView = new MeasuringTapeView({
                dragFrame: this.el,
                viewToModelDeltaX: _.bind(function(dx){
                    return this.sceneView.mvt.viewToModelDeltaX(dx);
                }, this),
                viewToModelDeltaY: _.bind(function(dy){
                    return this.sceneView.mvt.viewToModelDeltaY(dy);
                }, this),
                format: function(meters) {
                    var miles = meters * Constants.METERS_PER_MILE;
                    var distance = miles / 1E3;

                    if (distance < 0.01)
                        distance = distance.toFixed(0);
                    else if (distance < 10)
                        distance = distance.toFixed(1);
                    else
                        distance = distance.toFixed(0);

                    return distance + ' thousand miles';
                }
            });
            this.listenTo(this.sceneView, 'change:mvt', function() {
                this.measuringTapeView.updateOnNextFrame = true;
            });
        },

        getScenarios: function() {
            return Scenarios.ToScale;
        },

        render: function() {
            GOSimView.prototype.render.apply(this);

            this.renderMeasuringTape();

            return this;
        },

        renderScaffolding: function() {
            GOSimView.prototype.renderScaffolding.apply(this);

            var data = {
                name: this.name
            };
            this.$('.visibility-controls').append(this.advancedVisibilityControlsTemplate(data));
        },

        renderMeasuringTape: function() {
            this.measuringTapeView.render();
            this.$el.append(this.measuringTapeView.el);
        },

        postRender: function() {
            GOSimView.prototype.postRender.apply(this);

            this.measuringTapeView.postRender();
            this.measuringTapeView.setStart(this.sceneView.width * 0.5,  this.sceneView.height * 0.58);
            this.measuringTapeView.setEnd(  this.sceneView.width * 0.75, this.sceneView.height * 0.58);
            this.measuringTapeView.hide();
        },

        update: function(time, deltaTime) {
            GOSimView.prototype.update.apply(this, arguments);

            var timeSeconds = time / 1000;
            var dtSeconds   = deltaTime / 1000;

            // Update the measuring tape view
            this.measuringTapeView.update(timeSeconds, dtSeconds, this.simulation.get('paused'));
        },

        toggleMassLabels: function(event) {
            if ($(event.target).is(':checked'))
                this.sceneView.showMassLabels();
            else
                this.sceneView.hideMassLabels();
        },

        toggleMeasuringTape: function(event) {
            if ($(event.target).is(':checked'))
                this.measuringTapeView.show();
            else
                this.measuringTapeView.hide();
        }

    });

    return ToScaleSimView;
});
