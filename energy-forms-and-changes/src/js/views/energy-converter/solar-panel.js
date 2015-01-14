define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var EnergyConverterView = require('views/energy-converter');

    var Assets = require('assets');

    var Constants = require('constants');
    var SolarPanel = Constants.SolarPanel;

    var SolarPanelView = EnergyConverterView.extend({

        /**
         *
         */
        initialize: function(options) {
            EnergyConverterView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            EnergyConverterView.prototype.initGraphics.apply(this);

            this.backLayer = new PIXI.DisplayObjectContainer();
            this.frontLayer = new PIXI.DisplayObjectContainer();

            var solarPanel = this.createSpriteWithOffset(Assets.Images.SOLAR_PANEL,        SolarPanel.SOLAR_PANEL_OFFSET, 0.5); // need to offset with an anchor in the middle because the width is going to change
            var post       = this.createSpriteWithOffset(Assets.Images.SOLAR_PANEL_POST_2, SolarPanel.POST_OFFSET);
            var curvedWire = this.createSpriteWithOffset(Assets.Images.WIRE_BLACK_LEFT,    SolarPanel.WIRE_OFFSET);
            var converter  = this.createSpriteWithOffset(Assets.Images.SOLAR_PANEL_GEN,    SolarPanel.CONVERTER_OFFSET);
            var connector  = this.createSpriteWithOffset(Assets.Images.CONNECTOR,          SolarPanel.CONNECTOR_OFFSET);

            // Scaling
            solarPanel.scale.x = solarPanel.scale.y = this.mvt.modelToViewDeltaX(SolarPanel.PANEL_IMAGE_WIDTH) / solarPanel.width;

            // Need to fudge the position a little...
            curvedWire.x += 2;

            this.backLayer.addChild(curvedWire);
            this.backLayer.addChild(post);
            this.backLayer.addChild(solarPanel);

            // [energy chunk layer]

            this.frontLayer.addChild(converter);
            this.frontLayer.addChild(connector);
            
            //this.drawDebugOrigin(this.frontLayer);
        },

        updatePosition: function(model, position) {
            var viewPoint = this.mvt.modelToView(position);
            this.backLayer.x = this.frontLayer.x = viewPoint.x;
            this.backLayer.y = this.frontLayer.y = viewPoint.y;
        }

    });

    return SolarPanelView;
});