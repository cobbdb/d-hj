module.exports = function (grunt) {
    grunt.config.merge({
        browserify: {
            build: {
                files: {
                    'bin/horse-jockey.js': [
                        'src/*.js'
                    ]
                }
            }
        }
    });
};
