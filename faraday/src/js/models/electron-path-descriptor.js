define(function (require) {

    'use strict';

    var _ = require('underscore');

    var Constants = require('constants');

    /**
     * ElectronPathDescriptor contains a description of one segment of an Electron's path.
     *   It is used exclusively by the view to describe the visual representation of segments
     *   of the a coil, for the purposes of animating the flow of electrons in the coil.
     */
    var ElectronPathDescriptor = function(curve, parent, layer, pathScale) {
        // The curve
        this.curve = curve;
        // The parent graphic
        this.parent = parent;
        // The layer that the curve is in (FOREGROUND or BACKGROUND).
        this.layer = layer;
        // How to scale the speed for this curve (any positive value).
        this.pathScale = pathScale !== undefined ? pathScale : ElectronPathDescriptor.DEFAULT_SPEED_SCALE;
    };

    /**
     * Instance functions/properties
     */
    _.extend(ElectronPathDescriptor.prototype, {

        getCurve: function() {
            return this.curve;
        },
        
        getParent: function() {
            return this.parent;
        },
        
        getLayer: function() {
            return this.layer;
        },
        
        getPathScale: function() {
            return this.pathScale;
        }

    });

    /**
     * Static functions/properties
     */
    _.extend(ElectronPathDescriptor, Constants.ElectronPathDescriptor);


    return ElectronPathDescriptor;
});
