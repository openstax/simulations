define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var ParticleGraphicsGenerator = require('views/particle-graphics-generator');
    var NucleusDecayChart         = require('views/nucleus-decay-chart');

    var BetaDecaySceneView = require('beta-decay/views/scene');

    /**
     *
     */
    var MultiNucleusBetaDecaySceneView = BetaDecaySceneView.extend({

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
            this.initNucleusDecayChart();
        },

        initNucleusDecayChart: function() {
            this.nucleusDecayChart = new NucleusDecayChart({
                simulation: this.simulation,
                width: this.getWidthBetweenPanels()
            });

            this.stage.addChild(this.nucleusDecayChart.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        }

    });

    return MultiNucleusBetaDecaySceneView;
});
