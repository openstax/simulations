define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');
    
    var PixiView       = require('common/v3/pixi/view');
    var Colors         = require('common/colors/colors');

    var Constants = require('constants');

    var Assets = require('assets');

    /**
     * A view that represents an atom
     */
    var VelocitySensorView = PixiView.extend({

        events: {
            'touchstart      .panel': 'dragStart',
            'mousedown       .panel': 'dragStart',
            'touchmove       .panel': 'drag',
            'mousemove       .panel': 'drag',
            'touchend        .panel': 'dragEnd',
            'mouseup         .panel': 'dragEnd',
            'touchendoutside .panel': 'dragEnd',
            'mouseupoutside  .panel': 'dragEnd'
        },

        /**
         * Initializes the new VelocitySensorView.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.simulation = options.simulation;

            this.arrowColor = Colors.parseHex('#000');

            // Cached objects
            this._dragOffset = new PIXI.Point();

            this.initGraphics();

            this.listenTo(this.model, 'change:position',   this.updatePosition);
            this.listenTo(this.model, 'change:enabled',    this.enabledChanged);
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.initPanel();

            this.updateMVT(this.mvt);
        },

        initPanel: function() {
            this.panel = Assets.createSprite(Assets.Images.VELOCITY_SENSOR_BODY);
            this.panel.anchor.x = 1 / 2;
            this.panel.anchor.y = (94 / 115);
            this.panel.buttonMode = true;

            this.displayObject.addChild(this.panel);
        },

        updatePosition: function(model, position) {
            var viewPosition = this.mvt.modelToView(position);
            this.panel.x = viewPosition.x;
            this.panel.y = viewPosition.y;
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.updatePosition(this.model, this.model.get('position'));
        },

        dragStart: function(event) {
            this.dragOffset = event.data.getLocalPosition(this.panel, this._dragOffset);
            this.dragging = true;
        },

        drag: function(event) {
            if (this.dragging) {
                var dx = event.data.global.x - this.panel.x - this.dragOffset.x;
                var dy = event.data.global.y - this.panel.y - this.dragOffset.y;
                
                var mdx = this.mvt.viewToModelDeltaX(dx);
                var mdy = this.mvt.viewToModelDeltaY(dy);

                this.model.translate(mdx, mdy);
            }
        },

        dragEnd: function(event) {
            this.dragging = false;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        },

        enabledChanged: function(model, enabled) {
            if (enabled)
                this.show();
            else
                this.hide();
        }

    });


    return VelocitySensorView;
});