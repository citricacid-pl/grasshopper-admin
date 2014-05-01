/*globals module:true */
module.exports = function (grunt) {
    'use strict';

    grunt.config('requirejs', {
        dist: {
            options: {
                baseUrl: '<%= tempDirectory %>',
                mainConfigFile: '<%= tempDirectory %>/main.js',
                name: 'main',
                out: '<%= buildDirectory%>/main.js',
                optimize: 'uglify',
                preserveLicenseComments: false,
                include: ['vendor/almond/almond.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');

};