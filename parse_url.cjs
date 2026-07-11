const url = process.env.DATABASE_URL;
const regex = /^postgresql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)$/;
const match = url.match(regex);
if (match) {
  const [_, user, pass, host, port, db] = match;
  console.log({ user, pass, host, port, db });
}
