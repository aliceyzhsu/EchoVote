import { useState, useEffect } from 'react'
import favicon from './assets/favicon.png'
import './styles/App.css'
import ProposalStream from './components/ProposalStream'
import EchoVote from './components/EchoVote'
import ValuesQuestionnaire from './components/ValuesQuestionnaire'
import { PrivyProvider, usePrivy } from '@privy-io/react-auth'

// Create a wrapper component to use Privy hooks
function AppContent() {
  const [count, setCount] = useState(0)
  const [activeEchoTab, setActiveEchoTab] = useState('YourEcho')
  const [value_vec, setValueVec] = useState<number[]>([])
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [cryptoList, setCryptoList] = useState([
    { name: 'AAVE', symbol: 'AAVE', price: 0, change24h: 0, icon: 'https://cryptologos.cc/logos/aave-aave-logo.png', isChecked: true, isFollowed: true },
    { name: 'Uniswap', symbol: 'UNI', price: 0, change24h: 0, icon: 'https://cryptologos.cc/logos/uniswap-uni-logo.png', isChecked: true, isFollowed: true },
    { name: 'EchoVote', symbol: 'ECHO', price: 0, change24h: 0, icon: './src/assets/echo.png', isChecked: true, isFollowed: true },
    { name: 'Ethereum', symbol: 'ETH', price: 0, change24h: 0, icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', isChecked: true, isFollowed: false },
    { name: 'BinanceCoin', symbol: 'BNB', price: 0, change24h: 0, icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', isChecked: true, isFollowed: false },
  ])
  const { login, logout, authenticated, user } = usePrivy()
  const [userAddress, setUserAddress] = useState('')

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      setUserAddress(user.wallet.address)
    } else {
      setUserAddress('')
    }
  }, [authenticated, user])

  const formatAddress = (address: string) => {
    if (!address) return 'Not Connected'
    if (address.length <= 10) return address
    return `${address.slice(0, 7)}...${address.slice(-5)}`
  }

  const toggleCheck = (index: number) => {
    setCryptoList(prevList => 
      prevList.map((crypto, i) => 
        i === index ? { ...crypto, isChecked: !crypto.isChecked } : crypto
      )
    )
  }

  const toggleFollow = (index: number) => {
    setCryptoList(prevList => 
      prevList.map((crypto, i) => 
        i === index ? { ...crypto, isFollowed: !crypto.isFollowed } : crypto
      )
    )
  }

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,aave,uniswap&vs_currencies=usd&include_24hr_change=true')
        const data = await response.json()
        
        setCryptoList(prevList => prevList.map(crypto => {
          const id = crypto.name.toLowerCase()
          return {
            ...crypto,
            price: data[id]?.usd || 0,
            change24h: data[id]?.usd_24h_change || 0
          }
        }))
      } catch (error) {
        console.error('Error fetching crypto prices:', error)
      }
    }

    fetchCryptoPrices()
    const interval = setInterval(fetchCryptoPrices, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatChange = (change: number) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
  }

  const handleOpenQuestionnaire = () => {
    setShowQuestionnaire(true);
  };

  const handleCloseQuestionnaire = () => {
    setShowQuestionnaire(false);
  };

  const handleQuestionnaireComplete = (answers: number[]) => {
    setValueVec(answers);
    setShowQuestionnaire(false);
  };

  return (
    <>
      <header className="header">
        <img src={favicon} className="header-logo" alt="EchoVote Logo" />
        {authenticated ? (
          <button className="connect-wallet-btn" onClick={logout}>
            Disconnect
          </button>
        ) : (
          <button className="connect-wallet-btn" onClick={login}>
            Connect Wallet
          </button>
        )}
      </header>

      <div className="container">
        <div className="row_basic">
          <div className="avatar-column">
            <div className="avatar">
              {authenticated ? (
                <img 
                  src="https://avatars.githubusercontent.com/u/118011772" 
                  alt="User Avatar" 
                  className="avatar-image"
                />
              ) : (
                <span className="avatar-placeholder">👤</span>
              )}
            </div>
            <h2>User Profile</h2>
            <div className="user-address">{formatAddress(userAddress)}</div>
            <p>{authenticated ? 'Connected' : 'Not Connected'}</p>
          </div>

          <div className="crypto-column">
            <h1 className="fancy-title">Portfolio</h1>
            {authenticated ? (
              <ul className="crypto-list">
                {cryptoList.map((crypto, index) => (
                  <li key={index} className="crypto-item">
                    <span className="crypto-name">
                      <span 
                        className={`checkbox-icon ${crypto.isChecked ? 'checked' : ''}`}
                        onClick={() => crypto.isChecked && toggleFollow(index)}
                        title={!crypto.isChecked ? "No Governance" : (crypto.isFollowed ? "Following" : "Not Following")}
                      >
                        {!crypto.isChecked ? '×' : (crypto.isFollowed ? '❤️‍🔥' : '🖤')}
                      </span>
                      <img src={crypto.icon} alt={crypto.name} className="crypto-icon" />
                      {crypto.name}
                    </span>
                    <span className="crypto-price">
                      {formatPrice(crypto.price)}
                      <span className={`price-change ${crypto.change24h >= 0 ? 'positive' : 'negative'}`}>
                        {formatChange(crypto.change24h)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="connect-prompt">
                <p>Connect your wallet to view your portfolio</p>
                <button className="connect-wallet-btn" onClick={login}>
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="proposal-container">
          <ProposalStream 
            value_vec={value_vec} 
            onOpenQuestionnaire={handleOpenQuestionnaire}
            cryptoList={cryptoList}
            isConnected={authenticated}
          />
          <EchoVote 
            value_vec={value_vec} 
            onOpenQuestionnaire={handleOpenQuestionnaire}
          />
        </div>

        {showQuestionnaire && (
          <ValuesQuestionnaire 
            onClose={handleCloseQuestionnaire} 
            onComplete={handleQuestionnaireComplete}
            authenticated={authenticated}
          />
        )}
      </div>

      <footer className="footer">
        <a 
          href="https://twitter.com/EchoVoteDAO" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="footer-link"
        >
          <svg className="footer-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Twitter
        </a>
        <a 
          href="https://github.com/EchoVoteDAO" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="footer-link"
        >
          <svg className="footer-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
          </svg>
          GitHub
        </a>
        <a 
          href="https://discord.gg/echovote" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="footer-link"
        >
          <svg className="footer-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Discord
        </a>
      </footer>
    </>
  )
}

// Main App component with PrivyProvider
function App() {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'wallet'],
        appearance: {
          theme: 'dark',
          accentColor: '#646cff',
        },
      }}
    >
      <AppContent />
    </PrivyProvider>
  )
}

export default App

