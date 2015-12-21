define(function (require) {

    'use strict';

    var GrabBagItem = function(imagePath, name, resistance, modelLength) {
        this.imagePath = imagePath;
        this.name = name;
        this.resistance = resistance;
        this.modelLength = modelLength;
    };

    return GrabBagItem;
});