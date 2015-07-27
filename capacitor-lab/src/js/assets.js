define(function (require) {

    'use strict';

    var Assets = require('common/pixi/assets');

    Assets.Path = 'img/';

    Assets.Images = {   
        BATTERY_UP:   'battery-up.png',
        BATTERY_DOWN: 'battery-down.png',
        VOLTMETER:    'voltmeter.png',
        PROBE_RED:    'probe-red.png',
        PROBE_BLACK:  'probe-black.png',
        PROBE_FIELD:  'probe-field.png',

        // E-Field Detector
        EFD_SHOW_VALUES_BTN_ON:    'show-values-btn-on',
        EFD_SHOW_VALUES_BTN_OFF:   'show-values-btn-off',
        EFD_CHECK_BTN_ON:          'check-btn-on',
        EFD_CHECK_BTN_OFF:         'check-btn-off',
        EFD_DISPLAY_AREA:          'display-area',
        EFD_DEVICE_BODY:           'device-body',
        EFD_ZOOM_IN_BTN:           'zoom-in-btn',
        EFD_ZOOM_IN_BTN_DISABLED:  'zoom-in-btn-disabled',
        EFD_ZOOM_OUT_BTN:          'zoom-out-btn',
        EFD_ZOOM_OUT_BTN_DISABLED: 'zoom-out-btn-disabled',
        EFD_ZOOM_LABEL:            'zoom-label'
    };

    Assets.SpriteSheets = {
        'e-field-detector.json': [
            Assets.Images.EFD_SHOW_VALUES_BTN_ON,
            Assets.Images.EFD_SHOW_VALUES_BTN_OFF,
            Assets.Images.EFD_CHECK_BTN_ON,
            Assets.Images.EFD_CHECK_BTN_OFF,
            Assets.Images.EFD_DISPLAY_AREA,
            Assets.Images.EFD_DEVICE_BODY,
            Assets.Images.EFD_ZOOM_IN_BTN,
            Assets.Images.EFD_ZOOM_IN_BTN_DISABLED,
            Assets.Images.EFD_ZOOM_OUT_BTN,
            Assets.Images.EFD_ZOOM_OUT_BTN_DISABLED,
            Assets.Images.EFD_ZOOM_LABEL
        ]
    };

    return Assets;
});
