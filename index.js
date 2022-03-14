/**
 * Render CyberBrokers
 * Using the on-chain Broker renderer
 **/


// Change these variables as you see fit
const WEB3_PROVIDER_URL = "https://mainnet.infura.io/v3/bfce595350ce422db3f06a519b54b40e";
const TOKEN_ID = 0;
const SVG_SAVE_FILE_NAME = `${__dirname}/CyberBroker_${TOKEN_ID}.svg`;


// Required packages
// NOTE: You may need to `npm install -g ethers`
const fs = require('fs');
const ethers = require('ethers');


// CyberBrokers Metadata ABI -- just need the tokenURI and renderer
const CyberBrokersMetadataAbi = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "tokenURI",
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
                "internalType": "uint256",
                "name": "_tokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_startIndex",
                "type": "uint256"
            }
        ],
        "name": "renderBroker",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            },
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

async function main() {

    // Get the metadata contract
    const METADATA_CONTRACT_ADDRESS = "0xEC3e38e536AD4fA55a378B14B257976148b618aC";

    // Attach to the CyberBrokers metadata contract
    const provider = new ethers.providers.JsonRpcProvider(WEB3_PROVIDER_URL);
    const cyberBrokersMetadata = new ethers.Contract(METADATA_CONTRACT_ADDRESS, CyberBrokersMetadataAbi, provider);

    let metadata = JSON.parse((await cyberBrokersMetadata.tokenURI(TOKEN_ID)).replace("data:application/json;utf8,", ""));
    console.log(`Metadata for CyberBroker #${TOKEN_ID}:`);
    console.log(metadata);

    // Render the entire Broker SVG
    let output = "", renderIdx = -1, numIterations = 0;
    while (renderIdx != 0) {
        console.log(renderIdx)
        let res;
        try {
            res = await cyberBrokersMetadata.renderBroker(TOKEN_ID, Math.max(renderIdx, 0));
        } catch (ex) {
            console.log("Panic at:", renderIdx, "- numIterations:", numIterations);
            console.log(output);
            console.log("");
            throw ex;
        }

        output += res[0];
        renderIdx = res[1].toNumber();
        numIterations++;
    }

    // Done, save
    console.log(`Rendered ${TOKEN_ID} in ${numIterations} iterations.`);
    fs.writeFileSync(SVG_SAVE_FILE_NAME, cleanOutputSvg(output), 'utf8');
}

function cleanOutputSvg(output) {
    return output.replace('\u0000', '');
}

main();
