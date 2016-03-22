define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var PixiView = require('common/v3/pixi/view');
    var Colors   = require('common/colors/colors');
    require('common/v3/pixi/dash-to');
    
    var Assets = require('assets');
    var Constants = require('constants');

    /**
     * A view that represents an electron
     */
    var SpaceBox = PixiView.extend({

        /**
         * Initializes the new SpaceBox.
         */
        initialize: function(options) {
            this.mvt = options.mvt;
            this.spaceBoxSize = options.spaceBoxSize;
            this.scale = options.scale;

            this.initGraphics();
        },

        /**
         * Initializes everything for rendering graphics
         */
        initGraphics: function() {
            this.box = new PIXI.Graphics();
            this.drawBox();

            this.displayObject.addChild(this.box);

            this.updateMVT(this.mvt);
        },

        /**
         * Updates the model-view-transform and anything that
         *   relies on it.
         */
        updateMVT: function(mvt) {
            var center = SpaceBox.center;
            this.mvt = mvt;

            // var scale = this.spaceBoxSize/150;
            // this.displayObject.scale.x = scale;
            // this.displayObject.scale.y = scale;


            // this.displayObject.x = Math.floor(this.mvt.modelToViewX(center.x));
            // this.displayObject.y = Math.floor(this.mvt.modelToViewY(center.y));

            this.update();
        },

        drawBox: function() {
            var boxWidth = this.spaceBoxSize/this.scale;
            var boxCorner = this.mvt.modelToView({
                x: - boxWidth/2,
                y: - boxWidth/2
            });

            this.box.lineStyle(1, 0xFFFFFF, 1);
            this.box.drawRect(boxCorner.x, boxCorner.y, boxWidth * this.scale, boxWidth * this.scale);
        }

    }, {center: {x: 0, y: 0}});


    return SpaceBox;
});