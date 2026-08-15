import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Flame, Search, CheckCircle, Clock, ArrowRight, RefreshCw, 
  Square, Circle, Bike, Rocket, ChevronLeft, ChevronRight, 
  Shield, Heart, Scale, Feather, RefreshCcw, 
  Mountain, Anchor, Sun, Waves, Dumbbell, Smile, ArrowLeft, Plus, Award,
  Target, Activity, Compass, LayoutDashboard, Settings, Moon, Smartphone, Trash2, Bell, ArrowUpCircle, Edit3, ListChecks,
  Sunrise, Sunset, Star, CloudSun, Check, Download, Calendar, BarChart2, TrendingUp, Sparkles, CheckSquare, Minus
} from 'lucide-react';

const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(880, ctx.currentTime); 
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.5); 
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05); 
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5); 
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } catch (error) {
    console.warn("Audio non supporté", error);
  }
};

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn("Erreur localStorage", error);
    }
  };

  return [storedValue, setValue];
}

const ModuleParametres = ({ onClose, themePref, setThemePref }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('mindset_notifs', true);
  const [fajrTime, setFajrTime] = useLocalStorage('mindset_fajr', '06:00');
  const [bilanTime, setBilanTime] = useLocalStorage('mindset_bilan', '21:00');
  const [history] = useLocalStorage('mindset_history', []);
  const [isExporting, setIsExporting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const last30Days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toDateString();
  });

  const handleExportData = () => {
    setIsExporting(true);
    let text = "=========================================\n";
    text += "      MON JOURNAL - MINDSET & PROCESS    \n";
    text += "=========================================\n";
    text += `Date d'export : ${new Date().toLocaleDateString('fr-FR')}\n\n`;

    if (history.length === 0) {
      text += "Aucun historique enregistré pour le moment.\n\n";
    } else {
      history.forEach(day => {
        text += `[ ${new Date(day.date).toLocaleDateString('fr-FR')} ]\n`;
        text += `- Habitudes : ${day.habitsScore} accomplies\n`;
        if (day.muhasabahScore) text += `- Bilan Caractère : ${day.muhasabahScore}%\n`;
        if (day.sabrObstacle) text += `- Obstacle : "${day.sabrObstacle}"\n\n`;
      });
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Mindset_Journal_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleResetApp = () => {
    if(!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
      return;
    }
    window.localStorage.clear();
    window.location.reload();
  };

  const recentHistory = history.slice(-7);

  return (
    <div className="absolute inset-0 z-50 bg-[#fdfbf7] flex flex-col animate-fade-in h-full overflow-hidden">
      <div className="p-4 border-b border-[#e8dfce] flex items-center shrink-0 bg-white">
        <button onClick={onClose} className="p-2 text-[#8c7b68] hover:bg-[#f5f0e6] rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-[#3e2f24] flex-1 text-center pr-10">Paramètres & Stats</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        <div className="bg-white p-4 rounded-2xl border border-[#e8dfce] shadow-sm">
          <div className="flex items-center space-x-2 mb-3 text-[#8c6b4a]">
            <TrendingUp size={18} />
            <h3 className="font-sans font-bold uppercase tracking-wider text-xs">Évolution (7 derniers bilans)</h3>
          </div>
          {recentHistory.length === 0 ? (
            <p className="text-xs text-[#8c7b68] italic text-center py-4">Effectue tes bilans quotidiens pour voir ta courbe de progression ici.</p>
          ) : (
            <div className="h-32 w-full pt-4">
              <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                <line x1="0" y1="0" x2="300" y2="0" stroke="#f2efe9" strokeWidth="1" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#f2efe9" strokeWidth="1" />
                <line x1="0" y1="100" x2="300" y2="100" stroke="#f2efe9" strokeWidth="1" />
                <path 
                  d={recentHistory.reduce((acc, curr, idx) => {
                    const x = (idx / (Math.max(recentHistory.length - 1, 1))) * 280 + 10;
                    const y = 100 - (curr.muhasabahScore || 0);
                    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
                  }, '')} 
                  fill="none" 
                  stroke="#8c6b4a" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                {recentHistory.map((curr, idx) => {
                  const x = (idx / (Math.max(recentHistory.length - 1, 1))) * 280 + 10;
                  const y = 100 - (curr.muhasabahScore || 0);
                  return <circle key={idx} cx={x} cy={y} r="4" fill="#5e8c61" stroke="#fff" strokeWidth="2" />;
                })}
              </svg>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e8dfce] shadow-sm">
          <div className="flex items-center space-x-2 mb-4 text-[#8c6b4a]">
            <Calendar size={18} />
            <h3 className="font-sans font-bold uppercase tracking-wider text-xs">Constance (30 derniers jours)</h3>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-start">
            {last30Days.map((dateStr, idx) => {
              const dayData = history.find(h => h.date === dateStr);
              let opacity = "opacity-20";
              if (dayData && dayData.habitsScore > 0) {
                opacity = dayData.habitsScore >= 4 ? "opacity-100" : (dayData.habitsScore >= 2 ? "opacity-60" : "opacity-40");
              }
              return (
                <div key={idx} className={`w-6 h-6 rounded bg-[#5e8c61] ${opacity} border border-[#4a704d]/20 flex items-center justify-center`} title={new Date(dateStr).toLocaleDateString('fr-FR')}></div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e8dfce] shadow-sm">
          <div className="flex items-center space-x-2 mb-4 text-[#8c6b4a]">
            <Moon size={18} />
            <h3 className="font-sans font-bold uppercase tracking-wider text-xs">Apparence & Thème</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setThemePref('auto')} className={`p-2 rounded-xl border flex flex-col items-center space-y-2 transition-all ${themePref === 'auto' ? 'bg-[#fdfbf7] border-[#8c6b4a]' : 'bg-white border-[#e8dfce]'}`}>
              <Clock size={18} className="text-[#8c7b68] mt-1" />
              <span className="text-[10px] font-sans font-bold text-[#4a3f35]">Auto</span>
            </button>
            <button onClick={() => setThemePref('parchemin')} className={`p-2 rounded-xl border flex flex-col items-center space-y-2 transition-all ${themePref === 'parchemin' ? 'bg-[#fdfbf7] border-[#8c6b4a]' : 'bg-white border-[#e8dfce]'}`}>
              <div className="w-5 h-5 rounded-full bg-[#f5f0e6] border border-[#e8dfce]"></div>
              <span className="text-[10px] font-sans font-bold text-[#4a3f35]">Parchemin</span>
            </button>
            <button onClick={() => setThemePref('sombre')} className={`p-2 rounded-xl border flex flex-col items-center space-y-2 transition-all ${themePref === 'sombre' ? 'bg-[#2a2420] border-[#b08d57]' : 'bg-white border-[#e8dfce]'}`}>
              <div className="w-5 h-5 rounded-full bg-[#3e3e4a] border border-[#2a2a35]"></div>
              <span className="text-[10px] font-sans font-bold text-[#8c6b4a]">Sombre</span>
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#e8dfce] shadow-sm space-y-2">
           <div className="flex items-center space-x-2 mb-4 text-[#8c6b4a]">
            <Smartphone size={18} />
            <h3 className="font-sans font-bold uppercase tracking-wider text-xs">Données & Système</h3>
          </div>
          <button onClick={handleExportData} className="w-full flex items-center justify-between p-3 rounded-xl bg-[#fdfbf7] border border-[#e8dfce] text-[#4a3f35] hover:bg-[#f5f0e6]">
            <span className="text-sm font-sans font-medium">{isExporting ? 'Exportation...' : 'Exporter mon journal (.txt)'}</span>
            {isExporting ? <CheckCircle size={16} className="text-[#5e8c61]"/> : <Download size={16} className="text-[#8c7b68]" />}
          </button>
          <button onClick={handleResetApp} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors ${resetConfirm ? 'bg-[#c25e5e] border-[#c25e5e] text-white' : 'bg-[#fff5f5] border-[#ffdddd] text-[#c25e5e]'}`}>
            <span className="text-sm font-sans font-medium">{resetConfirm ? 'Confirmer la suppression ?' : 'Réinitialiser l\'application'}</span>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ModuleIkhlas = () => {
  const [step, setStep] = useState('welcome'); 
  const [intention, setIntention] = useState('');
  const [task, setTask] = useState('');
  const [streak, setStreak] = useLocalStorage('mindset_ikhlas_streak', 0);
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const intentionSuggestions = [
    "Plaire à Allah par l'excellence",
    "Aider et subvenir aux miens",
    "Apporter de la valeur à la communauté",
  ];

  const focusWisdoms = [
    "Certes, les actions ne valent que par leurs intentions. — Al-Boukhari & Mouslim",
    "Le meilleur travail est celui qui est accompli avec constance et sincérité. — Hadith",
    "Fais de ton mieux et place ta confiance en Allah. — Sagesse"
  ];

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      playChime(); 
      setIsActive(false);
      setStep('success');
      setStreak((prev) => prev + 1);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, setStreak]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const startTimer = (mins) => {
    setDuration(mins);
    setTimeLeft(mins * 60);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-4 sm:p-6 relative">
      <div className="absolute top-4 left-4 flex items-center space-x-2 text-[#b08d57] z-10">
        <Flame size={16} className={streak > 0 ? "text-orange-500 fill-orange-500" : ""} />
        <span className="font-semibold text-[10px] tracking-widest uppercase">Série : {streak} J</span>
      </div>

      <div className="flex-1 flex flex-col justify-between items-center w-full max-w-sm mx-auto h-full pt-8 pb-4">
        {step === 'welcome' && (
          <div className="w-full flex-1 flex flex-col items-center justify-center space-y-6 animate-fade-in">
            <BookOpen size={40} className="text-[#b08d57]" strokeWidth={1.5} />
            <h1 className="text-2xl font-bold text-[#3e2f24] tracking-wide">Al-Ikhlas</h1>
            <div className="bg-[#f5f0e6] p-4 rounded-2xl border border-[#e8dfce]">
              <p className="text-sm italic text-[#6b5a48] leading-relaxed mb-2">« Certes, les actions ne valent que par leurs intentions... »</p>
              <p className="text-[10px] text-[#8c7b68] font-sans uppercase tracking-widest">- Al-Boukhari & Mouslim -</p>
            </div>
            <button onClick={() => setStep('niyyah')} className="w-full bg-[#8c6b4a] hover:bg-[#7a5c3f] text-white py-3.5 rounded-xl flex justify-center items-center space-x-2 font-sans font-medium mt-auto">
              <span>Poser mon intention</span> <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 'niyyah' && (
          <div className="w-full flex-1 flex flex-col animate-fade-in h-full">
            <div className="text-center mb-3 shrink-0">
              <h2 className="text-xl font-bold text-[#3e2f24] mb-1">Ta Niyyah du Jour</h2>
              <p className="text-[#6b5a48] text-xs">Pourquoi fais-tu les choses aujourd'hui ?</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mb-3 shrink-0">
              {intentionSuggestions.map((sug, idx) => (
                <button key={idx} onClick={() => setIntention(sug)} className="bg-[#f5f0e6] hover:bg-[#e8dfce] text-[#6b5a48] text-[10px] px-3 py-1.5 rounded-full border border-[#e8dfce]">{sug}</button>
              ))}
            </div>
            <textarea value={intention} onChange={(e) => setIntention(e.target.value)} placeholder="Écris ton intention personnelle ici..." className="w-full flex-1 bg-[#fdfbf7] border-2 border-[#e8dfce] rounded-xl p-4 text-[#4a3f35] focus:border-[#b08d57] resize-none font-sans outline-none text-sm shadow-inner mb-3" />
            <button onClick={() => setIntention(focusWisdoms[Math.floor(Math.random() * focusWisdoms.length)])} className="mb-3 text-[10px] text-[#8c6b4a] font-sans font-bold flex items-center justify-center space-x-1 hover:underline">
              <Sparkles size={12} /> <span>Piocher une sagesse d'intention</span>
            </button>
            <button onClick={() => setStep('task')} disabled={!intention.trim()} className="w-full shrink-0 bg-[#8c6b4a] hover:bg-[#7a5c3f] disabled:bg-[#d4c8b8] text-white py-3.5 rounded-xl font-sans font-medium transition-colors">Continuer</button>
          </div>
        )}

        {step === 'task' && (
          <div className="w-full flex-1 flex flex-col animate-fade-in text-center h-full">
            <div className="shrink-0 mb-4">
              <Search size={32} className="text-[#b08d57] mx-auto mb-2" strokeWidth={1.5} />
              <h2 className="text-xl font-bold text-[#3e2f24] mb-1">La Loi du Focus</h2>
              <p className="text-[#6b5a48] text-xs">Concentre ton énergie sur <b>une seule chose</b>.</p>
            </div>
            <input type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder="Quelle est ton unique priorité ?" className="w-full shrink-0 bg-[#fdfbf7] border-2 border-[#e8dfce] rounded-xl p-4 text-[#4a3f35] focus:border-[#b08d57] font-sans text-center outline-none text-sm shadow-inner mb-6" />
            <div className="space-y-3 shrink-0 mb-auto">
              <p className="text-[10px] font-sans font-bold text-[#8c7b68] uppercase tracking-wider">Durée de la session</p>
              <div className="flex justify-center space-x-2">
                {[15, 25, 50].map((mins) => (
                  <button key={mins} onClick={() => startTimer(mins)} className={`px-4 py-2 rounded-lg font-sans text-sm font-medium transition-colors border-2 ${duration === mins ? 'border-[#8c6b4a] bg-[#8c6b4a] text-white' : 'border-[#e8dfce] bg-[#f5f0e6] text-[#6b5a48]'}`}>{mins}m</button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep('focus')} disabled={!task.trim()} className="w-full shrink-0 bg-[#8c6b4a] hover:bg-[#7a5c3f] disabled:bg-[#d4c8b8] text-white py-3.5 rounded-xl flex justify-center items-center space-x-2 font-sans font-medium transition-colors mt-4">
              <span>Allumer la flamme</span> <Flame size={16} />
            </button>
          </div>
        )}

        {step === 'focus' && (
          <div className="w-full flex-1 flex flex-col items-center justify-between animate-fade-in h-full py-4">
            <div className="w-full bg-[#f5f0e6] p-4 rounded-xl border border-[#e8dfce] border-l-4 border-l-[#b08d57] text-left shrink-0">
              <p className="text-[10px] uppercase tracking-widest text-[#8c7b68] mb-1 font-sans font-bold">Ton intention</p>
              <p className="text-sm italic text-[#4a3f35] line-clamp-2">« {intention} »</p>
            </div>
            <div className="text-center flex-1 flex flex-col justify-center">
              <h3 className="text-lg font-bold text-[#3e2f24] mb-2 px-2 line-clamp-2">{task}</h3>
              <div className="text-6xl font-sans font-light tracking-tighter text-[#2a1f18] py-2">{formatTime(timeLeft)}</div>
            </div>
            <button onClick={() => setIsActive(!isActive)} className={`w-full shrink-0 py-3.5 rounded-xl font-sans font-medium text-white flex justify-center items-center space-x-2 transition-colors ${isActive ? 'bg-[#c25e5e]' : 'bg-[#8c6b4a]'}`}>
              <Clock size={16} /> <span>{isActive ? 'Mettre en pause' : 'Commencer le Focus'}</span>
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="w-full flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
            <CheckCircle size={56} className="text-[#5e8c61] mb-2" strokeWidth={1.5} />
            <h2 className="text-2xl font-bold text-[#3e2f24]">Alhamdulillah</h2>
            <p className="text-[#6b5a48] text-sm">Tâche accomplie avec concentration.</p>
            <button onClick={() => {setStep('welcome'); setIntention(''); setTask(''); setTimeLeft(25 * 60); setIsActive(false);}} className="w-full border-2 border-[#8c6b4a] text-[#8c6b4a] py-3.5 rounded-xl font-sans font-medium flex justify-center items-center space-x-2 mt-8">
              <RefreshCw size={16} /> <span>Nouvelle session</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const defaultTimeline = [
  { id: 'fajr', time: 'Aube', slot: 'fajr', iconName: 'Sunrise', title: 'Fajr & Adhkar', desc: 'Prière à l\'heure et invocations du matin', completed: false, isSunnah: true },
  { id: 'duha', time: 'Matinée', slot: 'duha', iconName: 'Sun', title: 'Salat Ad-Duha', desc: 'Prière de l\'avant-midi (2 à 8 Raka\'at)', completed: false, isSunnah: true },
  { id: 'qaylulah', time: 'Midi', slot: 'qaylulah', iconName: 'Clock', title: 'Qaylûlah', desc: 'Sieste ou repos réparateur de midi', completed: false, isSunnah: true },
  { id: 'asr', time: 'Après-midi', slot: 'asr', iconName: 'BookOpen', title: 'Asr & Savoir', desc: 'Prière, Apprentissage, Lecture', completed: false, isSunnah: true },
  { id: 'maghrib', time: 'Soir', slot: 'maghrib', iconName: 'Sunset', title: 'Maghrib & Famille', desc: 'Repas et temps avec les siens', completed: false, isSunnah: true },
  { id: 'witr', time: 'Nuit', slot: 'witr', iconName: 'Star', title: 'Isha & Witr', desc: 'Clôturer par la prière impaire', completed: false, isSunnah: true }
];

const Icons = { Sunrise, Sun, Clock, BookOpen, Sunset, Star };

const ModuleIstiqamah = () => {
  const [timeline, setTimeline] = useLocalStorage('mindset_timeline', defaultTimeline);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlot, setNewSlot] = useState('duha');
  const [newDesc, setNewDesc] = useState('');

  const toggleHabit = (id) => {
    setTimeline(timeline.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleAddCustomHabit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const timeSlotsMap = { fajr: 'Aube', duha: 'Matinée', qaylulah: 'Midi', asr: 'Après-midi', maghrib: 'Soir', witr: 'Nuit' };
    const newItem = {
      id: 'custom-' + Date.now(),
      time: timeSlotsMap[newSlot] || 'Personnalisé',
      slot: newSlot,
      iconName: 'Sun',
      title: newTitle.trim(),
      desc: newDesc.trim() || 'Habitude personnelle',
      completed: false,
      isSunnah: false
    };
    setTimeline([...timeline, newItem]);
    setNewTitle('');
    setNewDesc('');
    setIsAdding(false);
  };

  const score = timeline.filter(t => t.completed).length;
  const progress = Math.round((score / Math.max(timeline.length, 1)) * 100);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fdfbf7] relative">
      <div className="p-4 border-b border-[#e8dfce] shrink-0 bg-white relative flex items-center justify-between">
        <button onClick={() => setIsAdding(true)} className="p-2 bg-[#f5f0e6] text-[#8c6b4a] rounded-full hover:bg-[#e8dfce] transition-colors"><Plus size={18}/></button>
        <div className="text-center flex-1 px-2">
          <p className="text-[10px] uppercase tracking-widest text-[#8c6b4a] font-sans font-bold mb-1">Al-Istiqamah</p>
          <h1 className="text-lg font-bold text-[#3e2f24]">Timeline Prophétique</h1>
        </div>
        <div className="w-10 h-10 rounded-full border-4 border-[#e8dfce] flex items-center justify-center relative shrink-0">
           <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="16" cy="16" r="16" stroke="transparent" strokeWidth="4" fill="none" />
              <circle cx="16" cy="16" r="16" stroke="#5e8c61" strokeWidth="4" fill="none" strokeDasharray="100" strokeDashoffset={100 - progress} className="transition-all duration-500" />
           </svg>
           <span className="font-sans font-bold text-[10px] text-[#3e2f24] relative z-10">{score}/{timeline.length}</span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-8 relative">
        <div className="absolute left-[39px] top-8 bottom-8 w-[2px] bg-[#e8dfce] z-0" />
        
        <div className="space-y-6">
          {timeline.map((item) => {
            const IconComp = Icons[item.iconName] || Circle;
            return (
              <div key={item.id} className="relative flex items-start group">
                <button 
                  onClick={() => toggleHabit(item.id)} 
                  className={`relative z-10 w-10 h-10 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 shadow-sm shrink-0 mt-2 ${item.completed ? 'bg-[#5e8c61] border-[#5e8c61] text-white' : 'bg-[#fdfbf7] border-[#8c6b4a] text-[#8c6b4a]'}`}
                >
                  {item.completed ? <Check size={18} strokeWidth={3} /> : <IconComp size={18} />}
                </button>
                
                <div className={`ml-4 flex-1 bg-white p-4 rounded-2xl border transition-all duration-300 ${item.completed ? 'border-[#5e8c61] bg-[#f9fbf9]' : 'border-[#e8dfce]'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-sm text-[#3e2f24]">{item.title}</h3>
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-[#a99c8f] bg-[#f5f0e6] px-2 py-0.5 rounded-full">{item.time}</span>
                  </div>
                  <p className="text-xs text-[#8c7b68] leading-snug">{item.desc}</p>
                  {item.isSunnah && (
                    <div className="mt-2 inline-flex items-center text-[9px] text-[#b08d57] font-sans font-bold uppercase">
                      <Star size={10} className="mr-1" /> Sunnah
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAdding && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 border border-[#e8dfce] shadow-2xl animate-fade-in">
            <h3 className="text-lg font-bold text-[#3e2f24] mb-4">Ajouter une habitude</h3>
            <form onSubmit={handleAddCustomHabit} className="space-y-4">
              <div>
                <label className="text-[10px] font-sans font-bold text-[#8c7b68] uppercase">Nom de l'habitude</label>
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Lecture de Coran..." className="w-full mt-1 bg-[#f5f0e6] border border-[#e8dfce] rounded-xl p-3 text-sm text-[#4a3f35] outline-none" required />
              </div>
              <div>
                <label className="text-[10px] font-sans font-bold text-[#8c7b68] uppercase">Moment de la journée</label>
                <select value={newSlot} onChange={(e) => setNewSlot(e.target.value)} className="w-full mt-1 bg-[#f5f0e6] border border-[#e8dfce] rounded-xl p-3 text-sm text-[#4a3f35] outline-none font-sans">
                  <option value="fajr">Aube (Fajr)</option>
                  <option value="duha">Matinée</option>
                  <option value="qaylulah">Midi</option>
                  <option value="asr">Après-midi</option>
                  <option value="maghrib">Soir</option>
                  <option value="witr">Nuit</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-sans font-bold text-[#8c7b68] uppercase">Description (optionnel)</label>
                <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Ex: 15 pages par jour" className="w-full mt-1 bg-[#f5f0e6] border border-[#e8dfce] rounded-xl p-3 text-sm text-[#4a3f35] outline-none" />
              </div>
              <div className="flex space-x-2 pt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-white border border-[#e8dfce] text-[#8c7b68] py-3 rounded-xl font-sans font-medium">Annuler</button>
                <button type="submit" className="flex-1 bg-[#8c6b4a] text-white py-3 rounded-xl font-sans font-medium">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ModuleMuhasabah = () => {
  const [step, setStep] = useLocalStorage('mindset_muhasabah_step', 'intro');
  const [currentVirtueIndex, setCurrentVirtueIndex] = useState(0);
  const [ratings, setRatings] = useLocalStorage('mindset_muhasabah_ratings', { hilm: 0, rifq: 0, sidq: 0, tawadu: 0 });
  const [notes, setNotes] = useLocalStorage('mindset_muhasabah_notes', { hilm: '', rifq: '', sidq: '', tawadu: '' });

  const virtues = [
    { id: 'hilm', name: 'Maîtrise', desc: 'Contrôle de la colère ?', icon: Shield, levels: ['Perdu patience', 'Irrité', 'Neutre', 'Calme', 'Excellente maîtrise'], quote: { text: "Le fort n'est pas celui qui terrasse les gens, mais celui qui se maîtrise lors de la colère.", source: "Hadith (Al-Boukhari & Mouslim)" } },
    { id: 'rifq', name: 'Douceur', desc: 'Bienveillance envers autrui ?', icon: Heart, levels: ['Dur(e)', 'Froid(e)', 'Correct(e)', 'Avenant(e)', 'Très doux(ce)'], quote: { text: "La douceur n'a jamais embelli une chose sans que son absence ne l'enlaidisse.", source: "Hadith (Mouslim)" } },
    { id: 'sidq', name: 'Véracité', desc: 'Paroles et actes justes ?', icon: Scale, levels: ['Mensonge', 'Exagération', 'Silencieux', 'Honnête', 'Droiture totale'], quote: { text: "Certes, la véracité mène à la piété, et la piété mène au Paradis.", source: "Hadith (Al-Boukhari & Mouslim)" } },
    { id: 'tawadu', name: 'Humilité', desc: 'Évité l\'arrogance ?', icon: Feather, levels: ['Orgueilleux', 'Prétentieux', 'Normal', 'Modeste', 'Pleine humilité'], quote: { text: "Quiconque fait preuve d'humilité pour l'amour d'Allah, Allah l'élève.", source: "Hadith (Mouslim)" } }
  ];

  const calculateScore = () => Math.round((Object.values(ratings).reduce((a, b) => a + b, 0) / 20) * 100);
  const v = virtues[currentVirtueIndex];
  const Icon = v?.icon;
  const currentRating = ratings[v?.id];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fdfbf7]">
      <div className="p-4 border-b border-[#e8dfce] text-center shrink-0">
        <p className="text-[10px] uppercase tracking-widest text-[#8c6b4a] font-sans font-bold mb-1">Al-Muhasabah</p>
        <h1 className="text-xl font-bold text-[#3e2f24]">Bilan du Caractère</h1>
      </div>

      {step === 'intro' && (
        <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
           <BookOpen size={48} className="text-[#b08d57] mb-6" />
           <p className="text-sm italic text-[#4a3f35] mb-8">« Jugez-vous vous-mêmes avant d'être jugés... »<br/><span className="text-[10px] font-sans font-bold uppercase mt-2 block text-[#8c7b68]">— 'Umar ibn al-Khattab</span></p>
           <button onClick={() => {setStep('eval'); setCurrentVirtueIndex(0);}} className="w-full bg-[#8c6b4a] text-white py-3.5 rounded-xl font-sans font-medium">Commencer l'évaluation</button>
        </div>
      )}

      {step === 'eval' && (
        <div className="flex-1 flex flex-col h-full p-4 animate-fade-in">
          <div className="flex justify-center space-x-1.5 mb-6 shrink-0">
             {virtues.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentVirtueIndex ? 'w-6 bg-[#8c6b4a]' : i < currentVirtueIndex ? 'w-2 bg-[#5e8c61]' : 'w-2 bg-[#e8dfce]'}`} />)}
          </div>

          <div className="flex-1 flex flex-col bg-white p-5 rounded-2xl border border-[#e8dfce] shadow-sm mb-4">
            <div className="flex items-center space-x-3 mb-2 shrink-0">
              <div className={`p-2 rounded-lg ${currentRating > 0 ? 'bg-[#8c6b4a] text-white' : 'bg-[#f5f0e6] text-[#8c6b4a]'}`}><Icon size={20} /></div>
              <h3 className="font-bold text-lg text-[#3e2f24]">{v.name}</h3>
            </div>
            <p className="text-sm text-[#8c7b68] mb-6 italic shrink-0">{v.desc}</p>
            
            <div className="space-y-3 shrink-0 mb-4">
              <div className="flex justify-between relative px-2">
                <div className="absolute top-1/2 left-2 right-2 h-1 bg-[#f2efe9] -translate-y-1/2 rounded-full z-0"></div>
                <div className="absolute top-1/2 left-2 h-1 bg-[#8c6b4a] -translate-y-1/2 rounded-full z-0 transition-all" style={{ width: currentRating > 0 ? `${((currentRating - 1) / 4) * 100}%` : '0%' }}></div>
                {[1, 2, 3, 4, 5].map((val) => (
                  <button key={val} onClick={() => setRatings({...ratings, [v.id]: val})} className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center ${currentRating >= val ? 'bg-[#8c6b4a] border-[#8c6b4a]' : 'bg-[#fdfbf7] border-[#e8dfce]'}`}>
                    <div className={`w-2 h-2 rounded-full ${currentRating >= val ? 'bg-white' : 'bg-transparent'}`} />
                  </button>
                ))}
              </div>
              <div className="text-center h-4">
                <span className="text-[11px] font-sans font-bold text-[#8c6b4a] uppercase tracking-wide">{currentRating > 0 ? v.levels[currentRating - 1] : ''}</span>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col animate-fade-in mt-1">
               <textarea value={notes[v.id]} onChange={(e) => setNotes({...notes, [v.id]: e.target.value})} placeholder="Une note pour ton journal (optionnel)..." className="flex-1 w-full bg-[#fdfbf7] border border-[#e8dfce] rounded-xl p-3 text-sm text-[#4a3f35] focus:border-[#b08d57] outline-none resize-none shadow-inner" />
            </div>
          </div>

          <div className="shrink-0 flex space-x-3">
             <button onClick={() => currentVirtueIndex > 0 && setCurrentVirtueIndex(prev => prev - 1)} disabled={currentVirtueIndex === 0} className="w-14 bg-white border border-[#e8dfce] disabled:opacity-30 text-[#8c7b68] flex justify-center items-center rounded-xl"><ArrowLeft size={20}/></button>
             <button onClick={() => currentVirtueIndex < virtues.length - 1 ? setCurrentVirtueIndex(prev => prev + 1) : setStep('result')} disabled={currentRating === 0} className="flex-1 bg-[#8c6b4a] disabled:bg-[#d4c8b8] text-white py-3.5 rounded-xl font-sans font-medium flex justify-center items-center space-x-2">
               <span>{currentVirtueIndex === virtues.length - 1 ? 'Terminer' : 'Suivant'}</span> <ArrowRight size={18}/>
             </button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div className="flex-1 flex flex-col justify-center items-center p-6 text-center animate-fade-in overflow-y-auto">
          <div className="relative mb-4 shrink-0">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="#f2efe9" strokeWidth="6" fill="none" />
              <circle cx="56" cy="56" r="48" stroke="#8c6b4a" strokeWidth="6" fill="none" strokeDasharray="301" strokeDashoffset={301 - (calculateScore() / 100) * 301} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-sans font-extrabold text-2xl text-[#3e2f24]">{calculateScore()}%</span>
            </div>
          </div>

          <div className="bg-white border border-[#e8dfce] p-4 rounded-2xl mb-6 shadow-sm w-full text-left">
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-[#8c6b4a] mb-1">Rappel du Bilan</p>
            <p className="text-xs italic text-[#4a3f35] mb-2">« {virtues[Math.floor(Math.random() * virtues.length)].quote.text} »</p>
            <p className="text-[9px] font-sans font-bold text-[#a99c8f] uppercase">— {virtues[0].quote.source}</p>
          </div>

          <button onClick={() => {setRatings({hilm:0,rifq:0,sidq:0,tawadu:0}); setNotes({hilm:'',rifq:'',sidq:'',tawadu:''}); setStep('intro'); setCurrentVirtueIndex(0);}} className="w-full border-2 border-[#8c6b4a] text-[#8c6b4a] py-3.5 rounded-xl font-sans font-medium">Recommencer</button>
        </div>
      )}
    </div>
  );
};

const islamicWisdoms = [
  { text: "Ce qui t'a manqué ne t'était pas destiné, et ce qui t'a atteint ne pouvait te manquer.", source: "Hadith (At-Tirmidhi)" },
  { text: "À côté de la difficulté est, certes, une facilité !", source: "Coran (94:5)" },
  { text: "Il se peut que vous détestiez une chose alors qu'elle est un bien pour vous.", source: "Coran (2:216)" },
  { text: "Allah n'impose à aucune âme une charge supérieure à sa capacité.", source: "Coran (2:286)" },
  { text: "Et quiconque place sa confiance en Allah, Il lui suffit.", source: "Coran (65:3)" },
  { text: "Nul malheur n'atteint la terre ni vos personnes, qui ne soit enregistré dans un Livre avant que Nous ne l'ayons créé.", source: "Coran (57:22)" },
  { text: "Ne vous laissez pas battre, ne vous affligez pas alors que vous êtes les supérieurs, si vous êtes de vrais croyants.", source: "Coran (3:139)" },
  { text: "Ô vous qui croyez ! Cherchez secours dans l'endurance et la prière. Car Allah est avec ceux qui sont endurants.", source: "Coran (2:153)" },
  { text: "Et sois patient. Car Allah ne laisse pas perdre la récompense des gens bienfaisants.", source: "Coran (11:115)" },
  { text: "Très certainement, Nous vous éprouverons par un peu de peur, de faim et de diminution de biens... Et fais la bonne annonce aux endurants.", source: "Coran (2:155)" }
];

const ModuleSabr = () => {
  const [step, setStep] = useLocalStorage('mindset_sabr_step', 'intro');
  const [obstacle, setObstacle] = useLocalStorage('mindset_sabr_obstacle', '');
  const [lesson, setLesson] = useLocalStorage('mindset_sabr_lesson', '');
  const [isEditingObstacle, setIsEditingObstacle] = useState(false);

  const generateLocalLesson = () => {
    const randomIndex = Math.floor(Math.random() * islamicWisdoms.length);
    const selected = islamicWisdoms[randomIndex];
    setLesson(`« ${selected.text} »\n\n${selected.source}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fdfbf7]">
      <div className="p-4 border-b border-[#e8dfce] text-center shrink-0 bg-white">
        <p className="text-[10px] uppercase tracking-widest text-[#8c6b4a] font-sans font-bold mb-1">As-Sabr</p>
        <h1 className="text-xl font-bold text-[#3e2f24]">Plan vs Réalité</h1>
      </div>

      <div className="flex-1 flex flex-col p-5 h-full">
        {step === 'intro' && (
          <div className="flex-1 flex flex-col justify-between items-center text-center animate-fade-in py-4">
            <Mountain size={40} className="text-[#b08d57] mb-4 shrink-0" strokeWidth={1.5} />
            <div className="w-full space-y-6 shrink-0 my-auto">
              <div>
                <p className="text-[10px] font-sans font-bold text-[#8c7b68] uppercase text-left pl-1 mb-1">Ton Plan</p>
                <svg viewBox="0 -10 120 40" className="w-full h-auto stroke-[#8c6b4a] fill-none">
                  <line x1="10" y1="20" x2="110" y2="20" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="20" cy="18" r="2.5" fill="#8c6b4a" stroke="none" />
                  <line x1="110" y1="20" x2="110" y2="-5" strokeWidth="1.5" />
                  <rect x="100" y="-5" width="10" height="8" fill="#8c6b4a" stroke="none" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-sans font-bold text-[#8c7b68] uppercase text-left pl-1 mb-1">La Réalité</p>
                <svg viewBox="0 -10 120 60" className="w-full h-auto stroke-[#8c6b4a] fill-none">
                  <path d="M 10 20 L 20 20 C 25 35, 30 35, 35 20 C 40 0, 45 0, 50 20 L 55 20 C 60 55, 75 55, 80 20 L 86 0 L 92 25 L 100 -10 L 110 -10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="16" cy="18" r="2.5" fill="#8c6b4a" stroke="none" />
                  <line x1="110" y1="-10" x2="110" y2="-40" strokeWidth="1.5" />
                  <rect x="100" y="-40" width="10" height="8" fill="#8c6b4a" stroke="none" />
                </svg>
              </div>
            </div>
            <button onClick={() => setStep('obstacle')} className="w-full shrink-0 bg-[#8c6b4a] text-white py-3.5 rounded-xl font-sans font-medium mt-4">Identifier un obstacle</button>
          </div>
        )}

        {step === 'obstacle' && (
          <div className="flex-1 flex flex-col animate-fade-in text-center h-full">
            <Anchor size={32} className="mx-auto text-[#8c7b68] mb-2 shrink-0" strokeWidth={1.5} />
            <h2 className="text-xl font-bold text-[#3e2f24] mb-1 shrink-0">Le Poids</h2>
            <p className="text-xs text-[#6b5a48] mb-4 shrink-0">Qu'est-ce qui t'a ralenti ou frustré aujourd'hui ?</p>
            <textarea value={obstacle} onChange={(e) => setObstacle(e.target.value)} placeholder="Ex: J'avais prévu d'avancer, mais..." className="flex-1 w-full bg-[#fdfbf7] border-2 border-[#e8dfce] rounded-xl p-4 font-sans text-sm outline-none resize-none shadow-inner focus:border-[#b08d57] mb-4" />
            <button onClick={() => setStep('reframe')} disabled={!obstacle.trim()} className="w-full shrink-0 bg-[#8c6b4a] disabled:bg-[#d4c8b8] text-white py-3.5 rounded-xl font-sans font-medium">Continuer</button>
          </div>
        )}

        {step === 'reframe' && (
          <div className="flex-1 flex flex-col animate-fade-in text-center h-full">
            <Sun size={32} className="mx-auto text-[#b08d57] mb-2 shrink-0" strokeWidth={1.5} />
            <h2 className="text-xl font-bold text-[#3e2f24] mb-1 shrink-0">La Lumière</h2>
            
            <div className="bg-[#fdfbf7] border border-[#e8dfce] p-3 rounded-xl mb-3 text-left relative shrink-0">
              <div className="flex justify-between items-center mb-1">
                 <p className="text-[10px] font-sans uppercase font-bold text-[#8c7b68]">L'Obstacle :</p>
                 <button onClick={() => setIsEditingObstacle(!isEditingObstacle)} className="text-[#a99c8f]"><Edit3 size={12} /></button>
              </div>
              {isEditingObstacle ? (
                 <textarea value={obstacle} onChange={(e) => setObstacle(e.target.value)} onBlur={() => setIsEditingObstacle(false)} autoFocus className="w-full bg-white border border-[#b08d57] rounded p-2 text-xs italic font-sans outline-none resize-none h-16" />
              ) : (
                 <p className="text-xs italic text-[#4a3f35] line-clamp-2">"{obstacle}"</p>
              )}
            </div>

            <textarea value={lesson} onChange={(e) => setLesson(e.target.value)} placeholder="Écris ta propre leçon, ou demande à piocher une sagesse ci-dessous..." className="flex-1 w-full bg-white border-2 border-[#b08d57] rounded-xl p-4 font-sans text-sm outline-none resize-none shadow-sm mb-3" />
            
            <button onClick={generateLocalLesson} disabled={!obstacle.trim()} className="w-full shrink-0 bg-[#f5f0e6] text-[#8c6b4a] border border-[#e8dfce] py-3 rounded-xl font-sans font-medium mb-3 flex justify-center items-center space-x-2 hover:bg-[#e8dfce] transition-colors">
              <Feather size={16} />
              <span className="text-sm">Trouver l'inspiration (Sagesse)</span>
            </button>

            <button onClick={() => setStep('success')} disabled={!lesson.trim() || !obstacle.trim()} className="w-full shrink-0 bg-[#8c6b4a] disabled:bg-[#d4c8b8] text-white py-3.5 rounded-xl font-sans font-medium">Ancrer la leçon</button>
          </div>
        )}

        {step === 'success' && (
          <div className="flex-1 flex flex-col justify-center items-center text-center animate-fade-in">
             <div className="bg-[#5e8c61] text-white p-5 rounded-full shadow-lg mb-4"><Feather size={32} /></div>
             <h2 className="text-xl font-bold text-[#3e2f24] mb-2">Obstacle Recadré</h2>
             <p className="text-xs text-[#6b5a48] mb-8">Ton effort a été sauvegardé. La résilience est un travail interne.</p>
            <button onClick={() => {setObstacle(''); setLesson(''); setStep('intro');}} className="w-full border-2 border-[#8c6b4a] text-[#8c6b4a] py-3.5 rounded-xl font-sans font-medium flex justify-center items-center space-x-2">
              <RefreshCcw size={16} /> <span>Nouveau recadrage</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ModuleIhsan = () => {
  const [pillarActions, setPillars] = useLocalStorage('mindset_ihsan', { savoir: [], solidite: [], serenite: [], sourire: [] });
  const [active, setActive] = useState(null);
  const [newActionInput, setNewActionInput] = useState('');
  const [activeQuote, setActiveQuote] = useState({ text: "", source: "" });

  const pillarQuotes = {
    savoir: [{ text: "La quête du savoir est une obligation pour chaque musulman.", source: "Hadith (Ibn Majah)" }],
    solidite: [{ text: "Le croyant fort est meilleur et plus aimé d'Allah que le croyant faible.", source: "Hadith (Mouslim)" }],
    serenite: [{ text: "N'est-ce point par l'évocation d'Allah que se tranquillisent les cœurs ?", source: "Coran (13:28)" }],
    sourire: [{ text: "Ton sourire vis-à-vis de ton frère est une aumône.", source: "Hadith (At-Tirmidhi)" }]
  };

  const data = {
    savoir: { id: 'savoir', name: 'Savoir-Faire', arabic: '‘Ilm', icon: BookOpen, bg: "bg-[#f5f0e6]", color: "text-[#8c6b4a]" },
    solidite: { id: 'solidite', name: 'Solidité', arabic: 'Quwwah', icon: Dumbbell, bg: "bg-[#f0f5f1]", color: "text-[#5e8c61]" },
    serenite: { id: 'serenite', name: 'Sérénité', arabic: 'Sakinah', icon: Shield, bg: "bg-[#fcf8f2]", color: "text-[#b08d57]" },
    sourire: { id: 'sourire', name: 'Sourire', arabic: 'Sadaqah', icon: Smile, bg: "bg-[#fdf2f2]", color: "text-[#c25e5e]" }
  };

  const getScore = (id) => Math.min(pillarActions[id].length, 3);
  const totalScore = Object.keys(pillarActions).reduce((acc, key) => acc + getScore(key), 0);
  const progress = Math.round((totalScore / 12) * 100);

  const getNafsStage = (prog) => {
    if (prog >= 75) return { name: "An-Nafs al-Mutma'inna", desc: "L'Âme Apaisée (Constance & Excellence)" };
    if (prog >= 35) return { name: "An-Nafs al-Lawwama", desc: "L'Âme Blâmante (Muhasabah & Efforts)" };
    return { name: "An-Nafs al-Ammara", desc: "L'Âme Incitatrice (Lutte contre la paresse)" };
  };
  const nafs = getNafsStage(progress);

  const handleOpenPillar = (id) => {
    const quotes = pillarQuotes[id];
    setActiveQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    setActive(id);
  };

  const handleAddAction = (e) => {
    e.preventDefault();
    if (!newActionInput.trim()) return;
    setPillars(prev => ({ ...prev, [active]: [...prev[active], newActionInput.trim()] }));
    setNewActionInput('');
  };

  if (active) {
    const p = data[active];
    const actions = pillarActions[active];
    const score = getScore(active);

    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fdfbf7]">
        <div className="p-4 shrink-0 flex items-center border-b border-[#e8dfce]">
           <button onClick={() => setActive(null)} className="text-[#8c7b68] p-1"><ArrowLeft size={20} /></button>
           <span className="font-sans font-bold uppercase tracking-widest text-[10px] text-[#a99c8f] ml-4 flex-1 text-center pr-6">Action</span>
        </div>
        
        <div className="flex-1 flex flex-col p-5 h-full overflow-hidden">
          <div className="flex flex-col items-center mb-4 shrink-0">
            <div className={`w-16 h-16 rounded-full ${p.bg} flex items-center justify-center mb-2 shadow-sm`}><p.icon size={28} className={p.color} /></div>
            <h2 className="text-xl font-bold text-[#3e2f24]">{p.name}</h2>
          </div>

          <div className="bg-white border border-[#e8dfce] p-4 rounded-xl mb-4 shrink-0 shadow-sm relative">
             <p className="text-sm italic text-[#4a3f35] leading-relaxed mb-2 font-serif">« {activeQuote.text} »</p>
             <p className="text-[9px] font-sans text-[#a99c8f] uppercase font-bold tracking-wider">— {activeQuote.source}</p>
          </div>

          <form onSubmit={handleAddAction} className="mb-4 shrink-0">
            <div className="flex space-x-2">
              <input type="text" value={newActionInput} onChange={(e) => setNewActionInput(e.target.value)} placeholder="Action accomplie..." className="flex-1 bg-[#f5f0e6] border border-[#e8dfce] rounded-xl px-4 py-2 text-sm text-[#4a3f35] outline-none focus:border-[#8c6b4a]" />
              <button type="submit" disabled={!newActionInput.trim()} className="bg-[#8c6b4a] disabled:bg-[#d4c8b8] text-white px-4 rounded-xl"><Plus size={18} /></button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto mb-4 bg-white rounded-xl p-2 border border-[#e8dfce]">
             {actions.length === 0 ? (
               <p className="text-center text-xs text-[#8c7b68] italic p-4 mt-2">Aucune action enregistrée aujourd'hui.</p>
             ) : (
               <ul className="space-y-2">
                 {actions.map((act, idx) => (
                   <li key={idx} className="bg-[#fdfbf7] border border-[#e8dfce] p-3 rounded-lg flex items-start space-x-2 text-xs shadow-sm">
                     <CheckCircle size={14} className="text-[#5e8c61] shrink-0 mt-0.5" />
                     <span className="text-[#4a3f35] leading-snug break-words">{act}</span>
                   </li>
                 ))}
               </ul>
             )}
          </div>
          
          <div className="shrink-0 mt-auto">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-sans text-[#a99c8f] font-bold uppercase">Score</span>
              <span className="text-[10px] font-sans text-[#8c6b4a] font-bold">{score}/3</span>
            </div>
            <div className="flex space-x-2">
              {[1, 2, 3].map(lvl => <div key={lvl} className={`h-1.5 flex-1 rounded-full ${score >= lvl ? 'bg-[#8c6b4a]' : 'bg-[#e8dfce]'}`} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fdfbf7]">
      <div className="p-4 border-b border-[#e8dfce] flex justify-between items-center shrink-0">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#8c6b4a] font-sans font-bold">Al-Ihsan</p>
          <h1 className="text-xl font-bold text-[#3e2f24]">Mon Équilibre</h1>
        </div>
        <Award size={24} className="text-[#8c6b4a]" />
      </div>

      <div className="flex-1 flex flex-col p-5 justify-between">
        <div className="bg-white p-4 rounded-3xl border border-[#e8dfce] mb-3 flex flex-col items-center shrink-0 shadow-sm">
          <div className="flex items-center justify-between w-full mb-2">
            <div>
              <h3 className="font-sans font-bold text-[#3e2f24] text-xs">{nafs.name}</h3>
              <p className="text-[9px] text-[#8c7b68] font-sans italic">{nafs.desc}</p>
            </div>
            <div className="font-sans font-extrabold text-lg text-[#8c6b4a]">{progress}%</div>
          </div>
          <div className="w-full bg-[#f2efe9] h-2 rounded-full overflow-hidden">
            <div className="h-full bg-[#8c6b4a] transition-all rounded-full" style={{ width: progress + '%' }}></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {Object.values(data).map(d => {
            const score = getScore(d.id);
            const hasActions = pillarActions[d.id].length > 0;
            return (
              <button key={d.id} onClick={() => handleOpenPillar(d.id)} className={`p-3 rounded-2xl border text-left flex flex-col h-full ${score === 3 ? 'bg-[#fdfbf7] border-[#8c6b4a]' : 'bg-white border-[#e8dfce]'}`}>
                <div className={`w-8 h-8 rounded-full ${d.bg} flex items-center justify-center mb-2`}><d.icon size={16} className={d.color} /></div>
                <h4 className="font-bold text-[#3e2f24] text-xs">{d.name}</h4>
                <div className="mt-auto pt-2 w-full">
                   {hasActions && <div className="text-[#8c7b68] text-[9px] font-sans font-bold mb-1 flex items-center"><ListChecks size={10} className="mr-1"/> {pillarActions[d.id].length} act.</div>}
                  <div className="flex space-x-1 w-full">
                    {[1, 2, 3].map(lvl => <div key={lvl} className={`h-1 flex-1 rounded-full ${score >= lvl ? 'bg-[#8c6b4a]' : 'bg-[#f5f0e6]'}`} />)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};

const sabahAdhkar = [
  { 
    id: 'kursi', 
    title: 'Ayat al-Kursi', 
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ...', 
    phonetic: 'Allahu la ilaha illa Huwa, al-Hayyul-Qayyum, la ta\'khuduhu sinatun wa la nawm, lahu ma fis-samawati wa ma fil-ard...',
    translation: 'Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par Lui-même... (Coran 2:255)', 
    target: 1, 
    source: 'Coran (2:255) / Al-Nasa\'i' 
  },
  { 
    id: 'ikhlas_falak_nas', 
    title: 'Les 3 Sourates Protectrices (Ikhlas, Falaq, Nas)', 
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ... قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ', 
    phonetic: 'Qul Huwa Allahu Ahad... / Qul a\'udhu bi Rabbil-falaq... / Qul a\'udhu bi Rabbin-nas...',
    translation: 'Réciter 3 fois chaque sourate (Al-Ikhlas, Al-Falaq, An-Nas) matin et soir.', 
    target: 3, 
    source: 'At-Tirmidhi & Abou Dawoud' 
  },
  { 
    id: 'sayyid_stighfar', 
    title: 'Sayyid al-Istighfar (Maître de l\'Improvisation)', 
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ...', 
    phonetic: 'Allahumma Anta Rabbi, la ilaha illa Anta, khalaqtani wa ana \'abduka, wa ana \'ala \'ahdika wa wa\'dika mastata\'t...',
    translation: 'Ô Allah, Tu es mon Seigneur, nul ne mérite d\'être adoré si ce n\'est Toi, Tu m\'as créé et je suis Ton serviteur...', 
    target: 1, 
    source: 'Al-Boukhari' 
  },
  { 
    id: 'sabah_mulk', 
    title: 'Invocation du Matin (La Royauté)', 
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...', 
    phonetic: 'Asbahna wa asbahal-mulku lillah, wal-hamdu lillah, la ilaha illa Allah wahdahu la sharika lah, lahul-mulku wa lahul-hamd...',
    translation: 'Nous voilà au matin et la royauté appartient à Allah. Louange à Allah, point de divinité à part Allah Unique sans associé.', 
    target: 1, 
    source: 'Mouslim' 
  },
  { 
    id: 'radhitu', 
    title: 'Agrément d\'Allah et de l\'Islam', 
    arabic: 'رَضِيتُ بِاللَّهِ رَبّاً، وَبِالْإِسْلَامِ دِيناً، وَبِمُحَمَّدٍ نَبِيّاً', 
    phonetic: 'Radhitu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin nabiyya.',
    translation: 'J\'agrée Allah comme Seigneur, l\'Islam comme religion et Muhammad comme prophète.', 
    target: 3, 
    source: 'At-Tirmidhi & An-Nasa\'i' 
  },
  { 
    id: 'bismillah', 
    title: 'Protection contre tout mal terrestre et céleste', 
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', 
    phonetic: 'Bismillahi alladhi la yadurru ma\'asmihi shay\'un fil-ardi wa la fis-sama\' wa Huwa As-Sami\'ul-\'Alim.',
    translation: 'Au nom d\'Allah, avec Dont le Nom rien ne peut nuire sur terre ni au ciel, et Il est L\'Audient, L\'Omniscient.', 
    target: 3, 
    source: 'Abou Dawoud & At-Tirmidhi' 
  },
  { 
    id: 'hasbi_allah', 
    title: 'Suffisance d\'Allah', 
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', 
    phonetic: 'HasbiyAllahu la ilaha illa Huwa, \'alayhi tawakkaltu wa Huwa Rabbul-\'arshil-\'azim.',
    translation: 'Allah me suffit. Point de divinité à part Lui. Je place ma confiance en Lui et Il est le Seigneur du Trône Immense.', 
    target: 7, 
    source: 'Abou Dawoud' 
  },
  { 
    id: 'tasbih_sabah', 
    title: 'Louange et Gloire d\'Allah', 
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', 
    phonetic: 'Subhanallahi wa bihamdihi.',
    translation: 'Gloire et louange à Allah.', 
    target: 100, 
    source: 'Mouslim' 
  }
];

const masaAdhkar = [
  { 
    id: 'kursi_m', 
    title: 'Ayat al-Kursi', 
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ...', 
    phonetic: 'Allahu la ilaha illa Huwa, al-Hayyul-Qayyum, la ta\'khuduhu sinatun wa la nawm...',
    translation: 'Allah ! Point de divinité à part Lui, le Vivant... (Coran 2:255)', 
    target: 1, 
    source: 'Coran (2:255)' 
  },
  { 
    id: 'ikhlas_m', 
    title: 'Les 3 Sourates Protectrices (Ikhlas, Falaq, Nas)', 
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ... قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ... قُلْ أَعُوذُ بِرَبِّ النَّاسِ', 
    phonetic: 'Qul Huwa Allahu Ahad... / Qul a\'udhu bi Rabbil-falaq... / Qul a\'udhu bi Rabbin-nas...',
    translation: 'Réciter 3 fois chaque sourate le soir.', 
    target: 3, 
    source: 'At-Tirmidhi & Abou Dawoud' 
  },
  { 
    id: 'sayyid_m', 
    title: 'Sayyid al-Istighfar', 
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ...', 
    phonetic: 'Allahumma Anta Rabbi, la ilaha illa Anta, khalaqtani wa ana \'abduka...',
    translation: 'Ô Allah, Tu es mon Seigneur, nul ne mérite d\'être adoré si ce n\'est Toi...', 
    target: 1, 
    source: 'Al-Boukhari' 
  },
  { 
    id: 'masa_mulk', 
    title: 'Invocation du Soir (La Royauté)', 
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...', 
    phonetic: 'Amsayna wa amsayal-mulku lillah, wal-hamdu lillah, la ilaha illa Allah wahdahu la sharika lah...',
    translation: 'Nous voilà au soir et la royauté appartient à Allah. Louange à Allah...', 
    target: 1, 
    source: 'Mouslim' 
  },
  { 
    id: 'radhitu_m', 
    title: 'Agrément d\'Allah et de l\'Islam', 
    arabic: 'رَضِيتُ بِاللَّهِ رَبّاً، وَبِالْإِسْلَامِ دِيناً، وَبِمُحَمَّدٍ نَبِيّاً', 
    phonetic: 'Radhitu billahi Rabban, wa bil-Islami dinan, wa bi-Muhammadin nabiyya.',
    translation: 'J\'agrée Allah comme Seigneur, l\'Islam comme religion et Muhammad comme prophète.', 
    target: 3, 
    source: 'At-Tirmidhi & An-Nasa\'i' 
  },
  { 
    id: 'bismillah_m', 
    title: 'Protection contre tout mal terrestre et céleste', 
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', 
    phonetic: 'Bismillahi alladhi la yadurru ma\'asmihi shay\'un fil-ardi wa la fis-sama\' wa Huwa As-Sami\'ul-\'Alim.',
    translation: 'Au nom d\'Allah, avec Dont le Nom rien ne peut nuire sur terre ni au ciel...', 
    target: 3, 
    source: 'Abou Dawoud & At-Tirmidhi' 
  },
  { 
    id: 'hasbi_allah_m', 
    title: 'Suffisance d\'Allah', 
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ', 
    phonetic: 'HasbiyAllahu la ilaha illa Huwa, \'alayhi tawakkaltu wa Huwa Rabbul-\'arshil-\'azim.',
    translation: 'Allah me suffit. Point de divinité à part Lui...', 
    target: 7, 
    source: 'Abou Dawoud' 
  }
];

const ModuleAdhkar = () => {
  const [tab, setTab] = useState('sabah');
  const [counts, setCounts] = useLocalStorage('mindset_hisn_counts', {});

  const increment = (id) => {
    setCounts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const list = tab === 'sabah' ? sabahAdhkar : masaAdhkar;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fdfbf7]">
      <div className="p-4 border-b border-[#e8dfce] shrink-0 bg-white">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8c6b4a] font-sans font-bold">Hisn al-Muslim</p>
            <h1 className="text-xl font-bold text-[#3e2f24]">Adhkar Matin & Soir</h1>
          </div>
          <Sparkles size={20} className="text-[#b08d57]" />
        </div>
        <div className="flex bg-[#f5f0e6] p-1 rounded-xl">
          <button onClick={() => setTab('sabah')} className={`flex-1 py-2 text-xs font-sans font-bold rounded-lg transition-all ${tab === 'sabah' ? 'bg-[#8c6b4a] text-white shadow-sm' : 'text-[#8c7b68]'}`}>Adhkar du Matin</button>
          <button onClick={() => setTab('masa')} className={`flex-1 py-2 text-xs font-sans font-bold rounded-lg transition-all ${tab === 'masa' ? 'bg-[#8c6b4a] text-white shadow-sm' : 'text-[#8c7b68]'}`}>Adhkar du Soir</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {list.map(item => {
          const val = counts[item.id] || 0;
          const isComplete = val >= item.target;
          return (
            <div key={item.id} onClick={() => increment(item.id)} className={`p-4 rounded-2xl border transition-all cursor-pointer active:scale-95 select-none ${isComplete ? 'bg-[#f4f9f5] border-[#5e8c61]' : 'bg-white border-[#e8dfce]'}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-sm text-[#3e2f24]">{item.title}</h3>
                <span className="text-[9px] font-sans font-bold text-[#b08d57] bg-[#f5f0e6] px-2 py-0.5 rounded-full">{item.source}</span>
              </div>
              <p className="text-right font-serif text-lg text-[#8c6b4a] mb-2 leading-loose">{item.arabic}</p>
              <p className="text-xs font-sans text-[#7a6a58] italic mb-2 bg-[#fdfbf7] p-2.5 rounded-lg border border-[#f5f0e6] leading-relaxed"><strong className="font-bold text-[#8c6b4a]">Phonétique :</strong> {item.phonetic}</p>
              <p className="text-xs text-[#8c7b68] mb-3"><strong className="font-bold text-[#4a3f35]">Sens :</strong> « {item.translation} »</p>
              
              <div className="flex justify-between items-center pt-2 border-t border-[#f2efe9]">
                <span className="text-[10px] font-sans font-bold uppercase text-[#a99c8f]">Objectif : {item.target} fois</span>
                <span className={`font-sans font-extrabold text-base ${isComplete ? 'text-[#5e8c61]' : 'text-[#3e2f24]'}`}>{val} / {item.target}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ModuleQada = () => {
  const [qada, setQada] = useLocalStorage('mindset_qada', {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
    fasts: 0
  });

  const updateQada = (key, delta) => {
    setQada(prev => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  };

  const prayers = [
    { key: 'fajr', label: 'Fajr (2 Raka\'at)' },
    { key: 'dhuhr', label: 'Dhuhr (4 Raka\'at)' },
    { key: 'asr', label: 'Asr (4 Raka\'at)' },
    { key: 'maghrib', label: 'Maghrib (3 Raka\'at)' },
    { key: 'isha', label: 'Isha (4 Raka\'at)' },
    { key: 'fasts', label: 'Jeûnes (Jours)' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fdfbf7]">
      <div className="p-4 border-b border-[#e8dfce] text-center shrink-0 bg-white">
        <p className="text-[10px] uppercase tracking-widest text-[#8c6b4a] font-sans font-bold mb-1">Qada</p>
        <h1 className="text-xl font-bold text-[#3e2f24]">Suivi des Rattrapages</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {prayers.map(p => (
          <div key={p.key} className="bg-white p-4 rounded-2xl border border-[#e8dfce] flex items-center justify-between shadow-sm">
            <div>
              <h3 className="font-bold text-sm text-[#3e2f24]">{p.label}</h3>
              <p className="text-[10px] text-[#8c7b68] font-sans uppercase">À rattraper</p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={() => updateQada(p.key, -1)} className="w-8 h-8 rounded-full bg-[#f5f0e6] text-[#8c7b68] flex items-center justify-center hover:bg-[#e8dfce]">
                <Minus size={14} />
              </button>
              <span className="font-sans font-extrabold text-lg text-[#3e2f24] w-8 text-center">{qada[p.key]}</span>
              <button onClick={() => updateQada(p.key, 1)} className="w-8 h-8 rounded-full bg-[#8c6b4a] text-white flex items-center justify-center hover:bg-[#7a5c3f]">
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('ihsan');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themePref, setThemePref] = useLocalStorage('mindset_theme_pref', 'auto');
  const [activeTheme, setActiveTheme] = useState('parchemin');
  const [, setAppKey] = useState(0);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastLogin = window.localStorage.getItem('mindset_last_login');
    
    if (lastLogin && lastLogin !== today) {
      try {
        const historyData = JSON.parse(window.localStorage.getItem('mindset_history') || '[]');
        const tl = JSON.parse(window.localStorage.getItem('mindset_timeline') || '[]');
        const ratings = JSON.parse(window.localStorage.getItem('mindset_muhasabah_ratings') || '{"hilm":0,"rifq":0,"sidq":0,"tawadu":0}');
        const obstacle = JSON.parse(window.localStorage.getItem('mindset_sabr_obstacle') || '""');
        
        const habitsScore = tl.filter(t => t.completed).length;
        const muhasabahScore = Math.round((Object.values(ratings).reduce((a, b) => a + b, 0) / 20) * 100);

        historyData.push({ date: lastLogin, habitsScore, muhasabahScore, sabrObstacle: obstacle });
        if(historyData.length > 30) historyData.shift(); 
        window.localStorage.setItem('mindset_history', JSON.stringify(historyData));

        window.localStorage.setItem('mindset_ihsan', JSON.stringify({ savoir: [], solidite: [], serenite: [], sourire: [] }));
        window.localStorage.setItem('mindset_muhasabah_ratings', JSON.stringify({ hilm: 0, rifq: 0, sidq: 0, tawadu: 0 }));
        window.localStorage.setItem('mindset_muhasabah_step', '"intro"');
        window.localStorage.setItem('mindset_sabr_step', '"intro"');
        window.localStorage.setItem('mindset_timeline', JSON.stringify(tl.map(item => ({...item, completed: false}))));
      } catch(e) { console.error(e); }
      window.localStorage.setItem('mindset_last_login', today);
      setAppKey(prev => prev + 1);
    } else if (!lastLogin) {
      window.localStorage.setItem('mindset_last_login', today);
    }
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      if (themePref !== 'auto') {
        setActiveTheme(themePref);
      } else {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 19) setActiveTheme('parchemin');
        else setActiveTheme('sombre');
      }
    };
    updateTheme();
    const intervalId = setInterval(updateTheme, 60000); 
    return () => clearInterval(intervalId);
  }, [themePref]);

  const tabs = [
    { id: 'ikhlas', label: 'Focus', icon: Target },
    { id: 'istiqamah', label: 'Habitudes', icon: Activity },
    { id: 'ihsan', label: 'Équilibre', icon: LayoutDashboard },
    { id: 'muhasabah', label: 'Bilan', icon: Scale },
    { id: 'sabr', label: 'Résilience', icon: Compass },
    { id: 'adhkar', label: 'Hisn al-Muslim', icon: Sparkles },
    { id: 'qada', label: 'Qada', icon: CheckSquare }
  ];

  const renderModule = () => {
    switch (activeTab) {
      case 'ikhlas': return <ModuleIkhlas />;
      case 'istiqamah': return <ModuleIstiqamah />;
      case 'ihsan': return <ModuleIhsan />;
      case 'muhasabah': return <ModuleMuhasabah />;
      case 'sabr': return <ModuleSabr />;
      case 'adhkar': return <ModuleAdhkar />;
      case 'qada': return <ModuleQada />;
      default: return <ModuleIhsan />;
    }
  };

  return (
    <div className={`h-screen w-screen bg-[#f5f0e6] text-[#4a3f35] font-serif flex justify-center items-center sm:p-4 selection:bg-[#8c6b4a] selection:text-white theme-${activeTheme}`}>
      
      <style>{`
        ::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        .theme-sombre.bg-\\[\\#f5f0e6\\], .theme-sombre .bg-\\[\\#f5f0e6\\] { background-color: #1a1a1f !important; }
        .theme-sombre .bg-\\[\\#fdfbf7\\] { background-color: #222228 !important; }
        .theme-sombre .bg-white { background-color: #2c2c34 !important; }
        .theme-sombre.text-\\[\\#4a3f35\\], .theme-sombre .text-\\[\\#4a3f35\\] { color: #d1d1d6 !important; }
        .theme-sombre .text-\\[\\#3e2f24\\] { color: #f5f5f7 !important; }
        .theme-sombre .text-\\[\\#6b5a48\\] { color: #a1a1aa !important; }
        .theme-sombre .text-\\[\\#8c7b68\\] { color: #82828c !important; }
        .theme-sombre .border-\\[\\#e8dfce\\] { border-color: #3f3f4a !important; }
        .theme-sombre .border-\\[\\#f5f0e6\\] { border-color: #2c2c34 !important; }
        .theme-sombre .stroke-\\[\\#8c6b4a\\] { stroke: #8a8aa3 !important; }
      `}</style>

      <div className="bg-[#fdfbf7] w-full max-w-md sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-0 sm:border-4 border-[#e8dfce] relative h-full sm:h-[850px] sm:max-h-[95vh] flex flex-col">
        
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="absolute top-4 right-4 z-40 p-2 text-[#8c7b68] bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-[#e8dfce] hover:text-[#8c6b4a] transition-colors"
        >
          <Settings size={18} />
        </button>

        <div className="flex-1 flex flex-col overflow-hidden bg-[#fdfbf7]">
          {renderModule()}
        </div>

        <div className="h-16 bg-white border-t border-[#e8dfce] shrink-0 flex items-center px-2 pb-1 z-50 overflow-x-auto">
          <div className="flex w-full justify-around min-w-[480px]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center px-3 h-full transition-all duration-300 ${isActive ? 'text-[#8c6b4a]' : 'text-[#a99c8f] hover:bg-[#f5f0e6] rounded-xl'}`}
                >
                  <div className={`relative flex items-center justify-center transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                    <Icon size={isActive ? 20 : 18} strokeWidth={isActive ? 2 : 1.5} />
                    {isActive && <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-[#8c6b4a]"></span>}
                  </div>
                  <span className={`text-[8px] font-sans font-bold uppercase mt-1 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {isSettingsOpen && <ModuleParametres onClose={() => setIsSettingsOpen(false)} themePref={themePref} setThemePref={setThemePref} />}
      </div>
    </div>
  );
};

export default App;
