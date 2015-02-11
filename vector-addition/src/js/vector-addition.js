define(function (require) {

    'use strict';

    $ = require('jquery');
    var PIXI = require('pixi');
    var ArrowsCollection = require('collections/arrows');
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

      updateReadouts: function(arrowModel, model, x, y, length, degrees) {
        if (arrowModel !== undefined) {
          arrowModel.set('length', length);
          arrowModel.set('degrees', degrees);
          arrowModel.set('x', x);
          arrowModel.set('y', y);
          arrowModel.set('rText', Vectors.padZero(Vectors.round1(length/10)));
          arrowModel.set('thetaText', Vectors.padZero(Vectors.round1(degrees)));
          arrowModel.set('rXText', Vectors.round0(x/10));
          arrowModel.set('rYText', Vectors.round0(y/10));
        }

        model.set('rText', Vectors.padZero(Vectors.round1(length/10)));
        model.set('thetaText', Vectors.padZero(Vectors.round1(degrees)));
        model.set('rXText', Vectors.round0(x/10));
        model.set('rYText', Vectors.round0(y/10));
        $('label').removeClass('green');
      },

      updateComponents: function(model, vector, vectorX, vectorY) {
        var xV = vector.x;
        var yV = vector.y;
        console.log(xV, yV)

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
          this.componentStyles1(vectorX, vectorY, yV);
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

      componentStyles1: function(vectorX, vectorY, yV) {
        vectorX.y = 0;
        vectorY.x = 0;

        if (yV == 0) {
          vectorY.visible = false
        }
      },

      componentStyles2: function(xV, vectorX, vectorY) {
        vectorX.y = 0;
        vectorY.x = xV * 10;
      },

      componentStyles3: function(xV, xY, vectorX, vectorY) {
      //TODO
      // xVector_mc._y = stageH - thisHere._y - (5-nbrVectors*0.2)*gridSize;
      // yVector_mc._x = -thisHere._x + (5-nbrVectors*0.2)*gridSize;
      // hLineT._x = -thisHere._x + 5*gridSize;
      // hLineT._y = yV;
      // hLineT._width = thisHere._x + xV - 5*gridSize;
      // hLineB._x = -thisHere._x + 5*gridSize;
      // hLineB._width = thisHere._x - 5*gridSize;
      // vLineL._y = stageH - thisHere._y - 5*gridSize;
      // vLineL._height = stageH - thisHere._y - 5*gridSize ;
      // vLineR._x = xV;
      // vLineR._y = stageH - thisHere._y - 5*gridSize;
      // vLineR._height = stageH - thisHere._y  - 5*gridSize - yV;
    },

      sum: function(model, sumVectorContainer, sumVectorTail) {
        var xSum = 0;
        var ySum = 0;
        if (model.get('arrows') !== undefined) {
          var arrows = model.get('arrows').models;
          var canvas = $('.scene-view');

          _.each(arrows, function(arrow) {
            xSum += arrow.get('x');
            ySum += arrow.get('y');
          });

          var length = Math.sqrt(xSum * xSum + ySum * ySum);
          var degrees = (180/Math.PI) * Math.atan2(ySum, xSum);

          model.set('sumVectorRText', Vectors.padZero(Vectors.round1(length/10)));
          model.set('sumVectorThetaText', Vectors.padZero(Vectors.round1(degrees)));
          model.set('sumVectorRXText', Vectors.round0(xSum/10));
          model.set('sumVectorRYText', Vectors.round0(ySum/10));

          sumVectorContainer.position.x = canvas.width()/2;
          sumVectorContainer.position.y = canvas.height()/2;
          sumVectorContainer.pivot.set(sumVectorContainer.width/2, sumVectorContainer.height);

          this.redrawSumVector(sumVectorContainer, sumVectorTail, ySum, xSum, length);
        }
      },

      redrawSumVector: function(sumVectorContainer, sumVectorTail, ySum, xSum, length) {
        sumVectorTail.clear();
        sumVectorTail.beginFill(0x76EE00);
        sumVectorTail.drawRect(6, 20, 8, length - 20);
        sumVectorContainer.pivot.set(sumVectorContainer.width/2, sumVectorContainer.height);
        sumVectorContainer.rotation = -Math.atan2(ySum, xSum)  + 180/Math.PI *2;
        console.log(sumVectorContainer.rotation);
      },

      deleteArrow: function(model, container) {
        var arrows = model.get('arrows');
        var arrowToRemove = arrows.indexOf(container.index);
        arrows.remove(arrowToRemove);
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
