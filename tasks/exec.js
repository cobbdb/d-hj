module.exports = function (grunt) {
    grunt.config.merge({
        exec: {
            deploy: {
                cmd: 'sftp harbinger "cd public_html/bin; put -o app.zip"'
            }
        }
    });
};
