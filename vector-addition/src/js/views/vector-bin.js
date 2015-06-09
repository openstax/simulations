define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var VectorView = require('views/vectors');
  var Assets = require('assets');
  var Constants = require('constants');

  var VectorBinView = PixiView.extend({

    events: {
      'touchstart      .bin': 'dragStart',
      'mousedown       .bin': 'dragStart',

      'touchmove       .bin': 'drag',
      'mousemove       .bin': 'drag',

      'touchend        .bin': 'dragEnd',
      'mouseup         .bin': 'dragEnd',
      'touchendoutside .bin': 'dragEnd',
      'mouseupoutside  .bin': 'dragEnd'
    },

    initialize: function(options) {
      this.initGraphics();
    },

    initGraphics: function() {
      this.bin();
    },

    bin: function() {
      this.binContainer = new PIXI.DisplayObjectContainer();
      var bin = Assets.createSprite(Assets.Images.VECTOR_BOX);

      var targetSpriteWidth = 140; // in pixels
      var scale = targetSpriteWidth / bin.texture.width;

      bin.scale.x = bin.scale.y = scale;
      bin.x = $('.scene-view').width() - bin.width - 27;
      bin.y = 20;
      bin.buttonMode = true;
      this.binContainer.addChild(bin);
      this.bin = bin;

      this.displayObject.addChild(this.binContainer);
    },

    addVector: function() {
      var vectorView = new VectorView({
        model: this.model
      });
      this.vectorView = vectorView;
      this.displayObject.parent.addChild(vectorView.displayObject);
    },

    dragStart: function(data) {
      this.dragging = true;
      this.addVector();
      this.vectorView.centerAt(data.global.x, data.global.y);
      this.didDrag = false;
    },

    drag: function(data) {
      if (this.dragging) {
        this.vectorView.centerAt(data.global.x, data.global.y);
        this.didDrag = true;
      }
    },

    dragEnd: function(data) {
      this.dragging = false;

      // It was just a click
      if (!this.didDrag) {
        this.vectorView.positionDefault();
      }
    }

  });

  return VectorBinView;
});
