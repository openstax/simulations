define(function (require) {

    'use strict';

    var _ = require('underscore');
    
    var Level = require('models/level');

    // Character values to make mapping easier
    var charsToTileValues = {
        ' ': Level.TILE_FLOOR,
        'W': Level.TILE_WALL,
        'S': Level.TILE_START,
        'F': Level.TILE_FINISH
    };

    var levels = {
        'Practice': [
            '                                ',
            '                           S    ',
            '                                ',
            '                                ',
            '                                ',
            '                                ',
            '                                ',
            '                                ',
            '                                ',
            '                                ',
            '   F                            ',
            '                                ',
            '                                ',
            '                                '
        ],
        'Level 1': [
            '                                ',
            '                           S    ',
            '                                ',
            '       W                        ',
            '       W                        ',
            '       WWWWWWWWWWWWWWWWWW       ',
            '                        W       ',
            '                        W       ',
            '                                ',
            '                                ',
            '   F                            ',
            '                                ',
            '                                ',
            '                                '
        ],
        'Level 2': [
            'W                              W',
            'W      WWWWWWWWWWWWWWWW    S   W',
            'W      W                       W',
            'W      W                       W',
            'W      W   WWWWWWWWWWWWWWWWW   W',
            'W      W   W                   W',
            'W      W   W                   W',
            'W          W                   W',
            'W          W                   W',
            'W          W                   W',
            'W  F       WWWWWWWWWWWWWWWWW   W',
            'W                              W',
            'W                              W',
            'W                              W'
        ],
        'Certain Death': [
            '       WWWWWWWWWWWWWWWWW       W',
            '       W       W       W   S   W',
            '       W               W       W',
            '       W  W                    W',
            '       W  WWWWWWWW        WWWWWW',
            '       W  W      W  W          W',
            'WWWWWWWW  W      W  W          W',
            'W             W  W  W          W',
            'W             W     W      W   W',
            'W             W     W      W   W',
            'W  F       WWWWWWWWWWWWWWWWW   W',
            'W             W     W      W   W',
            '              W     W          W',
            '   WWWWWWWWWWWW                W'
        ]
    };

    // Convert the level source strings into the tile values
    var Levels = {};
    _.each(levels, function(levelSource, key) {
        Levels[key] = Level.fromStringArray(levelSource, charsToTileValues);
    });

    return Levels;
});
