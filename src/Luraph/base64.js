module.exports = {
    encode(string) {
        return Buffer.from(string).toString("base64");
    }
}