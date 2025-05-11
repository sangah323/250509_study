import { JSX, useState } from "react";
import getContract from "./getContract";
import Web3 from "web3";
import "../index.css";

declare global {
  interface Window {
    // type 일단 any로 설정, 지금 흐름이 중요해서 any 쓰는거지 나중에 이럼 안돼~!
    ethereum?: any;
  }
}

const Baseball = (): JSX.Element => {
  const [account, setAccount] = useState("0x...");
  const [balance, setBalance] = useState("0");
  const [progress, setProgress] = useState("0");
  const [reward, setReward] = useState("0");
  const [gameState, setGameState] = useState("0");
  const [allow, setAllow] = useState("0");
  const [random, setRandom] = useState("");
  const [input, setInput] = useState("");
  const [done, setDone] = useState("");
  const web3 = new Web3(window.ethereum);

  const { baseballContract, baseballAddress, myTokenContract } = getContract();

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  };

  const getState = async () => {
    const selectedAddress = window.ethereum.selectedAddress;
    const bal: string = await myTokenContract.methods
      .balanceOf(selectedAddress)
      .call();
    const reward: string = await baseballContract.methods.getReward().call();
    const progress: string = await baseballContract.methods
      .getProgress()
      .call();
    const gameState: number = await baseballContract.methods.gameState().call();
    const allow: string = await myTokenContract.methods
      .allowance(selectedAddress, baseballAddress)
      .call();

    setBalance(web3.utils.fromWei(bal, "ether"));
    setReward(web3.utils.fromWei(reward, "ether"));
    setProgress(progress);
    setGameState(gameState.toString());
    setAllow(web3.utils.fromWei(allow, "ether"));
  };

  const approve = async () => {
    try {
      const ticket = web3.utils.toWei("1000", "ether"); // 1000MTK => ticket 가격
      await myTokenContract.methods
        .approve(baseballAddress, ticket)
        .send({ from: account });
      alert("권한 위임 완료");
    } catch (error) {
      console.log(error);
    }
  };

  const gameStart = async () => {
    try {
      await baseballContract.methods.gameStart(parseInt(input)).send({
        from: account,
      });
      alert("게임 실행 완료");
    } catch (error) {
      console.log(error);
    }
  };

  const donation = async () => {
    try {
      const amount = web3.utils.toWei(done, "ether"); // MTK 단위로 변환
      const owner = await baseballContract.methods.owner().call(); // owner 주소

      // 참가자(account)가 owner(baseball contract)한테 done만큼 기부
      await myTokenContract.methods
        .transfer(owner, amount)
        .send({ from: account });

      alert(`${done} MTK 기부 완료`);
    } catch (error) {
      console.log(error);
    }
  };

  const result = async () => {
    try {
      const owner: string = await baseballContract.methods.owner().call();
      if (account.toLowerCase() !== owner.toLowerCase()) {
        alert("권한이 없습니다.");
        return;
      }
      const random: string = await baseballContract.methods
        .getRandom()
        .call({ from: account });
      setRandom(random);
    } catch (error) {
      console.log(error);
    }
  };

  const withdrawToOwner = async () => {
    try {
      await baseballContract.methods.withdrawToOwner().send({ from: account });
      await getState();
      alert(`숫자 맞추기 실패! owner가 ${reward}MTK를 회수합니다.`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div id="content">
      <h1>야구⚾</h1>

      <div id="infoArea">
        <div className="user-info">
          <h3>사용자 정보</h3>
          <p>주소 : {account}</p>
          <p>보유 토큰 : {balance} MTK</p>
          <p>야구게임한테 권한 위임한 토큰 : {allow} MTK</p>
        </div>
        <div className="game-info">
          <h3>게임 정보</h3>
          <p>보상 : {reward} MTK</p>
          <p>시도 횟수 : {progress}</p>
          <p>게임 상태 : {gameState === "0" ? "게임중" : "게임 종료"}</p>
          <p>기부금 : {done} MTK</p>
        </div>
      </div>

      <div id="gameArea">
        <h3>게임</h3>
        <div className="game-btn">
          <button onClick={connectWallet}>지갑 연결</button>
          <button onClick={approve}>
            게임 참가 (권한 위임 후 가능 1000MTK)
          </button>
          <button onClick={getState}>현재 상태</button>
          <button
            onClick={withdrawToOwner}
            disabled={!(gameState === "1" && parseInt(progress) >= 10)}
          >
            보상 회수
          </button>
        </div>
        <div className="game-box">
          <input
            type="text"
            placeholder="숫자를 입력해주세요. (100~999)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button onClick={gameStart}>게임 시작</button>
        </div>
        <div className="game-box">
          <input
            type="text"
            placeholder="기부하실 금액을 입력해주세요."
            value={done}
            onChange={(e) => setDone(e.target.value)}
          />
          <button onClick={donation}>기부</button>
        </div>
      </div>

      <div id="managerArea">
        <h3>관리자</h3>
        <button onClick={result}>정답 확인</button>
        <p>정답 : {random}</p>
      </div>
    </div>
  );
};

export default Baseball;
