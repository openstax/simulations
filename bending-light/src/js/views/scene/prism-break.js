define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                             require('common/v3/pixi/dash-to');
    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var Colors             = require('common/colors/colors');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var BendingLightSceneView   = require('views/scene');
    var LaserView               = require('views/laser');
    var MediumView              = require('views/medium');
    var ProtractorView          = require('views/protractor');
    var PrismView               = require('views/prism');
    var IntersectionNormalsView = require('views/intersection-normals');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var PrismBreakSceneView = BendingLightSceneView.extend({

        initialize: function(options) {
            BendingLightSceneView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.simulation.prisms, 'reset',  this.prismsReset);
            this.listenTo(this.simulation.prisms, 'add',    this.prismAdded);
            this.listenTo(this.simulation.prisms, 'remove', this.prismRemoved);
        },

        initGraphics: function() {
            BendingLightSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMediumView();
            this.initProtractorView();
            this.initPrisms();
            this.initIntersectionNormals();
        },

        initMediumView: function() {
            this.environmentGraphics = new PIXI.Graphics();
            this.mediumLayer.addChild(this.environmentGraphics);
            this.listenTo(this.simulation.environment, 'change:color', this.updateEnvironmentColor);
        },

        initProtractorView: function() {
            this.protractorView = new ProtractorView({
                mvt: this.mvt
            });
            this.protractorView.displayObject.x = this.width / 2;
            this.protractorView.displayObject.y = this.height / 2;
            this.protractorView.hide();

            this.middleLayer.addChild(this.protractorView.displayObject);
        },

        initPrisms: function() {
            this.prisms = new PIXI.Container();
            this.prismViews = [];

            this.bottomLayer.addChild(this.prisms);
        },

        initIntersectionNormals: function() {
            this.intersectionNormalsView = new IntersectionNormalsView({
                mvt: this.mvt,
                simulation: this.simulation
            });

            this.middleLayer.addChild(this.intersectionNormalsView.displayObject);
        },

        updateEnvironmentColor: function(medium, color) {
            var graphics = this.environmentGraphics;
            graphics.clear();
            graphics.beginFill(Colors.rgbToHexInteger(color.r, color.g, color.b), 1);
            graphics.drawRect(0, 0, this.width, this.height);
            graphics.endFill();
        },

        _update: function(time, deltaTime, paused, timeScale) {
            BendingLightSceneView.prototype._update.apply(this, arguments);

            if (this.simulation.dirty)
                this.intersectionNormalsView.update();
        },

        getPrismIcons: function() {
            var icons = [];

            var scale = 300 / this.simulation.getHeight();
            var mvt = new ModelViewTransform.createSinglePointScaleInvertedYMapping(new Vector2(0, 0), new Vector2(0, 0), scale);

            var prisms = this.simulation.prismPrototypes;
            for (var i = 0; i < prisms.length; i++) {
                var view = new PrismView({
                    mvt: mvt,
                    model: prisms[i],
                    medium: this.simulation.prismMedium,
                    drawRotationHandle: false
                });

                icons.push(PixiToImage.displayObjectToDataURI(view.displayObject, 1));
            }

            return icons;
        },

        prismsReset: function(prisms) {
            // Remove old prism views
            for (var i = this.prismViews.length - 1; i >= 0; i--) {
                this.prismViews[i].removeFrom(this.prisms);
                this.prismViews.splice(i, 1);
            }

            // Add new prism views
            prisms.each(function(prism) {
                this.createAndAddPrismView(prism);
            }, this);
        },

        prismAdded: function(prism, prisms) {
            this.createAndAddPrismView(prism);
        },

        prismRemoved: function(prism, prisms) {
            for (var i = this.prismViews.length - 1; i >= 0; i--) {
                if (this.prismViews[i].model === prism) {
                    this.prismViews[i].removeFrom(this.prisms);
                    this.prismViews.splice(i, 1);
                    break;
                }
            }
        },

        createAndAddPrismView: function(prism) {
            var prismView = new PrismView({ 
                mvt: this.mvt,
                model: prism,
                medium: this.simulation.prismMedium
            });
            this.prisms.addChild(prismView.displayObject);
            this.prismViews.push(prismView);
        },

        showProtractor: function() {
            this.protractorView.show();
        },

        hideProtractor: function() {
            this.protractorView.hide();
        }

    });

    return PrismBreakSceneView;
});
