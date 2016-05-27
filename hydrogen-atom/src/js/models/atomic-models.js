define(function (require) {

    'use strict';

    var Assets = require('assets');
    
    var AtomicModels = {
        BILLIARD_BALL: {
            label: 'Billiard Ball',
            icon: Assets.Images.ICON_BILLIARD_BALL
        }, 
        PLUM_PUDDING: {
            label: 'Plum Pudding',
            icon: Assets.Images.ICON_PLUM_PUDDING
        }, 
        SOLAR_SYSTEM: {
            label: 'Classical Solar System',
            icon: Assets.Images.ICON_SOLAR_SYSTEM
        }, 
        BOHR: {
            label: 'Bohr',
            icon: Assets.Images.ICON_BOHR
        }, 
        DEBROGLIE: {
            label: 'deBroglie',
            icon: Assets.Images.ICON_DEBROGLIE
        }, 
        SCHROEDINGER: {
            label: 'Schrödinger',
            icon: Assets.Images.ICON_SCHROEDINGER
        }
    };

    return AtomicModels;
});
