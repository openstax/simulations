define(function (require) {

    'use strict';

    var $ = require('jquery');
    var _ = require('underscore');

    var SimView = require('common/v3/app/sim');

    var LasersSimulation = require('models/simulation');

    var LasersSceneView = require('views/scene');
    var LaserPowerView  = require('views/laser-power');

    var Constants = require('constants');
    var Assets = require('assets');

    require('nouislider');
    require('bootstrap');
    require('bootstrap-select');

    // CSS
    require('less!styles/sim');
    require('less!styles/playback-controls.less');
    require('less!styles/laser-picture-dialog');
    require('less!common/styles/slider');
    require('less!common/styles/radio');
    require('less!bootstrap-select-less');

    // HTML
    var playbackControlsHtml = require('text!templates/playback-controls.html');
    var optionsHtml          = require('text!templates/options.html');
    var pictureDialogHtml    = require('text!templates/laser-picture-dialog.html');

    /**
     * This is the umbrella view for everything in a simulation tab.  It
     *   will be extended by both the One Atom and the Multiple Atom tab.
     */
    var LasersSimView = SimView.extend({

        /**
         * Root element properties
         */
        tagName:   'section',
        className: 'sim-view',

        /**
         * Template for rendering the basic scaffolding
         */
        template: _.template(''),
        optionsTemplate: _.template(optionsHtml),

        /**
         * Dom event listeners
         */
        events: {
            'click .play-btn'  : 'play',
            'click .pause-btn' : 'pause',
            'click .step-btn'  : 'step',
            'click .reset-btn' : 'reset',
            'click .view-laser-picture-btn' : 'viewLaserPictureDialog',

            'change .energy-levels-select'    : 'changeEnergyLevels',
            'change .lamp-view-select'        : 'changeLampViewMode',
            'change .lower-transition-select' : 'changeLowerTransitionViewMode',
            'click .enable-mirrors-check'     : 'toggleMirrors',
            'slide .reflectivity-slider'      : 'changeReflectivity',
            'click .display-high-level-emitted-photons-check' : 'toggleHighLevelEmittedPhotons'
        },

        /**
         * Inits simulation, views, and variables.
         *
         * @params options
         */
        initialize: function(options) {
            options = _.extend({
                title: 'Lasers',
                name: 'lasers',
                link: 'legacy/lasers',
                alwaysShowLampViewOptions: false
            }, options);

            this.alwaysShowLampViewOptions = options.alwaysShowLampViewOptions;

            SimView.prototype.initialize.apply(this, [options]);

            this.initSceneView();
            this.initLaserPowerView();

            this.listenTo(this.simulation, 'change:paused',           this.pausedChanged);
            this.listenTo(this.simulation, 'change:mirrorsEnabled',   this.mirrorsEnabledChanged);
            this.listenTo(this.simulation, 'change:elementProperties', this.elementPropertiesChanged);

            this.pausedChanged(this.simulation, this.simulation.get('paused'));
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new LasersSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new LasersSceneView({
                simulation: this.simulation
            });
        },

        initLaserPowerView: function() {
            this.laserPowerView = new LaserPowerView({
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
            this.renderLaserPower();

            this.$el.append(pictureDialogHtml);

            return this;
        },

        /**
         * Renders page content. Should be overriden by child classes
         */
        renderScaffolding: function() {
            var data = {
                Constants: Constants,
                Assets: Assets,
                simulation: this.simulation,
                unique: this.cid,
                alwaysShowLampViewOptions: this.alwaysShowLampViewOptions
            };

            this.$el.html(this.template(data));
            this.$('.sim-controls-right').append(this.optionsTemplate(data));

            this.$('select').selectpicker();

            this.$reflectivitySlider = this.$('.reflectivity-slider');
            this.$reflectivitySlider.noUiSlider({
                start: 100,
                range: {
                    min: 0,
                    max: 100
                },
                connect: 'lower'
            });

            this.$reflectivityValue = this.$('.reflectivity-value');
        },

        /**
         * Renders playback controls bar
         */
        renderPlaybackControls: function() {
            this.$el.append(playbackControlsHtml);
        },

        /**
         * Renders the scene view
         */
        renderSceneView: function() {
            this.sceneView.render();
            this.$('.scene-view-placeholder').replaceWith(this.sceneView.el);
        },

        /**
         * Renders the laser controls view
         */
        renderLaserPower: function() {
            this.laserPowerView.render();
            this.$el.append(this.laserPowerView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            this.sceneView.postRender();
            this.laserPowerView.postRender();

            this.mirrorsEnabledChanged(this.simulation, this.simulation.get('mirrorsEnabled'));
            this.elementPropertiesChanged(this.simulation, this.simulation.get('elementProperties'));
        },

        resetSimulation: function() {
            // Set pause the updater and reset everything
            this.updater.pause();
            this.updater.reset();
            this.resetComponents();
            this.resetControls();

            // Resume normal function
            this.updater.play();
            this.play();
            this.pausedChanged();
        },

        /**
         * Resets all the controls back to their default state.
         */
        resetControls: function() {
            this.$('select.energy-levels-select').val((this.simulation.get('elementProperties') === this.simulation.twoLevelProperties) ? 2 : 3);
            this.$('.lamp-view-select').val((this.simulation.get('pumpingPhotonViewMode') === Constants.PHOTON_DISCRETE) ? 'photons' : 'beam');
            this.$('.lower-transition-select').val('photons');
            this.$('.enable-mirrors-check').prop('checked', this.simulation.get('mirrorsEnabled'));
            this.$reflectivitySlider.val(this.simulation.rightMirror.getReflectivity() * 100);
            this.updateReflectivityLabel(this.simulation.rightMirror.getReflectivity() * 100);
            this.$('.display-high-level-emitted-photons-check').prop('checked', false);

            this.$('select').selectpicker('refresh');
        },

        /**
         * Resets all the components of the view.
         */
        resetComponents: function() {
            SimView.prototype.resetComponents.apply(this);
            
            this.sceneView.reset();
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

        viewLaserPictureDialog: function() {
            this.$('.picture-dialog').modal('show');
        },

        changeEnergyLevels: function(event) {
            var numLevels = parseInt($(event.target).val());
            this.simulation.setNumEnergyLevels(numLevels);
        },

        changeLampViewMode: function(event) {
            if ($(event.target).val() === 'beam')
                this.simulation.set('pumpingPhotonViewMode', Constants.PHOTON_CURTAIN);
            else
                this.simulation.set('pumpingPhotonViewMode', Constants.PHOTON_DISCRETE);
        },

        changeLowerTransitionViewMode: function(event) {
            if ($(event.target).val() === 'wave')
                this.simulation.set('lasingPhotonViewMode', Constants.PHOTON_WAVE);
            else
                this.simulation.set('lasingPhotonViewMode', Constants.PHOTON_DISCRETE);
        },

        toggleMirrors: function(event) {
            if ($(event.target).is(':checked'))
                this.simulation.set('mirrorsEnabled', true);
            else
                this.simulation.set('mirrorsEnabled', false);
        },

        changeReflectivity: function(event) {
            this.inputLock(function() {
                var percent = parseFloat(this.$('.reflectivity-slider').val());
                this.updateReflectivityLabel(percent);
                this.simulation.rightMirror.set('reflectivity', percent / 100);
            });
        },

        updateReflectivityLabel: function(percent) {
            this.$reflectivityValue.text(Math.round(percent) + '%');
        },

        toggleHighLevelEmittedPhotons: function(event) {
            if ($(event.target).is(':checked'))
                this.simulation.set('displayHighLevelEmissions', true);
            else
                this.simulation.set('displayHighLevelEmissions', false);
        },

        mirrorsEnabledChanged: function(simulation, mirrorsEnabled) {
            if (mirrorsEnabled)
                this.$('.mirror-options').show();
            else
                this.$('.mirror-options').hide();
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

        elementPropertiesChanged: function(simulation, elementProperties) {
            if (elementProperties === simulation.twoLevelProperties)
                this.$('.three-level-options').hide();
            else
                this.$('.three-level-options').show();
        },

        photonSizeChanged: function() {
            this.sceneView.photonSizeChanged();
        },

        showHelp: function() {
            this.sceneView.showHelp();
        },

        hideHelp: function() {
            this.sceneView.hideHelp();
        }

    });

    return LasersSimView;
});
