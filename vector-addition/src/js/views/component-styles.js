define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Simulation = require('models/simulation');
  var Constants = require('constants');

  var ComponentsStyles = PixiView.extend({

    initialize: function(options) {
      this.model = options.model;
      this.vectorViewModel = options.vectorViewModel;
      this.sumVectorModel = options.sumVectorModel;

      this.vectorXViewModel = options.vectorXViewModel;
      this.vectorYViewModel = options.vectorYViewModel;
      this.vectorXContainer = options.vectorXContainer;
      this.vectorYContainer = options.vectorYContainer;
      this.vectorXView = options.vectorXView;
      this.vectorYView = options.vectorYView;

      this.sumVectorXContainer = options.sumVectorXContainer;
      this.sumVectorXView = options.sumVectorXView;
      this.sumVectorXModel = options.sumVectorXViewModel;

      this.sumVectorYContainer = options.sumVectorYContainer;
      this.sumVectorYView = options.sumVectorYView;
      this.sumVectorYModel = options.sumVectorYViewModel;

      this.listenTo(this.model, 'change:componentStyles', this.showComponentStyles);
      this.listenTo(this.vectorViewModel, 'change:targetY change:targetX', this.showComponentStyles);
    },

    showComponentStyles: function() {
      var arrowModel = this.vectorViewModel;
      var sumVectorModel = this.sumVectorModel;

      var vectorYModel = this.vectorYViewModel;
      var vectorYView = this.vectorYView;
      var vectorYContainer = this.vectorYContainer;

      var vectorXModel = this.vectorXViewModel;
      var vectorXView = this.vectorXView;
      var vectorXContainer = this.vectorXContainer;

      var sumVectorXModel = this.sumVectorXModel;
      var sumVectorXView = this.sumVectorXView;
      var sumVectorXContainer = this.sumVectorXContainer;

      var sumVectorYModel = this.sumVectorYModel;
      var sumVectorYView = this.sumVectorYView;
      var sumVectorYContainer = this.sumVectorYContainer;

      var canvas = $('.scene-view');
      var xOffset = canvas.height() - Constants.X_OFFSET;
      var yOffset = canvas.width() - Constants.Y_OFFSET;

      this.resetOrigins(vectorXModel);
      this.resetOrigins(vectorYModel);
      this.clearComponentLines();

      if (this.model.get('componentStyles') == 0) {
        vectorXContainer.visible = false;
        vectorYContainer.visible = false;
      }
      else {
        vectorXContainer.visible = true;
        vectorYContainer.visible = true;

        if (this.model.get('sumVectorVisible')) {
          sumVectorXContainer = true;
          sumVectorYContainer = true;
        }
      }

      if (this.model.get('componentStyles') == 1) {
        vectorXView.transformFrame.rotation = vectorXModel.get('rotation');
        vectorYView.transformFrame.rotation = vectorYModel.get('rotation');

        if (this.model.get('sumVectorVisible')) {

          sumVectorXView.transformFrame.rotation = vectorXModel.get('rotation');
          sumVectorYView.transformFrame.rotation = vectorYModel.get('rotation');
          this.sumVectorXContainer.visible = true;
          this.sumVectorYContainer.visible = true;
        }
      }

      if (this.model.get('componentStyles') == 2) {
        vectorYModel.set('originX', arrowModel.get('targetX'));
        vectorYModel.set('targetX', arrowModel.get('targetX'));
        vectorXModel.set('originX', arrowModel.get('originX'));
        vectorXModel.set('originY', arrowModel.get('originY'));
        vectorXModel.set('targetX', arrowModel.get('targetX'));
        vectorXModel.set('targetY', arrowModel.get('targetY'));
        vectorXView.transformFrame.rotation = vectorXModel.get('rotation');

        if (this.model.get('sumVectorVisible')) {
          sumVectorYModel.set('originX', sumVectorModel.get('targetX'));
          sumVectorYModel.set('targetX', sumVectorModel.get('targetX'));
          sumVectorXModel.set('originX', sumVectorModel.get('originX'));
          sumVectorXModel.set('originY', sumVectorModel.get('originY'));
          sumVectorXModel.set('targetX', sumVectorModel.get('targetX'));
          sumVectorXModel.set('targetY', sumVectorModel.get('targetY'));
          sumVectorXView.transformFrame.rotation = vectorXModel.get('rotation');
        }
      }

      if (this.model.get('componentStyles') == 3) {
        this.clearComponentLines();
        vectorXModel.set('originX', arrowModel.get('originX'));
        vectorXModel.set('originY', xOffset);
        vectorXModel.set('targetX', arrowModel.get('targetX'));
        vectorXModel.set('targetY', xOffset);

        vectorYModel.set('originX', yOffset);
        vectorYModel.set('originY', arrowModel.get('originY'));
        vectorYModel.set('targetX', yOffset);
        vectorYModel.set('targetY', arrowModel.get('targetY'));

        this.drawComponentLines(vectorYModel, arrowModel, vectorXModel);

        if (this.model.get('sumVectorVisible')) {
          this.clearComponentLines();
          sumVectorXModel.set('originX', sumVectorModel.get('originX'));
          sumVectorXModel.set('originY', xOffset);
          sumVectorXModel.set('targetX', sumVectorModel.get('targetX'));
          sumVectorXModel.set('targetY', xOffset);

          sumVectorYModel.set('originX', yOffset);
          sumVectorYModel.set('originY', sumVectorModel.get('originY'));
          sumVectorYModel.set('targetX', yOffset);
          sumVectorYModel.set('targetY', sumVectorModel.get('targetY'));

          this.drawComponentLines(sumVectorYModel, sumVectorModel, sumVectorXModel);
        }
      }
    },

    resetOrigins: function(vectorModel) {
      vectorModel.set('originX', vectorModel.get('oldOriginX'));
      vectorModel.set('originY', vectorModel.get('oldOriginY'));
    },

    drawComponentLines: function(vectorYModel, vectorModel, vectorXModel) {
      this.linesContainer = new PIXI.DisplayObjectContainer();

      var lines = new PIXI.Graphics();
      lines.lineStyle(1, 0xFFA500, 1);
      lines.moveTo(vectorYModel.get('originX'), vectorYModel.get('originY'));
      lines.lineTo(vectorModel.get('originX'), vectorModel.get('originY'));
      lines.lineTo(vectorXModel.get('originX'), vectorXModel.get('originY'));
      lines.lineTo(vectorXModel.get('targetX'), vectorXModel.get('targetY'));
      lines.lineTo(vectorModel.get('targetX'), vectorModel.get('targetY'));
      lines.lineTo(vectorYModel.get('targetX'), vectorYModel.get('targetY'));
      this.lines = lines;

      this.linesContainer.addChild(this.lines);
      this.displayObject.addChild(this.linesContainer);
    },

    clearComponentLines: function() {
      if (this.lines !== undefined) {
        this.lines.clear();
      }
    }

  });

  return ComponentsStyles;


});
