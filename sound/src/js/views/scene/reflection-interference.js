define(function(require) {

    'use strict';

    var HelpLabelView = require('common/help-label/index');

    var SoundSceneView = require('views/scene');
    var WaveMediumView = require('views/wave-medium');
    var ReflectionLine = require('views/reflection-line');

    var Constants = require('constants');

    /**
     *
     */
    var ReflectionInterferenceSceneView = SoundSceneView.extend({

        minSceneHeightInMeters: 16,

        initialize: function(options) {
            SoundSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.personListener, 'change:origin',  this.speaker1Moved);
            this.listenTo(this.simulation.personListener, 'change:origin2', this.speaker2Moved);
        },

        initGraphics: function() {
            SoundSceneView.prototype.initGraphics.apply(this, arguments);

            //this.initReflectedWaveMediumView();
            this.initReflectionLine();
        },

        initReflectedWaveMediumView: function() {
            this.reflectedWaveMediumView = new WaveMediumView({
                model: this.simulation.waveMedium,
                mvt: this.mvt
            });

            this.stage.addChild(this.reflectedWaveMediumView.displayObject);
        },

        initReflectionLine: function() {
            this.reflectionLine = new ReflectionLine({
                position: {
                    x: this.mvt.modelToViewX(Constants.DEFAULT_WALL_POSITION),
                    y: this.height + 10
                },
                height: Math.sqrt(this.height * this.height + this.width * this.width) + 20,
                angle: Constants.DEFAULT_WALL_ANGLE
            });

            this.stage.addChild(this.reflectionLine.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            SoundSceneView.prototype._update.apply(this, arguments);

            //this.reflectedWaveMediumView.update(time, deltaTime, paused);
        },

        setReflectionLinePosition: function(x) {
            this.reflectionLine.setX(this.mvt.modelToViewX(x));
            // change the reflected wave medium view
        },

        setReflectionLineAngle: function(angle) {
            this.reflectionLine.setAngle(angle);
            // change the reflected wave medium view
        }

    });

    return ReflectionInterferenceSceneView;
});
