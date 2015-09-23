define(function (require) {

    'use strict';

    var _ = require('underscore');

    var NumberSeries = require('common/math/number-series');

    var Law = require('models/law');

    /**
     * 
     */
    var AverageCurrent = function(numSamples, region) {
        this.particle = [];
        this.series = new NumberSeries(numSamples);
        this.region = region;
        this.resistance = 0;
        this.voltage = 0;
        this.display = 0;
    };

    /**
     * Instance functions/properties
     */
    _.extend(AverageCurrent.prototype, Law.prototype, {
        
        update: function(deltaTime, system) {
            var sum = 0;
            var n = 0;
            for (var i = 0; i < this.particles.length; i++) {
                var particle = this.particles[i];
                if (this.region.contains(particle)) {
                    sum += particle.velocity * particle.charge;
                    n++;
                }
            }

            if (n !== 0)
                sum /= n;
            
            var hollyscale = 3.5 * 3.3;
            sum = 0;// No hollywood
            var hollywood = resistance / voltage * hollyscale;
            var total = (sum + hollywood);
            this.series.add( total );
            this.display = this.series.average();
            console.log('does anything need to listen to this?');
        },

        valueChanged: function(v) {
            this.resistance = v;
        },

        coreCountChanged: function(x) {
            this.voltage = x;
        },

        addParticle: function(p) {
            this.particles.push(p);
        },

        getDisplay: function() {
            return this.display;
        }

    });

    return AverageCurrent;
});
