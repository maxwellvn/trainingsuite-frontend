"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trophy,
  RotateCcw,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuiz, useSubmitQuiz } from "@/hooks";
import type { Quiz, Question } from "@/types";

function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showResults,
  isCorrect,
}: {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onSelectAnswer: (answer: string) => void;
  showResults: boolean;
  isCorrect?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            Question {questionNumber} of {totalQuestions}
          </Badge>
          {showResults && (
            <Badge className={isCorrect ? "bg-green-600" : "bg-red-600"}>
              {isCorrect ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Correct
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Incorrect
                </>
              )}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-2">{question.question}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAnswer || ""}
          onValueChange={onSelectAnswer}
          disabled={showResults}
        >
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectAnswer = showResults && option === question.correctAnswer;
              const isWrongSelection = showResults && isSelected && !isCorrect;

              return (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors ${
                    isCorrectAnswer
                      ? "border-green-500 bg-green-50"
                      : isWrongSelection
                      ? "border-red-500 bg-red-50"
                      : isSelected
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                  {showResults && isCorrectAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {showResults && isWrongSelection && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

function QuizTimer({ timeLimit, onTimeUp }: { timeLimit: number; onTimeUp: () => void }) {
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60); // Convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 60;

  return (
    <div className={`flex items-center gap-2 ${isLowTime ? "text-red-600" : "text-muted-foreground"}`}>
      <Clock className="h-4 w-4" />
      <span className="font-mono text-sm">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}

function QuizResults({
  score,
  totalQuestions,
  passingScore,
  onRetry,
  onContinue,
}: {
  score: number;
  totalQuestions: number;
  passingScore: number;
  onRetry: () => void;
  onContinue: () => void;
}) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const passed = percentage >= passingScore;

  return (
    <Card className="max-w-lg mx-auto">
      <CardContent className="pt-8 pb-6 text-center">
        <div
          className={`h-24 w-24 rounded-full mx-auto mb-6 flex items-center justify-center ${
            passed ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {passed ? (
            <Trophy className="h-12 w-12 text-green-600" />
          ) : (
            <AlertCircle className="h-12 w-12 text-red-600" />
          )}
        </div>

        <h2 className="text-2xl font-bold mb-2">
          {passed ? "Congratulations!" : "Keep Trying!"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {passed
            ? "You passed the quiz successfully."
            : `You need ${passingScore}% to pass. Try again!`}
        </p>

        <div className="mb-6">
          <div className="text-5xl font-bold text-primary mb-2">{percentage}%</div>
          <p className="text-sm text-muted-foreground">
            {score} out of {totalQuestions} correct
          </p>
        </div>

        <Progress value={percentage} className="h-3 mb-6" />

        <div className="flex gap-3 justify-center">
          {!passed && (
            <Button variant="outline" onClick={onRetry}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          <Button onClick={onContinue}>
            {passed ? (
              <>
                Continue Learning
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                <Home className="h-4 w-4 mr-2" />
                Back to Course
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function QuizPage({
  params,
}: {
  params: Promise<{ slug: string; quizId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);

  const { data: quizResponse, isLoading } = useQuiz(resolvedParams.quizId);
  const submitQuiz = useSubmitQuiz();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const quiz = quizResponse?.data as Quiz | undefined;

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Quiz not found</h1>
          <p className="text-muted-foreground mt-2">
            The quiz you're looking for doesn't exist.
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/courses/${resolvedParams.slug}/learn`)}
          >
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  const handleSelectAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate score
    let score = 0;
    questions.forEach((q) => {
      if (answers[q._id] === q.correctAnswer) {
        score++;
      }
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const passed = percentage >= (quiz.passingScore || 70);

    setQuizResult({ score, passed });
    setShowResults(true);

    // Submit to API
    try {
      await submitQuiz.mutateAsync({
        quizId: quiz._id,
        answers,
      });
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setQuizResult(null);
  };

  const handleContinue = () => {
    router.push(`/courses/${resolvedParams.slug}/learn`);
  };

  const handleTimeUp = () => {
    handleSubmit();
  };

  // Check if current question is correct (for results view)
  const isCurrentCorrect = currentQuestion
    ? answers[currentQuestion._id] === currentQuestion.correctAnswer
    : false;

  if (showResults && quizResult) {
    return (
      <div className="min-h-screen bg-muted/30 p-6">
        <div className="max-w-3xl mx-auto">
          <QuizResults
            score={quizResult.score}
            totalQuestions={totalQuestions}
            passingScore={quiz.passingScore || 70}
            onRetry={handleRetry}
            onContinue={handleContinue}
          />

          {/* Review answers */}
          <div className="mt-8 space-y-4">
            <h3 className="font-semibold text-lg">Review Your Answers</h3>
            {questions.map((question, index) => (
              <QuestionCard
                key={question._id}
                question={question}
                questionNumber={index + 1}
                totalQuestions={totalQuestions}
                selectedAnswer={answers[question._id] || null}
                onSelectAnswer={() => {}}
                showResults={true}
                isCorrect={answers[question._id] === question.correctAnswer}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/courses/${resolvedParams.slug}/learn`)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Exit Quiz
            </Button>
            {quiz.timeLimit && (
              <QuizTimer timeLimit={quiz.timeLimit} onTimeUp={handleTimeUp} />
            )}
          </div>
          <div>
            <h1 className="font-semibold">{quiz.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span>{answeredCount} of {totalQuestions} answered</span>
              <span>Passing score: {quiz.passingScore || 70}%</span>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 mt-3" />
        </div>
      </header>

      {/* Question */}
      <main className="max-w-3xl mx-auto p-6">
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
            selectedAnswer={answers[currentQuestion._id] || null}
            onSelectAnswer={handleSelectAnswer}
            showResults={false}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {/* Question indicators */}
          <div className="hidden sm:flex gap-1">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? "bg-primary text-primary-foreground"
                    : answers[questions[index]._id]
                    ? "bg-green-100 text-green-700"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount < totalQuestions || submitQuiz.isPending}
            >
              {submitQuiz.isPending ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
