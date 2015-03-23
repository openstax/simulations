define(function (require) {

    'use strict';

    var Levels = {};

    // Define tile values
    Levels.TILE_FLOOR  = 0;
    Levels.TILE_WALLS  = 1;
    Levels.TILE_START  = 2;
    Levels.TILE_FINISH = 3;

    // Character values to make mapping easier
    var charsToTileValues = {
        ' ': Levels.TILE_FLOOR,
        'W': Levels.TILE_WALLS,
        'S': Levels.TILE_START,
        'F': Levels.TILE_FINISH
    };

    var levels = {
        'Practice': [
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
        'Level 1': [
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
        ]
    };

    // Convert the level source strings into the tile values
    Levels.levels = {};
    _.each(levels, function(levelSource, key) {
        var level = [];

        for (var i = 0; i < levelSource.length; i++) {
            var cells = levelSource[i].split('');

            var row = [];
            for (var j = 0; j < cells.length; j++)
                row[j] = charsToTileValues[cells[j]];

            level.push(row);
        }

        Levels.levels[key] = level;
    });

    return Levels;
});
