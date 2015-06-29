module.exports = function (grunt) {
    grunt.config.merge({
        uglify: {
            raw: {
                files: {
                    'dist/horse-jockey.js': [
                        'bower_components/cocoonjs-plugins/build/cocoon.js',
                        'bin/horse-jockey.js'
                    ]
                },
                options: {
                    compress: false,
                    beautify: true,
                    mangle: false
                }
            },
            build: {
                files: {
                    'dist/horse-jockey.min.js': [
                        'dist/horse-jockey.js'
                    ]
                }
            }
        }
    });
};
