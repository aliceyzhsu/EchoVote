pragma solidity ^0.8.0;

// 存储用户的投票数据（IPFS 哈希）并提供查询功能
contract VoteResultsIPFS {
    uint public constant MIN_VOTES = 10; // 最低投票要求
    uint public totalVotes;
    bool public quorumReached;
    
    // 记录用户的投票 IPFS 哈希
    mapping(address => string) public agentVote;
    mapping(address => bool) public isAI;
    
    // 事件：当用户提交投票时触发
    event VoteSubmitted(address indexed user, string ipfsHash);
    event QuorumReached(uint totalVotes);

    // 提交用户投票的 IPFS 哈希
    function submitVote(string memory _ipfsHash) external {
        require(!quorumReached, "Vote already ended");
        require(bytes(agentVote[msg.sender]).length == 0, "Vote already ended");
        
        agentVote[msg.sender] = _ipfsHash;
        totalVotes += 1;
        emit VoteSubmitted(msg.sender, _ipfsHash);
        
        // 检查是否达到最低要求
        if (totalVotes >= MIN_VOTES && !quorumReached) {
            quorumReached = true;
            emit QuorumReached(totalVotes);
        }
    }
    
    // 查询某个用户的投票 IPFS 哈希
    function getUserVote(address user) external view returns (string memory) {
        return agentVote[user];
    }
}
