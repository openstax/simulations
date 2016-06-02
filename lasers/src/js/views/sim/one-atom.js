define(function (require) {

    'use strict';

    var _ = require('underscore');

    var WavelengthSliderView = require('common/controls/wavelength-slider');

    var OneAtomLaserSimulation = require('models/simulation/one-atom');

    var LasersSimView     = require('views/sim');
    var OneAtomSceneView  = require('views/scene/one-atom');
    var LaserControlsView = require('views/laser-controls');
    var LegendView        = require('views/legend');

    var Constants = require('constants');

    // HTML
    var simHtml = require('text!templates/one-atom-sim.html');

    /**
     * 
     */
    var OneAtomSimView = LasersSimView.extend({

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
                title: 'One Atom (Absorption and Emission)',
                name: 'one-atom'
            }, options);

            LasersSimView.prototype.initialize.apply(this, [options]);

            this.initLaserControlsView();
            this.initLegendView();
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new OneAtomLaserSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new OneAtomSceneView({
                simulation: this.simulation
            });
        },

        initLaserControlsView: function() {
            this.laser1ControlsView = new LaserControlsView({
                model: this.simulation.seedBeam,
                number: 1
            });

            this.laser2ControlsView = new LaserControlsView({
                model: this.simulation.pumpingBeam,
                number: 2
            });
        },

        initLegendView: function() {
            this.legendView = new LegendView({ 
                renderer: this.sceneView.renderer,
                simulation: this.simulation
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
            this.laser1ControlsView.render();
            this.laser2ControlsView.render();
            this.$el.append(this.laser1ControlsView.el);
            this.$el.append(this.laser2ControlsView.el);
        },

        renderLegend: function() {
            this.legendView.render();
            this.$('.legend-panel').append(this.legendView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            LasersSimView.prototype.postRender.apply(this);
            
            this.laser1ControlsView.postRender();
            this.laser2ControlsView.postRender();
            this.renderLegend();
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            LasersSimView.prototype.resetComponents.apply(this);
            
            this.laser1ControlsView.reset();
            this.laser2ControlsView.reset();
        },

        elementPropertiesChanged: function(simulation, elementProperties) {
            LasersSimView.prototype.elementPropertiesChanged.apply(this, arguments);

            if (elementProperties === simulation.twoLevelProperties)
                this.laser2ControlsView.hide();
            else
                this.laser2ControlsView.show();
        }

    });

    return OneAtomSimView;
});
