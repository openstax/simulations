define(function(require) {

    'use strict';

    var $        = require('jquery');
    var _        = require('underscore');
    var Backbone = require('backbone');

    var template = require('text!./app.html');
    var loadingScreenHtml = require('text!./loading-screen.html');

    require('less!./app');
    require('less!./tabs');

    var AppView = Backbone.View.extend({

        template: _.template(template),
        tagName: 'div',
        className: 'app-view',

        /**
         * List of constructors to call to create each sim view (tab)
         */
        simViewConstructors: [],
        defaultSimViewIndex: 0,

        events: {
            'click .sim-tab' : 'tabClicked'
        },

        initialize: function(options) {},

        /**
         * This function should be called to start the app. Calling this
         *   function shows a loading screen, loads all the individual sim
         *   views (tabs), and then calls postLoad when it is finished.
         */
        load: function() {
            this.$el.empty();
            this.showLoading();

            this.on('sim-views-initialized', function(){
                this.postLoad();
            });

            this.initSimViews();
        },

        /**
         * This function completes the behind-the-scenes setup of the app.
         *   It is called when things have been initialized but not
         *   rendered.  At this point, the loading screen has not yet been
         *   taken down, so we render everything while it's all still
         *   hidden by the loading screen.  After we've rendered and
         *   called postRender, we take down the loading screen and open
         *   everything up for business.
         */
        postLoad: function() {
            this.render();
            this.postRender();
            this.selectDefaultTab();
            this.hideLoading();
        },

        selectDefaultTab: function() {
            if (AppView.getUrlParameter('defaultTabIndex'))
                this.defaultSimViewIndex = parseInt(AppView.getUrlParameter('defaultTabIndex'));

            var $tabs = this.$('.sim-tab');
            if (this.defaultSimViewIndex < $tabs.length)
                $tabs.eq(this.defaultSimViewIndex).click();
        },

        /**
         * Shows the loading screen, which should cover the page and hide
         *   everything that is happening behind it.
         */
        showLoading: function() {
            this.$loadingScreen = $(loadingScreenHtml).appendTo(this.el);
        },

        /**
         * Hides the loading screen.
         */
        hideLoading: function() {
            this.$loadingScreen.fadeOut(300, function() {
                this.remove();
            });
        },

        /**
         * Initializes each individual sim view (tabs) and triggers a
         *   'sim-views-initialized' event when they've all finished
         *   their initialization process.  This is one of the loading
         *   processes and prerequisites for rendering.
         */
        initSimViews: function() {
            this.simViewsInitialized = false;
            this.simViews = [];
            _.each(this.simViewConstructors, function(constructor) {
                setTimeout(_.bind(function(){
                    this.simViews.push(new constructor());
                    if (this.simViews.length === this.simViewConstructors.length) {
                        this.simViewsInitialized = true;
                        this.trigger('sim-views-initialized');
                    }
                }, this), 0);
            }, this);
        },

        /**
         * Returns the data object that will be passed to the template
         *   when rendering the app view.
         */
        getRenderData: function() {
            var data = {
                link: this.simViews[0].link,
                simViews: _.map(this.simViews, function(simView) {
                    return {
                        cid:   simView.cid,
                        name:  simView.name,
                        title: simView.title
                    };
                })
            };

            return data;
        },

        /**
         * Renders the app view and all its child views (sim views).
         */
        render: function() {
            // Render basic page structure
            this.$el.append(this.template(this.getRenderData()));

            // Set all the sim content containers to rendering mode
            this.$('.sim-content').addClass('rendering');

            // Then render views for each sim
            _.each(this.simViews, this.renderSimView, this);

            return this;
        },

        /**
         * Renders an individual sim view.
         */
        renderSimView: function(simView) {
            simView.render();
            this.$('#sim-' + simView.name).html(simView.el);
        },

        /**
         * Called after every component on the page has rendered to make sure
         *   things like widths and heights and offsets are correct.
         */
        postRender: function() {
            // Make them all visible for the post-render calculations
            this.$('.sim-content').addClass('active');

            _.each(this.simViews, function(simView) {
                simView.postRender();
            });

            // Take all the sim content containers out of rendering mode
            this.$('.sim-content').removeClass('rendering');

            // Only hide the other tabs after they've all been rendered visibly
            this.$('.sim-tab').first().click();
        },

        /**
         * Calls the Backbone.View's remove function and also calls remove on
         *   each of its child views (sim views).
         */
        remove: function() {
            Backbone.View.prototype.remove.apply(this);
            _.each(this.simViews, function(sim, key) {
                sim.remove();
            });
        },

        /**
         * This is the event handler for when a tab is clicked. It visually
         *   activates the desired tab and deactivates the others but leaves
         *   the technical activation of the sim views to another handler by
         *   triggering a 'tab-selected' jQuery event on the tab element.
         */
        tabClicked: function(event) {
            var $tab = $(event.target).closest('.tab');
            if (!$tab.hasClass('active')) {
                // Activate the right tab, deactivating the others
                var selector = $tab.data('content-selector');
                $tab.add(this.$(selector))
                    .addClass('active')
                    .siblings()
                    .removeClass('active');

                this.simSelected($tab.data('cid'));
            }
        },

        /**
         * Plays the right sim, pausing (halting) the others.
         */
        simSelected: function(cid) {
            _.each(this.simViews, function(sim){
                if (sim.cid == cid)
                    sim.resume();
                else
                    sim.halt();
            }, this);
        }

    }, {

        /**
         * The threshold for determining if the we're in short sim mode
         */
        shortWindowHeight: 560,

        /**
         * Returns whether or not we are working in a "short" window
         *   (based on the shortWindowHeight threshold).
         */
        windowIsShort: function() {
            return $(window).height() <= AppView.shortWindowHeight;
        },

        /**
         * Gets a parameter from the URL's query string.
         * Source from http://stackoverflow.com/a/21903119
         */
        getUrlParameter: function(sParam) {
            var sPageURL = decodeURIComponent(window.location.search.substring(1));
            var sURLVariables = sPageURL.split('&');
            var sParameterName;
            var i;

            for (i = 0; i < sURLVariables.length; i++) {
                sParameterName = sURLVariables[i].split('=');

                if (sParameterName[0] === sParam)
                    return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }

    });

    return AppView;
});
