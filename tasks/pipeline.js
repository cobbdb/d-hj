module.exports = function (grunt) {
    grunt.registerTask('pipeline', function () {
        var name,
            log = {
                img: [],
                sound: [],
                font: []
            };
        for (name in log) {
            grunt.file.recurse(
                'assets/' + name,
                function (abspath, rootdir, subdir, filename) {
                    var path = subdir ? subdir + '/' + filename : filename;
                    log[name].push(path);
                }
            );
        }
        grunt.file.write(
            'assets/directory.json',
            JSON.stringify(log, null, 2)
        );
    });
};
