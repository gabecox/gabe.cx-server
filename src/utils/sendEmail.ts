import nodemailer from "nodemailer";

export type Email = {
  to: string;
  from: string;
  subject: string;
  text: string;
  replyTo?: string;
  html?: string;
};

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(message: Email) {
  let transporter = nodemailer.createTransport({
    host: "smtp-relay.gmail.com",
    port: 465, // 587
    secure: true, // true for 465, false for other ports
  });
  let info = await transporter.sendMail(message);
  return info;
}
