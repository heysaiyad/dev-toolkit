// Get references to elements
const sqftInput = document.getElementById('sqft');
const convertBtn = document.getElementById('convertBtn');
const result = document.getElementById('result');

// Add click event listener
convertBtn.addEventListener('click', () => {
    const sqft = parseFloat(sqftInput.value);

    if (isNaN(sqft) || sqft < 0) {
        result.innerText = "Please enter a valid positive number.";
        return;
    }

    const sqm = sqft * 0.092903;
    result.innerText = `${sqft} Sq.Ft = ${sqm.toFixed(2)} Sq.M`;
});
