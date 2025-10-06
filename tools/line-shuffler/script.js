document.addEventListener('DOMContentLoaded', function() {
    const inputEl = document.getElementById('inputArea');
    const outputEl = document.getElementById('outputArea');
    const shuffleBtn = document.getElementById('shuffleBtn');

    shuffleBtn.addEventListener('click', () => {
        const items = inputEl.value.trim().split('\n').filter(line => line.length > 0);

        if (items.length === 0) {
            alert("Please enter at least one item.");
            return;
        }

        // Fisher-Yates Shuffle
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }

        outputEl.value = items.join('\n');
    });
});
