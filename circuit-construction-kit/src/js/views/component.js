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
            this.circuit = options.circuit;

            // Cached objects
            this._direction = new Vector2();
            this._point     = new Vector2();

            this.initGraphics();

            this.listenTo(this.model, 'start-junction-changed end-junction-changed', this.junctionsUpdated);
            this.listenTo(this.model, 'change:selected', this.updateSelection);
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
            this.startJunction = this.createJunctionHandle(this.model.get('startJunction'));
            this.endJunction   = this.createJunctionHandle(this.model.get('endJunction'));

            this.junctionLayer.addChild(this.startJunction);
            this.junctionLayer.addChild(this.endJunction);
        },

        createJunctionHandle: function(junctionModel) {
            var handle = new PIXI.Container();
            var hoverGraphics = new PIXI.Graphics();
            hoverGraphics.visible = false;
            handle.model = junctionModel;
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
                if (!handle.dragging && !handle.model.get('selected'))
                    hoverGraphics.visible = false;
            });
            return handle;
        },

        junctionsUpdated: function() {
            this.updateJunctionHandles();

            this.updateJunctionSelection(this.startJunction, this.model.get('startJunction').get('selected'));
            this.updateJunctionSelection(this.endJunction,   this.model.get('endJunction').get('selected'));
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

        updateJunctionSelection: function(handle, selected) {
            if (selected)
                handle.hoverGraphics.visible = true;
            else if (!handle.hovering && !handle.dragging)
                handle.hoverGraphics.visible = false;
        },

        updateSelection: function(model, selected) {
            if (selected)
                this.showHoverGraphics();
            else if (!this.hovering && !this.dragging)
                this.hideHoverGraphics();
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
            this.dragged = false;
            someComponentIsDragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                this.dragged = true;

                this._point.set(event.data.global.x, event.data.global.y);
                var modelPoint = this.mvt.viewToModel(this._point);
 
                CircuitInteraction.dragBranch(this.model, modelPoint);

                this.circuit.clearSelection();
            }
        },

        dragEnd: function(event) {
            if (this.dragging) {
                this.dragging = false;
                someComponentIsDragging = false;

                if (!this.dragged) {
                    this.clicked();
                }
                else {
                    CircuitInteraction.dropBranch(this.model);
                }

                if (!this.hovering)
                    this.hideHoverGraphics();
            }
        },

        dragStartJunctionStart: function(event) {
            this.currentHandle = this.startJunction;
            this.currentHandle.dragging = true;
            this.currentJunctionModel = this.model.get('startJunction');

            this.dragJunctionStart(event);
        },

        dragEndJunctionStart: function(event) {
            this.currentHandle = this.endJunction;
            this.currentHandle.dragging = true;
            this.currentJunctionModel = this.model.get('endJunction');

            this.dragJunctionStart(event);
        },

        dragJunctionStart: function(event) {
            someComponentIsDragging = true;
            this.draggingJunction = true;
            this.junctionDragged = false;
        },

        dragJunction: function(event) {
            if (this.draggingJunction) {
                this.junctionDragged = true;

                this._point.set(event.data.global.x, event.data.global.y);
                var modelPoint = this.mvt.viewToModel(this._point);
        
                CircuitInteraction.dragJunction(this.currentJunctionModel, modelPoint);

                this.circuit.clearSelection();
            }
        },

        dragJunctionEnd: function(event) {
            if (this.draggingJunction) {
                this.draggingJunction = false;
                someComponentIsDragging = false;

                if (!this.junctionDragged) {
                    if (this.currentHandle === this.startJunction)
                        this.startJunctionClicked();
                    else
                        this.endJunctionClicked();
                }
                else {
                    CircuitInteraction.dropJunction(this.currentJunctionModel);
                }

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
            if (!this.dragging && !this.model.get('selected'))
                this.hideHoverGraphics();
        },

        showHoverGraphics: function() {},

        hideHoverGraphics: function() {},

        clicked: function() {
            if (this.model.get('selected'))
                this.showContextMenu();
            else
                this.circuit.setSelection(this.model);
        },

        showContextMenu: function() {
            console.log('context menu');
        },

        startJunctionClicked: function() {
            if (this.model.get('startJunction').get('selected'))
                this.showJunctionContextMenu(this.model.get('startJunction'));
            else
                this.circuit.setSelection(this.model.get('startJunction'));
        },

        endJunctionClicked: function() {
            if (this.model.get('endJunction').get('selected'))
                this.showJunctionContextMenu(this.model.get('endJunction'));
            else
                this.circuit.setSelection(this.model.get('endJunction'));
        },

        showJunctionContextMenu: function(junctionModel) {
            console.log('junction context menu');
        },

        generateTexture: function() {
            return PIXI.Texture.EMPTY;
        }

    });

    return ComponentView;
});