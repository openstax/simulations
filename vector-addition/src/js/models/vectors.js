define(function(require) {

  'use strict'

  var DraggableArrowView = require('common/pixi/view/arrow-draggable');
  var Constants = require('constants');


  var ArrowViewModel = DraggableArrowView.ArrowViewModel.extend({

    defaults: function() {
      var originX = 0.83 * Constants.CANVAS_WIDTH + 15 * Math.random() - 10;
      var originY = 0.25 * Constants.CANVAS_HEIGHT + 15 * Math.random() - 10;
      var targetX = originX + 30;
      var targetY = originY - 110;

      return {
        originX: Constants.SNAPPING_FUNCTION(originX),
        originY: Constants.SNAPPING_FUNCTION(originY),
        targetX: Constants.SNAPPING_FUNCTION(targetX),
        targetY: Constants.SNAPPING_FUNCTION(targetY)
      }
    },

    initialize: function(attributes, options) {
    },

    resetVectors: function(model) {
      model.set('originX', this.get('originX'));
      model.set('originY', this.get('originY'));
      model.set('targetX', this.get('targetX'));
      model.set('targetY', this.get('targetY'));
    }

  });

  return ArrowViewModel;

});
