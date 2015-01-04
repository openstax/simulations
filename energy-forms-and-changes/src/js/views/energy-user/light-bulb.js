define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var EnergyUserView = require('views/energy-user');

    var LightBulb = EnergyUserView.extend({

        /**
         *
         */
        initialize: function(options) {
            EnergyUserView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:litProportion', this.updateLitProportion);
        },

        initGraphics: function() {
            EnergyUserView.prototype.initGraphics.apply(this);

            this.backLayer = new PIXI.DisplayObjectContainer();
            this.frontLayer = new PIXI.DisplayObjectContainer();

            this.initLightRays();
            this.initImages();

            this.drawDebugOrigin();

            // Make sure it's lit the right amount to start
            this.updateLitProportion(this.model, this.model.get('litProportion'));
        },

        initLightRays: function() {
            var rays = new PIXI.DisplayObjectContainer();
            this.lightRays = rays;



            this.backLayer.addChild(rays);
        },

        /**
         * This should be overriden by child classes
         */
        initImages: function() {
            this.litBulb = new PIXI.DisplayObject();
        },

        updateLitProportion: function(model, litProportion) {
            this.litBulb.alpha = litProportion;
            this.lightRays.alpha = litProportion;
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.backLayer.x = this.frontLayer.x = viewPoint.x;
            this.backLayer.y = this.frontLayer.y = viewPoint.y;
        },

        showEnergyChunks: function() {
            EnergyUserView.prototype.showEnergyChunks.apply(this);
            this.lightRays.visible = false;
        },

        hideEnergyChunks: function() {
            EnergyUserView.prototype.hideEnergyChunks.apply(this);
            this.lightRays.visible = true;
        },

    });

    return LightBulb;
});