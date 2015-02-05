define(function (require){

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Vectors = require('vector-addition');
  var ArrowsCollection = require('collections/arrows');

  var SumVectorView = PixiView.extend({

    events: {
      'click .sumVectorHead': 'updateSumReadouts',
      'click .sumVectorTail': 'updateSumReadouts'
    },

    initialize: function() {
      this.initGraphics()
      this.listenTo(this.model, 'change:sumVectorVisible', this.sumVectorVisible);
      this.listenTo(this.model, 'change', this.updateSum);
      this.listenTo(this.model, 'change:emptyStage', this.clearSumVector);
    },

    initGraphics: function() {
      this.sumVector(10, 100, 1);
    },

    sumVector: function(x, y) {
      this.sumVectorContainer = new PIXI.DisplayObjectContainer();
      var canvas = $('.scene-view');
      this.displayObject.x = x;
      this.displayObject.y = y;
      var length = Math.sqrt(x * x + y * y);
      var degrees = (180/Math.PI) * Math.atan2(y, x);

      var sumVectorHead = new PIXI.Graphics();

      sumVectorHead.beginFill(0x76EE00);
      sumVectorHead.moveTo(0, 20);
      sumVectorHead.lineTo(10, 0);
      sumVectorHead.lineTo(20, 20);
      sumVectorHead.endFill();
      sumVectorHead.interactive = true;
      sumVectorHead.buttonMode = true;
      this.sumVectorHead = sumVectorHead;


      var sumVectorTail = new PIXI.Graphics();

      sumVectorTail.beginFill(0x76EE00);
      sumVectorTail.drawRect(6, 20, 8, length - this.sumVectorHead.height);
      sumVectorTail.interactive = true;
      sumVectorTail.buttonMode = true;
      this.sumVectorTail = sumVectorTail;

      this.displayObject.position.x = 0;
      this.displayObject.position.y = 0;

      this.sumVectorContainer.addChild(this.sumVectorHead);
      this.sumVectorContainer.addChild(this.sumVectorTail);
      this.displayObject.addChild(this.sumVectorContainer);

      this.sumVectorContainer.visible = false;
      this.sumVectorContainer.rotation = 0;

    },

    sumVectorVisible: function() {
      if (this.model.get('sumVectorVisible') == false) {
        this.sumVectorContainer.visible = false;
      }
      else {
        this.sumVectorContainer.visible = true;
      }

    },

    updateSum: function() {
      Vectors.sum(this.model, this.displayObject, this.sumVectorContainer, this.sumVectorTail);
    },

    updateSumReadouts: function() {
      var model = this.model;
      model.set('rText', model.get('sumVectorRText'));
      model.set('thetaText', model.get('sumVectorThetaText'));
      model.set('rXText', model.get('sumVectorRXText'));
      model.set('rYText', model.get('sumVectorRYText'));
      model.set('className', 'green');
      console.log(model.get('className'))
    },

    clearSumVector: function() {
      this.model.set('sumVectorVisible', false);
      this.displayObject.removeChild(this.sumVectorContainer);
      }

  });

  return SumVectorView;

});
