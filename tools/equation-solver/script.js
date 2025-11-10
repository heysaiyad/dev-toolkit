// Equation Solver Logic
(function(){
  // --- DOM Elements ---
  const typeSelect = document.getElementById('eq-type');
  const linearInputs = document.getElementById('linear-inputs');
  const quadraticInputs = document.getElementById('quadratic-inputs');
  const solveBtn = document.getElementById('solveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const solutionOutput = document.getElementById('solution-output');
  
  // Summary Elements
  const summaryType = document.getElementById('summary-type');
  const summaryCoeffs = document.getElementById('summary-coeffs');
  const summaryDisc = document.getElementById('summary-discriminant');
  const summaryNature = document.getElementById('summary-nature');
  
  // Input fields for easy clearing/resetting
  const inputs = {
      'a-linear': document.getElementById('a-linear'),
      'b-linear': document.getElementById('b-linear'),
      'a-quadratic': document.getElementById('a-quadratic'),
      'b-quadratic': document.getElementById('b-quadratic'),
      'c-quadratic': document.getElementById('c-quadratic')
  };

  // --- Utility Functions ---

  /**
   * Toggles the visibility of linear or quadratic input fields and resets summary.
   */
  function toggleInputs() {
    const type = typeSelect.value;
    linearInputs.style.display = type === 'linear' ? 'block' : 'none';
    quadraticInputs.style.display = type === 'quadratic' ? 'block' : 'none';
    
    // Set initial values for the summary card based on the selected type
    if (type === 'linear') {
        summaryType.textContent = 'Linear';
        summaryCoeffs.textContent = `a=${inputs['a-linear'].value || 0}, b=${inputs['b-linear'].value || 0}`;
        summaryNature.textContent = 'Unique Solution (Default)';
    } else {
        summaryType.textContent = 'Quadratic';
        summaryCoeffs.textContent = `a=${inputs['a-quadratic'].value || 0}, b=${inputs['b-quadratic'].value || 0}, c=${inputs['c-quadratic'].value || 0}`;
        summaryNature.textContent = 'Analysis required';
    }
    
    summaryDisc.textContent = '-';
    solutionOutput.innerHTML = '<p>Results will appear here after analysis.</p>';
  }

  /**
   * Clears all input fields and resets the results.
   */
  function clearResults() {
    // Clear all input values
    for (const key in inputs) {
        inputs[key].value = '';
    }
    // Set default values back for convenience
    inputs['a-linear'].value = '2';
    inputs['b-linear'].value = '-4';
    inputs['a-quadratic'].value = '1';
    inputs['b-quadratic'].value = '5';
    inputs['c-quadratic'].value = '6';

    typeSelect.value = 'linear'; // Reset selector
    toggleInputs(); // Reset display and summary
    solutionOutput.innerHTML = '<p>Input fields cleared. Ready for new equation.</p>';
  }

  /**
   * Solves the linear equation: ax + b = 0
   */
  function solveLinear(a, b) {
    let outputHTML = '';
    let nature = '';
    
    if (a === 0 && b === 0) {
      nature = 'Infinite Solutions';
      outputHTML = '<p class="solution-type">This equation is an identity (0 = 0).</p><p class="solution-result">x is any real number.</p>';
    } else if (a === 0) {
      nature = 'No Solution';
      outputHTML = `<p class="solution-error">Equation simplifies to 0 = ${b}.</p><p class="solution-type">There is no solution for x.</p>`;
    } else {
      nature = 'Unique Solution';
      const x = -b / a;
      outputHTML = `<p class="solution-type">Solution is unique:</p><p class="solution-result">x = ${x.toFixed(4)}</p>`;
    }
    
    summaryType.textContent = 'Linear';
    summaryCoeffs.textContent = `a=${a}, b=${b}`;
    summaryDisc.textContent = '-';
    summaryNature.textContent = nature;
    solutionOutput.innerHTML = outputHTML;
  }

  /**
   * Solves the quadratic equation: ax^2 + bx + c = 0
   */
  function solveQuadratic(a, b, c) {
    let outputHTML = '';
    let nature = '';
    const discriminant = b * b - 4 * a * c;
    
    if (a === 0) {
      // Degenerate case: falls back to linear equation
      solveLinear(b, c); // Treat as bx + c = 0
      summaryType.textContent = 'Degenerate (Linear)';
      return;
    }

    if (discriminant > 0) {
      nature = 'Two Distinct Real Roots';
      const sqrtD = Math.sqrt(discriminant);
      const x1 = (-b + sqrtD) / (2 * a);
      const x2 = (-b - sqrtD) / (2 * a);
      outputHTML = `<p class="solution-type">${nature}</p><p class="solution-result">x₁ = ${x1.toFixed(4)}</p><p class="solution-result">x₂ = ${x2.toFixed(4)}</p>`;

    } else if (discriminant === 0) {
      nature = 'One Repeated Real Root';
      const x = -b / (2 * a);
      outputHTML = `<p class="solution-type">${nature}</p><p class="solution-result">x = ${x.toFixed(4)}</p>`;

    } else { // discriminant < 0
      nature = 'Two Distinct Complex Roots';
      const realPart = (-b / (2 * a)).toFixed(4);
      const imagPart = (Math.sqrt(Math.abs(discriminant)) / (2 * a)).toFixed(4);
      
      // Handle the imaginary unit (i)
      outputHTML = `<p class="solution-type">${nature}</p><p class="solution-result">x₁ = ${realPart} + ${imagPart}i</p><p class="solution-result">x₂ = ${realPart} - ${imagPart}i</p>`;
    }

    summaryType.textContent = 'Quadratic';
    summaryCoeffs.textContent = `a=${a}, b=${b}, c=${c}`;
    summaryDisc.textContent = discriminant.toFixed(4);
    summaryNature.textContent = nature;
    solutionOutput.innerHTML = outputHTML;
  }

  /**
   * Main function to read inputs and dispatch to the correct solver.
   */
  function solveEquation() {
    const type = typeSelect.value;
    
    if (type === 'linear') {
      const a = parseFloat(inputs['a-linear'].value) || 0;
      const b = parseFloat(inputs['b-linear'].value) || 0;
      solveLinear(a, b);
    } else if (type === 'quadratic') {
      const a = parseFloat(inputs['a-quadratic'].value) || 0;
      const b = parseFloat(inputs['b-quadratic'].value) || 0;
      const c = parseFloat(inputs['c-quadratic'].value) || 0;
      solveQuadratic(a, b, c);
    }
  }

  // --- Event Listeners ---
  solveBtn.addEventListener('click', solveEquation);
  clearBtn.addEventListener('click', clearResults);
  
  // Attach functions to a global object for HTML access
  window.solver = {
    toggleInputs: toggleInputs
  };

  setTimeout(() => {
      toggleInputs();
      solveEquation(); 
  }, 10);
})();