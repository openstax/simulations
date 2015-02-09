define(function (require) {

    'use strict';

    var Body = require('models/body');

    var Presets = [
        {
            name: 'Sun and planet',
            bodies: [
                new Body({ mass: 200, x:   0, y: 0, vx: 0, vy:   0 }),
                new Body({ mass:  10, x: 150, y: 0, vx: 0, vy: 120 })
            ]
        },
        {
            name: 'Sun, planet, moon',
            bodies: [
                new Body({ mass: 200, x:   0, y: 0, vx: 0, vy:   0 }),
                new Body({ mass:  10, x: 160, y: 0, vx: 0, vy: 120 }),
                new Body({ mass:   0, x: 140, y: 0, vx: 0, vy:  53 })
            ]
        },
        {
            name: 'Sun, planet, comet',
            bodies: [
                new Body({ mass: 200, x:    0, y:   0, vx:   0, vy:   0 }),
                new Body({ mass:   1, x:  150, y:   0, vx:   0, vy: 120 }),
                new Body({ mass:   0, x: -220, y: 130, vx: -15, vy: -28 })
            ]
        },
        {
            name: 'Binary star, planet',
            bodies: [
                new Body({ mass: 150, x: -100, y: 0, vx: 0, vy: -60 }),
                new Body({ mass: 120, x:  100, y: 0, vx: 0, vy:  50 }),
                new Body({ mass:   0, x:  -50, y: 0, vx: 0, vy: 120 })
            ]
        },
        {
            name: 'Trojan asteroids',
            bodies: [
                new Body({ mass: 200, x:   0, y:    0, vx:    0, vy:   0 }),
                new Body({ mass:   5, x: 150, y:    0, vx:    0, vy: 119 }),
                new Body({ mass:   0, x:  75, y: -130, vx:  103, vy:  60 }),
                new Body({ mass:   0, x:  75, y:  130, vx: -103, vy:  60 })
            ]
        },
        {
            name: 'Four-star ballet',
            bodies: [
                new Body({ mass: 120, x: -100, y:  100, vx: -50, vy: -50 }),
                new Body({ mass: 120, x:  100, y:  100, vx: -50, vy:  50 }),
                new Body({ mass: 120, x:  100, y: -100, vx:  50, vy:  50 }),
                new Body({ mass: 120, x: -100, y: -100, vx:  50, vy: -50 })
            ]
        },
        {
            name: 'Slingshot',
            bodies: [
                new Body({ mass: 200, x: 1, y: 0, vx: 0, vy: -1 }),
                new Body({ mass:  10, x: 131, y: 55, vx: -55, vy: 115 }),
                new Body({ mass:   0, x: -6, y: -128, vx: 83, vy: 0 })
            ]
        },
        {
            name: 'Double slingshot',
            bodies: [
                new Body({ mass: 200, x:   0, y:    0, vx:   0, vy:  -1 }),
                new Body({ mass:   5, x:   0, y: -112, vx: 134, vy:   0 }),
                new Body({ mass:   4, x: 186, y:   -5, vx:   1, vy: 111 }),
                new Body({ mass:   0, x:  70, y:   72, vx: -47, vy:  63 })
            ]
        },
        {
            name: 'Hyperbolics',
            bodies: [
                new Body({ mass: 250, x: -50, y: -25, vx:    0, vy: 0 }),
                new Body({ mass:   0, x: 300, y:  50, vx: -120, vy: 0 }),
                new Body({ mass:   0, x: 300, y: 120, vx: -120, vy: 0 }),
                new Body({ mass:   0, x: 300, y: 190, vx: -120, vy: 0 })
            ]
        },
        {
            name: 'Ellipses',
            bodies: [
                new Body({ mass: 250, x: -200, y: 0, vx: 0, vy:   0 }),
                new Body({ mass:   0, x: -115, y: 0, vx: 0, vy: 151 }),
                new Body({ mass:   0, x:   50, y: 0, vx: 0, vy:  60 }),
                new Body({ mass:   0, x:  220, y: 0, vx: 0, vy:  37 })
            ]
        },
        {
            name: 'Double double',
            bodies: [
                new Body({ mass: 60, x: -115, y: -3, vx:  0, vy: -154 }),
                new Body({ mass: 70, x:  102, y:  0, vx:  1, vy:  150 }),
                new Body({ mass: 55, x:  -77, y: -2, vx: -1, vy:   42 }),
                new Body({ mass: 62, x:  135, y:  0, vx: -1, vy:  -52 })
            ]
        }
    ];

    return Presets;
});
