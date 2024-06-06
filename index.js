const connectButton = document.getElementById('connect');
const walletInfo = document.getElementById('wallet-info');
const accountDisplay = document.getElementById('account');
const balanceDisplay = document.getElementById('balance');
const alertBox = document.getElementById('alert');

let web3;
let account;

// Contract address and ABI
const contractAddress = '0x62Ed29b9F65e10085EE25e89E2606A600Bb09E7b';
const contractABI = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdrawMoney", // Originally depositMoney
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "depositMoney", // Originally withdrawMoney
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferMoney",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

window.addEventListener('load', async () => {
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
    } else {
        showAlert('Please install MetaMask!');
    }
});

connectButton.onclick = async () => {
    if (web3) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await web3.eth.getAccounts();
            account = accounts[0];
            accountDisplay.innerText = account;
            walletInfo.style.display = 'block';
            await getBalance();
        } catch (error) {
            showAlert('Error connecting to MetaMask: ' + error.message);
        }
    } else {
        showAlert('Web3 is not initialized.');
    }
};

const getBalance = async () => {
    try {
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const balance = await contract.methods.balanceOf(account).call();
        balanceDisplay.innerText = web3.utils.fromWei(balance, 'ether') + ' ESV';
        return balance; // Return the balance in Wei
    } catch (error) {
        showAlert('Error fetching balance: ' + error.message);
    }
};

const handleTransactionError = (error) => {
    if (error.code === -32000) {
        showAlert('Insufficient funds for gas. Please add more ETH to your account.');
    } else {
        showAlert('Transaction error: ' + error.message);
    }
};

const performTransaction = async (method, ...args) => {
    try {
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const options = { from: account };
        const estimatedGas = await contract.methods[method](...args).estimateGas(options);
        const gasPrice = web3.utils.toBN(await web3.eth.getGasPrice()).mul(web3.utils.toBN(2)); // Increase gas price by 100%

        const nonce = await web3.eth.getTransactionCount(account, 'pending');

        console.log(`Estimated Gas for ${method}:`, estimatedGas);
        console.log(`Gas Price:`, gasPrice.toString());

        await contract.methods[method](...args).send({ from: account, gas: estimatedGas, gasPrice, nonce });
        await getBalance();
    } catch (error) {
        handleTransactionError(error);
    }
};

const showAlert = (message) => {
    alertBox.innerText = message;
    alertBox.style.display = 'block';
    setTimeout(() => {
        alertBox.style.display = 'none';
    }, 5000);
};

document.getElementById('deposit').onclick = async () => {
    const amount = prompt('Enter amount to deposit (in ESV):');
    if (amount) {
        const amountInWei = web3.utils.toWei(amount, 'ether');
        await performTransaction('withdrawMoney', amountInWei); // Calls the renamed withdrawMoney function to deposit
    }
};

document.getElementById('withdraw').onclick = async () => {
    const amount = prompt('Enter amount to withdraw (in ESV):');
    if (amount) {
        const amountInWei = web3.utils.toWei(amount, 'ether');
        await performTransaction('depositMoney', amountInWei); // Calls the renamed depositMoney function to withdraw
    }
};

document.getElementById('transfer').onclick = async () => {
    const recipient = prompt('Enter recipient address:');
    const amount = prompt('Enter amount to transfer (in ESV):');
    if (recipient && amount) {
        const amountInWei = web3.utils.toWei(amount, 'ether');
        await performTransaction('transferMoney', recipient, amountInWei);
    }
};
