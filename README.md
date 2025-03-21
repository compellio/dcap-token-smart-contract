# DCAP Token Smart Contract

## Usage

To install the repository and its dependencies, run:

```shell
git clone https://github.com/compellio/dcap-token-smart-contract
nvm install && nvm use
npm ci
```

If you don't have NVM installed (see <https://github.com/nvm-sh/nvm>), make sure you are on Node v20.x to run the
commands below.

### Smart Contracts

To compile the contracts, run:

```shell
npm run build
```

To start a local Ethereum network node for development, run:

```shell
npm run node
```

To start a local Ethereum network without deploying the TAR contract, run:

```shell
npm run node:blank
```

To clean the build cache and artifacts, run:

```shell
npm run clean
```

### Deployment and DCAP Token Management

You must build the contracts before deploying.

#### Environment Variables

The application automatically reads environment variables from the `.env` file or from command line environment. The command line environment variables take precedence over the variables defined in the `.env` file.

The following variables are required when deploying on a network other than `hardhat`:

- `OWNER_KEY=<private key>` the private key used to deploy the DCAP Token contract. This account will also be set as the owner of the DCAP Token.

The following variables are only required when verifying the deployed smart contracts:

- `ETHERSCAN_API_KEY=<string>` (required when verifying on `sepolia`) an Etherscan API key to use when verifying deployed contracts.
- `POLYGONSCAN_API_KEY=<string>` (required when verifying on `amoy`) an Polygonscan API key to use when verifying deployed contracts.

#### Create a DCAP Token

To deploy a new DCAP Token contract, run:

```shell
npx hardhat [GLOBAL OPTIONS] deploy <uriPrefix> <checksum> [--predecessor <STRING>] [--replace] [--verify] [--json]
```

- `checksum` (required): must be a SHA256 (32-byte) hash of the DCAP Token's JSON payload. The JSON payload must be canonicalised in accordance with [RFC8785](https://www.rfc-editor.org/rfc/rfc8785) before hashing.

- `uriPrefix` (required): a valid base URI.
 
  The prefix is used to point to a storage repository (e.g. S3 storage bucket, etc.) from the on-chain contract. The contract contains a public method `dataUri` which returns the following string when called: `{uriPrefix}{contractAddress}`.

  The implementer must ensure that the produced `dataUri` points to the payload that was used to create the DCAP Token.

- `--predecessor` (optional): The Token URN of the previous token. Must be a valid DCAP Token URN (e.g.: `urn:tar:eip155.1:1234...abcd`).

  This option can be used when creating a new version of an existing token.

- `--replace` (optional): This option must be used with `--predecessor`. Attempts to update the predecessor DCAP Token by defining the newly created Token as its successor.

  More details about this feature are provided in the next section.

  Note: this option only supports replacing predecessors on the same network as the newly created contract. Use the `replace` command to update contracts on different networks.

- `--verify` (optional): Attempts to verify the newly created contract upon a successful deployment.

- `--json` (optional): Print the summary of the deployment in JSON. Cannot be used with `--replace`.

This command uses Hardhat Ignition to deploy the smart contract. Read more on Ignition at <https://hardhat.org/ignition/docs/getting-started>.

To deploy a new DCAP Token from a JSON payload, run:

```shell
npx hardhat [GLOBAL OPTIONS] deploy:payload <uriPrefix> [path] [--json] [--predecessor <STRING>] [--replace] [--stdin] [--verify]
```

- `path` (required without `--stdin`): a path to the DCAP Token's payload.
- `--stdin` (required without `path`): read the DCAP Token payload from stdin.

This command will canonicalize the provided payload in accordance with [RFC8785](https://www.rfc-editor.org/rfc/rfc8785) before creating the DCAP Token.

The other options behave in the same way as for the `deploy` command.

#### Pre-configured Public Networks

| Id                  | Network           | Type           | JSON-RPC                                    |
|:--------------------|:------------------|:---------------|:--------------------------------------------|
| `sepolia`           | Sepolia           | Public Testnet | https://ethereum-sepolia-rpc.publicnode.com |
| `amoy`              | Amoy              | Public Testnet | https://polygon-amoy-bor-rpc.publicnode.com |
| `etherlink-testnet` | Etherlink Testnet | Public Testnet | https://node.ghostnet.etherlink.com         |

You may also connect to ant EVM-compatible network by setting the `TAR_JSON_RPC_URL` environment variable and using the `custom` network id during deployment.

## <img src="./assets/images/ngi-trustchain.png" height="40" alt="NGI TrustChain">

Funded by the European Union. Views and opinions expressed are those of the author(s) only and don’t necessarily reflect
those of the European Union or European Commission. Neither the European Union nor the granting authority can be held
responsible for them. Funded within the framework of the [NGI TrustChain project](https://trustchain.ngi.eu/) under
grant agreement No 101069364.
