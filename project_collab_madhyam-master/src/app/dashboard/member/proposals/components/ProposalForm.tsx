'use client';

import { useState } from 'react';

type ProposalFormProps = {
  onSubmit: (payload: { question: string; options: string[] }) => Promise<void>;
  submitting: boolean;
};

export function ProposalForm({ onSubmit, submitting }: ProposalFormProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [error, setError] = useState<string | null>(null);

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((item, i) => (i === index ? value : item)));
  };

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions((prev) => [...prev, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmedQuestion = question.trim();
    const cleanOptions = options.map((opt) => opt.trim()).filter(Boolean);

    if (!trimmedQuestion) {
      setError('Question is required.');
      return;
    }

    if (cleanOptions.length < 2) {
      setError('At least two options are required.');
      return;
    }

    if (new Set(cleanOptions.map((opt) => opt.toLowerCase())).size !== cleanOptions.length) {
      setError('Options must be unique.');
      return;
    }

    await onSubmit({ question: trimmedQuestion, options: cleanOptions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-800">Question</label>
        <textarea
          className="w-full rounded-md border border-gray-300 p-2 text-sm"
          rows={3}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="What should the team vote on?"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-800">Options</label>
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <input
              className="flex-1 rounded-md border border-gray-300 p-2 text-sm"
              value={option}
              onChange={(event) => updateOption(index, event.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              className="rounded border border-gray-300 px-3 text-sm hover:bg-gray-50"
              disabled={options.length <= 2}
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="rounded border border-blue-300 px-3 py-1 text-sm text-blue-700 hover:bg-blue-50"
          disabled={options.length >= 10}
        >
          Add option
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? 'Saving...' : 'Create Proposal'}
      </button>
    </form>
  );
}
