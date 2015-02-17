define(function (require) {

    'use strict';

    $ = require('jquery');
    var PIXI = require('pixi');
    var Constants = require('constants')

    var Vectors = {

      updateReadouts: function(container, model, arrowModel, x, y, length, degrees) {
        var width = x;
        var height = y;

        if (arrowModel.get('targetX') < arrowModel.get('originX')) {
          width = -width;
        }
        else if (arrowModel.get('targetY') > arrowModel.get('originY')) {
          height = -height;
        }

        if (width == 20) {
          width = 0
        }
        else if (height == 20) {
          height = 0
        }

        arrowModel.set('degrees', Vectors.calculateDegrees(width, height));
        model.set('rText', Vectors.padZero(Vectors.round1(length/10)));
        model.set('thetaText', Vectors.padZero(Vectors.round1(degrees)));
        model.set('rXText', Vectors.round0(width/10));
        model.set('rYText', Vectors.round0(height/10));
      },

      sum: function(model, sumVectorModel, sumVectorContainer, sumVectorView) {
        var length = 0;
        var angle = 0;

        if (model.arrowCollection.length > 0) {
            var arrows = model.arrowCollection.models;
          _.each(arrows, function(arrow) {
            length += arrow.get('length');
            angle += arrow.get('angle');
          });

          sumVectorModel.set('length', length);
          sumVectorModel.set('angle', angle);

          sumVectorModel.set('targetX', sumVectorModel.get('originX') + length);
          sumVectorModel.set('targetY', sumVectorModel.get('originY') + length);

          this.redrawVector(sumVectorView, sumVectorModel, model.get('green'), sumVectorModel.get('angle'))
        }
      },

      redrawVector: function(vectorView, vectorModel, fillColor, angle) {
        vectorView.tailGraphics.clear();
        vectorView.headGraphics.clear();

        vectorView.tailGraphics.beginFill(fillColor);
        vectorView.tailGraphics.drawRect(0, -vectorView.tailWidth / 2, vectorModel.get('length') - vectorView.headLength, vectorView.tailWidth);
        vectorView.tailGraphics.endFill();

        vectorView.headGraphics.beginFill(fillColor);
        vectorView.headGraphics.moveTo(vectorModel.get('length'), 0);
        vectorView.headGraphics.lineTo(vectorModel.get('length') - vectorView.headLength,  vectorView.headWidth / 2);
        vectorView.headGraphics.lineTo(vectorModel.get('length') - vectorView.headLength, -vectorView.headWidth / 2);
        vectorView.headGraphics.endFill();

        vectorView.transformFrame.rotation = angle;

      },

      //PHET functions
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
