import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faQuestionCircle,
  faTrophy,
  faClock,
  faRedo,
  faPlay,
  faCheck,
  faTimes,
  faStar,
  faDownload,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import { animeQuizData } from '../../../data/animeQuizData';

const AnimeTrivia = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('menu'); // menu, loading, playing, completed
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showResult, setShowResult] = useState(false);
  const [gameStats, setGameStats] = useState(null);
  const timerRef = useRef(null);
  const resultCardRef = useRef(null);

  const getTriviaQuestions = (count = 10) => {
    console.log('Getting trivia questions from local data...');

    // Combine both question arrays
    const allQuestions = [...animeQuizData.animeTrivia, ...animeQuizData.mixedQuiz];

    // Shuffle and select the requested number of questions
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, Math.min(count, allQuestions.length));

    // Shuffle options for each question and update correct answer index
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

    console.log(`Selected ${questionsWithShuffledOptions.length} trivia questions with shuffled options`);
    return questionsWithShuffledOptions;
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
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

  const startGame = async (questionCount) => {
    setGameState('loading');

    try {
      const triviaQuestions = getTriviaQuestions(questionCount);
      setQuestions(triviaQuestions);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setScore(0);
      setTimeLeft(30);
      setShowResult(false);
      setGameState('playing');
    } catch (error) {
      console.error('Failed to start game:', error);
      // Fallback to basic questions
      setQuestions([
        {
          question: "Which anime features the character Monkey D. Luffy?",
          options: ["One Piece", "Naruto", "Dragon Ball", "Bleach"],
          correct: 0,
          explanation: "Monkey D. Luffy is the main character of One Piece.",
          category: 'Characters'
        }
      ]);
      setGameState('playing');
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null || showResult) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const question = questions[currentQuestion];
    const isCorrect = answerIndex === question.correct;

    if (isCorrect) {
      // Bonus points for speed
      const timeBonus = Math.max(0, timeLeft * 10);
      const points = 100 + timeBonus;
      setScore(prev => prev + points);
    }

    // Auto advance after showing result
    setTimeout(() => {
      nextQuestion();
    }, 2500);
  };

  const handleTimeUp = () => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(-1); // -1 indicates time up
    setShowResult(true);

    setTimeout(() => {
      nextQuestion();
    }, 2500);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
      setShowResult(false);
    } else {
      // Game completed
      finishGame();
    }
  };

  const finishGame = () => {
    const percentage = Math.round((score / (questions.length * 100)) * 100);
    let grade = 'F';

    if (percentage >= 90) grade = 'S';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';

    const stats = {
      score,
      percentage,
      grade,
      totalQuestions: questions.length,
      correctAnswers: Math.floor(score / 100), // Approximate
      averageTime: 30 - (timeLeft / questions.length)
    };

    setGameStats(stats);
    setGameState('completed');
    saveGameStats(stats);
  };

  const saveGameStats = (stats) => {
    const savedStats = JSON.parse(localStorage.getItem('animeGamesStats') || '{"totalGames": 0, "totalScore": 0, "gamesPlayed": 0, "triviaGames": 0, "triviaBestScore": 0}');
    savedStats.gamesPlayed += 1;
    savedStats.totalScore += stats.score;
    savedStats.triviaGames += 1;
    if (stats.score > savedStats.triviaBestScore) {
      savedStats.triviaBestScore = stats.score;
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
    const shareText = `I just completed the Anime Trivia Master and got a grade of ${gameStats.grade}! Score: ${gameStats.score.toLocaleString()} points (${gameStats.percentage}% accuracy)`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Anime Trivia Results',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
        navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
        alert('Results copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
      alert('Results copied to clipboard!');
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimeLeft(30);
    setShowResult(false);
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
                <FontAwesomeIcon icon={faQuestionCircle} className="text-3xl text-purple-400" />
                <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent px-4 py-2">
                  Anime Trivia Master
                </h1>
              </div>
              <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
                Test your anime knowledge with challenging trivia questions about characters, genres, and more!
              </p>
            </div>

            {/* Question Count Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
              {[5, 10, 15].map((count) => (
                <button
                  key={count}
                  onClick={() => startGame(count)}
                  className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-[1.02] p-6 text-center group"
                >
                  <div className="text-2xl font-bold text-purple-400 group-hover:text-purple-300 mb-2">
                    {count}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    Questions
                  </div>
                  <div className="text-xs text-gray-500">
                    {count * 30}s Total Time
                  </div>
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-8 border border-purple-500/20">
              <h3 className="text-xl font-bold mb-4 text-center">How to Play</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <FontAwesomeIcon icon={faClock} className="text-2xl text-blue-400 mb-2" />
                  <h4 className="font-bold mb-1">30 Seconds</h4>
                  <p className="text-sm text-gray-400">Answer each question within 30 seconds</p>
                </div>
                <div>
                  <FontAwesomeIcon icon={faTrophy} className="text-2xl text-yellow-400 mb-2" />
                  <h4 className="font-bold mb-1">Score Points</h4>
                  <p className="text-sm text-gray-400">Earn bonus points for answering quickly</p>
                </div>
                <div>
                  <FontAwesomeIcon icon={faStar} className="text-2xl text-purple-400 mb-2" />
                  <h4 className="font-bold mb-1">Get Graded</h4>
                  <p className="text-sm text-gray-400">Receive a grade based on your performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <FontAwesomeIcon icon={faQuestionCircle} className="text-4xl text-purple-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Preparing Questions...</h2>
              <p className="text-gray-400">Loading your anime trivia challenge</p>
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Trivia Complete!
              </h1>
              <p className="text-gray-400">Great job completing the anime trivia challenge!</p>
            </div>

            {/* Results Card */}
            <div ref={resultCardRef} className="relative bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8 overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="text-center">
                  <FontAwesomeIcon icon={faQuestionCircle} className="text-8xl text-purple-400 mb-4" />
                  <h1 className="text-4xl font-bold text-purple-400">Otazumi</h1>
                  <p className="text-lg text-pink-300">Anime Trivia</p>
                </div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 border-4 ${
                    gameStats.grade === 'S' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400' :
                    gameStats.grade === 'A' ? 'bg-green-500/20 border-green-400 text-green-400' :
                    gameStats.grade === 'B' ? 'bg-blue-500/20 border-blue-400 text-blue-400' :
                    gameStats.grade === 'C' ? 'bg-orange-500/20 border-orange-400 text-orange-400' :
                    'bg-red-500/20 border-red-400 text-red-400'
                  }`}>
                    <span className="text-4xl font-bold">{gameStats.grade}</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Grade: {gameStats.grade}
                  </h2>
                  <p className="text-gray-300 text-lg">Score: {gameStats.score.toLocaleString()} points</p>
                  <p className="text-gray-300 text-lg">Accuracy: {gameStats.percentage}%</p>
                  <p className="text-gray-400 text-sm mt-2">Completed on {new Date().toLocaleDateString()}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-white/5">
                    <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-400 text-3xl mb-3" />
                    <p className="text-sm text-gray-400 mb-1">Questions</p>
                    <p className="text-2xl font-bold">{gameStats.totalQuestions}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-white/5">
                    <FontAwesomeIcon icon={faCheck} className="text-green-400 text-3xl mb-3" />
                    <p className="text-sm text-gray-400 mb-1">Correct</p>
                    <p className="text-2xl font-bold">{gameStats.correctAnswers}</p>
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
                      link.download = 'anime-trivia-result.png';
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
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
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
                <FontAwesomeIcon icon={faClock} className={`text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`} />
                <span className="font-bold text-lg">{timeLeft}s</span>
              </div>
              <div className="text-gray-400">
                {currentQuestion + 1} / {questions.length}
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-purple-400 font-medium bg-purple-500/10 px-3 py-1 rounded-full">
                {question?.category || 'Trivia'}
              </span>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className={`text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`} />
                <span className={`font-bold text-lg ${timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'}`}>
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
                      ? 'border-white/20 hover:border-purple-400 hover:bg-purple-400/10'
                      : selectedAnswer === index
                      ? index === question.correct
                        ? 'border-green-400 bg-green-400/20'
                        : 'border-red-400 bg-red-400/20'
                      : index === question.correct && showResult
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
                        : index === question.correct && showResult
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

            {/* Result Feedback */}
            {showResult && question && (
              <div className="mt-6 p-4 rounded-lg bg-white/10">
                <div className="flex items-center gap-2 mb-2">
                  {selectedAnswer === question.correct ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} className="text-green-400" />
                      <span className="text-green-400 font-bold">Correct!</span>
                    </>
                  ) : selectedAnswer === -1 ? (
                    <>
                      <FontAwesomeIcon icon={faClock} className="text-red-400" />
                      <span className="text-red-400 font-bold">Time's Up!</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faTimes} className="text-red-400" />
                      <span className="text-red-400 font-bold">Incorrect!</span>
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

export default AnimeTrivia;