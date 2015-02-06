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
      this.drawArrow(0, 100 , 1);
      this.listenTo(this.model, 'change:emptyStage', this.clearArrows);
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
          length = Math.sqrt(x * x + y * y),
          degrees = (180/Math.PI) * Math.atan2(y, x);

        if (this.dragging) {
           this.container.x = x;
           this.container.y = y;

          //TODO
          //Vectors.updateComponents();
        }

      }

    },

    dragEnd: function(data) {
      this.dragging = false;
    },

    drawArrow: function(x, y, i) {
      this.container = new PIXI.DisplayObjectContainer();
      var model = this.model,
       canvas = $('.scene-view');

      this.displayObject.x = x;
      this.displayObject.y = y;
      var length = Math.sqrt(x * x + y * y);
      var degrees = (180/Math.PI) * Math.atan2(y, x);

      var arrowHead = new PIXI.Graphics();
      Vectors.drawVectorHead(arrowHead, '0xFF0000', true, true, 'ew-resize');
      this.arrowHead = arrowHead;

      var arrowTail = new PIXI.Graphics();
      Vectors.drawVectorTail(arrowTail, '0xFF0000', true, true, 'move');
      this.arrowTail = arrowTail;

      this.container.addChild(this.arrowHead);
      this.container.addChild(this.arrowTail);
      this.displayObject.addChild(this.container);

      this.container.position.x = 0.8 * canvas.width() + 10 *Math.random() - 5;
      this.container.position.y = 0.25 * canvas.width() + 10 *Math.random() - 5;
      this.container.pivot.set(this.container.width/2, this.container.height);

      nbrVectors.push(this.container);
      this.container.index = nbrVectors.indexOf(this.container);

      this.createArrowsCollection(nbrVectors, x, y,  length, degrees);
      this.model.set('emptyStage', false);
      Vectors.updateFields(model.get('arrows').models[this.container.index], this.model, x, y , length, degrees);

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

    rotate: function(data, e) {
      var model = this.model,
       container = this.container,
       arrowModel = model.get('arrows').models[container.index],
       x = Vectors.roundGrid(data.global.x - this.container.x),
       y = Vectors.roundGrid(data.global.y - this.container.y),
       length = Math.sqrt(x * x + y * y),
       degrees = (180/Math.PI) + Math.atan2(y, x),
       height = length - 0.9 * this.arrowHead.height;

      if (this.transformable) {
        container.rotation = 0;
        this.arrowTail.clear();
        this.arrowTail.beginFill(0xFF0000);
        this.arrowTail.drawRect(6, 20, 8, height);
        container.pivot.set(container.width/2, container.height);
        container.rotation = Math.atan2(y, x);

        Vectors.updateFields(arrowModel, model, x, y , length, degrees);
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


  });

 return ArrowView;

  });
