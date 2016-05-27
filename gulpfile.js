var gulp    = require("gulp"),
    path    = require("path"),
    del     = require("del"),
    gh      = require("gulp-helpers");


////////////////////////////////////////////////////////////////////////////////
// default
////////////////////////////////////////////////////////////////////////////////
gulp.task("default", function () {
});


////////////////////////////////////////////////////////////////////////////////
// clean
////////////////////////////////////////////////////////////////////////////////
gulp.task("clean", function () {
    "use strict";
    del.sync(["dist", "tmp", "typings"]);
});


////////////////////////////////////////////////////////////////////////////////
// setup
////////////////////////////////////////////////////////////////////////////////
gulp.task("setup", ["clean"], function () {
    "use strict";
    return gh.exec("typings install");
});


////////////////////////////////////////////////////////////////////////////////
// build
////////////////////////////////////////////////////////////////////////////////

gulp.task("build", ["setup"], function () {
    "use strict";
    return buildJs();
});


function getSrcGlobs(includeUnitTestFiles) {
    "use strict";

    var srcGlobs = ["src/**/*.ts",
                    "!src/browser/**/*.ts"];

    if (!includeUnitTestFiles) {
        srcGlobs.push("!src/**/*.spec.ts");
        srcGlobs.push("!src/test/**/*");
    }

    return srcGlobs;
}

function getTsConfig(emitDeclarationFiles) {
    "use strict";

    return {
        target:            "ES5",
        declarationFiles:  !!emitDeclarationFiles,
        noExternalResolve: false,
        noEmitOnError:     true,
        module:            "commonjs"
    };
}

function buildJs() {
    "use strict";

    var ts         = require("gulp-typescript"),
        sourcemaps = require("gulp-sourcemaps"),
        outDir     = path.join(__dirname, "dist"),
        tsResults;

    tsResults = gulp.src(getSrcGlobs(false))
        .pipe(sourcemaps.init())
        .pipe(ts(getTsConfig(true), undefined, ts.reporter.longReporter()));

    var jsStream = tsResults.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(outDir));

    var defsStream = tsResults.dts
        .pipe(gulp.dest(outDir));

    return gh.streamsToPromise(jsStream, defsStream);
}


////////////////////////////////////////////////////////////////////////////////
// ut
////////////////////////////////////////////////////////////////////////////////
gulp.task(
    "ut",
    function () {
        "use strict";

        var outDir = path.join(__dirname, "tmp", "ut");

        return gh.buildTypeScript(getSrcGlobs(true), outDir, outDir)
            .then(function () {
                var tape   = require("gulp-tape"),
                    tapMin = require("tap-min"),
                    stream;

                stream = gulp.src(outDir + "/**/*.spec.js")
                    .pipe(tape({reporter: tapMin()}));

                return gh.streamsToPromise(stream);
            });
    }
);
