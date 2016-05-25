(function () {
    'use strict';

    // Load the config
    require(['config'], function () {
        require(['jquery', 'nuclear-fission/views/app'], function($, NuclearFissionAppView) {

            $(function(){
                var appView = new NuclearFissionAppView();

                // Append to body
                $('body').append(appView.el);

                // Render main app view
                appView.load();
            });
    
        });
    });

})();
