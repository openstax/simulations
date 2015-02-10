define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Vectors = require('vector-addition');
  var Simulation = require('models/simulation');
  var ArrowsModel = require('models/arrows');
  var ArrowsCollection = require('collections/arrows');
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
      this.drawArrow(0, 100);
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
      var model = this.model,
       canvas = $('.scene-view'),
       positionX = 0.8 * canvas.width() + 10 *Math.random() - 5,
       positionY = 0.25 * canvas.height() + 10 *Math.random() - 5,
       length = Math.sqrt(x * x + y * y),
       degrees = (180/Math.PI) * Math.atan2(y, x);

      this.displayObject.x = x;
      this.displayObject.y = y;

      this.arrowContainer = new PIXI.DisplayObjectContainer();

      var arrowHead = new PIXI.Graphics();
      Vectors.drawVectorHead(arrowHead, '0xFF0000', true, true, 'ew-resize');
      this.arrowHead = arrowHead;

      var arrowTail = new PIXI.Graphics();
      Vectors.drawVectorTail(arrowTail, '0xFF0000', length - this.arrowHead.height, true, true, 'move');
      this.arrowTail = arrowTail;

      //Add Component Vectors
      var vectorX = this.drawVectorX(length, this.arrowHead, this.container);
      var vectorY = this.drawVectorY(length, this.arrowHead, this.container);
      this.vectorX = vectorX;
      this.vectorY = vectorY;
      this.container.addChild(this.vectorX);
      this.container.addChild(this.vectorY);

      this.arrowContainer.addChild(this.arrowHead);
      this.arrowContainer.addChild(this.arrowTail);
      this.container.addChild(this.arrowContainer);
      this.displayObject.addChild(this.container);

      this.container.position.x = positionX;
      this.container.position.y = positionY;
      this.container.pivot.set(this.container.width/2, this.container.height/2);
      this.arrowContainer.pivot.set(this.arrowHead.width/2, this.container.height);
      this.vectorX.pivot.set(this.vectorHeadX.width/2, this.vectorX.height);
      this.vectorY.pivot.set(this.vectorHeadY.width/2, this.vectorY.height);

      nbrVectors.push(this.container);
      this.container.index = nbrVectors.indexOf(this.container);

      this.createArrowsCollection(nbrVectors, x, y,  length, degrees);
      this.model.set('emptyStage', false);
      Vectors.updateReadouts(model.get('arrows').models[this.container.index], model, x, y , length, degrees);
    },

    drawVectorX: function(length, arrowHead, container) {
      this.vectorX = new PIXI.DisplayObjectContainer();

      var vectorHeadX = new PIXI.Graphics();
      Vectors.drawVectorHead(vectorHeadX, '0xFFE1F0', true, true);
      this.vectorHeadX = vectorHeadX;

      var vectorTailX = new PIXI.Graphics();
      Vectors.drawVectorTail(vectorTailX, '0xFFE1F0', length, true, true);
      this.vectorTailX = vectorTailX;

      this.vectorX.addChild(vectorHeadX);
      this.vectorX.addChild(vectorTailX);
      this.vectorX.visible = false;

      return this.vectorX;
    },

    drawVectorY: function(length, arrowHead, container) {
      this.vectorY = new PIXI.DisplayObjectContainer();

      var vectorHeadY = new PIXI.Graphics();
      Vectors.drawVectorHead(vectorHeadY, '0xFFE1F0', true, true);
      this.vectorHeadY = vectorHeadY;

      var vectorTailY = new PIXI.Graphics();
      Vectors.drawVectorTail(vectorTailY, '0xFFE1F0', length - this.arrowHead.height, true, true);
      this.vectorTailY = vectorTailY;

      this.vectorY.addChild(vectorHeadY);
      this.vectorY.addChild(vectorTailY);
      this.vectorY.visible = false;

      return this.vectorY;
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
       container = this.container,
       arrowModel = model.get('arrows').models[container.index],
       x = Vectors.roundGrid(data.global.x - this.container.x),
       y = Vectors.roundGrid(data.global.y - this.container.y),
       length = Math.sqrt(x * x + y * y),
       degrees = (180/Math.PI) * Math.atan2(y, x),
       height = length - 0.9 * this.arrowHead.height;

      if (this.transformable) {
        this.displayObject.x = 0//Vectors.round0(x/10);
        this.displayObject.y = 100//-Vectors.round0(y/10);

        this.arrowContainer.rotation = 0;
        this.arrowTail.clear();
        this.arrowTail.beginFill(0xFF0000);
        this.arrowTail.drawRect(6, 20, 8, height);
        this.arrowContainer.pivot.set(this.arrowHead.width/2, length);
        this.arrowContainer.rotation = Math.atan2(y, x) + 180/Math.PI *2 + .09;

        //this.updateVector(this.vectorTailX, '0xFFE1F0', height);
        //this.updateVector(this.vectorTailY, '0xFFE1F0', height);


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

    updateVector: function(vector, fillColor, height) {
      vector.clear();
      vector.beginFill(fillColor);
      vector.drawRect(6, 20, 8, height);
    }

  });

 return ArrowView;
  });
