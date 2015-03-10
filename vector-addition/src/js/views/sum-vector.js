define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var DraggableArrowView = require('common/pixi/view/arrow-draggable');
  var SumVectorXView = require('views/sum-vector-x');
  var SumVectorYView = require('views/sum-vector-y');
  var SumComponentsView = require('views/sum-components');
  var Simulation = require('models/simulation');
  var SumVectorViewModel = require('models/sum-vector');
  var Constants = require('constants');

  var SumVectorView = PixiView.extend({

    events: {
      'touchstart .sumVectorDisplayObject': 'updateSumReadouts',
      'mousedown  .sumVectorDisplayObject': 'updateSumReadouts'
    },

    initialize: function() {
      this.sumVectorModel = new SumVectorViewModel()
      this.initGraphics();
      this.listenTo(this.model, 'change:sumVectorVisible', this.sumVectorVisible);
      this.listenTo(this.model.vectorCollection, 'add remove', this.sumVectorVisible);
      this.listenTo(this.model.vectorViewModel, 'change', this.updateSum);
      this.listenTo(this.model.vectorCollection, 'change add remove', this.updateSum);
      this.listenTo(this.sumVectorModel, 'change', this.updateSum);
      this.listenTo(this.sumVectorModel, 'change:targetX change:targetY', this.deleteSumVector);

      this.initSumComponents();
    },

    initGraphics: function() {
      this.initSumVector();
    },

    initSumVector: function() {
      this.initSumVectorX();
      this.initSumVectorY();

      this.sumVectorContainer = new PIXI.DisplayObjectContainer();

      this.sumVectorView = new DraggableArrowView({
          model: this.sumVectorModel,
          fillColor: this.model.get('green'),
          bodyDraggingEnabled: true,
          headDraggingEnabled: false,
          snappingEnabled: true,
          snappingXFunction: Constants.SNAPPING_FUNCTION,
          snappingYFunction: Constants.SNAPPING_FUNCTION
      });

      this.sumVectorDisplayObject = this.sumVectorView.displayObject;

      this.sumVectorContainer.addChild(this.sumVectorView.displayObject);
      this.displayObject.addChild(this.sumVectorContainer);
      this.sumVectorContainer.visible = false;

      this.sumVectorModel.set('degrees', this.model.calculateDegrees(this.sumVectorModel.get('originX'), this.sumVectorModel.get('originY')));
      this.sumVectorModel.set('rotation', this.sumVectorView.transformFrame.rotation);
      this.sumVectorModel.set('oldOriginX', this.sumVectorModel.get('originX'));
      this.sumVectorModel.set('oldOriginY', this.sumVectorModel.get('originY'));
      this.sumVectorModel.set('oldTargetX', this.sumVectorModel.get('targetX'));
      this.sumVectorModel.set('oldTargetY', this.sumVectorModel.get('targetY'));
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

    sumVectorVisible: function() {
      if (this.model.get('sumVectorVisible') && this.model.vectorCollection.length > 0) {
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

      this.sumVectorModel.set('degrees', this.model.calculateDegrees(width/10, height/10));
      this.sumVectorModel.set('angle', this.sumVectorView.transformFrame.rotation);
      this.model.updateReadouts(this.sumVectorContainer, this.model, this.sumVectorModel, width, height, length);
      $('label').addClass('green');
    },

    initSumComponents: function() {
      var sumComponentsView = new SumComponentsView({
        model: this.model,
        sumVectorModel: this.sumVectorModel,
        sumVectorXView: this.sumVectorXView.sumVectorXView,
        sumVectorXViewModel: this.sumVectorXView.sumVectorXViewModel,
        sumVectorXContainer: this.sumVectorXView.sumVectorXContainer,

        sumVectorYView: this.sumVectorYView.sumVectorYView,
        sumVectorYViewModel: this.sumVectorYView.sumVectorYViewModel,
        sumVectorYContainer: this.sumVectorYView.sumVectorYContainer
      });

      this.sumComponentsView = sumComponentsView;
      this.displayObject.addChild(this.sumComponentsView.displayObject);
    },

    deleteSumVector: function() {
      var vectorX = this.sumVectorModel.get('targetX');
      var vectorY = this.sumVectorModel.get('targetY');
      var minX = this.model.get('trashCanPositionX');
      var maxX = this.model.get('trashCanPositionX') + this.model.get('trashCanWidth');
      var minY = this.model.get('trashCanPositionY');
      var maxY = this.model.get('trashCanPositionY') + this.model.get('trashCanHeight');

      if (vectorX >= minX && vectorX <= maxX && vectorY >= minY && vectorY <= maxY){
        this.model.set('deleteVector', true);
        this.model.set('sumVectorVisible', false);
        this.sumVectorModel.resetSumOrigins();
        this.model.set('deleteVector', false);
      }
    },

  });

  return SumVectorView;

});
