define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Simulation = require('models/simulation');
  var Constants = require('constants');

  var SumComponentsStyles = PixiView.extend({

    initialize: function(options) {
      this.model = options.model;
      this.vectorViewModel = options.vectorViewModel;
      this.sumVectorModel = options.sumVectorModel;

      this.sumVectorXContainer = options.sumVectorXContainer;
      this.sumVectorXView = options.sumVectorXView;
      this.sumVectorXModel = options.sumVectorXViewModel;

      this.sumVectorYContainer = options.sumVectorYContainer;
      this.sumVectorYView = options.sumVectorYView;
      this.sumVectorYModel = options.sumVectorYViewModel;

      this.listenTo(this.model, 'change:componentStyles', this.showComponentStyles);
      this.listenTo(this.model, 'change:componentStyles', this.clearSumVectorXandYComponents);
      this.listenTo(this.model, 'change:emptyStage', this.clearSumVectorXandYComponents);
      this.listenTo(this.model, 'change:sumVectorVisible', this.showComponentStyles);
      this.listenTo(this.model.vectorCollection, 'add remove', this.showComponentStyles);
      this.listenTo(this.sumVectorModel, 'change:targetX change:targetY', this.showComponentStyles);
    },

    showComponentStyles: function() {
      var canvas = $('.scene-view');
      var xOffset = canvas.height() - Constants.X_OFFSET;
      var yOffset = canvas.width() - Constants.Y_OFFSET;

      this.model.resetOrigins(this.sumVectorXModel);
      this.model.resetOrigins(this.sumVectorYModel);
      this.model.clearComponentLines(this.sumLines);

      if (this.model.get('sumVectorVisible') && this.model.vectorCollection.length > 0) {
        if (this.model.get('componentStyles') == 0) {
          this.sumVectorXContainer.visible = false;
          this.sumVectorYContainer.visible = false;
        }
        else {
          this.sumVectorXContainer.visible = true;
          this.sumVectorYContainer.visible = true;
        }

        if (this.model.get('componentStyles') == 1 && this.model.get('sumVectorVisible')) {
          this.sumVectorXView.transformFrame.rotation = this.sumVectorXModel.get('rotation');
          this.sumVectorYView.transformFrame.rotation = this.sumVectorYModel.get('rotation');
          this.sumVectorXContainer.visible = true;
          this.sumVectorYContainer.visible = true;
        }

        if (this.model.get('componentStyles') == 2 && this.model.get('sumVectorVisible')) {
          this.sumVectorYModel.set('originX', this.sumVectorModel.get('targetX'));
          this.sumVectorYModel.set('targetX', this.sumVectorModel.get('targetX'));
          this.sumVectorXModel.set('originX', this.sumVectorModel.get('originX'));
          this.sumVectorXModel.set('originY', this.sumVectorModel.get('originY'));
          this.sumVectorXModel.set('targetX', this.sumVectorModel.get('targetX'));
          this.sumVectorXModel.set('targetY', this.sumVectorModel.get('targetY'));
          this.sumVectorXView.transformFrame.rotation = this.sumVectorXModel.get('rotation');
        }

        if (this.model.get('componentStyles') == 3 && this.model.get('sumVectorVisible')) {
          this.model.clearComponentLines(this.sumLines);
          this.sumVectorXModel.set('originX', this.sumVectorModel.get('originX'));
          this.sumVectorXModel.set('originY', xOffset);
          this.sumVectorXModel.set('targetX', this.sumVectorModel.get('targetX'));
          this.sumVectorXModel.set('targetY', xOffset);

          this.sumVectorYModel.set('originX', yOffset);
          this.sumVectorYModel.set('originY', this.sumVectorModel.get('originY'));
          this.sumVectorYModel.set('targetX', yOffset);
          this.sumVectorYModel.set('targetY', this.sumVectorModel.get('targetY'));

          this.drawComponentLines(this.sumVectorYModel, this.sumVectorModel, this.sumVectorXModel);
        }
      }

      else {
        this.sumVectorXContainer.visible = false;
        this.sumVectorYContainer.visible = false;
      }
    },

    drawComponentLines: function(vectorYModel, vectorModel, vectorXModel) {
      this.sumLinesContainer = new PIXI.DisplayObjectContainer();

      var sumLines = new PIXI.Graphics();
      sumLines.lineStyle(1, this.model.get('darkOrange'), 1);
      sumLines.moveTo(vectorYModel.get('originX'), vectorYModel.get('originY'));
      sumLines.lineTo(vectorModel.get('originX'), vectorModel.get('originY'));
      sumLines.lineTo(vectorXModel.get('originX'), vectorXModel.get('originY'));
      sumLines.lineTo(vectorXModel.get('targetX'), vectorXModel.get('targetY'));
      sumLines.lineTo(vectorModel.get('targetX'), vectorModel.get('targetY'));
      sumLines.lineTo(vectorYModel.get('targetX'), vectorYModel.get('targetY'));
      this.sumLines = sumLines;

      this.sumLinesContainer.addChild(this.sumLines);
      this.displayObject.addChild(this.sumLinesContainer);
    },

    clearSumVectorXandYComponents: function() {
      if (this.model.get('emptyStage')) {
        this.sumVectorXContainer.visible = false;
        this.sumVectorYContainer.visible = false;
        if (this.sumLines !== undefined) {
          this.displayObject.removeChild(this.sumLinesContainer);
        }
      }
    }

  });

  return SumComponentsStyles;


});
