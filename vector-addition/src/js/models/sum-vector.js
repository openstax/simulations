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
      var length = 0;
      var angle = 0;

      if (model.vectorCollection.length > 0) {
          var vectors = model.vectorCollection.models;
        _.each(vectors, function(vector) {
          length += vector.get('length');
          angle += vector.get('angle');
        });

        this.set('length', length);
        this.set('angle', angle);

        this.set('originX', this.get('originX'));
        this.set('originY', this.get('originY'));
        this.set('targetX', this.get('originX') + this.get('length'));
        this.set('targetY', this.get('originY') + this.get('length'));

        sumVectorView.transformFrame.rotation = this.get('angle');
      }
    },

  });

  return SumVectorViewModel;

});
