define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var CommonArrowView = require('common/pixi/view/arrow');
  var SumVectorXViewModel = require('models/sum-vector-x');
  var Constants = require('constants');

  var SumVectorXView = PixiView.extend({

    initialize: function(options) {
      this.sumVectorXViewModel = new SumVectorXViewModel();
      this.model = options.simModel;
      this.sumVectorModel = options.sumVectorModel;

      this.drawSumVectorX();

      this.listenTo(this.sumVectorModel, 'change:targetX change:targetY', this.updateSumVectorX);
    },

    drawSumVectorX: function() {
      this.sumVectorXView = new CommonArrowView({
          model: this.sumVectorXViewModel,
          fillColor: this.model.get('lightGreen')
      });

      this.sumVectorXContainer = new PIXI.DisplayObjectContainer();
      this.sumVectorXContainer.addChild(this.sumVectorXView.displayObject);
      this.displayObject.addChild(this.sumVectorXContainer);
      this.sumVectorXContainer.visible = false;

      var model = this.sumVectorXViewModel;

      model.set('originX', this.sumVectorModel.get('originX'));
      model.set('originY', this.sumVectorModel.get('originY'));
      model.set('targetX', this.sumVectorModel.get('targetX'));
      model.set('targetY', this.sumVectorModel.get('targetY'));
      model.set('oldOriginX', model.get('originX'));
      model.set('oldOriginY', model.get('originY'));
      model.set('rotation', 0);
    },

    updateSumVectorX: function() {
      var model = this.sumVectorXViewModel;
      var angle = this.sumVectorModel.get('angle');
      var theta = this.model.get('thetaText');

      if (theta > 90) {
        angle = Constants.VECTOR_X_ROTATION;
        model.set('rotation', angle)
      }

      else {
        angle = 0;
        model.set('rotation', angle)
      }

      model.set('originX', this.sumVectorModel.get('originX'));
      model.set('originY', this.sumVectorModel.get('originY'));
      model.set('targetX', this.sumVectorModel.get('targetX'));
      model.set('targetY', this.sumVectorModel.get('targetY'));
      model.set('oldOriginX', this.sumVectorModel.get('originX'));
      model.set('oldOriginY', this.sumVectorModel.get('originY'));
      this.sumVectorXView.transformFrame.rotation = model.get('rotation');
    }

  });

  return SumVectorXView;

})
