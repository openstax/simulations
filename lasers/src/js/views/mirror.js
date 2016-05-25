define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var Assets = require('assets');
    var Constants = require('constants');

    var MirrorView = PixiView.extend({

        initialize: function(options) {
            this.simulation = options.simulation;
            this.leftFacing = options.leftFacing;
            this.modelThickness = Constants.MIRROR_THICKNESS;
            this.xOffset = (options.leftFacing) ? 0 : -this.modelThickness;

            // Cached objects
            this._position = new Vector2();

            this.initGraphics();
            this.updateMVT(options.mvt);

            this.listenTo(this.model, 'change:reflectivity', this.reflecivityChanged);
            this.listenTo(this.simulation, 'change:mirrorsEnabled', this.mirrorsEnabledChanged);

            this.mirrorsEnabledChanged(this.simulation, this.simulation.get('mirrorsEnabled'));
        },

        initGraphics: function() {
            this.graphics = new PIXI.Graphics();
            this.outlineGraphics = new PIXI.Graphics();

            var blurFilter = new PIXI.filters.BlurFilter();
            blurFilter.blur = 20;

            this.shineMask = new PIXI.Graphics();

            this.shineGraphics = new PIXI.Graphics();
            this.shineGraphics.mask = this.shineMask;
            this.shineGraphics.filters = [ blurFilter ];

            this.displayObject.addChild(this.graphics);
            this.displayObject.addChild(this.shineGraphics);
            this.displayObject.addChild(this.shineMask);
            this.displayObject.addChild(this.outlineGraphics);
        },

        draw: function() {
            // Calculate position and dimensions
            var thickness = this.mvt.modelToViewDeltaX(this.modelThickness);
            var height = this.mvt.modelToViewDeltaY(this.model.getBounds().h);
            var position = this._position
                .set(this.mvt.modelToView(this.model.get('position')))
                .add(-thickness / 2 + this.xOffset, 0);

            // Calculate color
            var reflectivity = this.model.getReflectivity();
            var maxGray = 100;
            var minGray = 220;
            var grayValue = minGray - Math.floor(reflectivity * (minGray - maxGray));
            var fillColor = Colors.rgbToHexInteger(grayValue, grayValue, grayValue);
            var lineGrayValue = Math.floor(grayValue * 0.7);
            var lineColor = Colors.rgbToHexInteger(lineGrayValue, lineGrayValue, lineGrayValue);
            var lineWidth = 2;

            // Position everything
            this.displayObject.x = position.x;
            this.displayObject.y = position.y;

            var graphics = this.graphics;
            graphics.clear();
            graphics.beginFill(fillColor, 1);

            graphics.lineStyle(lineWidth, lineColor, 1);
            graphics.drawEllipse(thickness * 1.5, height / 2, thickness / 2, height / 2);

            graphics.lineStyle(0, 0, 0);
            graphics.drawEllipse(thickness / 2, height / 2, thickness / 2, height / 2);
            graphics.drawRect(thickness / 2, 0, thickness, height);

            graphics.endFill();

            graphics.lineStyle(lineWidth, lineColor, 1);
            graphics.moveTo(thickness / 2, 0);
            graphics.lineTo(thickness * 1.5, 0);
            graphics.moveTo(thickness / 2, height);
            graphics.lineTo(thickness * 1.5, height);

            var outlineGraphics = this.outlineGraphics;
            outlineGraphics.lineStyle(lineWidth, lineColor, 1);
            outlineGraphics.drawEllipse(thickness / 2, height / 2, thickness / 2, height / 2);

            var mask = this.shineMask;
            mask.clear();
            mask.beginFill();
            mask.drawEllipse(thickness / 2, height / 2, thickness / 2, height / 2);
            mask.endFill();

            var shineGraphics = this.shineGraphics;
            shineGraphics.clear();
            shineGraphics.lineStyle(2, 0xFFFFFF, 1);
            shineGraphics.moveTo(0, height);
            shineGraphics.lineTo(thickness, 0);
        },

        /**
         * Updates the model-view-transform and anything that relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        },

        reflecivityChanged: function() {
            this.draw();
        },

        mirrorsEnabledChanged: function(simulation, mirrorsEnabled) {
            this.displayObject.visible = mirrorsEnabled;
        }

    });
    
    return MirrorView;
});
