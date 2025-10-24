document.getElementById("sendBtn").addEventListener("click", async () => {
  const url = document.getElementById("url").value.trim();
  const method = document.getElementById("method").value;
  const headersText = document.getElementById("headers").value.trim();
  const bodyText = document.getElementById("body").value.trim();
  const statusDiv = document.getElementById("status");
  const output = document.getElementById("responseOutput");

  if (!url) {
    alert("Please enter a valid API URL");
    return;
  }

  let headers = {};
  try {
    if (headersText) headers = JSON.parse(headersText);
  } catch {
    alert("Invalid headers JSON");
    return;
  }

  let options = { method, headers };
  if (method !== "GET" && bodyText) {
    try {
      options.body = JSON.stringify(JSON.parse(bodyText));
    } catch {
      alert("Invalid body JSON");
      return;
    }
  }

  statusDiv.textContent = "Sending request...";
  output.textContent = "";

  try {
    const response = await fetch(url, options);
    statusDiv.textContent = `Status: ${response.status} ${response.statusText}`;

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      output.textContent = JSON.stringify(data, null, 2);
    } else {
      data = await response.text();
      output.textContent = data;
    }
  } catch (error) {
    statusDiv.textContent = "Error: Request failed";
    output.textContent = error.toString();
  }
});

document.getElementById("copyBtn").addEventListener("click", () => {
  const response = document.getElementById("responseOutput").textContent;
  navigator.clipboard.writeText(response);
  alert("Response copied to clipboard!");
});
