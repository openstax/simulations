define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView    = require('common/v3/pixi/view');
    var PixiToImage = require('common/v3/pixi/pixi-to-image');
    var Colors      = require('common/colors/colors');
    var Vector2     = require('common/math/vector2');

    var ComponentView = require('views/component');

    var Constants = require('constants');

    /**
     * A view that represents an atom
     */
    var WireView = ComponentView.extend({

        events: _.extend({}, ComponentView.prototype.events, {
            'touchstart      .lineHandle': 'dragStart',
            'mousedown       .lineHandle': 'dragStart',
            'touchmove       .lineHandle': 'drag',
            'mousemove       .lineHandle': 'drag',
            'touchend        .lineHandle': 'dragEnd',
            'mouseup         .lineHandle': 'dragEnd',
            'touchendoutside .lineHandle': 'dragEnd',
            'mouseupoutside  .lineHandle': 'dragEnd',
            'mouseover       .lineHandle': 'hover',
            'mouseout        .lineHandle': 'unhover'
        }),

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        /**
         * Initializes the new WireView.
         */
        initialize: function(options) {
            this.wireColor = Colors.parseHex(WireView.WIRE_COLOR);
            this.endColor  = Colors.parseHex(WireView.END_COLOR);

            // Cached objects
            this._start     = new Vector2();
            this._end       = new Vector2();

            ComponentView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            this.initLineHandle();

            ComponentView.prototype.initGraphics.apply(this, arguments);
        },

        initLineHandle: function() {
            var points = [];
            for (var i = 0; i < 4; i++)
                points.push(new PIXI.Point());

            this.lineHandle = new PIXI.Container();
            this.lineHandle.hitArea = new PIXI.Polygon(points);
            this.lineHandle.buttonMode    = true;
            this.lineHandle.defaultCursor = 'move';

            this.lineHandle.hoverGraphics = new PIXI.Graphics();
            this.lineHandle.hoverGraphics.visible = false;
            this.lineHandle.addChild(this.lineHandle.hoverGraphics);

            this.displayObject.addChild(this.lineHandle);
        },

        /**
         * Draws the wire patch
         */
        draw: function() {
            var width = Math.round(this.mvt.modelToViewDeltaX(WireView.WIRE_WIDTH));
            
            var point;
            point = this.mvt.modelToView(this.model.get('startJunction').get('position'));
            var x0 = point.x;
            var y0 = point.y;
            point = this.mvt.modelToView(this.model.get('endJunction').get('position'));
            var x1 = point.x;
            var y1 = point.y;

            // Draw the base lines
            var graphics = this.displayObject;
            graphics.clear();
            graphics.lineStyle(width, this.wireColor, 1);
            graphics.moveTo(x0, y0);
            graphics.lineTo(x1, y1);

            // Then round the edges by drawing circles over the connection points
            var radius = width / 2;
            graphics = this.junctionGraphics;
            graphics.clear();
            graphics.lineStyle(0, 0, 0);
            graphics.beginFill(this.endColor, 1);
            graphics.drawCircle(x0, y0, radius);
            graphics.drawCircle(x1, y1, radius);
            graphics.endFill();
        },

        junctionsUpdated: function() {
            ComponentView.prototype.junctionsUpdated.apply(this, arguments);

            this.draw();
            this.updateLineHandle();
        },

        updateLineHandle: function() {
            var radius = Math.round(this.mvt.modelToViewDeltaX(WireView.WIRE_WIDTH) / 2);
            var start = this._start.set(this.mvt.modelToView(this.model.get('startJunction').get('position')));
            var end = this._end.set(this.mvt.modelToView(this.model.get('endJunction').get('position')));
            var direction = this._direction.set(end).sub(start).normalize().scale(radius);

            var points = this.lineHandle.hitArea.points;
            points[0] = start.x - direction.y;
            points[1] = start.y + direction.x;
            points[2] = end.x   - direction.y;
            points[3] = end.y   + direction.x;
            points[4] = end.x   + direction.y;
            points[5] = end.y   - direction.x;
            points[6] = start.x + direction.y;
            points[7] = start.y - direction.x;

            var graphics = this.lineHandle.hoverGraphics;
            graphics.clear();
            graphics.lineStyle(radius * 2, this.selectionColor, 1);
            graphics.moveTo(start.x, start.y);
            graphics.lineTo(end.x, end.y);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            ComponentView.prototype.updateMVT.apply(this, arguments);

            this.draw();
        },

        showHoverGraphics: function() {
            this.lineHandle.hoverGraphics.visible = true;
        },

        hideHoverGraphics: function() {
            this.lineHandle.hoverGraphics.visible = false;
        },

        generateTexture: function() {
            return this.displayObject.generateTexture();
            var container = new PIXI.Container();
            container.addChild(this.displayObject);
            container.addChild(this.junctionLayer);
            // var graphics = new PIXI.Graphics();
            // graphics.lineStyle(10, 0, 1);
            // graphics.moveTo(-20, -20);
            // graphics.lineTo(20, 20);
            // graphics.lineTo(-20, 20);
            // graphics.lineTo(20, -20);
            // container.addChild(graphics);
            var texture = PixiToImage.displayObjectToTexture(container);
            // container.removeChild(this.displayObject);
            // container.removeChild(this.junctionLayer);
            return texture;
        }

    }, Constants.WireView);

    return WireView;
});