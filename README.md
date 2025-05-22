# BSC Contract Editor and Deployer

A web-based platform for writing, compiling, and deploying smart contracts to the Binance Smart Chain (BSC) mainnet.

## Features

- In-browser Solidity editor with syntax highlighting (using CodeMirror)
- Contract compilation via Solidity compiler
- Direct deployment to BSC mainnet via MetaMask
- Support for constructor arguments
- Gas estimation and customization

## Project Structure

```
├── backend/            # Node.js backend
│   ├── server.js       # Express server for contract compilation & serving static files
│   └── package.json    # Backend dependencies
├── frontend/           # Web frontend
│   ├── index.html      # Main HTML file
│   ├── editor.js       # CodeMirror editor and Web3 logic
│   ├── examples/       # Example Solidity contracts
│   └── package.json    # Frontend dependencies
├── package.json        # Root package.json with scripts
└── README.md           # This file
```

## Prerequisites

- Node.js (v14+)
- npm or yarn
- MetaMask browser extension
- BSC account with BNB for gas fees

## Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd bsc-contract-editor
   ```

2. Install all dependencies with a single command:
   ```
   npm run install:all
   ```

   This will install dependencies for the root project, backend, and frontend.

## Running the Application

1. Start the application:
   ```
   npm start
   ```

   This will start the Express server which serves both the API and the static frontend files.

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. For development with auto-reload:
   ```
   npm run dev
   ```

## Usage

1. Write or paste your Solidity smart contract code in the editor.
2. Alternatively, select one of the provided examples from the dropdown.
3. Click "Compile" to compile your contract.
4. If compilation is successful, you can provide constructor arguments if your contract requires them.
5. Click "Deploy" to deploy your contract to the BSC mainnet.
6. Confirm the transaction in MetaMask when prompted.
7. After successful deployment, the contract address will be displayed.

## Troubleshooting

### Editor Loading Issues

The application uses CodeMirror, a lightweight and stable code editor. If you encounter any issues with the editor:

1. Try refreshing the page
2. Clear your browser cache
3. Make sure you're using a modern browser (Chrome, Firefox, Edge)

### Example Loading Issues

If examples don't load correctly:

1. Make sure your server is running
2. Check the browser console for specific errors
3. The examples should be in the `frontend/examples/` directory

### Compilation Errors

If you encounter compilation errors, check:

1. The Solidity version pragma in your contract
2. Syntax errors highlighted in the editor
3. Whether your contract exceeds the compiler's complexity limits

### Deployment Issues

If deployment fails:

1. Make sure you have MetaMask installed and unlocked
2. Ensure you're connected to the BSC mainnet
3. Verify you have enough BNB to cover gas fees
4. Try specifying a custom gas limit if estimation fails

## Notes

- The application uses MetaMask for transaction signing and blockchain interaction.
- Make sure you have sufficient BNB in your MetaMask wallet to cover gas fees.
- The application will automatically try to switch to the BSC mainnet if you're connected to a different network.

## License

MIT 