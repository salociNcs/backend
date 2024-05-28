const mailgun = require('mailgun-js');
const DOMAIN = process.env.MAILGUN_DOMAIN;
const APIKEY = process.env.MAILGUN_API_KEY;

const mg = mailgun({ apiKey: APIKEY, domain: DOMAIN });

const sendEmail = (to, subject, text) => {
    const data = {
        from: process.env.MAILGUN_FROM_EMAIL,
        to,
        subject,
        text
    };

    return new Promise((resolve, reject) => {
        mg.messages().send(data, function (error, body) {
            if (error) {
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
};

module.exports = sendEmail;
