define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Simulation = require('models/simulation');
  var DraggableArrowView = require('common/pixi/view/arrow-draggable');
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
      this.listenTo(this.arrowViewModel, 'change:targetX', this.updateVectorX);
      this.listenTo(this.arrowViewModel, 'change:targetY', this.updateVectorY);
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
    },

    drawVectorX: function() {
      this.vectorXView = new DraggableArrowView({
          model: this.vectorXViewModel,
          fillColor: this.model.get('pink'),
          bodyDraggingEnabled: false,
          headDraggingEnabled: false
      });

      this.vectorXContainer = new PIXI.DisplayObjectContainer();
      this.vectorXContainer.addChild(this.vectorXView.displayObject);
      this.displayObject.addChild(this.vectorXContainer);
      this.vectorXView.transformFrame.rotation = 0;
      this.vectorXContainer.visible = false;
      this.model.arrowCollection.add(this.vectorXViewModel);
    },

    updateVectorX: function() {
      var vectorView = this.vectorXView;
      var vectorModel = this.arrowViewModel;
      var fillColor = this.model.get('pink');
      var angle = this.arrowViewModel.get('angle');
      Vectors.redrawVector(vectorView, vectorModel, fillColor, 0);
    },

    drawVectorY: function() {
      this.vectorYView = new DraggableArrowView({
          model: this.vectorYViewModel,
          fillColor: this.model.get('pink'),
          bodyDraggingEnabled: false,
          headDraggingEnabled: false
      });

      this.vectorYContainer = new PIXI.DisplayObjectContainer();
      this.vectorYContainer.addChild(this.vectorYView.displayObject);
      this.displayObject.addChild(this.vectorYContainer);
      this.vectorYView.transformFrame.rotation = 4.733219300420907; //TODO
      this.vectorYContainer.visible = false;
      this.model.arrowCollection.add(this.vectorYViewModel);
    },

    updateVectorY: function() {
      var vectorView = this.vectorYView;
      var vectorModel = this.arrowViewModel;
      var fillColor = this.model.get('pink');
      var angle = this.arrowViewModel.get('angle');
      var theta = this.model.get('thetaText');
      this.scaleVectors(theta);
      if (theta > 0) {
        angle = 4.733219300420907; //TODO angle
      }
      else {
        angle = -4.733219300420907; //TODO angle
      }
      Vectors.redrawVector(vectorView, vectorModel, fillColor, angle);
    },

    scaleVectors: function(theta) {
      if (theta == 0 || theta == 180) {
        this.vectorYView.transformFrame.scale.y = 0;
      }
      else {
        this.vectorYView.transformFrame.scale.y = 1;
      }

      if (theta == 90 || theta == -90 ) {
        this.vectorXView.transformFrame.scale.x = 0;
      }
      else {
        this.vectorXView.transformFrame.scale.x = 1;
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
      var trashCanX = this.model.get('trashCanPositionX');
      var trashCanY = this.model.get('trashCanPositionY');

      if (arrowX >= trashCanX) {
        this.model.set('deleteVector', true);
        this.model.arrowCollection.remove(this.arrowViewModel);
        this.displayObject.removeChild(this.container);
        this.model.set('deleteVector', false);
        this.model.set('sumVectorVisible', false);
      }
    },

    showComponentStyles: function() {
      if (this.model.get('componentStyles') == 0) {
        this.vectorXContainer.visible = false;
        this.vectorYContainer.visible = false;
      }
      else {
        this.vectorXContainer.visible = true;
        this.vectorYContainer.visible = true;
      }

      if (this.model.get('componentStyles') == 1) {
        //TODO
      }

      if (this.model.get('componentStyles') == 2) {
        //TODO
      }

    }

  });

 return ArrowView;
  });
