define(function(require) {

  var DraggableArrowView = require('common/pixi/view/arrow-draggable');

  var SumVectorViewModel = DraggableArrowView.ArrowViewModel.extend({
    defaults: {
      originX: 300,
      originY: 300,
      targetX: 380,
      targetY: 220
    },

    initialize: function() {

    },

    sum: function(model, sumVectorView) {
      var changesX = 0;
      var changesY = 0;
      var sumX = 0;
      var sumY = 0;
      var rotation = 0;

      if (model.vectorCollection.length > 0) {
          var vectors = model.vectorCollection.models;
        _.each(vectors, function(vector) {
          changesX = vector.get('targetX') - vector.get('originX');
          changesY = vector.get('targetY') - vector.get('originY');
          sumX += changesX;
          sumY += changesY;
          rotation += vector.get('rotation');
        });

        this.set('originX', this.get('originX'));
        this.set('originY', this.get('originY'));
        this.set('targetX', this.get('originX') + sumX);
        this.set('targetY', this.get('originY') + sumY);
        this.set('rotation', rotation);
      }
    }

  });

  return SumVectorViewModel;

});
