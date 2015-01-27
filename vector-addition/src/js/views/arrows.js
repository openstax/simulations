define(function(require) {

  'use strict';

  var PIXI = require('pixi');
  var PixiView = require('common/pixi/view');

  var ArrowView = PixiView.extend({

    initialize: function() {
      this.drawArrow();
    },

    dragStart: function(data) {
      data.originalEvent.preventDefault();
      this.data = data;
      this.dragging = true;
      this.dragOffset = data.getLocalPosition(this.parent);
    },

    dragMove: function(data) {
      if (this.dragging) {
        var newPosition = this.data.getLocalPosition(this.parent.parent);
        newPosition.x -= this.dragOffset.x;
        newPosition.y -= this.dragOffset.y;
        this.parent.position.x = newPosition.x;
        this.parent.position.y = newPosition.y;
      }
    },

    dragEnd: function(data) {
      this.dragging = false;
    },

    drawArrow: function() {
      this.arrowContainer = new PIXI.DisplayObjectContainer();
      var arrowHead = new PIXI.Graphics(),
      arrowTail = new PIXI.Graphics(),
      max = $('.scene-view').width() - 150,
      min = 770;

      this.arrowContainer.fillColor = '0xFF00000';

      arrowHead.beginFill(this.arrowContainer.fillColor);
      arrowHead.moveTo(0, 25);
      arrowHead.lineTo(15, 5);
      arrowHead.lineTo(30, 25);
      arrowHead.endFill();
      arrowHead.interactive = true;
      arrowHead.buttonMode = true;
      arrowHead.defaultCursor = 'nwse-resize';
      arrowHead.mousedown = this.transformStart;
      arrowHead.touchstart = this.transformStart;
      arrowHead.mousemove = this.transform;
      arrowHead.touchmove = this.transform;
      arrowHead.mouseup = this.transformEnd;
      arrowHead.mouseupoutside = this.transformEnd;
      arrowHead.touchend = this.transformEnd;
      arrowHead.touchendoutside = this.transformEnd;
      this.arrowHead = arrowHead;

      arrowTail.beginFill(this.arrowContainer.fillColor);
      arrowTail.drawRect(10, 20, 10, 100);
      arrowTail.interactive = true;
      arrowTail.buttonMode = true;
      arrowTail.defaultCursor = 'move';
      arrowTail.mousedown = this.dragStart;
      arrowTail.touchstart = this.dragStart;
      arrowTail.mousemove = this.dragMove;
      arrowTail.touchmove = this.dragMove;
      arrowTail.mouseup = this.dragEnd;
      arrowTail.mouseupoutside = this.dragEnd;
      arrowTail.touchend = this.dragEnd;
      arrowTail.touchendoutside = this.dragEnd;
      this.arrowTail = arrowTail;

      this.arrowContainer.addChild(this.arrowHead);
      this.arrowContainer.addChild(this.arrowTail);
      this.arrowContainer.position.x = Math.random() * (max - min) + min;
      this.arrowContainer.position.y = 0;
      this.arrowContainer.pivot = new PIXI.Point(0, 0);

      this.displayObject.addChild(this.arrowContainer);
    },

    transformStart: function(data) {
      this.transformable = true;
      this.oldX = data.originalEvent.x;
      this.oldY = data.originalEvent.y;
    },

    transform: function(data) {
      var mousePosition = data.getLocalPosition(this),
      rect = this.parent.children[1],
      newX = data.originalEvent.x,
      newY = data.originalEvent.y;

      if (this.transformable) {
        //Scale up and down
        if (this.oldY < newY) {
          rect.clear();
          rect.beginFill(0xFF0000);
          rect.drawRect(10, 20, 10, 50);
        }
        else {
          rect.clear();
          rect.beginFill(0xFF0000);
          rect.drawRect(10, 20, 10, 200);
        }

      }
    },

    transformEnd: function(data) {
      this.transformable = false;

    },

    transformTest: function(data) {
      this.parent.rotation += 0.1;
    }

  });

 return ArrowView;

  });
