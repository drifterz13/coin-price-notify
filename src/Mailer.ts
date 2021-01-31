import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import { DateTime } from "luxon";
import type { CoinData } from "./type";

export class Mailer {
  private transporter: Mail;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  private generateMailBody(data: { [coin: string]: CoinData }) {
    let body = "";

    for (const coin of Object.keys(data)) {
      body += `
      <h4>${coin}</h4>
      <p><b>Price:</b> ${data[coin].price}</p>
      <p><b>Last updated ⚡: ${DateTime.fromISO(data[coin].last_updated).toFormat(
        "MMM dd yyyy hh:mm:ss"
      )}</b></p>
      <p><b>% 1h changed: </b> <span style="color:salmon">${
        data[coin].percent_change_1h
      } ✨</span></p>
      <p><b>% 24h changed: </b> <span style="color:salmon">${
        data[coin].percent_change_24h
      } ✨</span></p>
      <p><b>% 7d changed: </b> <span style="color:salmon">${
        data[coin].percent_change_7d
      } ✨</span></p>
      <p><b>% 30d changed: </b> <span style="color:salmon">${
        data[coin].percent_change_30d
      } ✨</span></p>
      <hr>
     `;
    }

    return body;
  }

  async sendEmail(data: { [coin: string]: CoinData }) {
    try {
      await this.transporter.sendMail({
        from: `"Coin price notice 💰" <coin_price_notice@example.com>`,
        to: "mixmyxxe@gmail.com",
        subject: "Coin price update. 💹",
        html: `
           <h1>Coin price update 🚀.</h1>
           <hr>
           ${this.generateMailBody(data)}
         `,
      });
      console.log("Mail sent 🚀📧.");
    } catch (error) {
      console.error("Cannot send an email.", error);
    }
  }
}
