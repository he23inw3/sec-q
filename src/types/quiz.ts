export interface QuizSubcategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface QuizCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories: QuizSubcategory[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizData {
  category: string;
  subcategory: string;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
}

export interface ReviewAnswer {
  questionId: number;
  originalAnswer: QuizAnswer;
  reviewAnswers: QuizAnswer[];
  bestScore: boolean;
}

export interface QuizResult {
  id: string;
  category: string;
  subcategory: string;
  date: string;
  score: number;
  totalQuestions: number;
  answers: QuizAnswer[];
  timeTaken: number;
  reviewAnswers?: ReviewAnswer[];
}