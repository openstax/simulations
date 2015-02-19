define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var CommonArrowView = require('common/pixi/view/arrow');
  var VectorXViewModel = require('models/vector-x');
  var Constants = require('constants');

  var VectorXView = PixiView.extend({

    initialize: function(options) {
      this.vectorXViewModel = new VectorXViewModel();
      this.model = options.simModel;
      this.vectorViewModel = options.vectorViewModel;

      this.drawVectorX();

      this.listenTo(this.vectorViewModel, 'change:targetX change:targetY', this.updateVectorX);
    },

    drawVectorX: function() {
      this.vectorXView = new CommonArrowView({
          model: this.vectorXViewModel,
          fillColor: this.model.get('pink')
      });

      this.vectorXContainer = new PIXI.DisplayObjectContainer();
      this.vectorXContainer.addChild(this.vectorXView.displayObject);
      this.displayObject.addChild(this.vectorXContainer);
      this.vectorXContainer.visible = false;

      var model = this.vectorXViewModel;

      model.set('originX', this.model.vectorViewModel.get('originX'));
      model.set('originY', this.model.vectorViewModel.get('originY'));
      model.set('targetX', this.model.vectorViewModel.get('targetX'));
      model.set('targetY', this.model.vectorViewModel.get('targetY'));
      model.set('oldOriginX', model.get('originX'));
      model.set('oldOriginY', model.get('originY'));
      model.set('rotation', 0);
    },

    updateVectorX: function() {
      var model = this.vectorXViewModel;
      var angle = this.model.vectorViewModel.get('angle');
      var theta = this.model.get('thetaText');

      if (theta > 90) {
        angle = Constants.VECTOR_X_ROTATION;
        model.set('rotation', angle)
      }

      else {
        angle = 0;
        model.set('rotation', angle)
      }

      model.set('originX', this.vectorViewModel.get('originX'));
      model.set('originY', this.vectorViewModel.get('originY'));
      model.set('targetX', this.vectorViewModel.get('targetX'));
      model.set('targetY', this.vectorViewModel.get('targetY'));
      model.set('oldOriginX', this.vectorViewModel.get('originX'));
      model.set('oldOriginY', this.vectorViewModel.get('originY'));
      this.vectorXView.transformFrame.rotation = model.get('rotation');
    }

  });

  return VectorXView;

})
