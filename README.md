# Cross-Chain privacy preserving KYC using Zero knowledge proof (zkp) and Interblockchain Communication (IBC) for Cosmos

### Introduction 

One of the reason people have always been skeptical to use Web3 or Blockchain technology (including cyrpto currencies), is that lack of regulations. Partly because, cryptocurrency usecase is very tightly coupled with this tech stack. There has always been a push back from regulatory bodies citing issues like money laundering and terror financing. Lately, many government bodies have understood that banning this usecase or the tech itself, is not the right solution to solve those problems. Instead, working on proper law and regulations which not only solve the above state problems but solve them in web3 way - with atmost privacy, data security and data ownership. Markets in Crypto-Assets (MiCA) being one such regulatory body of European Union (EU) has voted for the [law](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3725395) that allows providers of digital wallets and other crypto services to sell their products across the EU, if they register with national authorities. Which paves the way for usecases like [regulated token launches](https://news.law.fordham.edu/jcfl/2023/02/06/an-overview-of-the-eu-crypto-asset-regulatory-framework-mica/), identity based voting in DAOs (Vitalik's blog -  [ Moving beyon coin voting governance](https://vitalik.ca/general/2021/08/16/voting3.html)), [NFT Identity](https://delphilabs.notion.site/NFT-Identity-5a6c1afdce6646d6b21f1184502ae039) etc. 

### The Problem

Technically, token is nothing but a smart contract deployed on the blockchain network. The problem is, how can a smart contract verify that the wallet has KYCed before (or if the user belongs to allowed list of countries?) executing the transfer of tokens, as KYC data are private in nature and it should not be sent to a smart contract. Again KYC being one example of private data, in general we are talking about leveraging "argubly" any private data in the web3 on-chain world.  

### The Solution

**Zero Knowledge Proof and Self Sovereign Identity**

Advance cryptographic technology like zero knowledge proof (zkp) can help solve this problem by producing complex mathematical computational proof which can not only be sent to (and verified by) smart contract but also does not reveal any private information about the user. Marring zkp with Self sovereign identity (tech like decentralised identifier (DID) and verifiable credentials (VP)) brings "identity" to the zk stack making the entire system trust worthy and zk-based digital interaction more secure and seamless. 

A verifiable credential (VC with KYC data) may be issued to a user (controlling a DID) by a trusted issuer (controlling a DID). The user may then generate Verifiable Presentation (VP) and then use that VP to generate zk-proof which can be sent to a smart contract for verification. This proof does not reveal any private data but only the fact like "user is over 18 yo", "user is a millionair", "user blongs to whitelisted set of contries or has done KYC or not". The smart contract can verifies the proofs of data which was issued only by the trusted issuer easily.  

**No just on-chain and multichain, cross-chain is the need**

For this system to scale, it has to be _"cross-chain"_. Cosmos, being a network of blockchains, which support application specific chains and has features like Interblockchain communication (IBC) for communication between these appchains, needs a system to verify these zk-proofs over IBC so that other app chain do not have to implement zero knowledge proofs contracts or have to deal with DID/VC infrastrcuture.  This offloads a lot of work, realted to zk and ssi, from app chains which help them focus on their business case. All they need to do is, enable the IBC communication on their chain.

# Demo 

In this demo we want to demonstrate that, how a user may whitelists his wallet or DID to a whitelisting pool contract - deployed on any cosmos SDK based chain having wasm support using IBC. This whitelisting pool contract then may be used as a KYCed user database for other usecases like Airdrops, LBA, DeX etc.

> User wants to prove that he/she does not belong to excluded list of countries - that he/she is not part of this exclusion list and hence his/her wallet/DID should be whitelisted.

At high level, these are the steps: 

-  **Credential Issuance**: Upon user's request, issuer issues a verifiable credential to the user. 
-  **zk-Proof generation from verifiable presentation**: When requested (by whitelist pool smart contract, deployed on service provier chain), the user generates the zk-proof locally in his brower using verifiable presentation and submits to the contract.
-  **zk-Proof verification over IBC from Hypersign chain**: The whitelist pool smart contract then ask zk-verifier contract, deployed on Hypersign chain, to verify the zk-proof over IBC. Upon succesful verification, the user wallet/DID gets whitelisted in whitelist pool smart contract

![high-level](https://user-images.githubusercontent.com/15328561/241242630-9870a6c7-7c9f-4a0e-bbeb-88314b31372e.png)

## Credential Issuance 

> Note: Pre-requisite: User and Issuer both have already generated their DID on Hypersign chain.

Let's us say, user submits the following data to the issuer.

```json
{
  "age": 25,
  "country": "USA",
  "id": "did:hid:testnet:0x6bcc19d6dc56257574f8b347824bef8f58b38605a76313271e67b0ff4405391c", 
  "name": "Alice"
}
```
The issuer "somehow" (out of scope of this demo) verifies the above data and issues a Verifiable credential by signing the Merkle root (`rootHash`) of the `credentialSubject`. 

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "credentialSubject": {
    "age": "25",
    "country": "0x557361",
    "id": "0x6bcc19d6dc56257574f8b347824bef8f58b38605a76313271e67b0ff4405391c",
    "name": "0x416c696365"
  },
  "rootHash": "f807b5f05b8b25556649bfe69d49429a8907c609d7b94452c42647f1558d6350",
  "id": "http://example.edu/credentials/3732",
  "issuanceDate": 1685344255539,
  "issuer": "did:hid:testnet:z543717GD36C5VSajKzLALZzcTakhmme2LgC1ywW1YwTM",
  "type": [
    "VerifiableCredential",
    "KYC"
  ],
  "proof": {
    "R8x": "12163938283061799366134189599990949086475820396868725835388367219669658303995",
    "R8y": "436643934054401353556807930215389640136405290439273428300152067272834082564",
    "S": "458850281095747919240149124901518278033062703525350866858030900928778944487"
  }
}
```


## zk-Proof generation from Verifiable Presentation

User generates a Verifiable Presentation by signing a `challenge` given by the verifier.

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://www.w3.org/2018/credentials/examples/v1"
  ],
  "type": [ "VerifiablePresentation" ],
  "verifiableCredential": [
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://www.w3.org/2018/credentials/examples/v1"
      ],
      "credentialSubject": {
        "age": "25",
        "country": "0x557361",
        "id": "0x6bcc19d6dc56257574f8b347824bef8f58b38605a76313271e67b0ff4405391c",
        "name": "0x507261746170204d7269646861"
      },
      "rootHash": "f807b5f05b8b25556649bfe69d49429a8907c609d7b94452c42647f1558d6350",
      "id": "http://example.edu/credentials/3732",
      "issuanceDate": 1685346063440,
      "issuer": "did:hid:testnet:z543717GD36C5VSajKzLALZzcTakhmme2LgC1ywW1YwTM",
      "type": [
        "VerifiableCredential",
        "KYC"
      ],
      "proof": {
        "type": "BabyJubJubSignature2021",
        "credentialHash": "8804781371345579570033420413972109558958830340519668977613039209476413357007",
        "created": 1685346064774,
        "verificationMethod": "did:hid:testnet:z543717GD36C5VSajKzLALZzcTakhmme2LgC1ywW1YwTM#key-1",
        "proofValue": {
          "R8x": "683841881763791128752872915676462173916887923648823414160160391436784188064",
          "R8y": "17173979429575543432010350417565880360926574124383324745680518501585575713613",
          "S": "1742062914709679048193182798105485403319056250146959691115025294992925267680"
        },
        "proofPurpose": "assertionMethod"
      }
    }
  ],
  "proof": {
    "type": "BabyJubJubSignature2021",
    "created": 1685346067490,
    "proofPurpose": "authentication",
    "verificationMethod": "did:hid:testnet:z8Fo8daHrZrQ4NtDZ9byYgrkEKqK43dkBNxorxpAEm3rj#key-1",
    "challenge": "123456",
    "proofValue": {
      "R8x": "2561850963774026906369122268554600740848407830063412592471185456413796082293",
      "R8y": "2102349270547407034807811296621127114422616298236933684247877651948314268415",
      "S": "2182387849842233664426242497656858314792124699911044877720633460859100800189"
    }
  }
}
```

The Verifiable presentation along with list of countries where exclusion (user should not belongs this list) has to proved and other private inputs are sent to the circuit for proof generation

![zk-kyc-attribute-membership-circuit](https://user-images.githubusercontent.com/15328561/241677934-429f17c7-7dcd-4703-be67-284554d7238d.png)


The circuit goes through bunch of checks like, `data integrity check`, `issuer signature checks`, `user's signature check`,`membership check` etc and produces `zk-proof` and `public signals`. The public signal contains either `0` or `1`. `0` if this users is not part the exculded country list and `1` if otherwise. 

### Setting up zkp circuit and generating verifiable presentation

[Follow this documentation](/zkp/README.md)

## Cross-Chain zk-Proof Verification using IBC Query

IBC Query is specialzed IBC transaction which is used specifically for quering data over IBC. We used IBC query to get the proof verification result from Hypersign chain to the service provider chain where whitelist pool contract is deployed. The IBC Query transaction work with a realyer - we used [Hermes](/docs/hermes.md) for this purpose. This is nothing but smart contrac to smart contract interaction over IBC. 

![img](https://user-images.githubusercontent.com/15328561/199429349-0cd046da-d17a-4931-89ef-5ffdcdddf13f.png) 

The user sbumits the proof to the service provider chain, Hermes relays this proof to the verifier contract deployed on Hypersign chain. The verifier contract then verifies the proof and returns `true` or `false`. Hermes finally, relayes this verification result as acknowledgment to the service provider chain.

The sequence digram for ICQ inteaction is as follows:

![ss](https://user-images.githubusercontent.com/15328561/241242624-ddb0cfd8-ba08-471a-a609-2b19e48d5b8f.png)


- [sequence diagram src](https://sequencediagram.org/index.html#initialData=C4S2BsFMAIGECcD2BnZBaWALAhiAdtAFoDS0AggCYXySrQDqmYk4IyoeA5gFDfYDGwRPGgBVZJHjcADtnih+IWXmDQAapJAAzEJLiIV8AaoAUACQCe0ychCcCWXHgCU0AMQAjAJxbskAKwycgpK2CrQAEIArrZ4tMj6hsbQJvTYyAC2cDj4rp5eHhS+QfIgisqqADIRZInARoIpaZnZTnnehcW84npoAHzRsfF1DabNWY650ABccNjg4NAAVEvEAJqwK9AAyhnBI8kAogAekPxRwDAZkMCYiBS8HojH0PB2mKqIWpEx+MOwBnqyVS6QmORcsxW602SxSAB0CNBpEgvrNtvV8JwADQI6DQbBUGioNEYrhYvG4pFRDysfgAfVs9nmswAkiocYiQB56fwcHg4uASW8uAjnI9ntBEAA3PSDP50AFJRoglqTCF4lYsiKwaAABQEAGsbls2EiaLIaBRoLdsKp8PxwFEKLR8dBzuxEFl2PAooIojRlksNG8tBYtuKXtLZb84grAaMmqDWrlIUHNKGtgBvSkE6jxDl45GIL6U6TU2kMux4eYIgC+vDlsYSiqByvGyZc0H66nTuhELYT5isNirHecaMgeCtmu1esNxthEclMpEwe0fYOyss1ngjIc4PHeLxABFaJp5iAAF4wGc6-X8I3ALZhCiUo+QY6t1S3G9pkNh2FvV9YAlyjVdez0AdgW3Ed7DHWYj0QpCjwAJSiAgViLfh4jpIsvhMTCUS0IVMXJMsaTKSsmUFHZSU4FZnBWXEhGgFdtAsa1MBgQhJEQaBiDwRAAHcoAoTgYF1IiADpoBQm5-QwpZ6iiSATW+PDvlNKULwockWAkQNfHACQVlAlcexDDcoK3Ydd1HNVDyPSgrR-Vje34W0QAMV5aCicBgARfBON-LUdTIB9BJEyAxMga4VC2N9kK+YLA1CucHwXXhuDXHRIPjaDbL3McuwGGN-nytskwcicp2gDxDVS2d70fUzuCeSNzMbcqlTGKqDwQ5DUJuN5IBlNzLI80BvKJPyAoILQkCyW90papYAHIEkNSLRPEuLVDM6MhjjHrE1Vfq5gWVLuXCg1tui8TiAsfgtmuW57mtRBEsGo8hKYS5WHYFLcyJZAZIRbZsDG1zgeGILXOs4ANugdhbUgXhqlqBHTrBNoSq646v2x+CLsWFYzDIbY6WhQ5jy2XZ9ixgBFFT4A4gBZG47lfREkJY3kzgNaBtBS-Ay1UGG6FNX7mABy4HjaiUoC0T5vnx5sKt6s62lTcnKep2nYRMHNCXiEiRRcA6RDVzdNZxlNoEqYtBa0YQUpoABHFT2Gi-ETclgh4Y1pGUcuBsyoJwd2wckqMZtonqtk+T4EUgAiCWElNaFopTtTfbzVBKVNZEz3COGuJt4PgFRvTjMgRKaGABTAzTv2M4SAA5AB5AAVfiNmzlYgA)

### Installation and Setup 

#### Install and Setup Hypersign Blockchain Node

[Documentation](/docs/hypersign.md)

#### Install and Setup Wasm Blockchain Node

[Documentation](/docs/wasmd.md)

#### Install and Setup Hermes relayer

[Documentation](/docs/hermes.md)

#### Smart Contract

- [Build, upload and instantiate](/docs/contract.md#on-hypersign-chain) verifier contract on Hypersign chain. Contract address: `hid14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9skm6af7`
- [Build, upload and instantiate](/docs/contract.md#on-wasmd-chain) whitelisting pool contract (business contract) on Wasmd chain. Contract address: `wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d`

#### IBC channel creation 

[Documentation](/docs/hermes.md#creating-channel-between-hypersign-and-wasm-nodes)

#### Finally start the hermes

[Documentation](/docs/hermes.md#finally-start-the-hermes)

## Smart contract Demo

### Lets's do the KYC on business contract

```bash
wasmd tx wasm execute wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d '{
   "kyc": {
      "channel": "channel-0",
      "proof": "{'pi_a':[10,5,115,176,203,123,226,16,212,251,108,11,209,221,96,236,231,133,190,9,247,252,78,235,109,41,252,41,96,255,195,187,77,86,113,82,18,175,207,172,175,39,55,153,208,167,34,98,11,24,88,199,201,223,7,216,164,201,206,144,90,179,171,21,22,183,2,252,67,188,128,102,105,167,73,53,5,79,91,74,127,63,159,115,1,222,5,139,79,87,240,92,71,118,13,21],'pi_b':[4,57,117,98,61,64,134,184,24,66,161,230,178,12,242,86,182,153,167,136,45,155,131,66,129,223,27,146,255,219,239,161,13,24,27,221,42,220,144,164,195,245,96,180,183,235,30,99,7,70,147,65,12,231,100,200,16,140,115,46,248,96,180,178,105,128,54,211,105,183,27,222,187,111,47,226,89,138,77,199,70,68,88,193,244,16,182,30,77,129,198,218,85,38,122,231,21,178,214,153,33,202,149,177,96,84,101,230,6,150,149,40,13,190,2,132,11,236,246,91,198,24,191,224,180,12,242,88,102,219,211,48,182,218,252,67,86,127,159,86,155,234,46,213,9,9,95,29,99,94,13,38,241,91,17,193,3,78,221,160,146,182,168,45,171,76,76,3,223,108,30,223,50,163,70,79,194,235,252,222,22,231,167,118,206,180,95,52,138,228,207,122],'pi_c':[8,137,240,71,171,138,189,183,180,54,123,8,143,165,133,199,14,166,97,41,125,246,77,240,151,48,42,100,85,182,198,191,22,240,246,151,110,70,193,239,238,54,122,114,149,114,48,199,5,88,162,102,181,174,181,13,105,4,255,178,174,56,110,139,69,38,212,59,38,80,245,177,179,133,4,179,73,224,208,102,179,196,84,179,155,3,48,105,46,44,170,105,71,196,242,4]}",
      "public_signal": 1,
      "address": "wasm19n3v8rx66hj2yqadmuuz48zxuhu5eu4nct6eg0"
   }
}' --from node1 --keyring-backend test --broadcast-mode async --chain-id wasmdnode --gas 5628283 

```

### Check if your wallet is whitelisted or not

```bash
wasmd q wasm contract-state smart wasm14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s0phg4d '{"has_kyced": {"address": "wasm19n3v8rx66hj2yqadmuuz48zxuhu5eu4nct6eg0"}}' --node tcp://localhost:36657
```

o/p 

```bash
data:
  result: address is NOT KYCed
```

Its not! 

Reason being, Hermes automatically not pushing packets to Hypersign (except for rare situations), so we need to manually ask hermes to push the packets to hypersign and get back the result in business chain in the form of acknoledgement.

Lets us [manually push these packets from Hermese CLI](/docs/hermes.md#pushing-packets-manually) and wait for acknoledgement and then try again. 

Once you push the packet, query `has_kyced` function once again to see if the wallet is whitelisted!

```bash
data:
  result: address is KYCed
```

## Video Demo


## Todo(s)

- [ ] Deploy the business contract on neutron chain
- [ ] Connect the whitelisting pool contract with LBA contracts
- [ ] Improve the kyc zk circuit
- [ ] Figure out why Hermese is not pushing the packets automatically
- [ ] Figure out module to smart contract intraction (same chain as well as interchain)
- [ ] How smart contract produce a challenge which can be signed by user?


## Credits

We want to thank all those who supported us in anyway, be it technical or non technical. A special thanks to Larry([@larry0x](https://github.com/larry0x/)) for helping us with IBC query part and to [Iden3 team](https://github.com/iden3) for helping us understand how to use zkp with verifiable credentials. Lastly, we also want to give credit to [repo:cw-ibc-queries](https://github.com/JakeHartnell/cw-ibc-queries) by JakeHartnell([@JakeHartnell](https://github.com/JakeHartnell)) from which we took inspiration for IBC query flow.



