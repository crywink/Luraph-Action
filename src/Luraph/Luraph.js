const axios = require("axios");
const core = require("@actions/core")
const base64 = require("./base64.js");

module.exports = class {
    constructor(options) {
        this.apiKey = options.apiKey
        this.client = axios.create({
            baseURL: "https://api.lura.ph/v1/",
            headers: {
                "Luraph-API-Key": this.apiKey
            }
        })
    };

    obfuscate(options) {
        return new Promise((resolve, reject) => {
            this.client.post("obfuscate/new", {
                fileName: options.fileName,
                node: options.node || "main",
                script: base64.encode(options.script),
                options: {
                    "USE_DEBUG_LIBRARY": true,
                    "INTENSE_VM_STRUCTURE": false,
                    "TARGET_VERSION": "Luau",
                    "VM_ENCRYPTION": false,
                    "DISABLE_LINE_INFORMATION": false,
                    "ENABLE_GC_FIXES": false
                }
            }).then((response) => {
                if (response.status != 200) {
                    core.setFailed(`Error while obfuscating: ${response.status} BODY: ${JSON.stringify(response.data)}`);
                    reject(`Error while obfuscating: ${response.status} BODY: ${JSON.stringify(response.data)}`);
                }
                const { jobId } = response.data;

                this.client.get(`/obfuscate/status/${jobId}`).then(() => {
                    this.client.get(`/obfuscate/download/${jobId}`).then((resp) => {
                        resolve(resp.data);
                    })
                })
            }).catch((err) => {
                reject(err + JSON.stringify(err.response.data));
            });
        })
    }
}