import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, BarChart2, History, Brain, Zap, Coffee, Frown, Activity, Trash2, Layers, Tag, Sparkles, FileText, Search, Settings, AlertCircle, CheckCircle2, Mic, MicOff, MousePointer2, Cloud, Loader2, User, Shield, X, LogIn, LogOut, Mail, Lock, KeyRound, Calendar, ArrowRight, Target, ClipboardCheck, TrendingUp, AlertTriangle } from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut, GoogleAuthProvider, linkWithPopup, signInWithPopup, EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, updateDoc } from 'firebase/firestore';

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyDUDrq1dDE3sIlnXRLm6Z5pToyXGJYe1kQ",
  authDomain: "flow-detective-proj.firebaseapp.com",
  projectId: "flow-detective-proj",
  storageBucket: "flow-detective-proj.firebasestorage.app",
  messagingSenderId: "453598403249",
  appId: "1:453598403249:web:460f30fc369189c2586090",
  measurementId: "G-DZVMHFFDK8"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'flow-detective-proj'; 

const FlowDetective = () => {
  const [activeTab, setActiveTab] = useState('log');
  const [logs, setLogs] = useState([]);
  const [currentActivity, setCurrentActivity] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [isDeepDive, setIsDeepDive] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  
  // Log Mode: 'immediate' (Standard), 'plan' (Future), 'completing' (Closing a plan)
  const [logMode, setLogMode] = useState('immediate'); 
  const [completingLog, setCompletingLog] = useState(null); 

  // Profile / Settings Modal State
  const [showProfile, setShowProfile] = useState(false);
  const [authError, setAuthError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('google'); 

  // Manual Override States
  const [manualFlowState, setManualFlowState] = useState(null); 
  const [manualActionState, setManualActionState] = useState(null); 
  const [isCalibrating, setIsCalibrating] = useState(false); 

  // Stats View Toggle
  const [statsView, setStatsView] = useState('FLOW'); // 'FLOW', 'FOGG', 'PREDICTION'

  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // --- Dimensions State ---
  const [skillComposite, setSkillComposite] = useState(5);
  const [skillHard, setSkillHard] = useState(5); 
  const [skillEnergy, setSkillEnergy] = useState(5); 

  const [challengeComposite, setChallengeComposite] = useState(5);
  const [challengeComplex, setChallengeComplex] = useState(5); 
  const [challengeUrgency, setChallengeUrgency] = useState(5); 

  const [motivationComposite, setMotivationComposite] = useState(5);
  const [motivationIntrinsic, setMotivationIntrinsic] = useState(5); 
  const [motivationExtrinsic, setMotivationExtrinsic] = useState(5); 

  const [showSuccess, setShowSuccess] = useState(false);

  // --- Auth & Data Flow (Firebase) ---
  useEffect(() => {
    const initAuth = async () => {
      if (!auth.currentUser) {
         await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'logs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      fetchedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(fetchedLogs);
      setIsLoadingLogs(false);
    }, (error) => {
      console.error("Error fetching logs:", error);
      setIsLoadingLogs(false);
    });
    return () => unsubscribe();
  }, [user]);

  // --- Auth Actions ---
  const linkGoogleAccount = async () => {
    setAuthError('');
    const provider = new GoogleAuthProvider();
    try {
      if (user.isAnonymous) {
        await linkWithPopup(user, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      handleAuthError(error);
    }
  };

  const handleEmailAuth = async (isLoginOnly = false) => {
    setAuthError('');
    if (!email || !password) {
      setAuthError('请输入完整的账号和密码');
      return;
    }
    if (password.length < 6) {
      setAuthError('密码长度至少需要6位');
      return;
    }

    try {
      if (isLoginOnly) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (user.isAnonymous) {
            const credential = EmailAuthProvider.credential(email, password);
            await linkWithCredential(user, credential);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
        }
      }
      setPassword('');
    } catch (error) {
       handleAuthError(error);
    }
  };

  const handleAuthError = (error) => {
    if (error.code === 'auth/credential-already-in-use' || error.code === 'auth/email-already-in-use') {
      setAuthError('该账号已被注册。请尝试直接登录。');
    } else if (error.code === 'auth/wrong-password') {
       setAuthError('密码错误。');
    } else if (error.code === 'auth/user-not-found') {
       setAuthError('账号不存在，请先注册绑定。');
    } else {
      setAuthError(`认证失败: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth);
      setAuthMode('google'); 
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  // --- Sync Composite values ---
  useEffect(() => {
    if (isDeepDive) {
      setSkillComposite(Math.round((skillHard + skillEnergy) / 2));
      setChallengeComposite(Math.round((challengeComplex + challengeUrgency) / 2));
      setMotivationComposite(Math.round((motivationIntrinsic + motivationExtrinsic) / 2));
    }
  }, [skillHard, skillEnergy, challengeComplex, challengeUrgency, motivationIntrinsic, motivationExtrinsic, isDeepDive]);

  useEffect(() => {
    setManualFlowState(null);
    setManualActionState(null);
    setIsCalibrating(false);
  }, [skillComposite, challengeComposite, motivationComposite]);

  // --- Voice Input ---
  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("抱歉，侦探，你的浏览器不支持语音识别功能。");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = true; 
    recognition.interimResults = true; 
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      let newFinalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          newFinalTranscript += event.results[i][0].transcript;
        }
      }
      if (newFinalTranscript) {
         setNotes(prev => (prev ? prev + ' ' : '') + newFinalTranscript);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  // --- Logic Core ---
  const FLOW_STATES = {
    FLOW: { id: 'FLOW', name: '心流 (Flow)', color: 'text-green-600', fill: '#22c55e', bg: 'bg-green-100', icon: Zap, desc: '挑战 ≈ 技能' },
    ANXIETY: { id: 'ANXIETY', name: '焦虑 (Anxiety)', color: 'text-red-500', fill: '#ef4444', bg: 'bg-red-100', icon: Activity, desc: '挑战 > 技能' },
    BOREDOM: { id: 'BOREDOM', name: '无聊 (Boredom)', color: 'text-yellow-600', fill: '#eab308', bg: 'bg-yellow-100', icon: Coffee, desc: '技能 > 挑战' },
    APATHY: { id: 'APATHY', name: '淡漠 (Apathy)', color: 'text-gray-400', fill: '#9ca3af', bg: 'bg-gray-100', icon: Frown, desc: '低挑战 & 低技能' }
  };

  const personalFlowThreshold = useMemo(() => {
    const flowLogs = logs.filter(l => l.flowState?.id === 'FLOW');
    if (flowLogs.length < 3) return 2.5; 
    const maxDiff = flowLogs.reduce((max, log) => {
      // Use actual values if completed, else use predicted/current
      const c = log.actualChallenge || log.challenge || 5;
      const s = log.actualSkill || log.skill || 5;
      const diff = Math.abs(c - s);
      return diff > max ? diff : max;
    }, 2.5);
    return Math.min(maxDiff, 6);
  }, [logs]);

  const personalActionBias = useMemo(() => {
    const overriddenLogs = logs.filter(l => l.isManualActionOverride);
    if (overriddenLogs.length === 0) return 0;
    let totalBiasNeeded = 0;
    let count = 0;
    overriddenLogs.forEach(log => {
      const c = log.actualChallenge || log.challenge || 5;
      const s = log.actualSkill || log.skill || 5;
      const m = log.actualMotivation || log.motivation || 5;
      
      const baseScore = (m * 1.5) + (s * 1.0) - (c * 1.0);
      if (log.actionState?.isActionable) {
        if (baseScore <= 0) { totalBiasNeeded += (0.1 - baseScore); count++; }
      } else {
        if (baseScore > 0) { totalBiasNeeded += (-0.1 - baseScore); count++; }
      }
    });
    return count === 0 ? 0 : (totalBiasNeeded / count) * 0.8; 
  }, [logs]);

  const calculateMachineFlowState = (c, s) => {
    const diff = c - s;
    const intensity = c + s;
    const threshold = personalFlowThreshold; 
    if (diff > threshold) return FLOW_STATES.ANXIETY;
    if (diff < -threshold) return FLOW_STATES.BOREDOM;
    if (intensity < 7) return FLOW_STATES.APATHY;
    return FLOW_STATES.FLOW;
  };

  const determineActionability = (m, s, c) => {
    const rawScore = (m * 1.5) + (s * 1.0) - (c * 1.0);
    const finalScore = rawScore + personalActionBias;
    const isActionable = finalScore > 0; 
    return {
      isActionable,
      label: isActionable ? '可行动' : '受阻',
      description: isActionable ? '动力击穿阻力' : (m < 4 ? '动力缺口较大' : '挑战过于艰巨')
    };
  };

  const generateAITags = () => {
    const text = (currentActivity + ' ' + notes).toLowerCase();
    const newTags = [];
    if (text.includes('写') || text.includes('代码') || text.includes('code')) newTags.push('编程');
    if (text.includes('会') || text.includes('聊')) newTags.push('会议');
    if (text.includes('书') || text.includes('读')) newTags.push('学习');
    if (text.includes('累') || text.includes('困')) newTags.push('低能量');
    if (motivationIntrinsic > 7) newTags.push('高内驱');
    if (challengeUrgency > 7) newTags.push('紧急');
    setTags([...new Set([...tags, ...newTags])]);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      setTags([...tags, e.target.value]);
      e.target.value = '';
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const machineFlowState = useMemo(() => calculateMachineFlowState(challengeComposite, skillComposite), [challengeComposite, skillComposite, personalFlowThreshold]);
  const machineActionState = useMemo(() => determineActionability(motivationComposite, skillComposite, challengeComposite), [motivationComposite, skillComposite, challengeComposite, personalActionBias]);
  
  const finalFlowState = manualFlowState || machineFlowState;
  const finalActionState = manualActionState !== null 
    ? { isActionable: manualActionState, label: manualActionState ? '可行动' : '受阻', description: '用户手动判定' } 
    : machineActionState;

  // --- Handlers for Log/Plan ---

  const resetForm = () => {
    setCurrentActivity('');
    setNotes('');
    setTags([]);
    setChallengeComposite(5); setSkillComposite(5); setMotivationComposite(5);
    setSkillHard(5); setSkillEnergy(5);
    setChallengeComplex(5); setChallengeUrgency(5);
    setMotivationIntrinsic(5); setMotivationExtrinsic(5);
    setManualFlowState(null);
    setManualActionState(null);
    setIsCalibrating(false);
    setCompletingLog(null);
    setLogMode('immediate'); 
  };

  const handleLog = async () => {
    if (!currentActivity.trim() || !user) return;

    // Base Data
    const baseData = {
      timestamp: new Date().toISOString(),
      activity: currentActivity,
      notes: notes,
      tags: tags,
    };

    try {
      if (logMode === 'completing' && completingLog) {
        const updateData = {
          status: 'completed', 
          completedAt: new Date().toISOString(),
          actualChallenge: challengeComposite,
          actualSkill: skillComposite,
          actualMotivation: motivationComposite,
          actualFlowState: finalFlowState,
          actualActionState: finalActionState,
          diffChallenge: challengeComposite - (completingLog.challenge || 5),
          diffSkill: skillComposite - (completingLog.skill || 5),
          diffMotivation: motivationComposite - (completingLog.motivation || 5),
          notes: completingLog.notes ? `${completingLog.notes}\n[结案]: ${notes}` : notes
        };
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'logs', completingLog.id), updateData);
      } else {
        const isPlan = logMode === 'plan';
        const newLog = {
          ...baseData,
          type: isPlan ? 'plan' : 'log',
          status: isPlan ? 'pending' : 'completed',
          challenge: challengeComposite,
          skill: skillComposite,
          motivation: motivationComposite,
          breakdown: isDeepDive ? {
            skillHard, skillEnergy, challengeComplex, challengeUrgency, motivationIntrinsic, motivationExtrinsic
          } : null,
          flowState: finalFlowState,
          actionState: finalActionState,
          isManualFlowOverride: !!manualFlowState,
          isManualActionOverride: manualActionState !== null
        };
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'logs'), newLog);
      }
      resetForm();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (e) {
      console.error("Error adding log: ", e);
      alert("云端记录失败");
    }
  };

  const startCompletingPlan = (log) => {
    setLogMode('completing');
    setCompletingLog(log);
    setCurrentActivity(log.activity);
    setNotes(''); 
    setTags(log.tags || []);
    setChallengeComposite(5);
    setSkillComposite(5);
    setMotivationComposite(5);
    setActiveTab('log');
  };

  const deleteLog = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'logs', id));
    } catch (e) {
      console.error("Error deleting log: ", e);
    }
  };

  // --- Visual Components ---

  const Slider = ({ label, value, setValue, minLabel, maxLabel, colorClass, icon: Icon, isSub = false }) => (
    <div className={`mb-3 ${isSub ? 'pl-6 border-l-2 border-slate-100' : ''}`}>
      <div className="flex justify-between items-end mb-1">
        <label className={`font-bold text-slate-700 flex items-center gap-2 ${isSub ? 'text-xs' : 'text-sm'}`}>
          {!isSub && Icon && <Icon size={16} className={colorClass} />}
          {label}
        </label>
        <span className={`font-mono font-bold ${colorClass} ${isSub ? 'text-sm' : 'text-lg'}`}>{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        className={`w-full rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 accent-indigo-600 ${isSub ? 'h-1.5 bg-gray-100' : 'h-2 bg-gray-200'}`}
      />
      {!isSub && (
        <div className="flex justify-between text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
    </div>
  );

  const FlowChannelChart = () => {
    const size = 300;
    const threshold = personalFlowThreshold; 
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in">
        <div className="flex justify-between items-start w-full mb-4">
          <div>
            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} /> 心流通道 (Flow Channel)
            </h3>
            <p className="text-[9px] text-gray-400 mt-1">
              宽容度: <span className="font-mono text-indigo-500 font-bold">±{threshold.toFixed(1)}</span>
            </p>
          </div>
          <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Size = 动机</span>
        </div>
        <div className="relative border border-gray-100 rounded-lg bg-gray-50/50" style={{ width: size, height: size }}>
          <div className="absolute -left-6 top-1/2 -rotate-90 text-[10px] text-gray-400 font-bold tracking-widest transform -translate-y-1/2 flex gap-1">挑战 (Challenge)</div>
          <div className="absolute bottom-[-20px] left-1/2 text-[10px] text-gray-400 font-bold tracking-widest transform -translate-x-1/2">技能 (Skill)</div>
          <svg width={size} height={size} className="overflow-visible">
            <path d={`M 0 0 L ${size} 0 L 0 ${size} Z`} fill="#fee2e2" opacity="0.3" />
            <path d={`M ${size} ${size} L ${size} 0 L 0 ${size} Z`} fill="#fef3c7" opacity="0.3" />
            <path d={`M 0 ${size} L ${size} 0`} stroke="#dcfce7" strokeWidth={threshold * 30} opacity="0.6" strokeLinecap="square" />
            <circle cx="0" cy={size} r={size * 0.3} fill="#f3f4f6" opacity="0.8" />
            <text x={size * 0.15} y={size * 0.15} fill="#ef4444" fontSize="10" opacity="0.5" fontWeight="bold">焦虑</text>
            <text x={size * 0.85} y={size * 0.85} fill="#d97706" fontSize="10" opacity="0.5" fontWeight="bold">无聊</text>
            {logs.map((log) => {
              const c = log.actualChallenge || log.challenge || 5;
              const s = log.actualSkill || log.skill || 5;
              const m = log.actualMotivation || log.motivation || 5;
              const stateColor = log.actualFlowState?.fill || log.flowState?.fill || '#cbd5e1';
              const stateName = log.actualFlowState?.name || log.flowState?.name;
              const x = ((s - 1) / 9) * size;
              const y = size - ((c - 1) / 9) * size;
              const r = 3 + (m * 1.5); 
              const isPending = log.status === 'pending';
              const jitter = (id) => (id.charCodeAt(0) % 7) - 3; 
              return (
                <circle 
                  key={log.id} cx={x + jitter(log.id)} cy={y + jitter(log.id)} r={r} 
                  fill={isPending ? 'transparent' : stateColor} stroke={stateColor}
                  strokeWidth={isPending ? 2 : 1} strokeDasharray={isPending ? "3,2" : "0"}
                  fillOpacity={isPending ? 0 : 0.6} className="hover:opacity-100"
                >
                  <title>{`${log.activity} (${stateName}) ${isPending ? '[Planning]' : ''}`}</title>
                </circle>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const FoggBehaviorChart = () => {
    const size = 300;
    const bias = personalActionBias;
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 animate-fade-in">
         <div className="flex justify-between items-start w-full mb-4">
          <div>
            <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
              <MousePointer2 size={14} /> 福格行为模型 (Fogg Behavior)
            </h3>
            <p className="text-[9px] text-gray-400 mt-1">
              行动偏差校准: <span className={`font-mono font-bold ${bias > 0 ? 'text-green-500' : 'text-red-500'}`}>{bias > 0 ? '+' : ''}{bias.toFixed(2)}</span>
            </p>
          </div>
          <span className="text-[9px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">Color = 心理状态</span>
        </div>
        <div className="relative border border-gray-100 rounded-lg bg-gray-50/50" style={{ width: size, height: size }}>
           <div className="absolute -left-6 top-1/2 -rotate-90 text-[10px] text-gray-400 font-bold tracking-widest transform -translate-y-1/2 flex gap-1">动机 (Motivation)</div>
           <div className="absolute bottom-[-20px] left-1/2 text-[10px] text-gray-400 font-bold tracking-widest transform -translate-x-1/2">挑战/难度 (Challenge)</div>
          <svg width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="actionGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#dcfce7" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#dcfce7" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
            <path d={`M 0 0 L ${size} 0 L ${size} ${size} L 0 ${size} Z`} fill="url(#actionGradient)" />
            <path d={`M 0 ${size} Q ${size * 0.3} ${size * 0.7} ${size} 0`} fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" opacity="0.5"/>
            <text x={size * 0.8} y={size * 0.1} fill="#16a34a" fontSize="10" opacity="0.8" fontWeight="bold">行动区</text>
            <text x={size * 0.2} y={size * 0.9} fill="#9ca3af" fontSize="10" opacity="0.8" fontWeight="bold">失败区</text>
            {logs.map((log) => {
              const c = log.actualChallenge || log.challenge || 5;
              const m = log.actualMotivation || log.motivation || 5;
              const x = ((c - 1) / 9) * size;
              const y = size - ((m - 1) / 9) * size;
              const isActionable = log.actionState?.isActionable;
              const isManual = log.isManualActionOverride;
              const stateColor = log.actualFlowState?.fill || log.flowState?.fill || '#cbd5e1';
              const jitter = (id) => (id.charCodeAt(0) % 5) - 2;
              return (
                <g key={log.id}>
                  <circle cx={x + jitter(log.id)} cy={y + jitter(log.id)} r={isActionable ? 4 : 3} fill={stateColor} stroke={isActionable ? "#1e293b" : "none"} strokeWidth={isManual ? 2 : 1} fillOpacity={isActionable ? 0.9 : 0.3} />
                  {isManual && <circle cx={x + jitter(log.id)} cy={y + jitter(log.id)} r={1.5} fill="white"/>}
                  <title>{`${log.activity}: M${m} vs C${c}`}</title>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  const PredictionAccuracyChart = () => {
    // Calculate Diff Stats
    const completedPlans = logs.filter(l => l.status === 'completed' && l.diffChallenge !== undefined);
    
    if (completedPlans.length === 0) {
      return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
          <Target size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-xs">暂无对比数据</p>
          <p className="text-[10px] text-gray-400">请先创建[预案]并完成[结案]</p>
        </div>
      );
    }

    const avgDiffC = completedPlans.reduce((acc, l) => acc + (l.diffChallenge || 0), 0) / completedPlans.length;
    const avgDiffS = completedPlans.reduce((acc, l) => acc + (l.diffSkill || 0), 0) / completedPlans.length;
    const avgDiffM = completedPlans.reduce((acc, l) => acc + (l.diffMotivation || 0), 0) / completedPlans.length;

    const Bar = ({ label, val, color }) => (
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold w-12 text-right text-gray-500">{label}</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden flex items-center relative">
          <div className="absolute left-1/2 w-0.5 h-full bg-gray-300 z-10"></div>
          {/* Bar width is proportional to deviation. Max deviation usually +/- 5. Map 5 to 50% width. */}
          <div 
            className={`h-full rounded-full absolute ${color}`}
            style={{ 
              width: `${Math.min(Math.abs(val) * 10, 50)}%`, 
              left: val >= 0 ? '50%' : `calc(50% - ${Math.min(Math.abs(val) * 10, 50)}%)` 
            }} 
          ></div>
        </div>
        <span className={`text-[10px] font-mono font-bold w-8 ${val > 0 ? 'text-red-500' : (val < 0 ? 'text-green-500' : 'text-gray-400')}`}>
          {val > 0 ? '+' : ''}{val.toFixed(1)}
        </span>
      </div>
    );

    return (
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-fade-in">
        <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp size={14} /> 预判偏差 (Prediction Gap)
        </h3>
        <p className="text-[10px] text-gray-400 mb-3 px-2">
          正值(+)代表实际体验比预想的更强/更难。<br/>
          <span className="text-red-400">红色</span> = 高估困难/低估能力 (畏难) <br/>
          <span className="text-green-400">绿色</span> = 低估困难/高估能力 (乐观)
        </p>
        
        <Bar label="挑战" val={avgDiffC} color={avgDiffC > 0 ? 'bg-red-400' : 'bg-green-400'} />
        <Bar label="技能" val={avgDiffS} color={avgDiffS > 0 ? 'bg-green-400' : 'bg-red-400'} />
        <Bar label="动机" val={avgDiffM} color={avgDiffM > 0 ? 'bg-green-400' : 'bg-red-400'} />

        <div className="mt-2 pt-2 border-t border-gray-50 text-[10px] text-indigo-600 text-center italic">
          {avgDiffC > 1 ? "💡 侦探提示：你倾向于把事情想得太难 (Over-thinker)" : (avgDiffC < -1 ? "💡 侦探提示：你倾向于低估难度 (Under-estimator)" : "🎯 你的直觉非常敏锐！")}
        </div>
      </div>
    );
  };

  const TagAnalysis = () => {
    // ... existing tag analysis code ...
    const tagStats = {};
    logs.forEach(log => {
      if (!log.tags) return;
      log.tags.forEach(tag => {
        if (!tagStats[tag]) { tagStats[tag] = { count: 0, totalMot: 0, flowStates: {} }; }
        tagStats[tag].count++;
        tagStats[tag].totalMot += (log.motivation || 5);
        const stateName = log.flowState?.name?.split(' ')[0] || 'Unknown';
        tagStats[tag].flowStates[stateName] = (tagStats[tag].flowStates[stateName] || 0) + 1;
      });
    });
    const sortedTags = Object.entries(tagStats).map(([tag, data]) => ({
        tag, avgMot: (data.totalMot / data.count).toFixed(1), count: data.count, topState: Object.entries(data.flowStates).sort((a,b) => b[1] - a[1])[0][0]
      })).sort((a, b) => b.count - a.count).slice(0, 5);
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-4 animate-fade-in">
         <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2"><Search size={14} /> 行为侧写 (Insights)</h3>
         <div className="space-y-3">
           {sortedTags.length === 0 ? <p className="text-xs text-gray-400 italic text-center py-4">积累数据以解锁侧写...</p> : sortedTags.map((item) => (
               <div key={item.tag} className="flex items-center justify-between text-xs border-b border-gray-50 pb-2 last:border-0">
                  <div className="flex items-center gap-2"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-bold">#{item.tag}</span><span className="text-gray-400">x{item.count}</span></div>
                  <div className="flex gap-3 text-right">
                    <div><span className="block font-bold text-gray-700">{item.topState}</span><span className="text-[9px] text-gray-400">高频状态</span></div>
                    <div><span className={`block font-bold ${item.avgMot > 6 ? 'text-green-600' : 'text-gray-500'}`}>{item.avgMot}</span><span className="text-[9px] text-gray-400">平均动力</span></div>
                  </div>
               </div>
             ))}
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans pb-24 max-w-md mx-auto border-x border-gray-200 shadow-2xl relative overflow-hidden">
      
      {/* Profile Modal */}
      {showProfile && user && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <div className="flex flex-col items-center mb-6">
              <div className={`p-4 rounded-full mb-3 ring-4 ${user.isAnonymous ? 'bg-gray-100 ring-gray-50' : 'bg-indigo-100 ring-indigo-50'}`}>
                <Shield size={40} className={user.isAnonymous ? 'text-gray-500' : 'text-indigo-600'} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user.isAnonymous ? '临时探员' : '认证探员'}</h2>
              <p className="text-xs text-gray-500">{user.isAnonymous ? 'Anonymous Agent' : user.email}</p>
            </div>
            <div className="space-y-4">
               <div className="flex gap-2">
                  <div className="bg-green-50 p-2 rounded-xl border border-green-100 flex-1 text-center"><span className="text-[10px] uppercase text-green-600 font-bold block">案件数</span><p className="font-bold text-lg text-green-700">{logs.length}</p></div>
                  <div className="bg-purple-50 p-2 rounded-xl border border-purple-100 flex-1 text-center"><span className="text-[10px] uppercase text-purple-600 font-bold block">心流率</span><p className="font-bold text-lg text-purple-700">{logs.length > 0 ? Math.round((logs.filter(l => l.flowState?.id === 'FLOW').length / logs.length) * 100) : 0}%</p></div>
               </div>
               <div className="border-t border-gray-100 pt-4">
                 {user.isAnonymous ? (
                   <>
                     <div className="flex p-1 bg-gray-100 rounded-lg mb-3">
                       <button onClick={() => { setAuthMode('google'); setAuthError(''); }} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${authMode === 'google' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>Google</button>
                       <button onClick={() => { setAuthMode('email'); setAuthError(''); }} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${authMode === 'email' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>账号密码</button>
                     </div>
                     {authError && <div className="p-2 mb-3 bg-red-50 text-red-600 text-[10px] rounded-lg">{authError}</div>}
                     {authMode === 'google' ? (
                        <button onClick={linkGoogleAccount} className="w-full bg-white border border-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50">使用 Google 存档</button>
                     ) : (
                        <div className="space-y-2">
                           <input type="email" placeholder="输入邮箱 (作为账号)" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" value={email} onChange={(e) => setEmail(e.target.value)} />
                           <input type="password" placeholder="设置密码 (至少6位)" className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500" value={password} onChange={(e) => setPassword(e.target.value)} />
                           <div className="flex gap-2 mt-2">
                              <button onClick={() => handleEmailAuth(false)} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold hover:bg-indigo-700">注册并绑定</button>
                              <button onClick={() => handleEmailAuth(true)} className="flex-1 bg-white border border-indigo-200 text-indigo-600 py-2 rounded-xl text-xs font-bold hover:bg-indigo-50">登录账号</button>
                           </div>
                        </div>
                     )}
                   </>
                 ) : (
                   <button onClick={handleSignOut} className="w-full bg-gray-50 text-gray-500 text-xs py-2.5 rounded-xl hover:bg-gray-100 hover:text-red-500 flex items-center justify-center gap-2"><LogOut size={14} /> 登出 / 切换账号</button>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 p-6 pt-10 rounded-b-3xl shadow-xl relative z-10 text-white">
        <div className="flex justify-between items-center mb-2">
          <div><h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-cyan-300">Flow Detective 8.5</h1><p className="text-slate-400 text-[10px] uppercase tracking-widest">Calibration & Prediction</p></div>
          <div className="flex gap-2"><button onClick={() => user && setShowProfile(true)} disabled={!user} className={`p-2 rounded-full ring-1 flex items-center justify-center transition-colors ${!user ? 'opacity-50 cursor-not-allowed bg-slate-800 ring-slate-700' : (user.isAnonymous ? 'bg-slate-800 ring-slate-700 hover:bg-slate-700' : 'bg-indigo-900 ring-indigo-500 hover:bg-indigo-800')}`}>{user ? <User size={20} className={user.isAnonymous ? "text-slate-400" : "text-white"} /> : <Loader2 size={20} className="text-slate-500 animate-spin" />}</button></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pt-6 space-y-6">
        
        {activeTab === 'log' && (
          <div className="animate-fade-in-up">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                 {logMode === 'completing' ? (
                   <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full"><Target size={14} /><span className="text-xs font-bold">案件收尾中...</span></div>
                 ) : (
                   <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                     <button onClick={() => setLogMode('immediate')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${logMode === 'immediate' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>⚡️ 现场记录</button>
                     <button onClick={() => setLogMode('plan')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${logMode === 'plan' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-400'}`}>📅 预案筹备</button>
                   </div>
                 )}
                 <button onClick={() => setIsDeepDive(!isDeepDive)} className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full transition-all ${isDeepDive ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}><Sparkles size={10} /> {isDeepDive ? 'Deep' : 'Simple'}</button>
              </div>

              {logMode === 'plan' && (<div className="mb-4 p-3 bg-teal-50 text-teal-700 rounded-xl text-xs border border-teal-100 flex items-start gap-2"><Calendar size={14} className="shrink-0 mt-0.5" /><p>您正在创建一个<b>行动预案</b>。请根据您对未来的<b>想象</b>来预估难度和技能。</p></div>)}
              {logMode === 'completing' && completingLog && (<div className="mb-4 p-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs border border-indigo-100"><p className="font-bold mb-1">原始预估 (Predicted):</p><div className="flex gap-2 opacity-70"><span>C: {completingLog.challenge}</span><span>S: {completingLog.skill}</span><span>M: {completingLog.motivation}</span></div><p className="mt-2 text-[10px]">请根据<b>真实体验</b>调整下方滑块。</p></div>)}

              <div className="mb-4"><label className="block text-slate-700 font-bold text-sm mb-2">行动 (Activity)</label><input type="text" placeholder="Coding, Meeting..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300" value={currentActivity} onChange={(e) => setCurrentActivity(e.target.value)} disabled={logMode === 'completing'} /></div>

              {/* Notes Area */}
              <div className={`transition-all duration-300 overflow-hidden ${isDeepDive ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                     <label className="text-xs font-bold text-slate-500 flex items-center gap-1"><FileText size={12}/> 笔录细节</label>
                     <div className="flex gap-2">
                        <button onClick={toggleVoiceInput} className={`text-[10px] border px-2 py-0.5 rounded shadow-sm flex items-center gap-1 transition-all ${isListening ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-white text-slate-600 border-slate-200'}`}>{isListening ? <MicOff size={10} /> : <Mic size={10} />}{isListening ? '录音中...' : '语音'}</button>
                        <button onClick={generateAITags} className="text-[10px] bg-white border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded shadow-sm hover:bg-indigo-50 flex items-center gap-1"><Sparkles size={10} /> AI 提炼</button>
                     </div>
                  </div>
                  <textarea className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none resize-none h-16" placeholder="上下文背景..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (<span key={tag} className="bg-white border border-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded flex items-center gap-1">#{tag} <button onClick={() => removeTag(tag)} className="hover:text-red-500">×</button></span>))}
                    <input type="text" placeholder="+标签" className="bg-transparent text-[10px] w-20 focus:outline-none text-slate-500" onKeyDown={handleAddTag} />
                  </div>
                </div>
              </div>

              {/* Sliders Area (Restored Sub-sliders!) */}
              <div className="mb-4">
                <Slider label={logMode === 'plan' ? "预估能力 (Predicted Skill)" : "真实技能 (Actual Skill)"} value={skillComposite} setValue={isDeepDive ? () => {} : setSkillComposite} minLabel="生疏" maxLabel="熟练" colorClass="text-teal-600" icon={Brain} />
                {isDeepDive && <div className="animate-fade-in space-y-2 mt-2"><Slider label="硬技能 (Proficiency)" value={skillHard} setValue={setSkillHard} colorClass="text-teal-500" isSub /><Slider label="能量状态 (Energy)" value={skillEnergy} setValue={setSkillEnergy} colorClass="text-teal-500" isSub /></div>}
              </div>
              <div className="mb-4">
                <Slider label={logMode === 'plan' ? "预估阻力 (Predicted Challenge)" : "真实挑战 (Actual Challenge)"} value={challengeComposite} setValue={isDeepDive ? () => {} : setChallengeComposite} minLabel="简单" maxLabel="困难" colorClass="text-indigo-600" icon={Activity} />
                {isDeepDive && <div className="animate-fade-in space-y-2 mt-2"><Slider label="复杂度 (Complexity)" value={challengeComplex} setValue={setChallengeComplex} colorClass="text-indigo-500" isSub /><Slider label="紧迫感 (Urgency)" value={challengeUrgency} setValue={setChallengeUrgency} colorClass="text-indigo-500" isSub /></div>}
              </div>
              <div className="mb-4">
                <Slider label={logMode === 'plan' ? "预估动机 (Predicted Motivation)" : "真实动机 (Actual Motivation)"} value={motivationComposite} setValue={isDeepDive ? () => {} : setMotivationComposite} minLabel="无感" maxLabel="渴望" colorClass="text-purple-600" icon={Zap} />
                {isDeepDive && <div className="animate-fade-in space-y-2 mt-2"><Slider label="内驱力 (Interest/Fun)" value={motivationIntrinsic} setValue={setMotivationIntrinsic} colorClass="text-purple-500" isSub /><Slider label="外驱力 (Reward/Deadline)" value={motivationExtrinsic} setValue={setMotivationExtrinsic} colorClass="text-purple-500" isSub /></div>}
              </div>

              <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><finalFlowState.icon size={18} className={finalFlowState.color} /><div className="flex flex-col"><span className={`text-sm font-bold ${finalFlowState.color}`}>{finalFlowState.name}</span><span className="text-[9px] text-gray-400">{logMode === 'plan' ? '预测状态' : '当前状态'}</span></div></div>
                    {logMode !== 'plan' && !isCalibrating && (<button onClick={() => setIsCalibrating(true)} className="text-[10px] text-indigo-500 underline decoration-dotted">修正状态?</button>)}
                    {isCalibrating && (<div className="flex gap-1 animate-fade-in"><button onClick={() => setManualFlowState(FLOW_STATES.ANXIETY)} className="p-1.5 bg-red-100 rounded text-red-600"><Activity size={12}/></button><button onClick={() => setManualFlowState(FLOW_STATES.FLOW)} className="p-1.5 bg-green-100 rounded text-green-600"><Zap size={12}/></button><button onClick={() => setManualFlowState(FLOW_STATES.BOREDOM)} className="p-1.5 bg-yellow-100 rounded text-yellow-600"><Coffee size={12}/></button></div>)}
                 </div>
                 <div className="w-full h-px bg-slate-200 my-2"></div>
                 <div className="flex items-center justify-between"><span className="text-[10px] text-slate-400">{logMode === 'plan' ? '预估行动力:' : '行动判定:'}</span><div className={`text-xs font-bold px-2 py-0.5 rounded ${finalActionState.isActionable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{finalActionState.label}</div></div>
              </div>

              <button onClick={handleLog} disabled={!currentActivity} className={`w-full mt-4 py-4 rounded-xl font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 ${currentActivity ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                {showSuccess ? '已归档!' : <>{logMode === 'plan' ? <Calendar size={16} /> : (logMode === 'completing' ? <ClipboardCheck size={16} /> : <Plus size={16} />)}<span>{logMode === 'plan' ? '创建行动预案' : (logMode === 'completing' ? '确认结案 (Close Case)' : '记录案卷')}</span></>}
              </button>
              {logMode === 'completing' && <button onClick={resetForm} className="w-full mt-2 text-xs text-gray-400 py-2 hover:text-gray-600">取消结案</button>}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="animate-fade-in space-y-4">
            <div className="flex justify-center mb-2">
              <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                <button onClick={() => setStatsView('FLOW')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${statsView === 'FLOW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>心流通道</button>
                <button onClick={() => setStatsView('FOGG')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${statsView === 'FOGG' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>福格模型</button>
                <button onClick={() => setStatsView('PREDICTION')} className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${statsView === 'PREDICTION' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400'}`}>预判校准</button>
              </div>
            </div>
            {statsView === 'FLOW' && <FlowChannelChart />}
            {statsView === 'FOGG' && <FoggBehaviorChart />}
            {statsView === 'PREDICTION' && <PredictionAccuracyChart />}
            <TagAnalysis />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-fade-in">
             <div className="space-y-3">
               {isLoadingLogs ? (
                 <div className="text-center text-gray-400 py-10 flex flex-col items-center gap-2"><Loader2 className="animate-spin" /><p className="text-xs">正在从档案室调取卷宗...</p></div>
               ) : logs.length === 0 ? (
                 <div className="text-center text-gray-400 py-10"><p>暂无卷宗</p></div>
               ) : (
                 logs.map((log) => {
                   const stateId = log.actualFlowState?.id || log.flowState?.id;
                   const isPending = log.status === 'pending';
                   
                   return (
                     <div key={log.id} className={`bg-white p-4 rounded-xl shadow-sm border flex flex-col gap-2 relative overflow-hidden transition-all ${isPending ? 'border-teal-200 border-dashed bg-teal-50/30' : 'border-gray-100'}`}>
                       {isPending && <div className="absolute top-0 right-0 bg-teal-100 text-teal-700 text-[9px] px-2 py-0.5 rounded-bl-lg font-bold">PLANNING</div>}
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className={`p-1.5 rounded-lg ${isPending ? 'bg-gray-200 text-gray-500' : (log.actualFlowState?.bg || log.flowState?.bg || 'bg-gray-100')}`}>
                              {isPending ? <Calendar size={14} /> : (
                                <>
                                  {stateId === 'FLOW' && <Zap size={14} className={log.flowState?.color || 'text-green-600'} />}
                                  {stateId === 'ANXIETY' && <Activity size={14} className={log.flowState?.color || 'text-red-500'} />}
                                  {stateId === 'BOREDOM' && <Coffee size={14} className={log.flowState?.color || 'text-yellow-600'} />}
                                  {stateId === 'APATHY' && <Frown size={14} className={log.flowState?.color || 'text-gray-400'} />}
                                  {!stateId && <Zap size={14} className="text-gray-300" />}
                                </>
                              )}
                           </div>
                           <div>
                             <span className="font-bold text-gray-800 text-sm block">{log.activity}</span>
                             <div className="flex gap-1 mt-0.5">
                               {log.status === 'completed' && log.diffChallenge !== undefined && (
                                 <span className={`text-[9px] px-1 rounded flex items-center gap-0.5 ${log.diffChallenge > 0 ? 'bg-red-50 text-red-500' : (log.diffChallenge < 0 ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-500')}`}>
                                   {log.diffChallenge > 0 ? <TrendingUp size={8}/> : (log.diffChallenge < 0 ? <TrendingUp size={8} className="rotate-180"/> : <CheckCircle2 size={8}/>)}
                                   {log.diffChallenge > 0 ? `难度+${log.diffChallenge}` : (log.diffChallenge < 0 ? `难度${log.diffChallenge}` : '预测精准')}
                                 </span>
                               )}
                             </div>
                           </div>
                         </div>
                         <div className="flex flex-col items-end gap-1">
                           <span className="text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                           {log.status === 'pending' && (<button onClick={() => startCompletingPlan(log)} className="text-[10px] bg-teal-600 text-white px-2 py-1 rounded shadow-sm hover:bg-teal-700 flex items-center gap-1">去结案 <ArrowRight size={10} /></button>)}
                         </div>
                       </div>
                       {(log.notes || (log.tags && log.tags.length > 0)) && (
                         <div className="bg-slate-50 p-2 rounded-lg text-xs text-gray-600 mt-1">
                            {log.notes && <p className="mb-1 text-slate-500 whitespace-pre-wrap">"{log.notes}"</p>}
                            <div className="flex flex-wrap gap-1">{log.tags?.map(t => (<span key={t} className="text-[9px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">#{t}</span>))}</div>
                         </div>
                       )}
                       <button onClick={() => deleteLog(log.id)} className="absolute bottom-2 right-2 text-gray-300 hover:text-red-500 p-2"><Trash2 size={14} /></button>
                     </div>
                   );
                 })
               )}
             </div>
          </div>
        )}

      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-around p-2 pb-4 z-50 max-w-md mx-auto">
        <button onClick={() => setActiveTab('log')} className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 ${activeTab === 'log' ? 'text-slate-800' : 'text-gray-400'}`}><Plus size={20} strokeWidth={activeTab === 'log' ? 2.5 : 2} /> <span className="text-[9px] font-bold">采集</span></button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 ${activeTab === 'stats' ? 'text-slate-800' : 'text-gray-400'}`}><BarChart2 size={20} strokeWidth={activeTab === 'stats' ? 2.5 : 2} /> <span className="text-[9px] font-bold">洞察</span></button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 ${activeTab === 'history' ? 'text-slate-800' : 'text-gray-400'}`}><History size={20} strokeWidth={activeTab === 'history' ? 2.5 : 2} /> <span className="text-[9px] font-bold">卷宗</span></button>
      </div>

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
        .animate-fade-in { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default FlowDetective;