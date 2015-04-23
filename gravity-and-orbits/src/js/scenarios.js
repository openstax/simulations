define(function (require) {

    'use strict';

    var Vector2 = require('common/math/vector2');

    var Constants = require('constants');

    var Body      = require('models/body');
    var Sun       = require('models/body/sun');
    var Planet    = require('models/body/planet');
    var Moon      = require('models/body/moon');
    var Satellite = require('models/body/satellite');

    // These constants are only used in defining the scenarios,
    //   scenarios are used to configure instances of the
    //   simulation model, so we keep them here.
    var SUN_RADIUS = 6.955E8;
    var SUN_MASS = 1.989E30;

    var EARTH_RADIUS = 6.371E6;
    var EARTH_MASS = 5.9736E24;
    var EARTH_PERIHELION = 147098290E3;
    var EARTH_ORBITAL_SPEED_AT_PERIHELION = 30300;
    var FRIENDLY_EARTH_MASS_SCALE = 10200; // Tuned by hand so there are 12 cartoon lunar orbits in one cartoon earth orbit

    var MOON_MASS = 7.3477E22;
    var MOON_RADIUS = 1737.1E3;
    var MOON_EARTH_SPEED = -1.01E3;
    var MOON_SPEED = MOON_EARTH_SPEED;
    var MOON_PERIGEE = 391370E3;
    var MOON_X = EARTH_PERIHELION;
    var MOON_Y = MOON_PERIGEE;

    // See http://en.wikipedia.org/wiki/International_Space_Station
    var SPACE_STATION_RADIUS = 109;
    var SPACE_STATION_MASS = 369914;
    var SPACE_STATION_SPEED = 7706;
    var SPACE_STATION_PERIGEE = 347000;

    // View constants
    var FORCE_SCALE = 76.0 / 5.179E15;


    // There are two classes of scenarios
    var Scenarios = {};

    // To-scale scenarios
    Scenarios.ToScale = [
        {
            name: 'Sun and Planet',
            bodies: [
                new Sun({
                    mass:   SUN_MASS,
                    radius: SUN_RADIUS
                }),
                new Planet({
                    mass:   EARTH_MASS,
                    radius: EARTH_RADIUS,
                    position: new Vector2(EARTH_PERIHELION, 0),
                    velocity: new Vector2(0, EARTH_ORBITAL_SPEED_AT_PERIHELION)
                })
            ],
            simulationAttributes: {
                timeScale: 1
            },
            viewSettings: {
                defaultZoom: 1.25,
                forceScale: FORCE_SCALE * 120
            }
        },
        {
            name: 'Sun, Planet, and Moon',
            bodies: [
                new Sun({
                    mass:   SUN_MASS,
                    radius: SUN_RADIUS
                }),
                new Planet({
                    mass:   EARTH_MASS,
                    radius: EARTH_RADIUS,
                    position: new Vector2(EARTH_PERIHELION, 0),
                    velocity: new Vector2(0, EARTH_ORBITAL_SPEED_AT_PERIHELION)
                }),
                new Moon({
                    mass: MOON_MASS,
                    radius: MOON_RADIUS,
                    position: new Vector2(MOON_X, MOON_Y),
                    velocity: new Vector2(MOON_SPEED, EARTH_ORBITAL_SPEED_AT_PERIHELION)
                })
            ],
            simulationAttributes: {
                timeScale: 1
            },
            viewSettings: {
                defaultZoom: 1.25,
                forceScale: FORCE_SCALE * 120
            }
        },
        {
            name: 'Planet and Moon',
            bodies: [
                new Planet({
                    mass:   EARTH_MASS,
                    radius: EARTH_RADIUS,
                    position: new Vector2(EARTH_PERIHELION, 0)
                }),
                new Moon({
                    mass:   MOON_MASS,
                    radius: MOON_RADIUS,
                    position: new Vector2(MOON_X, MOON_Y),
                    velocity: new Vector2(MOON_SPEED, 0)
                })
            ],
            simulationAttributes: {
                timeScale: 1
            },
            viewSettings: {
                defaultZoom: 400,
                forceScale: FORCE_SCALE * 45
            }
        },
        {
            name: 'Planet and Satellite',
            bodies: [
                new Planet({
                    mass:   EARTH_MASS,
                    radius: EARTH_RADIUS
                }),
                new Satellite({
                    mass: SPACE_STATION_MASS,
                    radius: SPACE_STATION_RADIUS,
                    position: new Vector2(SPACE_STATION_PERIGEE + EARTH_RADIUS + SPACE_STATION_RADIUS, 0),
                    velocity: new Vector2(0, SPACE_STATION_SPEED)
                })
            ],
            simulationAttributes: {
                timeScale: 1
            },
            viewSettings: {
                defaultZoom: 21600,
                forceScale: FORCE_SCALE * 3E13
            }
        }
    ];

    // Friendly-scale scenarios ("cartoon" in the original)
    Scenarios.Friendly = [
        {
            name: 'Sun and Planet',
            bodies: [
                new Sun({
                    mass:   SUN_MASS,
                    radius: SUN_RADIUS * 50,
                    fixed: true // Sun shouldn't move in friendly modes
                }),
                new Planet({
                    mass:   EARTH_MASS * FRIENDLY_EARTH_MASS_SCALE, 
                    radius: EARTH_RADIUS * 800,
                    position: new Vector2(EARTH_PERIHELION, 0),
                    velocity: new Vector2(0, EARTH_ORBITAL_SPEED_AT_PERIHELION)
                })
            ],
            simulationAttributes: {
                // Have to artificially scale up the time readout so that Sun/Earth/Moon mode 
                //   has a stable orbit with correct periods since masses are nonphysical
                timeScale: 365 / 334
            },
            viewSettings: {
                defaultZoom: 1.25,
                // To balance increased mass and so that forces are 1/2 grid cell in default 
                //   conditions, hand tuned by checking that reducing the distance by a 
                //   factor of 2 increases the force arrow by a factor of 4
                forceScale: FORCE_SCALE * 120 * (0.573 / FRIENDLY_EARTH_MASS_SCALE)
            }
        },
        {
            name: 'Sun, Planet, and Moon',
            bodies: [
                new Sun({
                    mass:   SUN_MASS,
                    radius: SUN_RADIUS * 50,
                    fixed: true // Sun shouldn't move in friendly modes
                }),
                new Planet({
                    mass:   EARTH_MASS * FRIENDLY_EARTH_MASS_SCALE,
                    radius: EARTH_RADIUS * 800,
                    position: new Vector2(EARTH_PERIHELION, 0),
                    velocity: new Vector2(0, EARTH_ORBITAL_SPEED_AT_PERIHELION)
                }),
                new Moon({
                    mass:   MOON_MASS,
                    radius: MOON_RADIUS * 800,
                    position: new Vector2(MOON_X, MOON_Y),
                    velocity: new Vector2(MOON_SPEED, EARTH_ORBITAL_SPEED_AT_PERIHELION)
                })
            ],
            simulationAttributes: {
                // Have to artificially scale up the time readout so that Sun/Earth/Moon mode 
                //   has a stable orbit with correct periods since masses are nonphysical
                timeScale: 365 / 334
            },
            viewSettings: {
                defaultZoom: 1.25,
                // To balance increased mass and so that forces are 1/2 grid cell in default 
                //   conditions, hand tuned by checking that reducing the distance by a 
                //   factor of 2 increases the force arrow by a factor of 4
                forceScale: FORCE_SCALE * 120 * (0.573 / FRIENDLY_EARTH_MASS_SCALE)
            }
        },
        {
            name: 'Planet and Moon',
            bodies: [
                new Planet({
                    mass:   EARTH_MASS,
                    radius: EARTH_RADIUS * 15,
                    position: new Vector2(EARTH_PERIHELION, 0)
                }),
                new Moon({
                    mass:   MOON_MASS,
                    radius: MOON_RADIUS * 15,
                    position: new Vector2(MOON_X, MOON_Y),
                    velocity: new Vector2(MOON_SPEED, 0)
                })
            ],
            simulationAttributes: {
                timeScale: 1
            },
            viewSettings: {
                defaultZoom: 400,
                forceScale: FORCE_SCALE * 0.77 // So that default gravity force takes up 1/2 cell in grid
            }
        },
        {
            name: 'Planet and Satellite',
            bodies: [
                new Planet({
                    mass:   EARTH_MASS,
                    radius: EARTH_RADIUS * 0.8
                }),
                new Satellite({
                    mass:   SPACE_STATION_MASS,
                    radius: SPACE_STATION_RADIUS * 8,
                    position: new Vector2(SPACE_STATION_PERIGEE + EARTH_RADIUS + SPACE_STATION_RADIUS, 0),
                    velocity: new Vector2(0, SPACE_STATION_SPEED)
                })
            ],
            simulationAttributes: {
                timeScale: 1
            },
            viewSettings: {
                defaultZoom: 21600,
                forceScale: FORCE_SCALE * 3E13
            }
        },
    ];

    return Scenarios;
});
