define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var Constants = require('constants');
    var PANEL_COLOR = Colors.parseHex(Constants.FieldMeterView.PANEL_COLOR);

    /**
     * 
     */
    var FieldMeterView = PixiView.extend({

        width:  120,
        height: 100,
        ringRadius: 20,
        ringThickness: 8,

        events: {
            'touchstart      .displayObject': 'dragStart',
            'mousedown       .displayObject': 'dragStart',
            'touchmove       .displayObject': 'drag',
            'mousemove       .displayObject': 'drag',
            'touchend        .displayObject': 'dragEnd',
            'mouseup         .displayObject': 'dragEnd',
            'touchendoutside .displayObject': 'dragEnd',
            'mouseupoutside  .displayObject': 'dragEnd'
        },

        /**
         * Initializes the new FieldMeterView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.magnetModel = options.magnetModel;

            this._dragOffset   = new PIXI.Point();
            this._dragLocation = new PIXI.Point();
            this._vec = new Vector2();

            this.initGraphics();

            this.listenTo(this.model, 'change:position',  this.updatePosition);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.displayObject.buttonMode = true;

            this.initPanel();

            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            var w = this.width;
            var h = this.height;
            var r = this.ringRadius;
            var t = this.ringThickness;
            var y = r - t / 2;

            var body = new PIXI.Graphics();
            body.beginFill(PANEL_COLOR, 1);
            body.drawRect(-w / 2, y, w, h);
            body.endFill();
            body.alpha = 0.7;

            var ring = new PIXI.Graphics();
            ring.lineStyle(t, PANEL_COLOR, 1);
            ring.arc(0, 0, r, 0, Math.PI * 2);
            ring.alpha = 0.7;
            ring.mask = new PIXI.Graphics();
            ring.mask.beginFill(0, 1);
            ring.mask.drawRect(-w / 2, -r - t, w, y + r + t);
            ring.mask.endFill();

            this.displayObject.addChild(body);
            this.displayObject.addChild(ring);
            this.displayObject.addChild(ring.mask);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updatePosition(this.model, this.model.get('position'));
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.displayObject.x = viewPosition.x;
            this.displayObject.y = viewPosition.y;
        },

        dragStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.displayObject, this._dragOffset);
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var local = event.data.getLocalPosition(this.displayObject.parent, this._dragLocation);
                var x = local.x - this.dragOffset.x;
                var y = local.y - this.dragOffset.y;
                
                var mx = this.mvt.viewToModelX(x);
                var my = this.mvt.viewToModelY(y);

                this.model.setPosition(mx, my);
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        }

    }, Constants.FieldMeterView);


    return FieldMeterView;
});