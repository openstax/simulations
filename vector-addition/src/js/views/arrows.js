define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Simulation = require('models/simulation');
  var DraggableArrowView = require('common/pixi/view/arrow-draggable');
  var Vectors = require('vector-addition');
  var ComponentVectors = require('component-vectors');
  var Constants = require('constants');

  var ArrowView = PixiView.extend({

    events: {
      'click .tailGraphics': 'updateReadouts',
      'click .headGraphics': 'updateReadouts'
    },

    initialize: function() {
      this.arrows = new DraggableArrowView.ArrowViewModel({
          originX: 300,
          originY: 300,
          targetX: 380,
          targetY: 220
      });

      this.initGraphics();
      this.listenTo(this.model, 'change:emptyStage', this.clearArrows);
      this.listenTo(this.arrows, 'change:targetX change:targetY', this.updateReadouts);
      this.listenTo(this.arrows, 'change:targetX change:targetY', this.deleteArrow);
    },

    initGraphics: function() {
      this.drawArrow();
    },

    drawArrow: function() {
      this.arrowView = new DraggableArrowView({
          model: this.arrows
      });

      this.tailGraphics = this.arrowView.tailGraphics;
      this.headGraphics = this.arrowView.headGraphics;

      this.container = new PIXI.DisplayObjectContainer();
      this.container.addChild(this.arrowView.displayObject);
      this.displayObject.addChild(this.container);

      var width = Math.floor(this.container.width);
      var height = Math.floor(this.container.height);

      this.arrows.set('degrees', Vectors.calculateDegrees(this.arrows.get('originX'), this.arrows.get('originY')));
      this.model.set('emptyStage', false);
      Vectors.updateReadouts(this.container, this.model, this.arrows, width, height, this.arrows.get('length'), this.arrows.get('degrees'));
      this.model.arrowCollection.add(this.arrows);
    },

    clearArrows: function() {
      if (this.model.get('emptyStage') == true) {
        this.model.arrowCollection.remove(this.arrows);
        this.displayObject.removeChild(this.container);
      }
    },

    updateStyleComponents: function() {
      Vectors.updateComponents(this.model, this.displayObject, this.vectorX, this.vectorY);
    },

    updateReadouts: function() {
      var arrowModel = this.arrows;
      var width = Math.floor(this.container.width);
      var height = Math.floor(this.container.height);
      var length = arrowModel.get('length');
      var degrees = arrowModel.get('degrees');
      arrowModel.set('degrees', Vectors.calculateDegrees(width, height));
      Vectors.updateReadouts(this.container, this.model, arrowModel, width, height, length, degrees);
      $('label').removeClass('green');
    },

    deleteArrow: function() {
      var arrowX = this.arrows.get('targetX');
      var arrowY = this.arrows.get('targetY');
      var trashCanX = this.model.get('trashCanPositionX');
      var trashCanY = this.model.get('trashCanPositionY');

      if (arrowX >= trashCanX) {
        this.model.set('deleteVector', true);
        this.model.arrowCollection.remove(this.arrows);
        this.displayObject.removeChild(this.container);
        this.model.set('deleteVector', false);
        this.model.set('sumVectorVisible', false);
      }
    }

  });

 return ArrowView;
  });
