
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';

interface Question {
  question: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
}

function parseQuizMarkdown(markdown: string): Question[] {
  if (!markdown) return [];

  const questions: Question[] = [];
  const questionBlocks = markdown.split('### ').filter(block => block.trim() !== '');

  questionBlocks.forEach(block => {
    const lines = block.split('\n').filter(line => line.trim() !== '');
    const questionText = lines[0].trim();
    const options: { label: string; text: string }[] = [];
    let correctAnswer = '';

    lines.slice(1).forEach(line => {
      const optionMatch = line.match(/^(\d+\.\s)?([A-D])\)\s(.*)/);
      if (optionMatch) {
        options.push({ label: optionMatch[2], text: optionMatch[3].trim() });
      } else {
        const answerMatch = line.match(/\*\*Correct Answer:\*\*\s+([A-D])/);
        if (answerMatch) {
          correctAnswer = answerMatch[1];
        }
      }
    });

    if(questionText && options.length > 0 && correctAnswer) {
        questions.push({
            question: questionText,
            options,
            correctAnswer,
        });
    }
  });

  return questions;
}

export function QuizViewer({ quizMarkdown }: { quizMarkdown: string }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const questions = useMemo(() => parseQuizMarkdown(quizMarkdown), [quizMarkdown]);

  if (questions.length === 0) {
    return (
        <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
                <p>Could not parse the generated quiz. Please try generating it again.</p>
            </CardContent>
        </Card>
    )
  }

  const handleAnswerChange = (questionIndex: number, selectedOption: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: selectedOption }));
  };

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => {
        const userAnswer = selectedAnswers[qIndex];
        const isAnswered = userAnswer !== undefined;
        const isCorrect = isAnswered && userAnswer === q.correctAnswer;

        return (
          <Card key={qIndex}>
            <CardHeader>
              <CardTitle className="font-headline text-xl">{qIndex + 1}. {q.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={userAnswer}
                onValueChange={(value) => handleAnswerChange(qIndex, value)}
                className="space-y-3"
              >
                {q.options.map((option, oIndex) => {
                  const isSelected = userAnswer === option.label;
                  const isCorrectOption = option.label === q.correctAnswer;

                  return (
                    <Label
                      key={oIndex}
                      htmlFor={`q${qIndex}-o${oIndex}`}
                      className={cn(
                        "flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all",
                        isAnswered && !isSelected && "text-muted-foreground opacity-70",
                        isAnswered && isCorrectOption && "border-green-500 bg-green-50 dark:bg-green-950",
                        isAnswered && isSelected && !isCorrect && "border-destructive bg-red-50 dark:bg-red-950",
                        !isAnswered && "hover:bg-accent"
                      )}
                    >
                      <RadioGroupItem value={option.label} id={`q${qIndex}-o${oIndex}`} className="h-5 w-5"/>
                      <span className="flex-1">{option.text}</span>
                       {isAnswered && isSelected && (
                        isCorrect ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-destructive" />
                       )}
                       {isAnswered && !isSelected && isCorrectOption && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </Label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
