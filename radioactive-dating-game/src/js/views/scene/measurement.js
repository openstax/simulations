define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var NuclearPhysicsSceneView = require('views/scene');

    var DecayRatesGraphView  = require('radioactive-dating-game/views/decay-rates-graph');
    var LandscapeView        = require('radioactive-dating-game/views/landscape');
    var TreeLandscapeView    = require('radioactive-dating-game/views/landscape/tree');
    var VolcanoLandscapeView = require('radioactive-dating-game/views/landscape/volcano');

    var Constants = require('constants');
    var Assets = require('assets');

    // CSS
    require('less!radioactive-dating-game/styles/scene');

    /**
     *
     */
    var MeasurementSceneView = NuclearPhysicsSceneView.extend({

        initialize: function(options) {
            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);
        },

        reset: function() {
            
        },

        getTopPadding: function() {
            return 230;
        },

        initMVT: function() {
            this.mvt = LandscapeView.createMVT(this.width, this.height);
        },

        initGraphics: function() {
            NuclearPhysicsSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initBackground();

            var graphics = new PIXI.Graphics();
            graphics.beginFill(0xFF0000, 1);
            var point = this.mvt.modelToView(new Vector2(100, 60));
            graphics.drawCircle(point.x, point.y, 3);
            graphics.endFill();
            this.stage.addChild(graphics);
            // this.initDecayRatesGraphView();
        },

        initBackground: function() {
            var landscapeSettings = {
                mvt: this.mvt,
                simulation: this.simulation,
                width: this.width,
                height: this.height
            };

            this.treeLandscape    = new TreeLandscapeView(landscapeSettings);
            this.volcanoLandscape = new VolcanoLandscapeView(landscapeSettings);

            this.stage.addChild(this.treeLandscape.displayObject);
            this.stage.addChild(this.volcanoLandscape.displayObject);

            this.$ui.append(this.treeLandscape.renderElement().el);
            this.$ui.append(this.volcanoLandscape.renderElement().el);

            this.volcanoLandscape.hide();
        },

        initDecayRatesGraphView: function() {
            var probePanelWidth = 200;
            var width = this.getWidthBetweenPanels() - probePanelWidth;

            this.decayRatesGraphView = new DecayRatesGraphView({
                simulation: this.simulation,
                width: width
            });

            if (AppView.windowIsShort()) {
                this.decayRatesGraphView.displayObject.x = this.getLeftPadding() + 12 + probePanelWidth;
                this.decayRatesGraphView.displayObject.y = 12;
            }
            else {
                this.decayRatesGraphView.displayObject.x = this.getLeftPadding() + 20 + probePanelWidth;
                this.decayRatesGraphView.displayObject.y = 20;
            }

            this.stage.addChild(this.decayRatesGraphView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            NuclearPhysicsSceneView.prototype._update.apply(this, arguments);

            // this.decayRatesGraphView.update(time, deltaTime, paused);

            if (this.simulation.get('mode') === Constants.MeasurementSimulation.MODE_TREE)
                this.treeLandscape.update(time, deltaTime, paused);
            else
                this.volcanoLandscape.update(time, deltaTime, paused);
        },

        resetSimulation: function() {

        },

        showTree: function() {
            this.treeLandscape.show();
            this.volcanoLandscape.hide();
        },

        showVolcano: function() {
            this.volcanoLandscape.show();
            this.treeLandscape.hide();
        },

        setSoundVolumeMute: function() {
            this.volcanoLandscape.setSoundVolumeMute();
        },

        setSoundVolumeLow: function() {
            this.volcanoLandscape.setSoundVolumeLow();
        },

        setSoundVolumeHigh: function() {
            this.volcanoLandscape.setSoundVolumeHigh();
        }

    });

    return MeasurementSceneView;
});
