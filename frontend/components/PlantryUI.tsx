/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ShoppingBag, BarChart2, User, ChevronRight, 
  ThumbsUp, ThumbsDown, X, Check, BrainCircuit, 
  Sparkles, Calendar, ArrowRight, Loader2, RefreshCw, Home,
  Clock, AlertCircle, Shield, LogOut, Moon, Sun, ChevronDown, ChevronUp, Zap, MapPin
} from 'lucide-react';

// --- Shared Types ---
interface Suggestion {
  id: string;
  name: string;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  type: 'frequent' | 'forgotten' | 'seasonal';
  added?: boolean;
  rejected?: boolean;
}

// --- Animation Variants ---
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
};

// --- Atomic Components ---

const PrimaryButton: React.FC<{ onClick?: () => void, children: React.ReactNode, className?: string, disabled?: boolean }> = ({ onClick, children, className, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-4 px-6 bg-plantry-sageDark text-white rounded-2xl font-medium tracking-wide shadow-lg shadow-plantry-sage/20 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${className}`}
  >
    {children}
  </button>
);

const SectionHeader: React.FC<{ title: string, subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-8">
    <h2 className="font-serif text-3xl text-plantry-sageDark dark:text-plantry-cream mb-2">{title}</h2>
    {subtitle && <p className="text-plantry-textLight dark:text-stone-400 leading-relaxed">{subtitle}</p>}
  </div>
);

// --- 1. Auth Page ---

export const AuthPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(onLogin, 1500); // Simulate network
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col justify-center items-center bg-plantry-light dark:bg-zinc-950 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-plantry-sage rounded-full flex items-center justify-center text-white font-serif font-bold text-4xl mx-auto mb-6 shadow-xl shadow-plantry-sage/30"
          >
            P
          </motion.div>
          <h1 className="font-serif text-5xl text-plantry-sageDark dark:text-plantry-cream mb-4">Plantry</h1>
          <p className="text-lg text-plantry-textLight dark:text-stone-400">The intelligent assistant for your household.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-stone-200 dark:border-zinc-800 flex shadow-sm">
             <button className="flex-1 py-3 rounded-xl bg-plantry-light dark:bg-zinc-800 font-medium text-plantry-sageDark dark:text-white shadow-sm transition-all">Sign In</button>
             <button className="flex-1 py-3 rounded-xl text-stone-500 dark:text-stone-400 hover:text-plantry-sageDark transition-colors">Sign Up</button>
          </div>
          
          <div className="space-y-4 mt-8">
            <input type="email" placeholder="Household Email" className="w-full p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-plantry-sage/50 transition-all dark:text-white" />
            <input type="password" placeholder="Password" className="w-full p-4 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-plantry-sage/50 transition-all dark:text-white" />
          </div>

          <div className="pt-6">
            <PrimaryButton onClick={handleLogin}>
               {isLoading ? <Loader2 className="animate-spin" /> : "Enter Household"}
            </PrimaryButton>
          </div>
          
          <p className="text-center text-sm text-stone-400 mt-6">Plantry learns from your habits to simplify planning.</p>
        </div>
      </div>
    </motion.div>
  );
};

// --- 2. Dashboard ---

export const DashboardPage: React.FC<{ onNavigate: (page: any) => void }> = ({ onNavigate }) => {
  
  const [fact, setFact] = useState<string | null>(null);

  //fact
  useEffect(() => {
    async function fetchFact() {
      const res = await fetch(
        "http://localhost:4000/api/insights/fact?householdId=household_001"
      );
      const data = await res.json();
      setFact(data.fact?.text ?? null);
    }

    fetchFact();
  }, []);

  const [recentActivity, setRecentActivity] = useState<any | null>(null);

  //activity
  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const res = await fetch(
          "http://localhost:4000/api/activity/recent?householdId=household_001"
        );
        const data = await res.json();

        if (data.events && data.events.length > 0) {
          setRecentActivity(data.events[0]); // most recent
        }
      } catch (err) {
        console.error("Failed to fetch activity", err);
      }
    }

    fetchRecentActivity();
  }, []);


  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-xl mx-auto">
      <div className="pt-4 mb-8">
        <h1 className="font-serif text-4xl text-plantry-sageDark dark:text-plantry-cream mb-2">Good morning, <br/><span className="italic text-plantry-sage">Rajkumar Family.</span></h1>
        <p className="text-plantry-textLight dark:text-stone-400 mt-4">
          Based on your habits, you usually shop around this time of the month.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Quick Action: New List */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('create-list')}
          className="bg-plantry-sageDark text-white p-8 rounded-3xl shadow-xl shadow-plantry-sage/20 cursor-pointer relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Plus size={24} className="text-white" />
            </div>
            <h3 className="font-serif text-2xl mb-2">Plan New Trip</h3>
            <p className="text-white/70">Create a smart list with AI suggestions.</p>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <div className="glass-card p-6 cursor-pointer" onClick={() => onNavigate('history')}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-stone-900 dark:text-white">
              Recent Activity
            </h3>
            {recentActivity && (
              <span className="text-xs text-plantry-sage font-medium bg-plantry-sage/10 px-2 py-1 rounded-full">
                Completed
              </span>
            )}
          </div>

          {recentActivity ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-stone-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-stone-400">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="font-medium dark:text-stone-200">
                  Weekly Groceries
                </p>
                <p className="text-sm text-stone-500">
                  {new Date(recentActivity.date).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric"
                  })}{" "}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-400">
              No completed shopping sessions yet.
            </p>
          )}
        </div>

        {/* Insight Teaser */}
        <div className="bg-plantry-accent/10 p-6 rounded-2xl border border-plantry-accent/20 flex items-start gap-4">
          <Sparkles className="text-plantry-accent shrink-0 mt-1" size={20} />
          <div>
            {fact && (
              <p className="text-plantry-sageDark dark:text-plantry-cream text-sm font-medium leading-relaxed">
                Did you know?{" "}
                <span className="text-plantry-accent font-bold">
                  {fact}
                </span>
              </p>
            )}          
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- 3. Create List Page ---

export const CreateListPage: React.FC<{
  onNavigate: (page: any, params?: any) => void;
  setShoppingList: (list: any) => void;
  mode?: "list" | "forgotten";
  shoppingEventId?: string;
}> = ({
  onNavigate,
  setShoppingList,
  mode = "list",
  shoppingEventId
}) => {

  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);

    try {
      const res = await fetch("http://localhost:4000/api/items/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: input })
      });

      const data = await res.json();
      const parsedItems: string[] = data.items || [];

      // MODE SWITCH
      if (mode === "forgotten") {
        if (!shoppingEventId) {
          throw new Error("Missing shoppingEventId for forgotten mode");
        }

        await fetch("http://localhost:4000/api/forgotten/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            householdId: "household_001",
            shoppingEventId,
            items: parsedItems
          })
        });

        onNavigate("history");
        return;
      }

      // DEFAULT LIST FLOW
      const manualItems = parsedItems.map(item => ({
        id: crypto.randomUUID(),
        name: item,
        type: "manual",
        checked: false
      }));

      setShoppingList(manualItems);
      onNavigate("suggestions");

    } catch (err) {
      console.error("Item parsing failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };


  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-xl mx-auto h-full flex flex-col">
       <div className="flex-1 flex flex-col justify-center">
          <SectionHeader
            title={mode === "forgotten" ? "What did you forget?" : "What do you need?"}
            subtitle={
              mode === "forgotten"
                ? "Add items you realized later. This helps us learn your habits."
                : "Type naturally. We'll organize it and remind you of what you might be missing."
            }
          />
          
          <div className="relative">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Milk, eggs, tomatoes, basmati rice..."
              className="w-full h-64 bg-transparent text-3xl font-serif leading-relaxed text-plantry-sageDark dark:text-plantry-cream placeholder:text-stone-300 dark:placeholder:text-zinc-700 resize-none focus:outline-none"
              autoFocus
            />
          </div>
       </div>

       <div className="sticky bottom-6">
          <PrimaryButton onClick={handleGenerate} disabled={!input.trim() || isProcessing}>
             {isProcessing ? (
               <>
                 <Loader2 className="animate-spin" /> {mode === "forgotten" ? "Analyzing Forgotten Items..." : "Analyzing Habits..."}
               </>
             ) : (
               <>
                 <BrainCircuit size={20} /> {mode === "forgotten" ? "Add Items..." : "Generate Smart Suggestions"}
               </>
             )}
          </PrimaryButton>
       </div>
    </motion.div>
  );
};

// --- 4. Smart Suggestions Page ---

export const SmartSuggestionsPage: React.FC<{ onNavigate: (page: any) => void, currentList: any[], setShoppingList: (l: any) => void }> = ({ onNavigate, currentList, setShoppingList }) => {
  
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchSuggestions() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/suggestions/infer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdId: "household_001",
          currentList: currentList.map(i => i.name ?? i)
        })
      });

      const data = await res.json();
      console.log("Suggestions from backend:", data);
      setSuggestions(data.suggestions || []);
    } catch (e) {
      console.error("Suggestion fetch failed", e);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  if (currentList.length) {
    fetchSuggestions();
  }
}, [currentList]);



  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAction = (id: string, action: 'accept' | 'reject' | 'block') => {
    setSuggestions(prev => prev.map(s => {
      if (s.id !== id) return s;
      return { ...s, added: action === 'accept', rejected: action === 'reject' || action === 'block' };
    }));
  };

  const handleContinue = () => {
    const acceptedSuggestions = suggestions.filter(s => s.added).map(s => ({ ...s, checked: false }));
    setShoppingList([...currentList, ...acceptedSuggestions]);
    onNavigate('active-list');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-xl mx-auto pb-24">
      <SectionHeader 
        title="We found a few things." 
        subtitle="Based on your household history, you might be forgetting these." 
      />

      <motion.div key={suggestions.length} variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">

        {loading && (
          <p className="text-center text-stone-400">
            Thinking based on your past lists…
          </p>
        )}
        
        {/* Frequent Group */}
        <div className="space-y-4">
           <h3 className="text-sm font-bold uppercase tracking-widest text-plantry-sage mb-4 flex items-center gap-2">
             <RefreshCw size={14}/> Frequently Bought Together
           </h3>
           {suggestions.filter(s => s.type === 'frequent').map(s => (
             <SuggestionCard key={s.id} suggestion={s} expanded={expandedId === s.id} onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)} onAction={handleAction} />
           ))}
        </div>

        {/* Forgotten Group */}
        <div className="space-y-4 pt-4">
           <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 mb-4 flex items-center gap-2">
             <Calendar size={14}/> You Usually Forget
           </h3>
           {suggestions.filter(s => s.type === 'forgotten').map(s => (
             <SuggestionCard key={s.id} suggestion={s} expanded={expandedId === s.id} onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)} onAction={handleAction} />
           ))}
        </div>
        
        {/* Seasonal Group */}
        <div className="space-y-4 pt-4">
           <h3 className="text-sm font-bold uppercase tracking-widest text-plantry-accent mb-4 flex items-center gap-2">
             <Sparkles size={14}/> Seasonal Reminders
           </h3>
           {suggestions.filter(s => s.type === 'seasonal').map(s => (
             <SuggestionCard key={s.id} suggestion={s} expanded={expandedId === s.id} onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)} onAction={handleAction} />
           ))}
        </div>

      </motion.div>

      <div className="fixed bottom-24 left-0 right-0 px-6 md:px-0 max-w-xl mx-auto pointer-events-none">
         <div className="pointer-events-auto">
            <PrimaryButton onClick={handleContinue}>
              Review Final List <ArrowRight size={18} />
            </PrimaryButton>
         </div>
      </div>
    </motion.div>
  );
};

const SuggestionCard: React.FC<{ 
  suggestion: Suggestion, 
  expanded: boolean, 
  onToggle: () => void, 
  onAction: (id: string, action: any) => void 
}> = ({ suggestion, expanded, onToggle, onAction }) => {
  
  const isInteracted = suggestion.added || suggestion.rejected;

  if (isInteracted) {
     if (suggestion.rejected) return null; // Fade out if rejected (simplified)
     // Keep visible if added but styled differently
  }

  return (
    <motion.div 
      variants={fadeUpItem}
      className={`glass-card overflow-hidden transition-all duration-300 ${suggestion.added ? 'border-plantry-sage bg-plantry-sage/5' : ''}`}
    >
      <div className="p-5 flex items-center justify-between cursor-pointer" onClick={!isInteracted ? onToggle : undefined}>
        <div className="flex items-center gap-4">
           <div className={`w-2 h-2 rounded-full ${suggestion.confidence === 'high' ? 'bg-green-500' : suggestion.confidence === 'medium' ? 'bg-yellow-500' : 'bg-stone-300'}`}></div>
           <div>
             <h4 className="font-serif text-xl text-plantry-sageDark dark:text-white">{suggestion.name}</h4>
             {suggestion.added && <span className="text-xs font-bold text-plantry-sage uppercase tracking-wider">Added to list</span>}
           </div>
        </div>
        {!isInteracted && (
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onAction(suggestion.id, 'accept'); }}
              className="p-3 bg-stone-100 hover:bg-plantry-sage hover:text-white rounded-full transition-colors dark:bg-zinc-800"
            >
              <Plus size={20} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && !isInteracted && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-stone-50/50 dark:bg-zinc-800/30 border-t border-stone-100 dark:border-zinc-800 px-5 py-4"
          >
            <div className="flex items-start gap-3 mb-4">
              <BrainCircuit size={16} className="text-plantry-sage mt-1" />
              <div>
                <p className="text-sm font-bold text-plantry-sageDark dark:text-stone-200 mb-1">Why this?</p>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{suggestion.reason}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
               <button onClick={(e) => { e.stopPropagation(); onAction(suggestion.id, 'reject'); }} className="flex-1 py-2 text-sm font-medium text-stone-500 hover:bg-stone-100 rounded-lg flex items-center justify-center gap-2 transition-colors dark:hover:bg-zinc-700">
                  <ThumbsDown size={14} /> Not now
               </button>
               <button onClick={(e) => { e.stopPropagation(); onAction(suggestion.id, 'block'); }} className="flex-1 py-2 text-sm font-medium text-red-400 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2 transition-colors dark:hover:bg-red-900/20">
                  <X size={14} /> Never suggest
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- 5. Active List Page ---

export const ActiveListPage: React.FC<{
  onNavigate: (page: any) => void;
  list: any[];
}> = ({ onNavigate, list }) => {
  async function completeSession() {
    try {
      await fetch("http://localhost:4000/api/shopping/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          householdId: "household_001",
          items: list.map(i => i.name)
        })
      });

      onNavigate("feedback");
    } catch (err) {
      console.error("Failed to complete session", err);
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-xl mx-auto pb-32"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-plantry-sageDark dark:text-plantry-cream">
          Shopping List
        </h2>
        <p className="text-stone-500">{list.length} items</p>
      </div>

      {/* List */}
      <div className="space-y-3">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center p-4 rounded-xl border bg-white border-stone-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-700"
          >
            <span className="text-lg text-plantry-text dark:text-stone-100">
              {item.name}
            </span>

            {item.type !== "manual" && (
              <span className="ml-auto text-xs font-bold text-plantry-sage bg-plantry-sage/10 px-2 py-1 rounded">
                AI
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Complete Button */}
      <div className="fixed bottom-24 left-0 right-0 px-6 md:px-0 max-w-xl mx-auto">
        <PrimaryButton onClick={completeSession}>
          Complete Session
        </PrimaryButton>
      </div>
    </motion.div>
  );
};


// --- 6. Feedback Page ---

export const FeedbackPage: React.FC<{ onNavigate: (page: any) => void }> = ({ onNavigate }) => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-xl mx-auto h-full flex flex-col justify-center items-center text-center">
       <motion.div 
         initial={{ scale: 0 }}
         animate={{ scale: 1 }}
         transition={{ type: "spring", delay: 0.2 }}
         className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-8"
       >
         <Check size={48} />
       </motion.div>
       
       <h2 className="font-serif text-4xl text-plantry-sageDark dark:text-white mb-4">Shopping Complete!</h2>
       <p className="text-lg text-stone-500 mb-8 max-w-sm mx-auto">
         We've updated your household inventory logic. Upcoming suggestions will be even smarter!
       </p>

       <div className="mt-12 w-full">
         <PrimaryButton onClick={() => onNavigate('dashboard')}>
           Back to Dashboard
         </PrimaryButton>
       </div>
    </motion.div>
  );
};

// --- 7. History Page ---

export const HistoryPage: React.FC<{
  onNavigate: (page: string, params?: any) => void;
}> = ({ onNavigate }) => {

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(
          "http://localhost:4000/api/activity/history?householdId=household_001"
        );
        const data = await res.json();
        const sortedEvents = (data.events || []).sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setHistoryData(sortedEvents);

      } catch (err) {
        console.error("Failed to fetch history", err);
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const normalizedHistory = historyData.map(event => ({
    id: event.id,
    date: event.date,
    bought: event.items ?? [],
    items: event.items?.length ?? 0,
    status: event.status ?? "Completed",
    forgotten: event.forgotten ?? []
  }));

  if (loading) {
    return (
      <div className="max-w-xl mx-auto p-6 text-stone-400">
        Loading shopping history…
      </div>
    );
  }

  else if (normalizedHistory.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-6 text-stone-400">
        No shopping history yet.
      </div>
    );
  }

 return (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="max-w-xl mx-auto pb-24"
  >
    <SectionHeader
      title="Shopping History"
      subtitle="A timeline of your household planning."
    />

    {historyData.length === 0 ? (
      <p className="text-sm text-stone-400 px-4">
        No completed shopping sessions yet.
      </p>
    ) : (
      <div className="space-y-4 relative">
        {/* Timeline Line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-stone-200 dark:bg-zinc-800 z-0"></div>

        {normalizedHistory.map((session) => {
          const dateObj =
            session.date instanceof Date
              ? session.date
              : new Date(session.date);

          const dateLabel = dateObj.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
          });

          return (
            <div key={session.id} className="relative z-10">
              <div
                onClick={() =>
                  setExpandedId(
                    expandedId === session.id ? null : session.id
                  )
                }
                className="glass-card p-5 ml-2 cursor-pointer transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-plantry-sage/10 text-plantry-sage flex items-center justify-center font-bold text-xs ring-4 ring-white dark:ring-zinc-900">
                      {dateObj.getDate()}
                    </div>
                    <div>
                      <h4 className="font-serif text-lg text-plantry-sageDark dark:text-white">
                        {dateLabel}
                      </h4>
                    </div>
                  </div>

                  {expandedId === session.id ? (
                    <ChevronUp size={20} className="text-stone-400" />
                  ) : (
                    <ChevronDown size={20} className="text-stone-400" />
                  )}
                </div>

                <AnimatePresence>
                  {expandedId === session.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-stone-100 dark:border-zinc-800 overflow-hidden"
                    >
                      <div className="space-y-3">
                        {/* Bought */}
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-green-600 mb-2 block">
                            Planned & Bought
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {session.bought.map((item: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-md border border-green-100 dark:border-green-900/30"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Forgotten */}
                        {session.forgotten.length > 0 && (
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2 block flex items-center gap-1">
                              <AlertCircle size={10} /> Forgotten
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {session.forgotten.map(
                                (item: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-md border border-red-100 dark:border-red-900/30"
                                  >
                                    {item}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate("add-forgotten", { shoppingEventId: session.id });
                          }}
                          className="mt-3 text-xs font-medium text-plantry-sage hover:underline"
                        >
                          + Add forgotten items
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </motion.div>
);
}


// --- 8. Insights Page ---

export const InsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      const res = await fetch(
        "http://localhost:4000/api/insights/household?householdId=household_001"
      );
      const data = await res.json();
      setInsights(data);
      setLoading(false);
    }
    fetchInsights();
  }, []);

  if (loading) {
    return <p className="text-center text-stone-400">Loading insights…</p>;
  }


  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-xl mx-auto pb-24">
      <SectionHeader 
        title="Household Insights" 
        subtitle="Understanding your family's unique patterns." 
      />

      <div className="grid gap-6">
        
        {/* Key Statistic */}
        <div className="glass-card p-6 bg-gradient-to-br from-plantry-sage/5 to-transparent border-plantry-sage/20">
           <div className="flex items-start gap-4">
              <div className="p-3 bg-plantry-sage rounded-xl text-white">
                 <BrainCircuit size={24} />
              </div>
              <div>
                 <h3 className="font-serif text-xl text-plantry-sageDark dark:text-white mb-2">Shopping Rhythm</h3>
                 <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                   Your household typically needs a refill every <span className="font-bold text-plantry-sage"> {insights?.rhythm?.avgDaysBetweenTrips ?? "-"} days</span>. You are most efficient when you plan on <span className="font-bold text-plantry-sage"> {insights?.rhythm?.preferredDay ?? "-"} {insights?.rhythm?.preferredTime ?? ""}</span>
                 </p>
              </div>
           </div>
        </div>

        {/* Most Forgotten */}
        <div className="glass-card p-6">
           <h3 className="font-medium text-stone-900 dark:text-white mb-4 flex items-center gap-2">
             <AlertCircle size={18} className="text-orange-400" /> Frequently Forgotten
           </h3>
           <div className="space-y-3">
             {insights?.forgotten?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg">
                <span className="font-medium dark:text-stone-200">{item.name}</span>
                <span className="text-xs text-stone-500">
                  Missed in {item.percent}% of trips
                </span>
              </div>
            ))}
           </div>
        </div>

        {/* Pairs */}
        <div className="glass-card p-6">
           <h3 className="font-medium text-stone-900 dark:text-white mb-4 flex items-center gap-2">
             <Zap size={18} className="text-plantry-accent" /> Smart Pairs
           </h3>
           <p className="text-sm text-stone-500 mb-4">You almost always buy these together.</p>
           <div className="flex gap-2 overflow-x-auto pb-2">
                {insights?.pairs?.map((pair: string[], i: number) => (
                <div key={i} className="flex-shrink-0 px-4 py-3 bg-plantry-light dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl flex items-center gap-2">
                  <span className="font-serif dark:text-stone-200">{pair[0]}</span>
                  <span className="text-stone-400">+</span>
                  <span className="font-serif dark:text-stone-200">{pair[1]}</span>
                </div>
              ))}
           </div>
        </div>

      </div>
    </motion.div>
  );
};

// --- 9. Settings Page ---

export const SettingsPage: React.FC<{ isDarkMode?: boolean, toggleTheme?: () => void, onNavigate?: (p: any) => void }> = ({ isDarkMode, toggleTheme, onNavigate }) => {
  const [seasonalHints, setSeasonalHints] = useState(true);
  const [monthlyReminders, setMonthlyReminders] = useState(true);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-xl mx-auto pb-24">
      <SectionHeader title="Settings" />

      {/* Profile Card */}
      <div className="glass-card p-6 mb-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-plantry-sage rounded-full flex items-center justify-center text-white font-serif font-bold text-2xl">
          S
        </div>
        <div>
          <h3 className="font-serif text-2xl text-plantry-sageDark dark:text-white">Rajkumar Family</h3>
          <p className="text-stone-500">home@rajkumar.family</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Preferences */}
        <section>
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 ml-1">Preferences</h4>
          <div className="glass-card overflow-hidden">
             
             {/* Seasonal Hints Toggle */}
             <div className="p-4 flex items-center justify-between border-b border-stone-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                   <Sparkles size={20} className="text-plantry-accent" />
                   <div>
                      <p className="font-medium dark:text-stone-200">Seasonal Hints</p>
                      <p className="text-xs text-stone-500">Suggest mangoes in summer, etc.</p>
                   </div>
                </div>
                <button 
                  onClick={() => setSeasonalHints(!seasonalHints)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${seasonalHints ? 'bg-plantry-sage' : 'bg-stone-300'}`}
                >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${seasonalHints ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>

             {/* Monthly Reminders Toggle */}
             <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Clock size={20} className="text-blue-400" />
                   <div>
                      <p className="font-medium dark:text-stone-200">Monthly Restock</p>
                      <p className="text-xs text-stone-500">Remind me of staples every 30 days.</p>
                   </div>
                </div>
                <button 
                  onClick={() => setMonthlyReminders(!monthlyReminders)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${monthlyReminders ? 'bg-plantry-sage' : 'bg-stone-300'}`}
                >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${monthlyReminders ? 'left-7' : 'left-1'}`}></div>
                </button>
             </div>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 ml-1">Appearance</h4>
          <div className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon size={20} className="text-purple-400" /> : <Sun size={20} className="text-orange-400" />}
                  <span className="font-medium dark:text-stone-200">Dark Mode</span>
              </div>
              <button 
                  onClick={toggleTheme}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-plantry-sage' : 'bg-stone-300'}`}
                >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDarkMode ? 'left-7' : 'left-1'}`}></div>
              </button>
          </div>
        </section>

        {/* Data & Privacy */}
        <section>
           <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4 ml-1">Data & Privacy</h4>
           <div className="glass-card p-4">
              <div className="flex items-start gap-3">
                 <Shield size={20} className="text-green-600 mt-1" />
                 <div>
                    <p className="font-medium dark:text-stone-200 mb-1">Local-First Learning</p>
                    <p className="text-sm text-stone-500 leading-relaxed">
                       Plantry learns only from your household's data. We do not share your shopping habits with advertisers or third parties.
                    </p>
                 </div>
              </div>
           </div>
        </section>

        <button 
          onClick={() => onNavigate && onNavigate('auth')}
          className="w-full py-4 text-red-500 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
           <LogOut size={18} /> Sign Out
        </button>

      </div>
    </motion.div>
  );
};

// --- Navigation ---

export const BottomNavigation: React.FC<{ activePage: string, onNavigate: (p: any) => void }> = ({ activePage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'history', icon: Calendar, label: 'History' },
    { id: 'insights', icon: BarChart2, label: 'Insights' },
    { id: 'settings', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-lg border-t border-stone-200 dark:border-zinc-800 pb-safe pt-2 z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors w-16 ${isActive ? 'text-plantry-sageDark dark:text-plantry-cream' : 'text-stone-400 dark:text-zinc-600'}`}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              {isActive && (
                <motion.div layoutId="nav-indicator" className="w-1 h-1 bg-plantry-sage rounded-full mt-1" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  );
};