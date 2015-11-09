define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var FaradaySceneView = require('views/scene');
    var WiggleMeView     = require('views/wiggle-me');
    var EarthView        = require('views/earth');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     *
     */
    var BarMagnetSceneView = FaradaySceneView.extend({

        initialize: function(options) {
            this.includeEarth = options.includeEarth;

            FaradaySceneView.prototype.initialize.apply(this, arguments);

            this.magnetModel = this.simulation.barMagnet;
        },

        reset: function() {
            FaradaySceneView.prototype.reset.apply(this, arguments);
            
            this.hideEarth();
        },

        initGraphics: function() {
            FaradaySceneView.prototype.initGraphics.apply(this, arguments);

            this.initCompass();
            this.initBarMagnet();
            this.initInsideBField();
            this.initWiggleMeView();
            if (this.includeEarth)
                this.initEarth();
        },

        initWiggleMeView: function() {
            this.wiggleMeView = new WiggleMeView({
                mvt: this.mvt,
                simulation: this.simulation
            });

            this.topLayer.addChild(this.wiggleMeView.displayObject);
        },

        initEarth: function() {
            this.earthView = new EarthView({
                mvt: this.mvt,
                model: this.simulation.barMagnet
            });
            this.earthView.hide();

            this.middleLayer.addChild(this.earthView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            FaradaySceneView.prototype._update.apply(this, arguments);

            this.wiggleMeView.update(time, deltaTime, paused);
        },

        showEarth: function() {
            this.earthView.show();
            this.bFieldInsideView.update();
        },

        hideEarth: function() {
            this.earthView.hide();
            this.bFieldInsideView.update();
        }

    });

    return BarMagnetSceneView;
});
