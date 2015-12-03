define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView = require('common/v3/pixi/view');
    var PixiToImage = require('common/v3/pixi/pixi-to-image');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var CircuitInteraction = require('models/circuit-interaction');

    var ComponentView = require('views/component');

    var Constants = require('constants');

    /**
     * A view that represents an atom
     */
    var WireView = ComponentView.extend({

        events: {
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
        },

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
            this.selectColor = Colors.parseHex(Constants.SELECTION_COLOR);

            ComponentView.prototype.initialize.apply(this, [options]);

            // Cached objects
            this._start     = new Vector2();
            this._end       = new Vector2();
            this._direction = new Vector2();
            this._point     = new Vector2();

            this.listenTo(this.model, 'start-junction-changed end-junction-changed', this.junctionsUpdated);
        },

        detach: function() {
            ComponentView.prototype.detach.apply(this, arguments);

            if (this.junctionLayer.parent)
                this.junctionLayer.parent.removeChild(this.junctionLayer);
        },

        initGraphics: function() {
            this.junctionLayer = new PIXI.Container();
            this.junctionGraphics = new PIXI.Graphics();
            this.junctionLayer.addChild(this.junctionGraphics);

            this.initLineHandle();
            this.initJunctionHandles();

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
            this.displayObject.addChild(this.lineHandle);

            this.lineHandle.hoverGraphics = new PIXI.Graphics();
            this.lineHandle.hoverGraphics.visible = false;
            this.lineHandle.addChild(this.lineHandle.hoverGraphics);
        },

        initJunctionHandles: function() {
            this.startJunction = this.createJunctionHandle();
            this.endJunction = this.createJunctionHandle();

            this.junctionLayer.addChild(this.startJunction);
            this.junctionLayer.addChild(this.endJunction);
        },

        createJunctionHandle: function() {
            var handle = new PIXI.Container();
            var hoverGraphics = new PIXI.Graphics();
            hoverGraphics.visible = false;
            handle.addChild(hoverGraphics);
            handle.hoverGraphics = hoverGraphics;
            handle.hitArea = new PIXI.Circle(0, 0, 1);
            handle.interactive = true;
            handle.buttonMode = true;
            handle.defaultCursor = 'move';
            handle.on('mouseover', function() {
                hoverGraphics.visible = true;
            });
            handle.on('mouseout', function() {
                hoverGraphics.visible = false;
            })
            return handle;
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
            this.draw();
            this.updateLineHandle();
            this.updateJunctionHandles();
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
            graphics.lineStyle(radius * 2 * 2, this.selectColor, Constants.SELECTION_AURA_ALPHA);
            graphics.moveTo(start.x, start.y);
            graphics.lineTo(end.x, end.y);
            // This is a little workaround for a current Pixi 3 bug:
            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;
            graphics.lineStyle(radius * 2, this.selectColor, 1);
            graphics.moveTo(start.x, start.y);
            graphics.lineTo(end.x, end.y);
        },

        updateJunctionHandles: function() {
            this.updateJunctionHandle(this.startJunction, this.model.get('startJunction'));
            this.updateJunctionHandle(this.endJunction, this.model.get('endJunction'));
        },

        updateJunctionHandle: function(handle, junctionModel) {
            var radius = Math.round(this.mvt.modelToViewDeltaX(WireView.WIRE_WIDTH) / 2);
            handle.hoverGraphics.clear();
            handle.hoverGraphics.beginFill(this.selectColor, 1);
            handle.hoverGraphics.drawCircle(0, 0, radius);
            handle.hoverGraphics.endFill();
            handle.hoverGraphics.beginFill(this.selectColor, Constants.SELECTION_AURA_ALPHA);
            handle.hoverGraphics.drawCircle(0, 0, radius * 2);
            handle.hoverGraphics.endFill();
            handle.hitArea.radius = radius;

            var viewPosition = this.mvt.modelToView(junctionModel.get('position'));
            handle.x = viewPosition.x;
            handle.y = viewPosition.y;
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
            this.updateJunctionHandles();
        },

        dragStart: function(event) {
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                this._point.set(event.data.global.x, event.data.global.y);
                var modelPoint = this.mvt.viewToModel(this._point);
 
                CircuitInteraction.dragBranch(this.model, modelPoint);
            }
        },

        dragEnd: function(event) {
            if (this.dragging) {
                this.dragging = false;

                CircuitInteraction.dropBranch(this.model);

                if (!this.hovering)
                    this.hideHoverGraphics();
            }
        },


        // ------------------------------------------------------------------------------------------------------------
        // TODO: Do the same thing for the junctions, and this can all go in a parent class to be used for all branches
        // ------------------------------------------------------------------------------------------------------------


        hover: function() {
            this.hovering = true;
            this.showHoverGraphics();
        },

        unhover: function() {
            this.hovering = false;
            if (!this.dragging)
                this.hideHoverGraphics();
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