define(function (require) {

    'use strict';

    var _    = require('underscore');
    var PIXI = require('pixi');

    /**
     * There should really only be one Assets object per app, so
     *   to customize the Assets object to fit the needs of a 
     *   particular app, just use assign new values to the
     *   default properties.  There are three properties that
     *   should be set when customizing the Assets object for a
     *   new app:
     *
     * 1) Path:         Path is an optional string and is used to
     *                  make it faster to list out lots of images
     *                  and is prepended to every filename when
     *                  loading.  It is intended for this to be a
     *                  parent directory for all the images.
     *                  Note, however, that if images are stored
     *                  in multiple directories, this will have
     *                  to be a common parent for all files or
     *                  be left blank.
     *
     * 2) Images:       This is a json object containing refer-
     *                  ences to every image used in the appli-
     *                  cation.  The standard naming convention
     *                  should be that all keys on this object
     *                  are in all caps with underscores instead
     *                  of spaces.
     *
     * 3) SpriteSheets: Spritesheet is also a json object, but
     *                  the keys here are actually the names of
     *                  the sprite sheet files to be loaded, and
     *                  each value is an array of keys in the 
     *                  Images object for each of the images
     *                  contained in the sprite sheet.
     * 
     * Example usage:
     *
     *   Assets.Path = 'img/phet/optimized/';
     *
     *   Assets.Images = {
     *       BACK_LEG_01: 'back_leg_01.png',
     *       BACK_LEG_02: 'back_leg_02.png',
     *       BACK_LEG_03: 'back_leg_03.png',
     *       BACK_LEG_04: 'back_leg_04.png'
     *   };
     *
     *   Assets.SpriteSheets = {
     *       'leg-spritesheet.json': [
     *           Assets.Images.BACK_LEG_01,
     *           Assets.Images.BACK_LEG_02,
     *           Assets.Images.BACK_LEG_03,
     *           Assets.Images.BACK_LEG_04
     *       ]
     *   };
     */
    var Assets = {
        Path: '',
        Images: {},
        SpriteSheets: {}
    };

    Assets.getAssetList = function(regenerate) {
        if (!regenerate && this.assetList)
            return this.assetList;

        this.assetList = [];

        // Add all the spritesheet files first
        _.each(this.SpriteSheets, function(list, filename) {
            this.assetList.push(this.Path + filename);
        }, this);

        // Then add all the images that are on their own, not in a sprite sheet
        var spriteSheetImages = _.flatten(_.values(this.SpriteSheets));
        var leftoverImages = _.filter(this.Images, function(image) {
            return !_.contains(spriteSheetImages, image);
        });
        _.each(leftoverImages, function(filename) {
            this.assetList.push(this.Path + filename);
        }, this);

        return this.assetList;
    };

    /**
     * A function that returns the full relative path of an
     *   image file by prepending the path
     */
    Assets.Image = function(filename) {
        return this.Path + filename;
    };

    /**
     * This function returns a PIXI texture based on the file
     *   name, taking into account whether that filename is 
     *   part of a sprite sheet.
     */
    Assets.Texture = function(filename) {
        if (filename in PIXI.utils.TextureCache)
            return PIXI.utils.TextureCache[filename];
        if (this.Path + filename in PIXI.utils.TextureCache)
            return PIXI.utils.TextureCache[this.Path + filename];

        var spriteSheet;
        _.each(this.SpriteSheets, function(images, key) {
            _.each(images, function(image) {
                if (image === filename) {
                    spriteSheet = key;
                    return false;
                }
            }, this);
            if (spriteSheet)
                return false;
        }, this);

        if (spriteSheet)
            return PIXI.Texture.fromFrame(filename);
        else
            return PIXI.Texture.fromImage(this.Path + filename);
    };

    /**
     * Returns a PIXI Sprite made with the texture of the
     *   specified image file.
     */
    Assets.createSprite = function(textureFileName) {
        return new PIXI.Sprite(this.Texture(textureFileName));
    };

    /**
     * Returns the HTML for displaying a texture as a styled
     *   element instead of in PIXI.  This is a convenience
     *   function that allows us to use the same Assets
     *   references to make HTML or PIXI DisplayObjects.
     */
    Assets.createIcon = function(filename, attrs, iconWidth, iconHeight) {
        if (!_.isObject(attrs)) {
            iconWidth = attrs;
            iconHeight = iconHeight;
        }

        var texture = this.Texture(filename);
        if (!texture)
            throw 'Texture not found for ' + filename;

        var x = texture.crop.x;
        var y = texture.crop.y;
        var scale = 1;

        if (iconWidth !== undefined) {
            if (iconHeight === undefined)
                iconHeight = iconWidth;

            var textureRatio = texture.width / texture.height;
            var iconRatio    = iconWidth / iconHeight;
            
            scale = (iconRatio > textureRatio) ? iconHeight / texture.height : iconWidth / texture.width;
        }

        var iconStyle = [
            'position: absolute',
            'left: 50%',
            'top:  50%',
            'margin-left: -' + (texture.width / 2)  + 'px',
            'margin-top:  -' + (texture.height / 2) + 'px',
            'background-image: url(' + texture.baseTexture.source.src + ')',
            'background-position: -' + x + 'px -' + y + 'px',
            'transform: scale(' + scale + ', ' + scale + ')',
            'width: ' + texture.width  + 'px',
            'height: '+ texture.height + 'px'
        ].join(';');

        var iconHtml = '<div style="' + iconStyle + '"></div>';

        var attrsHtml = _.map(attrs, function(value, name) {
            return name + '="' + value + '"';
        }).join(' ');

        var wrapperStyle = [
            'position: relative',
            'width: ' + iconWidth  + 'px',
            'height: '+ iconHeight + 'px'
        ].join(';');

        var wrapperHtml = '<div ' + attrsHtml + ' style="' + wrapperStyle + '">' + iconHtml + '</div>';

        return wrapperHtml;
    };

    /**
     * Returns information about a texture like its source
     *   and the bounds of the portion of the file used.
     */
    Assets.getFrameData = function(filename) {
        var texture = this.Texture(filename);
        if (!texture)
            throw 'Texture not found for ' + filename;

        return {
            src: texture.baseTexture.source.src,
            bounds: texture.crop
        };
    };


    return Assets;
});
