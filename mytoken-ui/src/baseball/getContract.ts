import Web3 from "web3";
import baseBallContractABI from "../contracts/Baseball.json";
import myTokenContractABI from "../contracts/MyToken.json";

const getContract = () => {
  // 배포한 CA 주소
  const myTokenAddress = "0x30d22BEba53AACEAa00205b7E32dF6EBd8AFbE1C";
  const baseballAddress = "0x8dc768Ec718Dce58B28eb2fE233827F7c5Ea0253";
  const web3 = new Web3(window.ethereum);

  const myTokenContract = new web3.eth.Contract(
    myTokenContractABI.abi,
    myTokenAddress
  );
  const baseballContract = new web3.eth.Contract(
    baseBallContractABI.abi,
    baseballAddress
  );

  return {
    myTokenContract,
    baseballAddress,
    baseballContract,
  };
};

export default getContract;
