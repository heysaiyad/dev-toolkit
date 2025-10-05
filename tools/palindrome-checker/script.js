document.addEventListener("DOMContentLoaded", () => {
    const textInput = document.getElementById("text-input");
    const resultBox = document.getElementById("result-box");
    const checkBtn = document.getElementById("check-btn");
    const clearBtn = document.getElementById("clear-btn");

    function isPalindrome(text) {
        const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, "");
        const reversed = cleaned.split("").reverse().join("");
        return cleaned === reversed;
    }

    checkBtn.addEventListener("click", () => {
        const text = textInput.value.trim();
        if (!text) {
            resultBox.textContent = "❌ Please enter some text.";
            return;
        }

        if (isPalindrome(text)) {
            resultBox.textContent = `✅ "${text}" is a palindrome!`;
        } else {
            resultBox.textContent = `❌ "${text}" is not a palindrome.`;
        }
    });

    clearBtn.addEventListener("click", () => {
        textInput.value = "";
        resultBox.textContent = "";
    });
});
