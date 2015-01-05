define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var Vector2 = require('common/math/vector2');

    var EnergyUserView = require('views/energy-user');
    var LightRaySourceView = require('views/light-ray-source');

    var LightBulb = EnergyUserView.extend({

        initialize: function(options) {
            options = _.extend({
                lightRayColor: '#fff',
                lightRayCenter: new Vector2(),
                lightRayInnerRadius: 30
            }, options);

            this.lightRayColor = options.lightRayColor;
            this.lightRayCenter = options.lightRayCenter;
            this.lightRayInnerRadius = options.lightRayInnerRadius;

            EnergyUserView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:litProportion', this.updateLitProportion);
        },

        initGraphics: function() {
            EnergyUserView.prototype.initGraphics.apply(this);

            this.backLayer = new PIXI.DisplayObjectContainer();
            this.frontLayer = new PIXI.DisplayObjectContainer();

            this.initImages();
            this.initLightRays();

            this.drawDebugOrigin();

            // Make sure it's lit the right amount to start
            this.updateLitProportion(this.model, this.model.get('litProportion'));
        },

        initLightRays: function() {
            var raySource = new LightRaySourceView({
                center: this.lightRayCenter,           // Origin of rays in pixels
                innerRadius: this.lightRayInnerRadius, // Distance from center to start the rays
                outerRadius: 400,                      // Furthest reach of the rays (making them technically segments)
                numRays: 20,                           // The number of rays if none were clipped
                clippingWedgeAngle: Math.PI / 4,       // Angle of area that won't emit rays
                color: this.lightRayColor              // Ray color
            });
            this.lightRays = raySource.displayObject;

            this.backLayer.addChild(this.lightRays);
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