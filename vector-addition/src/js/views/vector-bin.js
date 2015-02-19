define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var VectorView = require('views/vectors');
  var Assets = require('assets');
  var Constants = require('constants');

  var VectorBinView = PixiView.extend({

    events: {
      'mousedown .bin': 'drawVectors'
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

    drawVectors: function() {
      var vectorView = new VectorView({
        model: this.model
      });
      this.vectorView = vectorView;
      this.displayObject.parent.addChild(vectorView.displayObject);
    }

  });

  return VectorBinView;
});
