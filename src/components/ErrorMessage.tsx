import React from 'react';
import { AlertOctagon } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg max-w-2xl mx-auto">
      <div className="flex items-center">
        <AlertOctagon className="flex-shrink-0 mr-2" size={20} />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;
