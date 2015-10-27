define(function(require) {

    'use strict';

    var PIXI = require('pixi');

    var AbstractBFieldView = require('views/bfield');

    /**
     * 
     */
    var BFieldOutsideView = AbstractBFieldView.extend({

        createNeedleSprites: function() {
            var bounds = this.bounds;
            var xSpacing = this.mvt.modelToViewDeltaX(this.xSpacing);
            var ySpacing = this.mvt.modelToViewDeltaY(this.ySpacing);
            
            // Determine how many points are needed to fill the apparatus panel.
            var xCount = Math.floor(bounds.w / xSpacing) + 1;
            var yCount = Math.floor(bounds.h / ySpacing) + 1;
            
            // Create the grid points.
            for (var i = 0; i < xCount; i++) {
                for (var j = 0; j < yCount; j++) {
                    var x = bounds.x + (i * xSpacing);
                    var y = bounds.y + (j * ySpacing);
                    this.createNeedleSpriteAt(x, y);
                }
            }
        }

    });


    return BFieldOutsideView;
});