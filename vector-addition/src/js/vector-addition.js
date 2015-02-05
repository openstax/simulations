define(function (require) {

    'use strict';

    $ = require('jquery');

    var PIXI = require('pixi');
    var ArrowsCollection = require('collections/arrows');

    var Vectors = {

      VectorArrow: function(x,y,i){
        this.x = x;
        this.y = y;
        this.length = Math.sqrt(x * x + y * y);
        this.degrees = (180/Math.PI) * Math.atan2(y, x);
        this.i = i;  //index of vector in vectors array
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

      updateFields: function(arrowModel, model, x, y, length, degrees) {
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

      },

      //TODO
      //updateComponents: function () {
      //  var xV = _root.sumVector.x;
      //  var yV = _root.sumVector.y;
        //trace("sumVectorHolder: " + xV);
        //trace("_root.sumVector.x: " + _root.sumVector.x);
      //  xVector_mc._width = Math.abs(xV);

      //  if(xV > 0){
        //  xVector_mc._rotation = 0;
      //  } else {xVector_mc._rotation = 180;}
      //  yVector_mc._height = Math.abs(yV);
      //  if(yV < 0){
      //    yVector_mc._rotation = 0;
      //  }else{yVector_mc._rotation = 180;}
      //  if(componentStyle == 0){
      //    xVector_mc._visible = false;
      //    yVector_mc._visible = false;

      //  } else {
      //    xVector_mc._visible = true;
      //    yVector_mc._visible = true;
      //  }
      //  if(componentStyle == 1){
      //    xVector_mc._y = 0;
      //    yVector_mc._x = 0;
      //  }else if(componentStyle == 2){
      //    xVector_mc._y = 0;
        //  yVector_mc._x = xV;
      //  } else if(componentStyle == 3){
          //trace(thisHere._x);
        //  xVector_mc._y = stageH - thisHere._y - (5-nbrVectors*0.2)*gridSize;
      //    yVector_mc._x = -thisHere._x + (5-nbrVectors*0.2)*gridSize;
      //    hLineT._x = -thisHere._x + 5*gridSize;
        //  hLineT._y = yV;
        //  hLineT._width = thisHere._x + xV - 5*gridSize;
        //  hLineB._x = -thisHere._x + 5*gridSize;
        //  hLineB._width = thisHere._x - 5*gridSize;
        //  vLineL._y = stageH - thisHere._y - 5*gridSize;
        //  vLineL._height = stageH - thisHere._y - 5*gridSize ;
        //  vLineR._x = xV;
        //  vLineR._y = stageH - thisHere._y - 5*gridSize;
        //  vLineR._height = stageH - thisHere._y  - 5*gridSize - yV;
        //}
        //if(componentStyle == 3){
        //  hLineT._visible = true;
        //  hLineB._visible = true;
        //  vLineL._visible = true;
        //  vLineR._visible = true;
      //  }else {
        //  hLineT._visible = false;
        //  hLineB._visible = false;
        //  vLineL._visible = false;
        //  vLineR._visible = false;
      //  }
      //},

      sum: function(model, sumVectorContainer, sumVectorTail) {
        var xSum = 0;
        var ySum = 0;
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
        sumVectorContainer.position.y = canvas.height()/4;
        sumVectorContainer.pivot.set(sumVectorContainer.width/2, sumVectorContainer.height);

        this.redrawSumVector(sumVectorContainer, sumVectorTail, ySum, xSum, length)
      },

      redrawSumVector: function(sumVectorContainer, sumVectorTail, ySum, xSum, length) {
        sumVectorContainer.rotation = Math.atan2(ySum, xSum);
        sumVectorTail.clear();
        sumVectorTail.beginFill(0x76EE00);
        sumVectorTail.drawRect(6, 20, 8, length - 20);
      }

  };

    return Vectors;
});
