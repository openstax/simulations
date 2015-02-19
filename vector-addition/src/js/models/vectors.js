define(function(require) {

  'use strict'

  var DraggableArrowView = require('common/pixi/view/arrow-draggable');

  var ArrowViewModel = DraggableArrowView.ArrowViewModel.extend({
    defaults: {
      originX: 300,
      originY: 300,
      targetX: 380,
      targetY: 220
    },

    initialize: function(attributes, options) {

    }

  });

  return ArrowViewModel;

});
