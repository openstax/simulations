define(function(require) {

    'use strict';

    var CapacitorLabSceneView = require('views/scene');
    var DielectricSceneView   = require('views/scene/dielectric');

    /**
     *
     */
    var IntroSceneView = DielectricSceneView.extend({

        initEFieldDetector: function() {
            // We don't want the dielectric version of the e-field reader
            CapacitorLabSceneView.prototype.initEFieldDetector.apply(this, arguments);
        }

    });

    return IntroSceneView;
});
