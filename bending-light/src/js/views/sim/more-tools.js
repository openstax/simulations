define(function(require) {

    'use strict';

    var _        = require('underscore');
    var Backbone = require('backbone');

    var MoreToolsSimulation = require('models/simulation/more-tools');

    var IntroSimView        = require('views/sim/intro');
    var MoreToolsSceneView  = require('views/scene/more-tools');
    var LaserControlsView   = require('views/laser-controls');
    var WaveSensorView      = require('views/wave-sensor');

    var simHtml = require('text!templates/sim/more-tools.html');

    /**
     *
     */
    var MoreToolsSimView = IntroSimView.extend({

        template: _.template(simHtml),

        events: _.extend(IntroSimView.prototype.events, {
            
        }),

        initialize: function(options) {
            options = _.extend({
                title: 'MoreTools',
                name:  'more-tools'
            }, options);
            
            IntroSimView.prototype.initialize.apply(this, [ options ]);

            this.listenTo(this.simulation.waveSensor, 'change:enabled', this.showHidePlaybackControls);
        },

        /**
         * Initializes the Simulation.
         */
        initSimulation: function() {
            this.simulation = new MoreToolsSimulation();
        },

        /**
         * Initializes the SceneView.
         */
        initSceneView: function() {
            this.sceneView = new MoreToolsSceneView({
                simulation: this.simulation
            });
        },

        initLaserControls: function() {
            this.laserControlsView = new LaserControlsView({
                model: this.simulation.laser,
                simulation: this.simulation,
                showWavelengthControls: true
            });
        },

        getToolboxConfig: function() {
            var config = IntroSimView.prototype.getToolboxConfig.apply(this);
            var sceneView = this.sceneView;
            var simulation = this.simulation;

            config.tools = {
                protractor: config.tools.protractor,
                velocitySensor: {
                    title: 'Velocity Sensor',
                    label: '',
                    img: sceneView.getVelocitySensorIcon(),
                    activate: function() {
                        simulation.velocitySensor.set('enabled', true);
                    },
                    deactivate: function() {
                        simulation.velocitySensor.set('enabled', false);
                    }
                },
                waveSensor: {
                    title: 'Wave Sensor',
                    label: '',
                    img: sceneView.getWaveSensorIcon(),
                    activate: function() {
                        simulation.waveSensor.set('enabled', true);
                    },
                    deactivate: function() {
                        simulation.waveSensor.set('enabled', false);
                    }
                },
                intensityMeter: config.tools.intensityMeter,
                normal: config.tools.normal
            };

            return config;
        },

        render: function() {
            IntroSimView.prototype.render.apply(this);

            return this;
        },

        laserBeamTypeChanged: function(laser, wave) {
            this.showHidePlaybackControls();
        },

        showHidePlaybackControls: function() {
            if (this.simulation.laser.get('wave') || this.simulation.waveSensor.get('enabled'))
                this.$playbackControls.show();
            else
                this.$playbackControls.hide();
        }

    });

    return MoreToolsSimView;
});
