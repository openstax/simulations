define(function (require) {

    'use strict';

    var Zinc      = require('models/zinc');
    var Copper    = require('models/copper');
    var Sodium    = require('models/sodium');
    var Platinum  = require('models/platinum');
    var Calcium   = require('models/calcium');
    var Magnesium = require('models/magnesium');

    var TargetMaterials = {};

    TargetMaterials.ZINC      = new Zinc();
    TargetMaterials.COPPER    = new Copper();
    TargetMaterials.SODIUM    = new Sodium();
    TargetMaterials.PLATINUM  = new Platinum();
    TargetMaterials.CALCIUM   = new Calcium();
    TargetMaterials.MAGNESIUM = new Magnesium();
    
    TargetMaterials.TARGET_MATERIALS = [
        TargetMaterials.ZINC,
        TargetMaterials.COPPER,
        TargetMaterials.SODIUM,
        TargetMaterials.PLATINUM,
        TargetMaterials.CALCIUM,
        TargetMaterials.MAGNESIUM
    ];

    return TargetMaterials;

});
