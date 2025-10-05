document.addEventListener("DOMContentLoaded", () => {
  const principalEl = document.getElementById("principal");
  const annualRateEl = document.getElementById("annual-rate");
  const tenureEl = document.getElementById("tenure-years");
  const resultEl = document.getElementById("result");
  const calcBtn = document.getElementById("calculate-btn");
  const clearBtn = document.getElementById("clear-btn");

  function fmt(v) {
    return Number(v).toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  function show(msg, isError = false) {
    resultEl.innerHTML = isError ? `❌ ${msg}` : msg;
  }

  function calculateEMI(P, annualRatePct, years) {
    const n = Math.round(years * 12);
    if (n <= 0)
      return { emi: 0, totalPayment: 0, totalInterest: 0, monthlyRate: 0 };

    const r = annualRatePct / 100 / 12; // monthly rate
    if (r === 0) {
      // zero interest
      const emi = P / n;
      return { emi, totalPayment: emi * n, totalInterest: 0, monthlyRate: r };
    }

    const x = Math.pow(1 + r, n);
    const emi = (P * r * x) / (x - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;
    return { emi, totalPayment, totalInterest, monthlyRate: r };
  }

  calcBtn.addEventListener("click", () => {
    const P = parseFloat(principalEl.value);
    const annual = parseFloat(annualRateEl.value);
    const years = parseFloat(tenureEl.value);

    if (isNaN(P) || P <= 0)
      return show("Please enter a valid principal amount.", true);
    if (isNaN(annual) || annual < 0)
      return show("Please enter a valid annual interest rate (>= 0).", true);
    if (isNaN(years) || years <= 0)
      return show("Please enter a valid loan tenure in years.", true);

    const { emi, totalPayment, totalInterest, monthlyRate } = calculateEMI(
      P,
      annual,
      years
    );

    const html = `
      <strong>Monthly EMI:</strong> ₹ ${fmt(emi)}<br>
      <strong>Monthly interest rate:</strong> ${(monthlyRate * 100).toFixed(
        4
      )} %<br>
      <strong>Number of months:</strong> ${Math.round(years * 12)}<br>
      <strong>Total payment:</strong> ₹ ${fmt(totalPayment)}<br>
      <strong>Total interest:</strong> ₹ ${fmt(totalInterest)}
    `;
    show(html);
  });

  clearBtn.addEventListener("click", () => {
    principalEl.value = "";
    annualRateEl.value = "";
    tenureEl.value = "";
    resultEl.textContent = "";
  });
});
