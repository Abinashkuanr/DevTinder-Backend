const cron = require("node-cron");
const {
    subDays,
    startOfDay,
    endOfDay,
} = require("date-fns");

const sendEmail = require("./sendEmail");

const ConnectionRequestModel =
    require("../Models/connectionRequest");


// ======================================================
// CRON JOB
// RUN EVERY DAY AT 8:00 PM
// ======================================================

cron.schedule("0 20 * * *", async () => {

    console.log("====================================");
    console.log("⏰ Cron job started");
    console.log("====================================");

    try {

        // ==================================================
        // GET PREVIOUS DAY
        // ==================================================

        const yesterday =
            subDays(new Date(), 1);


        const yesterdayStart =
            startOfDay(yesterday);


        const yesterdayEnd =
            endOfDay(yesterday);


        console.log(
            "Checking requests from:",
            yesterdayStart,
            "to:",
            yesterdayEnd
        );


        // ==================================================
        // FIND INTERESTED REQUESTS
        // ==================================================

        const pendingRequests =
            await ConnectionRequestModel.find({

                status: "interested",

                createdAt: {

                    $gte: yesterdayStart,

                    $lt: yesterdayEnd,

                },

            })
            .populate(
                "fromUserId",
                "firstName lastName email"
            )
            .populate(
                "toUserId",
                "firstName lastName email"
            );


        console.log(
            `📋 Found ${pendingRequests.length} pending requests`
        );


        // ==================================================
        // GET UNIQUE RECEIVER EMAILS
        // ==================================================

        const listOfEmails = [
            ...new Set(

                pendingRequests

                    .filter(
                        (request) =>
                            request.toUserId &&
                            request.toUserId.email
                    )

                    .map(
                        (request) =>
                            request.toUserId.email
                    )
            ),
        ];


        console.log(
            "📧 Email list:",
            listOfEmails
        );


        // ==================================================
        // SEND EMAIL
        // ==================================================

        for (const email of listOfEmails) {

            try {

                console.log(
                    "------------------------------------"
                );

                console.log(
                    "📧 Sending pending request email"
                );

                console.log(
                    "TO:",
                    email
                );

                console.log(
                    "FROM:",
                    "no-reply@devtinder.art"
                );


                // ==================================================
                // SEND SES EMAIL
                // ==================================================

                const response =
                    await sendEmail.run(

                        // Receiver
                        email,

                        // Sender
                        "no-reply@devtinder.art"
                    );


                console.log(
                    "✅ Email sent successfully"
                );


                if (response) {

                    console.log(
                        "SES Message ID:",
                        response.MessageId
                    );
                }


            } catch (emailError) {

                console.error(
                    "❌ Email sending failed for:",
                    email
                );

                console.error(
                    emailError.message
                );
            }
        }


        console.log("====================================");
        console.log("✅ Cron job completed");
        console.log("====================================");


    } catch (error) {

        console.error(
            "❌ Cron job error:"
        );

        console.error(
            error
        );
    }

});