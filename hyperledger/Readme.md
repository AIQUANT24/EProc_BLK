# Hyperledger Fabric Network Setup

This directory contains the core infrastructure for our Hyperledger Fabric network. To keep the repository clean and avoid unnecessary sample files, we isolated only the essential network components and binaries.

## Infrastructure Overview

- **Network:** Standard Hyperledger Fabric Test Network
- **Consensus:** EtcdRaft
- **Organizations:** Org1, Org2, and OrdererOrg
- **Channel:** `mychannel`

---

## Setup History: How We Built This

If you ever need to rebuild this environment from scratch on a new machine, follow these exact steps:

### 1. Fetch the Minimal Network Configuration

Instead of cloning the massive `fabric-samples` repository, we extracted only the `test-network` directory to serve as our base, renaming it to `network`:

#### Export only the test-network folder from GitHub

```Bash
cd nicov/hyperledger
git clone --filter=blob:none --sparse https://github.com/hyperledger/fabric-samples.git
cd fabric-samples
git sparse-checkout set test-network
mv test-network ../
cd ..
rm -rf fabric-samples
```

### 2. Clean the Docker Environment

To ensure no conflicting state, old volumes, or dangling images interfered with the setup, we performed a complete Docker wipe:

```bash
docker system prune -a --volumes -f
```

_(Warning: This removes all unused Docker containers, images, and volumes on the host machine)._

### 3. Install Fabric Binaries & Docker Images

The network scripts require specific Fabric CLI tools (like `cryptogen`, `configtxgen`, and `peer`) and Docker images. We ran the official install script from the `nicov/hyperledger` root to download just the `docker` images and `binary` files, generating the `bin` and `config` folders:

```bash
curl -sSLO [https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh](https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh) && chmod +x install-fabric.sh

./install-fabric.sh docker binary
```

### 4. Start the Network and Create the Channel

Finally, we navigated into our `network` folder and used the provided script to spin up the Docker containers (Orderer, Peer0.Org1, Peer0.Org2) and immediately create and join `mychannel`:

```bash
cd network
./network.sh up createChannel -c mychannel

```

---

## Useful Commands

- **Tear down the network (and wipe volumes/crypto material):**

```bash
./network.sh down
```

- **Restart the network and channel:**

```bash
./network.sh up createChannel -c mychannel
```

- **Deploy a chaincode:**

```bash
./network.sh deployCC -ccn basic -ccp /home/$USER/Desktop/nicov/hyperledger/chaincode/compliance -ccl go
```
