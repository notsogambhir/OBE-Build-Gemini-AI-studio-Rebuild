import React from 'react';

interface SaveBarProps {
  isDirty: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const SaveBar: React.FC<SaveBarProps> = ({ isDirty, onSave, onCancel }) => {
  if (!isDirty) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 shadow-lg p-4 border-t border-gray-600 z-20 flex justify-center sm:justify-end sm:left-64 backdrop-blur-sm">
      <div className="flex items-center gap-4 sm:pr-8">
        <p className="text-white hidden lg:block">You have unsaved changes.</p>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default SaveBar;
