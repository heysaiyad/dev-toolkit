const calcType = document.getElementById("calcType");
const result = document.getElementById("result");

calcType.addEventListener("change", () => {
  document.querySelectorAll("#inputs > div").forEach(div => div.style.display = "none");
  document.getElementById(`${calcType.value}-inputs`).style.display = "block";
});

document.getElementById("calculate").addEventListener("click", () => {
  let output = "";

  if (calcType.value === "type1") {
    const percent = parseFloat(document.getElementById("percent1").value);
    const number = parseFloat(document.getElementById("number1").value);
    if (isNaN(percent) || isNaN(number)) {
      output = "Please enter valid numbers.";
    } else {
      output = `${percent}% of ${number} = ${(percent / 100 * number).toFixed(2)}`;
    }
  }

  else if (calcType.value === "type2") {
    const part = parseFloat(document.getElementById("part2").value);
    const whole = parseFloat(document.getElementById("whole2").value);
    if (isNaN(part) || isNaN(whole) || whole === 0) {
      output = "Please enter valid numbers.";
    } else {
      output = `${part} is ${(part / whole * 100).toFixed(2)}% of ${whole}`;
    }
  }

  else if (calcType.value === "type3") {
    const oldVal = parseFloat(document.getElementById("old3").value);
    const newVal = parseFloat(document.getElementById("new3").value);
    if (isNaN(oldVal) || isNaN(newVal) || oldVal === 0) {
      output = "Please enter valid numbers.";
    } else {
      const change = ((newVal - oldVal) / oldVal) * 100;
      output = change > 0
        ? `Increased by ${change.toFixed(2)}%`
        : `Decreased by ${Math.abs(change).toFixed(2)}%`;
    }
  }

  result.textContent = output;
});
