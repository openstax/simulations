define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var Vector2 = require('common/math/vector2'); //AMW Not sure if I need this yet, may remove.
    var Rectangle = require('common/math/rectangle'); //AMW Not sure if I need this yet, may remove.

    var ModelViewTransform = require('common/math/model-view-transform'); //AMW Not sure if I need this yet, may remove.
    var PixiSceneView = require('common/pixi/view/scene');

    var Assets = require('assets');

    // Constants
    var Constants = require('constants'); //AMW Not sure if I need this yet, may remove.

    var VectorAdditionSceneView = PixiSceneView.extend({

        events: {

        },

        initialize: function(options) {
            PixiSceneView.prototype.initialize.apply(this, arguments);
            this.views = [];
            this.listenTo(this.simulation, 'change:showGrid', this.toggleGrid);
        },

        initGraphics: function() {
          this.drawGrid();
          //X
          this.drawLines(0, 550, 1024, 550);
          this.drawText('x', 750, 560);
          // Y
          this.drawLines(75, 0, 75, 650);
          this.drawText('y', 50, 20);
          //Sprites
          this.addSprite(Assets.createSprite(Assets.Images.Vector_Bin), 835, 10);
          this.addSprite(Assets.createSprite(Assets.Images.Trash_Can), 845, 510);
        },

        addSprite: function(asset, startX, startY) {
          asset.x = startX;
          asset.y = startY;
          this.stage.addChild(asset);
        },

        drawLines: function(startX, startY, endX, endY) {
          var line = new PIXI.Graphics();
          line.lineStyle(2, 0x000000);
          line.moveTo(startX, startY);
          line.lineTo(endX, endY);
          line.endFill();
          this.stage.addChild(line);
        },

        drawText: function(displayedText, startX, startY) {
          var textStyles = { font: '25px arial', color: 'black' };
          var text = new PIXI.Text(displayedText, textStyles);
          text.x = startX;
          text.y = startY;
          this.stage.addChild(text);
        },

        drawGrid: function() {
          var canvas = $('.scene-view'),
          startX = 0,
          startY = 0,
          canWidth = canvas.width(),
          canHeight = canvas.height(),
          gridSize = 10,
          gridOffset = 5,
          nbrYLines = Math.round(canWidth/gridSize),
          nbrXLines = Math.round(canHeight/gridSize),
          lines = new PIXI.Graphics();
          lines.lineStyle(1, 0xFFDD00);
          lines.moveTo(0,0);

          for (var i = -gridOffset; i < nbrXLines + gridOffset; i++) {
            if ((i+2)%5 == 0) {
              lines.lineStyle(3, 0xFFDD00);
            } else {
              lines.lineStyle(1, 0xFFDD00);
            }

            lines.moveTo((startX - gridOffset) *gridSize, i*gridSize);
            lines.lineTo((nbrYLines + gridOffset) *gridSize, i*gridSize);
          }

          for (var j = -gridOffset; j < nbrYLines + gridOffset; j++) {
            if (j%5 == 0) {
              lines.lineStyle(3, 0xFFDD00);
            } else {
              lines.lineStyle(1, 0xFFDD00);
            }

            lines.moveTo(j*gridSize, (startY - gridOffset) *gridSize);
            lines.lineTo(j*gridSize, (nbrXLines + gridOffset) *gridSize);
          }

          lines.visible = false;
          this.stage.addChild(lines);
        },

        toggleGrid: function(lines) {
          if (this.simulation.get('showGrid')) {
            this.stage.children[0].visible = true;
          }
          else {
            this.stage.children[0].visible = false;
          }
        }

    });

    return VectorAdditionSceneView;
});
