import express from "express";
import fetch from "node-fetch";
import queryString from "query-string";
import dotenv from "dotenv";
import cron from "node-cron";

import { Mailer } from "./Mailer";
import type { CoinData } from "./type";

dotenv.config();
const app = express();

const PROD = 1;

const PORT = process.env.PORT || 8000;

async function notifyCoinPrice() {
  const baseUrl = "https://pro-api.coinmarketcap.com/v1/cryptocurrency";
  const API_KEY = process.env.COIN_MARKET_CAP_API_KEY;
  const qs = queryString.stringify({ symbol: "XRP,XLM", convert: "THB" });

  if (!PROD) {
    console.log("Please enable `PROD` flag first 🔥.");
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/quotes/latest?${qs}`, {
      headers: {
        "X-CMC_PRO_API_KEY": API_KEY,
      },
    });
    const { data } = await res.json();
    const coinData: { [coin: string]: CoinData } = Object.keys(data).reduce(
      (acc, coin) => ({ ...acc, [coin]: data[coin].quote.THB }),
      {}
    );

    const mailer = new Mailer();
    await mailer.sendEmail(coinData);
  } catch (error) {
    console.error(error);
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT} 🚀🚀`);

  cron.schedule('*/30 * * * *', async () => {
    console.log('Notify coin price every 30 minutes 🤖.');
    await notifyCoinPrice();
  });
});
