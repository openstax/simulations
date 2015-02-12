define(function (require) {
    'use strict';

    var Constants = require('constants');

    var Initials = {};

    var Bodies = [
        {
            mass : 0.05,
            x : 0.1,
            y: 0.8
        },{
            mass : 0.10,
            x : 0.15,
            y: 0.8
        },{
            mass : 0.10,
            x : 0.20,
            y: 0.8
        },{
            mass : 0.25,
            x : 0.25,
            y: 0.8
        },{
            mass : 0.07,
            x : 0.4,
            y: 0.8,
            color: Constants.ColorConstants['pale-green'],
            label: false
        },{
            mass : 0.16,
            x : 0.45,
            y: 0.8,
            color: Constants.ColorConstants['sky-blue'],
            label: false
        },{
            mass : 0.31,
            x : 0.5,
            y: 0.8,
            color: Constants.ColorConstants['pale-orange'],
            label: false
        }
    ];

    var Springs = [{
        x : 0.15,
        y1: 0.1
    },{
        x : 0.30,
        y1: 0.1
    },{
        x : 0.45,
        y1: 0.1
    }];

    var Pegs = [];

    Initials.Bodies = Bodies;
    Initials.Springs = Springs;
    Initials.Pegs = Pegs;

    return Initials;

});