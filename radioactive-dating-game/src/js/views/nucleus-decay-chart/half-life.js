define(function(require) {

    'use strict';

    var MultipleNucleusDecayChart = require('views/nucleus-decay-chart/multiple');

    /**
     * A panel that contains a chart showing the timeline for decay of nuclei over time.
     */
    var HalfLifeNucleusDecayChart = MultipleNucleusDecayChart.extend({

        initYAxis: function() {
            MultipleNucleusDecayChart.prototype.initYAxis.apply(this, arguments);

            this.isotopeLabel.x -= 12;
        }

    });


    return HalfLifeNucleusDecayChart;
});