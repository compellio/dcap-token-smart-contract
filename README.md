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
npx hardhat [GLOBAL OPTIONS] token deploy <uriPrefix> <checksum> [--predecessor <STRING>] [--replace] [--verify] [--json]
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
npx hardhat [GLOBAL OPTIONS] token deploy:payload <uriPrefix> [path] [--json] [--predecessor <STRING>] [--replace] [--stdin] [--verify]
```

- `path` (required without `--stdin`): a path to the DCAP Token's payload.
- `--stdin` (required without `path`): read the DCAP Token payload from stdin.

This command will canonicalize the provided payload in accordance with [RFC8785](https://www.rfc-editor.org/rfc/rfc8785) before creating the DCAP Token.

The other options behave in the same way as for the `deploy` command.

#### Replace an existing DCAP Token

To replace a DCAP Token by defining its successor, run:

```shell
npx hardhat [GLOBAL OPTIONS] token replace <predecessor> <successor> [--force]
```

- `predecessor` (required): A valid token id of the predecessor DCAP token (the token that will be replaced).
- `successor` (required): A valid token id of the successor DCAP token.
- `--force` (optional): Force update the predecessor token without verifying if the successor token points to it.

Important: you must manually switch to the network of the `predecessor` contract using Hardhat's `--network` options.

Note: this command supports replacing tokens accross different blockchain networks. To interact with third-party blockchain, use the `custom` network (see configuration below).

#### Pre-configured Public Networks

| Id                  | Network           | Type           | JSON-RPC                                    |
|:--------------------|:------------------|:---------------|:--------------------------------------------|
| `sepolia`           | Sepolia           | Public Testnet | https://ethereum-sepolia-rpc.publicnode.com |
| `amoy`              | Amoy              | Public Testnet | https://polygon-amoy-bor-rpc.publicnode.com |
| `etherlink-testnet` | Etherlink Testnet | Public Testnet | https://node.ghostnet.etherlink.com         |

You may also connect to ant EVM-compatible network by setting the `TAR_JSON_RPC_URL` environment variable and using the `custom` network id during deployment.

## DCAPv2 Token Profile

We’re basing our Digital Cultural Asset Profiles (DCAP) on the existing Europeana Data Model (EDM), which provides a consistent structure for describing digital cultural heritage objects. See also: <https://pro.europeana.eu/page/edm-documentation>. This is the second iteration of the DCAP profile.

The Europeana Data Model defines several classes to represent a Cultural Heritage Object (CHO) and its associated resources (images, text descriptions, etc.). The EDM uses Provided Cultural Heritage Objects (ProvidedCHO) as the root of Europeana Aggregations, which act as collection definitions and resources (e.g. images, texts, etc.) created by various other institutions (e.g. museums, etc.) for the CHO. We are only using the ProvidedCHO class in our profile in the DCAPv2 profiles.

The DCAPv2 profile inherits the `satp:AssetProfile` class that defines Asset Profiles as per [I-D draft-avrilionis-satp-asset-schema-architecture](https://datatracker.ietf.org/doc/draft-avrilionis-satp-asset-schema-architecture/).

The profile is defined in [profiles/dcapv2.json](profiles/dcapv2.json).

### `dcap:CulturalHeritageObject` class

The `dcap:CulturalHeritageObject` class represents a Cultural Heritage Object created from a Cultural Heritage institution. It contains a description of the object itself (e.g. a painting, an archeological artifact, etc.).

This class created to be semantically equivalent to `edm:ProvidedCHO`.

#### Examples

You can find example payloads for DCAP Tokens in the [examples/](examples/) directory:

- [bauhaus.json](./examples/bauhaus.json): "Bauhaus", _Fashion Museum of Antwerp, Belgium_, <https://www.europeana.eu/en/item/2048208/europeana_fashion_OBJ7581>.
- [figure-art-nouveau.json](./examples/figure-art-nouveau.json): "Γυναικεία φιγούρα art nouveau.", _Hellenic Literary and Historical Archive - Cultural Foundation of the National Bank Of Greece, Greece_, <https://www.europeana.eu/en/item/122/https___www_searchculture_gr_aggregator_edm_ELIA_000100_25_500942>.
- [mycenaean-askos.json](./examples/mycenaean-askos.json): "Μυκηναϊκός ασκός από τα Πευκάκια.", _Archaeological Receipts and Expropriations Fund, Greece_, <https://www.europeana.eu/en/item/2064902/https___www_searchculture_gr_aggregator_edm_TAPA_000054_11631_13460>.
- [statue-de-couple.json](./examples/statue-de-couple.json): "Statue de couple", _National Library of France, France_, <https://www.europeana.eu/en/item/9200521/ark__12148_btv1b55009694k>.
- [vase.json](./examples/vase.json): "Vase", _Museum of Arts and Crafts, Hamburg_, <https://www.europeana.eu/en/item/2048429/item_TYMYWZX3PDMBSBQUNWPYVFB3TIUQZF4I>.

The examples were created based Cultural Heritage Object Aggregations available on <europeana.eu>, and as such, are not representative of a valid DCAP Token's payload. In our proposed implementation, the providing institution that manages a Cultural Heritage Object would create a DCAP Token during the process of providing it to the Europeana Aggregator.

### JSON-LD Manipulations

The TAR example payloads can be manipulated using the <https://github.com/digitalbazaar/jsonld-cli> tool, for example:

```shell
npx jsonld-cli expand examples/statue-de-couple.json
npx jsonld-cli canonize examples/statue-de-couple.json
```

## NGI TrustChain

<img src="./assets/images/ngi-trustchain.png" height="40" alt="NGI TrustChain">

Funded by the European Union. Views and opinions expressed are those of the author(s) only and don’t necessarily reflect
those of the European Union or European Commission. Neither the European Union nor the granting authority can be held
responsible for them. Funded within the framework of the [NGI TrustChain project](https://trustchain.ngi.eu/) under
grant agreement No 101069364.
