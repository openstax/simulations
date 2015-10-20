define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * PickupCoilView is the graphical representation of a pickup coil, with
     *   indicators (lightbulb and voltmeter) for displaying the effect of
     *   electromagnetic induction.
     */
    var PickupCoilView = PixiView.extend({

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
         * Initializes the new PickupCoilView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

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
            this.foreground = new PIXI.Container();
            this.background = new PIXI.Container();

            this.displayObject.addChild(this.background);
            this.displayObject.addChild(this.foreground);

            this.initCoilView();

            this.updateMVT(this.mvt);
        },

        initCoilView: function() {
            this.coilView = new CoilView();

            this.background.addChild(this.coilView.backgroundLayer);
            this.foreground.addChild(this.coilView.foregroundLayer);
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
            if (!this.simulation.get('paused'))
                return;

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

    });


    return PickupCoilView;
});