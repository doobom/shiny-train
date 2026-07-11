const { Client } = require('pg');
const url = process.env.DATABASE_URL;
const regex = /^postgresql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)$/;
const match = url.match(regex);
const [_, user, password, host, port, database] = match;
const client = new Client({ user, password, host, port: parseInt(port), database });
client.connect()
  .then(() => {
    console.log("Connected");
    client.end();
  })
  .catch(err => console.error("Error:", err));
