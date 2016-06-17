define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/v3/pixi/view');
  var CommonArrowView = require('common/v3/pixi/view/arrow');
  var SumVectorYViewModel = require('models/sum-vector-y');
  var Constants = require('constants');

  var SumVectorYView = PixiView.extend({

    initialize: function(options) {
      this.sumVectorYViewModel = new SumVectorYViewModel();
      this.model = options.simModel;
      this.sumVectorModel = options.sumVectorModel;

      this.drawSumVectorY();

      this.listenTo(this.sumVectorModel, 'change:targetX change:targetY', this.updateSumVectorY);
    },

    drawSumVectorY: function() {
      this.sumVectorYView = new CommonArrowView({
          model: this.sumVectorYViewModel,
          fillColor: this.model.get('lightGreen')
      });

      this.sumVectorYContainer = new PIXI.Container();
      this.sumVectorYContainer.addChild(this.sumVectorYView.displayObject);
      this.displayObject.addChild(this.sumVectorYContainer);
      this.sumVectorYContainer.visible = false;

      var model = this.sumVectorYViewModel;

      model.set('originX', this.sumVectorModel.get('originX'));
      model.set('originY', this.sumVectorModel.get('originY'));
      model.set('targetX', this.sumVectorModel.get('targetX'));
      model.set('targetY', this.sumVectorModel.get('targetY'));
      model.set('oldOriginX', model.get('originX'));
      model.set('oldOriginY', model.get('originY'));
    },

    updateSumVectorY: function() {
      var model = this.sumVectorYViewModel;

      if (this.model.get('componentStyles') !== 3) {
        model.set('originX', this.sumVectorModel.get('originX'));
        model.set('originY', this.sumVectorModel.get('originY'));
        model.set('targetX', this.sumVectorModel.get('targetX'));
        model.set('targetY', this.sumVectorModel.get('targetY'));
        model.set('oldOriginX', this.sumVectorModel.get('originX'));
        model.set('oldOriginY', this.sumVectorModel.get('originY'));
      }

    }

  });

  return SumVectorYView;

})
