define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var ArrowView = require('views/arrows');
  var Assets = require('assets');
  var Constants = require('constants');
  
  var VectorBinView = PixiView.extend({

    events: {
      'click .bin': 'drawArrow'
    },

    initialize: function(options) {
      this.initGraphics();
    },

    initGraphics: function() {
      this.bin();
    },

    bin: function() {
      this.binContainer = new PIXI.DisplayObjectContainer();
      var bin = Assets.createSprite(Assets.Images.Vector_Bin);

      var x = 0.87 * $('.scene-view').width();
      var y = 0.02 * $('.scene-view').height();
      bin.buttonMode = true;
      this.binContainer.addChild(bin);
      this.bin = bin;
      this.bin.position = new PIXI.Point(x, y);

      this.displayObject.addChild(this.binContainer);
    },

    drawArrow: function() {
      var arrowView = new ArrowView({
        model: this.model
      });
      this.arrowView = arrowView;
      this.displayObject.parent.addChild(arrowView.displayObject);
    }

  });

  return VectorBinView;
});
