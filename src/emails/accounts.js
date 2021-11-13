const sgMail = require("@sendgrid/mail");

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  console.log("Welcome Email Send");
  //   sgMail.send({
  //     to: email,
  //     from: "me",
  //     subject: "Welcome To the Task ManagerApplication",
  //     text: `Welcome ${name}. Please give your feedback about our application`,
  //   });
};

const sendCancelationEmail = (email, name) => {
  console.log("Cancelation Email Send");
  //   sgMail.send({
  //     to: email,
  //     form: "me",
  //     subject: "Reason for cancelation ",
  //     text: "we are extremely sorry if we caused you any problem we would be happy to know the reason for your deletion of your account",
  //   });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail,
};
