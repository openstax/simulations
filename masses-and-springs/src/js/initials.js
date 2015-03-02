define(function (require) {
    'use strict';

    var Constants = require('constants');

    // All distances converted to meters.
    // Where to put scene width and scene height?
    // Would prefer to be able to pass in the detected canvas dimensions
    // as before...but it makes more sense to have models be in meters
    // than in proportions as before...
    var sceneWidth = 960;
    var sceneHeight = 620;

    var Initials = {};

    Initials.ShelfY = Constants.Scene.SHELF_FROM_TOP * sceneHeight / Constants.Scene.PX_PER_METER;
    Initials.SpringsY1 = 0.075 * sceneHeight / Constants.Scene.PX_PER_METER;

    // x and y are in meters
    var Bodies = [
        {
            mass : 0.05,
            x : 0.17,
            y: Initials.ShelfY
        },{
            mass : 0.10,
            x : 0.265,
            y: Initials.ShelfY
        },{
            mass : 0.10,
            x : 0.38,
            y: Initials.ShelfY
        },{
            mass : 0.25,
            x : 0.495,
            y: Initials.ShelfY
        },{
            mass : 0.07,
            x : 0.70,
            y: Initials.ShelfY,
            color: Constants.ColorConstants['pale-green'],
            label: false
        },{
            mass : 0.16,
            x : 0.805,
            y: Initials.ShelfY,
            color: Constants.ColorConstants['sky-blue'],
            label: false
        },{
            mass : 0.31,
            x : 0.94,
            y: Initials.ShelfY,
            color: Constants.ColorConstants['pale-orange'],
            label: false
        }
    ];

    var Springs = [{
        x : 0.15 * sceneWidth / Constants.Scene.PX_PER_METER,
        y1: Initials.SpringsY1
    },{
        x : 0.30 * sceneWidth / Constants.Scene.PX_PER_METER,
        y1: Initials.SpringsY1
    },{
        x : 0.45 * sceneWidth / Constants.Scene.PX_PER_METER,
        y1: Initials.SpringsY1
    }];

    var Pegs = [];

    Initials.Bodies = Bodies;
    Initials.Springs = Springs;
    Initials.Pegs = Pegs;

    return Initials;

});