import React, { useState } from 'react';
import { Palette, Sparkles, Download, RefreshCw, PenTool, Printer, Loader2 } from 'lucide-react';
import { generateSceneDescriptions, generateColoringPageImage } from './services/gemini';
import { generatePDF } from './services/pdfGenerator';
import { ColoringPage, AppState } from './types';
import { ChatWidget } from './components/ChatWidget';
import { EditorModal } from './components/EditorModal';

const App: React.FC = () => {
  const [childName, setChildName] = useState('');
  const [theme, setTheme] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedPage, setSelectedPage] = useState<ColoringPage | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName || !theme) return;

    setState(AppState.GENERATING_PROMPTS);
    setStatusMessage("Dreaming up amazing scenes...");
    setPages([]);

    try {
      // 1. Generate descriptions
      const descriptions = await generateSceneDescriptions(theme);
      
      setState(AppState.GENERATING_IMAGES);
      const newPages: ColoringPage[] = [];

      // 2. Generate images sequentially or parallel. Parallel is faster.
      const imagePromises = descriptions.map(async (desc, index) => {
        // Delay slightly to not hit rate limits if any, though standard limits usually allow this burst
        await new Promise(r => setTimeout(r, index * 500)); 
        const base64 = await generateColoringPageImage(desc);
        return {
            id: crypto.randomUUID(),
            url: base64,
            prompt: desc,
            originalDescription: desc
        };
      });

      // Update progress as they finish? For simplicity, wait all.
      // Better UX: show them as they arrive.
      
      let completedCount = 0;
      setStatusMessage(`Drawing page 0 of ${descriptions.length}...`);

      // We wrap promises to update state individually
      const pagePromises = descriptions.map(async (desc, index) => {
          try {
            const base64 = await generateColoringPageImage(desc);
            const page: ColoringPage = {
                id: crypto.randomUUID(),
                url: base64,
                prompt: desc,
                originalDescription: desc
            };
            completedCount++;
            setStatusMessage(`Drawing page ${completedCount} of ${descriptions.length}...`);
            setPages(prev => [...prev, page]); // React state update
            return page;
          } catch (err) {
            console.error("Failed one image", err);
            return null;
          }
      });

      await Promise.all(pagePromises);
      setState(AppState.READY);
      setStatusMessage("Your coloring book is ready!");

    } catch (error) {
      console.error(error);
      setState(AppState.ERROR);
      setStatusMessage("Something went wrong. Please try again.");
    }
  };

  const handleDownloadPDF = () => {
    generatePDF(childName, theme, pages);
  };

  const handleUpdatePage = (id: string, newUrl: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, url: newUrl } : p));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
               <Palette size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 font-comic">
              DreamColor AI
            </h1>
          </div>
          {state === AppState.READY && (
              <button 
                onClick={handleDownloadPDF}
                className="hidden sm:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Download size={18} />
                Download PDF
              </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero / Input Section */}
        <section className={`transition-all duration-500 ${state !== AppState.IDLE ? 'mb-12' : 'min-h-[60vh] flex flex-col justify-center items-center text-center'}`}>
          <div className={`max-w-2xl mx-auto w-full ${state !== AppState.IDLE ? '' : 'space-y-8'}`}>
             
             {state === AppState.IDLE && (
               <>
                 <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight font-comic">
                   Create Magic <br/> Coloring Books
                 </h2>
                 <p className="text-lg text-slate-600 max-w-lg mx-auto">
                   Turn your child's imagination into a printable reality. Just enter a name and a theme!
                 </p>
               </>
             )}

             <form onSubmit={handleGenerate} className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2 text-left">
                      <label htmlFor="childName" className="block text-sm font-semibold text-gray-700">Child's Name</label>
                      <input
                        id="childName"
                        type="text"
                        value={childName}
                        onChange={(e) => setChildName(e.target.value)}
                        placeholder="e.g. Leo"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/80"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label htmlFor="theme" className="block text-sm font-semibold text-gray-700">Adventure Theme</label>
                      <input
                        id="theme"
                        type="text"
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        placeholder="e.g. Space Dinosaurs"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white/80"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={state === AppState.GENERATING_PROMPTS || state === AppState.GENERATING_IMAGES}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2"
                  >
                    {state === AppState.IDLE || state === AppState.READY || state === AppState.ERROR ? (
                      <>
                        <Sparkles className="animate-pulse" /> Generate Coloring Book
                      </>
                    ) : (
                      <>
                        <Loader2 className="animate-spin" /> {statusMessage}
                      </>
                    )}
                  </button>
                </div>
             </form>
          </div>
        </section>

        {/* Results Grid */}
        {pages.length > 0 && (
          <section className="animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-800 font-comic">Your Pages</h3>
              <div className="sm:hidden">
                 <button 
                  onClick={handleDownloadPDF}
                  className="bg-green-600 text-white p-3 rounded-full shadow-md"
                 >
                   <Download size={20} />
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {pages.map((page, index) => (
                <div key={page.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300">
                  <div className="aspect-square p-4 bg-gray-50 flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={page.url} 
                      alt={`Page ${index + 1}`} 
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                       <button
                         onClick={() => setSelectedPage(page)}
                         className="bg-white text-gray-900 p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
                         title="Edit with AI"
                       >
                         <PenTool size={20} />
                       </button>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Page {index + 1}</p>
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed" title={page.originalDescription}>
                      {page.originalDescription}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Placeholders for loading state if needed, though we update state incrementally above */}
              {state === AppState.GENERATING_IMAGES && pages.length < 5 && (
                 Array.from({ length: 5 - pages.length }).map((_, i) => (
                   <div key={`skeleton-${i}`} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse border border-gray-200"></div>
                 ))
              )}
            </div>
            
            <div className="mt-12 p-8 bg-indigo-50 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-indigo-100">
              <div className="flex items-center gap-4">
                 <div className="bg-white p-4 rounded-full shadow-sm text-indigo-600">
                   <Printer size={32} />
                 </div>
                 <div>
                   <h4 className="text-xl font-bold text-indigo-900">Ready to print?</h4>
                   <p className="text-indigo-700">Get the full PDF with a custom cover page.</p>
                 </div>
              </div>
              <button 
                onClick={handleDownloadPDF}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-indigo-300 transition-all flex items-center justify-center gap-3"
              >
                <Download size={24} />
                Download PDF Book
              </button>
            </div>
          </section>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">
            Powered by Gemini AI • DreamColor &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* Extras */}
      <ChatWidget />
      
      {selectedPage && (
        <EditorModal 
          isOpen={!!selectedPage} 
          onClose={() => setSelectedPage(null)} 
          page={selectedPage} 
          onUpdate={handleUpdatePage}
        />
      )}
    </div>
  );
};

export default App;
