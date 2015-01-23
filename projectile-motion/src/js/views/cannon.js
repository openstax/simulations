define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView = require('common/pixi/view');
    var Colors   = require('common/colors/colors');

    var Assets = require('assets');

    var Constants = require('constants');
    var RADIANS_TO_DEGREES = 180 / Math.PI;
    var PEDESTAL_TOP_COLOR  = Colors.parseHex(Constants.CannonView.PEDESTAL_TOP_COLOR);
    var PEDESTAL_SIDE_COLOR = Colors.parseHex(Constants.CannonView.PEDESTAL_SIDE_COLOR);

    /**
     * A view that represents a cannon model
     */
    var CannonView = PixiView.extend({

        events: {
            'touchstart      .cannon': 'dragCannonStart',
            'mousedown       .cannon': 'dragCannonStart',
            'touchmove       .cannon': 'dragCannon',
            'mousemove       .cannon': 'dragCannon',
            'touchend        .cannon': 'dragCannonEnd',
            'mouseup         .cannon': 'dragCannonEnd',
            'touchendoutside .cannon': 'dragCannonEnd',
            'mouseupoutside  .cannon': 'dragCannonEnd',

            'touchstart      .pedestal': 'dragPedestalStart',
            'mousedown       .pedestal': 'dragPedestalStart',
            'touchmove       .pedestal': 'dragPedestal',
            'mousemove       .pedestal': 'dragPedestal',
            'touchend        .pedestal': 'dragPedestalEnd',
            'mouseup         .pedestal': 'dragPedestalEnd',
            'touchendoutside .pedestal': 'dragPedestalEnd',
            'mouseupoutside  .pedestal': 'dragPedestalEnd',
        },

        /**
         *
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            this._dragOffset = new PIXI.Point();

            // Listen to angle because the user can change that from the control panel,
            //   but don't listen to x or y because those will only ever be changed
            //   through this view.
            this.listenTo(this.model, 'change:angle', this.updateAngle);
            this.updateAngle(this.model, this.model.get('angle'));
        },

        initGraphics: function() {
            this.spritesLayer = new PIXI.DisplayObjectContainer();

            // Cannon
            var cannon = Assets.createSprite(Assets.Images.CANNON);
            cannon.anchor.x = 0.34;
            cannon.anchor.y = 0.5;
            cannon.buttonMode = true;
            this.spritesLayer.addChild(cannon);
            this.cannon = cannon;

            // Carriage
            var carriage = Assets.createSprite(Assets.Images.CANNON_CARRIAGE);
            carriage.anchor.x = 0.5;
            carriage.anchor.y = 1;
            carriage.y = 100;
            carriage.x = -26;
            
            this.spritesLayer.addChild(carriage);

            // Pedestal
            var pedestal = new PIXI.Graphics();
            pedestal.buttonMode = true;
            this.displayObject.addChild(pedestal);
            this.pedestal = pedestal;

            var pedestalSide = new PIXI.Graphics();
            this.displayObject.addChild(pedestalSide);
            this.pedestalSide = pedestalSide;

            // Grass overlay
            // var grass = Assets.createSprite(Assets.Images.GRASS_BLADES);
            // grass.anchor.x = 0.5;
            // grass.anchor.y = 1;
            // grass.y = 106;
            // this.spritesLayer.addChild(grass);

            // Axes graphics
            this.axes = new PIXI.Graphics();
            this.displayObject.addChild(this.axes);

            this.displayObject.addChild(this.spritesLayer);

            this.updateMVT(this.mvt);
        },

        drawPedestal: function() {
            this.pedestal.clear();
            this.pedestalSide.clear();

            var pedestalHeight = this.model.get('y') + this.model.get('heightOffGround') + Constants.GROUND_Y;
            var pixelHeight  = Math.abs(this.mvt.modelToViewDeltaY(pedestalHeight));
            var pixelWidth   = this.mvt.modelToViewDeltaX(CannonView.PEDESTAL_WIDTH);
            var pixelYOffset = Math.abs(this.mvt.modelToViewDeltaY(this.model.get('heightOffGround')));
            var pedestal = this.pedestal;
            var pedestalSide = this.pedestalSide;

            // Set a minimum height
            if (pixelHeight < 2)
                pixelHeight = 2;

            var horizontalRadius = pixelWidth / 2;
            var verticalRadius = (pixelWidth * CannonView.PEDESTAL_PERSPECTIVE_MODIFIER) / 2;

            // Draw grass top
            pedestal.beginFill(PEDESTAL_TOP_COLOR, 1);
            pedestal.drawEllipse(0, pixelYOffset, horizontalRadius, verticalRadius);
            pedestal.endFill();

            pedestalSide.beginFill(PEDESTAL_SIDE_COLOR, 1);
            pedestalSide.moveTo(-horizontalRadius, pixelYOffset)
            pedestalSide.bezierCurveTo(-horizontalRadius, pixelYOffset + verticalRadius, horizontalRadius, pixelYOffset + verticalRadius, horizontalRadius, pixelYOffset);
            pedestalSide.lineTo(horizontalRadius, pixelYOffset + pixelHeight);
            pedestalSide.bezierCurveTo(horizontalRadius, pixelYOffset + pixelHeight + verticalRadius, -horizontalRadius, pixelYOffset + pixelHeight + verticalRadius, -horizontalRadius, pixelYOffset + pixelHeight)
            pedestalSide.lineTo(-horizontalRadius, pixelYOffset);
            pedestalSide.endFill();
        },

        drawAxes: function() {
            var width  = 2000; // Arbitrarily large stage sizes. displayObject.stage.width wasn't giving correct values
            var height = 1000;

            var global = this.displayObject.position;
            var left   = Math.ceil(0 - global.x);
            var right  = Math.ceil(width - global.x);
            var top    = Math.ceil(0 - global.y);
            var bottom = Math.ceil(height - global.y);
            
            this.axes.clear();
            this.axes.lineStyle(CannonView.AXIS_LINE_WIDTH, CannonView.AXIS_LINE_COLOR, CannonView.AXIS_LINE_ALPHA);
            this.axes.moveTo(left, 0);
            this.axes.lineTo(right, 0);
            this.axes.moveTo(0, top);
            this.axes.lineTo(0, bottom);
        },

        dragCannonStart: function(data) {
            this.draggingCannon = true;
        },

        dragCannon: function(data) {
            if (this.draggingCannon) {
                var x = data.global.x - this.displayObject.x;
                var y = data.global.y - this.displayObject.y;
                
                var angle = Math.atan2(y, x);
                var degrees = -angle * RADIANS_TO_DEGREES;
                // Catch the case where we go into negatives at the 180deg mark
                if (degrees >= -180 && degrees < Constants.Cannon.MIN_ANGLE && this.model.get('angle') > 0)
                    degrees = 360 + degrees;

                // Make sure it's within bounds
                if (degrees < Constants.Cannon.MIN_ANGLE)
                    degrees = Constants.Cannon.MIN_ANGLE;
                if (degrees > Constants.Cannon.MAX_ANGLE)
                    degrees = Constants.Cannon.MAX_ANGLE;
                this.model.set('angle', degrees);
            }
        },

        dragCannonEnd: function(data) {
            this.draggingCannon = false;
        },

        dragPedestalStart: function(data) {
            this.previousPedestalY = data.global.y;
            this.draggingPedestal = true;
        },

        dragPedestal: function(data) {
            if (this.draggingPedestal) {
                var dy = data.global.y - this.previousPedestalY;
                this.previousPedestalY = data.global.y;

                dy = this.mvt.viewToModelDeltaY(dy);

                var y = this.model.get('y') + dy;
                if (y < 0)
                    y = 0;
                this.model.set('y', y);

                this.updatePosition();
                this.drawPedestal();
                this.drawAxes();
            }
        },

        dragPedestalEnd: function(data) {
            this.draggingPedestal = false;
        },

        updateAngle: function(cannon, angleInDegrees) {
            this.cannon.rotation = this.model.firingAngle();
        },

        updatePosition: function() {
            this.displayObject.x = this.mvt.modelToViewX(this.model.get('x'));
            this.displayObject.y = this.mvt.modelToViewY(this.model.get('y'));
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            // Note: Maybe we don't need to ever update at all. Could we just scale the whole scene's displayObject?
            var targetCannonWidth = mvt.modelToViewDeltaX(this.model.get('width')); // in pixels
            var scale = targetCannonWidth / this.cannon.width;

            this.spritesLayer.scale.x = this.spritesLayer.scale.y = scale;

            this.updatePosition();
            this.drawPedestal();
            this.drawAxes();
        }

    }, Constants.CannonView);

    return CannonView;
});