define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');
  var Vectors = require('vector-addition')

  var ArrowView = PixiView.extend({

    events: {
      'click .arrowTail': 'getFields',
      'click .arrowHead': 'getFields',
      'mousedown .arrowHead': 'rotateStart',
      'mousemove .arrowHead': 'rotate',
      'touchmove .arrowHead': 'rotate',
      'mouseup .arrowHead': 'rotateEnd',
      'mouseupoutside .arrowHead': 'rotateEnd',
      'touchend .arrowHead': 'rotateEnd',
      'touchendoutside .arrowHead': 'rotateEnd',
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
      this.sumVector();
      this.listenTo(this.model, 'change:emptyStage', this.clearAll)
      this.listenTo(this.model, 'change:rText change:thetaText change:rXText change:rYText',
       this.getFields);
    },

    clearAll: function() {
      var displayObject = this.displayObject;
      var arrows = _.where(displayObject.children, {name: 'arrow'})
      _.each(arrows, function(arrow){
        displayObject.removeChild(arrow)
      })
    },

    //TODO
    sumVector: function() {
      var sumVector = new Vectors.Vector(10,10,-1);
      sumVector.rotation = 0;
      sumVector.width = 0;
      return sumVector;
    },

    dragStart: function(data) {
      data.originalEvent.preventDefault();
      this.data = data;
      this.dragging = true;
    },

    dragMove: function(data) {
      var xCoord = data.global.x - this.displayObject.x;
      var yCoord = data.global.y - this.displayObject.y;
      var x = Vectors.roundGrid(xCoord);
      var y = Vectors.roundGrid(yCoord);
      var length = Math.sqrt(x*x+y*y);
      var degrees = (180/Math.PI) * Math.atan2(y, x);

      if (this.dragging) {
        this.arrowContainer.position.x = x;
        this.arrowContainer.position.y = y;

        Vectors.updateFields(this.model, length, degrees, x, y);

        //TODO
        //Vectors.updateComponents();
      }
    },

    dragEnd: function(data) {
      this.dragging = false;
    },

    drawArrow: function() {
      this.arrowContainer = new PIXI.DisplayObjectContainer();
      var arrowHead = new PIXI.Graphics(),
      arrowTail = new PIXI.Graphics(),
      canvas = $('.scene-view');

      this.arrowContainer.fillColor = '0xFF00000';

      arrowHead.beginFill(this.arrowContainer.fillColor);
      arrowHead.moveTo(0, 40);
      arrowHead.lineTo(10, 0);
      arrowHead.lineTo(20, 40);
      arrowHead.endFill();
      arrowHead.interactive = true;
      arrowHead.buttonMode = true;
      this.arrowHead = arrowHead;

      arrowTail.beginFill(this.arrowContainer.fillColor);
      arrowTail.drawRect(6, 40, 8, 160);
      arrowTail.interactive = true;
      arrowTail.buttonMode = true;
      arrowTail.defaultCursor = 'move';
      this.arrowTail = arrowTail;

      this.arrowContainer.addChild(this.arrowHead);
      this.arrowContainer.addChild(this.arrowTail);
      this.displayObject.position.x = 0.8 * canvas.width() + 10 *Math.random() - 5;
      this.displayObject.position.y = 0.25 * canvas.height() + 10 *Math.random() - 5;
      this.arrowContainer.name ='arrow';
      this.arrowContainer.pivot.set(20, 160);

      this.displayObject.addChild(this.arrowContainer);
      this.model.set('emptyStage', false);
      this.model.set({
        'rText': Vectors.padZero(Vectors.round1(180/10)),
        'thetaText': Vectors.padZero(Vectors.round1(90)),
        'rXText': Vectors.round0(this.arrowContainer.position.x/10),
        'rYText': Vectors.round0(this.arrowContainer.position.y/10)
      });
      this.getFields();
    },

    rotateStart: function(data) {
      this.transformable = true;
      this.data = data;
    },

    rotate: function(data) {
      var arrowContainer = this.arrowContainer;
      var xCoord = data.global.x - this.displayObject.x;
      var yCoord = data.global.y - this.displayObject.y;
      var x = Vectors.roundGrid(xCoord);
      var y = Vectors.roundGrid(yCoord);
      var length = Math.sqrt(x*x+y*y);
      var degrees = (180/Math.PI) * Math.atan2(y, x);
      var height = length - 0.9 * this.arrowHead.height;

      if (this.transformable) {
        arrowContainer.rotation = 0;
        this.arrowTail.clear();
        this.arrowTail.beginFill(this.arrowContainer.fillColor);
        this.arrowTail.drawRect(6, 40, 8, height);
        arrowContainer.rotation = degrees;

        //TODO
        //Vectors.updateComponents();
        //Vectors.updateSumVector();
        //Vectors.updateAfterEvent();

        Vectors.updateFields(this.model, length, degrees, x, y);
      }
    },

    rotateEnd: function(data) {
      this.transformable = false;
    },

    getFields: function() {
      this.model.get('rText');
      this.model.get('thetaText');
      this.model.get('rXText');
      this.model.get('rYText');
    }

  });

 return ArrowView;

  });
