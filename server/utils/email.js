const { EMAIL, EMAIL_PASSWORD } = require("../config/secrete");
const catchAsync = require("../errorHandler/catchAsync");
const nodemailer = require("nodemailer");

const Email = catchAsync(async (email, resetURL) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: EMAIL,
    to: email,
    subject: "Password Reset",
    text: `Your password resetURL is|  ${resetURL}  |. If you did not request this, please ignore it. `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Email sent successfully to:${email}`);
});
module.exports = Email;
