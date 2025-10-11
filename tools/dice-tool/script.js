function rollDice() {
  const result = Math.floor(Math.random() * 6) + 1;
  document.getElementById("result").textContent = `You rolled: ${result}`;
}
