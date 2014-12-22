define(function (require) {

    'use strict';

    var $    = require('jquery');
    var _    = require('underscore');
    var PIXI = require('pixi');

    /**
     * The assets function is an object that stores all the lists of
     *   assets, but it's also a function that returns a PIXI texture
     *   based on the file name, taking into account whether that 
     *   filename is part of a sprite sheet.
     */
    var Assets = {};

    var IMAGE_PATH = 'img/phet/optimized/';

    Assets.Images = {
        BACK_LEG_01:                   'back_leg_01.png',
        BACK_LEG_02:                   'back_leg_02.png',
        BACK_LEG_03:                   'back_leg_03.png',
        BACK_LEG_04:                   'back_leg_04.png',
        BACK_LEG_05:                   'back_leg_05.png',
        BACK_LEG_06:                   'back_leg_06.png',
        BACK_LEG_07:                   'back_leg_07.png',
        BACK_LEG_08:                   'back_leg_08.png',
        BACK_LEG_09:                   'back_leg_09.png',
        BACK_LEG_10:                   'back_leg_10.png',
        BACK_LEG_11:                   'back_leg_11.png',
        BACK_LEG_12:                   'back_leg_12.png',
        BACK_LEG_13:                   'back_leg_13.png',
        BACK_LEG_14:                   'back_leg_14.png',
        BACK_LEG_15:                   'back_leg_15.png',
        BACK_LEG_16:                   'back_leg_16.png',
        BACK_LEG_17:                   'back_leg_17.png',
        BACK_LEG_18:                   'back_leg_18.png',
        BACK_LEG_19:                   'back_leg_19.png',
        BACK_LEG_20:                   'back_leg_20.png',
        BACK_LEG_21:                   'back_leg_21.png',
        BACK_LEG_22:                   'back_leg_22.png',
        BACK_LEG_23:                   'back_leg_23.png',
        BACK_LEG_24:                   'back_leg_24.png',
        BICYCLE_FRAME_3:               'bicycle_frame_3.png',
        BICYCLE_ICON:                  'bicycle_icon.png',
        BICYCLE_RIDER:                 'bicycle_rider.png',
        BICYCLE_RIDER_TIRED:           'bicycle_rider_tired.png',
        BICYCLE_SPOKES:                'bicycle_spokes.png',
        BRICK_TEXTURE_FRONT:           'brick_texture_front.png',
        BRICK_TEXTURE_RIGHT:           'brick_texture_right.png',
        BRICK_TEXTURE_TOP:             'brick_texture_top.png',
        CLOUD_1:                       'cloud_1.png',
        CONNECTOR:                     'connector.png',
        ELEMENT_BASE_BACK:             'element_base_back.png',
        ELEMENT_BASE_FRONT:            'element_base_front.png',
        E_CHEM_BLANK_LIGHT:            'E_chem_blank_light.png',
        E_DASHED_BLANK:                'E_dashed_blank.png',
        E_ELECTRIC_BLANK:              'E_electric_blank.png',
        E_LIGHT_BLANK:                 'E_light_blank.png',
        E_MECH_BLANK:                  'E_mech_blank.png',
        E_THERM_BLANK_ORANGE:          'E_therm_blank_orange.png',
        FAUCET_ICON:                   'faucet_icon.png',
        FLAME:                         'flame.png',
        FLUORESCENT_BACK_2:            'fluorescent_back_2.png',
        FLUORESCENT_FRONT_2:           'fluorescent_front_2.png',
        FLUORESCENT_ICON:              'fluorescent_icon.png',
        FLUORESCENT_ON_BACK_2:         'fluorescent_on_back_2.png',
        FLUORESCENT_ON_FRONT_2:        'fluorescent_on_front_2.png',
        FRONT_LEG_01:                  'front_leg_01.png',
        FRONT_LEG_02:                  'front_leg_02.png',
        FRONT_LEG_03:                  'front_leg_03.png',
        FRONT_LEG_04:                  'front_leg_04.png',
        FRONT_LEG_05:                  'front_leg_05.png',
        FRONT_LEG_06:                  'front_leg_06.png',
        FRONT_LEG_07:                  'front_leg_07.png',
        FRONT_LEG_08:                  'front_leg_08.png',
        FRONT_LEG_09:                  'front_leg_09.png',
        FRONT_LEG_10:                  'front_leg_10.png',
        FRONT_LEG_11:                  'front_leg_11.png',
        FRONT_LEG_12:                  'front_leg_12.png',
        FRONT_LEG_13:                  'front_leg_13.png',
        FRONT_LEG_14:                  'front_leg_14.png',
        FRONT_LEG_15:                  'front_leg_15.png',
        FRONT_LEG_16:                  'front_leg_16.png',
        FRONT_LEG_17:                  'front_leg_17.png',
        FRONT_LEG_18:                  'front_leg_18.png',
        FRONT_LEG_19:                  'front_leg_19.png',
        FRONT_LEG_20:                  'front_leg_20.png',
        FRONT_LEG_21:                  'front_leg_21.png',
        FRONT_LEG_22:                  'front_leg_22.png',
        FRONT_LEG_23:                  'front_leg_23.png',
        FRONT_LEG_24:                  'front_leg_24.png',
        GENERATOR:                     'generator.png',
        GENERATOR_ICON:                'generator_icon.png',
        GENERATOR_WHEEL_HUB_2:         'generator_wheel_hub_2.png',
        GENERATOR_WHEEL_PADDLES_SHORT: 'generator_wheel_paddles_short.png',
        GENERATOR_WHEEL_SPOKES:        'generator_wheel_spokes.png',
        HEATER_ELEMENT:                'heater_element.png',
        HEATER_ELEMENT_DARK:           'heater_element_dark.png',
        ICE_CUBE_STACK:                'ice-cube-stack.png',
        INCANDESCENT_2:                'incandescent_2.png',
        INCANDESCENT_ICON:             'incandescent_icon.png',
        INCANDESCENT_ON_3:             'incandescent_on_3.png',
        SHELF_LONG:                    'shelf_long2.png',
        SOLAR_PANEL:                   'solar_panel.png',
        SOLAR_PANEL_GEN:               'solar_panel_gen.png',
        SOLAR_PANEL_ICON:              'solar_panel_icon.png',
        SOLAR_PANEL_POST_2:            'solar_panel_post_2.png',
        SUN_ICON:                      'sun_icon.png',
        TEAPOT_ICON:                   'teapot_icon.png',
        TEAPOT_LARGE:                  'teapot_large.png',
        THERMOMETER_MEDIUM_BACK:       'thermometer_medium_back.png',
        THERMOMETER_MEDIUM_FRONT:      'thermometer_medium_front.png',
        THERMOMETER_CLIP_BACK:         'thermometer-clip-back.png',
        THERMOMETER_CLIP_FRONT:        'thermometer-clip-front.png',
        THERMOMETER_CLIP_BASE:         'thermometer-clip-base.png',
        WATER_ICON:                    'water_icon.png',
        WIRE_BLACK_62:                 'wire_black_62.png',
        WIRE_BLACK_LEFT:               'wire_black_left.png',
        WIRE_BLACK_RIGHT:              'wire_black_right.png',
    };

    // // Prepend the path to each file name
    // Assets.Images = _.each(Assets.Images, function(value, key) {
    //     Assets.Images[key] = IMAGE_PATH + value;
    // });

    Assets.SpriteSheets = {
        'bike-spritesheet.json': [
            Assets.Images.BICYCLE_FRAME_3,
            Assets.Images.BICYCLE_ICON,
            Assets.Images.BICYCLE_RIDER,
            Assets.Images.BICYCLE_RIDER_TIRED,
            Assets.Images.BICYCLE_SPOKES
        ],
        'brick-texture-spritesheet.json': [
            Assets.Images.BRICK_TEXTURE_FRONT,
            Assets.Images.BRICK_TEXTURE_RIGHT,
            Assets.Images.BRICK_TEXTURE_TOP
        ],
        'converters-spritesheet.json': [
            Assets.Images.CONNECTOR,
            Assets.Images.GENERATOR,
            Assets.Images.GENERATOR_WHEEL_SPOKES,
            Assets.Images.GENERATOR_WHEEL_HUB_2,
            Assets.Images.GENERATOR_WHEEL_PADDLES_SHORT,
            Assets.Images.SOLAR_PANEL,
            Assets.Images.SOLAR_PANEL_GEN,
            Assets.Images.SOLAR_PANEL_POST_2,
            Assets.Images.WIRE_BLACK_LEFT
        ],
        'energy-symbols-spritesheet.json': [
            Assets.Images.E_CHEM_BLANK_LIGHT,
            Assets.Images.E_DASHED_BLANK,
            Assets.Images.E_ELECTRIC_BLANK,
            Assets.Images.E_LIGHT_BLANK,
            Assets.Images.E_MECH_BLANK,
            Assets.Images.E_THERM_BLANK_ORANGE
        ],
        'icons-spritesheet.json': [
            Assets.Images.TEAPOT_ICON,
            Assets.Images.WATER_ICON,
            Assets.Images.SUN_ICON,
            Assets.Images.GENERATOR_ICON,
            Assets.Images.INCANDESCENT_ICON,
            Assets.Images.FLUORESCENT_ICON,
            Assets.Images.BICYCLE_ICON,
            Assets.Images.FAUCET_ICON,
            Assets.Images.SOLAR_PANEL_ICON
        ],
        'leg-spritesheet.json': [
            Assets.Images.BACK_LEG_01,
            Assets.Images.BACK_LEG_02,
            Assets.Images.BACK_LEG_03,
            Assets.Images.BACK_LEG_04,
            Assets.Images.BACK_LEG_05,
            Assets.Images.BACK_LEG_06,
            Assets.Images.BACK_LEG_07,
            Assets.Images.BACK_LEG_08,
            Assets.Images.BACK_LEG_09,
            Assets.Images.BACK_LEG_10,
            Assets.Images.BACK_LEG_11,
            Assets.Images.BACK_LEG_12,
            Assets.Images.BACK_LEG_13,
            Assets.Images.BACK_LEG_14,
            Assets.Images.BACK_LEG_15,
            Assets.Images.BACK_LEG_16,
            Assets.Images.BACK_LEG_17,
            Assets.Images.BACK_LEG_18,
            Assets.Images.BACK_LEG_19,
            Assets.Images.BACK_LEG_20,
            Assets.Images.BACK_LEG_21,
            Assets.Images.BACK_LEG_22,
            Assets.Images.BACK_LEG_23,
            Assets.Images.BACK_LEG_24,
            Assets.Images.FRONT_LEG_01,
            Assets.Images.FRONT_LEG_02,
            Assets.Images.FRONT_LEG_03,
            Assets.Images.FRONT_LEG_04,
            Assets.Images.FRONT_LEG_05,
            Assets.Images.FRONT_LEG_06,
            Assets.Images.FRONT_LEG_07,
            Assets.Images.FRONT_LEG_08,
            Assets.Images.FRONT_LEG_09,
            Assets.Images.FRONT_LEG_10,
            Assets.Images.FRONT_LEG_11,
            Assets.Images.FRONT_LEG_12,
            Assets.Images.FRONT_LEG_13,
            Assets.Images.FRONT_LEG_14,
            Assets.Images.FRONT_LEG_15,
            Assets.Images.FRONT_LEG_16,
            Assets.Images.FRONT_LEG_17,
            Assets.Images.FRONT_LEG_18,
            Assets.Images.FRONT_LEG_19,
            Assets.Images.FRONT_LEG_20,
            Assets.Images.FRONT_LEG_21,
            Assets.Images.FRONT_LEG_22,
            Assets.Images.FRONT_LEG_23,
            Assets.Images.FRONT_LEG_24
        ],
        'thermometer-spritesheet.json': [
            Assets.Images.THERMOMETER_MEDIUM_BACK,
            Assets.Images.THERMOMETER_MEDIUM_FRONT,
            Assets.Images.THERMOMETER_CLIP_BACK,
            Assets.Images.THERMOMETER_CLIP_FRONT
        ],
        'users-spritesheet.json': [
            Assets.Images.ELEMENT_BASE_BACK,
            Assets.Images.ELEMENT_BASE_FRONT,
            Assets.Images.FLUORESCENT_BACK_2,
            Assets.Images.FLUORESCENT_FRONT_2,
            Assets.Images.FLUORESCENT_ON_BACK_2,
            Assets.Images.FLUORESCENT_ON_FRONT_2,
            Assets.Images.HEATER_ELEMENT,
            Assets.Images.HEATER_ELEMENT_DARK,
            Assets.Images.INCANDESCENT_2,
            Assets.Images.INCANDESCENT_ON_3,
            Assets.Images.WIRE_BLACK_62,
            Assets.Images.WIRE_BLACK_RIGHT
        ]
    };

    Assets.Image = function(filename) {
        return IMAGE_PATH + filename;
    };

    /**
     * This function returns a PIXI texture based on the file
     *   name, taking into account whether that filename is 
     *   part of a sprite sheet.
     */
    Assets.Texture = function(filename) {
        if (filename in PIXI.TextureCache)
            return PIXI.TextureCache[filename];
        if (IMAGE_PATH + filename in PIXI.TextureCache)
            return PIXI.TextureCache[IMAGE_PATH + filename];

        var spriteSheet;
        _.each(Assets.SpriteSheets, function(images, key) {
            _.each(images, function(image) {
                if (image === filename) {
                    spriteSheet = key;
                    return false;
                }
            });
            if (spriteSheet)
                return false;
        });

        if (spriteSheet)
            return PIXI.Texture.fromFrame(filename);
        else
            return PIXI.Texture.fromImage(IMAGE_PATH + filename);
    };

    Assets.createSprite = function(textureFileName) {
        return new PIXI.Sprite(Assets.Texture(textureFileName));
    };

    Assets.createIcon = function(filename, attrs, iconWidth, iconHeight) {
        if (!_.isObject(attrs)) {
            iconWidth = attrs;
            iconHeight = iconHeight;
        }

        var texture = Assets.Texture(filename);
        if (!texture)
            throw 'Texture not found for ' + filename;

        var width;
        var height;
        var x = texture.crop.x;
        var y = texture.crop.y;
        var scale = 1;

        if (iconWidth !== undefined) {
            if (iconHeight === undefined)
                iconHeight = iconWidth;

            var textureRatio = texture.width / texture.height;
            var iconRatio    = iconWidth / iconHeight;
            
            if (iconRatio > textureRatio) {
                width = texture.width * iconHeight / texture.height;
                height = iconHeight;
            }
            else {
                width = iconWidth;
                height = texture.height * iconWidth / texture.width;
            }

            scale = width / texture.width;
            x *= scale;
            y *= scale;
        }
        else { 
            width  = texture.width;
            height = texture.height;
        }

        var attrsHtml = _.map(attrs, function(value, name) {
            return name + '="' + value + '"';
        }).join(' ');

        var stylesHtml = [
            'background-image: url(' + texture.baseTexture.source.src + ')',
            'background-position: -' + x + 'px -' + y + 'px',
            'transform: scale(' + scale + ', ' + scale + ')',
            'width: ' + width  + 'px',
            'height: '+ height + 'px'
        ].join(';');

        var iconHtml = '<div ' + attrsHtml + ' style="' + stylesHtml + '"></div>';

        return iconHtml;
    };

    Assets.getFrameData = function(filename) {
        var texture = Assets.Texture(filename);
        if (!texture)
            throw 'Texture not found for ' + filename;

        return {
            src: texture.baseTexture.source.src,
            bounds: texture.crop
        };
    };

    /*************************************************************************
     **                                                                     **
     **                        ASSETS LIST FOR LOADING                      **
     **                                                                     **
     *************************************************************************/

    Assets.assetsList = [];

    // Add all the spritesheet files first
    _.each(Assets.SpriteSheets, function(list, filename) {
        Assets.assetsList.push(IMAGE_PATH + filename);
    });

    // Then add all the images that are on their own, not in a sprite sheet
    var spriteSheetImages = _.flatten(_.values(Assets.SpriteSheets));
    var leftoverImages = _.filter(Assets.Images, function(image) {
        return !_.contains(spriteSheetImages, image);
    });
    _.each(leftoverImages, function(filename) {
        Assets.assetsList.push(IMAGE_PATH + filename);
    });

    

    return Assets;
});
