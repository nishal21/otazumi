import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPlay,
  faPause,
  faRedo,
  faTrophy,
  faStar,
  faCheck,
  faTimes,
  faClock,
  faBrain,
  faQuestionCircle,
  faShare,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import { animeQuizData } from '../../../data/animeQuizData';

const AnimeQuiz = () => {
  const navigate = useNavigate();
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(null);
  const [selectedQuizType, setSelectedQuizType] = useState(null);
  const resultCardRef = useRef(null);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffleQuestionOptions = (question) => {
    const originalCorrect = question.correct;
    const shuffledOptions = shuffleArray(question.options);
    const newCorrectIndex = shuffledOptions.indexOf(question.options[originalCorrect]);
    return {
      ...question,
      options: shuffledOptions,
      correct: newCorrectIndex
    };
  };

  const quizTypes = [
    {
      id: 'anime-trivia',
      title: 'Anime Trivia',
      description: 'Test your anime knowledge with text-based questions',
      icon: faQuestionCircle,
      questions: animeQuizData.animeTrivia
    },
    {
      id: 'mixed-quiz',
      title: 'Mixed Challenge',
      description: 'A mix of anime trivia and general knowledge questions',
      icon: faBrain,
      questions: [
        ...animeQuizData.animeTrivia.slice(0, 8),
        ...animeQuizData.mixedQuiz.slice(0, 7)
      ].sort(() => Math.random() - 0.5)
    }
  ];

  useEffect(() => {
    let timer;
    if (isPlaying && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, showResult]);

  const startQuiz = (quizType, questionCount = null) => {
    const quiz = quizTypes.find(q => q.id === quizType);
    let selectedQuestions = [...quiz.questions];

    // Shuffle questions
    selectedQuestions = shuffleArray(selectedQuestions);

    // Limit questions if specified
    if (questionCount && questionCount < selectedQuestions.length) {
      selectedQuestions = selectedQuestions.slice(0, questionCount);
    }

    // Shuffle options for each question
    const shuffledQuestions = selectedQuestions.map(question => shuffleQuestionOptions(question));

    const shuffledQuiz = {
      ...quiz,
      questions: shuffledQuestions
    };

    setCurrentQuiz(shuffledQuiz);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
  };

  const handleAnswerSelect = (answerIndex) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowResult(true);

    if (answerIndex === currentQuiz.questions[currentQuestion].correct) {
      setScore(score + (timeLeft * 10)); // Bonus points for speed
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleTimeUp = () => {
    setSelectedAnswer(-1); // -1 indicates time up
    setShowResult(true);
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setIsPlaying(false);
    setQuizCompleted(true);
    const finalScore = score;
    const percentage = Math.round((score / (currentQuiz.questions.length * 300)) * 100);

    setQuizResults({
      score: finalScore,
      percentage,
      totalQuestions: currentQuiz.questions.length,
      grade: percentage >= 90 ? 'S' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D'
    });

    // Save to localStorage
    const savedStats = JSON.parse(localStorage.getItem('animeGamesStats') || '{"totalGames": 0, "totalScore": 0, "gamesPlayed": 0}');
    savedStats.gamesPlayed += 1;
    savedStats.totalScore += finalScore;
    localStorage.setItem('animeGamesStats', JSON.stringify(savedStats));
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(false);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizCompleted(false);
    setQuizResults(null);
    setSelectedQuestionCount(null);
    setSelectedQuizType(null);
  };

  const generateResultImage = async () => {
    if (!resultCardRef.current) return;

    try {
      // Use html2canvas to capture the result card
      const canvas = await html2canvas(resultCardRef.current, {
        backgroundColor: '#0a0a0a',
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        width: resultCardRef.current.offsetWidth,
        height: resultCardRef.current.offsetHeight
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `anime-quiz-results-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error generating result image:', error);
      // Fallback to basic canvas if html2canvas fails
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;

        // Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Anime Quiz Results', canvas.width / 2, 80);

        // Quiz type
        ctx.font = '20px Arial';
        ctx.fillStyle = '#a855f7';
        ctx.fillText(currentQuiz.title, canvas.width / 2, 120);

        // Grade
        const gradeColors = {
          'S': '#fbbf24',
          'A': '#10b981',
          'B': '#3b82f6',
          'C': '#f97316',
          'D': '#ef4444'
        };
        ctx.fillStyle = gradeColors[quizResults.grade] || '#ffffff';
        ctx.font = 'bold 72px Arial';
        ctx.fillText(quizResults.grade, canvas.width / 2, 200);

        // Stats
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${quizResults.score.toLocaleString()} points`, canvas.width / 2, 280);
        ctx.fillText(`Accuracy: ${quizResults.percentage}%`, canvas.width / 2, 320);
        ctx.fillText(`Questions: ${quizResults.totalQuestions}`, canvas.width / 2, 360);

        // Date
        ctx.font = '16px Arial';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText(`Completed on ${new Date().toLocaleDateString()}`, canvas.width / 2, 420);

        // Convert to blob and download
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `anime-quiz-results-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        });
      } catch (fallbackError) {
        console.error('Fallback canvas generation also failed:', fallbackError);
      }
    }
  };

  const shareResult = async () => {
    const shareText = `I just completed the ${currentQuiz.title} and got a grade of ${quizResults.grade}! Score: ${quizResults.score.toLocaleString()} points (${quizResults.percentage}% accuracy)`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Anime Quiz Results',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
        // Fallback to clipboard
        navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
        alert('Results copied to clipboard!');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${shareText}\n\n${window.location.href}`);
      alert('Results copied to clipboard!');
    }
  };

  if (quizCompleted && quizResults) {
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
                Quiz Complete!
              </h1>
              <p className="text-gray-400">Great job on completing the {currentQuiz.title}!</p>
            </div>

            {/* Results Card */}
            <div ref={resultCardRef} className="relative bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8 overflow-hidden">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <div className="text-center">
                  <FontAwesomeIcon icon={faBrain} className="text-8xl text-purple-400 mb-4" />
                  <h1 className="text-4xl font-bold text-purple-400">Otazumi</h1>
                  <p className="text-lg text-purple-300">Anime Quiz</p>
                </div>
              </div>

              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 border-4 ${
                    quizResults.grade === 'S' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400' :
                    quizResults.grade === 'A' ? 'bg-green-500/20 border-green-400 text-green-400' :
                    quizResults.grade === 'B' ? 'bg-blue-500/20 border-blue-400 text-blue-400' :
                    quizResults.grade === 'C' ? 'bg-orange-500/20 border-orange-400 text-orange-400' :
                    'bg-red-500/20 border-red-400 text-red-400'
                  }`}>
                    <span className="text-4xl font-bold">{quizResults.grade}</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Grade: {quizResults.grade}
                  </h2>
                  <p className="text-gray-300 text-lg">Score: {quizResults.score.toLocaleString()} points</p>
                  <p className="text-gray-300 text-lg">Accuracy: {quizResults.percentage}%</p>
                  <p className="text-gray-400 text-sm mt-2">Completed on {new Date().toLocaleDateString()}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-white/5">
                    <FontAwesomeIcon icon={faTrophy} className="text-yellow-400 text-3xl mb-3" />
                    <p className="text-sm text-gray-400 mb-1">Final Score</p>
                    <p className="text-2xl font-bold">{quizResults.score.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 text-center border border-white/5">
                    <FontAwesomeIcon icon={faStar} className="text-purple-400 text-3xl mb-3" />
                    <p className="text-sm text-gray-400 mb-1">Accuracy</p>
                    <p className="text-2xl font-bold">{quizResults.percentage}%</p>
                  </div>
                </div>

                {/* Quiz Info */}
                <div className="bg-white/10 rounded-lg p-4 mb-6 border border-white/5">
                  <div className="text-center">
                    <h3 className="text-lg font-bold mb-2">{currentQuiz.title}</h3>
                    <p className="text-gray-400 text-sm">{quizResults.totalQuestions} Questions Completed</p>
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
                  onClick={generateResultImage}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Download Image
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={resetQuiz}
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

  if (currentQuiz && isPlaying) {
    const question = currentQuiz.questions[currentQuestion];
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={resetQuiz}
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
                  {currentQuestion + 1} / {currentQuiz.questions.length}
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-center">{question.question}</h2>

              {/* Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((option, index) => (
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
              {showResult && (
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
                  {question.character && question.anime && (
                    <p className="text-gray-300 text-sm">
                      <strong>{question.character}</strong> from <strong>{question.anime}</strong>
                    </p>
                  )}
                  {question.description && (
                    <p className="text-gray-300 text-sm">{question.description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              <FontAwesomeIcon icon={faBrain} className="text-4xl text-purple-400" />
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent px-4 py-2">
                Anime Quiz Challenge
              </h1>
            </div>
            <p className="text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto">
              Test your anime knowledge with challenging trivia questions!
            </p>
          </div>

          {/* Quiz Type Selection */}
          {!selectedQuizType ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {quizTypes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                  onClick={() => setSelectedQuizType(quiz.id)}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-xl mb-4 group-hover:bg-purple-500/30 transition-colors">
                      <FontAwesomeIcon icon={quiz.icon} className="text-3xl text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-300 transition-colors">
                      {quiz.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {quiz.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {quiz.questions.length} Questions Available
                      </span>
                      <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-300">
                        <span className="text-sm font-medium">Select</span>
                        <FontAwesomeIcon icon={faPlay} className="text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !selectedQuestionCount ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <button
                  onClick={() => setSelectedQuizType(null)}
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Back to Quiz Types
                </button>
                <h2 className="text-2xl font-bold mb-2">Select Number of Questions</h2>
                <p className="text-gray-400">Choose how many questions you'd like to answer</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[5, 10, 15, 20, 'All'].map((count) => {
                  const quiz = quizTypes.find(q => q.id === selectedQuizType);
                  const actualCount = count === 'All' ? quiz.questions.length : Math.min(count, quiz.questions.length);
                  return (
                    <button
                      key={count}
                      onClick={() => setSelectedQuestionCount(count === 'All' ? null : count)}
                      className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-[1.02] p-6 text-center group"
                    >
                      <div className="text-3xl font-bold text-purple-400 group-hover:text-purple-300 mb-2">
                        {count}
                      </div>
                      <div className="text-sm text-gray-400">
                        {actualCount} Questions
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center">
              <button
                onClick={() => setSelectedQuestionCount(null)}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Back to Question Count
              </button>
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-8">
                <h3 className="text-xl font-bold mb-4">Ready to Start?</h3>
                <p className="text-gray-400 mb-6">
                  {quizTypes.find(q => q.id === selectedQuizType).title} with {selectedQuestionCount || quizTypes.find(q => q.id === selectedQuizType).questions.length} questions
                </p>
                <button
                  onClick={() => startQuiz(selectedQuizType, selectedQuestionCount)}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 rounded-lg font-medium transition-colors"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  Start Quiz
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-8 border border-purple-500/20">
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
};

export default AnimeQuiz;