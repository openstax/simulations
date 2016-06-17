define(function(require) {

  'use strict';

  var PIXI = require('pixi');

  var PixiView = require('common/v3/pixi/view');
  var AppView  = require('common/v3/app/app');

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
      this.binContainer = new PIXI.Container();
      var bin = Assets.createSprite(Assets.Images.VECTOR_BOX);

      var targetSpriteWidth = 140; // in pixels
      var scale = targetSpriteWidth / bin.texture.width;

      bin.scale.x = bin.scale.y = scale;
      bin.x = $('.scene-view').width() - bin.width - 27;
      bin.y = 20;
      bin.buttonMode = true;
      this.binContainer.addChild(bin);
      this.bin = bin;

      if (AppView.windowIsShort()) {
        bin.x = $('.scene-view').width()  - bin.width - 12 *  Constants.GRID_SIZE;
        bin.y = $('.scene-view').height() - bin.height - 5 * Constants.GRID_SIZE;
      }

      this.displayObject.addChild(this.binContainer);
    },

    addVector: function() {
      var vectorView = new VectorView({
        model: this.model
      });
      this.vectorView = vectorView;
      this.displayObject.parent.addChild(vectorView.displayObject);
    },

    dragStart: function(event) {
      this.dragging = true;
      this.addVector();
      this.vectorView.centerAt(event.data.global.x, event.data.global.y);
      this.didDrag = false;
    },

    drag: function(event) {
      if (this.dragging) {
        this.vectorView.centerAt(event.data.global.x, event.data.global.y);
        this.didDrag = true;
      }
    },

    dragEnd: function(event) {
      this.dragging = false;

      // It was just a click
      if (!this.didDrag) {
        this.vectorView.positionDefault();
      }
    }

  });

  return VectorBinView;
});
