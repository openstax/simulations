define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Assets = require('assets');
  var Constants = require('constants');

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

      can.x = 0.9 * $('.scene-view').width();
      can.y = 0.75 * $('.scene-view').height();
      can.buttonMode = true;
      this.canContainer.addChild(can);
      this.can = can;

      this.displayObject.addChild(this.canContainer);
    }

  });

  return TrashCanView;
});
