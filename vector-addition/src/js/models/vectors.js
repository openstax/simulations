define(function(require) {

  'use strict'

  var DraggableArrowView = require('common/pixi/view/arrow-draggable');
  var Constants = require('constants');


  var ArrowViewModel = DraggableArrowView.ArrowViewModel.extend({

    defaults: {

    },

    initialize: function(attributes, options) {
      var originX = 0.8 * Constants.CANVAS_WIDTH + 15 * Math.random() - 10;
      var originY = 0.25 * Constants.CANVAS_HEIGHT + 15 * Math.random() - 10;
      var targetX = originX + 80;
      var targetY = originY - 80;

      this.set('originX', originX);
      this.set('originY', originY);
      this.set('targetX', targetX);
      this.set('targetY', targetY);
    }

  });

  return ArrowViewModel;

});
