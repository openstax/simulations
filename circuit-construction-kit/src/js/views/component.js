define(function(require) {

    'use strict';

    var $    = require('jquery');
    var _    = require('underscore');
    var PIXI = require('pixi');

    var Vector2                = require('common/math/vector2');
    var Colors                 = require('common/colors/colors');
    var defineInputUpdateLocks = require('common/locks/define-locks');
                                 require('common/v3/pixi/dash-to');

    var CircuitInteraction = require('models/circuit-interaction');

    var Draggable = require('views/draggable');

    var Constants = require('constants');

    var resistanceControlsHtml = require('text!templates/resistance-controls.html');
    var voltageControlsHtml    = require('text!templates/voltage-controls.html');
    var frequencyControlsHtml  = require('text!templates/frequency-controls.html');

    require('less!styles/component-controls');

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
            this._center = new Vector2();

            Draggable.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'start-junction-changed end-junction-changed', this.junctionsChanged);
            this.listenTo(this.model, 'change:showReadout', this.showReadoutChanged);

            this.showReadoutChanged(this.model, this.model.get('showReadout'));
        },

        detach: function() {
            Draggable.prototype.detach.apply(this, arguments);

            if (this.labelLayer.parent)
                this.labelLayer.parent.removeChild(this.labelLayer);

            if (this.effectsLayer.parent)
                this.effectsLayer.parent.removeChild(this.effectsLayer);

            if (this.helpLayer.parent)
                this.helpLayer.parent.removeChild(this.helpLayer);
        },

        initGraphics: function() {
            this.effectsLayer = new PIXI.Container();
            this.helpLayer = new PIXI.Container();

            this.initComponentGraphics();
            this.initHoverGraphics();
            this.initValuesLabel();

            Draggable.prototype.initGraphics.apply(this, arguments);
        },

        initComponentGraphics: function() {},

        initHoverGraphics: function() {},

        initValuesLabel: function() {
            var label = new PIXI.Text('', {
                font: '14px Helvetica Neue',
                fill: Constants.VALUE_LABEL_COLOR
            });
            label.resolution = this.getResolution();
            label.anchor.x = 0.5;
            label.anchor.y = 0.5;

            this.label = label;
            this.labelConnectionGraphics = new PIXI.Graphics();
            this.labelConnectionDashStyle = [2, 2];
            this.labelConnectionColor = Colors.parseHex(Constants.VALUE_LABEL_COLOR);

            this.labelLayer = new PIXI.Container();
            this.labelLayer.addChild(this.label);
            this.labelLayer.addChild(this.labelConnectionGraphics);
        },

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

        setPosition: function(x, y) {
            this.displayObject.x = x;
            this.displayObject.y = y;

            this.hoverLayer.x = x;
            this.hoverLayer.y = y;

            this.effectsLayer.x = x;
            this.effectsLayer.y = y;

            var center = this.getCenter();
            this.helpLayer.x = center.x;
            this.helpLayer.y = center.y;
        },

        setRotation: function(rotation) {
            this.displayObject.rotation = rotation;
            this.hoverLayer.rotation = rotation;
            this.effectsLayer.rotation = rotation;
        },

        updateLabel: function() {
            this.label.text = this.getLabelText();

            this.updateLabelPosition();
        },

        updateLabelPosition: function() {
            var x;
            var y;
            var center = this.getCenter();
            var bounds = this.displayObject.getBounds();

            if (this.isVertical()) {
                x = center.x + bounds.width / 2;
                y = center.y;
                this.label.anchor.x = -0.1;
                this.label.anchor.y = 0.5;
            }
            else {
                x = center.x;
                y = center.y - bounds.height / 2;
                this.label.anchor.x = 0.5;
                this.label.anchor.y = 1.1;
            }

            this.label.x = x;
            this.label.y = y;

            var graphics = this.labelConnectionGraphics;
            graphics.clear();
            graphics.lineStyle(2, this.labelConnectionColor, 1);
            graphics.moveTo(x, y);
            graphics.dashTo(center.x, center.y, this.labelConnectionDashStyle);
        },

        getLabelText: function() {
            var resistance = this.model.get('resistance');
            return resistance.toFixed(2) + ' Ohms';
        },

        getCenter: function() {
            return this._center.set(this.mvt.modelToView(
                this.model.getDirectionVector()
                    .scale(0.5)
                    .add(this.model.getStartPoint())
            ));
        },

        isVertical: function() {
            var angle = this.model.getAngle();
            while (angle < 0)
                angle += Math.PI * 2;
            while (angle > Math.PI * 2)
                angle -= Math.PI * 2;

            var up = angle > Math.PI / 4 && angle < 3 / 4 * Math.PI;
            var down = angle > 5 / 4 * Math.PI && angle < 7 / 4 * Math.PI;
            return up || down;
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
            $contextMenu.on('click', '.change-resistance-btn', _.bind(this.showResistanceControls, this));
        },

        initChangeVoltageMenuItem: function($contextMenu, moreVoltsOptionEnabled) {
            $contextMenu.on('click', '.change-voltage-btn', _.bind(this.showVoltageControls, this));
            this.moreVoltsOptionEnabled = moreVoltsOptionEnabled;
        },

        initChangeInternalResistanceMenuItem: function($contextMenu) {
            $contextMenu.on('click', '.change-internal-resistance-btn', _.bind(this.showInternalResistanceControls, this));
        },

        initReverseMenuItem: function($contextMenu) {
            $contextMenu.on('click', '.reverse-btn', _.bind(this.reverse, this));
        },

        initChangeFrequencyMenuItem: function($contextMenu) {
            $contextMenu.on('click', '.change-frequency-btn', _.bind(this.showFrequencyControls, this));
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

        showPopoverAtSameLocation: function(originalEvent, title, content) {
            var $anchor = this.$popoverAnchor;
            var x = parseInt($anchor.css('left'));
            var y = parseInt($anchor.css('top'));
            return this.showPopover(x, y, originalEvent, title, content);
        },

        initPropertyControls: function($popover, modelProperty, min, max, rebuild, noPips) {
            var $slider = $popover.find('.property-slider');
            var $text   = $popover.find('.property-text');
            
            $slider.noUiSlider({
                start: this.model.get(modelProperty),
                connect: 'lower',
                range: {
                    'min': min,
                    'max': max
                }
            }, rebuild);

            if (!noPips) {
                $slider.noUiSlider_pips({
                    mode: 'count',
                    values: 5,
                    density: 4
                });    
            }

            $slider.bind('slide', _.bind(function(event){
                var value = parseFloat($(event.target).val());
                this.inputLock(function() {
                    $text.val(value.toFixed(2));
                    this.model.set(modelProperty, value);
                });
            }, this));

            $text.val(this.model.get(modelProperty));
            $text.bind('keyup', _.bind(function(event) {
                var value = parseFloat($(event.target).val());
                var clamped = false;
                if (isNaN(value)) {
                    value = min;
                }
                else {
                    if (value > max) {
                        value = max;
                        clamped = true;
                    }
                    if (value < min) {
                        value = min;
                        clamped = true;
                    }
                }

                this.inputLock(function() {
                    $slider.val(value);
                    this.model.set(modelProperty, value);

                    if (clamped)
                        $text.val(value);
                });
            }, this));
        },

        showResistanceControls: function(event) {
            var $popover = this.showPopoverAtSameLocation(event.originalEvent, 'Resistance', resistanceControlsHtml);

            this.initPropertyControls($popover, 'resistance', Constants.MIN_RESISTANCE, Constants.MAX_RESISTANCE);
        },

        showVoltageControls: function(event) {
            if (this.moreVoltsOptionEnabled) {
                this.maxVoltage = (this.model.getVoltageDrop() <= Constants.MAX_BATTERY_VOLTAGE) ?
                    Constants.MAX_BATTERY_VOLTAGE : 
                    Constants.MAX_HUGE_BATTERY_VOLTAGE;
            }
            else {
                this.maxVoltage = Constants.MAX_BATTERY_VOLTAGE;
            }

            var $popover = this.showPopoverAtSameLocation(event.originalEvent, 'Voltage', voltageControlsHtml);
            this.initVoltageControls($popover);
        },

        initVoltageControls: function($popover, rebuild) {
            var noPips = (this.maxVoltage === Constants.MAX_HUGE_BATTERY_VOLTAGE);
            this.initPropertyControls($popover, 'voltageDrop', 0, this.maxVoltage, rebuild, noPips);

            if (this.moreVoltsOptionEnabled) {
                $popover.find('.more-volts-check').bind('click', _.bind(function(event) {
                    var checked = $(event.target).is(':checked');
                    if (checked)
                        this.maxVoltage = Constants.MAX_HUGE_BATTERY_VOLTAGE;
                    else
                        this.maxVoltage = Constants.MAX_BATTERY_VOLTAGE;

                    $popover.find('.popover-content').html(voltageControlsHtml);
                    this.initVoltageControls($popover, true);
                    $popover.find('.more-volts-check').prop('checked', checked);

                    return false;
                }, this));
            }
            else {
                $popover.find('.more-volts-wrapper').hide();
            }
        },

        showInternalResistanceControls: function(event) {
            var $popover = this.showPopoverAtSameLocation(event.originalEvent, 'Internal Resistance', resistanceControlsHtml);

            this.initPropertyControls($popover, 'internalResistance', Constants.MIN_RESISTANCE, 9);
        },

        showFrequencyControls: function(event) {
            var $popover = this.showPopoverAtSameLocation(event.originalEvent, 'Frequency', frequencyControlsHtml);

            this.initPropertyControls($popover, 'frequency', 0, 2);
        },

        reverse: function() {
            this.hidePopover();
            this.model.reverse();
        },

        showReadoutChanged: function(model, showReadout) {
            this.labelLayer.visible = showReadout;
        }

    });

    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(ComponentView);

    return ComponentView;
});