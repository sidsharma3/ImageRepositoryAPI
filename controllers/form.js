const { sendEmailWithNodemailer } = require("../helpers/email");

exports.contactForm = (req, res) => {
    const {email, name, message} = req.body
    const emailData = {
        from: process.env.EMAIL_FROM, 
        to: email, 
        subject: "Website Contact Form",
        text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
        html: `
            <h4>Email received from contact form:</h4>
            <p>Sender name: ${name}</p>
            <p>Sender email: ${email}</p>
            <p>Sender message: ${message}</p>
            <hr />
            <p>This email may contain sensitive information</p>
        `,
      };
      sendEmailWithNodemailer(req, res, emailData);

};

exports.contactSubmissionAuthorForm = (req, res) => {
    const { authorEmail, email, name, message } = req.body;
    const emailData = {
        from: email,
        to: authorEmail,
        subject: `Someone messaged you from ${process.env.APP_NAME}`,
        text: `Email received from contact from \n Sender name: ${name} \n Sender email: ${email} \n Sender message: ${message}`,
        html: `
            <h4>Message received from:</h4>
            <p>name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Message: ${message}</p>
            <hr />
            <p>This email may contain sensetive information</p>
        `
      };
      sendEmailWithNodemailer(req, res, emailData);
};