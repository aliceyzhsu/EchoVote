const voteContract = new ethers.Contract(voteContractAddress, voteABI, provider);

// 解析IPFS数据，从echoservice获取数据hash
async function fetchUserVote(userAddress) {
    try {
        const ipfsHash = await voteContract.getUserVote(userAddress);
        console.log("User's Vote IPFS Hash:", ipfsHash);
        return ipfsHash;
    } catch (error) {
        console.error("Error fetching user vote:", error);
    }
}

// 用户阅读IPFS数据
async function readIpfsData(ipfsHash) {
    try {
        const url = `https://ipfs.io/ipfs/${ipfsHash}`;
        const response = await fetch(url);
        const data = await response.json();
        console.log("Parsed IPFS Data:", data);
        return data;
    } catch (error) {
        console.error("Error reading IPFS data:", error);
    }
}

// 用户选择是否AI代理
async function selectAI(userAddress) {
    try {
        const isAI = await voteContract.isAI(userAddress);
        console.log("User's AI Status:", isAI);
        return isAI;
    } catch (error) {
        console.error("Error checking AI status:", error);
    }
}

// 如果用户认可AI代理，那么就和其他用户一起进行存储
async function handleAIAgentApproval(approved, option, ipfsHash) {
    if (approved) {
        try {
            // 连接EchoVoter合约
            const echoVoter = new ethers.Contract(
                ECHO_VOTER_ADDRESS,
                EchoVoterABI,
                signer
            );
            
            // 调用合约函数存储AI代理的投票结果
            await echoVoter.storeAIVote(option, ipfsHash);
            
            // 监听是否达到最低投票要求
            echoVoter.on("QuorumReached", (totalVotes) => {
                console.log(`达到最低投票要求: ${totalVotes}`);
                calculateResults();
            });
        } catch (error) {
            console.error('存储AI代理投票结果时出错:', error);
        }
    }
}

// 当符合要求时进行计算，要求是达到quorum
async function calculateResults() {
    try {
        const results = await voteContract.getVoteSummary();
        console.log("Vote Results:", results);
        return results;
    } catch (error) {
        console.error("Error calculating vote results:", error);
    }
}
