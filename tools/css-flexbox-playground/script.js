document.addEventListener('DOMContentLoaded', function() {
    // Initialize your tool here
    const flexContainer = document.getElementById('flex-container');
    const nbElementsResult = document.getElementById('nb-elements-result');
    const flexDirectionSelect = document.getElementById('flex-direction');
    const flexWrapSelect = document.getElementById('flex-wrap');
    const justifyContentSelect = document.getElementById('justify-content');
    const alignItemsSelect = document.getElementById('align-items');
    const alignContentSelect = document.getElementById('align-content');
    const gapSize = document.getElementById('gap');
    const cssCode = document.getElementById('css-code');
    const btnCssCopy = document.getElementById('btn-css-copy');
    const sizingBlocks = document.getElementById('check-sizing-blocks');
    const sizeBlocksRange = document.getElementById('size-blocks-range');
    const resetBtn = document.getElementById('reset-btn');

    // Initialize States
    const DEFAULT_VALUES = {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'stretch',
        gap: 10,
        nbElements: 5,
        sizeBlocks: null, // Disabled by default
    };

    let state = { ...DEFAULT_VALUES };

    updateInputs();
    updateUI();

    // Auto-focus on main input if applicable
    const mainInput = document.getElementById('main-input');
    if (mainInput) {
        mainInput.focus();
    }

    // Add your functionality here
    document.getElementById('add-item-btn').addEventListener('click', addBlock);
    document.getElementById('remove-item-btn').addEventListener('click', removeBlock);

    [
        [flexDirectionSelect, 'flexDirection'],
        [flexWrapSelect, 'flexWrap'],
        [justifyContentSelect, 'justifyContent'],
        [alignItemsSelect, 'alignItems'],
        [alignContentSelect, 'alignContent'],
        [gapSize, 'gap', true]
    ].forEach(([element, stateKey, isNumeric]) => {
        element.addEventListener('change', function() {
            state[stateKey] = isNumeric ? parseInt(this.value, 10) : this.value;
            updateUI();
        });
    });

    btnCssCopy.addEventListener('click', function() {
        copyToClipboard(cssCode.textContent).then(() => {
            btnCssCopy.innerHTML = '<i class="fa fa-check"></i>';
            setTimeout(() => {
                btnCssCopy.innerHTML = '<i class="fa fa-copy"></i>';
            }, 2000);
        }).catch(() => {
            alert('Failed to copy to clipboard');
        });
    });

    sizingBlocks.addEventListener('change', function() {
        sizeBlocksRange.disabled = !this.checked;
        state.sizeBlocks = this.checked ? sizeBlocksRange.value : null;
        updateSizeBlocks();
    });

    sizeBlocksRange.addEventListener('change', function() {
        state.sizeBlocks = parseInt(this.value, 10);
        updateSizeBlocks();
    });

    // Reset to default values
    resetBtn.addEventListener('click', function() {
        resetState();
        
        resetBtn.classList.add('clicked');
        setTimeout(() => resetBtn.classList.remove('clicked'), 200);
    });
    
    function addBlock() {
        state.nbElements++;
        updateNbBox();
    }

    function removeBlock() {
        if (state.nbElements > 0) {
            state.nbElements--;
            updateNbBox();
        }
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            // navigator clipboard api method'
            return navigator.clipboard.writeText(text);
        } else {
            // text area method
            let textArea = document.createElement("textarea");
            textArea.value = text;
            // make the textarea out of viewport
            textArea.style.position = "absolute";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            return new Promise((res, rej) => {
                // here the magic happens
                document.execCommand('copy') ? res() : rej();
                textArea.remove();
            });
        }
    }

    function updateNbBox()
    {
        let currentElements = flexContainer.children.length;
        if (state.nbElements > currentElements) {
            for (let i = currentElements; i < state.nbElements; i++) {
                const item = document.createElement('div');
                item.className = 'flex-item';
                item.textContent = i + 1;
                flexContainer.appendChild(item);
            }
        } else if (state.nbElements < currentElements) {
            for (let i = currentElements; i > state.nbElements; i--) {
                flexContainer.removeChild(flexContainer.lastChild);
            }
        }

        nbElementsResult.textContent = state.nbElements;
        updateSizeBlocks();
    }
    

    function updateSizeBlocks() {
        let value = state.sizeBlocks ? `${state.sizeBlocks}px` : '';
        Array.from(flexContainer.children).forEach(child => {
            child.style.height = value;
            child.style.maxHeight = value;
            child.style.minHeight = value;

            child.style.width = value;
            child.style.maxWidth = value;
            child.style.minWidth = value;
        });
    }

    function updateProperties() {
        const properties = {
            flexDirection: state.flexDirection,
            flexWrap: state.flexWrap,
            justifyContent: state.justifyContent,
            alignItems: state.alignItems,
            alignContent: state.alignContent,
            gap: `${state.gap}px`
        };

        Object.entries(properties).forEach(([prop, value]) => {
            flexContainer.style[prop] = value;
        });

        updateCssCode();
    }

    function updateCssCode() {
        cssCode.textContent = `
.flex-container {
    display: flex;
    flex-direction: ${state.flexDirection};
    flex-wrap: ${state.flexWrap};
    justify-content: ${state.justifyContent};
    align-items: ${state.alignItems};
    align-content: ${state.alignContent};
    gap: ${state.gap}px;
}
        `.trim();
    }

    function updateInputs() {
        flexDirectionSelect.value = state.flexDirection;
        flexWrapSelect.value = state.flexWrap;
        justifyContentSelect.value = state.justifyContent;
        alignItemsSelect.value = state.alignItems;
        alignContentSelect.value = state.alignContent;
        gapSize.value = state.gap;
        sizingBlocks.checked = !!state.sizeBlocks;
        sizeBlocksRange.disabled = !state.sizeBlocks;
        sizeBlocksRange.value = state.sizeBlocks ?? DEFAULT_VALUES.sizeBlocks;
    }

    function resetState() {
        state = { ...DEFAULT_VALUES };
    
        updateInputs();
        updateUI();
    };

    function updateUI() {
        updateNbBox();
        updateProperties();
    }
});
