define(function(require) {

    'use strict';

    var _ = require('underscore');
    var PIXI = require('pixi');

    var EnergyConverterView = require('views/energy-converter');

    var Assets = require('assets');

    var Constants = require('constants');
    var ElectricalGenerator = Constants.ElectricalGenerator;

    var ElectricalGeneratorView = EnergyConverterView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                
            }, options);

            EnergyConverterView.prototype.initialize.apply(this, [options]);

            this.listenTo(this.model, 'change:wheelRotationalAngle', this.updateWheelRotation);
        },

        initGraphics: function() {
            EnergyConverterView.prototype.initGraphics.apply(this);

            this.backLayer = new PIXI.DisplayObjectContainer();
            this.frontLayer = new PIXI.DisplayObjectContainer();

            this.createEnergyChunkLayer('electricalEnergyChunkLayer', this.model.electricalEnergyChunks);
            this.createEnergyChunkLayer('hiddenEnergyChunkLayer',     this.model.hiddenEnergyChunks);

            var curvedWire = this.createSpriteWithOffset(Assets.Images.WIRE_BLACK_LEFT,         ElectricalGenerator.WIRE_OFFSET);
            var housing    = this.createSpriteWithOffset(Assets.Images.GENERATOR);
            var connector  = this.createSpriteWithOffset(Assets.Images.CONNECTOR,               ElectricalGenerator.CONNECTOR_OFFSET);
            var spokes     = this.createSpriteWithOffset(Assets.Images.GENERATOR_WHEEL_SPOKES,  ElectricalGenerator.WHEEL_CENTER_OFFSET, 0.5);
            var paddles    = this.createSpriteWithOffset(Assets.Images.GENERATOR_WHEEL_PADDLES, ElectricalGenerator.WHEEL_CENTER_OFFSET, 0.5);
            var hub        = this.createSpriteWithOffset(Assets.Images.GENERATOR_WHEEL_HUB_2,   ElectricalGenerator.WHEEL_CENTER_OFFSET, 0.5);

            // Need to fudge the position a little...
            curvedWire.x += 2;

            this.backLayer.addChild(curvedWire);
            this.frontLayer.addChild(housing);
            this.frontLayer.addChild(connector);
            this.frontLayer.addChild(spokes);
            this.frontLayer.addChild(paddles);
            this.frontLayer.addChild(hub);

            this.spokes = spokes;
            this.paddles = paddles;
            
            //this.drawDebugOrigin(this.frontLayer);
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.backLayer.x = this.frontLayer.x = viewPoint.x;
            this.backLayer.y = this.frontLayer.y = viewPoint.y;
        },

        updateWheelRotation: function(model, rotation) {
            this.spokes.rotation  = -rotation;
            this.paddles.rotation = -rotation;
        }

    });

    return ElectricalGeneratorView;
});