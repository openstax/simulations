define(function(require) {

    'use strict';

    var PIXI = require('pixi');

                   require('common/v3/pixi/extensions');
    var Colors   = require('common/colors/colors');

    var WaveView = require('views/wave');

    var Constants = require('constants');

    /**
     * A traveling sinusoidal wave
     */
    var TravelingWaveView = WaveView.extend({

        draw: function() {
            WaveView.prototype.draw.apply(this, arguments);

            var graphics = this.displayObject;
            var origin = this._origin.set(this.mvt.modelToView(this.origin));
            
            for (var i = 0; i < this.numPoints; i++) {
                var x = this.dx * i;
                var y = this.amplitude * Math.sin(((x - this.elapsedTime) / this.lambda) * Math.PI);

                if (i === 0)
                    graphics.moveTo(x + origin.x, y + origin.y);
                else
                    graphics.lineTo(x + origin.x, y + origin.y);
            }

            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;
        }

    });
    
    return TravelingWaveView;
});
