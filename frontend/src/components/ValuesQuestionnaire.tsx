import React, { useState, useEffect } from 'react';
import '../styles/ValuesQuestionnaire.css';
import questionnaireData from '../assets/questionnaire.json';
import { useWallets } from '@privy-io/react-auth';

interface ValuesQuestionnaireProps {
  onClose: () => void;
  onComplete: (answers: number[]) => void;
  authenticated: boolean;
}

interface Question {
  id: number;
  question: string;
}

const ValuesQuestionnaire: React.FC<ValuesQuestionnaireProps> = ({ onClose, onComplete, authenticated }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showProgress, setShowProgress] = useState(false);
  const [autoNavigateTimer, setAutoNavigateTimer] = useState<NodeJS.Timeout | null>(null);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  useEffect(() => {
    setQuestions(questionnaireData);
    setAnswers(new Array(questionnaireData.length).fill(0));
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);

    // Clear any existing timer
    if (autoNavigateTimer) {
      clearTimeout(autoNavigateTimer);
    }

    // Set new timer for automatic navigation
    if (currentQuestionIndex < questions.length - 1) {
      const timer = setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
      setAutoNavigateTimer(timer);
    } else {
      setShowProgress(true);
      console.log('Questionnaire completed:', newAnswers);
    }
  };

  const handleNext = () => {
    // Clear the auto-navigation timer
    if (autoNavigateTimer) {
      clearTimeout(autoNavigateTimer);
      setAutoNavigateTimer(null);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowProgress(true);
      console.log('Questionnaire completed:', answers);
    }
  };

  const handlePrevious = () => {
    // Clear the auto-navigation timer
    if (autoNavigateTimer) {
      clearTimeout(autoNavigateTimer);
      setAutoNavigateTimer(null);
    }

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = () => {
    onComplete(answers);
    handleClose();
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isCurrentQuestionAnswered = answers[currentQuestionIndex] !== 0;

  const getBlockClassName = (value: number) => {
    const currentAnswer = answers[currentQuestionIndex];
    const activeValue = hoveredValue || currentAnswer;
    
    if (value <= activeValue) {
      return 'scale-block selected';
    }
    return 'scale-block';
  };

  const { wallets } = useWallets()
  const [signStatus, setSignStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSignMessage = async () => {
    if (!authenticated) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setSignStatus('loading')
      
      // Get the first wallet (you can modify this to get a specific wallet)
      const wallet = wallets[0]
      if (!wallet) {
        throw new Error('No wallet found')
      }

      // Get the Ethereum provider
      const provider = await wallet.getEthereumProvider()
      
      // Prepare the message
      const message = `Sign this tx to delegate your voting power to EchoVote proxy\n\nNonce: ${Date.now()}`
      const address = wallet.address

      // Request signature
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address]
      })

      if (signature) {
        console.log('Successfully Delegated:', signature)
        setSignStatus('success')
        
        // Close questionnaire after 1 second
        setTimeout(() => {
          handleFinish()
        }, 1000)
      } else {
        throw new Error('Failed to get signature')
      }
    } catch (error) {
      console.error('Error signing message:', error)
      setSignStatus('error')
      alert('Failed to sign message. Please try again.')
      
      // Reset error status after 3 seconds
      setTimeout(() => {
        setSignStatus('idle')
      }, 3000)
    }
  }


  return (
    <div className={`questionnaire-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`questionnaire-modal ${isClosing ? 'closing' : ''}`}>
        <div className="questionnaire-header">
          <h2 className="fancy-title">Values Test</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        <div className="questionnaire-content">
          {!showProgress ? (
            <>
              <div className="question-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="progress-text">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <div className="question-container">
                <h3 className="question-text">
                  {questions[currentQuestionIndex]?.question}
                </h3>
                <div className="scale-container">
                  <div className="scale-labels">
                    <span>Strongly Disagree</span>
                    <span>Strongly Agree</span>
                  </div>
                  <div className="scale-bars">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <div
                        key={value}
                        className={getBlockClassName(value)}
                        onClick={() => handleAnswer(value)}
                        onMouseEnter={() => setHoveredValue(value)}
                        onMouseLeave={() => setHoveredValue(null)}
                      />
                    ))}
                  </div>
                  <div className="scale-numbers">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                  </div>
                </div>
                <div className="navigation-buttons">
                  <button 
                    className={`nav-button prev ${currentQuestionIndex === 0 ? 'disabled' : ''}`}
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </button>
                  <button 
                    className={`nav-button next ${!isCurrentQuestionAnswered ? 'disabled' : ''}`}
                    onClick={handleNext}
                    disabled={!isCurrentQuestionAnswered}
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="completion-message">
              <h3>Values vector successfully measured!</h3>
              <p>Your tailor-made EchoVote AI agent is ready to vote for you!</p>
              <p>Now delegate your voting power to EchoVote Proxy to enjoy your automatic governance</p>
              {authenticated && (
                <div className="sign-message-section">
                  <button 
                    className={`sign-message-btn ${signStatus}`}
                    onClick={handleSignMessage}
                    disabled={signStatus === 'loading'}
                  >
                    {signStatus === 'loading' ? 'Signing...' : 
                    signStatus === 'success' ? '✓ Delegation Signed' :
                    signStatus === 'error' ? '✗ Sign Failed' :
                    'Sign Delegation'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValuesQuestionnaire; 