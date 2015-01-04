module.exports = function (grunt) {
    grunt.config.merge({
        browserify: {
            build: {
                files: {
                    'dist/horse-jockey.js': [
                        'src/*.js'
                    ]
                }
            }
        }
    });
};
