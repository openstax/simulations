define(function (require){

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Vectors = require('vector-addition');
  var ArrowsCollection = require('collections/arrows');

  var SumVectorView = PixiView.extend({

    events: {
      'click .sumVectorHead': 'sumVectorReadouts',
      'click .sumVectorTail': 'sumVectorReadouts',

      'mousedown .sumVectorContainer': 'dragStart',
      'mousemove .sumVectorContainer': 'dragMove',
      'touchmove .sumVectorContainer': 'dragMove',
      'mouseup .sumVectorContainer': 'dragEnd',
      'mouseupoutside .sumVectorContainer': 'dragEnd',
      'touchend .sumVectorContainer': 'dragEnd',
      'touchendoutside .sumVectorContainer': 'dragEnd'
    },

    initialize: function() {
      this.initGraphics()
      this.listenTo(this.model, 'change:sumVectorVisible', this.sumVectorVisible);
      this.listenTo(this.model, 'change', this.updateSum);
      this.listenTo(this.model, 'change:emptyStage', this.resetSumVector);
    },

    initGraphics: function() {
      this.sumVector(0, 100);
    },

    dragStart: function(data) {
      data.originalEvent.preventDefault();
      this.data = data;
      this.dragging = true;
    },

    dragMove: function(data) {
      if (this.model.get('arrows') !== undefined) {
        var x = Vectors.roundGrid(data.global.x - this.displayObject.x),
          y = Vectors.roundGrid(data.global.y - this.displayObject.y),
          length = Math.sqrt(x * x + y * y),
          degrees = (180/Math.PI) * Math.atan2(y, x);

        if (this.dragging) {
           this.sumVectorContainer.x = x;
           this.sumVectorContainer.y = y;

          if (this.sumVectorContainer.x >= this.model.get('trashCanPositionX') || this.sumVectorContainer.y >= this.model.get('trashCanPositionY')) {
            this.model.set('deleteVector', true);
          }
          else {
            this.model.set('deleteVector', false);
          }
        }

      }
    },

    dragEnd: function(data) {
      this.dragging = false;
      if (this.sumVectorContainer.position.x >= this.model.get('trashCanPositionX') || this.sumVectorContainer.position.y >= this.model.get('trashCanPositionY')) {
        if (this.model.set('deleteVector', true)) {
          Vectors.deleteArrow(this.model, this.sumVectorContainer);
          this.displayObject.removeChild(this.sumVectorContainer);
          this.model.set('deleteVector', false);
          this.model.set('sumVectorVisible', false);
        }
      }
    },

    sumVector: function(x, y) {
      this.sumVectorContainer = new PIXI.DisplayObjectContainer();

      var sumVectorHead = new PIXI.Graphics();
      Vectors.drawVectorHead(sumVectorHead, '0x76EE00', true, true);
      this.sumVectorHead = sumVectorHead;

      var sumVectorTail = new PIXI.Graphics();
      Vectors.drawVectorHead(sumVectorTail, '0x76EE00', true, true);
      this.sumVectorTail = sumVectorTail;

      //Arrow Container
      this.sumVectorContainer.addChild(this.sumVectorHead);
      this.sumVectorContainer.addChild(this.sumVectorTail);
      this.displayObject.addChild(this.sumVectorContainer);
      
      this.sumVectorContainer.visible = false;
    },

    sumVectorVisible: function() {
      if (this.model.get('sumVectorVisible') && this.model.get('arrows') !== undefined) {
        this.sumVectorContainer.visible = true;
      }
      else {
        this.sumVectorContainer.visible = false;
      }
    },

    updateSum: function() {
      Vectors.sum(this.model, this.sumVectorContainer, this.sumVectorTail);
    },

    sumVectorReadouts: function() {
      var model = this.model;
      model.set('rText', model.get('sumVectorRText'));
      model.set('thetaText', model.get('sumVectorThetaText'));
      model.set('rXText', model.get('sumVectorRXText'));
      model.set('rYText', model.get('sumVectorRYText'));

      $('label').addClass('green');
    },

    resetSumVector: function() {
      if (this.model.get('emptyStage')) {
        this.sumVectorTail.height = 80;
      }
    }
  });

  return SumVectorView;

});
