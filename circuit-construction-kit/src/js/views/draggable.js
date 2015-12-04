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
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd',
            'mouseover       .displayObject': 'hover',
            'mouseout        .displayObject': 'unhover'
        },

        selectionColor: Colors.parseHex(Constants.SELECTION_COLOR),

        /**
         * Initializes the new ComponentView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.circuit = options.circuit;

            this.hoverLayer = new PIXI.Container();
            this.initGraphics();

            this.listenTo(this.model, 'change:selected', this.updateSelection);
        },

        detach: function() {
            PixiView.prototype.detach.apply(this, arguments);

            if (this.hoverLayer.parent)
                this.hoverLayer.parent.removeChild(this.hoverLayer);
        },

        initGraphics: function() {
            this.hideHoverGraphics();

            this.updateMVT(this.mvt);
        },

        updateSelection: function(model, selected) {
            if (selected)
                this.showHoverGraphics();
            else if (!this.hovering && !this.dragging)
                this.hideHoverGraphics();
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;
        },

        dragStart: function(event) {
            someComponentIsDragging = true;
            this.dragging = true;
            this.dragged = false;
        },

        drag: function(event) {
            if (this.dragging) {
                this.dragged = true;
                this._drag(event);
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
                    this._drop(event);
                }

                if (!this.hovering)
                    this.hideHoverGraphics();
            }
        },

        _drag: function(event) {},

        _drop: function(event) {},

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

        showHoverGraphics: function() {
            this.hoverLayer.visible = true; 
        },

        hideHoverGraphics: function() {
            this.hoverLayer.visible = false;
        },

        clicked: function() {
            if (this.model.get('selected'))
                this.showContextMenu(this.model);
            else
                this.circuit.setSelection(this.model);
        },

        showContextMenu: function(model) {
            console.log('context menu');
        }

    });

    return ComponentView;
});