define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView = require('common/pixi/view');

    var Assets = require('assets');

    /**
     * A view that represents an element model
     */
    var CannonView = PixiView.extend({

        /**
         *
         */
        initialize: function(options) {
            this.mvt = options.mvt;

            this.initGraphics();

            // Listen to angle because the user can change that from the control panel,
            //   but don't listen to x or y because those will only ever be changed
            //   through this view.
            this.listenTo(this.model, 'change:angle', this.updateAngle);
            
        },

        initGraphics: function() {
            // Cannon
            var cannon = Assets.createSprite(Assets.Images.CANNON);
            cannon.anchor.x = 0.24;
            cannon.anchor.y = 0.5;
            this.displayObject.addChild(cannon);
            this.cannon = cannon;

            // Carriage
            var carriage = Assets.createSprite(Assets.Images.CANNON_CARRIAGE);
            carriage.anchor.x = 0.5;
            carriage.anchor.y = 1;
            carriage.y = 94;
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

        updateAngle: function(cannon, angleInDegrees) {

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