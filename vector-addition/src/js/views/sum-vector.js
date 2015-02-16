define(function (require){

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var DraggableArrowView = require('common/pixi/view/arrow-draggable');
  var SumVectorViewModel = require('models/sum-vector');
  var Vectors = require('vector-addition');

  var SumVectorView = PixiView.extend({

    events: {
      'click .tailGraphics': 'updateReadouts',
      'click .headGraphics': 'updateReadouts'
    },

    initialize: function() {
      this.sumVectorModel = new SumVectorViewModel();
      this.initGraphics()
      this.listenTo(this.model, 'change:sumVectorVisible', this.sumVectorVisible);
      this.listenTo(this.model, 'change', this.updateSum);
      this.listenTo(this.sumVectorModel, 'change', this.updateSum);
    },

    initGraphics: function() {
      this.sumVector();
    },

    sumVector: function() {
      this.sumVectorContainer = new PIXI.DisplayObjectContainer();

      this.sumVectorView = new DraggableArrowView({
          model: this.sumVectorModel,
          fillColor: this.model.get('green'),
          headDraggingEnabled: false,
          bodyDraggingEnabled: false
      });

      this.tailGraphics = this.sumVectorView.tailGraphics;
      this.headGraphics = this.sumVectorView.headGraphics;
      this.sumVectorContainer.addChild(this.sumVectorView.displayObject);
      this.displayObject.addChild(this.sumVectorContainer);

      this.sumVectorContainer.x = $('.scene-view').width()/6;
      this.sumVectorContainer.y = $('.scene-view').height()/6;
      this.sumVectorContainer.visible = false;
    },

    sumVectorVisible: function() {
      this.updateSum();
      if (this.model.get('sumVectorVisible') && this.model.arrowCollection.length > 0) {
        this.sumVectorContainer.visible = true;
      }
      else {
        this.sumVectorContainer.visible = false;
      }
    },

    updateSum: function() {
      Vectors.sum(this.model, this.sumVectorModel, this.sumVectorContainer, this.sumVectorView);
    },

    updateReadouts: function() {
      var width = this.sumVectorContainer.width;
      var height = this.sumVectorContainer.height;
      var length = this.sumVectorModel.get('length');
      var degrees = this.sumVectorModel.get('degrees');
      Vectors.updateReadouts(this.sumVectorContainer, this.model, this.sumVectorModel, width, height, length, degrees);
      $('label').addClass('green');
    }

  });

  return SumVectorView;

});
