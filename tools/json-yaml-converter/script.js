document.addEventListener("DOMContentLoaded", () => {
    const inputText = document.getElementById("input-text");
    const resultBox = document.getElementById("result");
    const yamlToJsonBtn = document.getElementById("yaml-to-json");
    const jsonToYamlBtn = document.getElementById("json-to-yaml");
    const clearBtn = document.getElementById("clear-btn");

    function showResult(content, isError = false) {
        if (isError) {
            resultBox.innerHTML = `❌ ${content}`;
        } else {
            resultBox.textContent = content;
        }
    }

    yamlToJsonBtn.addEventListener("click", () => {
        const text = inputText.value.trim();
        if (!text) return showResult("Input is empty", true);
        try {
            const obj = jsyaml.load(text);  // parse YAML
            showResult(JSON.stringify(obj, null, 2));
        } catch (e) {
            showResult(`Invalid YAML: ${e.message}`, true);
        }
    });

    jsonToYamlBtn.addEventListener("click", () => {
        const text = inputText.value.trim();
        if (!text) return showResult("Input is empty", true);
        try {
            const obj = JSON.parse(text);  // parse JSON
            const yaml = jsyaml.dump(obj, { indent: 2 });
            showResult(yaml);
        } catch (e) {
            showResult(`Invalid JSON: ${e.message}`, true);
        }
    });

    clearBtn.addEventListener("click", () => {
        inputText.value = "";
        resultBox.textContent = "";
    });
});
