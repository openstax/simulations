define(function (require) {

    'use strict';

    var Zinc      = require('models/element-properties/zinc');
    var Copper    = require('models/element-properties/copper');
    var Sodium    = require('models/element-properties/sodium');
    var Platinum  = require('models/element-properties/platinum');
    var Calcium   = require('models/element-properties/calcium');
    var Magnesium = require('models/element-properties/magnesium');

    var TargetMaterials = {};

    TargetMaterials.ZINC      = new Zinc();
    TargetMaterials.COPPER    = new Copper();
    TargetMaterials.SODIUM    = new Sodium();
    TargetMaterials.PLATINUM  = new Platinum();
    TargetMaterials.CALCIUM   = new Calcium();
    TargetMaterials.MAGNESIUM = new Magnesium();
    
    TargetMaterials.TARGET_MATERIALS = [
        TargetMaterials.SODIUM,
        TargetMaterials.ZINC,
        TargetMaterials.COPPER,
        TargetMaterials.PLATINUM,
        TargetMaterials.CALCIUM,
        TargetMaterials.MAGNESIUM
    ];

    return TargetMaterials;

});
