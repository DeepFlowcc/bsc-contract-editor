// Initialize CodeMirror editor
let editor;

// Define Solidity mode for CodeMirror
defineSolidityMode();
initializeEditor();

// Define a simple mode for Solidity syntax highlighting
function defineSolidityMode() {
  CodeMirror.defineSimpleMode("solidity", {
    // The start state contains the rules that are initially used
    start: [
      // Comments
      {regex: /\/\/.*/, token: "comment"},
      {regex: /\/\*/, token: "comment", next: "comment"},
      
      // Strings
      {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
      {regex: /'(?:[^\\]|\\.)*?(?:'|$)/, token: "string"},
      
      // Numbers
      {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
      
      // Keywords
      {regex: /\b(pragma|solidity|contract|library|interface|function|modifier|event|struct|enum|mapping|address|string|bytes|int|uint|bool|public|private|external|internal|payable|view|pure|memory|storage|calldata|returns|return|if|else|for|while|do|break|continue|throw|import|try|catch|assembly|unchecked)\b/, token: "keyword"},
      
      // Constants
      {regex: /\b(true|false|wei|szabo|finney|ether|seconds|minutes|hours|days|weeks|years)\b/, token: "atom"},
      
      // Variables
      {regex: /\b(msg|block|tx|this|super|now)\b/, token: "variable-2"},
      
      // Operators and punctuation
      {regex: /[+\-/*=<>!]+/, token: "operator"},
      {regex: /[{}[\]();:,.]/, token: "punctuation"},
      
      // Identifiers
      {regex: /[a-z$][\w$]*/, token: "variable"}
    ],
    
    // The comment state
    comment: [
      {regex: /.*?\*\//, token: "comment", next: "start"},
      {regex: /.*/, token: "comment"}
    ],
    
    // The meta property contains global information about the mode
    meta: {
      dontIndentStates: ["comment"],
      lineComment: "//"
    }
  });
}

// Initialize the editor
function initializeEditor() {
  const editorElement = document.getElementById('editor');
  if (!editorElement) {
    console.error('Editor element not found');
    return;
  }

  editor = CodeMirror(editorElement, {
    value: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _initialSupply * 10**uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}`,
    mode: "solidity",
    theme: "dracula",
    lineNumbers: true,
    indentUnit: 4,
    smartIndent: true,
    indentWithTabs: false,
    lineWrapping: true,
    extraKeys: {"Ctrl-Space": "autocomplete"},
    autoCloseBrackets: true,
    matchBrackets: true
  });
  
  // Ensure CodeMirror is properly sized
  setTimeout(() => {
    editor.refresh();
  }, 100);
  
  // Add example contracts dropdown functionality
  setupExampleContracts();
  
  // Initialize event listeners for buttons
  setupEventListeners();
}

// Variables to store compilation results
let abi = null;
let bytecode = null;

// Setup the event listeners for buttons
function setupEventListeners() {
  // Compile button event listener
  document.getElementById('compile').addEventListener('click', compileContract);
  
  // Deploy button event listener
  document.getElementById('deploy').addEventListener('click', deployContract);
}

// Load example contracts
function setupExampleContracts() {
  const exampleSelect = document.getElementById('exampleSelect');
  if (exampleSelect) {
    exampleSelect.addEventListener('change', async (event) => {
      const selectedExample = event.target.value;
      if (!selectedExample) return;
      
      try {
        // Fix the path to examples - use the full path
        const response = await fetch(`/examples/${selectedExample}.sol`);
        if (!response.ok) {
          // Try a different path if the first one fails
          const alternativeResponse = await fetch(`./frontend/examples/${selectedExample}.sol`);
          if (!alternativeResponse.ok) {
            throw new Error(`Failed to load example: ${response.status}`);
          }
          const code = await alternativeResponse.text();
          editor.setValue(code);
        } else {
          const code = await response.text();
          editor.setValue(code);
        }
        
        // Reset compilation results
        abi = null;
        bytecode = null;
        document.getElementById('result').innerText = 'Loaded example: ' + selectedExample;
      } catch (error) {
        document.getElementById('result').innerText = `Error loading example: ${error.message}`;
        console.error('Error loading example:', error);
      }
      
      // Reset the select
      exampleSelect.value = '';
    });
  }
}

// Helper function to parse constructor arguments
function parseConstructorArgs(argsString) {
  if (!argsString.trim()) return [];
  
  const args = [];
  let inString = false;
  let currentArg = '';
  let stringDelimiter = '';
  
  for (let i = 0; i < argsString.length; i++) {
    const char = argsString[i];
    
    if ((char === "'" || char === '"') && (i === 0 || argsString[i-1] !== '\\')) {
      if (!inString) {
        inString = true;
        stringDelimiter = char;
      } else if (char === stringDelimiter) {
        inString = false;
      }
      currentArg += char;
    } else if (char === ',' && !inString) {
      args.push(currentArg.trim());
      currentArg = '';
    } else {
      currentArg += char;
    }
  }
  
  if (currentArg.trim()) {
    args.push(currentArg.trim());
  }
  
  // Process each argument based on its type
  return args.map(arg => {
    // Remove quotes for strings
    if ((arg.startsWith("'") && arg.endsWith("'")) || (arg.startsWith('"') && arg.endsWith('"'))) {
      return arg.substring(1, arg.length - 1);
    }
    // Convert to boolean
    else if (arg.toLowerCase() === 'true') return true;
    else if (arg.toLowerCase() === 'false') return false;
    // Convert to number if possible
    else if (!isNaN(arg)) {
      return /\./.test(arg) ? parseFloat(arg) : parseInt(arg);
    }
    // Return as is if none of the above
    return arg;
  });
}

// Compile contract function
async function compileContract() {
  if (!editor) {
    document.getElementById('result').innerText = 'Editor not initialized yet.';
    return;
  }
  
  const code = editor.getValue();
  const resultEl = document.getElementById('result');
  resultEl.innerText = 'Compiling...';
  
  try {
    const response = await fetch('http://localhost:3000/compile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    const result = await response.json();
    if (result.success) {
      abi = result.abi;
      bytecode = result.bytecode;
      resultEl.innerHTML = `<span style="color: green">✓ Compilation successful</span><br>
        <strong>Contract ABI:</strong><br>
        <pre style="font-size: 0.8rem; max-height: 100px; overflow: auto">${JSON.stringify(abi, null, 2)}</pre>`;
    } else {
      resultEl.innerHTML = `<span style="color: red">✗ Compilation failed</span><br><pre>${result.error}</pre>`;
    }
  } catch (error) {
    resultEl.innerHTML = `<span style="color: red">✗ Error</span><br>${error.message}`;
  }
}

// Deploy contract function
async function deployContract() {
  const resultEl = document.getElementById('result');
  
  if (!abi || !bytecode) {
    resultEl.innerHTML = '<span style="color: orange">⚠ Please compile the contract first</span>';
    return;
  }
  
  if (typeof window.ethereum === 'undefined') {
    resultEl.innerHTML = '<span style="color: orange">⚠ Please install MetaMask and connect to the BSC mainnet</span>';
    return;
  }

  try {
    resultEl.innerText = 'Connecting to MetaMask...';
    
    // Connect to MetaMask
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const web3 = new Web3(window.ethereum);

    // Check if connected to BSC mainnet (chainId 56)
    const chainId = await web3.eth.getChainId();
    if (chainId !== 56) {
      // Try to switch to BSC mainnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }], // 0x38 is 56 in hex
        });
      } catch (switchError) {
        // If the chain hasn't been added to MetaMask, add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x38',
                chainName: 'Binance Smart Chain Mainnet',
                nativeCurrency: {
                  name: 'BNB',
                  symbol: 'bnb',
                  decimals: 18
                },
                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                blockExplorerUrls: ['https://bscscan.com/']
              }],
            });
          } catch (addError) {
            throw new Error('Could not add BSC network to MetaMask: ' + addError.message);
          }
        } else {
          throw new Error('Could not switch to BSC network: ' + switchError.message);
        }
      }
    }

    resultEl.innerText = 'Preparing deployment...';
    
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi);
    
    // Parse constructor arguments if any
    const argsString = document.getElementById('constructorArgs').value;
    const constructorArgs = parseConstructorArgs(argsString);
    
    // Prepare deployment transaction
    let deployTx;
    if (constructorArgs.length > 0) {
      deployTx = contract.deploy({
        data: '0x' + bytecode,
        arguments: constructorArgs
      });
    } else {
      deployTx = contract.deploy({
        data: '0x' + bytecode
      });
    }

    // Get user-specified gas limit or estimate
    const userGasLimit = document.getElementById('gasLimit').value;
    let gas;
    
    if (userGasLimit && !isNaN(userGasLimit)) {
      gas = userGasLimit;
    } else {
      resultEl.innerText = 'Estimating gas...';
      try {
        gas = await deployTx.estimateGas({ from: accounts[0] });
        // Add a buffer to the estimated gas
        gas = Math.ceil(gas * 1.2);
      } catch (error) {
        throw new Error(`Gas estimation failed: ${error.message}. Try setting a manual gas limit.`);
      }
    }

    const gasPrice = await web3.eth.getGasPrice();
    
    resultEl.innerText = 'Waiting for user confirmation in MetaMask...';
    
    // Send the transaction
    const receipt = await deployTx.send({
      from: accounts[0],
      gas,
      gasPrice
    });

    resultEl.innerHTML = `
      <span style="color: green">✓ Contract deployed successfully!</span><br>
      <strong>Contract Address:</strong> <a href="https://bscscan.com/address/${receipt.options.address}" target="_blank">${receipt.options.address}</a><br>
      <strong>Transaction Hash:</strong> <a href="https://bscscan.com/tx/${receipt.transactionHash}" target="_blank">${receipt.transactionHash}</a>
    `;
  } catch (error) {
    resultEl.innerHTML = `<span style="color: red">✗ Deployment failed</span><br>${error.message}`;
  }
}
