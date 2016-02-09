define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var NucleusSpriteGenerator = require('views/nucleus-sprite-generator');

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
            var nucleusSprite = NucleusSpriteGenerator.generate(nucleus, this.mvt);
            var viewPosition = this.mvt.modelToView(nucleus.get('position'));
            nucleusSprite.x = viewPosition.x;
            nucleusSprite.y = viewPosition.y;

            this.stage.addChild(nucleusSprite);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        }

    });

    return SingleNucleusBetaDecaySceneView;
});
