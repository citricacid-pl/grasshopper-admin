/*global define:false*/
define(['text!views/contentIndex/contentIndexView.html', 'contentIndexViewModel'],
    function (template, contentIndexViewModel) {
        'use strict';

        return {
            name : 'contentIndexView',
            ModelType : contentIndexViewModel,
            appendTo : '#contentIndex',
            wrapper : false,
            template : template,
            rivetConfig : 'auto',
            bindings : [],
            events : {},
            permissions : ['admin', 'reader', 'editor']
        };
    });