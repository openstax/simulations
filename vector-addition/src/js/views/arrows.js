define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Vectors = require('vector-addition');
  var ComponentVectors = require('component-vectors');
  var Simulation = require('models/simulation');
  var ArrowsModel = require('models/arrows');
  var ArrowsCollection = require('collections/arrows');
  var Constants = require('constants');
  var nbrVectors = [];

  var ArrowView = PixiView.extend({

    events: {
      'click .arrowHead': 'vectorReadouts',
      'mousedown .arrowHead': 'rotateStart',
      'mousemove .arrowHead': 'rotate',
      'touchmove .arrowHead': 'rotate',
      'mouseup .arrowHead': 'rotateEnd',
      'mouseupoutside .arrowHead': 'rotateEnd',
      'touchend .arrowHead': 'rotateEnd',
      'touchendoutside .arrowHead': 'rotateEnd',

      'click .arrowTail': 'vectorReadouts',
      'mousedown .arrowTail': 'dragStart',
      'mousemove .arrowTail': 'dragMove',
      'touchmove .arrowTail': 'dragMove',
      'mouseup .arrowTail': 'dragEnd',
      'mouseupoutside .arrowTail': 'dragEnd',
      'touchend .arrowTail': 'dragEnd',
      'touchendoutside .arrowTail': 'dragEnd'
    },

    initialize: function() {
      this.drawArrow(0, -100);
      this.listenTo(this.model, 'change:emptyStage', this.clearArrows);
      this.listenTo(this.model, 'change:componentStyles', this.updateStyleComponents);
    },

    dragStart: function(data) {
      data.originalEvent.preventDefault();
      this.data = data;
      this.dragging = true;
    },

    dragMove: function(data) {
      if (this.model.get('arrows') !== undefined) {
        var x = Vectors.roundGrid(data.global.x - this.displayObject.x),
            y = Vectors.roundGrid(data.global.y - this.displayObject.y),
            arrows = this.model.get('arrows');

        if (this.dragging) {
           this.container.x = x;
           this.container.y = y;

           if (this.container.x >= this.model.get('trashCanPositionX') || this.container.y >= this.model.get('trashCanPositionY')) {
             this.model.set('deleteVector', true);
           }
           else {
             this.model.set('deleteVector', false);
           }

           Vectors.updateComponents(this.model, this.displayObject, this.vectorX, this.vectorY);
        }
      }
    },

    dragEnd: function(data) {
      this.dragging = false;
      if (this.container.position.x >= this.model.get('trashCanPositionX') || this.container.position.y >= this.model.get('trashCanPositionY')) {
        if (this.model.set('deleteVector', true)) {
          Vectors.deleteArrow(this.model, this.container);
          this.displayObject.removeChild(this.container);
          this.model.set('deleteVector', false);
        }
      }
    },

    drawArrow: function(x, y) {
      this.container = new PIXI.DisplayObjectContainer();

      var length = Vectors.calculateLength(x, y);
      var degrees = Vectors.calculateDegrees(x, y);

      this.displayObject.x = x;
      this.displayObject.y = y;

      this.arrowContainer = new PIXI.DisplayObjectContainer();

      var arrowHead = new PIXI.Graphics();
      Vectors.drawVectorHead(arrowHead, this.model.get('red'), true, true, 'ew-resize');
      this.arrowHead = arrowHead;

      var arrowTail = new PIXI.Graphics();
      Vectors.drawVectorTail(arrowTail, this.model.get('red'), length - this.arrowHead.height, true, true, 'move');
      this.arrowTail = arrowTail;

      var vectorX = ComponentVectors.drawVectorX(this.model, length - this.arrowHead.height, this.arrowHead, this.container);
      var vectorY = ComponentVectors.drawVectorY(this.model, length - this.arrowHead.height, this.arrowHead, this.container, this.arrowHead.height);

      this.vectorX = vectorX;
      this.vectorY = vectorY;
      this.container.addChild(this.vectorX);
      this.container.addChild(this.vectorY);

      this.arrowContainer.addChild(this.arrowHead);
      this.arrowContainer.addChild(this.arrowTail);
      this.container.addChild(this.arrowContainer);
      this.displayObject.addChild(this.container);

      this.container.position.x = 0.8 * $('.scene-view').width() + 10 *Math.random() - 5;
      this.container.position.y = 0.50 * $('.scene-view').height() + 10 *Math.random() - 5;

      this.arrowContainer.pivot.set(this.container.width/2, this.container.height);
      this.vectorX.pivot.set(this.arrowContainer.width/2, this.arrowContainer.height);
      this.vectorY.pivot.set(this.arrowContainer.width/2, this.arrowContainer.height);

      nbrVectors.push(this.container);
      this.container.index = nbrVectors.indexOf(this.container);

      this.createArrowsCollection(nbrVectors, x, y,  length, degrees);
      this.model.set('emptyStage', false);
      Vectors.updateReadouts(this.model.get('arrows').models[this.container.index], this.model, x, -y , length, -degrees);
    },

    createArrowsCollection: function(nbrVectors, x, y, length, degrees) {
      var arrows = new ArrowsCollection();
      _.each(nbrVectors, function(vector) {
        var arrow = new Backbone.Model({'x': x,'y': y,'length': length,'degrees': degrees});
        arrows.add(arrow);
      });
      this.model.set('arrows', arrows);
    },

    rotateStart: function(data) {
      this.transformable = true;
      this.data = data;
    },

    rotate: function(data) {
      var model = this.model,
       arrowModel = model.get('arrows').models[this.container.index],
       x = Vectors.roundGrid(data.global.x - this.container.x),
       y = Vectors.roundGrid(data.global.y - this.container.y),
       length = Math.sqrt(x * x + y * y),
       degrees = (180/Math.PI) * Math.atan2(y, x),
       height = length - this.arrowHead.height,
       angle = Math.atan2(y, x) + 180/Math.PI *2;

      if (this.transformable) {
        this.displayObject.x = Vectors.round0(x/10);
        this.displayObject.y = Vectors.round0(y/10);

        this.arrowContainer.rotation = 0;
        this.arrowTail.clear();
        this.arrowTail.beginFill(model.get('red'));
        this.arrowTail.drawRect(6, 20, 8, height);
        this.arrowContainer.pivot.set(this.arrowHead.width/2, length);
        this.arrowContainer.rotation = angle;

        ComponentVectors.updateVectorX(model, this.vectorX.children[1], this.model.get('pink'), x);
        ComponentVectors.updateVectorY(model, this.vectorY.children[1], this.model.get('pink'), y);
        this.vectorX.pivot.set(this.arrowContainer.width/2, this.vectorX.height);
        this.vectorY.pivot.set(this.arrowContainer.width/2, this.vectorY.height);

        Vectors.updateReadouts(arrowModel, model, x, -y, length, -degrees);
        Vectors.updateComponents(this.model, this.displayObject, this.vectorX, this.vectorY);
      }
    },

    rotateEnd: function(data) {
      this.transformable = false;
    },

    vectorReadouts: function() {
      var model = this.model;
      var arrowModel = this.model.get('arrows').models[this.container.index];
      var x = arrowModel.get('x');
      var y = arrowModel.get('y');
      var length = arrowModel.get('length');
      var degrees = arrowModel.get('degrees');

      model.set('rText', Vectors.padZero(Vectors.round1(length/10)));
      model.set('thetaText', Vectors.padZero(Vectors.round1(degrees)));
      model.set('rXText', Vectors.round0(x/10));
      model.set('rYText', Vectors.round0(y/10));

      $('label').removeClass('green');
    },

    clearArrows: function() {
      if (this.model.get('emptyStage') == true) {
        var arrowsCollection = this.model.get('arrows');
        var arrowsToRemove = arrowsCollection.slice(0);
        arrowsCollection.remove(arrowsToRemove);
        this.displayObject.removeChild(this.container);
        nbrVectors.length = 0;
      }
    },

    updateStyleComponents: function() {
      Vectors.updateComponents(this.model, this.displayObject, this.vectorX, this.vectorY);
    },

  });

 return ArrowView;
  });
