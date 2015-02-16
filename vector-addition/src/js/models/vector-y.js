define(function(require) {

  var DraggableArrowView = require('common/pixi/view/arrow-draggable');

  var VectorYViewModel = DraggableArrowView.ArrowViewModel.extend({
    defaults: {
      originX: 300,
      originY: 300,
      targetX: 380,
      targetY: 220,
      oldOriginX: 0,
      oldOriginY: 0
    },

    initialize: function() {

    }

  });

  return VectorYViewModel;

});
