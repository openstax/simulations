define(function(require) {

    'use strict';

    var $    = require('jquery');
    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    var CircuitInteraction = require('models/circuit-interaction');

    var Constants = require('constants');

    require('less!styles/context-menu');

    /**
     * We don't want the hover overlays visible on any object while another object is dragging.
     */
    var someComponentIsDragging = false;

    /**
     * A view that represents a circuit component
     */
    var Draggable = PixiView.extend({

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

        contextMenuContent: '',

        selectionColor: Colors.parseHex(Constants.SELECTION_COLOR),

        /**
         * Initializes the new Draggable.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;
            this.circuit = options.circuit;

            this.hoverLayer = new PIXI.Container();
            this.initGraphics();

            this.listenTo(this.model, 'change:selected', this.updateSelection);
            this.listenTo(this.circuit, 'change:schematic', this.schematicModeChanged);

            this.schematicModeChanged(this.circuit, this.circuit.get('schematic'));
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
            if (someComponentIsDragging)
                return;
            
            someComponentIsDragging = true;
            this.dragging = true;
            this.dragged = false;
            this.showHoverGraphics();
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
                    this.clicked(event);
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

        clicked: function(event) {
            if (this.model.get('selected'))
                this.showContextMenu(event.data.global.x, event.data.global.y, event.data.originalEvent);
            else
                this.circuit.setSelection(this.model);
        },

        showContextMenu: function(x, y, originalEvent) {
            var content = '<ul class="context-menu">' + this.contextMenuContent + '</ul>';
            var $contextMenu = this.showPopover(x, y, originalEvent, '', content, 'right');
            $contextMenu.addClass('context-menu-popover');
            this.initContextMenu($contextMenu);
        },

        showPopover: function(x, y, originalEvent, title, content, placement) {
            if (this.$popoverAnchor)
                this.hidePopover();

            if (placement === undefined) {
                // Determine which side is appropriate based on where the point is in the scene
                var height = $('.scene-view').height();
                if (y > (height / 2))
                    placement = 'top'; 
                else
                    placement = 'bottom'; 
            }

            this.$popoverAnchor = $('<div data-toggle="popover"></div>');
            this.$popoverAnchor.css({
                position: 'absolute',
                top:  y + 'px',
                left: x + 'px'
            });
            $('.scene-view-ui').append(this.$popoverAnchor);

            this.$popoverAnchor.popover({
                title: title,
                content: content,
                placement: placement,
                trigger: 'focus',
                html: true
            });
            this.$popoverAnchor.popover('show');
            this.$popover = $('.scene-view-ui').children().last();

            this.originalEvent = originalEvent;

            return this.$popover;
        },

        hidePopovers: function(event) {
            var $closestPopover = $(event.target).closest('.popover');

            if (this.$popover && 
                Math.abs(event.originalEvent.timeStamp - this.originalEvent.timeStamp) > 30 && 
                ($closestPopover.length === 0 || $closestPopover[0] !== this.$popover[0])
            ) {
                this.hidePopover();
            }
        },

        hidePopover: function() {
            if (this.$popoverAnchor) {
                this.$popoverAnchor.popover('destroy');
                this.$popoverAnchor.remove();
                this.$popoverAnchor = null;
                this.$popover = null;
            }
        },

        initContextMenu: function($contextMenu) {},

        schematicModeChanged: function(circuit, schematic) {}

    }, {

        someComponentIsDragging: function() {
            return someComponentIsDragging;
        },

        setSomeComponentDragging: function(dragging) {
            someComponentIsDragging = dragging;
        }

    });

    return Draggable;
});