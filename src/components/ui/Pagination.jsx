import React from 'react';
import Button from './Button.jsx';

export default function Pagination({ page, totalPages, onPrevious, onNext, disabled }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="!px-3 !py-1.5 text-xs"
          disabled={disabled || page <= 1}
          onClick={onPrevious}
          type="button"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          className="!px-3 !py-1.5 text-xs"
          disabled={disabled || page >= totalPages}
          onClick={onNext}
          type="button"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
