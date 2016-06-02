define(function (require) {

    'use strict';

    var BilliardBallModel = require('hydrogen-atom/models/atomic-model/billiard-ball');
    var BohrModel         = require('hydrogen-atom/models/atomic-model/bohr');
    var DeBroglieModel    = require('hydrogen-atom/models/atomic-model/debroglie');
    var PlumPuddingModel  = require('hydrogen-atom/models/atomic-model/plum-pudding');
    var SchroedingerModel = require('hydrogen-atom/models/atomic-model/schroedinger');
    var SolarSystemModel  = require('hydrogen-atom/models/atomic-model/solar-system');

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
