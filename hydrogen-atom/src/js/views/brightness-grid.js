define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/v3/pixi/view');
    var Colors    = require('common/colors/colors');

    var Constants = require('constants');

    var CELL_OVERLAP = 0; // 1.0 = 100%
    var MAX_RGBA = Constants.SchroedingerModelView.MAX_RGBA;
    var MIN_RGBA = Constants.SchroedingerModelView.MIN_RGBA;

    /**
     * Draws the grid that covers one quadrant of the 2D animation box.
     * The grid is composed of rectangular cells, and each cell has its own color.
     */
    var BrightnessGridView = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            this._rgba = {};
        },

        /**
         * Draws the grid, which is composed of rectangular cells.
         * Each cell is assigned a color based on its brightness value.
         * Cells overlap a bit so that we don't see the seams between them.
         */
        draw: function() {
            if (!this.brightness)
                return;

            var brightness = this.brightness;
            var graphics = this.displayObject;
            graphics.clear();

            var rgba = this._rgba;
            var alpha;
            var color;
            var x, z;
            var w = this.cellWidth  + (CELL_OVERLAP * this.cellWidth);
            var h = this.cellHeight + (CELL_OVERLAP * this.cellHeight);

            for (var row = 0; row < brightness.length; row++) {
                for (var col = 0; col < brightness[row].length; col++) {
                    rgba = Colors.interpolateRgba(MAX_RGBA, MIN_RGBA, brightness[row][col], rgba);
                    alpha = rgba.a;
                    color = Colors.rgbToHexInteger(rgba);
                    graphics.beginFill(color, alpha);

                    x = (col * this.cellWidth);
                    z = (row * this.cellHeight); 
                    graphics.drawRect(x, z, w, h);
                    graphics.endFill();
                }
            }
        },

        /**
         * Sets the brightness values that are applied to the cells in the grid.
         * The dimensions of the brightness array determine the number of cells.
         */
        setBrightness: function(brightness) {
            this.brightness = brightness;
            this.cellHeight = (this.height / 2) / brightness.length;
            this.cellWidth = (this.width / 2) / brightness[0].length;
            this.draw();
        },

        setWidth: function(width) {
            this.width = width;
        },

        setHeight: function(height) {
            this.height = height;
        }

    });

    return BrightnessGridView;
});