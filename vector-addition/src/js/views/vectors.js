define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var DraggableArrowView = require('common/pixi/view/arrow-draggable');
  var ComponentsView = require('views/component-styles');
  var VectorXView = require('views/vector-x');
  var VectorYView = require('views/vector-y');
  var SumVectorXView = require('views/sum-vector-x');
  var SumVectorYView = require('views/sum-vector-y');
  var Simulation = require('models/simulation');
  var VectorViewModel = require('models/vectors');
  var SumVectorViewModel = require('models/sum-vector');
  var Constants = require('constants');

  var VectorView = PixiView.extend({

    events: {
      'click .tailGraphics': 'updateReadouts',
      'click .headGraphics': 'updateReadouts',
      'click .sumTailGraphics': 'updateSumReadouts',
      'click .sumHeadGraphics': 'updateSumReadouts'
    },

    initialize: function() {
      this.vectorViewModel = new VectorViewModel();
      this.sumVectorModel = new SumVectorViewModel();

      this.initGraphics();
      this.initComponents();

      this.listenTo(this.model, 'change:emptyStage', this.clearStage);
      this.listenTo(this.vectorViewModel, 'change:targetX change:targetY', this.updateReadouts);
      this.listenTo(this.vectorViewModel, 'change:targetX change:targetY', this.deleteArrow);

      this.listenTo(this.model, 'change:sumVectorVisible', this.sumVectorVisible);
      this.listenTo(this.model.vectorViewModel, 'change', this.updateSum);
      this.listenTo(this.model.vectorCollection, 'change', this.updateSum);
      this.listenTo(this.sumVectorModel, 'change', this.updateSum);
    },

    initGraphics: function() {
      this.initSumVector();
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
        vectorYContainer: this.vectorYView.vectorYContainer,

        sumVectorModel: this.sumVectorModel,
        sumVectorXView: this.sumVectorXView.sumVectorXView,
        sumVectorXViewModel: this.sumVectorXView.sumVectorXViewModel,
        sumVectorXContainer: this.sumVectorXView.sumVectorXContainer,

        sumVectorYView: this.sumVectorYView.sumVectorYView,
        sumVectorYViewModel: this.sumVectorYView.sumVectorYViewModel,
        sumVectorYContainer: this.sumVectorYView.sumVectorYContainer
      });

      this.componentsView = componentsView;
      this.displayObject.addChild(this.componentsView.displayObject);
    },

    drawVector: function() {
      this.initVectorX();
      this.initVectorY();

      this.arrowView = new DraggableArrowView({
          model: this.vectorViewModel
      });

      this.tailGraphics = this.arrowView.tailGraphics;
      this.headGraphics = this.arrowView.headGraphics;

      this.container = new PIXI.DisplayObjectContainer();
      this.container.addChild(this.arrowView.displayObject);
      this.displayObject.addChild(this.container);

      var width = Math.floor(this.container.width);
      var height = Math.floor(this.container.height);

      this.vectorViewModel.set('degrees', this.model.calculateDegrees(this.vectorViewModel.get('originX'), this.vectorViewModel.get('originY')));
      this.vectorViewModel.set('angle', this.arrowView.transformFrame.rotation);
      this.model.set('emptyStage', false);
      this.model.set('width', width);
      this.model.set('height', height);

      this.model.updateReadouts(this.container, this.model, this.vectorViewModel, width, height, this.vectorViewModel.get('length'), this.vectorViewModel.get('degrees'));
      this.model.vectorCollection.add(this.vectorViewModel);
    },

    initSumVector: function() {
      this.initSumVectorX();
      this.initSumVectorY();

      this.sumVectorContainer = new PIXI.DisplayObjectContainer();

      this.sumVectorView = new DraggableArrowView({
          model: this.sumVectorModel,
          fillColor: this.model.get('green')
      });

      this.sumTailGraphics = this.sumVectorView.tailGraphics;
      this.sumHeadGraphics = this.sumVectorView.headGraphics;

      this.sumVectorContainer.addChild(this.sumVectorView.displayObject);
      this.displayObject.addChild(this.sumVectorContainer);
      this.sumVectorContainer.visible = false;

      var width = Math.floor(this.sumVectorContainer.width);
      var height = Math.floor(this.sumVectorContainer.height);

      this.sumVectorModel.set('degrees', this.model.calculateDegrees(this.sumVectorModel.get('originX'), this.sumVectorModel.get('originY')));
      this.sumVectorModel.set('angle', this.sumVectorView.transformFrame.rotation);
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

    initSumVectorX: function() {
      var sumVectorXView = new SumVectorXView({
        simModel: this.model,
        sumVectorXViewModel: this.sumVectorXViewModel,
        sumVectorModel: this.sumVectorModel

      });

      this.sumVectorXView = sumVectorXView;
      this.displayObject.addChild(this.sumVectorXView.displayObject);
    },

    initSumVectorY: function() {
      var sumVectorYView = new SumVectorYView({
        simModel: this.model,
        sumVectorYViewModel: this.sumVectorYViewModel,
        sumVectorModel: this.sumVectorModel
      });

      this.sumVectorYView = sumVectorYView;
      this.displayObject.addChild(this.sumVectorYView.displayObject);
    },

    updateReadouts: function() {
      var width = Math.floor(this.container.width);
      var height = Math.floor(this.container.height);
      var length = this.vectorViewModel.get('length');
      var degrees = this.vectorViewModel.get('degrees');

      this.vectorViewModel.set('degrees', this.model.calculateDegrees(width/10, height/10));
      this.vectorViewModel.set('angle', this.arrowView.transformFrame.rotation);
      this.model.updateReadouts(this.container, this.model, this.vectorViewModel, width, height, length, degrees);
      $('label').removeClass('green');
    },

    clearStage: function() {
      if (this.model.get('emptyStage') == true) {
        this.model.vectorCollection.remove(this.vectorViewModel);
        this.displayObject.removeChild(this.container);
        this.vectorXView.displayObject.removeChild(this.vectorXView.vectorXContainer);
        this.vectorYView.displayObject.removeChild(this.vectorYView.vectorYContainer);
        this.componentsView.displayObject.removeChild(this.componentsView.linesContainer);
        this.sumVectorView.displayObject.removeChild(this.sumVectorView.sumVectorContainer);
        this.sumVectorXView.displayObject.removeChild(this.sumVectorXView.sumVectorXContainer);
        this.sumVectorYView.displayObject.removeChild(this.sumVectorYView.sumVectorYContainer);
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
        this.model.set('deleteVector', false);
        this.model.set('sumVectorVisible', false);
      }
    },

    sumVectorVisible: function() {
      this.updateSum();
      if (this.model.get('sumVectorVisible')) {
        this.sumVectorContainer.visible = true;
      }
      else {
        this.sumVectorContainer.visible = false;
      }
    },

    updateSum: function() {
      this.sumVectorModel.sum(this.model, this.sumVectorView);
    },

    updateSumReadouts: function() {
      var width = Math.floor(this.sumVectorContainer.width);
      var height = Math.floor(this.sumVectorContainer.height);
      var length = this.sumVectorModel.get('length');
      var degrees = this.sumVectorModel.get('degrees');

      this.sumVectorModel.set('degrees', this.model.calculateDegrees(width/10, height/10));
      this.sumVectorModel.set('angle', this.sumVectorView.transformFrame.rotation);
      this.model.updateReadouts(this.sumVectorContainer, this.model, this.sumVectorModel, width, height, length, degrees);
      $('label').addClass('green');
    }

  });

 return VectorView;

  });
