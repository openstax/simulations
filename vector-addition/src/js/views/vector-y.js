define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var CommonArrowView = require('common/pixi/view/arrow');
  var VectorYViewModel = require('models/vector-y');
  var Constants = require('constants');

  var VectorYView = PixiView.extend({

    initialize: function(options) {
      this.vectorYViewModel = new VectorYViewModel();
      this.model = options.simModel;
      this.vectorViewModel = options.vectorViewModel;
      this.container = options.container;

      this.drawVectorY();

      this.listenTo(this.vectorViewModel, 'change:targetX change:targetY', this.updateVectorY);
    },

    drawVectorY: function() {
      this.vectorYView = new CommonArrowView({
          model: this.vectorYViewModel,
          fillColor: this.model.get('pink')
      });

      this.vectorYContainer = new PIXI.DisplayObjectContainer();
      this.vectorYContainer.addChild(this.vectorYView.displayObject);
      this.displayObject.addChild(this.vectorYContainer);
      this.vectorYContainer.visible = false;

      var model = this.vectorYViewModel;

      model.set('originX', this.vectorViewModel.get('originX'));
      model.set('originY', this.vectorViewModel.get('originY'));
      model.set('targetX', this.vectorViewModel.get('targetX'));
      model.set('targetY', this.vectorViewModel.get('targetY'));
      model.set('oldOriginX', model.get('originX'));
      model.set('oldOriginY', model.get('originY'));
      model.set('rotation', Constants.VECTOR_Y_ROTATION);
    },

    updateVectorY: function() {
      var model = this.vectorYViewModel;
      var angle = this.vectorViewModel.get('angle');
      var theta = this.model.get('thetaText');

      if (theta > 0) {
        angle = Constants.VECTOR_Y_ROTATION;
        model.set('rotation', angle);
      }
      else {
        angle = -Constants.VECTOR_Y_ROTATION;
        model.set('rotation', angle);
      }

      if (this.model.get('componentStyles') == 0) {
        this.vectorYContainer.visible = false;
      }
      
      model.set('originX', this.vectorViewModel.get('originX'));
      model.set('originY', this.vectorViewModel.get('originY'));
      model.set('targetX', this.vectorViewModel.get('targetX'));
      model.set('targetY', this.vectorViewModel.get('targetY'));
      model.set('oldOriginX', this.vectorViewModel.get('originX'));
      model.set('oldOriginY', this.vectorViewModel.get('originY'));
      this.vectorYView.transformFrame.rotation = model.get('rotation');
    }

  });

  return VectorYView;

});
