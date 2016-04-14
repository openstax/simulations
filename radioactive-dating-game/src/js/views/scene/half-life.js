define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');

    var ParticleGraphicsGenerator     = require('views/particle-graphics-generator');
    var NuclearPhysicsSceneView       = require('views/scene');
    var AtomCanisterView              = require('views/atom-canister');
    var DraggableExplodingNucleusView = require('views/nucleus/draggable');

    var HalfLifeNucleusDecayChart = require('radioactive-dating-game/views/nucleus-decay-chart/half-life');

    var Constants = require('constants');

    var showNucleusPlacementDebuggingGraphics = false;

    // CSS
    require('less!radioactive-dating-game/styles/scene');

    /**
     *
     */
    var HalfLifeSceneView = NuclearPhysicsSceneView.extend({

        initialize: function(options) {
            this.showingLabels = true;
            this.nucleusViews = [];

            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.atomicNuclei, 'add',    this.nucleusAdded);
            this.listenTo(this.simulation.atomicNuclei, 'remove', this.nucleusRemoved);
            this.listenTo(this.simulation.atomicNuclei, 'reset',  this.nucleiReset);
        },

        renderContent: function() {
            var self = this;

            this.$resetButton = $('<button class="btn btn-lg reset-nuclei-btn">Reset All Nuclei</button>');
            this.$resetButton.on('click', function() {
                self.resetNuclei();
            });

            this.$add10Button = $('<button class="btn add-10-btn">+ 10</button>');
            this.$add10Button.on('click', function() {
                self.addTenNuclei();
            });

            this.$remove10Button = $('<button class="btn remove-10-btn">- 10</button>');
            this.$remove10Button.on('click', function() {
                self.removeTenNuclei();
            });

            this.$bucketButtonsWrapper = $('<div class="bucket-btns-wrapper">');
            this.$bucketButtonsWrapper.append(this.$add10Button);
            this.$bucketButtonsWrapper.append(this.$remove10Button);

            this.$ui.append(this.$resetButton);
            this.$ui.append(this.$bucketButtonsWrapper);
        },

        reset: function() {
            this.showLabels();
        },

        getTopPadding: function() {
            return 150;
        },

        initMVT: function() {
            var pixelsPerFemtometer;

            if (AppView.windowIsShort()) {
                pixelsPerFemtometer = 3;
            }
            else {
                pixelsPerFemtometer = 4;
            }

            this.viewOriginX = 0;
            this.viewOriginY = 0;

            // The center of the screen is actually (5, 5) in the original
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                pixelsPerFemtometer
            );

            this.simulation.setNucleusBounds(
                this.mvt.viewToModelX(this.getLeftPadding()),
                this.mvt.viewToModelY(this.getTopPadding()),
                this.mvt.viewToModelDeltaX(this.getAvailableWidth()),
                this.mvt.viewToModelDeltaY(this.getAvailableHeight())
            );

            if (showNucleusPlacementDebuggingGraphics) {
                var graphics = new PIXI.Graphics();
                graphics.beginFill(0xFF0000, 1);
                graphics.drawRect(this.getLeftPadding(), this.getTopPadding(), this.getAvailableWidth(), this.getAvailableHeight());
                graphics.endFill();
                this.stage.addChild(graphics);    
            }
        },

        initGraphics: function() {
            NuclearPhysicsSceneView.prototype.initGraphics.apply(this, arguments);

            this.canisterLayer = new PIXI.Container();
            this.nucleusLayer = new PIXI.Container();
            this.dummyLayer = new PIXI.Container();

            this.stage.addChild(this.canisterLayer);
            this.stage.addChild(this.nucleusLayer);

            this.initMVT();
            this.initNucleusDecayChart();
            this.initAtomCanister();

            this.stage.addChild(this.dummyLayer);
        },

        initNucleusDecayChart: function() {
            this.nucleusDecayChart = new HalfLifeNucleusDecayChart({
                simulation: this.simulation,
                width: this.getWidthBetweenPanels(),
                renderer: this.renderer,
                bgColor: '#fff',
                bgAlpha: 0.2,
                hideNucleons: true,
                useElementColors: true
            });

            if (AppView.windowIsShort()) {
                this.nucleusDecayChart.displayObject.x = this.getLeftPadding() + 12;
                this.nucleusDecayChart.displayObject.y = 12;
            }
            else {
                this.nucleusDecayChart.displayObject.x = this.getLeftPadding() + 20;
                this.nucleusDecayChart.displayObject.y = 20;
            }

            this.stage.addChild(this.nucleusDecayChart.displayObject);
        },

        initAtomCanister: function() {
            var canisterX;
            var canisterY;
            var canisterWidth;

            if (AppView.windowIsShort()) {
                canisterX = 21;
                canisterY = 228;
                canisterWidth = 160;
            }
            else {
                canisterX = 534;
                canisterY = 440;
                canisterWidth = 160;
            }

            this.atomCanisterView = new AtomCanisterView({
                simulation: this.simulation,
                width: canisterWidth,
                mvt: this.mvt,
                dummyLayer: this.dummyLayer,
                renderer: this.renderer,
                preferredInterNucleusDistance: Constants.PREFERRED_INTER_NUCLEUS_DISTANCE,
                minNucleusToObstacleDistance: Constants.MIN_NUCLEUS_TO_OBSTACLE_DISTANCE,
                hideNucleons: true,
                atomScale: 2.5
            });

            this.atomCanisterView.displayObject.x = canisterX;
            this.atomCanisterView.displayObject.y = canisterY;

            // Position the bucket buttons underneath
            var top = this.atomCanisterView.displayObject.y + 140;
            this.$bucketButtonsWrapper.css('top', top + 'px');

            if (AppView.windowIsShort()) {
                var left = this.atomCanisterView.displayObject.x + this.atomCanisterView.width / 2;
                this.$bucketButtonsWrapper.css('left', left + 'px'); 
            }
            else {
                var right = this.width - this.atomCanisterView.displayObject.x - this.atomCanisterView.width / 2;
                this.$bucketButtonsWrapper.css('right', right + 'px');    
            }

            // Calculate the bounds of the areas to be avoided when placing atoms
            var buttonHeight = this.$bucketButtonsWrapper.find('button').height();
            var resetButtonPos = this.$resetButton.position();
            var bucketButtonsRect = new Rectangle(canisterX, top, this.atomCanisterView.width, buttonHeight);
            var resetButtonRect = new Rectangle(resetButtonPos.left, resetButtonPos.top, canisterWidth, 46);
            this.atomCanisterView.setAreasToAvoid([
                bucketButtonsRect,
                resetButtonRect
            ]);

            if (showNucleusPlacementDebuggingGraphics) {
                var graphics = new PIXI.Graphics();
                graphics.beginFill();
                for (var i = 0; i < this.atomCanisterView.modelAreasToAvoid.length; i++) {
                    var viewArea = this.mvt.modelToView(this.atomCanisterView.modelAreasToAvoid[i]);
                    graphics.drawRect(viewArea.x, viewArea.y, viewArea.w, viewArea.h);
                }
                graphics.endFill();
                this.stage.addChild(graphics);    
            }

            this.canisterLayer.addChild(this.atomCanisterView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            NuclearPhysicsSceneView.prototype._update.apply(this, arguments);
            
            this.nucleusDecayChart.update(time, deltaTime, paused);
            this.atomCanisterView.update(time, deltaTime, paused);

            for (var i = 0; i < this.nucleusViews.length; i++)
                this.nucleusViews[i].update(time, deltaTime, paused);
        },

        nucleusAdded: function(nucleus) {
            var nucleusView = new DraggableExplodingNucleusView({
                model: nucleus,
                mvt: this.mvt,
                showSymbol: this.showingLabels,
                atomCanister: this.atomCanisterView,
                renderer: this.renderer,
                hideNucleons: true
            });

            this.nucleusViews.push(nucleusView);

            this.nucleusLayer.addChild(nucleusView.displayObject);
        },

        nucleusRemoved: function(nucleus) {
            for (var i = 0; i < this.nucleusViews.length; i++) {
                if (this.nucleusViews[i].model == nucleus) {
                    this.nucleusViews[i].remove();
                    this.nucleusViews.splice(i, 1);
                    break;
                }
            }
        },

        nucleiReset: function() {
            for (var i = this.nucleusViews.length - 1; i >= 0; i--) {
                this.nucleusViews[i].remove();
                this.nucleusViews.splice(i, 1);
            }
        },

        resetNuclei: function() {
            this.simulation.resetActiveAndDecayedNuclei();
        },

        addTenNuclei: function() {
            this.atomCanisterView.addAtoms(10);
        },

        removeTenNuclei: function() {
            this.atomCanisterView.removeAtoms(10);
        },

        showLabels: function() {
            for (var i = 0; i < this.nucleusViews.length; i++)
                this.nucleusViews[i].showLabel();
            this.showingLabels = true;
        },

        hideLabels: function() {
            for (var i = 0; i < this.nucleusViews.length; i++)
                this.nucleusViews[i].hideLabel();
            this.showingLabels = false;
        }

    });

    return HalfLifeSceneView;
});
