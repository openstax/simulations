define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
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

      bin.x = 835;
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
      positionX = $('.scene-view').width() - 150,
      positionY = positionX - 750;

      arrowHead.beginFill(fillColor);
      arrowHead.moveTo(positionX, positionY);
      arrowHead.lineTo(positionX + 10, positionY -25);
      arrowHead.lineTo(positionX + 20, positionY);
      arrowHead.endFill();
      arrowHead.interactive = true;
      arrowHead.buttonMode = true;
      arrowHead.click = function() {
        console.log('clicking arrow head');
      }

      arrowTail.lineStyle(8, fillColor);
      arrowTail.moveTo(positionX + 10, positionY);
      arrowTail.lineTo(positionX + 10, positionY + 100);

      this.arrowContainer.addChild(arrowHead);
      this.arrowContainer.addChild(arrowTail);
      this.displayObject.addChild(this.arrowContainer);
    }

  });

  return VectorBinView;
});
