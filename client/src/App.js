import React, { useEffect, useState } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import ipfs from './ipfs'

import "./App.css";

function App() {
  const [state, setState] = useState({ipfsHash: '', web3: null, accounts: null, buffer: null});
  // const [simpleStorageInstance, setsimpleStorageInstance] = useState({contract:null});

  useEffect(async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      // instance.options.address = ""
      

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      await setState({ web3, accounts, contract: instance }, runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  })

  const runExample = async () => {
    const { accounts, contract } = state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    setState({ storageValue: response });
  };

  const [buffer, setBuffer] = useState(null);
  const [ipfsHash, setipfsHash] = useState(null)

  const submit = (event) => {
    event.preventDefault(); // submits deafult action is that it changes to a new page
    // that's why we add above line to prevent that 
     ipfs.add(buffer, async (err, result) => {
      if(err) {
        console.log('error')
        console.error(err);
        return
      }
      console.log(state.contract)
      await state.contract.methods.set(result[0].hash).send({from: state.accounts[0]});

      const ipfsHash = await state.contract.methods.get().call();
      setState({ipfsHash});
      console.log(result);
      setipfsHash(result[0].hash);
     });

  }

  const handleChange = (event) => {
    event.preventDefault();
    const tmpfiles = event.target.files[0];
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(tmpfiles);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
    }
  }

  return (
    <div className="App">
      <h1>IPFS File Upload</h1>
      <p>This image is stored on IPFS and the Ethereum Blockchain !! </p>
      <img src= {`https://ipfs.io/ipfs/${ipfsHash}`}   alt=""/>
      <h2>Upload Image</h2>
      <form onSubmit={submit}>
        <input type='file' onChange={handleChange}/>
        <input type="submit" />
        {ipfsHash? <p>Submitted</p>:<p></p>}
      </form>
    </div>
  );
}

export default App;