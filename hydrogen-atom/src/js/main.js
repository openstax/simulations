(function () {
    'use strict';

    // Load the config
    require(['config'], function () {
        require(['jquery', 'hydrogen-atom/views/app'], function($, HydrogenAtomAppView) {

            $(function(){
                var appView = new HydrogenAtomAppView();

                // Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
            });
    
        });
    });

})();
