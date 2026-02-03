import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Plus, BarChart2, History, Brain, Zap, Coffee, Frown, Activity, Trash2, Layers, Tag, Sparkles, FileText, Search, Settings, AlertCircle, CheckCircle2, Mic, MicOff, MousePointer2, Cloud, Loader2, User, Shield, X, LogIn, LogOut, Mail, Lock, KeyRound, Calendar, ArrowRight, Target, ClipboardCheck, TrendingUp, Download, ListTodo, Filter, XCircle, Clock, Smile, Waves, Wrench, Hourglass, ShieldAlert, Siren, ChevronDown, ChevronUp, WifiOff, Database, Lightbulb, Eye, Upload, Languages } from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut, GoogleAuthProvider, linkWithPopup, signInWithPopup, EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, updateDoc, writeBatch } from 'firebase/firestore';

// --- Translations ---
const TRANSLATIONS = {
  zh: {
    // General
    unknown: "未知",
    // FilterBar
    focus: "聚焦",
    all: "全部",
    // ProfileModal
    agentProfile: "探员档案",
    anonymous: "匿名",
    exportCSV: "导出 CSV",
    importCSV: "导入 CSV",
    googleArchive: "Google 存档",
    accountPassword: "账号密码",
    email: "邮箱",
    password: "密码",
    registerBind: "注册绑定",
    signOut: "登出",
    noData: "无数据",
    // Charts
    flowChannel: "心流通道",
    anxiety: "焦虑",
    boredom: "无聊",
    challenge: "挑战",
    skill: "技能",
    foggModel: "福格模型",
    actionZone: "行动区",
    motivation: "动机",
    ability: "能力",
    timeLab: "时空实验室 (Time Lab)",
    predicted: "预估",
    actual: "实际",
    perceived: "体感",
    planDeviation: "计划偏差",
    distortionRate: "扭曲率",
    underestimated: "低估",
    overestimated: "高估",
    accurate: "精准",
    predictionBias: "预判偏差 (实际 - 预估)",
    selfAwarenessMatch: "🎯 你的自我认知非常精准！",
    deviationLarge: "💡 偏差较大，建议在下次预案时调整预期。",
    // AI Summary
    sherlockMind: "夏洛克推演 (Sherlock's Mind)",
    adviceSoulBurning: "🔥 **燃烧的灵魂**：你拥有惊人的内驱力（{val}）。数据表明你不是在“完成任务”，而是在“享受征程”。这种热爱是极其罕见的。",
    adviceSmurfing: "⚔️ **独孤求败**：你的技能远超当前挑战，虽然你很享受，但可能处于「虐菜」状态。试着主动增加难度（如限制时间），或许能触达更深层的心流。",
    adviceCarrot: "🥕 **为了胡萝卜**：你的行动主要由外力驱动。虽然效率尚可，但长期可能导致职业倦怠，试着寻找任务中的乐趣点。",
    advicePotentialBurst: "🚀 **潜能爆发**：你有 {val} 次在技能不足的情况下强行进入了心流。这说明你是典型的“遇强则强”型选手。",
    adviceOverDefense: "🛡️ **过度防御**：你倾向于把困难想得太大（高估难度）。相信自己，其实没那么难。",
    adviceBlindOptimism: "🎢 **盲目乐观**：现实总是比你想象的要难，下次做计划时记得留出余量。",
    adviceLowPower: "🔋 **低电量警报**：焦虑更多源于疲惫。请优先恢复能量，而不是死磕技能。",
    adviceInternalFriction: "🧠 **内耗严重**：你的能量充足，但内在阻力（拖延/恐惧）太大。你需要的是「开始的勇气」，而不是能力。",
    flowRate: "🔍 你的心流率为 {val}%。继续保持记录，更多模式将浮出水面。",
    // TagAnalysis
    behaviorProfile: "行为侧写",
    noDataShort: "暂无数据",
    highFreqState: "高频状态",
    avgMotivation: "平均动力",
    // StatsDashboard
    btnFlow: "心流",
    btnFogg: "福格",
    btnTime: "时空",
    btnCalibrate: "校准",
    // LogList
    noLogs: "暂无记录",
    closeCase: "结案",
    myHunch: "我的预感",
    delete: "删除",
    // FlowDetective (Main)
    immediate: "现场",
    plan: "预案",
    activityPlaceholder: "行动...",
    planNotesPlaceholder: "预案笔记...",
    obsNotesPlaceholder: "观察笔记...",
    psychProfile: "心理侧写 (Psychology)",
    emotion: "情绪",
    entropy: "精神熵",
    hardSkill: "硬技能",
    energy: "能量",
    support: "支持",
    resistance: "阻力",
    complexity: "复杂度",
    urgency: "紧迫度",
    internalRes: "内阻",
    externalRes: "外阻",
    intrinsic: "内驱",
    extrinsic: "外驱",
    actionDoIt: "行动 (Do It)",
    actionThink: "想一想 (Think)",
    correction: "修正",
    saved: "已保存!",
    addToTodo: "加入待办",
    recordCase: "记录案卷",
    localDemoTag: "Local Demo",
    
    // States
    stateFLOW: "心流 (Flow)",
    stateANXIETY: "焦虑 (Anxiety)",
    stateBOREDOM: "无聊 (Boredom)",
    stateAPATHY: "淡漠 (Apathy)",
    stateUNKNOWN: "未知",
  },
  en: {
    // General
    unknown: "Unknown",
    // FilterBar
    focus: "Filter",
    all: "All",
    // ProfileModal
    agentProfile: "Agent Profile",
    anonymous: "Anonymous",
    exportCSV: "Export CSV",
    importCSV: "Import CSV",
    googleArchive: "Google Archive",
    accountPassword: "Email/Pass",
    email: "Email",
    password: "Password",
    registerBind: "Register/Bind",
    signOut: "Sign Out",
    noData: "No Data",
    // Charts
    flowChannel: "Flow Channel",
    anxiety: "Anxiety",
    boredom: "Boredom",
    challenge: "Challenge",
    skill: "Skill",
    foggModel: "Fogg Model",
    actionZone: "Action Zone",
    motivation: "Motivation",
    ability: "Ability",
    timeLab: "Time Lab",
    predicted: "Pred",
    actual: "Actual",
    perceived: "Felt",
    planDeviation: "Plan Dev",
    distortionRate: "Distortion",
    underestimated: "Under",
    overestimated: "Over",
    accurate: "Accurate",
    predictionBias: "Bias (Act-Pred)",
    selfAwarenessMatch: "🎯 Accurate Self-Awareness!",
    deviationLarge: "💡 Large deviation, adjust expectations.",
    // AI Summary
    sherlockMind: "Sherlock's Mind",
    adviceSoulBurning: "🔥 **Burning Soul**: Amazing intrinsic drive ({val}). Data shows you enjoy the journey, not just the task.",
    adviceSmurfing: "⚔️ **Smurfing**: High skill, low challenge. Try adding constraints to reach deeper flow.",
    adviceCarrot: "🥕 **Carrot Driven**: Driven by external rewards. Risk of burnout if no joy is found.",
    advicePotentialBurst: "🚀 **Potential Burst**: Entered flow {val} times with low skills. You rise to the challenge.",
    adviceOverDefense: "🛡️ **Over Defensive**: You overestimate difficulties. Believe in yourself.",
    adviceBlindOptimism: "🎢 **Blind Optimism**: Reality is harder than you think. Buffer your plans.",
    adviceLowPower: "🔋 **Low Battery**: Anxiety comes from fatigue. Prioritize rest.",
    adviceInternalFriction: "🧠 **Internal Friction**: High energy but high internal resistance. You need courage, not skill.",
    flowRate: "🔍 Flow Rate: {val}%. Keep logging to reveal patterns.",
    // TagAnalysis
    behaviorProfile: "Behavior Profile",
    noDataShort: "No Data",
    highFreqState: "Top State",
    avgMotivation: "Avg Mot",
    // StatsDashboard
    btnFlow: "Flow",
    btnFogg: "Fogg",
    btnTime: "Time",
    btnCalibrate: "Calib",
    // LogList
    noLogs: "No Logs",
    closeCase: "Complete",
    myHunch: "My Hunch",
    delete: "Delete",
    // FlowDetective (Main)
    immediate: "Now",
    plan: "Plan",
    activityPlaceholder: "Activity...",
    planNotesPlaceholder: "Plan Notes...",
    obsNotesPlaceholder: "Observation Notes...",
    psychProfile: "Psychology",
    emotion: "Emotion",
    entropy: "Entropy",
    hardSkill: "Hard Skill",
    energy: "Energy",
    support: "Support",
    resistance: "Resistance",
    complexity: "Complexity",
    urgency: "Urgency",
    internalRes: "Internal Res",
    externalRes: "External Res",
    intrinsic: "Intrinsic",
    extrinsic: "Extrinsic",
    actionDoIt: "Do It",
    actionThink: "Think",
    correction: "Edit",
    saved: "Saved!",
    addToTodo: "Add to Todo",
    recordCase: "Log Case",
    localDemoTag: "Local Demo",

    // States
    stateFLOW: "Flow",
    stateANXIETY: "Anxiety",
    stateBOREDOM: "Boredom",
    stateAPATHY: "Apathy",
    stateUNKNOWN: "Unknown",
  }
};

// --- Safe Render Helper ---
const safeRender = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  try { return JSON.stringify(val); } catch (e) { return ''; }
};

// --- Data Sanitizer (Layered Architecture) ---
const sanitizeLog = (docId, data) => {
  const safeNum = (v, def=5) => (typeof v === 'number' && !isNaN(v) ? v : (Number(v) || def));
  const safeStr = (v) => (typeof v === 'string' ? v : '');
  
  let tags = [];
  if (Array.isArray(data.tags)) tags = data.tags.map(String);
  else if (typeof data.tags === 'string' && data.tags.includes(';')) tags = data.tags.split(';').map(t=>t.trim());
  else if (typeof data.tags === 'string') tags = [data.tags];

  // State Recovery
  let flowState = data.flowState;
  if (!flowState || !flowState.id || typeof flowState === 'string' || flowState.name === 'Imported') {
     const name = typeof flowState === 'string' ? flowState : (data.flowStateName || safeStr(data.flowState?.name));
     const match = Object.values(FLOW_STATES).find(s => name.includes(s.name) || name.includes(s.id));
     if (match) flowState = { ...match, icon: null };
     else flowState = { id: 'UNKNOWN', name: name || '未知', color: 'text-gray-400' };
  }

  // --- Layer 1: Predicted / Initial (From Plan) ---
  const initC = safeNum(data.challenge);
  const initS = safeNum(data.skill);
  const initM = safeNum(data.motivation);
  
  // --- Layer 2: Actual / Executed (From Completion) ---
  const actC = data.actualChallenge !== undefined ? safeNum(data.actualChallenge) : initC;
  const actS = data.actualSkill !== undefined ? safeNum(data.actualSkill) : initS;
  const actM = data.actualMotivation !== undefined ? safeNum(data.actualMotivation) : initM;

  // --- Layer 3: Sub-dimensions (Split into Initial vs Actual) ---
  const sub = {
    // Initial / Predicted (Must be preserved)
    skillHard: safeNum(data.skillHard), 
    skillEnergy: safeNum(data.skillEnergy), 
    supportLevel: safeNum(data.supportLevel),
    challengeComplex: safeNum(data.challengeComplex), 
    challengeUrgency: safeNum(data.challengeUrgency), 
    challengeInternal: safeNum(data.challengeInternal), 
    challengeExternal: safeNum(data.challengeExternal),
    motivationIntrinsic: safeNum(data.motivationIntrinsic), 
    motivationExtrinsic: safeNum(data.motivationExtrinsic),
    
    // Actuals (Fallback to Initial if not present)
    actualSkillHard: safeNum(data.actualSkillHard !== undefined ? data.actualSkillHard : data.skillHard),
    actualSkillEnergy: safeNum(data.actualSkillEnergy !== undefined ? data.actualSkillEnergy : data.skillEnergy),
    actualSupportLevel: safeNum(data.actualSupportLevel !== undefined ? data.actualSupportLevel : data.supportLevel),
    
    actualChallengeComplex: safeNum(data.actualChallengeComplex !== undefined ? data.actualChallengeComplex : data.challengeComplex),
    actualChallengeUrgency: safeNum(data.actualChallengeUrgency !== undefined ? data.actualChallengeUrgency : data.challengeUrgency),
    actualChallengeInternal: safeNum(data.actualChallengeInternal !== undefined ? data.actualChallengeInternal : data.challengeInternal),
    actualChallengeExternal: safeNum(data.actualChallengeExternal !== undefined ? data.actualChallengeExternal : data.challengeExternal),
    
    actualMotivationIntrinsic: safeNum(data.actualMotivationIntrinsic !== undefined ? data.actualMotivationIntrinsic : data.motivationIntrinsic),
    actualMotivationExtrinsic: safeNum(data.actualMotivationExtrinsic !== undefined ? data.actualMotivationExtrinsic : data.motivationExtrinsic),
  };

  return {
    id: docId,
    timestamp: data.timestamp || new Date().toISOString(),
    activity: safeStr(data.activity) || '无名行动',
    notes: safeStr(data.notes),
    planNotes: safeStr(data.planNotes),
    closingNotes: safeStr(data.closingNotes),
    tags: tags,
    
    // Core (Initial)
    challenge: initC, skill: initS, motivation: initM,
    
    // Core (Actual)
    actualChallenge: actC, actualSkill: actS, actualMotivation: actM,
    
    // Calculated Diffs (Actual - Initial)
    diffChallenge: data.diffChallenge !== undefined ? Number(data.diffChallenge) : (actC - initC),
    diffSkill: data.diffSkill !== undefined ? Number(data.diffSkill) : (actS - initS),
    diffMotivation: data.diffMotivation !== undefined ? Number(data.diffMotivation) : (actM - initM),

    // Sub-dimensions
    ...sub,

    // Time
    timePredicted: data.timePredicted ? Number(data.timePredicted) : null,
    timeActual: data.timeActual ? Number(data.timeActual) : (data.actualTime ? Number(data.actualTime) : null),
    timePerceived: data.timePerceived ? Number(data.timePerceived) : (data.perceivedTime ? Number(data.perceivedTime) : null),
    
    emotion: safeNum(data.emotion), entropy: safeNum(data.entropy),

    flowState: flowState,
    selfPredictedState: data.selfPredictedState ? { ...data.selfPredictedState, icon: null } : null,
    actualFlowState: data.actualFlowState || flowState, 
    actualActionState: data.actualActionState || null,
    
    status: safeStr(data.status) || 'completed',
    type: safeStr(data.type) || 'log',
    isManualActionOverride: !!data.isManualActionOverride,
    isManualFlowOverride: !!data.isManualFlowOverride
  };
};

// --- Firebase Initialization ---
// Hardcoded config provided by user
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
const isCloudMode = true; // Always true with hardcoded config

// --- Constants ---
const FLOW_STATES = {
  FLOW: { id: 'FLOW', name: '心流 (Flow)', color: 'text-green-600', fill: '#22c55e', bg: 'bg-green-100', icon: Zap },
  ANXIETY: { id: 'ANXIETY', name: '焦虑 (Anxiety)', color: 'text-red-500', fill: '#ef4444', bg: 'bg-red-100', icon: Activity },
  BOREDOM: { id: 'BOREDOM', name: '无聊 (Boredom)', color: 'text-yellow-600', fill: '#eab308', bg: 'bg-yellow-100', icon: Coffee },
  APATHY: { id: 'APATHY', name: '淡漠 (Apathy)', color: 'text-gray-400', fill: '#9ca3af', bg: 'bg-gray-100', icon: Frown }
};

// --- Sub-Components ---
const Slider = ({ label, value, setValue, minLabel, maxLabel, colorClass, isSub, icon: Icon }) => (
  <div className={`mb-3 ${isSub ? 'pl-6 border-l-2 border-slate-100' : ''}`}>
    <div className="flex justify-between items-end mb-1">
      <label className={`font-bold text-slate-700 flex items-center gap-2 ${isSub ? 'text-xs' : 'text-sm'}`}>
        {Icon && <Icon size={isSub ? 12 : 14} className="text-gray-400"/>} {label}
      </label>
      <span className={`font-mono font-bold ${colorClass} ${isSub ? 'text-sm' : 'text-lg'}`}>{value}</span>
    </div>
    <input type="range" min="1" max="10" value={value} onChange={e=>setValue(parseInt(e.target.value))} className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none bg-gray-200 accent-indigo-600`} />
    {!isSub && <div className="flex justify-between text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider"><span>{minLabel}</span><span>{maxLabel}</span></div>}
  </div>
);

const FilterBar = ({ uniqueTags, filterTags, setFilterTags, t }) => {
  if (!uniqueTags || uniqueTags.length === 0) return null;
  const toggleTag = (tag) => {
    if (tag === 'ALL') setFilterTags([]);
    else filterTags.includes(tag) ? setFilterTags(filterTags.filter(t => t !== tag)) : setFilterTags([...filterTags, tag]);
  };
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
      <div className="flex items-center gap-1 text-gray-400 shrink-0 text-[10px] font-bold"><Filter size={10} /> {t('focus')}:</div>
      <button onClick={() => toggleTag('ALL')} className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold transition-colors ${filterTags.length === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{t('all')}</button>
      {uniqueTags.map(tag => (
        <button key={tag} onClick={() => toggleTag(tag)} className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold transition-colors flex items-center gap-1 ${filterTags.includes(tag) ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-500' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>#{tag}{filterTags.includes(tag) && <XCircle size={10} />}</button>
      ))}
    </div>
  );
};

const ProfileModal = ({ user, logs, onClose, onLinkGoogle, onEmailAuth, onSignOut, authError, setAuthError, isCloudMode, onImportCSV, t }) => {
  const [localEmail, setLocalEmail] = useState('');
  const [localPassword, setLocalPassword] = useState('');
  const [mode, setMode] = useState('google');
  const fileInputRef = useRef(null);

  const downloadCSV = () => {
    if (logs.length === 0) { alert(t('noData')); return; }
    // V32.0 Full Headers - Including Sub-dimension Initial/Actual splits
    const headers = [
      'Timestamp','Activity','Status','Tags',
      'Flow State (App)','Self Prediction','Action State',
      'Initial Challenge','Initial Skill','Initial Motivation', 
      'Actual Challenge','Actual Skill','Actual Motivation',
      'Initial Complexity','Initial Urgency','Initial Internal Res','Initial External Res',
      'Actual Complexity','Actual Urgency','Actual Internal Res','Actual External Res',
      'Initial Hard Skill','Initial Energy','Initial Support',
      'Actual Hard Skill','Actual Energy','Actual Support',
      'Initial Intrinsic','Initial Extrinsic',
      'Actual Intrinsic','Actual Extrinsic',
      'Predicted Time','Actual Time','Perceived Time',
      'Emotion','Entropy',
      'Plan Notes','Closing Notes'
    ];
    const rows = logs.map(log => {
      const dateStr = new Date(log.timestamp).toLocaleString();
      const activityStr = safeRender(log.activity).replace(/"/g, '""');
      
      return [
        `"${dateStr}"`,`"${activityStr}"`,log.status,`"${(log.tags||[]).join(';')}"`,
        safeRender(log.flowState?.name), safeRender(log.selfPredictedState?.name || '-'), safeRender(log.actionState?.label),
        log.challenge, log.skill, log.motivation,
        log.actualChallenge, log.actualSkill, log.actualMotivation,
        // Initials (from sanitizeLog fallback)
        log.challengeComplex, log.challengeUrgency, log.challengeInternal, log.challengeExternal,
        // Actuals
        log.actualChallengeComplex, log.actualChallengeUrgency, log.actualChallengeInternal, log.actualChallengeExternal,
        // Skills
        log.skillHard, log.skillEnergy, log.supportLevel,
        log.actualSkillHard, log.actualSkillEnergy, log.actualSupportLevel,
        // Motivations
        log.motivationIntrinsic, log.motivationExtrinsic,
        log.actualMotivationIntrinsic, log.actualMotivationExtrinsic,
        // Misc
        log.timePredicted || '', log.timeActual || '', log.timePerceived || '',
        log.emotion, log.entropy,
        `"${safeRender(log.planNotes).replace(/"/g, '""')}"`,`"${safeRender(log.closingNotes).replace(/"/g, '""')}"`
      ].join(',');
    });
    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `flow_detective_ultimate_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => { onImportCSV(evt.target.result); onClose(); };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
        <div className="flex flex-col items-center mb-6">
          <Shield size={40} className="text-indigo-600 mb-2" />
          <h2 className="text-xl font-bold text-gray-800">{t('agentProfile')}</h2>
          <p className="text-xs text-gray-500">{user.isAnonymous ? t('anonymous') : user.email}</p>
        </div>
        <div className="space-y-4">
            <div className="flex gap-2">
               <button onClick={downloadCSV} className="flex-1 bg-indigo-50 text-indigo-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors"><Download size={14} /> {t('exportCSV')}</button>
               <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-teal-50 text-teal-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-teal-100 transition-colors"><Upload size={14} /> {t('importCSV')}</button>
               <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
            </div>

            <div className="border-t border-gray-100 pt-4">
              {user.isAnonymous ? (
                <>
                  <div className="flex p-1 bg-gray-100 rounded-lg mb-3">
                    <button onClick={() => {setMode('google'); setAuthError('')}} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${mode === 'google' ? 'bg-white shadow' : 'text-gray-400'}`}>Google</button>
                    <button onClick={() => {setMode('email'); setAuthError('')}} className={`flex-1 py-1.5 text-xs font-bold rounded-md ${mode === 'email' ? 'bg-white shadow' : 'text-gray-400'}`}>{t('accountPassword')}</button>
                  </div>
                  {authError && <div className="p-2 mb-3 bg-red-50 text-red-600 text-[10px] rounded-lg">{authError}</div>}
                  {mode === 'google' ? <button onClick={onLinkGoogle} className="w-full bg-white border py-2 rounded-xl text-xs">{t('googleArchive')}</button> : <div className="space-y-2"><input type="email" placeholder={t('email')} className="w-full border p-2 rounded text-xs" value={localEmail} onChange={e=>setLocalEmail(e.target.value)} /><input type="password" placeholder={t('password')} className="w-full border p-2 rounded text-xs" value={localPassword} onChange={e=>setLocalPassword(e.target.value)} /><button onClick={()=>onEmailAuth(localEmail, localPassword, false)} className="w-full bg-indigo-600 text-white py-2 rounded text-xs">{t('registerBind')}</button></div>}
                </>
              ) : <button onClick={onSignOut} className="w-full bg-gray-50 py-2 rounded text-xs">{t('signOut')}</button>}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Charts ---

const FlowChannelChart = ({ logs, threshold, t }) => {
  const size = 300; const t_px = (threshold / 10) * size; 
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-fade-in relative">
      <div className="absolute top-2 left-2 text-[10px] text-gray-400 font-bold bg-white/80 px-2 rounded backdrop-blur-sm z-10 border border-gray-100">{t('flowChannel')}</div>
      <div className="relative" style={{ width: '100%', paddingBottom: '100%' }}>
         <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 w-full h-full overflow-hidden rounded-lg border border-gray-100" shapeRendering="geometricPrecision">
            <rect width={size} height={size} fill="#fef3c7" opacity="0.1" />
            <line x1={size/2} y1="0" x2={size/2} y2={size} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1={size/2} x2={size} y2={size/2} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
            <path d={`M 0 0 L ${size} 0 L 0 ${size} Z`} fill="#fee2e2" opacity="0.3" /> 
            <polygon points={`0,${size - t_px} ${size},${-t_px} ${size},${t_px} 0,${size + t_px}`} fill="#dcfce7" opacity="0.6" />
            <circle cx="0" cy={size} r={size * 0.3} fill="#f3f4f6" opacity="0.8" />
            <text x={size*0.1} y={size*0.1} fontSize="10" fontWeight="bold" opacity="0.5">{t('anxiety')}</text>
            <text x={size*0.8} y={size*0.9} fontSize="10" fontWeight="bold" opacity="0.5">{t('boredom')}</text>
            {logs.map((log) => { 
               const x = ((log.actualSkill - 1) / 9) * size;
               const y = size - ((log.actualChallenge - 1) / 9) * size;
               const r = 3 + (log.actualMotivation * 1.5); 
               const fill = log.actualFlowState?.fill || '#cbd5e1';
               return <circle key={log.id} cx={x} cy={y} r={r} fill={fill} stroke={fill} strokeWidth={1} fillOpacity={0.6}><title>{safeRender(log.activity)}</title></circle>;
            })}
         </svg>
         <div className="absolute left-1 top-1/2 -rotate-90 text-[9px] text-gray-400 font-bold">{t('challenge')}</div>
         <div className="absolute bottom-1 left-1/2 text-[9px] text-gray-400 font-bold">{t('skill')}</div>
      </div>
    </div>
  );
};

const FoggBehaviorChart = ({ logs, bias, t }) => {
  const size = 300;
  let pathD = `M 0 0`; const points = []; const curveFactor = 10 - (bias * 2); 
  for (let s = 0.5; s <= 10; s += 0.5) {
      let m = (curveFactor * 2) / (s + 0.5); 
      const x_px = ((s - 1) / 9) * size; const y_px = size - ((m - 1) / 9) * size; 
      if (y_px >= 0 && y_px <= size) points.push(`${x_px},${y_px}`);
  }
  if (points.length > 0) pathD = `M 0 0 L ${points[0]} L ${points.join(' ')} L ${size} ${size}`;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-fade-in relative">
      <div className="absolute top-2 left-2 text-[10px] text-gray-400 font-bold bg-white/80 px-2 rounded backdrop-blur-sm z-10 border border-gray-100">{t('foggModel')}</div>
      <div className="relative" style={{ width: '100%', paddingBottom: '100%' }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 w-full h-full overflow-hidden rounded-lg border border-gray-100" shapeRendering="geometricPrecision">
          <line x1={size/2} y1="0" x2={size/2} y2={size} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
          <line x1="0" y1={size/2} x2={size} y2={size/2} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4" />
          <path d={`${pathD} L 0 0 Z`} fill="#dcfce7" opacity="0.3" />
          <path d={`M ${points[0]} L ${points.join(' ')}`} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x={size*0.8} y={size*0.2} fill="#16a34a" fontSize="10" fontWeight="bold" opacity="0.8">{t('actionZone')}</text>
          {logs.map((log) => { 
             const s = log.actualSkill || log.skill || 5; 
             const m = log.actualMotivation || log.motivation || 5;
             const x = ((s - 1) / 9) * size; 
             const y = size - ((m - 1) / 9) * size; 
             const fill = log.actualFlowState?.fill || '#cbd5e1';
             return <circle key={log.id} cx={x} cy={y} r={4} fill={fill} stroke="#fff" strokeWidth={1} fillOpacity={0.8}><title>{safeRender(log.activity)}</title></circle>;
          })}
        </svg>
        <div className="absolute left-[-15px] top-1/2 -rotate-90 text-[9px] text-gray-400 font-bold">{t('motivation')}</div>
        <div className="absolute bottom-[-15px] left-1/2 text-[9px] text-gray-400 font-bold">{t('ability')}</div>
      </div>
    </div>
  );
};

const TimeDistortionChart = ({ logs, t }) => {
  const timeLogs = logs.filter(l => l.timeActual && l.timePerceived);
  const avgActual = timeLogs.length > 0 ? timeLogs.reduce((acc,l) => acc + (l.timeActual || 0), 0) / timeLogs.length : 0;
  const avgPerceived = timeLogs.length > 0 ? timeLogs.reduce((acc,l) => acc + (l.timePerceived || 0), 0) / timeLogs.length : 0;
  const planLogs = logs.filter(l => l.timePredicted);
  const avgPredicted = planLogs.length > 0 ? planLogs.reduce((acc,l) => acc + (l.timePredicted || 0), 0) / planLogs.length : avgActual;

  if (timeLogs.length === 0 && planLogs.length === 0) return <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center"><Clock size={32} className="mx-auto text-gray-300 mb-2"/><p className="text-gray-500 text-xs">{t('noDataShort')}</p></div>;

  const distortion = avgActual > 0 ? avgPerceived / avgActual : 1;
  const predictionError = avgActual > 0 ? (avgActual - avgPredicted) / avgActual : 0; 

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-fade-in">
      <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2"><Clock size={14}/> {t('timeLab')}</h3>
      
      <div className="flex items-end justify-around h-32 pb-6 relative">
          <div className="flex flex-col items-center w-1/4 group"><div className="w-full bg-teal-200 rounded-t-lg transition-all relative" style={{height: `${Math.min((avgPredicted/(avgActual||1))*50, 100)}%`}}></div><span className="text-[10px] font-bold text-teal-600 mt-2">{t('predicted')}</span><span className="text-[9px] text-gray-400">{avgPredicted.toFixed(0)}m</span></div>
          <div className="flex flex-col items-center w-1/4 group"><div className="w-full bg-slate-300 rounded-t-lg relative" style={{height: '50%'}}></div><span className="text-[10px] font-bold text-slate-600 mt-2">{t('actual')}</span><span className="text-[9px] text-gray-400">{avgActual.toFixed(0)}m</span></div>
          <div className="flex flex-col items-center w-1/4 group"><div className={`w-full rounded-t-lg transition-all relative ${distortion < 0.9 ? 'bg-green-400' : (distortion > 1.1 ? 'bg-red-400' : 'bg-orange-300')}`} style={{height: `${Math.min((avgPerceived/(avgActual||1))*50, 100)}%`}}></div><span className="text-[10px] font-bold text-orange-600 mt-2">{t('perceived')}</span><span className="text-[9px] text-gray-400">{avgPerceived.toFixed(0)}m</span></div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-50">
        <div className="text-[9px] text-gray-500"><b>{t('planDeviation')}:</b> {predictionError > 0.1 ? `${t('underestimated')} ${(predictionError*100).toFixed(0)}%` : (predictionError < -0.1 ? `${t('overestimated')} ${Math.abs(predictionError*100).toFixed(0)}%` : t('accurate'))}</div>
        <div className="text-[9px] text-gray-500 text-right"><b>{t('distortionRate')}:</b> {distortion.toFixed(2)}x</div>
      </div>
    </div>
  );
};

const PredictionAccuracyChart = ({ logs, filterTag, t }) => {
  const completedPlans = logs.filter(l => l.status === 'completed' && l.diffChallenge !== undefined);
  if (completedPlans.length === 0) return <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center"><Target size={32} className="mx-auto text-gray-300 mb-2"/><p className="text-gray-500 text-xs">{t('noDataShort')}</p></div>;
  
  const avgDiffC = completedPlans.reduce((acc, l) => acc + (l.diffChallenge || 0), 0) / completedPlans.length;
  const avgDiffS = completedPlans.reduce((acc, l) => acc + (l.diffSkill || 0), 0) / completedPlans.length;
  const avgDiffM = completedPlans.reduce((acc, l) => acc + (l.diffMotivation || 0), 0) / completedPlans.length;

  const Bar = ({ label, val, color }) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] font-bold w-12 text-right text-gray-500">{label}</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex items-center relative">
         <div className="absolute left-1/2 w-0.5 h-full bg-slate-300 z-10"></div> 
         <div 
           className={`h-full absolute ${color} opacity-80`} 
           style={{ 
             left: val >= 0 ? '50%' : `calc(50% - ${Math.min(Math.abs(val)*10, 50)}%)`,
             width: `${Math.min(Math.abs(val)*10, 50)}%` 
           }}
         ></div>
      </div>
      <span className={`text-[10px] font-mono font-bold w-16 text-right ${val > 0.1 ? 'text-red-500' : (val < -0.1 ? 'text-green-500' : 'text-gray-400')}`}>
        {Math.abs(val) < 0.1 ? t('accurate') : (val > 0 ? `${t('underestimated')}${val.toFixed(1)}` : `${t('overestimated')}${Math.abs(val).toFixed(1)}`)}
      </span>
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-fade-in">
      <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2"><Target size={14} /> {t('predictionBias')}</h3>
      <Bar label={t('challenge')} val={avgDiffC} color={avgDiffC > 0 ? 'bg-red-400' : 'bg-orange-400'} />
      <Bar label={t('skill')} val={avgDiffS} color={avgDiffS > 0 ? 'bg-green-400' : 'bg-red-400'} />
      <Bar label={t('motivation')} val={avgDiffM} color={avgDiffM > 0 ? 'bg-green-400' : 'bg-red-400'} />
      <div className="mt-2 text-[9px] text-gray-500 text-center italic">
        {Math.abs(avgDiffC) < 0.5 && Math.abs(avgDiffS) < 0.5 ? t('selfAwarenessMatch') : t('deviationLarge')}
      </div>
    </div>
  );
};

const AISummary = ({ logs, t }) => {
  const completed = logs.filter(l => l.status !== 'pending');
  if (completed.length === 0) return null;
  
  // Advanced Metrics
  const avgIntrinsic = completed.reduce((acc,l)=>acc+(l.actualMotivationIntrinsic||l.motivationIntrinsic||5),0)/completed.length;
  const avgExtrinsic = completed.reduce((acc,l)=>acc+(l.actualMotivationExtrinsic||l.motivationExtrinsic||5),0)/completed.length;
  const avgEnergy = completed.reduce((acc,l)=>acc+(l.actualSkillEnergy||l.skillEnergy||5),0)/completed.length;
  const avgChallenge = completed.reduce((acc,l)=>acc+(l.actualChallenge||5),0)/completed.length;
  const avgSkill = completed.reduce((acc,l)=>acc+(l.actualSkill||5),0)/completed.length;
  const avgResInternal = completed.reduce((acc,l)=>acc+(l.actualChallengeInternal||l.challengeInternal||5),0)/completed.length;

  const flowLogs = completed.filter(l => l.actualFlowState?.id === 'FLOW');
  const anxietyLogs = completed.filter(l => l.actualFlowState?.id === 'ANXIETY');
  
  const advice = [];
  
  // 1. Soul Reader (Intrinsic Motivation)
  if (avgIntrinsic > 8) {
      advice.push(t('adviceSoulBurning').replace('{val}', avgIntrinsic.toFixed(1)));
      // Special logic for "Smurfing" (High Skill, High Intrinsic, Low Challenge)
      if (avgSkill > 8 && avgChallenge < 6) {
          advice.push(t('adviceSmurfing'));
      }
  } else if (avgExtrinsic > avgIntrinsic + 3) {
      advice.push(t('adviceCarrot'));
  }

  // 2. The "Hard Carry" Detector (High Challenge, Low Skill, but Success)
  const hardCarry = completed.filter(l => (l.actualChallenge > l.actualSkill + 2) && l.actualFlowState?.id === 'FLOW');
  if (hardCarry.length > 0) {
      advice.push(t('advicePotentialBurst').replace('{val}', hardCarry.length));
  }

  // 3. Calibration Insight
  const diffLogs = completed.filter(l => l.diffChallenge !== undefined);
  if (diffLogs.length > 0) {
      const avgDiffC = diffLogs.reduce((acc,l)=>acc+l.diffChallenge,0)/diffLogs.length;
      if (avgDiffC < -1.5) advice.push(t('adviceOverDefense'));
      else if (avgDiffC > 1.5) advice.push(t('adviceBlindOptimism'));
  }

  // 4. Energy Management
  if (avgEnergy < 4.5) {
      if (anxietyLogs.length > flowLogs.length) advice.push(t('adviceLowPower'));
  } else if (avgEnergy > 8 && avgResInternal > 7) {
      advice.push(t('adviceInternalFriction'));
  }

  if (advice.length === 0) advice.push(t('flowRate').replace('{val}', Math.round(flowLogs.length/completed.length*100)));

  return (
    <div className="bg-gradient-to-r from-slate-800 to-indigo-900 p-4 rounded-xl border border-indigo-800 mt-4 text-indigo-100 shadow-lg">
      <h3 className="text-xs font-bold text-white flex items-center gap-1 mb-2"><Sparkles size={12} className="text-yellow-400"/> {t('sherlockMind')}</h3>
      <div className="text-[10px] leading-relaxed space-y-2">
         {advice.map((text, i) => <p key={i}>{text}</p>)}
      </div>
    </div>
  );
};

const TagAnalysis = ({ logs, t }) => { /* ... Same ... */
  const tagStats = {};
  logs.forEach(log => {
    if (!log.tags) return;
    log.tags.forEach(tag => {
      if (!tagStats[tag]) { tagStats[tag] = { count: 0, totalMot: 0, flowStates: {} }; }
      tagStats[tag].count++;
      tagStats[tag].totalMot += (log.actualMotivation || 5);
      const stateId = log.actualFlowState?.id || 'UNKNOWN';
      tagStats[tag].flowStates[stateId] = (tagStats[tag].flowStates[stateId] || 0) + 1;
    });
  });
  const sortedTags = Object.entries(tagStats).map(([tag, data]) => ({
      tag, avgMot: (data.totalMot / data.count).toFixed(1), count: data.count, topStateId: Object.entries(data.flowStates).sort((a,b) => b[1] - a[1])[0]?.[0] || 'UNKNOWN'
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mt-4 animate-fade-in">
        <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-4 flex items-center gap-2"><Search size={14} /> {t('behaviorProfile')}</h3>
        <div className="space-y-3">
          {sortedTags.length === 0 ? <p className="text-xs text-gray-400 italic text-center py-4">{t('noDataShort')}</p> : sortedTags.map((item) => (
              <div key={item.tag} className={`flex items-center justify-between text-xs border-b border-gray-50 pb-2 last:border-0`}>
                <div className="flex items-center gap-2"><span className={`px-2 py-1 rounded-md font-bold bg-indigo-50 text-indigo-700`}>#{item.tag}</span><span className="text-gray-400">x{item.count}</span></div>
                <div className="flex gap-3 text-right">
                  <div><span className="block font-bold text-gray-700">{t('state' + item.topStateId) || item.topStateId}</span><span className="text-[9px] text-gray-400">{t('highFreqState')}</span></div>
                  <div><span className={`block font-bold ${item.avgMot > 6 ? 'text-green-600' : 'text-gray-500'}`}>{item.avgMot}</span><span className="text-[9px] text-gray-400">{t('avgMotivation')}</span></div>
                </div>
              </div>
            ))}
        </div>
    </div>
  );
};

const StatsDashboard = ({ logs, uniqueTags, filterTags, setFilterTags, personalFlowThreshold, personalActionBias, t }) => {
  const [view, setView] = useState('FLOW'); 
  return (
    <div className="space-y-4 animate-fade-in">
       <FilterBar uniqueTags={uniqueTags} filterTags={filterTags} setFilterTags={setFilterTags} t={t} />
       <div className="flex justify-center mb-2 bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setView('FLOW')} className={`px-3 py-1 rounded-md text-[10px] font-bold ${view === 'FLOW' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}>{t('btnFlow')}</button>
          <button onClick={() => setView('FOGG')} className={`px-3 py-1 rounded-md text-[10px] font-bold ${view === 'FOGG' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}>{t('btnFogg')}</button>
          <button onClick={() => setView('TIME')} className={`px-3 py-1 rounded-md text-[10px] font-bold ${view === 'TIME' ? 'bg-white shadow text-orange-600' : 'text-gray-400'}`}>{t('btnTime')}</button>
          <button onClick={() => setView('PREDICTION')} className={`px-3 py-1 rounded-md text-[10px] font-bold ${view === 'PREDICTION' ? 'bg-white text-teal-600 shadow' : 'text-gray-400'}`}>{t('btnCalibrate')}</button>
       </div>
       {view === 'FLOW' && <FlowChannelChart logs={logs} threshold={personalFlowThreshold} t={t} />}
       {view === 'FOGG' && <FoggBehaviorChart logs={logs} bias={personalActionBias} t={t} />}
       {view === 'TIME' && <TimeDistortionChart logs={logs} t={t} />}
       {view === 'PREDICTION' && <PredictionAccuracyChart logs={logs} filterTag={null} t={t} />}
       <AISummary logs={logs} t={t} />
       <TagAnalysis logs={logs} t={t} />
    </div>
  );
};

// ... LogList (Stable) ...
const LogList = ({ logs, onDelete, onComplete, t }) => {
  const [expandedId, setExpandedId] = useState(null);
  if (logs.length === 0) return <div className="text-center text-gray-400 py-10 text-xs">{t('noLogs')}</div>;
  return (
    <div className="space-y-3">
      {logs.map(log => {
        const isExpanded = expandedId === log.id;
        const isPending = log.status === 'pending';
        // Defense against null objects
        const flowState = log.actualFlowState || log.flowState || {};
        const bgClass = flowState.bg || 'bg-gray-100';
        const colorClass = flowState.color || 'text-gray-400';
        const stateId = flowState.id;
        
        // Recover color if missing from import
        const displayColor = colorClass.startsWith('text') ? colorClass : (stateId === 'FLOW' ? 'text-green-600' : 'text-gray-400');

        return (
          <div key={log.id} onClick={() => setExpandedId(isExpanded ? null : log.id)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden active:scale-[0.99] transition-transform cursor-pointer">
             {isPending && <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-400"></div>}
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className={`p-1.5 rounded-lg ${bgClass}`}>
                      {isPending ? <Calendar size={14} className="text-teal-500"/> : (
                        stateId === 'FLOW' ? <Zap size={14} className={displayColor} /> : 
                        stateId === 'ANXIETY' ? <Activity size={14} className={displayColor} /> :
                        stateId === 'BOREDOM' ? <Coffee size={14} className={displayColor} /> :
                        <Frown size={14} className={displayColor} />
                      )}
                   </div>
                   <div>
                     <span className="font-bold text-gray-800 text-sm block">{safeRender(log.activity)}</span>
                     <div className="text-[9px] text-gray-400">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                   </div>
                </div>
                {isPending && <button onClick={(e)=>{e.stopPropagation(); onComplete(log)}} className="bg-teal-50 text-teal-600 px-2 py-1 rounded text-xs font-bold">{t('closeCase')}</button>}
             </div>
             {isExpanded && (
               <div className="mt-3 pt-2 border-t border-gray-50 text-xs space-y-2 animate-fade-in">
                  <div className="grid grid-cols-3 gap-2 mb-2 text-gray-500 text-[10px]">
                     <div>{t('challenge')}: {log.actualChallenge || log.challenge}</div>
                     <div>{t('skill')}: {log.actualSkill || log.skill}</div>
                     <div>{t('motivation')}: {log.actualMotivation || log.motivation}</div>
                  </div>
                  {/* Time */}
                  {(log.timeActual || log.timePerceived) && (
                      <div className="flex justify-between bg-gray-50 p-2 rounded text-gray-600 text-[10px] mb-2">
                         <span>{t('actual')}: {log.timeActual || '-'}m</span>
                         <span className={log.timePerceived < log.timeActual ? 'text-green-600 font-bold' : ''}>{t('perceived')}: {log.timePerceived || '-'}m</span>
                         {log.timePredicted && <span className="text-gray-400">{t('predicted')}: {log.timePredicted}m</span>}
                      </div>
                  )}
                  {/* Self Prediction (Safe Check) */}
                  {log.selfPredictedState && <div className="bg-indigo-50 p-2 rounded text-indigo-700 text-[10px] mb-2 font-bold">{t('myHunch')}: {t('state'+log.selfPredictedState.id) || safeRender(log.selfPredictedState.name)}</div>}
                  {/* Notes */}
                  {log.planNotes && <div className="bg-teal-50/50 p-2 rounded text-teal-800 mb-1 whitespace-pre-wrap">📅 {safeRender(log.planNotes)}</div>}
                  {log.closingNotes && <div className="bg-indigo-50/50 p-2 rounded text-indigo-800 mb-1 whitespace-pre-wrap">🏁 {safeRender(log.closingNotes)}</div>}
                  {(!log.planNotes && log.notes) && <div className="bg-yellow-50 p-2 rounded text-gray-600 whitespace-pre-wrap">{safeRender(log.notes)}</div>}
                  
                  <button onClick={(e)=>{e.stopPropagation(); onDelete(log.id, e)}} className="w-full text-center text-red-400 py-1 border-t border-red-50 mt-2">{t('delete')}</button>
               </div>
             )}
          </div>
        );
      })}
    </div>
  );
};

// --- Main App Component ---
const FlowDetective = () => {
  const [activeTab, setActiveTab] = useState('log'); 
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  
  // Language State
  const [lang, setLang] = useState(localStorage.getItem('flow_lang') || 'zh');
  const toggleLang = () => {
    const newLang = lang === 'zh' ? 'en' : 'zh';
    setLang(newLang);
    localStorage.setItem('flow_lang', newLang);
  };
  const t = (key) => TRANSLATIONS[lang][key] || key;

  // Inputs
  const [currentActivity, setCurrentActivity] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isDeepDive, setIsDeepDive] = useState(false);
  const [logMode, setLogMode] = useState('immediate');
  const [completingLog, setCompletingLog] = useState(null);

  // Dimensions
  const [skillComposite, setSkillComposite] = useState(5);
  const [skillHard, setSkillHard] = useState(5);  
  const [skillEnergy, setSkillEnergy] = useState(5); 
  const [supportLevel, setSupportLevel] = useState(5); 
  const [challengeComposite, setChallengeComposite] = useState(5);
  const [challengeComplex, setChallengeComplex] = useState(5); 
  const [challengeUrgency, setChallengeUrgency] = useState(5); 
  const [challengeInternal, setChallengeInternal] = useState(5); 
  const [challengeExternal, setChallengeExternal] = useState(5); 
  const [motivationComposite, setMotivationComposite] = useState(5);
  const [motivationIntrinsic, setMotivationIntrinsic] = useState(5); 
  const [motivationExtrinsic, setMotivationExtrinsic] = useState(5); 
  const [emotion, setEmotion] = useState(5); 
  const [entropy, setEntropy] = useState(5); 
  const [timePredicted, setTimePredicted] = useState(''); 
  const [timeActual, setTimeActual] = useState(''); 
  const [timePerceived, setTimePerceived] = useState(''); 
  const [selfPredictedState, setSelfPredictedState] = useState(null);

  const [manualFlowState, setManualFlowState] = useState(null);
  const [manualActionState, setManualActionState] = useState(null);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const [filterTags, setFilterTags] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [authGlobalError, setAuthGlobalError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const personalFlowThreshold = useMemo(() => 2.5, []); 
  const personalActionBias = useMemo(() => 0, []);

  const finalFlowState = useMemo(() => {
    if (manualFlowState) return manualFlowState;
    // Apathy Check: Low Challenge & Low Skill
    if (challengeComposite <= 3 && skillComposite <= 3) return FLOW_STATES.APATHY;
    
    const diff = challengeComposite - skillComposite;
    if (Math.abs(diff) <= personalFlowThreshold) return FLOW_STATES.FLOW;
    if (diff > 0) return FLOW_STATES.ANXIETY;
    return FLOW_STATES.BOREDOM;
  }, [manualFlowState, challengeComposite, skillComposite, personalFlowThreshold]);

  const finalActionState = useMemo(() => {
    if (manualActionState) return manualActionState;
    
    const bias = personalActionBias;
    const curveFactor = 10 - (bias * 2);
    // Fogg Behavior Model Curve
    const thresholdMotivation = (curveFactor * 2) / (skillComposite + 0.5);
    
    const isActionable = motivationComposite >= thresholdMotivation;
    
    return {
      isActionable,
      label: isActionable ? t('actionDoIt') : t('actionThink'),
    };
  }, [manualActionState, motivationComposite, skillComposite, personalActionBias, lang]); // Added lang dependency

  const filteredLogs = useMemo(() => {
    if (filterTags.length === 0) return logs;
    return logs.filter(l => l.tags && l.tags.some(t => filterTags.includes(t)));
  }, [logs, filterTags]);

  const statsLogs = useMemo(() => filteredLogs.filter(l => l.status !== 'pending'), [filteredLogs]);
  const uniqueTags = useMemo(() => [...new Set(logs.flatMap(l => l.tags))].sort(), [logs]);

  // Auth & Sync
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      if (u) {
        setAuthGlobalError(null);
        setUser(u);
      } else {
        // Only sign in anonymously if explicitly no user
        signInAnonymously(auth).catch(e => {
          console.error("Auth Error:", e);
          setAuthGlobalError(`Auth Failed: ${e.code || e.message || 'Unknown Error'}`);
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'logs'));
    return onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => sanitizeLog(d.id, d.data()));
      fetched.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      setLogs(fetched);
      setIsLoadingLogs(false);
    });
  }, [user]);

  // Dimensions Sync Logic
  useEffect(() => {
    if (isDeepDive) {
      setSkillComposite(Math.round((skillHard * 0.4) + (skillEnergy * 0.4) + (supportLevel * 0.2)));
      setChallengeComposite(Math.round((challengeComplex * 0.4) + (challengeUrgency * 0.2) + (challengeInternal * 0.2) + (challengeExternal * 0.2)));
      setMotivationComposite(Math.round((motivationIntrinsic + motivationExtrinsic) / 2));
    }
  }, [skillHard, skillEnergy, supportLevel, challengeComplex, challengeUrgency, challengeInternal, challengeExternal, motivationIntrinsic, motivationExtrinsic, isDeepDive]);

  useEffect(() => { setManualFlowState(null); setManualActionState(null); setIsCalibrating(false); }, [skillComposite, challengeComposite, motivationComposite]);

  // Handlers
  const handleAddTag = useCallback((e) => { 
    if (e.key === 'Enter' && tagInput.trim()) { 
      e.preventDefault(); 
      const t = tagInput.trim();
      if(!tags.includes(t)) setTags(prev => [...prev, t]); 
      setTagInput(''); 
    } 
  }, [tagInput, tags]);

  const addHistoricalTag = useCallback((t) => { if(!tags.includes(t)) setTags(prev => [...prev, t]); }, [tags]);
  const removeTag = useCallback((t) => setTags(prev => prev.filter(tag => tag !== t)), []);

  const deleteLog = useCallback(async (id, e) => {
    if (e) e.stopPropagation();
    if (!user || !window.confirm("Confirm delete?")) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'logs', id));
  }, [user, logs]);

  const resetForm = useCallback(() => {
    setCurrentActivity(''); setNotes(''); setTags([]); setTagInput('');
    setChallengeComposite(5); setSkillComposite(5); setMotivationComposite(5);
    setSkillHard(5); setSkillEnergy(5); setSupportLevel(5);
    setChallengeComplex(5); setChallengeUrgency(5); setChallengeInternal(5); setChallengeExternal(5);
    setMotivationIntrinsic(5); setMotivationExtrinsic(5);
    setEmotion(5); setEntropy(5); setTimePredicted(''); setTimeActual(''); setTimePerceived('');
    setManualFlowState(null); setManualActionState(null); setIsCalibrating(false); setSelfPredictedState(null);
    setCompletingLog(null); setLogMode('immediate');
  }, []);

  const startCompleting = useCallback((log) => {
    setLogMode('completing'); setCompletingLog(log);
    setCurrentActivity(log.activity); setNotes(''); setTags(log.tags||[]);
    if (log.timePredicted) setTimePredicted(String(log.timePredicted)); 
    setChallengeComposite(5); setSkillComposite(5); setMotivationComposite(5);
    setActiveTab('log');
  }, []);

  const handleLog = async () => {
    if (!currentActivity.trim()) return;
    if (!user) {
      alert(t('unknown') + ": No User. " + (authGlobalError || "Check connection/domain."));
      return;
    }
    setIsSubmitting(true);

    // Failsafe: Stop spinner after 10s if something hangs
    const timeoutId = setTimeout(() => setIsSubmitting(false), 10000);

    const deepData = {
      skillHard, skillEnergy, supportLevel,
      challengeComplex, challengeUrgency, challengeInternal, challengeExternal,
      motivationIntrinsic, motivationExtrinsic, emotion, entropy,
      timePredicted: timePredicted ? parseFloat(timePredicted) : null,
      timeActual: timeActual ? parseFloat(timeActual) : null,
      timePerceived: timePerceived ? parseFloat(timePerceived) : null,
      selfPredictedState: selfPredictedState ? { ...selfPredictedState, icon: null } : null
    };
    const commonData = {
      id: Date.now().toString(), timestamp: new Date().toISOString(),
      activity: safeRender(currentActivity), notes: safeRender(notes), tags,
      challenge: challengeComposite, skill: skillComposite, motivation: motivationComposite,
      flowState: { ...finalFlowState, icon: null }, actionState: finalActionState,
      isManualFlowOverride: !!manualFlowState, isManualActionOverride: manualActionState !== null,
      ...deepData
    };
    
    if (logMode === 'plan') commonData.planNotes = safeRender(notes);
    else commonData.closingNotes = safeRender(notes);

    try {
      if (logMode === 'completing' && completingLog) {
        // PRESERVE selfPredictedState if not changed
        const mergedSelfPred = deepData.selfPredictedState || completingLog.selfPredictedState;
        
        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'logs', completingLog.id), {
          ...commonData, status: 'completed', completedAt: new Date().toISOString(),
          diffChallenge: challengeComposite - (completingLog.challenge||5),
          planNotes: completingLog.planNotes || completingLog.notes || '', 
          closingNotes: safeRender(notes),
          selfPredictedState: mergedSelfPred ? { ...mergedSelfPred, icon: null } : null,
          
          // EXPLICIT ACTUALS (Fix v31.0): Store new values as actuals, preserving old ones
          actualChallenge: challengeComposite, actualSkill: skillComposite, actualMotivation: motivationComposite,
          actualSkillHard: skillHard, actualSkillEnergy: skillEnergy, actualSupportLevel: supportLevel,
          actualChallengeComplex: challengeComplex, actualChallengeUrgency: challengeUrgency, actualChallengeInternal: challengeInternal, actualChallengeExternal: challengeExternal,
          actualMotivationIntrinsic: motivationIntrinsic, actualMotivationExtrinsic: motivationExtrinsic,
          
          // RESTORE INITIALS (Ensure they are not overwritten by commonData if they exist)
          challenge: completingLog.challenge,
          skill: completingLog.skill,
          motivation: completingLog.motivation,
          skillHard: completingLog.skillHard,
          skillEnergy: completingLog.skillEnergy,
          supportLevel: completingLog.supportLevel,
          challengeComplex: completingLog.challengeComplex,
          challengeUrgency: completingLog.challengeUrgency,
          challengeInternal: completingLog.challengeInternal,
          challengeExternal: completingLog.challengeExternal,
          motivationIntrinsic: completingLog.motivationIntrinsic,
          motivationExtrinsic: completingLog.motivationExtrinsic,
        });
        setActiveTab('history');
      } else {
        // Initial = Actual for new immediate log
        const logToSave = {
          ...commonData,
          status: logMode === 'plan' ? 'pending' : 'completed',
          type: logMode === 'plan' ? 'plan' : 'log',
          actualChallenge: challengeComposite, actualSkill: skillComposite, actualMotivation: motivationComposite,
          actualSkillHard: skillHard, actualSkillEnergy: skillEnergy, actualSupportLevel: supportLevel,
          actualChallengeComplex: challengeComplex, actualChallengeUrgency: challengeUrgency, actualChallengeInternal: challengeInternal, actualChallengeExternal: challengeExternal,
          actualMotivationIntrinsic: motivationIntrinsic, actualMotivationExtrinsic: motivationExtrinsic
        };
        
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'logs'), logToSave);
        if (logMode === 'plan') setActiveTab('todo');
      }
      resetForm(); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000);
    } catch (e) {
      console.error(e);
      alert("Save Failed: " + e.message);
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };
  
  // CSV Parsing Engine (Restored from v26.1)
  const handleImportCSV = async (csvText) => {
    if (!user) return;
    
    // Simple Parser
    const parseLine = (text) => {
      const res = [];
      let cur = '';
      let inQuote = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') { inQuote = !inQuote; }
        else if (c === ',' && !inQuote) { res.push(cur); cur = ''; }
        else { cur += c; }
      }
      res.push(cur);
      return res.map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    };

    const lines = csvText.split('\n').filter(l => l.trim());
    if (lines.length < 2) return;
    
    const headers = parseLine(lines[0]);
    // Map headers to fields
    const map = {
      'Timestamp': 'timestamp', 'Activity': 'activity', 'Status': 'status', 'Tags': 'tags',
      'Plan Notes': 'planNotes', 'Closing Notes': 'closingNotes',
      'Predicted Time': 'timePredicted', 'Actual Time': 'timeActual', 'Perceived Time': 'timePerceived',
      
      // Fix Map
      'Challenge (Total)': 'actualChallenge', 
      'Skill (Total)': 'actualSkill', 
      'Motivation (Total)': 'actualMotivation',
      'Initial Challenge': 'challenge', 
      'Initial Skill': 'skill', 
      'Initial Motivation': 'motivation',

      'Complexity': 'challengeComplex', 'Urgency': 'challengeUrgency', 'Internal Res': 'challengeInternal', 'External Res': 'challengeExternal',
      'Hard Skill': 'skillHard', 'Energy': 'skillEnergy', 'Support': 'supportLevel',
      'Intrinsic': 'motivationIntrinsic', 'Extrinsic': 'motivationExtrinsic',
      'Emotion': 'emotion', 'Entropy': 'entropy',
      'Flow State (App)': 'flowStateName', 'Self Prediction': 'selfPredName',
      // Explicit Actuals mapping for import
      'Actual Complexity': 'actualChallengeComplex', 'Actual Urgency': 'actualChallengeUrgency', 'Actual Internal Res': 'actualChallengeInternal', 'Actual External Res': 'actualChallengeExternal',
      'Actual Hard Skill': 'actualSkillHard', 'Actual Energy': 'actualSkillEnergy', 'Actual Support': 'actualSupportLevel',
      'Actual Intrinsic': 'actualMotivationIntrinsic', 'Actual Extrinsic': 'actualMotivationExtrinsic'
    };

    let count = 0;
    for (let i = 1; i < lines.length; i++) {
        const cols = parseLine(lines[i]);
        if (cols.length < 2) continue; 
        const data = {};
        headers.forEach((h, idx) => { if (map[h]) data[map[h]] = cols[idx]; });

        // Post-process numbers
        ['challenge','skill','motivation','actualChallenge','actualSkill','actualMotivation','skillHard','skillEnergy','supportLevel','challengeComplex','challengeUrgency','challengeInternal','challengeExternal','motivationIntrinsic','motivationExtrinsic','emotion','entropy','timePredicted','timeActual','timePerceived'].forEach(k => { if (data[k]) data[k] = Number(data[k]); });
        
        if (typeof data.tags === 'string') data.tags = data.tags.split(';').map(t=>t.trim()).filter(Boolean);
        
        let selfPred = null;
        if (data.selfPredName && data.selfPredName !== '-') {
           const match = Object.values(FLOW_STATES).find(s => data.selfPredName.includes(s.name) || s.name.includes(data.selfPredName));
           if (match) selfPred = { ...match, icon: null };
        }

        const newLog = {
          id: 'imp-' + Date.now() + '-' + i,
          type: 'log',
          isManualActionOverride: false,
          isManualFlowOverride: false,
          ...data,
          status: 'completed',
          selfPredictedState: selfPred,
          flowStateName: data.flowStateName
        };
        
        const sanitized = sanitizeLog(newLog.id, newLog);
        
        await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'logs'), sanitized);
        count++;
    }
    alert(`Imported ${count} logs.`);
  };
  
  const toggleVoiceInput = () => { /* ... */ }; // Disabled for now
  const handleLinkGoogle = async () => { try { await linkWithPopup(user, new GoogleAuthProvider()); } catch(e) { setAuthError(e.message); } };
  const handleEmailAuth = async (email, pw, isLogin) => { try { if(isLogin) await signInWithEmailAndPassword(auth, email, pw); else await linkWithCredential(user, EmailAuthProvider.credential(email, pw)); } catch(e) { setAuthError(e.message); } };
  const handleSignOut = async () => { await signOut(auth); if (isCloudMode) await signInAnonymously(auth); };

  if (authGlobalError) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-red-50">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h2 className="text-lg font-bold text-red-700 mb-2">连接中止 (Connection Terminated)</h2>
      <p className="text-sm text-red-600 font-mono bg-red-100 p-3 rounded break-all">{authGlobalError}</p>
      <div className="mt-6 text-xs text-gray-500 max-w-xs text-left space-y-2">
        <p><strong>可能原因 / Possible Causes:</strong></p>
        <ul className="list-disc pl-4 space-y-1">
           <li>域名未授权 (Domain not authorized in Firebase Console)</li>
           <li>网络连接问题 (Network issue)</li>
           <li>API Key 限制 (API Key restriction)</li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans pb-24 max-w-md mx-auto border-x border-gray-200 shadow-2xl relative overflow-x-hidden">
      {showProfile && <ProfileModal user={user} logs={logs} onClose={()=>setShowProfile(false)} onLinkGoogle={handleLinkGoogle} onEmailAuth={handleEmailAuth} onSignOut={handleSignOut} authError={authError} setAuthError={setAuthError} isCloudMode={isCloudMode} onImportCSV={handleImportCSV} t={t} />}
      
      <div className="bg-slate-900 p-6 pt-10 rounded-b-3xl shadow-xl relative z-10 text-white flex justify-between items-center">
        <div><h1 className="text-xl font-bold">Flow Detective 32.2</h1><p className="text-[10px] text-slate-400">Holographic</p></div>
        <div className="flex gap-2 items-center">
           {!isCloudMode && <span className="text-[9px] bg-orange-500/20 text-orange-200 px-2 py-0.5 rounded border border-orange-500/30">{t('localDemoTag')}</span>}
           <button onClick={toggleLang} className="p-2 rounded-full bg-slate-800 ring-1 ring-slate-600 flex items-center justify-center transition-colors">
              <Languages size={18} className="text-white" />
              <span className="text-[9px] ml-1">{lang === 'zh' ? 'EN' : '中'}</span>
           </button>
           <button onClick={() => setShowProfile(true)} className={`p-2 rounded-full ring-1 flex items-center justify-center transition-colors ${!user ? 'opacity-50 cursor-not-allowed bg-slate-800 ring-slate-700' : (isCloudMode ? 'bg-indigo-900 ring-indigo-500' : 'bg-orange-900 ring-orange-500')}`}>
              {user ? <User size={20} className="text-white" /> : <Loader2 size={20} className="text-slate-500 animate-spin" />}
           </button>
        </div>
      </div>

      <div className="p-4 pt-6 space-y-6">
        {activeTab === 'log' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-4">
                <div className="bg-gray-100 p-1 rounded-lg flex gap-1"><button onClick={() => setLogMode('immediate')} className={`px-3 py-1 rounded-md text-[10px] ${logMode === 'immediate' ? 'bg-white shadow' : ''}`}>{t('immediate')}</button><button onClick={() => setLogMode('plan')} className={`px-3 py-1 rounded-md text-[10px] ${logMode === 'plan' ? 'bg-white shadow' : ''}`}>{t('plan')}</button></div>
                <button onClick={() => setIsDeepDive(!isDeepDive)} className="text-[10px] bg-gray-100 px-2 py-1 rounded-full">{isDeepDive ? 'Pro' : 'Lite'}</button>
             </div>
             
             <div className="mb-4">
                <input type="text" placeholder={t('activityPlaceholder')} className="w-full bg-slate-50 border p-3 rounded-xl text-sm" value={currentActivity} onChange={e=>setCurrentActivity(e.target.value)} disabled={logMode === 'completing'}/>
                <div className="mt-2">
                   <div className="flex flex-wrap gap-2 mb-2">{tags.map((t, i)=><span key={i} className="text-[9px] bg-indigo-50 px-2 py-1 rounded text-indigo-600">#{safeRender(t)} <button onClick={()=>removeTag(t)}>x</button></span>)}
                     <input type="text" placeholder="+Tag" className="bg-transparent text-[10px]" value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={handleAddTag} />
                   </div>
                   <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar opacity-70">
                      {uniqueTags.filter(t => !tags.includes(t)).slice(0, 5).map(t => (<button key={t} onClick={() => addHistoricalTag(t)} className="text-[9px] border px-2 py-0.5 rounded-full text-gray-400 hover:bg-gray-50">+{safeRender(t)}</button>))}
                   </div>
                </div>
                <div className="flex mt-2 gap-2"><button onClick={toggleVoiceInput} className={`text-[10px] border px-2 py-1 rounded ${isListening ? 'bg-red-50 text-red-500' : ''}`}>{isListening ? 'Stop' : 'Voice'}</button>
                {/* AI Button Disabled */}
                {/* <button className="text-[10px] bg-gray-100 text-gray-400 px-2 py-1 rounded cursor-not-allowed"><Sparkles size={10} className="inline mr-1"/>AI</button> */}
                <textarea placeholder={logMode === 'plan' ? t('planNotesPlaceholder') : t('obsNotesPlaceholder')} className="w-full bg-transparent border p-2 text-xs rounded" value={notes} onChange={e=>setNotes(e.target.value)} /></div>
             </div>

             {/* Self-Prediction */}
             {logMode === 'plan' && (
                <div className="mb-4 p-3 bg-teal-50/50 rounded-xl border border-teal-100">
                  <h4 className="text-[10px] font-bold text-teal-700 uppercase mb-2 flex items-center gap-1"><Eye size={12}/> {t('myHunch')}</h4>
                  <div className="flex gap-2 justify-around">
                    {[FLOW_STATES.FLOW, FLOW_STATES.ANXIETY, FLOW_STATES.BOREDOM, FLOW_STATES.APATHY].map(s => (
                      <button key={s.id} onClick={() => setSelfPredictedState(s)} className={`flex flex-col items-center p-2 rounded-lg border ${selfPredictedState?.id === s.id ? 'bg-white shadow border-teal-300' : 'border-transparent opacity-50'}`}>
                        <s.icon size={16} className={s.color} />
                        <span className="text-[8px] mt-1">{t('state' + s.id).split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
             )}

             {isDeepDive && (
                <div className="mb-6 space-y-4 border-b border-dashed border-gray-200 pb-4">
                  <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                    <h4 className="text-[10px] font-bold text-purple-700 uppercase mb-2">{t('psychProfile')}</h4>
                    <Slider label={t('emotion')} value={emotion} setValue={setEmotion} minLabel="-" maxLabel="+" colorClass="text-purple-600" isSub />
                    <Slider label={t('entropy')} value={entropy} setValue={setEntropy} minLabel="Chaos" maxLabel="Order" colorClass="text-purple-600" isSub />
                  </div>
                  <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                    <h4 className="text-[10px] font-bold text-orange-700 uppercase mb-2">{t('timeLab')}</h4>
                    <div className="grid grid-cols-3 gap-2">
                       <div><label className="text-[9px] text-gray-500 block">{t('predicted')}</label><input type="number" className="w-full bg-white border border-orange-200 rounded p-1 text-xs text-center" value={timePredicted} onChange={e=>setTimePredicted(e.target.value)} /></div>
                       {logMode !== 'plan' && (<><div><label className="text-[9px] text-gray-500 block">{t('actual')}</label><input type="number" className="w-full bg-white border border-orange-200 rounded p-1 text-xs text-center" value={timeActual} onChange={e=>setTimeActual(e.target.value)} /></div><div><label className="text-[9px] text-gray-500 block">{t('perceived')}</label><input type="number" className="w-full bg-white border border-orange-200 rounded p-1 text-xs text-center" value={timePerceived} onChange={e=>setTimePerceived(e.target.value)} /></div></>)}
                    </div>
                  </div>
                </div>
             )}

             <div className="space-y-4">
                <div><Slider label={t('ability')} value={skillComposite} setValue={setSkillComposite} colorClass="text-teal-600" />
                   {isDeepDive && <div className="pl-4"><Slider label={t('hardSkill')} value={skillHard} setValue={setSkillHard} isSub/><Slider label={t('energy')} value={skillEnergy} setValue={setSkillEnergy} isSub/><Slider label={t('support')} value={supportLevel} setValue={setSupportLevel} isSub/></div>}</div>
                <div><Slider label={t('resistance')} value={challengeComposite} setValue={setChallengeComposite} colorClass="text-indigo-600" />
                   {isDeepDive && <div className="pl-4"><Slider label={t('complexity')} value={challengeComplex} setValue={setChallengeComplex} isSub/><Slider label={t('urgency')} value={challengeUrgency} setValue={setChallengeUrgency} isSub/><Slider label={t('internalRes')} value={challengeInternal} setValue={setChallengeInternal} isSub/><Slider label={t('externalRes')} value={challengeExternal} setValue={setChallengeExternal} isSub/></div>}</div>
                <div><Slider label={t('motivation')} value={motivationComposite} setValue={setMotivationComposite} colorClass="text-purple-600" />
                   {isDeepDive && <div className="pl-4"><Slider label={t('intrinsic')} value={motivationIntrinsic} setValue={setMotivationIntrinsic} isSub/><Slider label={t('extrinsic')} value={motivationExtrinsic} setValue={setMotivationExtrinsic} isSub/></div>}</div>
             </div>

             <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs flex justify-between">
                <div className="flex gap-2 items-center"><finalFlowState.icon size={16} className={finalFlowState.color} /><span className={`font-bold ${finalFlowState.color}`}>{t('state' + finalFlowState.id)}</span></div>
                <div className="flex gap-2 items-center"><span className={`font-bold ${finalActionState.isActionable ? 'text-green-600' : 'text-gray-500'}`}>{finalActionState.label}</span>{!isCalibrating && logMode !== 'plan' && <button onClick={() => setIsCalibrating(true)} className="text-[9px] underline">{t('correction')}</button>}{isCalibrating && <div className="flex gap-1"><button onClick={() => setManualFlowState(FLOW_STATES.ANXIETY)} className="p-1 bg-red-100 rounded text-red-600"><Activity size={10}/></button><button onClick={() => setManualFlowState(FLOW_STATES.FLOW)} className="p-1 bg-green-100 rounded text-green-600"><Zap size={10}/></button><button onClick={() => setManualFlowState(FLOW_STATES.BOREDOM)} className="p-1 bg-yellow-100 rounded text-yellow-600"><Coffee size={10}/></button></div>}</div>
             </div>
             <button onClick={handleLog} disabled={!currentActivity || isSubmitting} className="w-full mt-4 bg-slate-800 text-white py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2">
                {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : (showSuccess ? t('saved') : (logMode === 'plan' ? t('addToTodo') : t('recordCase')))}
             </button>
          </div>
        )}

        {activeTab === 'todo' && <LogList logs={filteredLogs.filter(l => l.status === 'pending')} onDelete={deleteLog} onComplete={startCompleting} t={t} />}
        {activeTab === 'stats' && <StatsDashboard logs={statsLogs} uniqueTags={uniqueTags} filterTags={filterTags} setFilterTags={setFilterTags} personalFlowThreshold={personalFlowThreshold} personalActionBias={personalActionBias} t={t} />}
        {activeTab === 'history' && <LogList logs={statsLogs} onDelete={deleteLog} t={t} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 p-2 flex justify-around z-50">
         <button onClick={()=>setActiveTab('log')}><Plus /></button>
         <button onClick={()=>setActiveTab('todo')}><ListTodo /></button>
         <button onClick={()=>setActiveTab('stats')}><BarChart2 /></button>
         <button onClick={()=>setActiveTab('history')}><History /></button>
      </div>

      {/* Debug Footer */}
      <div className="fixed bottom-16 left-0 right-0 text-[8px] text-gray-300 text-center pointer-events-none z-40">
        UID: {user ? user.uid.slice(0,6)+'...' : 'No User'} | Ver: 32.2
        {authGlobalError && <div className="text-red-400 bg-white/90 p-1">{authGlobalError}</div>}
      </div>
    </div>
  );
};
export default FlowDetective;