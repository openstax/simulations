define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Vectors = require('vector-addition');
  var Simulation = require('models/simulation');
  var ArrowsCollection = require('collections/arrows');
  var ArrowsModel = require('models/arrows');

  var nbrVectors = [];

  var ArrowView = PixiView.extend({

    events: {
      'click .arrowHead': 'updateReadouts',
      'mousedown .arrowHead': 'rotateStart',
      'mousemove .arrowHead': 'rotate',
      'touchmove .arrowHead': 'rotate',
      'mouseup .arrowHead': 'rotateEnd',
      'mouseupoutside .arrowHead': 'rotateEnd',
      'touchend .arrowHead': 'rotateEnd',
      'touchendoutside .arrowHead': 'rotateEnd',

      'click .arrowTail': 'updateReadouts',
      'mousedown .arrowTail': 'dragStart',
      'mousemove .arrowTail': 'dragMove',
      'touchmove .arrowTail': 'dragMove',
      'mouseup .arrowTail': 'dragEnd',
      'mouseupoutside .arrowTail': 'dragEnd',
      'touchend .arrowTail': 'dragEnd',
      'touchendoutside .arrowTail': 'dragEnd'
    },

    initialize: function() {
      this.drawArrow();
      this.listenTo(this.model, 'change:emptyStage', this.clearAll)
      this.listenTo(this.model, 'change:arrows.rText change:arrows.thetaText change:arrows.rXText change:arrows.rYText', this.updateReadouts);
    },

    dragStart: function(data) {
      data.originalEvent.preventDefault();
      this.data = data;
      this.dragging = true;
    },

    dragMove: function(data) {
      var model = this.model,
      container = this.container,
      arrowModel = model.get('arrows').models[container.index],
      xCoord = data.global.x - this.displayObject.x,
      yCoord = data.global.y - this.displayObject.y,
      x = Vectors.roundGrid(xCoord),
      y = Vectors.roundGrid(yCoord),
      length = Math.sqrt(x*x+y*y),
      degrees = (180/Math.PI) * Math.atan2(y, x);

      if (this.dragging) {
        this.container.position.x = x;
        this.container.position.y = y;

        Vectors.updateFields(arrowModel, model, x, y , length, degrees);

        //TODO
        //Vectors.updateComponents();
      }

    },

    dragEnd: function(data) {
      this.dragging = false;
    },

    drawArrow: function() {
      this.container = new PIXI.DisplayObjectContainer();
      var canvas = $('.scene-view');

      var arrowHead = new PIXI.Graphics();
      arrowHead.beginFill(0xFF0000);
      arrowHead.moveTo(0, 40);
      arrowHead.lineTo(10, 0);
      arrowHead.lineTo(20, 40);
      arrowHead.endFill();
      arrowHead.interactive = true;
      arrowHead.buttonMode = true;
      arrowHead.defaultCursor = 'ew-resize';
      this.arrowHead = arrowHead;

      var arrowTail = new PIXI.Graphics();
      arrowTail.beginFill(0xFF0000);
      arrowTail.drawRect(6, 40, 8, 60);
      arrowTail.interactive = true;
      arrowTail.buttonMode = true;
      arrowTail.defaultCursor = 'move';
      this.arrowTail = arrowTail;

      this.container.addChild(this.arrowHead);
      this.container.addChild(this.arrowTail);
      this.displayObject.addChild(this.container);

      this.container.position.x = 0.8 * canvas.width() + 10 *Math.random() - 5;
      this.container.position.y = 0.25 * canvas.width() + 10 *Math.random() - 5;
      this.container.pivot.set(this.container.width/2, this.container.height);
      nbrVectors.push(this.container);
      this.container.index = nbrVectors.indexOf(this.container);

      this.setValues();
    },

    setValues: function() {
      var model = this.model,
       container = this.container,
       vectors = nbrVectors,
       x = Vectors.roundGrid(container.x),
       y = Vectors.roundGrid(container.y),
       length = Math.sqrt(x*x+y*y),
       degrees = (180/Math.PI) + Math.atan2(y, x),
       height = length - 0.2 * this.arrowHead.height,
       index = vectors.indexOf(container),
       arrows = new ArrowsCollection();

      _.each(vectors, function(vector) {
        var arrow = new Backbone.Model({
          'x': x,
          'y': y,
          'width': vector.width,
          'height': vector.height,
          'length': length,
          'degrees': degrees
          });

          arrows.add(arrow);
      });

      this.model.set('arrows', arrows);
      this.model.set('emptyStage', false);

      Vectors.updateFields(model.get('arrows').models[container.index], model, x, y , length, degrees);
    },

    rotateStart: function(data) {
      this.transformable = true;
      this.data = data;
    },

    rotate: function(data, e) {
      var model = this.model,
       container = this.container,
       arrowModel = model.get('arrows').models[container.index],
       xCoord = data.global.x - container.x,
       yCoord = data.global.y - container.y,
       x = Vectors.roundGrid(xCoord),
       y = Vectors.roundGrid(yCoord),
       length = Math.sqrt(x*x+y*y),
       degrees = (180/Math.PI) + Math.atan2(y, x),
       height = length - 0.2 * this.arrowHead.height;

      if (this.transformable) {
        container.rotation = 0;
        this.arrowTail.clear();
        this.arrowTail.beginFill(0xFF0000);
        this.arrowTail.drawRect(6, 40, 8, height);
        this.container.pivot.set(container.width/2, container.height);
        container.rotation = Math.atan2(y, x);

        Vectors.updateFields(arrowModel, model, x, y , length, degrees);
      }
    },

    rotateEnd: function(data) {
      this.transformable = false;
    },

    updateReadouts: function() {
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
    },

    clearAll: function() {
      this.model.get('arrows').reset();
      this.displayObject.removeChild(this.container);
    }

  });

 return ArrowView;

  });
