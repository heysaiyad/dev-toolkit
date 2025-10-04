document.addEventListener("DOMContentLoaded", () => {
  const jsonInput = document.getElementById("json-input");
  const schemaInput = document.getElementById("schema-input");
  const resultBox = document.getElementById("result");
  const validateBtn = document.getElementById("validate-btn");
  const clearBtn = document.getElementById("clear-btn");

  function showResult(message, isError = false) {
    if (isError) {
      resultBox.innerHTML = `❌ ${message}`;
    } else {
      resultBox.textContent = message;
    }
  }

  validateBtn.addEventListener("click", () => {
    const jsonText = jsonInput.value.trim();
    const schemaText = schemaInput.value.trim();

    if (!jsonText || !schemaText) {
      return showResult("Both JSON and Schema inputs are required.", true);
    }

    let data, schema;
    try {
      data = JSON.parse(jsonText);
    } catch (e) {
      return showResult(`Invalid JSON object: ${e.message}`, true);
    }

    try {
      schema = JSON.parse(schemaText);
    } catch (e) {
      return showResult(`Invalid JSON schema: ${e.message}`, true);
    }

    try {
      const ajv = new Ajv(); // Create AJV instance
      const validate = ajv.compile(schema);
      const valid = validate(data);

      if (valid) {
        showResult("✅ JSON is valid according to the schema.");
      } else {
        showResult(`❌ Validation errors:\n${JSON.stringify(validate.errors, null, 2)}`, true);
      }
    } catch (e) {
      showResult(`Error during validation: ${e.message}`, true);
    }
  });

  clearBtn.addEventListener("click", () => {
    jsonInput.value = "";
    schemaInput.value = "";
    resultBox.textContent = "";
  });
});
