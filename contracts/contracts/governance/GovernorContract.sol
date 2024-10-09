// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.8.27;

import {GovernorVotes, Governor, IERC5805} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {GovernorSettings} from "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract GovernorContract is GovernorVotes, GovernorCountingSimple, GovernorVotesQuorumFraction, GovernorSettings {

    constructor(IERC5805 token)   
        Governor("GovernorContract")
        GovernorVotes(token) 
        GovernorVotesQuorumFraction(10)
        GovernorSettings(2 days, 1 weeks, 1000 ether) 
    { }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return GovernorSettings.proposalThreshold();
    }


}