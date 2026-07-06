const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = 8765;

const typy = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

http.createServer((req, res) => {
  let adres = decodeURIComponent(req.url.split("?")[0]);

  if (adres === "/") {
    adres = "/tests/test-runner.html";
  }

  const plik = path.join(root, adres);

  if (!plik.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(plik, (blad, dane) => {
    if (blad) {
      res.writeHead(404);
      res.end("Not found: " + adres);
      return;
    }

    res.writeHead(200, {
      "Content-Type": typy[path.extname(plik)] || "text/plain; charset=utf-8"
    });
    res.end(dane);
  });
}).listen(port, "127.0.0.1", () => {
  console.log("Serwer testowy działa:");
  console.log("http://127.0.0.1:8765/tests/test-runner.html");
});
