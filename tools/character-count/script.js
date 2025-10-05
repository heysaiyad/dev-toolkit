document.addEventListener("DOMContentLoaded", () => {
    const textInput = document.getElementById("text-input");
    const resultBox = document.getElementById("result-box");
    const countBtn = document.getElementById("count-btn");
    const clearBtn = document.getElementById("clear-btn");

    countBtn.addEventListener("click", () => {
        const text = textInput.value;
        resultBox.textContent = `Total Characters: ${text.length}`;
    });

    clearBtn.addEventListener("click", () => {
        textInput.value = "";
        resultBox.textContent = "";
    });
});
