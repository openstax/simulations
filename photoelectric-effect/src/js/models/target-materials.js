define(function (require) {

    'use strict';

    var MetalEnergyAbsorptionStrategy  = require('models/metal-energy-absorption-strategy');
    var SimpleEnergyAbsorptionStrategy = require('models/simple-energy-absorption-strategy');

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

    TargetMaterials.TARGET_COLORS = {};

    TargetMaterials.TARGET_COLORS[TargetMaterials.COPPER.cid]    = '#D2821E';
    TargetMaterials.TARGET_COLORS[TargetMaterials.MAGNESIUM.cid] = '#8296AA';
    TargetMaterials.TARGET_COLORS[TargetMaterials.SODIUM.cid]    = '#A0B4A0';
    TargetMaterials.TARGET_COLORS[TargetMaterials.ZINC.cid]      = '#C8C8C8';
    TargetMaterials.TARGET_COLORS[TargetMaterials.PLATINUM.cid]  = '#CBE6E6';
    TargetMaterials.TARGET_COLORS[TargetMaterials.CALCIUM.cid]   = '#000000';

    TargetMaterials.getColor = function(material) {
        if (TargetMaterials.TARGET_COLORS[material.cid] !== undefined)
            return TargetMaterials.TARGET_COLORS[material.cid];
        return '#000';
    };
    
    TargetMaterials.setSimpleElectronModel = function() {
        for (var i = 0; i < TargetMaterials.TARGET_MATERIALS.length; i++) {
            var targetMaterial = TargetMaterials.TARGET_MATERIALS[i];
            var energyAbsorptionStrategy = new SimpleEnergyAbsorptionStrategy(targetMaterial.getWorkFunction());
            targetMaterial.setEnergyAbsorptionStrategy(energyAbsorptionStrategy);
        }
    };

    TargetMaterials.setRealisticElectronModel = function() {
        for (var i = 0; i < TargetMaterials.TARGET_MATERIALS.length; i++) {
            var targetMaterial = TargetMaterials.TARGET_MATERIALS[i];
            var energyAbsorptionStrategy = new MetalEnergyAbsorptionStrategy(targetMaterial.getWorkFunction());
            targetMaterial.setEnergyAbsorptionStrategy(energyAbsorptionStrategy);
        }
    };


    return TargetMaterials;

});
