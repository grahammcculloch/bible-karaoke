//
// convert
// converts the provided hearthis files into a bbk output video.
//
// options:
// python main.py /path/to/folder -c [true,False] -o [csv, json, vtt]
// -c --combine  : combine wave files into 1 file
// -o --output   : output format
//
var async = require("async");
var inquirer = require("inquirer");
var fs = require("fs");
var path = require("path");
var shell = require("shelljs");
const process = require('process');

var tempy = require("tempy");
var utils = require(path.join(__dirname, "..", "utils", "utils"));

// our other commands that we reuse:
const Timings = require(path.join(__dirname, "timing.js"));
const Frames = require(path.join(__dirname, "frames.js"));
const FFMPEG = require(path.join(__dirname, "ffmpeg.js"));

// var Setup = require(path.join(__dirname, "setup.js"));

const FFPROBE_EXE = process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe';

var Options = {}; // the running options for this command.

shell.config.execPath = shell.which("node");

//
// Build the Install Command
//
var Command = new utils.Resource({
    command: "convert",
    params: "",
    descriptionShort: "convert hearthis data into a video.",
    descriptionLong: `
`
});

module.exports = Command;

Command.help = function() {
    console.log(`

  Usage: $ bbk convert [path/to/folder] --bgImage=[path/to/image.png] --output=[outputFile.mp4] --fps=[#] -f

  [path/to/folder] : the name of the directory with the Hearthis files to convert

  Options:
    --output     : name of the desired output file (.mp4)
    --bgImage    : (optional) an image for the background
    --noBGImage  : (optional) no background image
                   setting --noBGImage prevents being asked for one
    --fps        : (optional) the frames per second of the output (15)
    --ffmpegPath : (optional) path to your ffmpeg executable
    -f           : (optional) overwrite the output file if it exists
    --fontFamily : The name of the system font to use.

  Examples:

    $ bbk convert genesis/ch1 --output=genesis_01 --noBGImage
        - reads in the Hearthis data from ./genesis/ch1
        - no background image
        - outputs to ./genesis_01.mp4
        - output is 15 fps
        - uses ffmpeg found in your $PATH

`);
};

Command.run = function(options) {
    return new Promise((resolve, reject) => {
        async.series(
            [
                // copy our passed in options to our Options
                (done) => {
                    for (var o in options) {
                        Options[o] = options[o];
                    }
                    Options.pathFolder = options._.shift();
                    if (Options.ffmpegPath) {
                        if (!path.isAbsolute(Options.ffmpegPath)) {
                            Options.ffmpegPath = path.join(process.cwd(), Options.ffmpegPath);
                        }
                    }
                    if (Options.onProgress && typeof Options.onProgress !== "function") {
                      console.warn("onProgress must be a function. It is not valid on the command line.");
                      Command.help();
                      process.exit(1);
                    }
                    done();
                },
                askQuestions,
                (done) => {
                  onProgress("Processing inputs...", 0);
                  done();
                },
                (done) => {
                    // check for valid params:
                    if (!Options.pathFolder) {
                        console.log();
                        console.log("missing required param: [path/to/folder]");
                        console.log();
                        Command.help();
                        process.exit(1);
                    }

                    var requiredParams = ["output"];
                    var isValid = true;

                    // check for valid params:
                    requiredParams.forEach((p) => {
                        if (!Options[p]) {
                            console.log(`missing required param: [${p}]`);
                            isValid = false;
                        }
                    });

                    if (!isValid) {
                        Command.help();
                        process.exit(1);
                    }

                    done();
                },
                checkDependencies,
                removeOutputFile,
                execute
            ],
            (err) => {
                // shell.popd("-q");
                // if there was an error that wasn't an ESKIP error:
                if (err && (!err.code || err.code != "ESKIP")) {
                    reject(err);
                    return;
                }

                resolve();
            }
        );
    });
};

/**
 * @function checkDependencies
 * verify the system has any required dependencies for generating ssl certs.
 * @param {function} done  node style callback(err)
 */
function checkDependencies(done) {
    // verify we have 'git'
    utils.checkDependencies([], done);
}

/**
 * @function askQuestions
 * if nothing was provided on the cli, ask the user for the info.
 * @param {function} done  node style callback(err)
 */
function askQuestions(done) {
    inquirer
        .prompt([
            {
                name: "pathFolder",
                type: "input",
                message: "Enter the path to the Hearthis folder to convert:",
                default: "",
                validate: (input) => {
                    if (fs.existsSync(input)) {
                        return true;
                    } else {
                        return "Can't find directory! Make sure you typed it in correctly.";
                    }
                },
                when: (values) => {
                    return !values.pathFolder && !Options.pathFolder;
                }
            },
            {
                name: "wantBG",
                type: "confirm",
                message: "Do you want to add a background image:",
                default: false,
                when: (values) => {
                    return (
                        !values.wantBG &&
                        typeof Options.bgImage == "undefined" &&
                        typeof Options.noBGImage == "undefined"
                    );
                }
            },
            {
                name: "bgImage",
                type: "input",
                message:
                    "Enter the path to the background image you want to use:",
                default: "",
                validate: (input) => {
                    if (fs.existsSync(input)) {
                        return true;
                    } else {
                        return "Can't find image! Make sure you typed it in correctly.";
                    }
                },
                when: (values) => {
                    return (
                        values.wantBG &&
                        !values.bgImage &&
                        !Options.bgImage &&
                        typeof Options.noBGImage == "undefined"
                    );
                }
            },
            {
                name: "fontFamily",
                type: "input",
                message:
                    "Enter the name of your system font to use in the video.",
                default: "Helvetica Neue, Helvetica, Arial, sans-serif",
                when: (values) => {
                    return !values.fontFamily && !Options.fontFamily;
                }
            },
            {
                name: "output",
                type: "input",
                message: "Enter the desired name of the final video:",
                default: "",
                validate: (input) => {
                    if (fs.existsSync(input)) {
                        return "that file already exists.";
                    } else {
                        return true;
                    }
                },
                when: (values) => {
                    return !values.output && !Options.output;
                }
            }
        ])
        .then((answers) => {
            // update Options with our answers:
            for (var a in answers) {
                Options[a] = answers[a];
            }
            done();
        });
}

function removeOutputFile(done) {
    if (fs.existsSync(Options.output)) {
        var removeIt = false;

        // if the -f flag is present, then force delete:
        if (Options.f) {
            removeIt = true;
        }

        inquirer
            .prompt([
                {
                    name: "removeIt",
                    type: "confirm",
                    message: `The output file (${Options.output}) alredy exists. overwrite it:`,
                    default: false,
                    when: (values) => {
                        return !values.removeIt && !removeIt;
                    }
                }
            ])
            .then((answers) => {
                if (answers.removeIt) {
                    removeIt = answers.removeIt;
                }
                if (removeIt) {
                    fs.unlinkSync(Options.output);
                    done();
                }
            });
    } else {
        done();
    }
}

function execute(done) {
    var pathBBKFile = tempy.file({ name: "bbkFormat.js" });
    console.log(`path to bbkFormat: ${pathBBKFile}`);
    Promise.resolve()
        .then(() => {
            var pathToInfo = Options.pathFolder;
            if (path.basename(pathToInfo) != "info.xml") {
                pathToInfo = path.join(pathToInfo, "info.xml");
                Options.pathFolder = pathToInfo;
            }
            onProgress("Generating timing file...", 0);
            return Timings.run({
                input: pathToInfo,
                output: pathBBKFile,
                ffprobePath: ffprobePath(Options.ffmpegPath || null)
            });
        })
        .then(() => {
            var opts = {
                inputJSON: pathBBKFile,
                fontFamily: Options.fontFamily
            };
            if (Options.bgImage) {
                opts.bgImage = Options.bgImage;
            }
            if (Options.onProgress) {
              opts.onProgress = onProgress;
            }
            onProgress("Rendering video frames...", 0);
            return Frames.run(opts);
        })
        .then((pathFrames) => {
            console.log(`>> path to generated frames folder: ${pathFrames}`);

            onProgress("Combining audio and frames into video...", 100);
            return FFMPEG.run({
                images: pathFrames,
                audio: path.dirname(Options.pathFolder),
                output: Options.output,
                framerateOut: Options.fps || 15,
                ffmpegPath: Options.ffmpegPath || null
            });
        })
        .then(() => {
            done();
        })
        .catch((err) => {
            done(err);
        });
}

function onProgress(status, percent) {
    Options.onProgress && Options.onProgress({status, percent});
}

function ffprobePath(ffmpegPath) {
  if (!ffmpegPath) {
    return null;
  }
  return path.join(path.dirname(ffmpegPath), FFPROBE_EXE);
}
