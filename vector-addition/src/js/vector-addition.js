define(function (require) {

    'use strict';

    $ = require('jquery');
    var PIXI = require('pixi');
    var Constants = require('constants')

    var Vectors = {

      drawVectorHead: function(vectorHead, fillColor, interactiveBool, buttonModeBool, defaultCursor) {
        vectorHead.beginFill(fillColor);
        vectorHead.moveTo(0, Constants.ARROWHEAD_HEIGHT);
        vectorHead.lineTo(10, 0);
        vectorHead.lineTo(Constants.ARROWHEAD_HEIGHT, Constants.ARROWHEAD_HEIGHT);
        vectorHead.endFill();
        vectorHead.interactive = interactiveBool;
        vectorHead.buttonMode = buttonModeBool;
        vectorHead.defaultCursor = defaultCursor;
      },

      drawVectorTail: function(vectorTail, fillColor, length, interactiveBool, buttonModeBool, defaultCursor) {
        vectorTail.beginFill(fillColor);
        vectorTail.drawRect(6, Constants.ARROWHEAD_HEIGHT, 8, length);
        vectorTail.interactive = interactiveBool;
        vectorTail.buttonMode = buttonModeBool;
        vectorTail.defaultCursor = defaultCursor;
      },

      updateReadouts: function(container, model, arrowModel, x, y, length, degrees) {
        var width = x;
        var height = y;

        if (arrowModel.get('targetX') < arrowModel.get('originX')) {
          width = -width;
        }

        if (arrowModel.get('targetY') > arrowModel.get('originY')) {
          height = -height;
        }

        arrowModel.set('degrees', Vectors.calculateDegrees(width, height));
        model.set('rText', Vectors.padZero(Vectors.round1(length/10)));
        model.set('thetaText', Vectors.padZero(Vectors.round1(degrees)));
        model.set('rXText', Vectors.round0(x/10));
        model.set('rYText', Vectors.round0(y/10));
      },

      updateComponents: function(model, vector, vectorX, vectorY) {
        var xV = vector.x;
        var yV = vector.y;

        this.vectorRotations(xV, yV, vectorX, vectorY);

        if (model.get('componentStyles') == 0) {
          vectorX.visible = false;
          vectorY.visible = false;
        }
        else {
          vectorX.visible = true;
          vectorY.visible = true;
        }

        if (model.get('componentStyles') == 1) {
          this.componentStyles1(vectorX, vectorY, xV, yV);
        }

        else if (model.get('componentStyles') == 2) {
          this.componentStyles2(xV, vectorX, vectorY);
        }
        else if (model.get('componentStyles') == 3) {
          this.componentStyles3(xV, xY, vectorX, vectorY);
        }
      },

      vectorRotations: function(xV, yV, vectorX, vectorY) {
        var angle = 180 * Math.PI/180;

        if (xV > 0) {
          vectorX.rotation = angle/2;
        }

        else if (xV < 0) {
          vectorX.rotation = -angle/2;
        }

        else {
          vectorX.rotation = 0;
        }

        if (yV < 0) {
          vectorY.rotation = 0;
        }
        else if (yV > 0) {
          vectorY.rotation = angle;
        }
      },

      componentStyles1: function(vectorX, vectorY, xV, yV) {
        vectorX.y = 0;
        vectorY.x = 0;

        if (yV == 0) {
          vectorY.visible = false
        }

        if (xV == 0) {
          vectorX.visible = false;
        }
      },

      componentStyles2: function(xV, vectorX, vectorY) {
        vectorX.y = 0;
        vectorY.x = xV * 10;
      },

      componentStyles3: function(xV, xY, vectorX, vectorY) {

    },

      sum: function(model, sumVectorModel, sumVectorContainer, sumVectorView) {
        var length = 0;
        var degrees = 0;

        if (model.arrowCollection.length > 0) {
            var arrows = model.arrowCollection.models;
          _.each(arrows, function(arrow) {
            length += arrow.get('length');
            degrees += arrow.get('degrees');
          });

          sumVectorModel.set('length', length);
          this.redrawSumVector(model, sumVectorView, sumVectorModel);
        }
      },

      redrawSumVector: function(model, sumVectorView, sumVectorModel) {
        sumVectorView.tailGraphics.clear();
        sumVectorView.headGraphics.clear();

        sumVectorView.tailGraphics.beginFill(model.get('green'));
        sumVectorView.tailGraphics.drawRect(0, -sumVectorView.tailWidth / 2, sumVectorModel.get('length') - sumVectorView.headLength, sumVectorView.tailWidth);
        sumVectorView.tailGraphics.endFill();

        sumVectorView.headGraphics.beginFill(model.get('green'));
        sumVectorView.headGraphics.moveTo(sumVectorModel.get('length'), 0);
        sumVectorView.headGraphics.lineTo(sumVectorModel.get('length') - sumVectorView.headLength,  sumVectorView.headWidth / 2);
        sumVectorView.headGraphics.lineTo(sumVectorModel.get('length') - sumVectorView.headLength, -sumVectorView.headWidth / 2);
        sumVectorView.headGraphics.endFill();
      },

      calculateLength: function(x, y) {
        return Math.sqrt(x * x + y * y);
      },

      calculateDegrees: function(x, y) {
        return (180/Math.PI) * Math.atan2(y, x);
      },

      roundGrid: function(nbr) {
        var gridSize = 10;
        return (nbr/gridSize)*gridSize;
      },

      round0: function(nbr) {
        return Math.round(nbr);
      },

      round1: function(nbr) {
        var ans = (Math.round(nbr *10)) /10;
        return ans;
      },

      padZero: function(nbr) {
        var text = nbr;

        if (nbr % 1 == 0) {
          text = text + ".0"
          }

        return text;
      },

  };

    return Vectors;
});
