define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Simulation = require('models/simulation');
  var DraggableArrowView = require('common/pixi/view/arrow-draggable');
  var CommonArrowView = require('common/pixi/view/arrow');
  var ArrowViewModel = require('models/arrows');
  var VectorXViewModel = require('models/vector-x');
  var VectorYViewModel = require('models/vector-y');
  var Vectors = require('vector-addition');
  var Constants = require('constants');

  var ArrowView = PixiView.extend({

    events: {
      'click .tailGraphics': 'updateReadouts',
      'click .headGraphics': 'updateReadouts'
    },

    initialize: function() {
      this.arrowViewModel = new ArrowViewModel();
      this.vectorXViewModel = new VectorXViewModel();
      this.vectorYViewModel = new VectorYViewModel();
      this.initGraphics();
      this.listenTo(this.model, 'change:emptyStage', this.clearArrows);
      this.listenTo(this.arrowViewModel, 'change:targetX change:targetY', this.updateReadouts);
      this.listenTo(this.arrowViewModel, 'change:targetX change:targetY', this.deleteArrow);
      this.listenTo(this.arrowViewModel, 'change:targetX change:targetY', this.updateVectorX);
      this.listenTo(this.arrowViewModel, 'change:targetY change:targetX', this.updateVectorY);
      this.listenTo(this.model, 'change:componentStyles', this.showComponentStyles);
    },

    initGraphics: function() {
      this.drawArrow();
    },

    drawArrow: function() {
      this.drawVectorX();
      this.drawVectorY();

      this.arrowView = new DraggableArrowView({
          model: this.arrowViewModel
      });

      this.tailGraphics = this.arrowView.tailGraphics;
      this.headGraphics = this.arrowView.headGraphics;

      this.container = new PIXI.DisplayObjectContainer();
      this.container.addChild(this.arrowView.displayObject);
      this.displayObject.addChild(this.container);

      var width = Math.floor(this.container.width);
      var height = Math.floor(this.container.height);

      this.arrowViewModel.set('degrees', Vectors.calculateDegrees(this.arrowViewModel.get('originX'), this.arrowViewModel.get('originY')));
      this.arrowViewModel.set('angle', this.arrowView.transformFrame.rotation);
      this.model.set('emptyStage', false);

      Vectors.updateReadouts(this.container, this.model, this.arrowViewModel, width, height, this.arrowViewModel.get('length'), this.arrowViewModel.get('degrees'));
      this.model.arrowCollection.add(this.arrowViewModel);
      this.showComponentStyles();
    },

    drawVectorX: function() {
      this.vectorXView = new CommonArrowView({
          model: this.vectorXViewModel,
          fillColor: this.model.get('pink')
      });

      this.vectorXContainer = new PIXI.DisplayObjectContainer();
      this.vectorXContainer.addChild(this.vectorXView.displayObject);
      this.displayObject.addChild(this.vectorXContainer);
      this.vectorXContainer.visible = false;

      var model = this.vectorXViewModel;

      model.set('originX', this.arrowViewModel.get('originX'));
      model.set('originY', this.arrowViewModel.get('originY'));
      model.set('targetX', this.arrowViewModel.get('targetX'));
      model.set('targetY', this.arrowViewModel.get('targetY'));
      model.set('oldOriginX', model.get('originX'));
      model.set('oldOriginY', model.get('originY'));
      model.set('rotation', 0);

      this.model.arrowCollection.add(this.vectorXViewModel);
    },

    updateVectorX: function() {
      var vectorContainer = this.vectorXContainer;
      var model = this.vectorXViewModel;
      var vectorView = this.vectorXView;
      var vectorModel = this.arrowViewModel;
      var fillColor = this.model.get('pink');
      var angle = this.arrowViewModel.get('angle');
      var theta = this.model.get('thetaText');
      this.showVectors(theta);

      if (theta > 90) {
        angle = Constants.VECTOR_X_ROTATION;
        model.set('rotation', angle)
      }

      else {
        angle = 0;
        model.set('rotation', angle)
      }

      model.set('originX', vectorModel.get('originX'));
      model.set('originY', vectorModel.get('originY'));
      model.set('targetX', vectorModel.get('targetX'));
      model.set('targetY', vectorModel.get('targetY'));

      Vectors.redrawVector(vectorView, vectorModel, fillColor, angle);
    },

    drawVectorY: function() {
      this.vectorYView = new CommonArrowView({
          model: this.vectorYViewModel,
          fillColor: this.model.get('pink')
      });

      this.vectorYContainer = new PIXI.DisplayObjectContainer();
      this.vectorYContainer.addChild(this.vectorYView.displayObject);
      this.displayObject.addChild(this.vectorYContainer);
      this.vectorYContainer.visible = false;

      var model = this.vectorYViewModel;

      model.set('originX', this.arrowViewModel.get('originX'));
      model.set('originY', this.arrowViewModel.get('originY'));
      model.set('targetX', this.arrowViewModel.get('targetX'));
      model.set('targetY', this.arrowViewModel.get('targetY'));
      model.set('oldOriginX', model.get('originX'));
      model.set('oldOriginY', model.get('originY'));
      model.set('rotation', Constants.VECTOR_Y_ROTATION);

      this.model.arrowCollection.add(this.vectorYViewModel);
    },

    updateVectorY: function() {
      var model = this.vectorYViewModel;
      var vectorView = this.vectorYView;
      var vectorModel = this.arrowViewModel;
      var fillColor = this.model.get('pink');
      var angle = this.arrowViewModel.get('angle');
      var theta = this.model.get('thetaText');
      var rotation = model.get('rotation');
      this.showVectors(theta);

      if (theta > 0) {
        angle = Constants.VECTOR_Y_ROTATION;
        model.set('rotation', angle);
      }
      else {
        angle = -Constants.VECTOR_Y_ROTATION;
        model.set('rotation', angle);
      }

      model.set('originX', vectorModel.get('originX'));
      model.set('originY', vectorModel.get('originY'));
      model.set('targetX', vectorModel.get('targetX'));
      model.set('targetY', vectorModel.get('targetY'));
      model.set('oldOriginY', vectorModel.get('originY'));
      model.set('oldOriginX', vectorModel.get('originX'));

      Vectors.redrawVector(vectorView, vectorModel, fillColor, angle);
      this.showComponentStyles();
    },

    showVectors: function(theta) {
      if (theta == 0 || theta == 180) {
        this.vectorYContainer.visible = false;
      }
      else {
        this.vectorYContainer.visible = true;
      }

      if (theta == 90 || theta == -90 ) {
        this.vectorXContainer.visible = false;
      }
      else {
        this.vectorXContainer.visible = true;
      }
    },

    updateReadouts: function() {
      var arrowModel = this.arrowViewModel;
      var width = Math.floor(this.container.width);
      var height = Math.floor(this.container.height);
      var length = arrowModel.get('length');
      var degrees = arrowModel.get('degrees');
      arrowModel.set('degrees', Vectors.calculateDegrees(width/10, height/10));
      arrowModel.set('angle', this.arrowView.transformFrame.rotation);
      Vectors.updateReadouts(this.container, this.model, arrowModel, width, height, length, degrees);
      $('label').removeClass('green');
    },

    clearArrows: function() {
      if (this.model.get('emptyStage') == true) {
        this.model.arrowCollection.remove(this.arrowViewModel);
        this.model.arrowCollection.remove(this.vectorXViewModel);
        this.model.arrowCollection.remove(this.vectorYViewModel);
        this.displayObject.removeChild(this.container);
        this.displayObject.removeChild(this.vectorXContainer);
        this.displayObject.removeChild(this.vectorYContainer);
      }
    },

    deleteArrow: function() {
      var arrowX = this.arrowViewModel.get('targetX');
      var arrowY = this.arrowViewModel.get('targetY');
      var vectorXx = this.vectorXViewModel.get('targetX');
      var vectorXy = this.vectorXViewModel.get('targetY');
      var vectorYx = this.vectorYViewModel.get('targetX');
      var vectorYy = this.vectorYViewModel.get('targetY')
      var trashCanX = this.model.get('trashCanPositionX');
      var trashCanY = this.model.get('trashCanPositionY');

      if (arrowX >= trashCanX) {
        this.model.set('deleteVector', true);
        this.model.arrowCollection.remove(this.arrowViewModel);
        this.displayObject.removeChild(this.container);
        this.displayObject.removeChild(this.vectorXContainer);
        this.displayObject.removeChild(this.vectorYContainer);
        this.model.set('deleteVector', false);
        this.model.set('sumVectorVisible', false);
      }
    },

    showComponentStyles: function() {
      var vectorYModel = this.vectorYViewModel;
      var vectorXModel = this.vectorXViewModel;
      var arrowViewModel = this.arrowViewModel;
      var oldOriginX = vectorYModel.get('oldOriginX');

      if (this.model.get('componentStyles') == 0) {
        this.vectorXContainer.visible = false;
        this.vectorYContainer.visible = false;
      }
      else {
        this.vectorXContainer.visible = true;
        this.vectorYContainer.visible = true;
      }

      if (this.model.get('componentStyles') == 1) {
        vectorYModel.set('originX', oldOriginX);
        this.vectorYView.transformFrame.rotation = vectorYModel.get('rotation');
        this.vectorXView.transformFrame.rotation = vectorXModel.get('rotation');

      }

      if (this.model.get('componentStyles') == 2) {
        vectorYModel.set('originX', this.arrowViewModel.get('targetX'));
        this.vectorXView.transformFrame.rotation = vectorXModel.get('rotation');
      }
    }

  });

 return ArrowView;
  });
