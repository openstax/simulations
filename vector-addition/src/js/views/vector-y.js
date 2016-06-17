define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/v3/pixi/view');
  var CommonArrowView = require('common/v3/pixi/view/arrow');
  var VectorYViewModel = require('models/vector-y');
  var Constants = require('constants');

  var VectorYView = PixiView.extend({

    initialize: function(options) {
      this.vectorYViewModel = new VectorYViewModel();
      this.model = options.simModel;
      this.vectorViewModel = options.vectorViewModel;
      this.container = options.container;

      this.drawVectorY();
    },

    drawVectorY: function() {
      this.vectorYView = new CommonArrowView({
          model: this.vectorYViewModel,
          fillColor: this.model.get('pink')
      });

      this.vectorYContainer = new PIXI.Container();
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
    }

  });

  return VectorYView;

});
