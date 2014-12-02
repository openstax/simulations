define(function(require) {

    'use strict';

    var _       = require('underscore');
    //var PIXI    = require('pixi');
    //var Vector2 = require('common/math/vector2');
    var PiecewiseCurve = require('common/math/piecewise-curve');

    var ElementView = require('views/element');
    //var Assets      = require('assets');

    var Constants = require('constants');

    /**
     * A view that represents a block model
     */
    var BurnerView = ElementView.extend({

        /**
         *
         */
        initialize: function(options) {
            options = _.extend({
                width:  10,
                height: 10,
                openingHeight: 2,
            }, options);

            this.width = options.width;
            this.height = options.height;
            this.openingHeight = options.openingHeight;

            ElementView.prototype.initialize.apply(this, [options]);
        },

        initGraphics: function() {
            var width = this.width;
            var height = this.height;
            var openingHeight = this.openingHeight;
            var bottomWidth = width * 0.8;

            // Bucket inside (just an ellipse)
            var bucketInsideCurve = new PiecewiseCurve();
            bucketInsideCurve
                .moveTo(0, 0)
                .curveTo(
                    0,     -openingHeight / 2,
                    width, -openingHeight / 2,
                    width, 0
                )
                .curveTo(
                    width, openingHeight / 2,
                    0,     openingHeight / 2,
                    0,     0
                )
                .close();


            // Bucket outside
            var bucketOutsideCurve = new PiecewiseCurve();
            bucketOutsideCurve
                .moveTo(0, 0);                             // Start in upper left corner
                .curveTo(                                  // Curve to upper right corner
                    0,     openingHeight / 2,
                    width, openingHeight / 2,
                    width, 0
                )
                .lineTo((width + bottomWidth) / 2, height) // Line down to lower right corner
                .curveTo(                                  // Curve over to lower left corner
                    (width + bottomWidth) / 2, height + openingHeight / 2,
                    (width - bottomWidth) / 2, height + openingHeight / 2,
                    (width - bottomWidth) / 2, height
                )
                .lineTo(0, 0)                              // Line back up to upper left corner
                .close();

            
        },

        showEnergyChunks: function() {
            
        },

        hideEnergyChunks: function() {
            
        }

    }, Constants.BurnerView);

    return BurnerView;
});