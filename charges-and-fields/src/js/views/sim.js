define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView           = require('common/v3/app/sim');
    var MeasuringTapeView = require('common/tools/measuring-tape');

    var ChargesAndFieldsSimulation = require('models/simulation');
    var ChargesAndFieldsSceneView  = require('views/scene');

    var Constants = require('constants');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
    require('less!common/styles/slider');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var simHtml = require('text!templates/sim.html');

    /**
     * This is the umbrella view for everything in a simulation tab.
     *   It will be extended by both the Intro module and the Charts
     *   and contains all the common functionality between the two.
     */
    var ChargesAndFieldsSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),

        /**
         * Dom event listeners
         */
        events: {
            'click #e-field-check'        : 'toggleEField',
            'click #voltage-check'        : 'toggleVoltageMosaic',
            'click #direction-only-check' : 'toggleDirectionOnly',
            'click #grid-check'           : 'toggleGrid',
            'click #numbers-check'        : 'toggleNumbers',
            'click #tape-measure-check'   : 'toggleTapeMeasure',

            'click .btn-clear' : 'clearEverything'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Charges and Fields',
                name: 'charges-and-fields',
                link: 'charges-and-fields'
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
            this.initMeasuringTapeView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new ChargesAndFieldsSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new ChargesAndFieldsSceneView({
                simulation: this.simulation
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
                }, this)
            });
            this.listenTo(this.sceneView, 'change:mvt', function() {
                this.measuringTapeView.updateOnNextFrame = true;
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderSceneView();
            this.renderMeasuringTape();

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                simulation: this.simulation
            };
            this.$el.html(this.template(data));
            this.$('select').selectpicker();
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        /**
         * Renders the measuring tape view
         */
        renderMeasuringTape: function() {
            this.measuringTapeView.render();
            this.$el.append(this.measuringTapeView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();

            this.measuringTapeView.postRender();
            this.measuringTapeView.setStart(this.sceneView.mvt.modelToViewX(4), this.sceneView.mvt.modelToViewY(5.1));
            this.measuringTapeView.setEnd(  this.sceneView.mvt.modelToViewX(7), this.sceneView.mvt.modelToViewY(5.1));
            this.measuringTapeView.hide();
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            SimView.prototype.resetComponents.apply(this);
            this.initSceneView();
        },

        /**
         * This is run every tick of the updater.  It updates the wave
         *   simulation and the views.
         */
        update: function(time, deltaTime) {
            // Update the model
            this.simulation.update(time, deltaTime);

            var timeSeconds = time / 1000;
            var dtSeconds   = deltaTime / 1000;

            // Update the scene
            this.sceneView.update(timeSeconds, dtSeconds, this.simulation.get('paused'));

            // Update the measuring tape view
            this.measuringTapeView.update(timeSeconds, dtSeconds, this.simulation.get('paused'));
        },

        /**
         * Shows/hides E-Field
         */
        toggleEField: function() {
            if ($(event.target).is(':checked')) {
                this.$('.e-field-additional-options').removeClass('disabled');
                this.$('#direction-only-check').removeAttr('disabled');
                this.sceneView.showEFieldVaneMatrix();
            }
            else {
                this.$('.e-field-additional-options').addClass('disabled');
                this.$('#direction-only-check').prop('disabled', true);
                this.sceneView.hideEFieldVaneMatrix();
            }
        },

        /**
         * Sets whether E-Field shows direction
         */
        toggleDirectionOnly: function() {
            if ($(event.target).is(':checked'))
                this.sceneView.setEFieldVaneMatrixDirectionOnly(true);
            else
                this.sceneView.setEFieldVaneMatrixDirectionOnly(false);
        },

        /**
         * Shows/hides voltage mosaic
         */
        toggleVoltageMosaic: function() {
            if ($(event.target).is(':checked'))
                this.sceneView.showVoltageMosaic();
            else
                this.sceneView.hideVoltageMosaic();
        },

        /**
         * Shows/hides grid
         */
        toggleGrid: function() {
            if ($(event.target).is(':checked'))
                this.sceneView.showGrid();
            else
                this.sceneView.hideGrid();
        },

        /**
         * Shows/hides numbers
         */
        toggleNumbers: function() {
            if ($(event.target).is(':checked')) {
                this.$('.numbers-additional-options').removeClass('disabled');
                this.$('#tape-measure-check').removeAttr('disabled');
                if (this.$('#tape-measure-check').is(':checked'))
                    this.measuringTapeView.show();
                this.sceneView.showNumbers();
            }
            else {
                this.$('.numbers-additional-options').addClass('disabled');
                this.$('#tape-measure-check').prop('disabled', true);
                this.measuringTapeView.hide();
                this.sceneView.hideNumbers();
            }
        },

        /**
         * Shows/hides tape measure
         */
        toggleTapeMeasure: function() {
            if ($(event.target).is(':checked'))
                this.measuringTapeView.show();
            else
                this.measuringTapeView.hide();
        },

        /**
         * Clears all the things
         */
        clearEverything: function() {
            this.simulation.charges.reset();
            this.simulation.sensors.reset();
            // Clear voltage plots
        }

    });

    return ChargesAndFieldsSimView;
});
