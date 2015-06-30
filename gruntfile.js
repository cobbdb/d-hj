module.exports = function (grunt) {
    // Load all grunt tasks.
    require('matchdep').filterDev([
        'grunt-*',
        '!grunt-template-*'
    ]).forEach(grunt.loadNpmTasks);
    grunt.loadTasks('tasks');

    grunt.registerTask('default', 'Dev build suite.', [
        'pipeline',
        'browserify',
        'uglify:raw'
    ]);
    grunt.registerTask('build', 'Full build suite.', [
        'pipeline',
        'browserify',
        'uglify:raw',
        'uglify:build',
        'compress'
    ]);
};
