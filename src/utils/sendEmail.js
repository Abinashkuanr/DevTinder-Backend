const {
    SendEmailCommand,
} = require("@aws-sdk/client-ses");

const {
    sesClient,
} = require("./sesClient");


// ======================================================
// CREATE EMAIL COMMAND
// ======================================================

const createSendEmailCommand = (
    toAddress,
    fromAddress
) => {

    return new SendEmailCommand({

        Destination: {
            ToAddresses: [
                toAddress,
            ],
        },

        Message: {

            Subject: {
                Charset: "UTF-8",
                Data: "New DevTinder Connection Request",
            },

            Body: {

                Html: {
                    Charset: "UTF-8",

                    Data: `
                        <div style="font-family: Arial, sans-serif;">

                            <h2>🚀 DevTinder</h2>

                            <p>
                                You have received a new connection request.
                            </p>

                            <p>
                                Someone is interested in connecting
                                with you on DevTinder.
                            </p>

                            <p>
                                Login to DevTinder to view the request.
                            </p>

                            <br>

                            <p>
                                Thanks,<br>
                                DevTinder Team
                            </p>

                        </div>
                    `,
                },

                Text: {
                    Charset: "UTF-8",

                    Data:
                        "You have received a new connection request on DevTinder. Login to DevTinder to view the request.",
                },
            },
        },

        Source: fromAddress,

    });
};


// ======================================================
// SEND EMAIL
// ======================================================

const run = async (
    toAddress,
    fromAddress
) => {

    try {

        if (!toAddress) {
            throw new Error(
                "Receiver email address is missing"
            );
        }

        if (!fromAddress) {
            throw new Error(
                "Sender email address is missing"
            );
        }

        console.log("--------------------------------");
        console.log("Sending SES email");
        console.log("TO:", toAddress);
        console.log("FROM:", fromAddress);
        console.log("--------------------------------");


        const command =
            createSendEmailCommand(
                toAddress,
                fromAddress
            );


        const response =
            await sesClient.send(command);


        console.log(
            " Email sent successfully"
        );

        console.log(
            "Message ID:",
            response.MessageId
        );


        return response;

    } catch (error) {

        console.error(
            "❌ SES Error:",
            error
        );

        throw error;
    }
};


module.exports = {
    run,
};