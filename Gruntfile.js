/*jshint node:true */
/*global exec */
require('shelljs/global');

/**
 * Grunt Configuration.
 * @param {Object} grunt Grunt Object.
 */
module.exports = function(grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: ['*.js', './test/*.js', 'Gruntfile.js'],
      options: JSON.parse(grunt.file.read(__dirname + '/jshintrc'))
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', 'Run mocha tests', function() {
    var result = exec(__dirname +
         '/node_modules/.bin/mocha --require should --reporter spec');

    if (result.code !== 0) {
      grunt.fail.warn("Mocha tests did not pass");
    }
  });

  grunt.registerTask('default', ['jshint', 'test']);
};
