define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var defineInputUpdateLocks = require('common/locks/define-locks');

    var HybridView         = require('common/v3/pixi/view/hybrid');
    var DraggableArrowView = require('common/v3/pixi/view/arrow-draggable');
    var Colors             = require('common/colors/colors');

    var Constants = require('constants');
    var PANEL_COLOR      = Colors.parseHex(Constants.ExternalFieldControlView.PANEL_COLOR);
    var ARROW_AREA_COLOR = Colors.parseHex(Constants.ExternalFieldControlView.ARROW_AREA_COLOR);
    // var ARROW_COLOR      = Colors.parseHex(Constants.ExternalFieldControlView.ARROW_COLOR);

    /**
     * A tool that allows the user to change the direction and
     *   magnitude of the external field by manipulating an arrow.
     *
     * Positioning is relative to its lower right corner.
     */
    var ExternalFieldControlView = HybridView.extend({

        tagName: 'div',
        className: 'external-field-control-view-header control-panel',

        events: {
            'touchstart      .controlArea': 'dragStart',
            'mousedown       .controlArea': 'dragStart',
            'touchend        .controlArea': 'dragEnd',
            'mouseup         .controlArea': 'dragEnd',
            'touchendoutside .controlArea': 'dragEnd',
            'mouseupoutside  .controlArea': 'dragEnd'
        },

        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this._dragOffset = new PIXI.Point();

            this.initGraphics();

            this.$el.html('<h2>External Field</h2>');
        },

        initGraphics: function() {
            this.initPanel();
            this.initArrows();
            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            var panel = new PIXI.Container();
            
            var background = new PIXI.Graphics();
            var controlArea = new PIXI.Graphics();
            panel.addChild(background);
            panel.addChild(controlArea);

            this.panel = panel;
            this.controlArea = controlArea;
            this.controlArea.buttonMode = true;

            var pw = ExternalFieldControlView.PANEL_WIDTH;
            var ph = ExternalFieldControlView.PANEL_HEIGHT;
            var aw = ExternalFieldControlView.AREA_WIDTH;
            var ah = ExternalFieldControlView.AREA_HEIGHT;

            background.clear();
            background.beginFill(PANEL_COLOR, ExternalFieldControlView.PANEL_ALPHA);
            background.drawRect(-pw, -ph, pw, ph);
            background.endFill();

            controlArea.clear();
            controlArea.x = -ExternalFieldControlView.AREA_WIDTH  - ExternalFieldControlView.PANEL_PADDING;
            controlArea.y = -ExternalFieldControlView.AREA_HEIGHT - ExternalFieldControlView.PANEL_PADDING;
            controlArea.beginFill(ARROW_AREA_COLOR, ExternalFieldControlView.ARROW_AREA_ALPHA);
            controlArea.drawRect(0, 0, aw, ah);
            controlArea.endFill();
            
            this.areaMask = new PIXI.Graphics();
            this.areaMask.x = -ExternalFieldControlView.AREA_WIDTH  - ExternalFieldControlView.PANEL_PADDING;
            this.areaMask.y = -ExternalFieldControlView.AREA_HEIGHT - ExternalFieldControlView.PANEL_PADDING;
            this.areaMask.beginFill(0, 1);
            this.areaMask.drawRect(0, 0, aw, ah);
            this.areaMask.endFill();

            this.displayObject.addChild(panel);
            this.displayObject.addChild(this.areaMask);
        },

        initArrows: function() {
            var arrowModel = new DraggableArrowView.ArrowViewModel({
                originX: 0,
                originY: 0,
                targetX: 0,
                targetY: 0,
                minLength: null
            });

            var arrowView = new DraggableArrowView({
                model: arrowModel,
                fillColor: ExternalFieldControlView.ARROW_COLOR,
                bodyDraggingEnabled: false,
                useDotWhenSmall: true
            });
            arrowView.displayObject.mask = this.areaMask;
            this.controlArea.addChild(arrowView.displayObject);

            this.arrowModel = arrowModel;
            this.arrowView = arrowView;

            this.repositionArrows();

            // Listen for position changes
            this.listenTo(arrowView, 'drag-head-start', this.arrowDragStart);
            this.listenTo(arrowView, 'drag-head-end',   this.arrowDragEnd);

            this.listenTo(arrowModel, 'change:targetX change:targetY', this.fieldChanged);
        },

        repositionArrows: function(maintainTargetPosition) {
            this.updateLock(function() {
                // Make sure origin is at center
                this.arrowModel.set('originX', ExternalFieldControlView.AREA_WIDTH  / 2);
                this.arrowModel.set('originY', ExternalFieldControlView.AREA_HEIGHT / 2);
            });

            this.updateArrow();
        },

        updateArrow: function() {
            if (this.dragging)
                return;

            this.updateLock(function() {
                var x = this.mvt.modelToViewDeltaX(this.model.field.x);
                var y = this.mvt.modelToViewDeltaY(this.model.field.y);
                this.arrowModel.set('targetX', this.arrowModel.get('originX') + x);
                this.arrowModel.set('targetY', this.arrowModel.get('originY') + y);
            });
        },

        reset: function() {
            
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updateArrow();
        },

        dragStart: function(event) {
            if (!this.arrowView.draggingHead) {
                var localPoint = event.data.getLocalPosition(this.controlArea, this._dragOffset);

                this.arrowModel.set('targetX', localPoint.x);
                this.arrowModel.set('targetY', localPoint.y);

                this.arrowView.dragHeadStart(event);
            }
        },

        dragEnd: function(event) {
            this.arrowView.dragHeadEnd(event);
        },

        arrowDragStart: function() {
            this.dragging = true;
            //this.simulation.startSampling();
        },

        arrowDragEnd: function() {
            //this.simulation.stopSampling();
            this.dragging = false;
        },

        fieldChanged: function(arrowModel) {
            this.inputLock(function() {
                var dx = arrowModel.get('targetX') - arrowModel.get('originX');
                var dy = arrowModel.get('targetY') - arrowModel.get('originY');

                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.model.field.add(mdx, mdy);
            });
        }

    }, Constants.ExternalFieldControlView);


    // Give it input/update locks
    defineInputUpdateLocks(ExternalFieldControlView);


    return ExternalFieldControlView;
});