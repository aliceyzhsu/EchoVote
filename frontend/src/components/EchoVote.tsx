import React, { useState } from 'react';
import '../styles/EchoVote.css';
// Import agent avatars
import aliceAvatar from '../assets/icons/alice.png';
import bobAvatar from '../assets/icons/bob.png';
import carolAvatar from '../assets/icons/carol.png';
import daveAvatar from '../assets/icons/dave.png';
import ericAvatar from '../assets/icons/eric.png';
import frankAvatar from '../assets/icons/frank.png';
import gavinAvatar from '../assets/icons/gavin.png';
import helenAvatar from '../assets/icons/helen.png';

interface EchoVoteProps {
  value_vec: number[];
  onOpenQuestionnaire: () => void;
}

interface EchoStat {
  label: string;
  percentage: number;
}

interface AgentPrototype {
  name: string;
  nickname: string;
  avatar: string;
  description: string;
  traits: string[];
}

const agentPrototypes: AgentPrototype[] = [
  {
    name: 'Alice',
    nickname: 'Top Trader',
    avatar: aliceAvatar,
    description: 'Alice is a data-driven crypto trader who prioritizes market trends, technical analysis, and profitability. She values precision over hype, focusing on DeFi and tokenomics.',
    traits: ['Pragmatic', 'Data-Oriented']
  },
  {
    name: 'Bob',
    nickname: 'The Geek',
    avatar: bobAvatar,
    description: 'A dedicated blockchain developer focused on decentralization, privacy, security, and long-term impact of blockchain technology on society.',
    traits: ['Technical', 'Decentralization']
  },
  {
    name: 'Carol',
    nickname: 'The Conservative',
    avatar: carolAvatar,
    description: 'A cautious advocate for crypto adoption, prioritizing stability, security, and regulatory compliance over speculation.',
    traits: ['Pro-Stability', 'Risk-Averse']
  },
  {
    name: 'Dave',
    nickname: 'The Radical',
    avatar: daveAvatar,
    description: 'Dave is a bold crypto advocate focused on disrupting traditional finance through decentralization, DeFi, and DAOs. He embraces high-risk innovation and disregards regulatory constraints.',
    traits: ['Revolutionary', 'Risk-Tolerant']
  },
  {
    name: 'Eric',
    nickname: 'Regulatory Pragmatist',
    avatar: ericAvatar,
    description: 'Eric supports crypto projects that align with legal frameworks, emphasizing compliance, KYC, and institutional collaboration for long-term adoption, even at the cost of decentralization.',
    traits: ['Compliance', 'Regulatory']
  },
  {
    name: 'Frank',
    nickname: 'Autonomy Purist',
    avatar: frankAvatar,
    description: "Frank is a staunch advocate for radical decentralization, rejecting KYC, centralized governance, and regulation. She prioritizes censorship resistance and anonymity, believing regulation undermines Web3's core values.",
    traits: ['Anti-Regulation', 'Decentralization']
  },
  {
    name: 'Gavin',
    nickname: 'Protocol Maximalist',
    avatar: gavinAvatar,
    description: 'Gavin is focused on technical perfection, prioritizing scalability, security, and cryptographic purity over user-friendly solutions. She dismisses compromises that affect protocol integrity.',
    traits: ['Perfectionist', 'Technical']
  },
  {
    name: 'Helen',
    nickname: 'The Advocate',
    avatar: helenAvatar,
    description: 'Helen advocates for lowering entry barriers in Web3, prioritizing user-friendly solutions like intuitive interfaces and centralized fiat gateways to drive mass adoption. She believes technical idealism should be sacrificed for accessibility.',
    traits: ['Accessibility', 'User-Oriented']
  }
];

const getGradientByPercentage = (percentage: number) => {
  // Transition from blue (low) to red (high)
  const startColor = { r: 20, g: 241, b: 149 };
  const endColor = { r: 153, g: 69, b: 255 }; 

  // Calculate the color based on percentage
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * (percentage / 100));
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * (percentage / 100));
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * (percentage / 100));

  return `linear-gradient(90deg, 
    rgba(${r}, ${g}, ${b}, 0.8),
    rgba(${r}, ${g}, ${b}, 0.4)
  )`;
};

const getHoverGradientByPercentage = (percentage: number) => {
  const startColor = { r: 20, g: 241, b: 149 };
  const endColor = { r: 153, g: 69, b: 255 }; 

  const r = Math.round(startColor.r + (endColor.r - startColor.r) * (percentage / 100));
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * (percentage / 100));
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * (percentage / 100));

  return `linear-gradient(90deg, 
    rgba(${r}, ${g}, ${b}, 1),
    rgba(${r}, ${g}, ${b}, 0.6)
  )`;
};

const EchoVote: React.FC<EchoVoteProps> = ({ value_vec, onOpenQuestionnaire }) => {
  const [activeEchoTab, setActiveEchoTab] = useState('YourEcho');
  const hasValueVec = value_vec.length > 0;

  const echoStats: EchoStat[] = [
    { label: 'Trader', percentage: 8 },
    { label: 'Geek', percentage: 89 },
    { label: 'Conservative', percentage: 54 },
    { label: 'Radical', percentage: 19 },
    { label: 'Regulatory Pragmatist', percentage: 55 },
    { label: 'Autonomy Purist', percentage: 23 },
    { label: 'Protocol Maximalist', percentage: 73 },
    { label: 'Mass Adoption Evangelist', percentage: 28 },
  ];

  // Sort stats by percentage in descending order
  const sortedEchoStats = [...echoStats].sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="echo-vote">
      <div className="echo-vote-header">
        <div className="echo-vote-title">
          <h2 className="fancy-title">EchoVote</h2>
        </div>
        <div className="echo-vote-tabs">
          <div 
            className={`echo-vote-tab ${activeEchoTab === 'YourEcho' ? 'active' : ''}`}
            onClick={() => setActiveEchoTab('YourEcho')}
          >
            YourEcho
          </div>
          <div 
            className={`echo-vote-tab ${activeEchoTab === 'AI Prototypes' ? 'active' : ''}`}
            onClick={() => setActiveEchoTab('AI Prototypes')}
          >
            Prototypes
          </div>
        </div>
      </div>
      <div className="echo-vote-content">
        {activeEchoTab === 'YourEcho' ? (
          !hasValueVec ? (
            <div className="values-test-prompt">
              <p>Complete Values Test to discover your AI voter profile</p>
              <button 
                className="values-test-button"
                onClick={onOpenQuestionnaire}
              >
                Take Values Test
              </button>
            </div>
          ) : (
            <div className="your-echo-content">
              {sortedEchoStats.map((stat, index) => (
                <div 
                  key={index} 
                  className="echo-stat-item"
                  style={{
                    '--hover-gradient': getHoverGradientByPercentage(stat.percentage)
                  } as React.CSSProperties}
                >
                  <div className="echo-stat-label">
                    <span>{stat.label}</span>
                    <span>{stat.percentage}%</span>
                  </div>
                  <div className="echo-stat-bar-container">
                    <div 
                      className="echo-stat-bar" 
                      style={{ 
                        width: `${stat.percentage}%`,
                        background: getGradientByPercentage(stat.percentage)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="ai-prototypes-content">
            {agentPrototypes.map((agent, index) => (
              <div key={index} className="agent-prototype">
                <div className="agent-info">
                  <div className="agent-header">
                    <div className="agent-avatar">
                      <img src={agent.avatar} alt={`${agent.name} avatar`} />
                    </div>
                    <div className="agent-name-container">
                      <div className="agent-nickname">{agent.nickname}</div>
                      <h3 className="agent-name">{agent.name}</h3>
                    </div>
                  </div>
                  <p className="agent-description">{agent.description}</p>
                  <div className="agent-traits">
                    {agent.traits.map((trait, traitIndex) => (
                      <span key={traitIndex} className="agent-trait">{trait}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EchoVote; 