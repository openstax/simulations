(function () {
    'use strict';

    // Load the config
    require(['config'], function () {
        require(['jquery', 'views/app'], function($, RadioWavesAppView) {

            $(function(){
                var appView = new RadioWavesAppView();

                // Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
            });
    
        });
    });

})();
