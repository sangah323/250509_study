// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Baseball {
    address public owner;
    IERC20 public token;
    uint256 public constant GAME_COUNT = 10;
    uint256 public ticket = 100 * 10 ** 18; //100MTK
    uint256 public progress;
    uint256 public reward;
    uint256 public random;

    enum GameState { playing, gameOver }

    GameState public gameState;

    constructor(address tokenAddress) {
        owner = msg.sender;
        gameState = GameState.playing;
        token = IERC20(tokenAddress);

        random = 
            (uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        block.prevrandao,
                        block.number)
                    )
                ) % 900) +
                100;
    }

    function gameStart(uint256 _value) public payable {
        require(progress < GAME_COUNT, "GameOver");
        require(gameState == GameState.playing, "GameOver");
        require((_value >= 100) && (_value < 1000), "_value error (100 ~ 999)");

        // 아까 배포한 CA => MTK 토큰에 관련된 코드와 토큰이 있음
        bool success = token.transferFrom(msg.sender, address(this), ticket);
        require(success, "Ticket Payment failed. Approve first");

        progress += 1; // 몇 번 시도했는지 계산
        reward += ticket;

        // 사용자가 맞췄으면 보상 줌
        if (_value == random) {
            token.transfer(msg.sender, reward);
            reward = 0;
            gameState = GameState.gameOver;
        } else if (progress == GAME_COUNT) { // 10번 시도했는데도 정답 못 맞췄을 경우
            gameState = GameState.gameOver;
        }
    }

    function withdrawToOwner () public {
        require(msg.sender == owner, "Only owner");
        require(gameState == GameState.playing || progress >= GAME_COUNT, "Game not Over-!");
        require(reward > 0, "Not reward");

        token.transfer(owner, reward);
        reward = 0;
    }

    function getReward() public view returns (uint256) {
        return reward;
    }

    function getProgress() public view returns (uint256) {
        return progress;
    }

    function getPlaying() public view returns (uint256) {
        return gameState == GameState.playing ? 0 : 1;
    }

    function getRandom() public view returns (uint256) {
        require(msg.sender == owner, "Only owner");
        return random;
    }
}