const express = require('express');
const solc = require('solc');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve examples directly
app.use('/examples', express.static(path.join(__dirname, '../frontend/examples')));

app.post('/compile', (req, res) => {
  const code = req.body.code;
  try {
    // Define compilation input
    const input = {
      language: 'Solidity',
      sources: {
        'contract.sol': {
          content: code
        }
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*']
          }
        }
      }
    };

    // Compile the code
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    // Check for errors
    if (output.errors && output.errors.some(err => err.severity === 'error')) {
      const errorMsg = output.errors.map(err => err.formattedMessage).join('\n');
      res.json({ success: false, error: errorMsg });
    } else {
      // Extract the first contract
      const contracts = Object.keys(output.contracts['contract.sol']);
      if (contracts.length > 0) {
        const contractName = contracts[0];
        const contract = output.contracts['contract.sol'][contractName];
        res.json({
          success: true,
          abi: contract.abi,
          bytecode: contract.evm.bytecode.object
        });
      } else {
        res.json({ success: false, error: 'No contracts found in the code' });
      }
    }
  } catch (error) {
    res.json({ success: false, error: `Compilation error: ${error.message}` });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve index.html for all other routes (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
