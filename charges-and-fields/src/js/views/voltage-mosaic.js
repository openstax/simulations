define(function(require) {

    'use strict';

    var PIXI = require('pixi');
    
    var PixiView  = require('common/pixi/view');
    var Colors    = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var Constants = require('constants');

    /**
     * 
     */
    var VoltageMosaic = PixiView.extend({

        /**
         * Overrides PixiView's initializeDisplayObject function
         */
        initializeDisplayObject: function() {
            this.displayObject = new PIXI.Graphics();
        },

        initialize: function(options) {
            options = _.extend({
                tileSizeInMeters: Constants.SceneView.GRID_MINOR_SIZE_IN_METERS
            }, options);

            this.simulation = options.simulation;
            this.tileSizeInMeters = options.tileSizeInMeters;

            // Set the initial MVT and draw
            this.updateMVT(options.mvt);

            //this.displayObject.filters = [ new PIXI.BlurFilter() ];

            // Listen for changes in charges
            this.listenTo(this.simulation.charges, 'change add remove reset',  this.chargesChanged);
        },

        draw: function() {
            var graphics = this.displayObject;
            var simulation = this.simulation;
            var width = this.mvt.modelToViewDeltaX(simulation.get('width'));
            var height = Math.abs(this.mvt.modelToViewDeltaY(simulation.get('height')));

            // Clear it with white
            graphics.clear();
            graphics.beginFill(0xFFFFFF, 1);
            graphics.drawRect(0, 0, width, height);
            graphics.endFill();

            var tileSizeInMeters = this.tileSizeInMeters;
            var tileSize = this.mvt.modelToViewDeltaX(tileSizeInMeters);
            var halfTileSizeInMeters = tileSizeInMeters / 2;
            var numXTiles = Math.ceil(width  / tileSize);
            var numYTiles = Math.ceil(height / tileSize);
            var voltage;
            var color;

            for (var x = 0; x < numXTiles; x++) {
                for (var y = 0; y < numYTiles; y++) {
                    voltage = simulation.getV(x * tileSizeInMeters + halfTileSizeInMeters, y * tileSizeInMeters + halfTileSizeInMeters);
                    color = this.colorFromVoltage(voltage);
                    graphics.beginFill(color, 1);
                    graphics.drawRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    graphics.endFill();
                }
            }
        },

        colorFromVoltage: function(voltage) {
            if (voltage > 0) {
                // saturates at 20000
                //            green = blue = Math.max( 0, (1 - (voltage / 20000)) * 255 );
                var bright = Math.max(0, 255 - voltage * 0.01275);
                return 16711680 | (bright << 8) | bright; // 255,bright,bright color
            }
            else {
                // saturates at 20000
                //            red = green = Math.max( 0, (1 - (-voltage / 20000)) * 255 );
                var bright =  Math.max(0, 255 + voltage * 0.01275);
                return (bright << 16) | (bright << 8) | 255; // bright,bright,255 color
            }
        },

        updateMVT: function(mvt) {
            this.mvt = mvt;

            this.draw();
        },

        update: function() {
            if (this.redrawOnNextFrame) {
                this.redrawOnNextFrame = false;
                this.draw();
            }
        },

        chargesChanged: function() {
            this.redrawOnNextFrame = true;
        }

    });

    return VoltageMosaic;
});