define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Vector2                = require('common/math/vector2');
    var Colors                 = require('common/colors/colors');
    var defineInputUpdateLocks = require('common/locks/define-locks');

    var CircuitInteraction = require('models/circuit-interaction');

    var Draggable = require('views/draggable');

    var Constants = require('constants');

    var resistanceControlsHtml = require('text!templates/resistance-controls.html');

    require('less!styles/resistance-controls');

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
            var content = resistanceControlsHtml;
            var $anchor = this.$popoverAnchor;
            var x = parseInt($anchor.css('left'));
            var y = parseInt($anchor.css('top'));
            var $popover = this.showPopover(x, y, event.originalEvent, 'Resistance', content);

            var $slider = $popover.find('.resistance-slider');
            $slider.noUiSlider({
                start: this.model.get('resistance'),
                connect: 'lower',
                range: {
                    'min': Constants.MIN_RESISTANCE,
                    'max': 100
                }
            });
            $slider.on('slide', _.bind(this.resistanceSliderChanged, this));

            var $text = $popover.find('.resistance-text');
            $text.val(this.model.get('resistance'));
            $text.on('keyup', _.bind(this.resistanceTextChanged, this));

            this.$resistanceSlider = $slider;
            this.$resistanceText = $text;
        },

        resistanceTextChanged: function(event) {
            var resistance = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.$resistanceSlider.val(resistance);
                this.model.set('resistance', resistance);
            });
        },

        resistanceSliderChanged: function(event) {
            var resistance = parseFloat($(event.target).val());
            this.inputLock(function() {
                this.$resistanceText.val(resistance.toFixed(2));
                this.model.set('resistance', resistance);
            });
        }

    });

    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(ComponentView);

    return ComponentView;
});