define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var AppView            = require('common/v3/app/app');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var ParticleGraphicsGenerator     = require('views/particle-graphics-generator');
    var NucleusDecayChart             = require('views/nucleus-decay-chart');
    var NuclearPhysicsSceneView       = require('views/scene');
    var AtomCanisterView              = require('views/atom-canister');
    var DraggableExplodingNucleusView = require('views/nucleus/draggable');

    /**
     *
     */
    var MultiNucleusBetaDecaySceneView = NuclearPhysicsSceneView.extend({

        initialize: function(options) {
            this.showingLabels = true;
            this.nucleusViews = [];

            NuclearPhysicsSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.atomicNuclei, 'add',    this.nucleusAdded);
            this.listenTo(this.simulation.atomicNuclei, 'remove', this.nucleusRemoved);
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

        getTopPadding: function() {
            return 150;
        },

        initMVT: function() {
            var pixelsPerFemtometer;
            if (AppView.windowIsShort()) {
                pixelsPerFemtometer = 7;
            }
            else {
                pixelsPerFemtometer = 9;
            }

            this.viewOriginX = this.getLeftPadding();
            this.viewOriginY = this.getTopPadding();

            // The center of the screen is actually (5, 5) in the original
            this.mvt = ModelViewTransform.createSinglePointScaleMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                pixelsPerFemtometer
            );

            this.simulation.setNucleusBounds(
                this.mvt.viewToModelX(this.getLeftPadding() + pixelsPerFemtometer),
                this.mvt.viewToModelY(this.getTopPadding() + pixelsPerFemtometer),
                this.mvt.viewToModelDeltaX(this.getAvailableWidth() - pixelsPerFemtometer * 2),
                this.mvt.viewToModelDeltaY(this.getAvailableHeight() - pixelsPerFemtometer * 2)
            );
        },

        initGraphics: function() {
            NuclearPhysicsSceneView.prototype.initGraphics.apply(this, arguments);

            this.nucleusLayer = new PIXI.Container();
            this.stage.addChild(this.nucleusLayer);

            this.initMVT();
            this.initNucleusDecayChart();
            this.initAtomCanister();
        },

        initNucleusDecayChart: function() {
            this.nucleusDecayChart = new NucleusDecayChart({
                simulation: this.simulation,
                width: this.getWidthBetweenPanels()
            });

            this.stage.addChild(this.nucleusDecayChart.displayObject);
        },

        initAtomCanister: function() {
            this.atomCanisterView = new AtomCanisterView({
                simulation: this.simulation,
                width: 160,
                mvt: this.mvt
            });

            this.atomCanisterView.displayObject.x = 534;
            this.atomCanisterView.displayObject.y = 440;

            var top = this.atomCanisterView.displayObject.y + 140;
            var right = this.width - this.atomCanisterView.displayObject.x - this.atomCanisterView.width / 2;
            this.$bucketButtonsWrapper.css('top', top + 'px');
            this.$bucketButtonsWrapper.css('right', right + 'px');

            this.stage.addChild(this.atomCanisterView.displayObject);
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
                atomCanister: this.atomCanisterView
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

        resetNuclei: function() {
            console.log('reset nuclei');
        },

        addTenNuclei: function() {
            this.atomCanisterView.addAtoms(10);
        },

        removeTenNuclei: function() {
            this.atomCanisterView.removeAtoms(10);
        },

        showLabels: function() {
            this.nucleusView.showLabel();
            this.showingLabels = true;
        },

        hideLabels: function() {
            this.nucleusView.hideLabel();
            this.showingLabels = false;
        }

    });

    return MultiNucleusBetaDecaySceneView;
});
