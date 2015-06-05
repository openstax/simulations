define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView   = require('common/app/sim');
    var RulerView = require('common/tools/ruler');

    var GeometricOpticsSimulation = require('models/simulation');
    var GeometricOpticsSceneView  = require('views/scene');

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
    var GeometricOpticsSimView = SimView.extend({

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
            'click .help-btn' : 'toggleHelp',

            'change #rays' : 'changeRaysMode',

            'click #show-guides-check'  : 'toggleGuides',
            'click #second-point-check' : 'toggleSecondPoint',
            'click #ruler-check'        : 'toggleRuler',
            'click #virtual-image-check': 'toggleVirtualImage',
            'click #screen-check'       : 'toggleScreen',

            'click .change-object-btn' : 'changeObjectType',

            'slide #curvature-radius-slider' : 'changeRadiusOfCurvature',
            'slide #refractive-index-slider' : 'changeIndexOfRefraction',
            'slide #diameter-slider'         : 'changeDiameter'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Geometric Optics',
                name: 'geometric-optics',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            this.listenTo(this.simulation.lens, 'change:radiusOfCurvature', this.updateRadiusOfCurvature);
            this.listenTo(this.simulation.lens, 'change:indexOfRefraction', this.updateIndexOfRefraction);
            this.listenTo(this.simulation.lens, 'change:diameter',          this.updateDiameter);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new GeometricOpticsSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new GeometricOpticsSceneView({
                simulation: this.simulation
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            this.$el.empty();

            this.renderScaffolding();
            this.renderSceneView();
            this.renderRulerView();

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

            this.$('#curvature-radius-slider').noUiSlider({
                connect: 'lower',
                start: Constants.Lens.DEFAULT_RADIUS_OF_CURVATURE,
                range: {
                    'min': Constants.Lens.MIN_RADIUS_OF_CURVATURE,
                    'max': Constants.Lens.MAX_RADIUS_OF_CURVATURE
                }
            });

            this.$('#refractive-index-slider').noUiSlider({
                connect: 'lower',
                start: Constants.Lens.DEFAULT_INDEX_OF_REFRACTION,
                range: {
                    'min': Constants.Lens.MIN_INDEX_OF_REFRACTION,
                    'max': Constants.Lens.MAX_INDEX_OF_REFRACTION
                }
            });

            this.$('#diameter-slider').noUiSlider({
                connect: 'lower',
                start: Constants.Lens.DEFAULT_DIAMETER,
                range: {
                    'min': Constants.Lens.MIN_DIAMETER,
                    'max': Constants.Lens.MAX_DIAMETER
                }
            });

            this.$radiusOfCurvature = this.$('#curvature-radius-label');
            this.$indexOfRefraction = this.$('#refractive-index-label');
            this.$diameter          = this.$('#diameter-label');

            this.updateRadiusOfCurvature(this.simulation.lens, this.simulation.lens.get('radiusOfCurvature'));
            this.updateIndexOfRefraction(this.simulation.lens, this.simulation.lens.get('indexOfRefraction'));
            this.updateDiameter(this.simulation.lens, this.simulation.lens.get('diameter'));
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        /**
         * Renders the ruler view
         */
        renderRulerView: function() {
            this.rulerView = new RulerView({
                dragFrame: this.el,
                position : {
                    x : 20,
                    y : 130
                },
                orientation : 'horizontal',
                pxPerUnit: 3,
                rulerWidth: 12,
                rulerMeasureUnits : 200,
                ticks : [{
                    type: 'full',
                    at : 20
                },{
                    type: 'mid',
                    at : 10
                },{
                    type: 'unit',
                    at : 1
                }]
            });

            this.rulerView.render();
            this.rulerView.hide();

            this.$el.append(this.rulerView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
            this.rulerView.postRender();
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            SimView.prototype.resetComponents.apply(this);
            this.initSceneView();
        },

        /**
         * This is run every tick of the updater.  It updates the views.
         */
        update: function(time, deltaTime) {
            var timeSeconds = time / 1000;
            var dtSeconds   = deltaTime / 1000;

            // Update the scene
            this.sceneView.update(timeSeconds, dtSeconds);

            // Update the ruler view
            this.rulerView.update();
        },

        /**
         * Responds to help button click and toggles showing help labels.
         */
        toggleHelp: function() {
            this.$('.help-btn').toggleClass('active');
        },

        /**
         * Shows/hides guides
         */
        toggleGuides: function() {
            if ($(event.target).is(':checked'))
                this.sceneView.showGuides();
            else
                this.sceneView.hideGuides();
        },

        /**
         * Responds to ruler checkbox and shows/hides ruler
         */
        toggleSecondPoint: function() {
            if ($(event.target).is(':checked'))
                this.sceneView.showSecondPoint();
            else
                this.sceneView.hideSecondPoint();
        },

        /**
         * Responds to ruler checkbox and shows/hides ruler
         */
        toggleRuler: function() {
            if ($(event.target).is(':checked'))
                this.rulerView.show();
            else
                this.rulerView.hide();
        },

        /**
         * Shows/hides virtual image stuff
         */
        toggleVirtualImage: function() {
            if ($(event.target).is(':checked')) 
                this.sceneView.showVirtualImage();
            else
                this.sceneView.hideVirtualImage();
        },

        /**
         * Switches between screen mode and picture mode
         */
        toggleScreen: function() {
            if ($(event.target).is(':checked')) {
                this.simulation.sourceObject.lightMode();
                this.$('.change-object-btn').hide();
            }
            else {
                this.simulation.sourceObject.nextPictureType();
                this.$('.change-object-btn').show();
            }
        },

        /**
         * Cycles through the source object's different pictures
         */
        changeObjectType: function() {
            this.simulation.sourceObject.nextPictureType();
        },

        changeIndexOfRefraction: function(event) {
            var index = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.simulation.lens.set('indexOfRefraction', index);
            });
        },

        changeRadiusOfCurvature: function(event) {
            var radius = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.simulation.lens.set('radiusOfCurvature', radius);
            });
        },

        changeDiameter: function(event) {
            var diameter = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.simulation.lens.set('diameter', diameter);
            });
        },

        updateIndexOfRefraction: function(lens, indexOfRefraction) {
            this.$indexOfRefraction.text(indexOfRefraction.toFixed(2) + 'm');
        },

        updateRadiusOfCurvature: function(lens, radiusOfCurvature) {
            this.$radiusOfCurvature.text(radiusOfCurvature.toFixed(2) + 'm');
        },

        updateDiameter: function(lens, diameter) {
            this.$diameter.text(diameter.toFixed(2) + 'm');
        },

        changeRaysMode: function(event) {
            var mode = parseInt($(event.target).val());
            this.sceneView.setRaysMode(mode);
        }

    });

    return GeometricOpticsSimView;
});
