define(function(require) {

    'use strict';

    var PIXI = require('pixi');

                   require('common/v3/pixi/extensions');
    var Colors   = require('common/colors/colors');
    var Vector2  = require('common/math/vector2');

    var WaveView = require('views/wave');

    var Constants = require('constants');

    /**
     * A sine wave with randomized phase.
     */
    var NonLasingWaveView = WaveView.extend({

        initialize: function(options) {
            this.angle = options.angle;

            // Cached objects
            this._point = new Vector2();

            WaveView.prototype.initialize.apply(this, [options]);
        },

        draw: function() {
            WaveView.prototype.draw.apply(this, arguments);

            var graphics = this.displayObject;
            var origin = this._origin.set(this.mvt.modelToView(this.origin));
            var phase = Math.random() * Math.PI;
            var point = this._point;

            for (var i = 0; i < this.numPoints; i += 3) {
                point.x = this.dx * i;
                point.y = this.amplitude * (Math.sin(phase + (point.x / this.lambda) * Math.PI));
                point.rotate(this.angle);

                if (i === 0)
                    graphics.moveTo(point.x + origin.x, point.y + origin.y);
                else
                    graphics.lineTo(point.x + origin.x, point.y + origin.y);
            }

            if (graphics.currentPath && graphics.currentPath.shape)
                graphics.currentPath.shape.closed = false;

            var alpha = Math.min(this.amplitude / 20, 1);
            if (this.simulation.get('mirrorsEnabled'))
                alpha *= 1 - this.simulation.rightMirror.getReflectivity();
            
            graphics.alpha = alpha;
        }

    });
    
    return NonLasingWaveView;
});
