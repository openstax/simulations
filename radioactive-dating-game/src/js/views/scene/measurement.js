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

        renderContent: function() {
            var self = this;

            this.$resetButton = $('<button class="btn btn-lg reset-btn">Reset</button>');
            this.$resetButton.on('click', function() {
                self.resetSimulation();
            });

            this.$plantTreeButton = $('<button class="btn btn-lg plant-tree-btn">Plant Tree</button>');
            this.$plantTreeButton.on('click', function() {
                self.plantTree();
            });

            this.$killTreeButton = $('<button class="btn btn-lg kill-tree-btn">Kill Tree</button>');
            this.$killTreeButton.on('click', function() {
                self.killTree();
            });

            this.$eruptVolcanoButton = $('<button class="btn btn-lg erupt-volcano-btn">Erupt Volcano</button>');
            this.$eruptVolcanoButton.on('click', function() {
                self.eruptVolcano();
            });

            this.$coolRockButton = $('<button class="btn btn-lg cool-rock-btn">Erupt Volcano</button>');
            this.$coolRockButton.on('click', function() {
                self.coolRock();
            });

            this.$ui.append(this.$resetButton);
            this.$ui.append(this.$plantTreeButton);
            this.$ui.append(this.$killTreeButton);
            this.$ui.append(this.$eruptVolcanoButton);
            this.$ui.append(this.$coolRockButton);
        },

        reset: function() {
            
        },

        getTopPadding: function() {
            return 230;
        },

        initMVT: function() {
            var pixelsPerFemtometer;

            if (AppView.windowIsShort()) {
                pixelsPerFemtometer = 0.7;
            }
            else {
                pixelsPerFemtometer = 1;
            }

            this.viewOriginX = 0;
            this.viewOriginY = 0;

            // The center of the screen is actually (5, 5) in the original
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                pixelsPerFemtometer
            );
        },

        initGraphics: function() {
            NuclearPhysicsSceneView.prototype.initGraphics.apply(this, arguments);

            this.backgroundEffectsLayer = new PIXI.Container();
            this.backgroundLayer = new PIXI.Container();
            this.foregroundLayer = new PIXI.Container();
            this.foregroundEffectsLayer = new PIXI.Container();

            this.stage.addChild(this.backgroundEffectsLayer);
            this.stage.addChild(this.backgroundLayer);
            this.stage.addChild(this.foregroundLayer);
            this.stage.addChild(this.foregroundEffectsLayer);

            this.initMVT();
            this.initBackground();
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

            this.backgroundLayer.addChild(this.treeLandscape.displayObject);
            this.backgroundLayer.addChild(this.volcanoLandscape.displayObject);

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

            this.treeLandscape.update(time, deltaTime, paused);
            this.volcanoLandscape.update(time, deltaTime, paused);
        },

        resetSimulation: function() {

        },

        plantTree: function() {

        },

        killTree: function() {

        },

        eruptVolcano: function() {

        },

        coolRock: function() {

        },

        showTree: function() {
            this.treeLandscape.show();
            this.volcanoLandscape.hide();
        },

        showVolcano: function() {
            this.volcanoLandscape.show();
            this.treeLandscape.hide();
        }

    });

    return MeasurementSceneView;
});
