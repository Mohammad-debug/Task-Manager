const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)
const sendWelcomeMail=(email,name)=>{ sgMail.send({
    to:email,
    from:'anasmd4u2010@gmail.com',
    subject:'Thanks for joining!',
    text:`Welcome to task-manager app, ${name} . Let me Know if you have any concerns.`
})
}
const sendWExitMail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'anasmd4u2010@gmail.com',
        subject: 'You have successfully exited',
        text: `Thanks for using our service, ${name} . Let me know why you decided to leave.`
    })
}
module.exports = { sendWelcomeMail, sendWExitMail}
