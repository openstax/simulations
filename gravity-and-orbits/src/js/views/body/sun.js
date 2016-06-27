define(function(require) {

    'use strict';

    var BodyView = require('views/body');

    /**
     * A view that represents a sun.
     */
    var SunView = BodyView.extend({

        textureBodyWidthRatio: 0.78

    });

    return SunView;
});