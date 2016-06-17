define(function(require) {

  'use strict';

  var PIXI = require('pixi');

  var Rectangle = require('common/math/rectangle');
  var PixiView = require('common/v3/pixi/view');
  var DraggableArrowView = require('common/v3/pixi/view/arrow-draggable');
  var ComponentsView = require('views/components');
  var VectorXView = require('views/vector-x');
  var VectorYView = require('views/vector-y');
  var Simulation = require('models/simulation');
  var VectorViewModel = require('models/vectors');
  var Constants = require('constants');

  var VectorView = PixiView.extend({

    events: {
      'touchstart .arrowDisplayObject': 'updateReadouts',
      'mousedown  .arrowDisplayObject': 'updateReadouts',

      'touchmove  .arrowDisplayObject': 'dragArrow',
      'mousemove  .arrowDisplayObject': 'dragArrow',

      'touchend        .arrowDisplayObject': 'dragArrowStop',
      'mouseup         .arrowDisplayObject': 'dragArrowStop',
      'touchendoutside .arrowDisplayObject': 'dragArrowStop',
      'mouseupoutside  .arrowDisplayObject': 'dragArrowStop'
    },

    initialize: function() {
      this.vectorViewModel = new VectorViewModel();

      this.initGraphics();

      this.listenTo(this.model, 'change:emptyStage', this.clearStage);
      this.listenTo(this.vectorViewModel, 'change:targetX change:targetY', this.updateReadouts);
      this.listenTo(this.vectorViewModel, 'change:targetX change:targetY', this.dragArrow);
    },

    initGraphics: function() {
      this.initVectorX();
      this.initVectorY();
      this.initComponents();
      this.drawVector();
    },

    initComponents: function() {
      var componentsView = new ComponentsView({
        model: this.model,
        vectorViewModel: this.vectorViewModel,
        vectorXViewModel: this.vectorXView.vectorXViewModel,
        vectorYViewModel: this.vectorYView.vectorYViewModel,
        vectorXView: this.vectorXView.vectorXView,
        vectorYView: this.vectorYView.vectorYView,
        vectorXContainer: this.vectorXView.vectorXContainer,
        vectorYContainer: this.vectorYView.vectorYContainer
      });

      this.componentsView = componentsView;
      this.displayObject.addChild(this.componentsView.displayObject);
    },

    drawVector: function() {
      this.arrowView = new DraggableArrowView({
          model: this.vectorViewModel,
          snappingEnabled: true,
          snappingXFunction: Constants.SNAPPING_FUNCTION,
          snappingYFunction: Constants.SNAPPING_FUNCTION
      });

      this.arrowDisplayObject = this.arrowView.displayObject;

      this.container = new PIXI.Container();
      this.container.addChild(this.arrowView.displayObject);
      this.displayObject.addChild(this.container);

      var width = Math.floor(this.container.width);
      var height = Math.floor(this.container.height);

      this.vectorViewModel.set('angle', this.arrowView.transformFrame.rotation);
      this.model.set('emptyStage', false);
      this.model.set('width', width);
      this.model.set('height', height);

      this.model.updateReadouts(this.container, this.model, this.vectorViewModel, width, height, this.vectorViewModel.get('length'), this.vectorViewModel.get('degrees'));
      this.model.vectorCollection.add(this.vectorViewModel);
    },

    initVectorX: function() {
      var vectorXView = new VectorXView({
        vectorXViewModel: this.vectorXViewModel,
        simModel: this.model,
        vectorViewModel: this.vectorViewModel
      });

      this.vectorXView = vectorXView;
      this.displayObject.addChild(this.vectorXView.displayObject);
    },

    initVectorY: function() {
      var vectorYView = new VectorYView({
        simModel: this.model,
        vectorViewModel: this.vectorViewModel
      });

      this.vectorYView = vectorYView;
      this.displayObject.addChild(this.vectorYView.displayObject);
    },

    updateReadouts: function() {
      var width = Math.floor(this.container.width);
      var height = Math.floor(this.container.height);
      var length = this.vectorViewModel.get('length');

      this.vectorViewModel.set('degrees', this.model.calculateDegrees(width/10, height/10));
      this.vectorViewModel.set('angle', this.arrowView.transformFrame.rotation);
      this.model.updateReadouts(this.container, this.model, this.vectorViewModel, width, height, length);
      $('label').removeClass('green');
    },

    clearStage: function() {
      if (this.model.get('emptyStage') == true) {
        this.model.vectorCollection.remove(this.vectorViewModel);
        this.displayObject.removeChild(this.container);
        this.vectorXView.displayObject.removeChild(this.vectorXView.vectorXContainer);
        this.vectorYView.displayObject.removeChild(this.vectorYView.vectorYContainer);
        this.componentsView.displayObject.removeChild(this.componentsView.linesContainer);
      }
    },

    centerAt: function(x, y) {
      var dx = this.vectorViewModel.get('targetX') - this.vectorViewModel.get('originX');
      var dy = this.vectorViewModel.get('targetY') - this.vectorViewModel.get('originY');

      this.vectorViewModel.set({
        originX: Constants.SNAPPING_FUNCTION(x - dx / 2),
        originY: Constants.SNAPPING_FUNCTION(y - dy / 2),
        targetX: Constants.SNAPPING_FUNCTION(x + dx / 2),
        targetY: Constants.SNAPPING_FUNCTION(y + dy / 2)
      });
    },

    positionDefault: function() {
      this.vectorViewModel.set(this.vectorViewModel.defaults());
    },

    dragArrow: function() {
      if (!this.arrowView.draggingBody)
        return;

      var bounds = this.arrowView.displayObject.getBounds();
      var vectorBounds = new Rectangle(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height
      );
      var trashCanBounds = new Rectangle(
        this.model.get('trashCanPositionX'),
        this.model.get('trashCanPositionY'),
        this.model.get('trashCanWidth'),
        this.model.get('trashCanHeight')
      );

      if (vectorBounds.overlaps(trashCanBounds)) {
        this.deleting = true;
        this.model.set('deleteVector', true);
      }
      else {
        this.deleting = false;
        this.model.set('deleteVector', false);
      }
    },

    dragArrowStop: function() {
      if (this.deleting) {
        this.model.vectorCollection.remove(this.vectorViewModel);
        this.componentsView.displayObject.parent.removeChild(this.componentsView.displayObject);
        this.vectorXView.displayObject.parent.removeChild(this.vectorXView.displayObject);
        this.vectorYView.displayObject.parent.removeChild(this.vectorYView.displayObject);
        this.displayObject.parent.removeChild(this.displayObject);

        if (this.model.vectorCollection.length <= 0) {
          this.model.set('sumVectorVisible', false);
        }

        this.model.set('deleteVector', false);
      }
    }

  });

  return VectorView;

});
