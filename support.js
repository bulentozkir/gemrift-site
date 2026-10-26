(() => {
  const TO_NAME = "Bulent Ozkir";
  const TO_ADDR = "bulentozkir@hotmail.com";
  const MAX_BYTES = 5 * 1024 * 1024;

  const form = document.getElementById("support-form");
  const status = document.getElementById("support-status");
  if (!form) return;

  const clean = (s) => s.replace(/[\r\n]+/g, " ").trim();
  const wrap76 = (s) => s.replace(/(.{76})/g, "$1\r\n");

  function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin);
  }

  function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  const encodeHeader = (s) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${utf8ToBase64(s)}?=`);
  const quoteName = (s) => s.replace(/["\\\r\n]/g, "");

  function buildEml(data, file, fileBase64) {
    const boundary = "----=_GemriftSupport_" + Date.now().toString(36);
    const body = [
      `Topic: ${data.topic}`,
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.env ? `Environment: ${data.env}` : null,
      "",
      data.message,
    ].filter((l) => l !== null).join("\r\n");

    const lines = [
      "X-Unsent: 1",
      `To: ${TO_NAME} <${TO_ADDR}>`,
      `Subject: ${encodeHeader(`[Gemrift Support] ${data.subject}`)}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      wrap76(utf8ToBase64(body)),
    ];

    if (file) {
      const name = quoteName(file.name);
      lines.push(
        `--${boundary}`,
        `Content-Type: ${file.type || "application/octet-stream"}; name="${name}"`,
        "Content-Transfer-Encoding: base64",
        `Content-Disposition: attachment; filename="${name}"`,
        "",
        wrap76(fileBase64)
      );
    }
    lines.push(`--${boundary}--`, "");
    return lines.join("\r\n");
  }

  function download(content) {
    const blob = new Blob([content], { type: "message/rfc822" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gemrift-support-request.eml";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.textContent = "";

    if (!form.reportValidity()) return;

    const fd = new FormData(form);
    const data = {
      name: clean(fd.get("name")),
      email: clean(fd.get("email")),
      topic: clean(fd.get("topic")),
      env: clean(fd.get("env") || ""),
      subject: clean(fd.get("subject")),
      message: String(fd.get("message")).trim(),
    };

    const file = document.getElementById("attachment").files[0] || null;
    if (file && file.size > MAX_BYTES) {
      status.textContent = "The attachment is larger than 5 MB. Please choose a smaller file.";
      return;
    }

    try {
      const fileBase64 = file ? bufferToBase64(await file.arrayBuffer()) : "";
      download(buildEml(data, file, fileBase64));
      status.textContent =
        "Draft downloaded. Open gemrift-support-request.eml to review and send it from your default email app.";
    } catch (err) {
      status.textContent = "Could not create the email draft. Please email " + TO_ADDR + " directly.";
    }
  });
})();
