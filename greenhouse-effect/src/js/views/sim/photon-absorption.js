define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView            = require('common/app/sim');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var PixiToImage        = require('common/pixi/pixi-to-image');

    var PhotonAbsorptionSimulation = require('models/simulation/photon-absorption');
    var PhotonAbsorptionSceneView  = require('views/scene/photon-absorption');
    var MoleculeView               = require('views/molecule');

    var CH4 = require('models/molecule/ch4');
    var CO  = require('models/molecule/co');
    var CO2 = require('models/molecule/co2');
    var H2O = require('models/molecule/h2o');
    var N2  = require('models/molecule/n2');
    var O2  = require('models/molecule/o2');

    var Constants = require('constants');
    var PhotonTargets = Constants.PhotonAbsorptionSimulation.PhotonTargets;

    var Assets    = require('assets');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
    require('less!styles/playback-controls');
    require('less!common/styles/slider');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var simHtml              = require('text!templates/sim-photon-absorption.html');
    var playbackControlsHtml = require('text!templates/playback-controls-photon-absorption.html');

    /**
     * Base SimView for the Greenhouse Effects and Glass Layers tabs
     */
    var PhotonAbsorptionSimView = SimView.extend({

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(simHtml),

        /**
         * Dom event listeners
         */
        events: {
            'click .play-btn'   : 'play',
            'click .pause-btn'  : 'pause',
            'click .reset-btn'  : 'reset',

            'click .atmospheric-gas' : 'changeAtmosphericGas'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Photon Absorption',
                name: 'photon-absorption',
            }, options);

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();

            this.listenTo(this.simulation, 'change:paused', this.pausedChanged);
            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new PhotonAbsorptionSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new PhotonAbsorptionSceneView({
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
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var iconSize = 24;
            var iconMVT = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(iconSize / 2, iconSize / 2),
                0.1
            );

            var CH4View = new MoleculeView({ model: new CH4(), mvt: iconMVT });
            var CO2View = new MoleculeView({ model: new CO2(), mvt: iconMVT });
            var H2OView = new MoleculeView({ model: new H2O(), mvt: iconMVT });
            var N2View  = new MoleculeView({ model: new N2(),  mvt: iconMVT });
            var O2View  = new MoleculeView({ model: new O2(),  mvt: iconMVT });

            var gases = {};
            gases[PhotonTargets.SINGLE_CH4_MOLECULE] = {
                src: PixiToImage.displayObjectToDataURI(CH4View.displayObject),
                label: 'CH<sub>4</sub>'
            };
            gases[PhotonTargets.SINGLE_CO2_MOLECULE] = {
                src: PixiToImage.displayObjectToDataURI(CO2View.displayObject),
                label: 'CO<sub>2</sub>'
            };
            gases[PhotonTargets.SINGLE_H2O_MOLECULE] = {
                src: PixiToImage.displayObjectToDataURI(H2OView.displayObject),
                label: 'H<sub>2</sub>O'
            };
            gases[PhotonTargets.SINGLE_N2_MOLECULE] = {
                src: PixiToImage.displayObjectToDataURI(N2View.displayObject),
                label: 'N<sub>2</sub>'
            };
            gases[PhotonTargets.SINGLE_O2_MOLECULE] = {
                src: PixiToImage.displayObjectToDataURI(O2View.displayObject),
                label: 'O<sub>2</sub>'
            };
            gases[PhotonTargets.CONFIGURABLE_ATMOSPHERE] = {
                src: '',
                label: 'Build atmosphere'
            };

            var data = {
                Constants: Constants,
                simulation: this.simulation,
                unique: this.cid,
                iconSize: iconSize,
                Assets: Assets,
                gases: gases
            };
            this.$el.html(this.template(data));
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        /**
         * Renders playback controls
         */
        renderPlaybackControls: function() {
            this.$el.append(playbackControlsHtml);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
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

        changeAtmosphericGas: function(event) {
            var photonTarget = this.$('.atmospheric-gas:checked').val();
            this.simulation.set('photonTarget', parseInt(photonTarget));
        }

    });

    return PhotonAbsorptionSimView;
});
