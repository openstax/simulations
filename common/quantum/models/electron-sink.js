define(function (require) {

    'use strict';

    var Backbone = require('backbone');

    var Vector2          = require('common/math/vector2');
    var LineIntersection = require('common/math/line-intersection');

    var QuantumConfig = require('../config');

    var Electron    = require('./electron');
    var PhysicsUtil = require('./physics-util');

    /**
     * Absorbs electrons along a line between two points
     */
    var ElectronSink = Backbone.Model.extend({

        defaults: {
            simulation: undefined,
            point1: undefined,
            point2: undefined
        },
        
        initialize: function(attributes, options) {
            this.set('point1', new Vector2(this.get('point1')));
            this.set('point2', new Vector2(this.get('point2')));

            this.electrons = [];
        },

        /**
         * Removes electrons that have crossed the line defined by the electron sink
         */
        update: function(time, deltaTime) {
            var x1 = this.get('point1').x;
            var y1 = this.get('point1').y;
            var x2 = this.get('point2').x;
            var y2 = this.get('point2').y;

            // Look for electrons that should be absorbed
            for (var i = this.electrons.length; i >= 0; i--) {
                var electron = this.electrons[i];

                var hits = LineIntersection.linesIntersect(
                    x1, y1, 
                    x2, y2,
                    electron.getX(), electron.getY(), 
                    electron.getPreviousPosition().x, electron.getPreviousPosition().y
                );
                
                if (hits) {
                    this.get('simulation').removeModel(electron);
                    this.trigger('electron-absorbed', this, electron);
                    electron.destroy();
                    this.electrons.splice(i, 1);
                }
            }
        },

        addElectron: function(electron) {
            this.electrons.push(electron);
        },

        removeElectron: function(electron) {
            for (var i = this.electrons.length - 1; i >= 0; i--) {
                if (this.electrons[i] === electron) {
                    this.electrons.splice(i, 1);
                    return true;
                }
            }
            return false;
        }

    });


    return ElectronSink;
});
