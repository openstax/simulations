define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var EnergySystemsSimulation = require('models/simulation/energy-systems');

    var SimView                = require('common/app/sim');
    var EnergySystemsSceneView = require('views/scene/energy-systems');

    var Assets = require('assets'); window.Assets = Assets;

    require('bootstrap');

    // CSS
    require('less!styles/sim');
    require('less!styles/playback-controls');
    require('less!styles/energy-systems');
    require('less!common/styles/radio');

    // HTML
    var simHtml = require('text!templates/sim/energy-systems.html');
    var controlsHtml = require('text!templates/energy-systems-controls.html');

    /**
     * 
     */
    var EnergySystemsSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),
        controlsTemplate: _.template(controlsHtml),

        /**
         * Dom event listeners
         */
        events: {
            // Playback controls
            'click .play-btn'   : 'play',
            'click .pause-btn'  : 'pause',
            'click .step-btn'   : 'step',
            'click .reset-btn'  : 'reset',

            'click .energy-symbols-checkbox': 'toggleEnergySymbols',

            'click .element-icon': 'elementIconClicked'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Energy Systems',
                name: 'energy-systems',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            // Initialize the scene view
            this.initSceneView();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));

            this.listenTo(this.simulation, 'change:source change:converter change:user', this.elementSelected);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new EnergySystemsSimulation();
        },

        /**
         * Initializes the Simulation.
         */
        initSceneView: function() {
            this.sceneView = new EnergySystemsSceneView({
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
            this.renderPlaybackControls();

            return this;
        },

        /**
         *
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.$el);
            this.$el.append(this.sceneView.$ui);
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {

            var elements = {
                sources: [
                    {
                        cid: this.simulation.sources[0].cid, 
                        src: Assets.Images.FAUCET_ICON,
                        type: 'source'
                    },{
                        cid: this.simulation.sources[1].cid, 
                        src: Assets.Images.SUN_ICON,
                        type: 'source'
                    },{
                        cid: this.simulation.sources[2].cid, 
                        src: Assets.Images.TEAPOT_ICON,
                        type: 'source'
                    },{
                        cid: this.simulation.sources[3].cid, 
                        src: Assets.Images.BICYCLE_ICON,
                        type: 'source'
                    }
                ],
                converters: [
                    {
                        cid: this.simulation.converters[0].cid, 
                        src: Assets.Images.GENERATOR_ICON,
                        type: 'converter'
                    },{
                        cid: this.simulation.converters[1].cid, 
                        src: Assets.Images.SOLAR_PANEL_ICON,
                        type: 'converter'
                    }
                ],
                users: [
                    {
                        cid: this.simulation.users[0].cid, 
                        src: Assets.Images.WATER_ICON,
                        type: 'user'
                    },{
                        cid: this.simulation.users[1].cid, 
                        src: Assets.Images.INCANDESCENT_ICON,
                        type: 'user'
                    },{
                        cid: this.simulation.users[2].cid, 
                        src: Assets.Images.FLUORESCENT_ICON,
                        type: 'user'
                    }
                ]
            };

            var energySymbols = [
                {
                    label: 'Mechanical',
                    src: Assets.Images.E_MECH_BLANK
                },{
                    label: 'Electrical',
                    src: Assets.Images.E_ELECTRIC_BLANK
                },{
                    label: 'Thermal',
                    src: Assets.Images.E_THERM_BLANK_ORANGE
                },{
                    label: 'Light',
                    src: Assets.Images.E_LIGHT_BLANK
                },{
                    label: 'Chemical',
                    src: Assets.Images.E_CHEM_BLANK_LIGHT
                }
            ];

            this.$el.html(this.template({
                elementGroups: elements,
                energySymbols: energySymbols
            }));

            this.elementSelected(null, this.simulation.get('source'));
            this.elementSelected(null, this.simulation.get('converter'));
            this.elementSelected(null, this.simulation.get('user'));

            this.$energySymbolsLegend = this.$('.energy-symbols-legend');
        },

        /**
         * Renders the playback controls at the bottom of the screen
         */
        renderPlaybackControls: function() {
            this.$controls = $(this.controlsTemplate({
                unique: this.cid
            }));

            this.$('.playback-controls-placeholder').replaceWith(this.$controls);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
        },

        /**
         *
         */
        resetComponents: function() {
            SimView.prototype.resetComponents.apply(this);
            
        },

        /**
         * This is run every tick of the updater.  It updates the wave
         *   simulation and the views.
         */
        update: function(time, deltaTime) {
            // Update the model
            this.simulation.update(time, deltaTime);

            // Update the scene
            this.sceneView.update(time / 1000, deltaTime / 1000, this.simulation.get('paused'));
        },

        elementIconClicked: function(event) {
            var $element = $(event.target).closest('.element-icon');
            var element;
            switch ($element.data('type')) {
                case 'source':
                    element = _.findWhere(this.simulation.sources, { cid: $element.data('cid') });
                    this.simulation.set('source', element);
                    break;
                case 'converter':
                    element = _.findWhere(this.simulation.converters, { cid: $element.data('cid') });
                    this.simulation.set('converter', element);
                    break;
                case 'user':
                    element = _.findWhere(this.simulation.users, { cid: $element.data('cid') });
                    this.simulation.set('user', element);
                    break;
            }
            
        },

        elementSelected: function(model, element) {
            this.$('.element-icon[data-cid="' + element.cid + '"]')
                .addClass('active')
                .siblings()
                    .removeClass('active');
        },

        /**
         * The simulation changed its paused state.
         */
        pausedChanged: function() {
            if (this.simulation.get('paused'))
                this.$el.removeClass('playing');
            else
                this.$el.addClass('playing');
        },

        toggleEnergySymbols: function(event) {
            if ($(event.target).is(':checked')) {
                this.sceneView.showEnergyChunks();
                this.$energySymbolsLegend.addClass('visible');
            }
            else {
                this.sceneView.hideEnergyChunks();
                this.$energySymbolsLegend.removeClass('visible');
            }
        }

    });

    return EnergySystemsSimView;
});
