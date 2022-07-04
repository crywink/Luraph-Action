const core = require("@actions/core");
const path = require("path");
const axios = require("axios");
const os = require("os");
const fs = require("fs").promises;
const luraphClass = require("./Luraph/Luraph");

const getAbsolutePath = (filePath) => {
    if (filePath[0] !== "~") return path.resolve(filePath);

    const homeDir = os.homedir();
    if (homeDir) return path.join(homeDir, filePath.slice(1));

    throw new Error("Unable to resolve '~' to HOME");
};

const run = async () => {
    const filePath = getAbsolutePath(core.getInput("path", { required: true }));
    const script = await fs
        .readFile(filePath, { encoding: "utf8" })
        .catch((err) => core.setFailed(err));
    
    const luraph = new luraphClass({
        apiKey: core.getInput("apiKey")
    });

    luraph.obfuscate({
        fileName: "SimpleAnticheat_File.lua",
        script,
    }).then((result) => {
        fs.writeFile(filePath, result, () => {
            core.setOutput("file", result);
        });
    }).catch((err) => {
        return core.setFailed("An error occurred while obfuscating: " + err);
    });
};

run();
