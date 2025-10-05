function randomString(length = 5) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomNumber(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomEmail() {
  return randomString(5) + '@example.com';
}

function generateField(schema) {
  if (typeof schema === 'string') {
    switch (schema) {
      case 'string': return randomString(7);
      case 'email': return randomEmail();
      case 'number': return randomNumber();
      default: return null;
    }
  } else if (typeof schema === 'object') {
    if (schema.type === 'number') {
      return randomNumber(schema.min || 0, schema.max || 100);
    } else if (schema.type === 'string') {
      return randomString(schema.length || 7);
    }
  }
  return null;
}

function generateMockData(schema, count) {
  const data = [];
  for (let i = 0; i < count; i++) {
    const obj = {};
    for (let key in schema) {
      obj[key] = generateField(schema[key]);
    }
    data.push(obj);
  }
  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  const schemaInput = document.getElementById('schema');
  const countInput = document.getElementById('count');
  const generateBtn = document.getElementById('generate');
  const output = document.getElementById('output');

  function generateMockData() {
    try {
      const schema = JSON.parse(schemaInput.value);
      const count = parseInt(countInput.value) || 5;
      const data = Array.from({ length: count }, () => generateObject(schema));
      output.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      output.textContent = `Error: ${error.message}`;
    }
  }

  function generateObject(schema) {
    const result = {};
    for (const [key, value] of Object.entries(schema)) {
      result[key] = generateValue(value);
    }
    return result;
  }

  function generateValue(schema) {
    if (typeof schema === 'string') {
      switch (schema) {
        case 'string': return generateRandomName();
        case 'email': return generateRandomEmail();
        case 'number': return Math.floor(Math.random() * 100);
        default: return null;
      }
    } else if (typeof schema === 'object' && schema !== null) {
      if (schema.type === 'number') {
        const min = schema.min || 0;
        const max = schema.max || 100;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
    }
    return null;
  }

  function generateRandomName() {
    const names = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa', 'Alex', 'Emma'];
    return names[Math.floor(Math.random() * names.length)];
  }

  function generateRandomEmail() {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com'];
    const name = generateRandomName().toLowerCase();
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${name}${Math.floor(Math.random() * 1000)}@${domain}`;
  }

  // Event listeners
  generateBtn.addEventListener('click', generateMockData);

  // Set initial schema if empty
  if (!schemaInput.value) {
    schemaInput.value = '{"name": "string","age": {"type": "number","min": 18,"max": 60},"email": "email"}';
  }

  // Generate initial data
  generateMockData();
});
