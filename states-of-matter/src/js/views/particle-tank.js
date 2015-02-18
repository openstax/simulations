define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');
    var Vector2  = require('common/math/vector2');
    var range    = require('common/math/range');

    var Assets = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents the particle tank
     */
    var ParticleTankView = PixiView.extend({

        initialize: function(options) {
            this.simulation = options.simulation;

            this.initGraphics();

            this.listenTo(this.simulation, 'change:particleContainerHeight', this.updateLidPosition);
        },

        initGraphics: function() {
            this.initTank();
            this.initLid();

            this._leftConnectorPosition  = new Vector2();
            this._rightConnectorPosition = new Vector2();
        },

        initTank: function() {
            this.tank = Assets.createSprite(Assets.Images.TANK);
            this.tank.anchor.x = 0.5;
            this.tank.anchor.y = 1;

            this.displayObject.addChild(this.tank);
        },

        initLid: function() {
            this.lidYRange = range({ min: -20, max: -20 - 255  });

            this.lid = Assets.createSprite(Assets.Images.TANK_LID);
            this.lid.anchor.x = 0.5;
            this.lid.anchor.y = 1;
            this.lid.y = this.lidYRange.max;

            this.displayObject.addChild(this.lid);
        },

        updateLidPosition: function() {
            var relativeHeight = this.simulation.get('particleContainerHeight') / Constants.CONTAINER_BOUNDS.height;
            
            this.lid.y = this.lidYRange.lerp(relativeHeight);
        },

        getLeftConnectorPosition: function() {
            return this._leftConnectorPosition
                .set(this.displayObject.x, this.displayObject.y)
                .add(-this.displayObject.width / 2, -37);
        },

        getRightConnectorPosition: function() {
            return this._rightConnectorPosition
                .set(this.displayObject.x, this.displayObject.y)
                .add(this.displayObject.width / 2, -37);
        }

    });

    return ParticleTankView;
});