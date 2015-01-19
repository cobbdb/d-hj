module.exports = function (grunt) {
    grunt.config.merge({
        uglify: {
            raw: {
                files: {
                    'dist/horse-jockey.js': [
                        'bower_components/cocoonjs-plugins/build/cocoon.js',
                        'dist/horse-jockey.js'
                    ]
                },
                options: {
                    compress: false
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
