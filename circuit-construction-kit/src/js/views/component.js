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
    var voltageControlsHtml    = require('text!templates/voltage-controls.html');
    var frequencyControlsHtml  = require('text!templates/frequency-controls.html');

    require('less!styles/component-controls');

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
            this._center = new Vector2();

            Draggable.prototype.initialize.apply(this, arguments);

            this.listenTo(this.model, 'start-junction-changed end-junction-changed', this.junctionsChanged);
        },

        initGraphics: function() {
            this.initComponentGraphics();
            this.initHoverGraphics();
            this.initValuesLabel();

            Draggable.prototype.initGraphics.apply(this, arguments);
        },

        initComponentGraphics: function() {},

        initHoverGraphics: function() {},

        initValuesLabel: function() {
            var label = new PIXI.Text('Test', {
                font: '14px Helvetica Neue',
                fill: '#000'
            });
            label.resolution = this.getResolution();
            label.anchor.x = 0.5;
            label.anchor.y = 0.5;

            this.label = label;

            this.labelLayer = new PIXI.Container();
            this.labelLayer.addChild(this.label);
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
        },

        setRotation: function(rotation) {
            this.displayObject.rotation = rotation;
            this.hoverLayer.rotation = rotation;
        },

        updateLabel: function() {
            this.label.text = this.getLabelText();

            this.positionLabel();

            // htmlNode.setHtml( toHTML( getText() ) );
            // Shape shape = branch.getShape();
            // Point2D pt = new Point2D.Double( shape.getBounds2D().getCenterX() - htmlNode.getFullBounds().getWidth() / 2,
            //                                  shape.getBounds2D().getY() - htmlNode.getFullBounds().getHeight() );
            // if ( isVertical() ) {
            //     pt = new Point2D.Double( shape.getBounds2D().getMaxX(), shape.getBounds2D().getCenterY() - htmlNode.getFullBounds().getHeight() / 2 );
            // }
            // htmlNode.setOffset( pt );
            // Point2D ctr = new Point2D.Double( shape.getBounds2D().getCenterX(), shape.getBounds2D().getCenterY() );
            // double distToCenter = pt.distance( ctr );
            // linePNode.setVisible( distToCenter > 1.0 );
            // Point2D textSource = new Point2D.Double( htmlNode.getFullBounds().getCenterX(), htmlNode.getFullBounds().getMaxY() );
            // if ( isVertical() ) {
            //     textSource = new Point2D.Double( htmlNode.getFullBounds().getX(), htmlNode.getFullBounds().getCenterY() );
            // }
            // linePNode.setPathTo( new Line2D.Double( textSource, ctr ) );


            
        },

        positionLabel: function() {
            var x;
            var y;
            var center = this._center.set(this.mvt.modelToView(
                this.model.getDirectionVector()
                    .scale(0.5)
                    .add(this.model.getStartPoint())
            ));
            var bounds = this.displayObject.getBounds();

            if (this.isVertical()) {
                x = center.x + bounds.width / 2 + this.label.width / 2 + 4;
                y = center.y;
            }
            else {
                x = center.x;
                y = center.y - bounds.height / 2 - this.label.height / 2 - 4;
            }

            this.label.x = x;
            this.label.y = y;
        },

        getLabelText: function() {
            var resistance = this.model.get('resistance');
            return resistance.toFixed(2) + ' Ohms';
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
                    value = min
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
                this.maxVoltage = (this.model.get('voltageDrop') <= Constants.MAX_BATTERY_VOLTAGE) ?
                    Constants.MAX_BATTERY_VOLTAGE : 
                    Constants.MAX_HUGE_BATTERY_VOLTAGE
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
        }

    });

    // Add input/update locking functionality to the prototype
    defineInputUpdateLocks(ComponentView);

    return ComponentView;
});