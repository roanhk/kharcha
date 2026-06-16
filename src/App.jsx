import { useState, useEffect, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "./lib/supabase";

const T = {
  en: {
    appName: "Kharcha", tagline: "NEPAL'S SIMPLEST MONEY TRACKER",
    thisMonth: "This Month", spent: "Spent", earned: "Earned", saved: "Saved",
    recentTx: "Recent Transactions", aiInsight: "AI Insight",
    getInsight: "Analyze my spending", analyzing: "Analyzing...",
    addTx: "Add Transaction", expense: "Expense", income: "Income",
    selectCat: "What did you spend on?", selectIncomeCat: "What did you earn from?",
    enterAmount: "Enter amount", noteLabel: "Where / What (optional)",
    notePlaceholder: "e.g. Newar Dai ko Pasal, Chabahil to Gaushala, Petrol...",
    howPaid: "How did you pay?", pasteSMS: "📋 Paste eSewa / Fonepay SMS",
    smsPlaceholder: "Paste your SMS here...", extractSMS: "Extract",
    save: "Save", history: "History", home: "Home",
    allMethods: "All", noTx: "No transactions yet.", loading: "Loading...",
    deleteConfirm: "Delete this transaction?",
    cat: { food:"Food", transport:"Transport", health:"Health", shopping:"Shopping",
           education:"Education", utilities:"Utilities", entertainment:"Entertainment",
           other:"Other", salary:"Salary", business:"Business", freelance:"Freelance", gift:"Gift", petrol:"Petrol" },
    method: { cash:"Cash", esewa:"eSewa", fonepay:"Fonepay", card:"Card" },
  },
  np: {
    appName: "खर्चा", tagline: "तपाईंको पैसा, सरल तरिकाले",
    thisMonth: "यो महिना", spent: "खर्च", earned: "आम्दानी", saved: "बचत",
    recentTx: "हालका लेनदेन", aiInsight: "AI विश्लेषण",
    getInsight: "मेरो खर्च विश्लेषण गर्नुस्", analyzing: "विश्लेषण हुँदैछ...",
    addTx: "लेनदेन थप्नुस्", expense: "खर्च", income: "आम्दानी",
    selectCat: "के मा खर्च गर्नुभयो?", selectIncomeCat: "कहाँबाट कमाउनुभयो?",
    enterAmount: "रकम लेख्नुस्", noteLabel: "कहाँ / के (ऐच्छिक)",
    notePlaceholder: "जस्तै: न्यूवार दाइको पसल, चाबहिल देखि गौशाला, पेट्रोल...",
    howPaid: "कसरी तिर्नुभयो?", pasteSMS: "📋 eSewa / Fonepay SMS टाँस्नुस्",
    smsPlaceholder: "यहाँ SMS टाँस्नुस्...", extractSMS: "निकाल्नुस्",
    save: "सुरक्षित गर्नुस्", history: "इतिहास", home: "गृहपृष्ठ",
    allMethods: "सबै", noTx: "अहिलेसम्म कुनै लेनदेन छैन।", loading: "लोड हुँदैछ...",
    deleteConfirm: "यो लेनदेन मेटाउने?",
    cat: { food:"खाना", transport:"यातायात", health:"स्वास्थ्य", shopping:"किनमेल",
           education:"शिक्षा", utilities:"बिल", entertainment:"मनोरञ्जन",
           other:"अन्य", salary:"तलब", business:"व्यापार", freelance:"फ्रिल्यान्स", gift:"उपहार", petrol:"पेट्रोल" },
    method: { cash:"नगद", esewa:"eSewa", fonepay:"Fonepay", card:"कार्ड" },
  },
};

const EXPENSE_CATS = [
  { id:"food", icon:"🍚", color:"#FF6B35" }, { id:"transport", icon:"🚌", color:"#2196F3" },
  { id:"health", icon:"🏥", color:"#F44336" }, { id:"shopping", icon:"🛒", color:"#9C27B0" },
  { id:"education", icon:"📚", color:"#4CAF50" }, { id:"utilities", icon:"💡", color:"#FFC107" },
  { id:"entertainment", icon:"🎉", color:"#E91E63" }, { id:"other", icon:"💰", color:"#78909C" },
  { id:"petrol", icon:"⛽️", color:"#1A6B2F"}
];
const INCOME_CATS = [
  { id:"salary", icon:"💼", color:"#4CAF50" }, { id:"business", icon:"🏪", color:"#2196F3" },
  { id:"freelance", icon:"💻", color:"#9C27B0" }, { id:"gift", icon:"🎁", color:"#FF6B35" },
  { id:"other", icon:"💰", color:"#78909C" },
];
const METHODS = [
  { id:"cash", icon:"💵" }, { id:"esewa", icon:"📱" },
  { id:"fonepay", icon:"📲" }, { id:"card", icon:"💳" },
];

const getCatMeta = (id) => [...EXPENSE_CATS, ...INCOME_CATS].find(c => c.id === id) || { icon:"💰", color:"#78909C" };

export default function App() {
  const [lang, setLang] = useState("np");
  const [tab, setTab] = useState("home");
  const [txs, setTxs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const t = T[lang];

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("transactions").select("*").order("created_at", { ascending: false });
    if (!error && data) setTxs(data);
    setLoadingData(false);
  };

  const addTx = async (tx) => {
    const { data, error } = await supabase
      .from("transactions")
      .insert([{ ...tx, date: new Date().toISOString().slice(0, 10) }])
      .select();
    if (!error && data) setTxs(prev => [data[0], ...prev]);
    setShowAdd(false);
    setTab("home");
  };

  const deleteTx = async (id) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) setTxs(prev => prev.filter(tx => tx.id !== id));
  };

  return (
    <div style={{ maxWidth:430, margin:"0 auto", minHeight:"100vh", background:"#F5F6FA", fontFamily:"'Segoe UI', sans-serif", position:"relative", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"linear-gradient(135deg,#1B5E20,#2E7D32)", padding:"20px 20px 24px", borderRadius:"0 0 24px 24px", boxShadow:"0 4px 20px rgba(27,94,32,0.3)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:24, fontWeight:800, color:"#fff" }}>{t.appName}</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:2 }}>{t.tagline}</div>
          </div>
          <button onClick={() => setLang(l => l==="en"?"np":"en")} style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:20, padding:"6px 14px", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
            {lang==="en" ? "नेपाली" : "English"}
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflow:"auto", paddingBottom:80 }}>
        {loadingData ? (
          <div style={{ textAlign:"center", padding:60, color:"#999", fontSize:16 }}>{t.loading}</div>
        ) : (
          <>
            {tab==="home" && <HomeScreen t={t} txs={txs} lang={lang} deleteTx={deleteTx} />}
            {tab==="history" && <HistoryScreen t={t} txs={txs} deleteTx={deleteTx} />}
          </>
        )}
      </div>

      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:430, background:"#fff", borderTop:"1px solid #E8E8E8", display:"flex", alignItems:"center", justifyContent:"space-around", padding:"8px 0 12px", zIndex:50, boxShadow:"0 -4px 20px rgba(0,0,0,0.08)" }}>
        <NavBtn icon="🏠" label={t.home} active={tab==="home"} onClick={() => setTab("home")} />
        <button onClick={() => setShowAdd(true)} style={{ width:58, height:58, borderRadius:29, background:"linear-gradient(135deg,#2E7D32,#43A047)", border:"none", fontSize:28, cursor:"pointer", color:"#fff", boxShadow:"0 4px 16px rgba(46,125,50,0.4)", marginTop:-20, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
        <NavBtn icon="📋" label={t.history} active={tab==="history"} onClick={() => setTab("history")} />
      </div>

      {showAdd && <AddScreen t={t} lang={lang} onSave={addTx} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, padding:"4px 20px" }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <span style={{ fontSize:11, fontWeight:600, color: active?"#2E7D32":"#999" }}>{label}</span>
    </button>
  );
}

function HomeScreen({ t, txs, lang, deleteTx }) {
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const totalSpent  = txs.filter(x=>x.type==="expense").reduce((s,x)=>s+Number(x.amount),0);
  const totalEarned = txs.filter(x=>x.type==="income").reduce((s,x)=>s+Number(x.amount),0);
  const saved = totalEarned - totalSpent;

  const pieData = useMemo(() => {
    const g = {};
    txs.filter(x=>x.type==="expense").forEach(x => { g[x.category]=(g[x.category]||0)+Number(x.amount); });
    return Object.entries(g).map(([cat,val]) => ({ name:cat, value:val, meta:getCatMeta(cat) }));
  }, [txs]);

  const barData = useMemo(() => {
    const days = [];
    for (let i=6; i>=0; i--) {
      const d = new Date(); d.setDate(d.getDate()-i);
      const key = d.toISOString().slice(0,10);
      const total = txs.filter(x=>x.type==="expense"&&x.date===key).reduce((s,x)=>s+Number(x.amount),0);
      days.push({ day: d.toLocaleDateString("en",{weekday:"short"}), amount: total });
    }
    return days;
  }, [txs]);

  const getInsight = async () => {
    setLoadingInsight(true); setInsight(null);
    const summary = Object.entries(
      txs.filter(x=>x.type==="expense").reduce((g,x)=>{ g[x.category]=(g[x.category]||0)+Number(x.amount); return g; },{})
    ).map(([c,a])=>`${c}: रू${a}`).join(", ");
    const prompt = lang==="np"
      ? `एक गृहिणीको यो महिनाको खर्च: ${summary}। आम्दानी: रू${totalEarned}। खर्च: रू${totalSpent}। बचत: रू${saved}। सरल नेपालीमा २-३ वाक्यमा सल्लाह दिनुस्।`
      : `A housewife spent this month: ${summary}. Income: रू${totalEarned}, Expenses: रू${totalSpent}, Saved: रू${saved}. Give 2-3 sentences of simple friendly advice.`;
    try {
      const res = await fetch("/api/ai-insight", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ prompt }) });
      const data = await res.json();
      setInsight(data.text || "Could not load insight.");
    } catch { setInsight("Error loading insight."); }
    setLoadingInsight(false);
  };

  return (
    <div style={{ padding:"20px 16px", display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ fontSize:13, fontWeight:700, color:"#555" }}>{t.thisMonth}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
        <SummaryCard label={t.earned} amount={totalEarned} color="#2E7D32" bg="#E8F5E9" />
        <SummaryCard label={t.spent}  amount={totalSpent}  color="#C62828" bg="#FFEBEE" />
        <SummaryCard label={t.saved}  amount={saved} color={saved>=0?"#1565C0":"#C62828"} bg={saved>=0?"#E3F2FD":"#FFEBEE"} />
      </div>

      {pieData.length > 0 && (
        <div style={{ background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#333", marginBottom:8 }}>{t.spent} — {t.thisMonth}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <PieChart width={130} height={130}>
              <Pie data={pieData} cx={60} cy={60} innerRadius={35} outerRadius={60} dataKey="value" paddingAngle={2}>
                {pieData.map((d,i) => <Cell key={i} fill={d.meta.color} />)}
              </Pie>
            </PieChart>
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
              {pieData.map((d,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:d.meta.color, flexShrink:0 }} />
                  <span style={{ color:"#555", flex:1 }}>{T.en.cat[d.name]}</span>
                  <span style={{ fontWeight:700, color:"#333" }}>रू{Number(d.value).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#333", marginBottom:12 }}>Daily Spending</div>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={barData} barSize={22}>
            <XAxis dataKey="day" tick={{ fontSize:10, fill:"#999" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v) => [`रू${Number(v).toLocaleString()}`,""]} contentStyle={{ fontSize:12, borderRadius:8 }} />
            <Bar dataKey="amount" fill="#2E7D32" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background:"linear-gradient(135deg,#1B5E20,#2E7D32)", borderRadius:16, padding:16, boxShadow:"0 4px 16px rgba(27,94,32,0.25)" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.8)", marginBottom:8 }}>✨ {t.aiInsight}</div>
        {insight ? (
          <div style={{ fontSize:14, color:"#fff", lineHeight:1.6 }}>{insight}</div>
        ) : (
          <button onClick={getInsight} disabled={loadingInsight} style={{ background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:10, padding:"10px 16px", color:"#fff", fontSize:14, fontWeight:600, cursor:loadingInsight?"wait":"pointer", width:"100%" }}>
            {loadingInsight ? t.analyzing : t.getInsight}
          </button>
        )}
      </div>

      {txs.length > 0 && (
        <div style={{ background:"#fff", borderRadius:16, padding:16, boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#333", marginBottom:12 }}>{t.recentTx}</div>
          {txs.slice(0,5).map(tx => <TxRow key={tx.id} tx={tx} t={t} onDelete={deleteTx} />)}
        </div>
      )}

      {txs.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px 20px", color:"#bbb", fontSize:15 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>💸</div>
          {t.noTx}
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, amount, color, bg }) {
  return (
    <div style={{ background:bg, borderRadius:14, padding:"12px 10px", textAlign:"center" }}>
      <div style={{ fontSize:11, color:"#777", fontWeight:600, marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:13, fontWeight:800, color, lineHeight:1.2 }}>रू{Math.abs(amount).toLocaleString()}</div>
    </div>
  );
}

function TxRow({ tx, t, onDelete }) {
  const meta = getCatMeta(tx.category);
  const method = METHODS.find(m=>m.id===tx.method);
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const startX = useRef(null);
  const DELETE_THRESHOLD = 70;

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const onTouchMove = (e) => {
    if (startX.current === null) return;
    const delta = e.touches[0].clientX - startX.current;
    if (delta < 0) setSwipeX(Math.max(delta, -90));
  };

  const onTouchEnd = () => {
    setSwiping(false);
    if (swipeX < -DELETE_THRESHOLD) {
      setSwipeX(-80);
      setShowDelete(true);
    } else {
      setSwipeX(0);
      setShowDelete(false);
    }
    startX.current = null;
  };

  const handleDelete = () => {
    if (window.confirm(t.deleteConfirm)) {
      onDelete(tx.id);
    } else {
      setSwipeX(0);
      setShowDelete(false);
    }
  };

  const handleReset = () => {
    setSwipeX(0);
    setShowDelete(false);
  };

  return (
    <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid #F5F5F5" }}>
      {/* Delete button behind */}
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:80, background:"#F44336", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }} onClick={handleDelete}>
        <span style={{ color:"#fff", fontSize:20 }}>🗑️</span>
      </div>
      {/* Row */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={showDelete ? handleReset : undefined}
        style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", background:"#fff", transform:`translateX(${swipeX}px)`, transition: swiping ? "none" : "transform 0.25s ease", cursor: showDelete ? "pointer" : "default" }}
      >
        <div style={{ width:42, height:42, borderRadius:12, background:meta.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>
          {meta.icon}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#222", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {tx.note ? tx.note : t.cat[tx.category]}
          </div>
          <div style={{ fontSize:11, color:"#999", marginTop:2 }}>
            {tx.note && <span style={{ color:"#CCC", marginRight:4 }}>{t.cat[tx.category]} ·</span>}
            {method?.icon} {t.method[tx.method]} · {tx.date?.slice(5)}
          </div>
        </div>
        <div style={{ fontSize:15, fontWeight:800, color:tx.type==="income"?"#2E7D32":"#C62828", flexShrink:0 }}>
          {tx.type==="income"?"+":"-"}रू{Number(tx.amount).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function HistoryScreen({ t, txs, deleteTx }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter==="all" ? txs : txs.filter(x=>x.method===filter);
  return (
    <div style={{ padding:"20px 16px" }}>
      <div style={{ fontSize:16, fontWeight:700, color:"#222", marginBottom:14 }}>{t.history}</div>
      <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:12 }}>
        {["all",...METHODS.map(m=>m.id)].map(m => (
          <button key={m} onClick={()=>setFilter(m)} style={{ padding:"6px 14px", borderRadius:20, border:"1.5px solid", flexShrink:0, borderColor:filter===m?"#2E7D32":"#DDD", background:filter===m?"#E8F5E9":"#fff", color:filter===m?"#2E7D32":"#666", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            {m==="all" ? t.allMethods : `${METHODS.find(x=>x.id===m)?.icon} ${t.method[m]}`}
          </button>
        ))}
      </div>
      <div style={{ background:"#fff", borderRadius:16, padding:"0 16px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
        {filtered.length===0
          ? <div style={{ textAlign:"center", color:"#aaa", padding:32 }}>{t.noTx}</div>
          : filtered.map(tx => <TxRow key={tx.id} tx={tx} t={t} onDelete={deleteTx} />)
        }
      </div>
    </div>
  );
}

function AddScreen({ t, lang, onSave, onClose }) {
  const [type, setType] = useState("expense");
  const [cat, setCat] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("cash");
  const [smsText, setSmsText] = useState("");
  const [showSMS, setShowSMS] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const cats = type==="expense" ? EXPENSE_CATS : INCOME_CATS;

  const extractSMS = async () => {
    if (!smsText.trim()) return;
    setExtracting(true);
    try {
      const res = await fetch("/api/extract-sms", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ sms: smsText }) });
      const data = await res.json();
      if (data.amount) setAmount(String(data.amount));
      if (data.method) setMethod(data.method);
      setShowSMS(false);
    } catch {}
    setExtracting(false);
  };

  const handleSave = async () => {
    if (!cat || !amount || isNaN(Number(amount))) return;
    setSaving(true);
    await onSave({ type, category: cat, amount: Number(amount), method, note: note.trim() });
    setSaving(false);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} />
      <div style={{ position:"relative", background:"#fff", borderRadius:"24px 24px 0 0", padding:"24px 20px 40px", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 -8px 40px rgba(0,0,0,0.2)" }}>
        <div style={{ width:40, height:4, borderRadius:2, background:"#DDD", margin:"0 auto 20px" }} />
        <div style={{ fontSize:18, fontWeight:800, color:"#222", marginBottom:20 }}>{t.addTx}</div>

        <div style={{ display:"flex", background:"#F5F6FA", borderRadius:12, padding:4, marginBottom:20 }}>
          {["expense","income"].map(tp => (
            <button key={tp} onClick={()=>{ setType(tp); setCat(null); }} style={{ flex:1, padding:"10px 0", borderRadius:9, border:"none", fontWeight:700, fontSize:14, cursor:"pointer", background:type===tp?(tp==="expense"?"#FFEBEE":"#E8F5E9"):"transparent", color:type===tp?(tp==="expense"?"#C62828":"#2E7D32"):"#999" }}>
              {tp==="expense" ? `💸 ${t.expense}` : `💰 ${t.income}`}
            </button>
          ))}
        </div>

        <div style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:10 }}>{type==="expense"?t.selectCat:t.selectIncomeCat}</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
          {cats.map(c => (
            <button key={c.id} onClick={()=>setCat(c.id)} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, padding:"12px 6px", borderRadius:14, border:`2px solid ${cat===c.id?c.color:"#EEE"}`, background:cat===c.id?c.color+"18":"#FAFAFA", cursor:"pointer" }}>
              <span style={{ fontSize:26 }}>{c.icon}</span>
              <span style={{ fontSize:11, fontWeight:600, color:cat===c.id?c.color:"#666", textAlign:"center", lineHeight:1.2 }}>{t.cat[c.id]}</span>
            </button>
          ))}
        </div>

        <div style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:8 }}>{t.enterAmount}</div>
        <div style={{ display:"flex", alignItems:"center", background:"#F5F6FA", borderRadius:12, padding:"4px 16px", marginBottom:16, border:`2px solid ${amount?"#2E7D32":"transparent"}` }}>
          <span style={{ fontSize:18, fontWeight:700, color:"#2E7D32", marginRight:8 }}>रू</span>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0" inputMode="numeric" style={{ flex:1, border:"none", background:"transparent", fontSize:24, fontWeight:700, color:"#222", outline:"none", padding:"12px 0" }} />
        </div>

        <div style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:8 }}>{t.noteLabel}</div>
        <input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder={t.notePlaceholder} style={{ width:"100%", background:"#F5F6FA", border:`2px solid ${note?"#2E7D32":"transparent"}`, borderRadius:12, padding:"13px 16px", fontSize:14, color:"#222", outline:"none", marginBottom:16 }} />

        <button onClick={()=>setShowSMS(!showSMS)} style={{ width:"100%", padding:"10px", borderRadius:10, border:"1.5px dashed #BBB", background:"transparent", color:"#777", fontSize:13, cursor:"pointer", marginBottom:14, fontWeight:600 }}>{t.pasteSMS}</button>
        {showSMS && (
          <div style={{ marginBottom:14 }}>
            <textarea value={smsText} onChange={e=>setSmsText(e.target.value)} placeholder={t.smsPlaceholder} rows={3} style={{ width:"100%", borderRadius:10, border:"1.5px solid #DDD", padding:12, fontSize:13, resize:"none", outline:"none" }} />
            <button onClick={extractSMS} disabled={extracting} style={{ width:"100%", padding:10, borderRadius:10, background:"#2E7D32", border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", marginTop:8 }}>{extracting?"...":t.extractSMS}</button>
          </div>
        )}

        <div style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:10 }}>{t.howPaid}</div>
        <div style={{ display:"flex", gap:10, marginBottom:24 }}>
          {METHODS.map(m => (
            <button key={m.id} onClick={()=>setMethod(m.id)} style={{ flex:1, padding:"10px 6px", borderRadius:12, border:`2px solid ${method===m.id?"#2E7D32":"#EEE"}`, background:method===m.id?"#E8F5E9":"#FAFAFA", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <span style={{ fontSize:20 }}>{m.icon}</span>
              <span style={{ fontSize:10, fontWeight:700, color:method===m.id?"#2E7D32":"#888" }}>{t.method[m.id]}</span>
            </button>
          ))}
        </div>

        <button onClick={handleSave} disabled={!cat||!amount||saving} style={{ width:"100%", padding:16, borderRadius:14, border:"none", background:(!cat||!amount||saving)?"#DDD":"linear-gradient(135deg,#2E7D32,#43A047)", color:(!cat||!amount||saving)?"#aaa":"#fff", fontSize:16, fontWeight:800, cursor:(!cat||!amount||saving)?"not-allowed":"pointer", boxShadow:(!cat||!amount||saving)?"none":"0 4px 16px rgba(46,125,50,0.35)" }}>
          {saving ? "..." : t.save}
        </button>
      </div>
    </div>
  );
}
