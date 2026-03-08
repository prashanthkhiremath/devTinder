const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");

const sendEmail = async (toEmail, subject, bodyHtml) => {
  // 🚀 ADD THE MOCK LOGIC HERE
  if (process.env.NODE_ENV === "development") {
    console.log("-----------------------------------------");
    console.log("📧 [MOCK EMAIL] TO:", toEmail);
    console.log("📧 [MOCK EMAIL] SUBJECT:", subject);
    console.log("-----------------------------------------");

    // Return a fake success object so the calling function doesn't crash
    return { MessageId: "mock-dev-12345" };
  }

  const params = {
    Source: process.env.EMAIL_SENDER, // Must be verified in SES
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: bodyHtml,
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);
    console.log("Email sent successfully:", result.MessageId);
    return result;
  } catch (error) {
    console.error("Error sending email via SES:", error);
    throw error;
  }
};

module.exports = { sendEmail };
