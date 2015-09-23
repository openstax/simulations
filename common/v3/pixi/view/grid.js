define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    var PixiView = require('../view');

    var Colors    = require('common/colors/colors');
    var Vector2   = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var EPSILON = 0.0001;

    var GridView = PixiView.extend({

        initialize: function(options) {
            options = _.extend({
                origin: new Vector2(),
                bounds: new Rectangle(0, 0, 500, 500),
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

            this.origin = new Vector2(options.origin);
            this.bounds = new Rectangle(options.bounds);
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
                this.gridSize, 
                this.smallLineColor,
                this.smallLineWidth,
                this.smallLineAlpha
            );
        },

        drawGrid: function(grid, gridSize, skipEvery, color, lineWidth, alpha) {
            var origin = this.origin;
            var top    = this.bounds.top();
            var bottom = this.bounds.bottom();
            var left   = this.bounds.left();
            var right  = this.bounds.right();

            var startX = left   + ((origin.x - left)   % gridSize);
            var startY = bottom + ((origin.y - bottom) % gridSize);

            grid.clear();
            grid.lineStyle(lineWidth, color, alpha);
            grid.moveTo(0,0);

            for (var x = startX; x <= right; x += gridSize) {
                if (skipEvery !== null && (x - origin.x) % skipEvery < EPSILON && (x - origin.x) % skipEvery > -EPSILON)
                    continue;

                grid.moveTo(x, top);
                grid.lineTo(x, bottom);
            }

            for (var y = startY; y <= top; y += gridSize) {
                if (skipEvery !== null && (y - origin.y) % skipEvery < EPSILON && (y - origin.y) % skipEvery > -EPSILON)
                    continue;

                grid.moveTo(left,  y);
                grid.lineTo(right, y);
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

        setOrigin: function(origin) {
            this.origin.set(origin);
            this.drawGrids();
        },

        setBounds: function(bounds) {
            this.bounds.set(bounds);
            this.drawGrids();
        },

        set: function(options) {
            options = _.extend({
                origin:        this.origin,
                bounds:        this.bounds,
                gridSize:      this.gridSize,
                gridOffsetX:   this.gridOffsetX,
                gridOffsetY:   this.gridOffsetY,
                smallGridSize: this.smallGridSize
            }, options);

            this.origin.set(options.origin);
            this.bounds.set(options.bounds);

            this.gridSize = options.gridSize;
            this.gridOffsetX = options.gridOffsetX;
            this.gridOffsetY = options.gridOffsetY;
            this.smallGridSize = options.smallGridSize;

            this.drawGrids();
        }

    });

    return GridView;
});
