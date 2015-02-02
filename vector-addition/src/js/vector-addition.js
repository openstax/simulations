define(function (require) {

    'use strict';

    $ = require('jquery');

    var Vectors = {

      Vector: function(x,y,i){
        this.x = x;
        this.y = y;
        this.length = Math.sqrt(x * x + y * y);
        this.degrees = (180/Math.PI) * Math.atan2(y, x);
        this.i = i;  //index of vector in vectors array
      },

      roundGrid: function(nbr) {
        var gridSize = 960;
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

      updateFields: function(model, length, degrees, x, y) {
        model.set('rText', Vectors.padZero(Vectors.round1(length/10)));
        model.set('thetaText', Vectors.padZero(Vectors.round1(degrees)));
        model.set('rXText', Vectors.round0(x/10));
        model.set('rYText', Vectors.round0(y/10));
      },

      updateSumVector: function() {
        //if (!_root.sumVectorHolder_mc._visible) {
        //  _root.sumVectorHolder_mc._x = stageW/2;
        //  _root.sumVectorHolder_mc._y = stageH/2;
        //  }
        //_root.sumVector = _root.vectors.sum();
        ////_root.sumVectorHolder_mc.updateComponents();
        //_root.sumVectorHolder_mc.sumVector_mc.updateMe();
      },

      sum: function() {
        var xSum = 0;
        var ySum = 0;
        for (var i = 0; i < this.vectors.length; i++) {
        xSum += this.vectors[i].x;
        ySum += this.vectors[i].y;
        }
        var sumVector = this.Vector(xSum,ySum);
        return sumVector;
      }

    };

    return Vectors;
});
