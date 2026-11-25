const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const rootDirectory = __dirname;
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const relativePath = requestUrl.pathname === "/"
      ? "index.html"
      : requestUrl.pathname.replace(/^[/\\]+/, "");
    const filePath = path.resolve(rootDirectory, relativePath);

    if (!filePath.startsWith(`${rootDirectory}${path.sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const file = await fs.readFile(filePath);
    const contentType = contentTypes[path.extname(filePath)] ?? "application/octet-stream";
    const headers = { "Content-Type": contentType };

    if ([".html", ".js"].includes(path.extname(filePath))) {
      headers["Cache-Control"] = "no-store";
    }

    response.writeHead(200, headers);
    response.end(file);
  } catch (error) {
    const statusCode = error.code === "ENOENT" ? 404 : 500;
    response.writeHead(statusCode).end(statusCode === 404 ? "Not found" : "Server error");
  }
});

server.listen(port, () => {
  console.log(`Mie Ayam Mas Fajar tersedia di http://localhost:${port}`);
});
