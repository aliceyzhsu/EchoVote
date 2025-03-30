import React, { useState } from 'react';
import '../styles/ProposalStream.css';
import EchoVote from './EchoVote';

interface VotingData {
  totalVotingPower: number;
  quorum: number;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
}

interface ProposalItemProps {
  title: string;
  subhead: string;
  tag: string;
  content: string;
  hasValueVec: boolean;
  decisionType?: 'FOR' | 'AGAINST' | 'ABSTAIN';
  votingData: VotingData;
}

interface ProposalStreamProps {
  value_vec: number[];
  onOpenQuestionnaire: () => void;
  cryptoList: {
    name: string;
    symbol: string;
    price: number;
    change24h: number;
    icon: string;
    isChecked: boolean;
    isFollowed: boolean;
  }[];
  isConnected: boolean;
}

const AssessmentPrompt: React.FC<{ 
  hasValueVec: boolean; 
  decisionType?: 'FOR' | 'AGAINST' | 'ABSTAIN';
  onOpenQuestionnaire: () => void;
}> = ({ hasValueVec, decisionType = 'FOR', onOpenQuestionnaire }) => {
  if (hasValueVec) {
    return (
      <div className={`proposal-decision ${decisionType.toLowerCase()}`}>
        <div className="decision-container">
          <span className="proposal-decision-label">EchoVote Decision: </span>
          <span className={`proposal-decision-value ${decisionType.toLowerCase()}`}>{decisionType}</span>
        </div>
      </div>
    );
  }

  return (
    <button 
      className="assessment-prompt"
      onClick={onOpenQuestionnaire}
    >
      <span>complete Values Test to have your AI voter decision</span>
      <span className="prompt-icon">📑</span>
    </button>
  );
};

const VotingProgress: React.FC<{ votingData: VotingData }> = ({ votingData }) => {
  const { totalVotingPower, quorum, votesFor, votesAgainst, votesAbstain } = votingData;
  const totalVotes = votesFor + votesAgainst + votesAbstain;
  
  // Determine the scaling base (either quorum or total votes, whichever is larger)
  const scalingBase = Math.max(quorum, totalVotes);
  
  // Calculate percentages based on the scaling base
  const forPercent = (votesFor / scalingBase) * 100;
  const againstPercent = (votesAgainst / scalingBase) * 100;
  const abstainPercent = (votesAbstain / scalingBase) * 100;
  const quorumPercent = (quorum / scalingBase) * 100;

  // Calculate progress percentage relative to quorum
  const progressPercent = (totalVotes / quorum) * 100;

  return (
    <div className="voting-progress">
      <div className="voting-stats">
        <span>Voting Progress ({progressPercent.toFixed(1)}%)</span>
        <span>Quorum: {(quorum / totalVotingPower * 100).toFixed(1)}%</span>
      </div>
      <div className="voting-bar-container">
        <div className="voting-bar">
          <div className="votes-for" style={{ width: `${forPercent}%` }} />
          <div className="votes-against" style={{ width: `${againstPercent}%` }} />
          <div className="votes-abstain" style={{ width: `${abstainPercent}%` }} />
        </div>
        <div className="quorum-marker" style={{ left: `${quorumPercent}%` }} />
      </div>
      <div className="voting-details">
        <span className="for">For: {votesFor.toLocaleString()} ({(votesFor / totalVotingPower * 100).toFixed(1)}%)</span>
        <span className="against">Against: {votesAgainst.toLocaleString()} ({(votesAgainst / totalVotingPower * 100).toFixed(1)}%)</span>
        <span className="abstain">Abstain: {votesAbstain.toLocaleString()} ({(votesAbstain / totalVotingPower * 100).toFixed(1)}%)</span>
      </div>
    </div>
  );
};

const ManualFeedback: React.FC = () => {
  const [selectedVote, setSelectedVote] = useState<'FOR' | 'AGAINST' | 'ABSTAIN' | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleVote = (vote: 'FOR' | 'AGAINST' | 'ABSTAIN') => {
    setSelectedVote(vote);
    setShowConfirmation(true);
  };

  return (
    <div className="manual-feedback-container">
      <div className="manual-feedback">
        <div className="feedback-label">Manual Feedback:</div>
        <div className="feedback-buttons">
          <button 
            className={`feedback-button for ${selectedVote === 'FOR' ? 'selected' : ''}`}
            onClick={() => handleVote('FOR')}
          >
            FOR
          </button>
          <button 
            className={`feedback-button against ${selectedVote === 'AGAINST' ? 'selected' : ''}`}
            onClick={() => handleVote('AGAINST')}
          >
            AGAINST
          </button>
          <button 
            className={`feedback-button abstain ${selectedVote === 'ABSTAIN' ? 'selected' : ''}`}
            onClick={() => handleVote('ABSTAIN')}
          >
            ABSTAIN
          </button>
        </div>
      </div>
      {showConfirmation && (
        <div className="feedback-confirmation">
          ✅ Your feedback is received and your EchoVote agent will improve its performance accordingly.
        </div>
      )}
    </div>
  );
};

const ProposalItem: React.FC<ProposalItemProps & { onOpenQuestionnaire: () => void }> = ({ 
  title, 
  subhead,
  tag, 
  content, 
  hasValueVec, 
  decisionType,
  votingData,
  onOpenQuestionnaire 
}) => (
  <div className="proposal-item">
    <div className="proposal-header-row">
      <div className="proposal-title">
        {title}
        <span className="proposal-subhead">{subhead}</span>
        <span className="proposal-tag">{tag}</span>
      </div>
    </div>
    <div className="proposal-content">
      {content}
    </div>
    <VotingProgress votingData={votingData} />
    
    <AssessmentPrompt 
      hasValueVec={hasValueVec} 
      decisionType={decisionType} 
      onOpenQuestionnaire={onOpenQuestionnaire}
    />
    {hasValueVec && <ManualFeedback />}
  </div>
);

const ProposalStream: React.FC<ProposalStreamProps> = ({ value_vec, onOpenQuestionnaire, cryptoList, isConnected }) => {
  const [hiddenProposals, setHiddenProposals] = useState<Set<number>>(new Set());

  const proposals = [
    {
      title: "ARFC",
      subhead: "Launch GHO on Gnosis Chain",
      tag: "AAVE",
      content: "This proposal aims to launch GHO on the Gnosis chain and designate ACI as the Emissions Manager for GHO rewards and incentives. Deploying GHO to Gnosis is one part of kpk's (formerly karpatkey) mandate and a milestone towards sGHO (savings GHO) deployment. Gnosis Chain has low transaction fees, an engaged community, and a rapidly growing suite of DeFi applications focused on RWAs and innovative payment solutions like Gnosis Pay.",
      decisionType: 'FOR' as const,
      votingData: {
        totalVotingPower: 16000000,
        quorum: 600000,
        votesFor: 648700,
        votesAgainst: 24700,
        votesAbstain: 30
      }
    },
    {
      title: "TEMP CHECK",
      subhead: "Aave Decentralized Acqui-Hire Framework",
      tag: "AAVE",
      content: "In a Darwinian world with (too) many tokens, there should be a way to conduct 'acqui-hire' mergers, where the best-performing project (Aave) attracts talent. Hence we need a permissionless acqui-hire framework.",
      decisionType: 'AGAINST' as const,
      votingData: {
        totalVotingPower: 16000000,
        quorum: 600000,
        votesFor: 21,
        votesAgainst: 574100,
        votesAbstain: 1500
      }
    },
    {
      title: "EVIP-509",
      subhead: "Increase the Minimum Quorum Requirement for Proposal Validity",
      tag: "ECHO",
      content: "This proposal seeks to amend the minimum quorum requirement for the validity of governance proposals in EchoVote from the current 600,000 to 800,000 tokens. The goal of this change is to improve the legitimacy and representativeness of decisions made through the EchoVote governance system by ensuring a higher level of participation.",
      decisionType: 'AGAINST' as const,
      votingData: {
        totalVotingPower: 1000000,
        quorum: 600000,
        votesFor: 534567,
        votesAgainst: 123456,
        votesAbstain: 23456
      }
    },
    {
      title: "Uniswap",
      subhead: "Unichain and Uniswap v4 Liquidity Incentives",
      tag: "UNI",
      content: "Proposal to Fund Unichain and v4 Liquidity Incentive Programs proposed by the Uniswap Foundation, with contributions from Gauntlet.",
      decisionType: 'FOR' as const,
      votingData: {
        totalVotingPower: 1000000000,
        quorum: 40000000,
        votesFor: 46454546,
        votesAgainst: 964048,
        votesAbstain: 8159563
      }
    }
  ];

  const hasValueVec = value_vec.length > 0;

  // Filter proposals based on followed tokens
  const followedProposals = proposals.filter(proposal => {
    const token = cryptoList.find(crypto => crypto.symbol === proposal.tag);
    return token && token.isFollowed;
  });

  // Update hidden proposals when followed tokens change
  React.useEffect(() => {
    const newHiddenProposals = new Set<number>();
    proposals.forEach((proposal, index) => {
      const token = cryptoList.find(crypto => crypto.symbol === proposal.tag);
      if (!token || !token.isFollowed) {
        newHiddenProposals.add(index);
      }
    });
    setHiddenProposals(newHiddenProposals);
  }, [cryptoList]);

  if (!isConnected) {
    return (
      <div className="proposal-container">
        <div className="proposal-stream">
          <div className="proposal-header">
            <h2 className="fancy-title">Proposal Stream</h2>
          </div>
          <div className="no-proposals-message">
              <span className="no-proposals-icon">📭</span>
              <span className="no-proposals-text">No proposals for followed tokens</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="proposal-container">
      <div className="proposal-stream">
        <div className="proposal-header">
          <h2 className="fancy-title">Proposal Stream</h2>
        </div>
        <div className="proposal-list">
          {proposals.map((proposal, index) => (
            <div
              key={index}
              className={`proposal-item ${hiddenProposals.has(index) ? 'hidden' : ''}`}
            >
              <ProposalItem
                title={proposal.title}
                subhead={proposal.subhead}
                tag={proposal.tag}
                content={proposal.content}
                hasValueVec={hasValueVec}
                decisionType={proposal.decisionType}
                votingData={proposal.votingData}
                onOpenQuestionnaire={onOpenQuestionnaire}
              />
            </div>
          ))}
          {followedProposals.length === 0 && (
            <div className="no-proposals-message">
              <span className="no-proposals-icon">📭</span>
              <span className="no-proposals-text">No proposals for followed tokens</span>
            </div>
          )}
          <div className="more-placeholder">
            <div className="more-content">
              <span className="more-icon">📜</span>
              <span className="more-text">More proposals in history ...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalStream; 