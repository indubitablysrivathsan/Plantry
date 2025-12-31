/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  AuthPage, 
  DashboardPage, 
  CreateListPage, 
  SmartSuggestionsPage, 
  ActiveListPage, 
  FeedbackPage,
  HistoryPage,
  InsightsPage,
  SettingsPage,
  BottomNavigation
} from './components/PlantryUI';
import { Moon, Sun } from 'lucide-react';

export type PageView = 
  | 'auth' 
  | 'dashboard' 
  | 'create-list' 
  | 'suggestions' 
  | 'active-list' 
  | 'feedback' 
  | 'history'
  | 'insights'
  | 'settings'
  | 'add-forgotten';


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('auth');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [shoppingList, setShoppingList] = useState<any[]>([]);
  const [pageParams, setPageParams] = useState<any>(null);
  const onNavigate = (page: PageView, params?: any) => {
    setCurrentPage(page);
    setPageParams(params ?? null);
  };

  // Initialize theme
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Update HTML class for Tailwind Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Simple Router Switch
  const renderPage = () => {
    switch (currentPage) {
      case 'auth':
        return <AuthPage onLogin={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
        return <DashboardPage onNavigate={onNavigate} />;
      case 'create-list':
        return <CreateListPage onNavigate={onNavigate} setShoppingList={setShoppingList} />;
      case 'suggestions':
        return <SmartSuggestionsPage onNavigate={onNavigate} currentList={shoppingList} setShoppingList={setShoppingList} />;
      case 'active-list':
        return <ActiveListPage onNavigate={onNavigate} list={shoppingList} />;
      case 'feedback':
        return <FeedbackPage onNavigate={onNavigate} />;
      case 'history':
        return <HistoryPage onNavigate={onNavigate} />;
      case 'insights':
        return <InsightsPage />;
      case 'settings':
        return <SettingsPage isDarkMode={isDarkMode} toggleTheme={toggleTheme} onNavigate={onNavigate} />;
      case 'add-forgotten':
        return (
          <CreateListPage
            onNavigate={onNavigate}
            setShoppingList={() => {}}
            mode="forgotten"
            shoppingEventId={pageParams?.shoppingEventId}
          />
        );
      default:
        return <DashboardPage onNavigate={onNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500">
      
      {/* Top Bar (Mobile/Desktop) */}
      {currentPage !== 'auth' && (
        <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center glass-panel">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setCurrentPage('dashboard')}
          >
            <div className="w-8 h-8 bg-plantry-sage rounded-full flex items-center justify-center text-white font-serif font-bold text-lg">P</div>
            <span className="font-serif font-bold text-xl tracking-tight text-plantry-sageDark dark:text-plantry-cream">Plantry</span>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-plantry-textLight hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 container mx-auto px-4 md:px-6 pb-24 transition-all duration-300 ${currentPage !== 'auth' ? 'pt-24' : ''}`}>
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      {currentPage !== 'auth' && (
        <BottomNavigation activePage={currentPage} onNavigate={setCurrentPage} />
      )}
    </div>
  );
};

export default App;