define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Vector2  = require('common/math/vector2');
    var Colors   = require('common/colors/colors');

    var CircuitInteraction = require('models/circuit-interaction');

    var Draggable = require('views/draggable');

    var Constants = require('constants');

    /**
     * We don't want the hover overlays visible on any object while another object is dragging.
     */
    var someComponentIsDragging = false;

    /**
     * A view that represents a circuit component
     */
    var ComponentView = Draggable.extend({

        contextMenuContent: '<li><a class="remove-btn"><span class="fa fa-trash"></span>&nbsp; Remove</a></li>',

        /**
         * Initializes the new ComponentView.
         */
        initialize: function(options) {
            // Cached objects
            this._point = new Vector2();

            Draggable.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'start-junction-changed end-junction-changed', this.junctionsChanged);
        },

        initGraphics: function() {
            this.initComponentGraphics();
            this.initHoverGraphics();

            Draggable.prototype.initGraphics.apply(this, arguments);
        },

        initComponentGraphics: function() {},

        initHoverGraphics: function() {},

        junctionsChanged: function() {},

        _drag: function(event) {
            this._point.set(event.data.global.x, event.data.global.y);
            var modelPoint = this.mvt.viewToModel(this._point);
            
            CircuitInteraction.dragBranch(this.model, modelPoint);

            this.circuit.clearSelection();
        },

        _drop: function(event) {
            CircuitInteraction.dropBranch(this.model);
        },

        initContextMenu: function($contextMenu) {
            $contextMenu.on('click', '.remove-btn', _.bind(this.destroy, this));
        },

        initShowValueMenuItem: function($contextMenu) {
            $contextMenu.on('click', '.show-value-btn', _.bind(this.toggleValue, this));

            if (this.model.get('showReadout')) {
                $contextMenu
                    .find('.show-value-btn .fa-square-o')
                    .removeClass('fa-square-o')
                    .addClass('fa-check-square-o');
            }
        },

        initChangeResistanceMenuItem: function($contextMenu) {
            $contextMenu.on('click', '.change-resistance-btn', _.bind(this.showResistanceMenu, this));
        },

        destroy: function() {
            this.circuit.removeBranch(this.model);
            this.hidePopover();
        },

        generateTexture: function() {
            return PIXI.Texture.EMPTY;
        },

        toggleValue: function() {
            this.model.set('showReadout', !this.model.get('showReadout'));
            this.hidePopover();
        },

        showResistanceMenu: function(event) {
            var content = '<div style="height: 100px; width: 200px"></div>';
            var $anchor = this.$popoverAnchor;
            var x = parseInt($anchor.css('left'));
            var y = parseInt($anchor.css('top'));
            var $popover = this.showPopover(x, y, event.originalEvent, 'Change Resistance', content);
            
        },

    });

    return ComponentView;
});