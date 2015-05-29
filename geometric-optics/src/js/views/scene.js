define(function(require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    var PixiSceneView      = require('common/pixi/view/scene');
    var AppView            = require('common/app/app');
    var Vector2            = require('common/math/vector2');
    var Rectangle          = require('common/math/rectangle');
    var ModelViewTransform = require('common/math/model-view-transform');

    var SourceObjectView = require('views/source-object');
    var TargetImageView  = require('views/target-image');
    var LensView         = require('views/lens');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants');

    // CSS
    require('less!styles/scene');

    /**
     *
     */
    var GeometricOpticsSceneView = PixiSceneView.extend({

        events: {
            
        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
        },

        renderContent: function() {
            
        },

        initGraphics: function() {
            PixiSceneView.prototype.initGraphics.apply(this, arguments);

            this.initMVT();
            this.initObjects();

            // var graphics = new PIXI.Graphics();
            // graphics.lineStyle(2, 0x000000, 1);
            // graphics.beginFill(0xFF0000, 0.5);
            // graphics.drawRect(
            //     this.mvt.modelToViewX(-Constants.MIN_SCENE_WIDTH / 2),
            //     this.mvt.modelToViewY(-Constants.MIN_SCENE_HEIGHT / 2),
            //     this.mvt.modelToViewDeltaX(Constants.MIN_SCENE_WIDTH),
            //     this.mvt.modelToViewDeltaY(Constants.MIN_SCENE_HEIGHT)
            // );
            // graphics.endFill();
            // this.stage.addChild(graphics);
        },

        initMVT: function() {
            // Map the simulation bounds...
            var simWidth  = Constants.MIN_SCENE_WIDTH;
            var simHeight = Constants.MIN_SCENE_HEIGHT;

            // ...to the usable screen space that we have
            var usableScreenSpace
            if (AppView.windowIsShort())
                usableScreenSpace = new Rectangle(0, 0, this.width - 205, this.height);
            else
                usableScreenSpace = new Rectangle(0, 116, this.width, this.height - 116);

            var simRatio = simWidth / simHeight;
            var screenRatio = usableScreenSpace.w / usableScreenSpace.h;
            
            var scale = (screenRatio > simRatio) ? usableScreenSpace.h / simHeight : usableScreenSpace.w / simWidth;
            
            this.viewOriginX = Math.round(usableScreenSpace.x + usableScreenSpace.w / 2);
            this.viewOriginY = Math.round(usableScreenSpace.y + usableScreenSpace.h / 2);

            this.mvt = ModelViewTransform.createSinglePointScaleInvertedYMapping(
                new Vector2(0, 0),
                new Vector2(this.viewOriginX, this.viewOriginY),
                scale
            );
        },

        initObjects: function() {
            this.sourceObjectView = new SourceObjectView({
                model: this.simulation.sourceObject,
                mvt: this.mvt
            });
            this.stage.addChild(this.sourceObjectView.displayObject);

            this.targetImageView = new TargetImageView({
                model: this.simulation.targetImage,
                mvt: this.mvt
            });
            this.stage.addChild(this.targetImageView.displayObject);

            this.lensView = new LensView({
                model: this.simulation.lens,
                mvt: this.mvt
            });
            this.stage.addChild(this.lensView.displayObject);
        },

        _update: function(time, deltaTime, paused, timeScale) {
            
        },

    });

    return GeometricOpticsSceneView;
});
