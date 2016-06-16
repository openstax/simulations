define(function (require) {

    'use strict';

    var _ = require('underscore');

    var MultipleAtomsLaserSimulation = require('models/simulation/multiple-atoms');

    var LasersSimView          = require('views/sim');
    var MultipleAtomsSceneView = require('views/scene/multiple-atoms');
    var LaserControlsView      = require('views/laser-controls');

    // HTML
    var simHtml = require('text!templates/multiple-atoms-sim.html');

    /**
     * 
     */
    var MultipleAtomsSimView = LasersSimView.extend({

        template: _.template(simHtml),

        /**
         * Dom event listeners
         */
        events: _.extend({}, LasersSimView.prototype.events, {

        }),

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Multiple Atoms (Lasing)',
                name: 'multiple-atoms',
                alwaysShowLampViewOptions: true
            }, options);

            LasersSimView.prototype.initialize.apply(this, [options]);

            this.initLaserControlsView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new MultipleAtomsLaserSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new MultipleAtomsSceneView({
                simulation: this.simulation
            });
        },

        initLaserControlsView: function() {
            this.laserControlsView = new LaserControlsView({
                model: this.simulation.pumpingBeam
            });
        },

        /**
         * Renders everything
         */
        render: function() {
            LasersSimView.prototype.render.apply(this, arguments);

            this.renderLaserControls();

            return this;
        },

        /**
         * Renders the laser controls view
         */
        renderLaserControls: function() {
            this.laserControlsView.render();
            this.$el.append(this.laserControlsView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            LasersSimView.prototype.postRender.apply(this);
            
            this.laserControlsView.postRender();
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            LasersSimView.prototype.resetComponents.apply(this);
            
            this.laserControlsView.reset();
        },

    });

    return MultipleAtomsSimView;
});
