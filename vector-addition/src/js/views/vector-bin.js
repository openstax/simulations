define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Assets = require('assets');
  var Constants = require('constants');

  var VectorBinView = PixiView.extend({

    events: {
      'click .bin': 'drawArrow'
      //'mousedown .arrowTail': 'dragStart',
      //'touchstart .arrowTail': 'dragStart',
      //'mousemove .arrowTail': 'dragMove',
      //'touchmove .arrowTail': 'dragMove',
      //'mouseup .arrowTail': 'dragEnd',
      //'mouseupoutside .arrowTail': 'dragEnd',
      //'touchend .arrowTail': 'dragEnd',
      //'touchendoutside .arrowTail': 'dragEnd'
    },

    initialize: function(options) {
      this.initGraphics();
    },

    initGraphics: function() {
      this.bin();
    },

    dragStart: function(data) {
      data.originalEvent.preventDefault();
      this.data = data;
      this.dragging = true;
    },

    dragMove: function(data) {
      if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this);
        this.parent.position.x = Math.floor(newPosition.x);
        this.parent.position.y = Math.floor(newPosition.y);
      }
    },

    dragEnd: function(data) {
      this.dragging = false;
    },

    bin: function() {
      this.binContainer = new PIXI.DisplayObjectContainer();
      var bin = Assets.createSprite(Assets.Images.Vector_Bin);

      bin.x = $('.scene-view').width() - 125;
      bin.y = 10;
      bin.buttonMode = true;
      this.binContainer.addChild(bin);
      this.bin = bin;

      this.displayObject.addChild(this.binContainer);

    },

    drawArrow: function() {
      this.arrowContainer = new PIXI.DisplayObjectContainer();
      var arrowHead = new PIXI.Graphics(),
      arrowTail = new PIXI.Graphics(),
      fillColor = '0xFF0000',
      max = $('.scene-view').width() - 150,
      min = 800,
      positionX = Math.random() * (max - min) + min,
      positionY = positionX - 750;

      arrowHead.beginFill(fillColor);
      arrowHead.moveTo(positionX, positionY);
      arrowHead.lineTo(positionX + 10, positionY -25);
      arrowHead.lineTo(positionX + 20, positionY);
      arrowHead.endFill();
      arrowHead.interactive = true;
      arrowHead.buttonMode = true;
      this.arrowHead = arrowHead;

      arrowTail.beginFill(fillColor);
      arrowTail.drawRect(positionX + 6, positionY, 8, 100);
      arrowTail.interactive = true;
      arrowTail.buttonMode = true;
      arrowTail.mousedown = this.dragStart;
      arrowTail.touchstart = this.dragStart;
      arrowTail.mousemove = this.dragMove;
      arrowTail.touchmove = this.dragMove;
      arrowTail.mouseup = this.dragEnd;
      arrowTail.mouseupoutside = this.dragEnd;
      arrowTail.touchend = this.dragEnd;
      arrowTail.touchendoutside = this.dragEnd;
      this.arrowTail = arrowTail;

      this.arrowContainer.addChild(arrowHead);
      this.arrowContainer.addChild(arrowTail);

      this.displayObject.addChild(this.arrowContainer);
      this.model.set({'valueX': 0, 'valueY': 0});
    }

  });

  return VectorBinView;
});
