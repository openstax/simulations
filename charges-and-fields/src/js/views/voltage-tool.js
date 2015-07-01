define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView       = require('common/pixi/view');
    var Colors         = require('common/colors/colors');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an atom
     */
    var VoltageTool = PixiView.extend({

        width: 200,
        height: 120,
        margin: 15,
        sensorOuterRadius: 25,
        sensorInnerRadius: 20,

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd',
        },

        /**
         * Initializes the new VoltageTool.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.panelColor = Colors.parseHex(Constants.SceneView.PANEL_BG);

            // Cached objects
            this._dragOffset = new PIXI.Point();

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();

            this.displayObject.buttonMode = true;

            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            var halfWidth = this.width / 2;

            // Draw the shadow
            var outline = new PiecewiseCurve();
            var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
            var radius = this.sensorOuterRadius;

            outline
                .moveTo(-halfWidth, 0)
                .lineTo(-radius, 0)
                .curveTo(
                    -radius, 0 -radius * kappa, 
                    -radius*kappa, -radius,
                    0, -radius
                )
                .curveTo(
                    radius * kappa, -radius,
                    radius, -radius * kappa,
                    radius, 0
                )
                .lineTo(halfWidth, 0)
                .lineTo(halfWidth, this.height)
                .lineTo(-halfWidth, this.height)
                .close();

            var drawStyle = {
                lineWidth: 11,
                strokeStyle: 'rgba(0,0,0,0)',
                shadowBlur: 11,
                fillStyle: 'rgba(0,0,0,1)'
            };

            var shadow = PIXI.Sprite.fromPiecewiseCurve(outline, drawStyle);
            shadow.alpha = 0.3;
            this.displayObject.addChild(shadow);

            // Draw the panel
            var graphics = new PIXI.Graphics();
            graphics.beginFill(this.panelColor, 1);
            graphics.drawRect(-halfWidth, 0, this.width, this.height);
            graphics.drawCircle(0, 0, this.sensorOuterRadius);
            graphics.endFill();

            this.displayObject.addChild(graphics);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        dragStart: function(data) {
            this.dragOffset = data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.displayObject.x - this.dragOffset.x;
                var dy = data.global.y - this.displayObject.y - this.dragOffset.y;
                
                this.displayObject.x += dx;
                this.displayObject.y += dy;

                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.inputLock(function() {
                    this.model.translate(mdx, mdy);
                });
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

    });


    return VoltageTool;
});