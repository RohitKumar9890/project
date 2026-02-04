import { useState } from 'react';
import ExamInterface from '../../components/exam/ExamInterface';
import Layout from '../../components/Layout';

// Demo data
const demoExam = {
  id: 'demo-1',
  title: 'Data Structures & Algorithms - Midterm Exam',
  durationMinutes: 60,
  questions: [
    {
      id: 'q1',
      prompt: 'What is the time complexity of binary search in a sorted array?',
      options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
      correctOptionIndex: 1,
      marks: 2
    },
    {
      id: 'q2',
      prompt: 'Which data structure uses LIFO (Last In First Out) principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctOptionIndex: 1,
      marks: 2
    },
    {
      id: 'q3',
      prompt: 'What is the worst-case time complexity of QuickSort algorithm?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      correctOptionIndex: 2,
      marks: 3
    },
    {
      id: 'q4',
      prompt: 'In a binary tree, a node with no children is called:',
      options: ['Root node', 'Leaf node', 'Parent node', 'Internal node'],
      correctOptionIndex: 1,
      marks: 2
    },
    {
      id: 'q5',
      prompt: 'Which traversal method visits the left subtree, root, then right subtree?',
      options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
      correctOptionIndex: 1,
      marks: 2
    }
  ]
};

export default function ExamDemo() {
  const [examSubmitted, setExamSubmitted] = useState(false);

  const handleSubmit = (answers) => {
    console.log('Exam submitted:', answers);
    setExamSubmitted(true);
    alert('Exam submitted successfully!');
  };

  if (examSubmitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Your answers have been saved. Results will be available soon.
            </p>
            <button
              onClick={() => setExamSubmitted(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
            >
              Back to Demo
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return <ExamInterface exam={demoExam} onSubmit={handleSubmit} />;
}
