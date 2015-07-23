define(function(require) {

    'use strict';

    var Backbone = require('backbone');
    var PIXI     = require('pixi');
    require('common/pixi/extensions');

    var PixiView = require('common/pixi/view');

    var Constants = require('constants');

    var Assets = require('assets');

    var VoltmeterView = PixiView.extend({

        events: {
            'touchstart      .voltmeterContainer': 'dragStart',
            'mousedown       .voltmeterContainer': 'dragStart',
            'touchmove       .voltmeterContainer': 'drag',
            'mousemove       .voltmeterContainer': 'drag',
            'touchend        .voltmeterContainer': 'dragEnd',
            'mouseup         .voltmeterContainer': 'dragEnd',
            'touchendoutside .voltmeterContainer': 'dragEnd',
            'mouseupoutside  .voltmeterContainer': 'dragEnd'
        },

        initialize: function(options) {
            options = _.extend({

            }, options);

            this.mvt = options.mvt;
            this.lastPosition = new PIXI.Point();

            this.initGraphics();
            this.updateMVT(this.mvt);
        },

        initGraphics: function() {
            this.initVoltmeterBrick();
            this.initProbes();
        },

        initVoltmeterBrick: function() {
            this.voltmeterSprite = Assets.createSprite(Assets.Images.VOLTMETER);

            this.voltmeterContainer = new PIXI.DisplayObjectContainer();
            this.voltmeterContainer.buttonMode = true;
            this.voltmeterContainer.addChild(this.voltmeterSprite);

            this.displayObject.addChild(this.voltmeterContainer);
        },

        initProbes: function() {
            this.redWire = new PIXI.Graphics();
            this.blackWire = new PIXI.Graphics();

            this.displayObject.addChild(this.redWire);
            this.displayObject.addChild(this.blackWire);
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            var targetSpriteHeight = this.mvt.modelToViewDeltaY(VoltmeterView.HEIGHT); // in pixels
            var scale = targetSpriteHeight / this.voltmeterSprite.texture.height;

            this.voltmeterContainer.scale.x = scale;
            this.voltmeterContainer.scale.y = scale;


        },

        dragStart: function(data) {
            this.lastPosition.x = data.global.x;
            this.lastPosition.y = data.global.y;

            this.dragging = true;
        },

        drag: function(data) {
            if (this.dragging) {
                var dx = data.global.x - this.lastPosition.x;
                var dy = data.global.y - this.lastPosition.y;

                this.voltmeterContainer.x += dx;
                this.voltmeterContainer.y += dy;

                this.lastPosition.x = data.global.x;
                this.lastPosition.y = data.global.y;
            }
        },

        dragEnd: function(data) {
            this.dragging = false;
        },

        show: function() {
            this.displayObject.visible = true;
        },

        hide: function() {
            this.displayObject.visible = false;
        },

        setPosition: function(x, y) {
            this.voltmeterContainer.x = x;
            this.voltmeterContainer.y = y;
        },

        setRedProbePosition: function(x, y) {

        },

        setBlackProbePosition: function(x, y) {

        }

    }, Constants.VoltmeterView);

    return VoltmeterView;
});
