const { SESClient } = require("@aws-sdk/client-ses");

const REGION = process.env.AWS_REGION;

if (!process.env.AWS_ACCESS_KEY_ID) {
    console.error("AWS_ACCESS_KEY_ID is missing");
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
    console.error("AWS_SECRET_ACCESS_KEY is missing");
}

if (!process.env.AWS_REGION) {
    console.error("AWS_REGION is missing");
}

const sesClient = new SESClient({
    region: REGION,

    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

module.exports = {
    sesClient,
};