define(function(require) {

    'use strict';

    var HelpLabelView = require('common/help-label/index');
    var Reflection    = require('common/math/reflection');

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

            this.initReflectedWaveMediumView();
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

            this.reflectedWaveMediumView.update(time, deltaTime, paused);
        },

        setReflectionLinePosition: function(x) {
            this.reflectionLine.setX(this.mvt.modelToViewX(x));
            this.positionReflectedWaveMediumView();
        },

        setReflectionLineAngle: function(angle) {
            this.reflectionLine.setAngle(angle);
            this.positionReflectedWaveMediumView();
        },

        positionReflectedWaveMediumView: function() {
            // Set up the wavefront graphic for the reflected wave front. We make set its origin to be the apparent
            // position of the real wavefront source's reflection in the wall. Note that the angle must be set negative
            // because of the direction of the y axis in AWT.

            // To set up the reflected medium view, we take the origin of
            //   the real one and reflect it across the reflection line.
            //   Note that this means the reflected medium view's origin
            //   will be on the other side of the "wall", but the waves
            //   coming out of it will not be visible until after they
            //   cross the line of reflection, making it look like the
            //   waves that are hitting the reflection line are bouncing
            //   off.
            var realOrigin = this.waveMediumView.getOrigin();
            var reflectedOrigin = Reflection.reflectPointAcrossLine(
                realOrigin, 
                this.reflectionLine.getMidPoint(), 
                this.reflectionLine.getAngle()
            );
console.log(reflectedOrigin)
            this.reflectedWaveMediumView.clear();
            this.reflectedWaveMediumView.setOrigin(reflectedOrigin);
            this.reflectedWaveMediumView.displayObject.rotation = -this.reflectionLine.getAngle() * 2;
        }

    });

    return ReflectionInterferenceSceneView;
});
