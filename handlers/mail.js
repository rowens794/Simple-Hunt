const nodemailer = require("nodemailer");
const pug = require("pug");
const juice = require("juice");
const htmlToText = require("html-to-text"); 

const transport = nodemailer.createTransport({
    host: process.env.MAILGUN_SMTP_SERVER,
    port: process.env.MAILGUN_SMTP_PORT,
    auth: {
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD
    }
})

var mailFunctions = {};

const generateHTML = function(options = {}){
    const html = pug.renderFile(`${__dirname}/../views/email/${options.filename}.pug`, options);
    const inlined = juice(html);
    return inlined;
}

mailFunctions.sendEmail = function(options){
    //generate html and set options variable
    html = generateHTML(options);
    text = htmlToText.fromString(html);
    options.html = html;
    options.text = text;

    transport.sendMail(options, (error, info) => {

        if (error) {
            return console.log(error);
        }
        
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
}

module.exports = mailFunctions;