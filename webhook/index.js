const express = require("express");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const { exec } = require("child_process");

const app = express();
const PORT = 9000; // webhook will listen here

// your GitHub webhook secret (set same in GitHub)
const GITHUB_SECRET = "Abhi07";

// to read raw body for signature check
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Verify the signature from GitHub
function verifySignature(req) {
  const signature = req.headers["x-hub-signature-256"];
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", GITHUB_SECRET);
  const digest = "sha256=" + hmac.update(req.rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.post("/github-webhook", (req, res) => {
  if (!verifySignature(req)) {
    console.log("❌ Invalid signature");
    return res.status(401).send("Invalid signature");
  }

  const event = req.headers["x-github-event"];
  console.log(`📩 Webhook received: ${event}`);

  if (event === "push") {
    console.log("🚀 Running deploy script...");
    exec("bash /home/ubuntu/BOOK-PUBLISHING-APP/deploy.sh", (error, stdout, stderr) => {
      if (error) {
        console.error(`Deploy error: ${error.message}`);
        return;
      }
      if (stderr) console.error(`Deploy stderr: ${stderr}`);
      console.log(`Deploy stdout: ${stdout}`);
    });
  }

  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`✅ Webhook listener running on port ${PORT}`);
});
