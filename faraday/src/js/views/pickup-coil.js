define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Vector2  = require('common/math/vector2');

    var CoilView = require('views/coil');

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
            this.foregroundLayer = new PIXI.Container();
            this.backgroundLayer = new PIXI.Container();

            this.initCoilView();

            this.updateMVT(this.mvt);
        },

        initCoilView: function() {
            this.coilView = new CoilView({
                mvt: this.mvt,
                model: this.model,
                simulation: this.simulation
            });

            this.backgroundLayer.addChild(this.coilView.backgroundLayer);
            this.foregroundLayer.addChild(this.coilView.foregroundLayer);
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
            this.backgroundLayer.x = viewPosition.x;
            this.backgroundLayer.y = viewPosition.y;
            this.foregroundLayer.x = viewPosition.x;
            this.foregroundLayer.y = viewPosition.y;
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