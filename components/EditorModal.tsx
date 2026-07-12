import React, { useState } from 'react';
import { X, Wand2, Download, RefreshCw } from 'lucide-react';
import { ColoringPage } from '../types';
import { editColoringPage } from '../services/gemini';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: ColoringPage;
  onUpdate: (id: string, newUrl: string) => void;
}

export const EditorModal: React.FC<EditorModalProps> = ({ isOpen, onClose, page, onUpdate }) => {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentImage, setCurrentImage] = useState(page.url);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    
    setIsEditing(true);
    setError(null);
    try {
      const newImageUrl = await editColoringPage(currentImage, prompt);
      setCurrentImage(newImageUrl);
      onUpdate(page.id, newImageUrl);
      setPrompt('');
    } catch (err) {
      setError("Failed to edit image. Try a different prompt.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 font-comic">Magic Editor</h3>
            <p className="text-gray-500 text-sm">Use AI to change this page!</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col md:flex-row gap-8">
          {/* Image Preview */}
          <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-center min-h-[300px]">
             {isEditing ? (
               <div className="flex flex-col items-center gap-4">
                 <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-indigo-600 font-medium animate-pulse">Applying magic...</p>
               </div>
             ) : (
                <img src={currentImage} alt="Coloring Page" className="max-h-[500px] object-contain w-full h-full" />
             )}
          </div>

          {/* Controls */}
          <div className="md:w-80 flex flex-col gap-6">
             <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
               <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                 <Wand2 size={18} />
                 How to edit
               </h4>
               <p className="text-sm text-indigo-800">
                 Describe what you want to change. <br/>
                 Example: <br/>
                 "Add a party hat" <br/>
                 "Remove the tree" <br/>
                 "Make it underwater"
               </p>
             </div>

             <div className="space-y-3">
               <label className="text-sm font-semibold text-gray-700">Your Magic Spell:</label>
               <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Add a cute puppy next to the dinosaur..."
                  className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-32"
               />
               
               {error && <p className="text-red-500 text-sm">{error}</p>}

               <button 
                onClick={handleEdit}
                disabled={isEditing || !prompt.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2"
               >
                 {isEditing ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
                 {isEditing ? 'Editing...' : 'Apply Changes'}
               </button>
             </div>

             <div className="mt-auto pt-4 border-t border-gray-200">
                <a 
                  href={currentImage} 
                  download={`coloring_page_edited.png`}
                  className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Download size={18} /> Download Single Image
                </a>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
