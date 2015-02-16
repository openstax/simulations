define(function(require) {

  var DraggableArrowView = require('common/pixi/view/arrow-draggable');

  var VectorYViewModel = DraggableArrowView.ArrowViewModel.extend({
    defaults: {
      originX: 300,
      originY: 300,
      targetX: 380,
      targetY: 220
    },

    initialize: function() {

    }

  });

  return VectorYViewModel;

});
