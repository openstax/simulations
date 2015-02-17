define(function (require){

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var DraggableArrowView = require('common/pixi/view/arrow-draggable');
  var CommonArrowView = require('common/pixi/view/arrow');
  var SumVectorViewModel = require('models/sum-vector');
  var Vectors = require('vector-addition');
  var ComponentVectors = require('component-vectors');
  var Constants = require('constants');

  var SumVectorView = PixiView.extend({

    events: {
      'click .tailGraphics': 'updateReadouts',
      'click .headGraphics': 'updateReadouts'
    },

    initialize: function() {
      this.sumVectorModel = new SumVectorViewModel();
      this.sumVectorXViewModel = new CommonArrowView.ArrowViewModel({
        originX: 0,
        originY: 0,
        targetX: 0,
        targetY: 0
      });
      this.sumVectorYViewModel = new CommonArrowView.ArrowViewModel({
        originX: 0,
        originY: 0,
        targetX: 0,
        targetY: 0
      });
      this.initGraphics()
      this.listenTo(this.model, 'change:sumVectorVisible', this.sumVectorVisible);
      this.listenTo(this.model.arrowCollection, 'change', this.updateSum);
      this.listenTo(this.sumVectorModel, 'change', this.updateSum);
      this.listenTo(this.sumVectorModel, 'change:targetX change:targetY', this.updateSumVectorX);
      this.listenTo(this.sumVectorModel, 'change:targetX change:targetY', this.updateSumVectorY);
      this.listenTo(this.model, 'change:componentStyles', this.showComponentStyles);
    },

    initGraphics: function() {
      this.sumVector();
    },

    sumVector: function() {
      this.drawSumVectorX();
      this.drawSumVectorY();
      this.sumVectorContainer = new PIXI.DisplayObjectContainer();

      this.sumVectorView = new DraggableArrowView({
          model: this.sumVectorModel,
          fillColor: this.model.get('green'),
          headDraggingEnabled: false,
          bodyDraggingEnabled: false
      });

      this.tailGraphics = this.sumVectorView.tailGraphics;
      this.headGraphics = this.sumVectorView.headGraphics;

      this.sumVectorContainer.addChild(this.sumVectorView.displayObject);
      this.displayObject.addChild(this.sumVectorContainer);
      this.sumVectorContainer.visible = false;
    },

    drawSumVectorX: function() {
      this.sumVectorXView = new CommonArrowView({
          model: this.sumVectorXViewModel,
          fillColor: this.model.get('green')
      });

      this.sumVectorXContainer = new PIXI.DisplayObjectContainer();
      this.sumVectorXContainer.addChild(this.sumVectorXView.displayObject);
      this.displayObject.addChild(this.sumVectorXContainer);
      this.sumVectorXContainer.visible = false;

      var model = this.sumVectorXViewModel;

      model.set('originX', this.sumVectorModel.get('originX'));
      model.set('originY', this.sumVectorModel.get('originY'));
      model.set('targetX', this.sumVectorModel.get('targetX'));
      model.set('targetY', this.sumVectorModel.get('targetY'));
      model.set('oldOriginX', model.get('originX'));
      model.set('oldOriginY', model.get('originY'));
      model.set('rotation', 0);
    },

    updateSumVectorX: function() {
      var model = this.sumVectorXViewModel;
      var vectorModel = this.sumVectorModel;
      var angle = this.sumVectorModel.get('angle');
      var theta = this.model.get('thetaText');
      ComponentVectors.showVectors(theta, this.sumVectorXContainer, this.sumVectorYContainer);

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
    },

    drawSumVectorY: function() {
      this.sumVectorYView = new CommonArrowView({
          model: this.sumVectorYViewModel,
          fillColor: this.model.get('green')
      });

      this.sumVectorYContainer = new PIXI.DisplayObjectContainer();
      this.sumVectorYContainer.addChild(this.sumVectorYView.displayObject);
      this.displayObject.addChild(this.sumVectorYContainer);
      this.sumVectorYContainer.visible = false;

      var model = this.sumVectorYViewModel;

      model.set('originX', this.sumVectorModel.get('originX'));
      model.set('originY', this.sumVectorModel.get('originY'));
      model.set('targetX', this.sumVectorModel.get('targetX'));
      model.set('targetY', this.sumVectorModel.get('targetY'));
      model.set('oldOriginX', model.get('originX'));
      model.set('oldOriginY', model.get('originY'));
      model.set('rotation', Constants.VECTOR_Y_ROTATION);
    },

    updateSumVectorY: function() {
      var model = this.sumVectorYViewModel;
      var vectorModel = this.sumVectorModel;
      var angle = vectorModel.get('angle');
      var theta = this.model.get('thetaText');
      ComponentVectors.showVectors(theta, this.sumVectorXContainer, this.sumVectorYContainer);

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
      ComponentVectors.showComponentStyles(this.sumVectorXViewModel, this.sumVectorYViewModel, this.sumVectorModel, this.model, this.sumVectorXContainer, this.sumVectorYContainer, this.sumVectorYView, this.sumVectorXView);
    },

    sumVectorVisible: function() {
      this.updateSum();
      if (this.model.get('sumVectorVisible') && this.model.arrowCollection.length > 0) {
        this.sumVectorContainer.visible = true;
        if (this.model.get('componentStyles') !== 0) {
          this.sumVectorXContainer.visible = true;
          this.sumVectorYContainer.visible = true;
        }

      }
      else {
        this.sumVectorContainer.visible = false;
        this.sumVectorXContainer.visible = false;
        this.sumVectorYContainer.visible = false;
      }
    },

    updateSum: function() {
      Vectors.sum(this.model, this.sumVectorModel, this.sumVectorContainer, this.sumVectorView);
    },

    updateReadouts: function() {
      var width = this.sumVectorContainer.width;
      var height = this.sumVectorContainer.height;
      var length = this.sumVectorModel.get('length');
      var degrees = this.sumVectorModel.get('degrees');
      Vectors.updateReadouts(this.sumVectorContainer, this.model, this.sumVectorModel, width, height, length, degrees);
      $('label').addClass('green');
    },

    showComponentStyles: function() {
      if (this.model.get('sumVectorVisible')) {
        ComponentVectors.showComponentStyles(this.sumVectorXViewModel, this.sumVectorYViewModel, this.sumVectorModel, this.model, this.sumVectorXContainer, this.sumVectorYContainer, this.sumVectorYView, this.sumVectorXView);
      }
    }

  });

  return SumVectorView;

});
