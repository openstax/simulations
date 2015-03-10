define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Simulation = require('models/simulation');
  var Constants = require('constants');

  var ComponentsView = PixiView.extend({

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
      this.listenTo(this.model.vectorCollection, 'add remove', this.showComponentStyles);
      this.listenTo(this.vectorViewModel, 'change:targetY change:targetX', this.showComponentStyles);
    },

    showComponentStyles: function() {
      var canvas = $('.scene-view');
      var xOffset = canvas.height() - Constants.X_OFFSET;
      var yOffset = canvas.width() - Constants.Y_OFFSET;

      this.model.resetOrigins(this.vectorXViewModel);
      this.model.resetOrigins(this.vectorYViewModel);
      this.model.clearComponentLines(this.lines);

      if (this.model.get('componentStyles') == 0) {
        this.vectorXContainer.visible = false;
        this.vectorYContainer.visible = false;
      }
      else {
        this.vectorXContainer.visible = true;
        this.vectorYContainer.visible = true;
      }

      var dx = this.vectorViewModel.get('targetX') - this.vectorViewModel.get('originX');
      var dy = this.vectorViewModel.get('targetY') - this.vectorViewModel.get('originY');

      if (this.model.get('componentStyles') == 1) {
        this.vectorXViewModel.set('originX', this.vectorViewModel.get('originX'));
        this.vectorXViewModel.set('originY', this.vectorViewModel.get('originY'));
        this.vectorXViewModel.set('targetX', this.vectorViewModel.get('originX') + dx);
        this.vectorXViewModel.set('targetY', this.vectorViewModel.get('originY'));

        this.vectorYViewModel.set('originX', this.vectorViewModel.get('originX'));
        this.vectorYViewModel.set('originY', this.vectorViewModel.get('originY'));
        this.vectorYViewModel.set('targetX', this.vectorViewModel.get('originX'));
        this.vectorYViewModel.set('targetY', this.vectorViewModel.get('originY') + dy);
      }

      if (this.model.get('componentStyles') == 2) {
        this.vectorXViewModel.set('originX', this.vectorViewModel.get('originX'));
        this.vectorXViewModel.set('originY', this.vectorViewModel.get('originY'));
        this.vectorXViewModel.set('targetX', this.vectorViewModel.get('originX') + dx);
        this.vectorXViewModel.set('targetY', this.vectorViewModel.get('originY'));

        this.vectorYViewModel.set('originX', this.vectorViewModel.get('targetX'));
        this.vectorYViewModel.set('originY', this.vectorViewModel.get('originY'));
        this.vectorYViewModel.set('targetX', this.vectorViewModel.get('targetX'));
        this.vectorYViewModel.set('targetY', this.vectorViewModel.get('targetY'));
      }

      if (this.model.get('componentStyles') == 3) {
        this.model.clearComponentLines(this.lines);
        this.vectorXViewModel.set('originX', this.vectorViewModel.get('originX'));
        this.vectorXViewModel.set('originY', xOffset);
        this.vectorXViewModel.set('targetX', this.vectorViewModel.get('targetX'));
        this.vectorXViewModel.set('targetY', xOffset);

        this.vectorYViewModel.set('originX', yOffset);
        this.vectorYViewModel.set('originY', this.vectorViewModel.get('originY'));
        this.vectorYViewModel.set('targetX', yOffset);
        this.vectorYViewModel.set('targetY', this.vectorViewModel.get('targetY'));

        this.drawComponentLines(this.vectorYViewModel, this.vectorViewModel, this.vectorXViewModel);
      }
    },

    drawComponentLines: function(vectorYModel, vectorModel, vectorXModel) {
      this.linesContainer = new PIXI.DisplayObjectContainer();

      var lines = new PIXI.Graphics();
      lines.lineStyle(1, this.model.get('darkOrange'), 1);
      lines.moveTo(vectorYModel.get('originX'), vectorYModel.get('originY'));
      lines.lineTo(vectorModel.get('originX'), vectorModel.get('originY'));
      lines.lineTo(vectorXModel.get('originX'), vectorXModel.get('originY'));
      lines.lineTo(vectorXModel.get('targetX'), vectorXModel.get('targetY'));
      lines.lineTo(vectorModel.get('targetX'), vectorModel.get('targetY'));
      lines.lineTo(vectorYModel.get('targetX'), vectorYModel.get('targetY'));
      this.lines = lines;

      this.linesContainer.addChild(this.lines);
      this.displayObject.addChild(this.linesContainer);
    }
  });

  return ComponentsView;

});
