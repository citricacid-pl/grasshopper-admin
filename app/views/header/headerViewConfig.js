/*global define:false*/
define(['text!views/header/headerView.html', 'headerViewModel'], function (templateHtml, HeaderViewModel) {
    'use strict';

    return {
        name : 'headerView',
        modelData : {name: 'Menu', url: 'home'},
        ModelType : HeaderViewModel,
        el : '#header',
        templateHtml : templateHtml,
        bindings : [
            ['app.user', 'change', 'setUser']
        ],
        rivetConfig : {
            scope : '#header',
            prefix : 'header'
        }
    };
});