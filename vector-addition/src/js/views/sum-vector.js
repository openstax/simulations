define(function (require){

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Vectors = require('vector-addition');
  var Arrows = require('collections/arrows');

  var SumVectorView = PixiView.extend({

    events: {

    },

    initialize: function() {
      this.initGraphics()
      this.listenTo(this.model, 'change:sumVectorVisible', this.sumVectorVisible);
      this.listenTo(this.model, 'change:arrows.position.x change:arrows.position.y', this.sumVector);

    },

    initGraphics: function() {
      this.sumVector();
    },

    sumVector: function() {
      this.sumVectorContainer = new PIXI.DisplayObjectContainer();
      var sumVectorHead = new PIXI.Graphics();
      var sumVectorTail = new PIXI.Graphics();

      sumVectorHead.beginFill(0x76EE00);
      sumVectorHead.moveTo(0, 40);
      sumVectorHead.lineTo(10, 0);
      sumVectorHead.lineTo(20, 40);
      sumVectorHead.endFill();
      this.sumVectorHead = sumVectorHead;

      sumVectorTail.clear();
      sumVectorTail.beginFill(0x76EE00);
      sumVectorTail.drawRect(6, 40, 8, 0);
      this.sumVectorTail = sumVectorTail;

      sumVectorTail.beginFill(0x76EE00);
      sumVectorTail.drawRect(6, 40, 8, 10)
      this.sumVectorTail = sumVectorTail;

      this.displayObject.position.x = 0;
      this.displayObject.position.y = 0;

      this.sumVectorContainer.addChild(this.sumVectorHead);
      this.sumVectorContainer.addChild(this.sumVectorTail);

      this.displayObject.addChild(this.sumVectorContainer);

      this.sumVectorContainer.visible = false;
    },

    sumVectorVisible: function() {
      if (this.model.get('sumVectorVisible') == false) {
        this.sumVectorContainer.visible = false;
      }
      else {
        this.sumVectorContainer.visible = true;
      }
    }

  });

  return SumVectorView;

});
