define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    var CircuitInteraction = require('models/circuit-interaction');

    var Constants = require('constants');

    /**
     * We don't want the hover overlays visible on any object while another object is dragging.
     */
    var someComponentIsDragging = false;

    /**
     * A view that represents a circuit component
     */
    var ComponentView = PixiView.extend({

        events: {
            'touchstart      .startJunction': 'dragStartJunctionStart',
            'mousedown       .startJunction': 'dragStartJunctionStart',
            'touchmove       .startJunction': 'dragJunction',
            'mousemove       .startJunction': 'dragJunction',
            'touchend        .startJunction': 'dragJunctionEnd',
            'mouseup         .startJunction': 'dragJunctionEnd',
            'touchendoutside .startJunction': 'dragJunctionEnd',
            'mouseupoutside  .startJunction': 'dragJunctionEnd',

            'touchstart      .endJunction': 'dragEndJunctionStart',
            'mousedown       .endJunction': 'dragEndJunctionStart',
            'touchmove       .endJunction': 'dragJunction',
            'mousemove       .endJunction': 'dragJunction',
            'touchend        .endJunction': 'dragJunctionEnd',
            'mouseup         .endJunction': 'dragJunctionEnd',
            'touchendoutside .endJunction': 'dragJunctionEnd',
            'mouseupoutside  .endJunction': 'dragJunctionEnd'
        },

        selectionColor: Colors.parseHex(Constants.SELECTION_COLOR),

        /**
         * Initializes the new ComponentView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            // Cached objects
            this._direction = new Vector2();
            this._point     = new Vector2();

            this.initGraphics();

            this.listenTo(this.model, 'start-junction-changed end-junction-changed', this.junctionsUpdated);
        },

        detach: function() {
            PixiView.prototype.detach.apply(this, arguments);

            if (this.junctionLayer.parent)
                this.junctionLayer.parent.removeChild(this.junctionLayer);
        },

        initGraphics: function() {
            this.junctionLayer = new PIXI.Container();
            this.junctionGraphics = new PIXI.Graphics();
            this.junctionLayer.addChild(this.junctionGraphics);

            this.initJunctionHandles();

            this.updateMVT(this.mvt);
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
                if (handle.dragging || !someComponentIsDragging) {
                    handle.hovering = true;
                    hoverGraphics.visible = true;    
                }
            });
            handle.on('mouseout', function() {
                handle.hovering = false;
                if (!handle.dragging)
                    hoverGraphics.visible = false;
            });
            return handle;
        },

        junctionsUpdated: function() {
            this.updateJunctionHandles();
        },

        updateJunctionHandles: function() {
            this.updateJunctionHandle(this.startJunction, this.model.get('startJunction'));
            this.updateJunctionHandle(this.endJunction, this.model.get('endJunction'));
        },

        updateJunctionHandle: function(handle, junctionModel) {
            var radius = Math.round(this.mvt.modelToViewDeltaX(Constants.WireView.WIRE_WIDTH) / 2);
            handle.hoverGraphics.clear();
            handle.hoverGraphics.beginFill(this.selectionColor, 1);
            handle.hoverGraphics.drawCircle(0, 0, radius);
            handle.hoverGraphics.endFill();
            handle.hoverGraphics.beginFill(this.selectionColor, Constants.SELECTION_AURA_ALPHA);
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

            this.updateJunctionHandles();
        },

        dragStart: function(event) {
            this.dragging = true;
            someComponentIsDragging = true;
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
                someComponentIsDragging = false;

                CircuitInteraction.dropBranch(this.model);

                if (!this.hovering)
                    this.hideHoverGraphics();
            }
        },

        dragStartJunctionStart: function(event) {
            someComponentIsDragging = true;
            this.draggingJunction = true;
            this.currentHandle = this.startJunction;
            this.currentHandle.dragging = true;
            this.currentJunctionModel = this.model.get('startJunction');
        },

        dragEndJunctionStart: function(event) {
            someComponentIsDragging = true;
            this.draggingJunction = true;
            this.currentHandle = this.endJunction;
            this.currentHandle.dragging = true;
            this.currentJunctionModel = this.model.get('endJunction');
        },

        dragJunction: function(event) {
            if (this.draggingJunction) {
                this._point.set(event.data.global.x, event.data.global.y);
                var modelPoint = this.mvt.viewToModel(this._point);
        
                CircuitInteraction.dragJunction(this.currentJunctionModel, modelPoint);
            }
        },

        dragJunctionEnd: function(event) {
            if (this.draggingJunction) {
                this.draggingJunction = false;
                someComponentIsDragging = false;

                CircuitInteraction.dropJunction(this.currentJunctionModel);

                if (!this.currentHandle.hovering)
                    this.currentHandle.hoverGraphics.visible = false;

                this.currentHandle.dragging = false;
                this.currentJunctionModel = null;
                this.currentHandle = null;
            }
        },

        hover: function() {
            if (this.dragging || !someComponentIsDragging) {
                this.hovering = true;
                this.showHoverGraphics();    
            }
        },

        unhover: function() {
            this.hovering = false;
            if (!this.dragging)
                this.hideHoverGraphics();
        },

        showHoverGraphics: function() {},

        hideHoverGraphics: function() {},

        generateTexture: function() {
            return PIXI.Texture.EMPTY;
        }

    });

    return ComponentView;
});