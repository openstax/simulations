define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Assets = require('assets');
  var Constants = require('constants');
  var ArrowView = require('views/arrows');

  var VectorBinView = PixiView.extend({

    events: {
      'click .bin': 'drawArrow'
      //'click .bin': 'drawRect'
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

      var x = $('.scene-view').width() - 125;
      var y = 10;
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
