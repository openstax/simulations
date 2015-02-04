define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var PixiView = require('../view');

    var Colors = require('../../colors/colors');

    var GridView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                width:  400,
                height: 400,
                gridSize: 25,
                gridOffsetX: 0,
                gridOffsetY: 0,
                smallGridSize: 5,
                smallGridEnabled: false,

                lineColor: '#000',
                lineWidth: 1,
                lineAlpha: 1,

                smallLineColor: '#000',
                smallLineWidth: 1,
                smallLineAlpha: 1
            }, options);

            this.width = options.width;
            this.height = options.height;
            this.gridSize = options.gridSize;
            this.gridOffsetX = options.gridOffsetX;
            this.gridOffsetY = options.gridOffsetY;
            this.smallGridSize = options.smallGridSize;
            this.smallGridEnabled = options.smallGridEnabled;

            this.lineColor = Colors.parseHex(options.lineColor);
            this.lineWidth = options.lineWidth;
            this.lineAlpha = options.lineAlpha;

            this.smallLineColor = Colors.parseHex(options.smallLineColor);
            this.smallLineWidth = options.smallLineWidth;
            this.smallLineAlpha = options.smallLineAlpha;

            this.initGraphics();
        },

        initGraphics: function() {
            this.smallGrid = new PIXI.Graphics();
            this.largeGrid = new PIXI.Graphics();

            this.displayObject.addChild(this.smallGrid);
            this.displayObject.addChild(this.largeGrid);

            this.drawGrids();
        },

        drawGrids: function() {
            if (this.smallGridEnabled)
                this.drawSmallGrid();
            this.drawLargeGrid();
        },

        drawLargeGrid: function() {
            this.drawGrid(
                this.largeGrid,
                this.gridSize,
                null,
                this.lineColor,
                this.lineWidth,
                this.lineAlpha
            );
        },

        drawSmallGrid: function() {
            this.drawGrid(
                this.smallGrid, 
                this.smallGridSize, 
                this.gridSize / this.smallGridSize, 
                this.smallLineColor,
                this.smallLineWidth,
                this.smallLineAlpha
            );
        },

        drawGrid: function(grid, gridSize, skipEvery, color, lineWidth, alpha) {
            var startX = 0;
            var startY = 0;
            var gridOffsetX = this.gridOffsetX;
            var gridOffsetY = this.gridOffsetY;
            var numYLines = Math.ceil(this.width  / gridSize);
            var numXLines = Math.ceil(this.height / gridSize);

            grid.clear();
            grid.lineStyle(lineWidth, color, alpha);
            grid.moveTo(0,0);

            for (var i = -gridOffsetX; i < numXLines + gridOffsetX; i++) {
                if (skipEvery !== null && i % skipEvery === 0)
                    continue;

                grid.moveTo((startX    - gridOffsetX) * gridSize, i * gridSize);
                grid.lineTo((numYLines + gridOffsetX) * gridSize, i * gridSize);
            }

            for (var j = -gridOffsetY; j < numYLines + gridOffsetY; j++) {
                if (skipEvery !== null && i % skipEvery === 0)
                    continue;

                grid.moveTo(j * gridSize, (startY    - gridOffsetY) * gridSize);
                grid.lineTo(j * gridSize, (numXLines + gridOffsetY) * gridSize);
            }
        },

        showSmallGrid: function() {
            this.smallGrid.visible = true;
        },

        hideSmallGrid: function() {
            this.smallGrid.visible = false;
        },

        showLargeGrid: function() {
            this.largeGrid.visible = true;
        },

        hideLargeGrid: function() {
            this.largeGrid.visible = false;
        },

        show: function() {
            this.smallGrid.visible = true;
            this.largeGrid.visible = true;
        },

        hide: function() {
            this.smallGrid.visible = false;
            this.largeGrid.visible = false;
        },

        setGridSize: function(gridSize) {
            this.gridSize = gridSize;
            this.drawGrids();
        },

        setSmallGridSize: function(smallGridSize) {
            this.smallGridSize = smallGridSize;
            this.drawGrids();
        },

        setGridOffsetX: function(gridOffsetX) {
            this.gridOffsetX = gridOffsetX;
            this.drawGrids();
        },

        setGridOffsetY: function(gridOffsetY) {
            this.gridOffsetY = gridOffsetY;
            this.drawGrids();
        },

        setGridOffset: function(x, y) {
            this.gridOffsetX = x;
            this.gridOffsetY = y;
            this.drawGrids();
        },

        set: function(options) {
            options = _.extend({
                gridSize:      this.gridSize,
                gridOffsetX:   this.gridOffsetX,
                gridOffsetY:   this.gridOffsetY,
                smallGridSize: this.smallGridSize
            }, options);

            this.gridSize = options.gridSize;
            this.gridOffsetX = options.gridOffsetX;
            this.gridOffsetY = options.gridOffsetY;
            this.smallGridSize = options.smallGridSize;

            this.drawGrids();
        }

    });

    return GridView;
});
