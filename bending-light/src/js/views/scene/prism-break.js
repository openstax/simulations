define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

                             require('common/v3/pixi/dash-to');
    var PixiToImage        = require('common/v3/pixi/pixi-to-image');
    var Colors             = require('common/colors/colors');
    var ModelViewTransform = require('common/math/model-view-transform');
    var Vector2            = require('common/math/vector2');

    var BendingLightSceneView = require('views/scene');
    var LaserView             = require('views/laser');
    var MediumView            = require('views/medium');
    var ProtractorView        = require('views/protractor');
    var PrismView             = require('views/prism');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    /**
     *
     */
    var PrismBreakSceneView = BendingLightSceneView.extend({

        initialize: function(options) {
            BendingLightSceneView.prototype.initialize.apply(this, arguments);
        },

        initGraphics: function() {
            BendingLightSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMediumView();
            this.initProtractorView();
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

        updateEnvironmentColor: function(medium, color) {
            var graphics = this.environmentGraphics;
            graphics.clear();
            graphics.beginFill(Colors.rgbToHexInteger(color.r, color.g, color.b), 1);
            graphics.drawRect(0, 0, this.width, this.height);
            graphics.endFill();
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

        showProtractor: function() {
            this.protractorView.show();
        },

        hideProtractor: function() {
            this.protractorView.hide();
        }

    });

    return PrismBreakSceneView;
});
