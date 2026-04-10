import { chromium } from "playwright";
import { marked } from "marked";

export async function markdownToPdf(markdown: string): Promise<Buffer> {
  const html = await marked(markdown);

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      padding: 2cm;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { font-size: 22pt; margin-bottom: 4px; color: #1a1a1a; }
    h2 { font-size: 13pt; color: #2563eb; border-bottom: 1.5px solid #2563eb; padding-bottom: 3px; margin: 18px 0 8px; }
    h3 { font-size: 11pt; font-weight: 600; margin: 10px 0 4px; }
    p { margin-bottom: 6px; }
    ul { margin: 4px 0 8px 18px; }
    li { margin-bottom: 3px; }
    strong { font-weight: 600; }
    a { color: #2563eb; text-decoration: none; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
    code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-size: 10pt; }
    pre { background: #f3f4f6; padding: 10px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>${html}</body>
</html>`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.setContent(fullHtml, { waitUntil: "networkidle" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
    printBackground: true,
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
}
