define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Assets = require('assets');
  var Constants = require('constants');
  var trashCanTextures = [Assets.Images.Trash_Can, Assets.Images.Trash_Can_Open];

  var TrashCanView = PixiView.extend({

    initialize: function(options) {
      this.initGraphics();
    },

    initGraphics: function() {
      this.trashCan();
    },

    trashCan: function() {
      this.canContainer = new PIXI.DisplayObjectContainer();
      var can = Assets.createSprite(Assets.Images.Trash_Can);
      var can_open = Assets.createSprite(Assets.Images.Trash_Can_Open);

      can.x = 0.88 * $('.scene-view').width();
      can.y = 0.70 * $('.scene-view').height();
      can.buttonMode = true;
      this.canContainer.addChild(can);
      this.can = can;

      this.displayObject.addChild(this.canContainer);
    }

  });

  return TrashCanView;
});
