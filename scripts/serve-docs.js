import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve("docs");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };

http.createServer((request, response) => {
  const pathname = request.url === "/" ? "index.html" : decodeURIComponent(request.url.slice(1));
  const file = path.resolve(root, pathname);
  if (!file.startsWith(root)) { response.writeHead(403).end("Forbidden"); return; }
  fs.readFile(file, (error, content) => {
    if (error) { response.writeHead(404).end("Not found"); return; }
    response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" }).end(content);
  });
}).listen(4173, "127.0.0.1", () => console.log("Docs: http://127.0.0.1:4173"));
