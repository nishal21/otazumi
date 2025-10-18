import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faClock,
  faTrophy,
  faPlay,
  faRedo,
  faCheck,
  faTimes,
  faBolt,
  faStar,
  faDownload,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import { animeQuizData} from '../../../data/animeQuizData';

const SpeedQuiz = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('menu'); // menu, playing, completed
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [gameStats, setGameStats] = useState(null);
  const timerRef = useRef(null);
  const resultCardRef = useRef(null);

  const getSpeedQuestions = (count = 20) => {
    console.log('Getting speed quiz questions from local data...');

    // Combine both question arrays and shuffle
    const allQuestions = [...animeQuizData.animeTrivia, ...animeQuizData.mixedQuiz];
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(count, allQuestions.length));

    // Shuffle options for each question
    const questionsWithShuffledOptions = selectedQuestions.map(question => {
      const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
      const correctAnswerText = question.options[question.correct];
      const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);

      return {
        ...question,
        options: shuffledOptions,
        correct: newCorrectIndex
      };
    });

    console.log(`Selected ${questionsWithShuffledOptions.length} speed quiz questions`);
    return questionsWithShuffledOptions;
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, timeLeft]);

  const startGame = () => {
    const speedQuestions = getSpeedQuestions(20);
    setQuestions(speedQuestions);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setCorrectAnswers(0);
    setTimeLeft(60);
    setGameState('playing');
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.correct;

    if (isCorrect) {
      setScore(prev => prev + 10);
      setCorrectAnswers(prev => prev + 1);
    }

    // Auto advance to next question after brief delay
    setTimeout(() => {
      nextQuestion();
    }, 500);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1 && timeLeft > 0) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      finishGame();
    }
  };

  const finishGame = () => {
    const accuracy = questions.length > 0 ? Math.round((correctAnswers / Math.min(currentQuestion + 1, questions.length)) * 100) : 0;
    const finalScore = score + (timeLeft * 2); // Bonus points for remaining time

    const stats = {
      score: finalScore,
      correctAnswers,
      totalQuestions: Math.min(currentQuestion + 1, questions.length),
      accuracy,
      timeRemaining: timeLeft,
      questionsPerMinute: Math.round((Math.min(currentQuestion + 1, questions.length) / (60 - timeLeft)) * 60)
    };

    setGameStats(stats);
    setGameState('completed');
    saveGameStats(stats);
  };

  const saveGameStats = (stats) => {
    const savedStats = JSON.parse(localStorage.getItem('animeGamesStats') || '{"totalGames": 0, "totalScore": 0, "gamesPlayed": 0, "speedGames": 0, "speedBestScore": 0}');
    savedStats.gamesPlayed += 1;
    savedStats.totalScore += stats.score;
    savedStats.speedGames += 1;
    if (stats.score > savedStats.speedBestScore) {
      savedStats.speedBestScore = stats.score;
    }
    localStorage.setItem('animeGamesStats', JSON.stringify(savedStats));
  };

  const generateResultImage = async () => {
    if (!resultCardRef.current) return null;

    try {
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: resultCardRef.current.offsetWidth,
        height: resultCardRef.current.offsetHeight,
        logging: false,
        imageTimeout: 0,
        removeContainer: true
      });

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generating result image:', error);
      return null;
    }
  };

  const shareResult = async () => {
    const imageDataUrl = await generateResultImage();
    if (!imageDataUrl) {
      alert('Failed to generate result image. Please try again.');
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'speed-quiz-result.png', { type: 'image/png' });

      if (navigator.share) {
        await navigator.share({
          title: 'Speed Quiz Challenge Result',
          text: `I scored ${gameStats.score} points in Speed Quiz Challenge! Can you beat my score?`,
          files: [file]
        });
      } else {
        // Fallback: download the image
        const link = document.createElement('a');
        link.href = imageDataUrl;
        link.download = 'speed-quiz-result.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error sharing result:', error);
      // Fallback: download the image
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = 'speed-quiz-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setCorrectAnswers(0);
    setTimeLeft(60);
    setGameStats(null);
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back to Games Button */}
            <div className="flex justify-start mb-4">
              <button
                onClick={() => navigate('/games')}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Games
              </button>
            </div>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <FontAwesomeIcon icon={faBolt} className="text-3xl text-yellow-400" />
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent px-4 py-2">
                  Speed Quiz Challenge
                </h1>
              </div>
              <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
                Race against the clock! Answer as many questions as possible in 60 seconds to achieve the highest score.
              </p>
            </div>

            {/* Game Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 text-center">
                <FontAwesomeIcon icon={faClock} className="text-2xl text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-blue-400">60</div>
                <div className="text-sm text-gray-400">Seconds</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 text-center">
                <FontAwesomeIcon icon={faTrophy} className="text-2xl text-yellow-400 mb-2" />
                <div className="text-2xl font-bold text-yellow-400">10</div>
                <div className="text-sm text-gray-400">Points per Question</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 text-center">
                <FontAwesomeIcon icon={faBolt} className="text-2xl text-red-400 mb-2" />
                <div className="text-2xl font-bold text-red-400">2x</div>
                <div className="text-sm text-gray-400">Time Bonus</div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 rounded-xl p-8 border border-yellow-500/20 mb-8">
              <h3 className="text-xl font-bold mb-4 text-center">How to Play</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <FontAwesomeIcon icon={faClock} className="text-2xl text-blue-400 mb-2" />
                  <h4 className="font-bold mb-1">60 Second Timer</h4>
                  <p className="text-sm text-gray-400">Answer questions as fast as possible</p>
                </div>
                <div>
                  <FontAwesomeIcon icon={faCheck} className="text-2xl text-green-400 mb-2" />
                  <h4 className="font-bold mb-1">Quick Answers</h4>
                  <p className="text-sm text-gray-400">Questions auto-advance after selection</p>
                </div>
                <div>
                  <FontAwesomeIcon icon={faTrophy} className="text-2xl text-yellow-400 mb-2" />
                  <h4 className="font-bold mb-1">Score Bonus</h4>
                  <p className="text-sm text-gray-400">Earn bonus points for time remaining</p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-yellow-500/25"
              >
                <FontAwesomeIcon icon={faPlay} className="mr-2" />
                Start Speed Quiz!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'completed' && gameStats) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <button
                onClick={() => navigate('/games')}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Games
              </button>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
                Speed Quiz Complete!
              </h1>
              <p className="text-gray-400">Great job racing through the questions!</p>
            </div>

            {/* Results Card */}
            <div ref={resultCardRef} className="relative bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8 overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="text-center">
                  <FontAwesomeIcon icon={faBolt} className="text-8xl text-yellow-400 mb-4" />
                  <h1 className="text-4xl font-bold text-yellow-400">Otazumi</h1>
                  <p className="text-lg text-orange-300">Speed Quiz</p>
                </div>
              </div>

              <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-500/20 border-4 border-yellow-400 text-yellow-400 rounded-full mb-4">
                  <FontAwesomeIcon icon={faTrophy} className="text-4xl" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Speed Master!</h2>
                <p className="text-gray-300 text-lg">Score: {gameStats.score.toLocaleString()} points</p>
                <p className="text-gray-400 text-sm mt-2">Completed on {new Date().toLocaleDateString()}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white/10 rounded-lg p-6 text-center border border-white/5">
                  <FontAwesomeIcon icon={faClock} className="text-blue-400 text-3xl mb-3" />
                  <p className="text-sm text-gray-400 mb-1">Time Left</p>
                  <p className="text-2xl font-bold">{gameStats.timeRemaining}s</p>
                </div>
                <div className="bg-white/10 rounded-lg p-6 text-center border border-white/5">
                  <FontAwesomeIcon icon={faBolt} className="text-yellow-400 text-3xl mb-3" />
                  <p className="text-sm text-gray-400 mb-1">QPM</p>
                  <p className="text-2xl font-bold">{gameStats.questionsPerMinute}</p>
                </div>
              </div>

              {/* Performance */}
              <div className="bg-white/10 rounded-lg p-4 mb-6 border border-white/5">
                <div className="text-center">
                  <h3 className="text-lg font-bold mb-2">Performance Stats</h3>
                  <p className="text-gray-400 text-sm">
                    Accuracy: {gameStats.accuracy}% | Correct: {gameStats.correctAnswers}/{gameStats.totalQuestions}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Time Bonus: +{gameStats.timeRemaining * 2} points
                  </p>
                </div>
              </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <button
                  onClick={shareResult}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faShare} className="mr-2" />
                  Share Result
                </button>
                <button
                  onClick={async () => {
                    const imageDataUrl = await generateResultImage();
                    if (imageDataUrl) {
                      const link = document.createElement('a');
                      link.href = imageDataUrl;
                      link.download = 'speed-quiz-result.png';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faRedo} className="mr-2" />
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Back to Games
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Playing State
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={resetGame}
              className="flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Back
            </button>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-400" />
                <span className="font-bold">{score.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className={`text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-yellow-400'}`} />
                <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="text-gray-400">
                {currentQuestion + 1} / {questions.length}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-yellow-400 font-medium bg-yellow-500/10 px-3 py-1 rounded-full">
                Question {currentQuestion + 1}
              </span>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className={`text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-yellow-400'}`} />
                <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-center">{question?.question}</h2>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  className={`p-4 rounded-lg border-2 transition-all duration-300 text-left ${
                    selectedAnswer === null
                      ? 'border-white/20 hover:border-yellow-400 hover:bg-yellow-400/10'
                      : selectedAnswer === index
                      ? index === question.correct
                        ? 'border-green-400 bg-green-400/20'
                        : 'border-red-400 bg-red-400/20'
                      : index === question.correct && selectedAnswer !== null
                      ? 'border-green-400 bg-green-400/20'
                      : 'border-white/20 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                      selectedAnswer === null
                        ? 'border-white/40'
                        : selectedAnswer === index
                        ? index === question.correct
                          ? 'border-green-400 bg-green-400 text-white'
                          : 'border-red-400 bg-red-400 text-white'
                        : index === question.correct && selectedAnswer !== null
                        ? 'border-green-400 bg-green-400 text-white'
                        : 'border-white/40'
                    }`}>
                      {selectedAnswer !== null && (
                        index === question.correct ? (
                          <FontAwesomeIcon icon={faCheck} className="text-xs" />
                        ) : selectedAnswer === index ? (
                          <FontAwesomeIcon icon={faTimes} className="text-xs" />
                        ) : null
                      )}
                    </span>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Answer Feedback */}
            {selectedAnswer !== null && (
              <div className="mt-6 p-4 rounded-lg bg-white/10">
                <div className="flex items-center gap-2 mb-2">
                  {selectedAnswer === question.correct ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="text-green-400" />
                      <span className="text-green-400 font-bold">Correct! +10 points</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTimes} className="text-red-400" />
                      <span className="text-red-400 font-bold">Incorrect</span>
                    </>
                  )}
                </div>
                {question.explanation && (
                  <p className="text-gray-300 text-sm">{question.explanation}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeedQuiz;