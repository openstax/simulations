define(function (require) {

  'use strict';

  var PIXI = require('pixi');
  var Vectors = require('vector-addition');

  var ComponentVectors = {

    drawVectorX: function(model, length, container) {
      this.vectorX = new PIXI.DisplayObjectContainer();

      var vectorHeadX = new PIXI.Graphics();
      Vectors.drawVectorHead(vectorHeadX, model.get('pink'), true, true);
      this.vectorHeadX = vectorHeadX;

      var vectorTailX = new PIXI.Graphics();
      Vectors.drawVectorTail(vectorTailX, model.get('pink'), Vectors.padZero(Vectors.round1(length/10)), true, true);
      this.vectorTailX = vectorTailX;

      this.vectorX.addChild(vectorHeadX);
      this.vectorX.addChild(vectorTailX);
      this.vectorX.visible = true;

      return this.vectorX;
    },

    drawVectorY: function(model, length, container, height) {
      this.vectorY = new PIXI.DisplayObjectContainer();

      var vectorHeadY = new PIXI.Graphics();
      Vectors.drawVectorHead(vectorHeadY, model.get('pink'), true, true);
      this.vectorHeadY = vectorHeadY;

      var vectorTailY = new PIXI.Graphics();
      Vectors.drawVectorTail(vectorTailY, model.get('pink'), length - height, true, true);
      this.vectorTailY = vectorTailY;

      this.vectorY.addChild(vectorHeadY);
      this.vectorY.addChild(vectorTailY);
      this.vectorY.visible = false;

      return this.vectorY;
    },

    updateVector: function(model, vector, fillColor, x) {
      vector.clear();
      vector.beginFill(fillColor);
      vector.drawRect(6, 20, 8, x);
      vector.height = x;
    },

    updateVectorX: function(model, vector, fillColor, x) {
      vector.clear();
      vector.beginFill(fillColor);

      if (x > 0) {
        x = x - 30;
      }
      else {
        x = -x - 10;
      }

      vector.drawRect(6, 20, 8, x);
      vector.height = x;
    },

    updateVectorY: function(model, vector, fillColor, y) {
      vector.clear();
      vector.beginFill(fillColor);

      if (y < 0) {
        y = -y;
      }

      vector.drawRect(6, 20, 8, y);
      vector.height = y;
    }
  }

 return ComponentVectors;

});
