define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Vector2 = require('common/math/vector2');

    var Electron    = require('./electron');

    /**
     * Emits electrons along a line between two points
     */
    var ElectronSource = Backbone.Model.extend({

        defaults: {
            electronsPerSecond: undefined,
            electromotiveForce: undefined,
            point1: undefined,
            point2: undefined,
            plate: undefined,
            electronProductionMode: 0
        },
        
        initialize: function(attributes, options) {
            this.set('point1', new Vector2(this.get('point1')));
            this.set('point2', new Vector2(this.get('point2')));
            
            this.timeSincelastElectronEmitted = 0;

            // Cached objects
            this._direction = new Vector2();  
        },

        update: function(time, deltaTime) {
            this.timeSincelastElectronEmitted += deltaTime;

            // Note that we only produce one electron at a time. Otherwise, we get a bunch of
            // electrons produced if the electronsPerSecond is suddently increased, especially
            // if it had been 0.
            var period = 1 / this.get('electronsPerSecond');
            if (this.timeSincelastElectronEmitted > period && this.get('electronProductionMode') === ElectronSource.CONTINUOUS_MODE) {
                this.timeSincelastElectronEmitted = 0;
                this.produceElectron();
            }
        },

        /**
         * Produce a single electron, and notify all listeners that it has happened.
         * 
         * When an electron is produced, its initial position must be away from the source,
         *   so it is not immediately captured if the source is part or a composite object
         *   that includes a sink.
         */
        produceElectron: function() {
            var electron = null;

            if (this.get('plate').get('potential') > 0) {
                electron = new Electron();

                // Determine where the electron will be emitted from
                var x = Math.random() * (this.get('point2').x - this.get('point1').x) + this.get('point1').x;
                var y = Math.random() * (this.get('point2').y - this.get('point1').y) + this.get('point1').y;

                var direction = this._direction.set(this.get('electromotiveForce').getElectronAcceleration());
                if (direction.length() > 0)
                    direction.normalize().scale(Electron.ELECTRON_RADIUS);
                
                electron.setPosition(x + direction.x, y + direction.y);
                this.trigger('electron-produced', this, electron);
            }

            return electron;
        },

        setCurrent: function(current) {
            this.set('electronsPerSecond', current);
        },

        /**
         * Sets the length of the electrode. Fields p1 and p2 are modified
         */
        setLength: function(newLength) {
            var x0 = (this.get('point1').x + this.get('point2').x) / 2;
            var y0 = (this.get('point1').y + this.get('point2').y) / 2;

            var currLength = this.get('point1').distance(this.get('point2'));
            var ratio = newLength / currLength;

            this.get('point1').set(x0 + (this.get('point1').x - x0) * ratio, y0 + (this.get('point1').y - y0) * ratio);
            this.get('point2').set(x0 + (this.get('point2').x - x0) * ratio, y0 + (this.get('point2').y - y0) * ratio);
        }

    }, {

        SINGLE_SHOT_MODE: 1,
        CONTINUOUS_MODE:  2

    });


    return ElectronSource;
});
