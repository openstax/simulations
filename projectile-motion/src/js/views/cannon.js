define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    require('common/pixi/extensions');
    
    var PixiView = require('common/pixi/view');

    var Assets = require('assets');

    var Constants = require('constants');
    var RADIANS_TO_DEGREES = 180 / Math.PI;

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
            // Cannon
            var cannon = Assets.createSprite(Assets.Images.CANNON);
            cannon.anchor.x = 0.34;
            cannon.anchor.y = 0.5;
            cannon.buttonMode = true;
            this.displayObject.addChild(cannon);
            this.cannon = cannon;

            // Carriage
            var carriage = Assets.createSprite(Assets.Images.CANNON_CARRIAGE);
            carriage.anchor.x = 0.5;
            carriage.anchor.y = 1;
            carriage.y = 100;
            carriage.x = -26;
            this.displayObject.addChild(carriage);

            this.updateMVT(this.mvt);
        },

        drawDebugOrigin: function(parent, color) {
            var origin = new PIXI.Graphics();
            origin.beginFill(color !== undefined ? color : 0x0000FF, 1);
            origin.drawCircle(0, 0, 3);
            origin.endFill();
            if (parent === undefined)
                this.displayObject.addChild(origin);
            else
                parent.addChild(origin);
        },

        dragCannonStart: function(data) {
            //this.dragOffset = data.getLocalPosition(this.cannon, this._dragOffset);
            this.draggingCannon = true;
        },

        dragCannon: function(data) {
            if (this.draggingCannon) {
                var x = data.global.x - this.displayObject.x;
                var y = data.global.y - this.displayObject.y;
                
                var angle = Math.atan2(y, x);
                var degrees = -angle * RADIANS_TO_DEGREES;
                if (degrees >= Constants.Cannon.MIN_ANGLE && degrees <= Constants.Cannon.MAX_ANGLE)
                    this.model.set('angle', degrees);
            }
        },

        dragCannonEnd: function(data) {
            this.draggingCannon = false;
        },

        updateAngle: function(cannon, angleInDegrees) {
            this.cannon.rotation = this.model.firingAngle();
        },

        updateMVT: function(mvt) {
            // Note: Maybe we don't need to ever update at all. Could we just scale the whole scene's displayObject?
            var targetCannonWidth = mvt.modelToViewDeltaX(this.model.get('width')); // in pixels
            var scale = targetCannonWidth / this.cannon.width;

            this.displayObject.scale.x = this.displayObject.scale.y = scale;

            this.displayObject.x = mvt.modelToViewX(this.model.get('x'));
            this.displayObject.y = mvt.modelToViewY(this.model.get('y'));

            this.mvt = mvt;
        }

    });

    return CannonView;
});