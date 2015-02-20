define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var DraggableArrowView = require('common/pixi/view/arrow-draggable');
  var ComponentsView = require('views/component-styles');
  var VectorXView = require('views/vector-x');
  var VectorYView = require('views/vector-y');
  var Simulation = require('models/simulation');
  var VectorViewModel = require('models/vectors');
  var Constants = require('constants');

  var VectorView = PixiView.extend({

    events: {
      'click .tailGraphics': 'updateReadouts',
      'click .headGraphics': 'updateReadouts'
    },

    initialize: function() {
      this.vectorViewModel = new VectorViewModel();

      this.initGraphics();

      this.listenTo(this.model, 'change:emptyStage', this.clearStage);
      this.listenTo(this.vectorViewModel, 'change:targetX change:targetY', this.updateReadouts);
      this.listenTo(this.vectorViewModel, 'change:targetX change:targetY', this.deleteArrow);
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
          snappingXFunction: this.defaultSnappingFunction,
          snappingYFunction: this.defaultSnappingFunction
      });

      this.tailGraphics = this.arrowView.tailGraphics;
      this.headGraphics = this.arrowView.headGraphics;

      this.container = new PIXI.DisplayObjectContainer();
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

    deleteArrow: function() {
      var arrowX = this.vectorViewModel.get('targetX');
      var arrowY = this.vectorViewModel.get('targetY');
      var trashCanX = this.model.get('trashCanPositionX');
      var trashCanY = this.model.get('trashCanPositionY');

      if (arrowX >= trashCanX) {
        this.model.set('deleteVector', true);
        this.model.vectorCollection.remove(this.vectorViewModel);
        this.displayObject.removeChild(this.container);
        this.vectorXView.displayObject.removeChild(this.vectorXView.vectorXContainer);
        this.vectorYView.displayObject.removeChild(this.vectorYView.vectorYContainer);
        this.componentsView.displayObject.removeChild(this.componentsView.linesContainer);

        if (this.model.vectorCollection.length <= 0) {
          this.model.set('sumVectorVisible', false);
        }

        this.model.set('deleteVector', false);
      }
    },

    defaultSnappingFunction: function(coordinateComponent) {
      return Math.round(coordinateComponent / 15) * 15;
    }

  });

 return VectorView;

  });
