define(function (require) {

    'use strict';

    var GrabBagItem = function(imagePath, imageMaskPath, name, resistance, modelLength) {
        this.imagePath = imagePath;
        this.imageMaskPath = imageMaskPath;
        this.name = name;
        this.resistance = resistance;
        this.modelLength = modelLength;
    };

    return GrabBagItem;
});