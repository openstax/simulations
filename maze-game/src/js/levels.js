define(function (require) {

    'use strict';

    var Level = require('models/level');

    var Levels = {};

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
            '                                ',
            '                                ',
            '                                ',
            '                                ',
            '                                ',
            '                                ',
            '                                ',
            '                                ',
            '                                ',
            '                                ',
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
    Levels.levels = {};
    _.each(levels, function(levelSource, key) {
        var data = [];

        for (var i = 0; i < levelSource.length; i++) {
            var cells = levelSource[i].split('');

            var row = [];
            for (var j = 0; j < cells.length; j++)
                row[j] = charsToTileValues[cells[j]];

            data.push(row);
        }

        Levels.levels[key] = new Level(data);
    });

    return Levels;
});
