define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        CANNON:             'cannon.png',
        CANNON_CARRIAGE:    'cannon-carriage.png',
        CANNON_BALL:        'cannon-ball.png',
        FLAME_PARTICLE:     'flame-particle.png',
        SMOKE_PARTICLE:     'smoke-particle.png',
        TANK_SHELL:         'tank-shell.png',
        GOLFBALL:           'golfball.png',
        BASEBALL:           'baseball.png',
        BOWLINGBALL:        'bowlingball.png',
        BOWLINGBALL_IMPACT: 'bowlingball-impact.png',
        FOOTBALL:           'football.png',
        PUMPKIN:            'pumpkin.png',
        PUMPKIN_IMPACT:     'pumpkin-impact.png',
        HUMAN:              'adult-human.png',
        HUMAN_IMPACT:       'adult-human-impact.png',
        PIANO:              'piano.png',
        PIANO_IMPACT:       'piano-impact.png',
        BUICK:              'buick.png',
        BUICK_IMPACT:       'buick-impact.png'
    };

    Assets.SpriteSheets = {};

    return Assets;
});
