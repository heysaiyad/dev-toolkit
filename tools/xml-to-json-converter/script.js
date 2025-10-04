class XMLToJSONConverter {
    /**
     * func. to convert XML string to JSON object
     */
    convert(xmlString) {
        try {
            // Parse XML string to DOM
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
            
            // Check for parsing errors
            const parserError = xmlDoc.querySelector('parsererror');
            if (parserError) {
                throw new Error('Invalid XML: ' + parserError.textContent);
            }
            
            // Convert XML DOM to JSON object
            const jsonObj = this.xmlNodeToJson(xmlDoc.documentElement);
            
            // Return formatted JSON string
            return JSON.stringify(jsonObj, null, 2);
        } catch (error) {
            throw new Error('Conversion failed: ' + error.message);
        }
    }
    
    xmlNodeToJson(node) {
        const obj = {};
        
        // Handle attributes
        if (node.attributes && node.attributes.length > 0) {
            obj['@attributes'] = {};
            for (let i = 0; i < node.attributes.length; i++) {
                const attr = node.attributes[i];
                obj['@attributes'][attr.nodeName] = attr.nodeValue;
            }
        }
        
        // Handle child nodes
        if (node.hasChildNodes()) {
            for (let i = 0; i < node.childNodes.length; i++) {
                const child = node.childNodes[i];
                const nodeName = child.nodeName;
                
                // Handle text nodes and CDATA
                if (child.nodeType === 3 || child.nodeType === 4) { // TEXT_NODE or CDATA_SECTION_NODE
                    const text = child.nodeValue.trim();
                    if (text) {
                        // If node has only text content (no child elements)
                        if (node.childNodes.length === 1 || 
                            (node.childNodes.length === node.querySelectorAll('*').length + 1)) {
                            return text;
                        }
                        obj['#text'] = text;
                    }
                }
                // Handle element nodes
                else if (child.nodeType === 1) { // ELEMENT_NODE
                    // Recursively convert child node
                    const childJson = this.xmlNodeToJson(child);
                    
                    // Handle multiple elements with same name (create array)
                    if (obj[nodeName]) {
                        // Convert to array if not already
                        if (!Array.isArray(obj[nodeName])) {
                            obj[nodeName] = [obj[nodeName]];
                        }
                        obj[nodeName].push(childJson);
                    } else {
                        obj[nodeName] = childJson;
                    }
                }
            }
        }
        
        // Return simple value if object only contains text
        if (Object.keys(obj).length === 1 && obj['#text']) {
            return obj['#text'];
        }
        
        return obj;
    }
}

// Initialize converter
const converter = new XMLToJSONConverter();

// DOM Elements
const xmlInput = document.getElementById('xmlInput');
const jsonOutput = document.getElementById('jsonOutput');
const convertBtn = document.getElementById('convertBtn');
const copyBtn = document.getElementById('copyJson');
const downloadBtn = document.getElementById('downloadJson');
const clearXmlBtn = document.getElementById('clearXml');
const pasteXmlBtn = document.getElementById('pasteXml');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

let convertedJson = '';

function showToast(message, isError = false) {
    toastMessage.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


function toggleOutputButtons(enabled) {
    copyBtn.disabled = !enabled;
    downloadBtn.disabled = !enabled;
}

function convertXmlToJson() {
    const xmlText = xmlInput.value.trim();
    
    // Validate input
    if (!xmlText) {
        showToast('Please enter XML data to convert', true);
        return;
    }
    
    try {
        // Perform conversion
        convertedJson = converter.convert(xmlText);
        
        // Display result
        jsonOutput.value = convertedJson;
        
        // Enable output buttons
        toggleOutputButtons(true);
        
        // Show success message
        showToast('XML successfully converted to JSON!');
    } catch (error) {
        // Show error message
        showToast(error.message, true);
        jsonOutput.value = '';
        convertedJson = '';
        toggleOutputButtons(false);
    }
}

async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(convertedJson);
        showToast('JSON copied to clipboard!');
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = convertedJson;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('JSON copied to clipboard!');
        } catch (err) {
            showToast('Failed to copy to clipboard', true);
        }
        
        document.body.removeChild(textArea);
    }
}


function downloadJson() {
    try {
        // Create blob from JSON string
        const blob = new Blob([convertedJson], { type: 'application/json' });
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `converted-${timestamp}.json`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        showToast('JSON file downloaded successfully!');
    } catch (error) {
        showToast('Failed to download file', true);
    }
}

function clearXmlInput() {
    xmlInput.value = '';
    jsonOutput.value = '';
    convertedJson = '';
    toggleOutputButtons(false);
    showToast('Input cleared');
}


async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        xmlInput.value = text;
        showToast('Content pasted from clipboard');
    } catch (error) {
        showToast('Failed to paste from clipboard. Please paste manually (Ctrl+V)', true);
    }
}

// Event Listeners
convertBtn.addEventListener('click', convertXmlToJson);
copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadJson);
clearXmlBtn.addEventListener('click', clearXmlInput);
pasteXmlBtn.addEventListener('click', pasteFromClipboard);

// Allow Enter key in textarea (Ctrl+Enter to convert)
xmlInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        convertXmlToJson();
    }
});

// Initial state
toggleOutputButtons(false);

// Sample XML for testing (you can remove this in production)
console.log('XML to JSON Converter loaded successfully!');
console.log('Conversion Logic:');
console.log('1. Parse XML string using DOMParser');
console.log('2. Check for parsing errors');
console.log('3. Recursively convert XML nodes to JSON objects');
console.log('4. Handle attributes with @attributes prefix');
console.log('5. Handle text content with #text key');
console.log('6. Handle multiple elements with same name as arrays');
console.log('7. Format output with proper indentation');