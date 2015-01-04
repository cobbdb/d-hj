module.exports = function (grunt) {
    grunt.config.merge({
        uglify: {
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
