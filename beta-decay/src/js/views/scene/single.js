define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');

    var BetaDecaySceneView = require('beta-decay/views/scene');

    /**
     *
     */
    var SingleNucleusBetaDecaySceneView = BetaDecaySceneView.extend({

        initialize: function(options) {
            BetaDecaySceneView.prototype.initialize.apply(this, arguments);
        },

        initMVT: function() {
            if (AppView.windowIsShort()) {
                this.viewOriginX = Math.round((this.width - 200) / 2);
                this.viewOriginY = Math.round(this.height / 2);
            }
            else {
                this.viewOriginX = Math.round(this.width  / 2);
                this.viewOriginY = Math.round(this.height / 2);
            }

            var pixelsPerFemtometer = 25;

            // The center of the screen is actually (5, 5) in the original
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                pixelsPerFemtometer
            );
        },

        initGraphics: function() {
            BetaDecaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();

            var nucleus = this.simulation.atomicNucleus;
            var nucleusSprite = ParticleGraphicsGenerator.generateNucleus(nucleus, this.mvt);
            var viewPosition = this.mvt.modelToView(nucleus.get('position'));
            nucleusSprite.x = viewPosition.x;
            nucleusSprite.y = viewPosition.y;

            var particle = ParticleGraphicsGenerator.generateElectron(this.mvt)
            particle.x = 200;
            particle.y = 200;
            this.stage.addChild(particle);
            // this.stage.addChild()
            // this.stage.addChild(ParticleGraphicsGenerator.generateProton(this.mvt))
            // this.stage.addChild(ParticleGraphicsGenerator.generateElectron(this.mvt))
            // this.stage.addChild(ParticleGraphicsGenerator.generateAntineutrino(this.mvt))

            //this.stage.addChild(nucleusSprite);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        }

    });

    return SingleNucleusBetaDecaySceneView;
});
