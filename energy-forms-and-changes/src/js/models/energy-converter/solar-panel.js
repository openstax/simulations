define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Vector2 = require('common/math/vector2');
    var Rectangle = require('common/math/rectangle');

    var EnergyConverter       = require('models/energy-converter');
    var EnergyChunkCollection = require('models/energy-chunk-collection');
    var EnergyChunkPathMover  = require('models/energy-chunk-path-mover');
    var EnergyChunk           = require('models/energy-chunk');

    var Constants = require('constants');
    var EnergyTypes = Constants.EnergyTypes;



    var SolarPanel = EnergyConverter.extend({

        defaults: _.extend({}, EnergyConverter.prototype.defaults, {

        }),
        
        // initialize: function(attributes, options) {
        //     EnergyConverter.prototype.initialize.apply(this, [attributes, options]);

        //     this.wheelRotationalVelocity = 0; // In radians

        //     this.electricalEnergyChunks = new EnergyChunkCollection();
        //     this.hiddenEnergyChunks = new EnergyChunkCollection();

        //     this.energyChunkMovers = [];

        //     this._initialChunkPosition = new Vector2();
        // },

        getAbsorptionShape: function() {
            return new Rectangle();
        }
        
    });

    return SolarPanel;
});
