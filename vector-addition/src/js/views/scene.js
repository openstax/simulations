define(function(require) {

    'use strict';

    var PIXI      = require('pixi');
    var Vector2   = require('common/math/vector2'); //AMW Not sure if I need this yet, may remove.
    var Rectangle = require('common/math/rectangle'); //AMW Not sure if I need this yet, may remove.

    var ModelViewTransform   = require('common/math/model-view-transform'); //AMW Not sure if I need this yet, may remove.
    var PixiSceneView        = require('common/pixi/view/scene');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants'); //AMW Not sure if I need this yet, may remove.

    var VectorAdditionSceneView = PixiSceneView.extend({

        events: {

        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
            this.views = [];
        },

        renderContent: function() {

        },

        initGraphics: function() {
          this.addAssets(Assets.createSprite(Assets.Images.Vector_Bin), 835, 20);
          this.addAssets(Assets.createSprite(Assets.Images.Trash_Can), 845, 550);
        },

        addAssets: function(asset, startX, startY) {
          asset.x = startX;
          asset.y = startY;
          this.stage.addChild(asset);
        }

    });

    return VectorAdditionSceneView;
});
