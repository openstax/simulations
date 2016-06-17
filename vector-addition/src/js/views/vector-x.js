define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/v3/pixi/view');
  var CommonArrowView = require('common/v3/pixi/view/arrow');
  var VectorXViewModel = require('models/vector-x');
  var Constants = require('constants');

  var VectorXView = PixiView.extend({

    initialize: function(options) {
      this.vectorXViewModel = new VectorXViewModel();
      this.model = options.simModel;
      this.vectorViewModel = options.vectorViewModel;

      this.drawVectorX();
    },

    drawVectorX: function() {
      this.vectorXView = new CommonArrowView({
          model: this.vectorXViewModel,
          fillColor: this.model.get('pink')
      });

      this.vectorXContainer = new PIXI.Container();
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
    }

  });

  return VectorXView;

})
