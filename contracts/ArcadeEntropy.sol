// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";

contract ArcadeEntropy is IEntropyConsumer {
    IEntropy public entropy;
    address public provider;

    event RandomnessRequested(uint64 sequenceNumber);
    event RandomnessReady(uint64 sequenceNumber, bytes32 randomValue);

    mapping(uint64 => bytes32) public randomnessResults;

    constructor(address _entropy, address _provider) {
        entropy = IEntropy(_entropy);
        provider = _provider;
    }

    function getFee() public view returns (uint128) {
        return entropy.getFee(provider);
    }

    function requestRandomness(bytes32 userRandomNumber) external payable returns (uint64) {
        uint128 fee = getFee();
        require(msg.value >= fee, "Insufficient fee");

        uint64 sequenceNumber = entropy.requestWithCallback{value: fee}(
            provider,
            userRandomNumber
        );

        emit RandomnessRequested(sequenceNumber);
        return sequenceNumber;
    }

    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    function entropyCallback(
        uint64 sequence,
        address /* _provider */,
        bytes32 randomNumber
    ) internal override {
        randomnessResults[sequence] = randomNumber;
        emit RandomnessReady(sequence, randomNumber);
    }

    function getRandomness(uint64 sequenceNumber) external view returns (bytes32) {
        return randomnessResults[sequenceNumber];
    }
}
