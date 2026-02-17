'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { brand, styles } from '@/lib/brand';
import { supabase } from '@/lib/supabase';
import { BOBBY_PICKS, getPickStats, type BobbyPick } from '@/data/bobby-picks';
import ImpliedMoveCard from '@/components/markets/ImpliedMoveCard';
import EconomicCalendar from '@/components/markets/EconomicCalendar';
import BobbyCalls from '@/components/markets/BobbyCalls';
import OptionsFlow from '@/components/markets/OptionsFlow';
import GexLevels from '@/components/markets/GexLevels';
import TradeJournal from '@/components/markets/TradeJournal';

interface Quote { symbol: string; name: string; price: number; change: number; changePercent: number; high: number; low: number; marketState?: string; }
interface NewsItem { id: string; title: string; publisher: string; link?: string; publishedAt: string; relatedSymbol: string; }
interface OptionContract { strike: number; last: number; change: number; changePercent: number; volume: number; openInterest: number; impliedVolatility: number; delta: number; gamma: number; theta: number; vega: number; vwap: number; high: number; low: number; ticker: string; }
interface ChainData { symbol: string; expDate: string; currentPrice: number; calls: OptionContract[]; puts: OptionContract[]; expirations: string[]; }
interface ZeroDTEContract { symbol: string; strike: number; type: 'CALL' | 'PUT'; expiry: string; last: number; change: number; changePercent: number; volume: number; openInterest: number; impliedVolatility: number; vwap: number; ticker: string; }
interface UnusualContract extends ZeroDTEContract { volOiRatio: number; }
interface SectorQuote { price: number; change: number; changePercent: number; volume: number; name: string; high: number; low: number; }
interface SparklineData { timestamps: number[]; closes: number[]; }
interface PCRData { pcr: number; totalPuts: number; totalCalls: number; sentiment: string; }
interface FundamentalsData { symbol: string; name: string; price: number|null; change: number|null; changePercent: number|null; marketCap: string|null; trailingPE: number|null; forwardPE: number|null; pegRatio: number|null; priceToBook: number|null; priceToSales: number|null; epsTrailing: number|null; epsForward: number|null; profitMargin: number|null; operatingMargin: number|null; grossMargin: number|null; returnOnEquity: number|null; fiftyDayAvg: number|null; twoHundredDayAvg: number|null; fiftyTwoWeekHigh: number|null; fiftyTwoWeekLow: number|null; fiftyTwoWeekChange: number|null; beta: number|null; insiderHeld: number|null; institutionHeld: number|null; shortRatio: number|null; shortFloat: number|null; analystRating: string|null; targetPrice: number|null; analystCount: number|null; dividendRate: number|null; dividendYield: number|null; exDividendDate: string|null; earningsDate: string|null; earningsDateStart: string|null; avgVolume3M: number|null; avgVolume10D: number|null; enterpriseValue: string|null; evToRevenue: number|null; evToEbitda: number|null; volume: number|null; [key:string]: unknown; }
interface EarningsItem { symbol: string; name: string; earningsDate: string|null; earningsDateStart: string|null; earningsDateEnd: string|null; epsTrailing: number|null; epsForward: number|null; trailingPE: number|null; forwardPE: number|null; marketCap: string|null; price: number|null; }
interface DividendItem { symbol: string; name: string; price: number|null; dividendRate: number|null; dividendYield: number|null; dividendYieldPct: string|null; trailingDividendRate: number|null; exDividendDate: string|null; payable: boolean; }
interface EarningsHistEvent { date: string; priceBefore: number; priceAfter: number; change: number; changePercent: number; volumeSpike: number; type: 'gap-up'|'gap-down'; }
interface EarningsHistData { symbol: string; name: string; nextEarnings: string|null; events: EarningsHistEvent[]; avgMove: number|null; upMoves: number; downMoves: number; }

const DWL = ['AAPL','NVDA','TSLA','META','AMZN'];
const DT = ['ES=F','NQ=F','SPY','^VIX','BTC-USD','^TNX'];
const M = "'JetBrains Mono','Fira Code',monospace";
const SM: Record<string,string> = {XLK:'Tech',XLF:'Finance',XLE:'Energy',XLV:'Health',XLI:'Industrial',XLC:'Comms',XLY:'Cons Disc',XLP:'Cons Stap',XLB:'Materials',XLRE:'Real Est',XLU:'Utilities',SMH:'Semis'};
const ST = Object.keys(SM);
const fmt = (d: Date) => d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
const fp = (p: number) => !p?'--':p>1000?`$${p.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`:`$${p.toFixed(p<10?3:2)}`;
const fv = (v: number) => v>=1e6?`${(v/1e6).toFixed(1)}M`:v>=1e3?`${(v/1e3).toFixed(1)}K`:String(v);
const fi = (iv: number) => iv>1?`${iv.toFixed(1)}%`:`${(iv*100).toFixed(1)}%`;
const fd = (d: number) => d?d.toFixed(3):'--';
const f2 = (p: number) => p?p.toFixed(2):'--';
const fpc = (p: number) => `${p>=0?'+':''}${p.toFixed(2)}%`;
const ds: Record<string,string> = {'ES=F':'ES','NQ=F':'NQ','^TNX':'10Y','BTC-USD':'BTC','^VIX':'VIX'};
const gs = (s: string) => ds[s]||s;

function Sparkline({data,width=60,height=24}:{data:number[];width?:number;height?:number}) {
  if(!data||data.length<2) return null;
  const mn=Math.min(...data),mx=Math.max(...data),r=mx-mn||1;
  const up=data[data.length-1]>=data[0],c=up?'#22C55E':'#EF4444';
  const pts=data.map((v,i)=>`${(i/(data.length-1))*width},${height-((v-mn)/r)*(height-2)-1}`).join(' ');
  return <svg width={width} height={height} style={{display:'inline-block',verticalAlign:'middle'}}><polyline points={pts} fill="none" stroke={c} strokeWidth="1.5" strokeLinejoin="round"/></svg>;
}

export default function Markets() {
  const [quotes,setQuotes]=useState<Quote[]>([]);
  const [wl,setWl]=useState<string[]>(DWL);
  const [wlQ,setWlQ]=useState<Record<string,Quote>>({});
  const [news,setNews]=useState<NewsItem[]>([]);
  const [ns,setNs]=useState('');
  const [lr,setLr]=useState<Date|null>(null);
  const [live,setLive]=useState(false);
  const [err,setErr]=useState<string|null>(null);
  const [cd,setCd]=useState(30);
  const [rfr,setRfr]=useState(false);
  const [flash,setFlash]=useState(false);
  const [csym,setCsym]=useState<string|null>(null);
  const [cdata,setCdata]=useState<ChainData|null>(null);
  const [cload,setCload]=useState(false);
  const [ctab,setCtab]=useState<'calls'|'puts'>('calls');
  const [sexp,setSexp]=useState('');
  const [z0,setZ0]=useState<ZeroDTEContract[]>([]);
  const [z0l,setZ0l]=useState(true);
  const [unu,setUnu]=useState<UnusualContract[]>([]);
  const [unl,setUnl]=useState(true);
  const [sec,setSec]=useState<Record<string,SectorQuote>>({});
  const [pcr,setPcr]=useState<PCRData|null>(null);
  const [spk,setSpk]=useState<Record<string,SparklineData>>({});
  const [expandedPick,setExpandedPick]=useState<string|null>(null);
  const [picksFilter,setPicksFilter]=useState<'all'|'active'|'wins'|'growth'|'options'|'ipo'>('all');
  const pickStats = useMemo(()=>getPickStats(),[]);
  const filteredPicks = useMemo(()=>{
    let p = [...BOBBY_PICKS].sort((a,b)=>b.date.localeCompare(a.date));
    if(picksFilter==='active') p=p.filter(x=>x.status==='active'||x.status==='watching');
    else if(picksFilter==='wins') p=p.filter(x=>x.status==='win');
    else if(picksFilter==='growth') p=p.filter(x=>x.type==='growth');
    else if(picksFilter==='options') p=p.filter(x=>x.type==='options');
    else if(picksFilter==='ipo') p=p.filter(x=>x.type==='ipo');
    return p;
  },[picksFilter]);
  const [fund,setFund]=useState<FundamentalsData|null>(null);
  const [fundLoad,setFundLoad]=useState(false);
  const [fundTab,setFundTab]=useState<'fundamentals'|'chain'>('fundamentals');
  const [earn,setEarn]=useState<EarningsItem[]>([]);
  const [earnLoad,setEarnLoad]=useState(true);
  const [divs,setDivs]=useState<DividendItem[]>([]);
  const [divsLoad,setDivsLoad]=useState(true);
  const [ehist,setEhist]=useState<EarningsHistData|null>(null);
  const [ehistLoad,setEhistLoad]=useState(false);
  const [newsTab,setNewsTab]=useState<'news'|'bobby'>('news');

  const fetchD = useCallback(async (w: string[]) => {
    try { setErr(null); setRfr(true);
      const r = await fetch(`/api/axecap?symbols=${w.join(',')}&news=true`,{signal:AbortSignal.timeout(10000)});
      if(!r.ok) throw new Error(`HTTP ${r.status}`); const d=await r.json();
      const t:Quote[]=[],wm:Record<string,Quote>={};
      for(const q of d.quotes||[]) { if(DT.includes(q.symbol)) t.push(q); else wm[q.symbol]=q; }
      setQuotes(t); setWlQ(wm); setNews(d.news||[]); setLive(d.live??false);
      setLr(new Date()); setCd(30); setFlash(true); setTimeout(()=>setFlash(false),600);
    } catch(e) { console.error(e); setErr('Market data unavailable'); } finally { setRfr(false); }
  },[]);

  const fetchZ = useCallback(async () => {
    try { const r=await fetch('/api/options-data?type=0dte&symbols=SPY,QQQ,NVDA',{signal:AbortSignal.timeout(10000)}); if(!r.ok) throw new Error(''); setZ0((await r.json()).contracts||[]); } catch{} finally{setZ0l(false);}
  },[]);
  const fetchU = useCallback(async () => {
    try { const r=await fetch('/api/options-data?type=unusual&symbols=SPY,QQQ,NVDA,AAPL,TSLA',{signal:AbortSignal.timeout(12000)}); if(!r.ok) throw new Error(''); setUnu((await r.json()).contracts||[]); } catch{} finally{setUnl(false);}
  },[]);
  const fetchS = useCallback(async () => {
    try { const r=await fetch(`/api/market-data?symbols=${ST.join(',')}&news=false`,{signal:AbortSignal.timeout(8000)}); if(!r.ok) return; const d=await r.json(); const m:Record<string,SectorQuote>={};
      for(const q of d.quotes||[]) m[q.symbol]={price:q.price??0,change:q.change??0,changePercent:q.changePercent??0,volume:q.volume??0,name:q.name??q.symbol,high:q.high??0,low:q.low??0};
      setSec(m); } catch{}
  },[]);
  const fetchP = useCallback(async () => {
    try { const r=await fetch('/api/options-data?type=pcr',{signal:AbortSignal.timeout(10000)}); if(!r.ok) return; setPcr(await r.json()); } catch{}
  },[]);
  const fetchSp = useCallback(async (w: string[]) => {
    const res:Record<string,SparklineData>={};
    for(const s of w.slice(0,5)) { try { const r=await fetch(`/api/options-data?type=sparkline&symbol=${s}`,{signal:AbortSignal.timeout(5000)}); if(!r.ok) continue; const j=await r.json(); if(j.data?.closes?.length) res[s]=j.data; } catch{} }
    setSpk(p=>({...p,...res}));
  },[]);
  const fetchC = useCallback(async (sym:string,exp?:string) => {
    setCload(true); setCdata(null); setCtab('calls');
    try { let u=`/api/options-data?type=chain&symbol=${encodeURIComponent(sym)}`; if(exp) u+=`&expDate=${encodeURIComponent(exp)}`;
      const r=await fetch(u,{signal:AbortSignal.timeout(10000)}); if(!r.ok) throw new Error(''); const d:ChainData=await r.json(); setCdata(d);
      if(d.expirations?.length&&!exp) setSexp(d.expDate||d.expirations[0]);
    } catch{} finally{setCload(false);}
  },[]);

  const fetchFund = useCallback(async (sym:string) => {
    setFundLoad(true); setFund(null);
    try { const r=await fetch(`/api/yfinance-data?type=fundamentals&symbol=${encodeURIComponent(sym)}`,{signal:AbortSignal.timeout(10000)}); if(!r.ok) throw new Error(''); setFund(await r.json()); } catch{} finally{setFundLoad(false);}
  },[]);
  const fetchEarn = useCallback(async (w:string[]) => {
    setEarnLoad(true);
    try { const r=await fetch(`/api/yfinance-data?type=earnings&symbols=${w.join(',')}`,{signal:AbortSignal.timeout(12000)}); if(!r.ok) throw new Error(''); const d=await r.json(); setEarn(d.earnings||[]); } catch{} finally{setEarnLoad(false);}
  },[]);
  const fetchDivs = useCallback(async (w:string[]) => {
    setDivsLoad(true);
    try { const r=await fetch(`/api/yfinance-data?type=dividends&symbols=${w.join(',')}`,{signal:AbortSignal.timeout(12000)}); if(!r.ok) throw new Error(''); const d=await r.json(); setDivs(d.dividends||[]); } catch{} finally{setDivsLoad(false);}
  },[]);
  const fetchEhist = useCallback(async (sym:string) => {
    setEhistLoad(true); setEhist(null);
    try { const r=await fetch(`/api/yfinance-data?type=earnings-history&symbol=${encodeURIComponent(sym)}`,{signal:AbortSignal.timeout(12000)}); if(!r.ok) throw new Error(''); setEhist(await r.json()); } catch{} finally{setEhistLoad(false);}
  },[]);

  const tickClick = useCallback((s:string) => { if(csym===s){setCsym(null);setCdata(null);setFund(null);setEhist(null);return;} setCsym(s);setSexp('');setFundTab('fundamentals');fetchC(s);fetchFund(s);fetchEhist(s); },[csym,fetchC,fetchFund,fetchEhist]);
  const expChange = useCallback((e:string) => { setSexp(e); if(csym) fetchC(csym,e); },[csym,fetchC]);
  const refreshAll = useCallback(() => { fetchD(wl);fetchZ();fetchU();fetchS();fetchP();fetchEarn(wl);fetchDivs(wl);setCd(30); },[fetchD,fetchZ,fetchU,fetchS,fetchP,fetchEarn,fetchDivs,wl]);

  const addSym = useCallback(async () => {
    const s=ns.trim().toUpperCase();
    if(s&&!wl.includes(s)){const n=[...wl,s];setWl(n);setNs('');fetchD(n);fetchSp([s]);
      try { await supabase.from('user_watchlist').upsert({ symbol: s }, { onConflict: 'symbol' }); } catch {}
    }
  },[ns,wl,fetchD,fetchSp]);
  const remSym = useCallback(async (s:string) => { const n=wl.filter(x=>x!==s);setWl(n);
    try { await supabase.from('user_watchlist').delete().eq('symbol', s); } catch {}
  },[wl]);

  useEffect(() => {
    const loadWatchlist = async () => {
      let w = DWL;
      try {
        const { data } = await supabase.from('user_watchlist').select('symbol').order('added_at');
        if (data && data.length > 0) { w = data.map((r: { symbol: string }) => r.symbol); setWl(w); }
      } catch {}
      fetchD(w);fetchZ();fetchU();fetchS();fetchP();fetchSp(w);fetchEarn(w);fetchDivs(w);
    };
    loadWatchlist();
  },[fetchD,fetchZ,fetchU,fetchS,fetchP,fetchSp,fetchEarn,fetchDivs]);

  useEffect(() => {
    const r=setInterval(()=>{fetchD(wl);fetchZ();fetchU();fetchS();fetchP();},30000);
    const s=setInterval(()=>fetchSp(wl),60000);
    const t=setInterval(()=>setCd(c=>c<=1?30:c-1),1000);
    return()=>{clearInterval(r);clearInterval(s);clearInterval(t);};
  },[fetchD,fetchZ,fetchU,fetchS,fetchP,fetchSp,wl]);

  const se = useMemo(()=>ST.map(t=>({t,n:SM[t],d:sec[t] as SectorQuote|undefined})),[sec]);
  const ths:React.CSSProperties = {textAlign:'right',fontSize:10,color:brand.smoke,fontFamily:M,padding:'6px 8px',borderBottom:`1px solid ${brand.border}`,fontWeight:600,letterSpacing:'0.04em'};
  const thl:React.CSSProperties = {...ths,textAlign:'left'};
  const tds:React.CSSProperties = {textAlign:'right',fontSize:12,color:brand.silver,fontFamily:M,padding:'6px 8px',borderBottom:`1px solid ${brand.border}`};
  const tdl:React.CSSProperties = {...tds,textAlign:'left'};

  return (
    <div style={styles.page}>
      <div style={{...styles.container,maxWidth:1400}}>
        {/* HEADER */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem',flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{...styles.h1,fontSize:'1.5rem',letterSpacing:'-0.02em',display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
              <span style={{fontSize:20}}>📊</span> AxeCap Terminal
            </h1>
            <p style={{color:brand.smoke,fontSize:12,margin:0}}>Real-time market intelligence</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {rfr && <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
              <span style={{width:8,height:8,borderRadius:'50%',background:brand.amber,animation:'axp 1s ease-in-out infinite'}}/>
              <span style={{fontSize:11,color:brand.amber,fontFamily:M}}>REFRESHING...</span>
            </span>}
            {lr && <span style={{fontFamily:M,fontSize:11,color:brand.smoke}}>{fmt(lr)}</span>}
            <button onClick={refreshAll} style={{...styles.button,padding:'6px 14px',fontSize:12,opacity:rfr?0.6:1}}>⟳ Refresh</button>
          </div>
        </div>
        <style>{`@keyframes axp{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>

        {err && <div style={{...styles.card,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.3)',marginBottom:'1rem',padding:'10px 14px'}}><span style={{color:'#EF4444',fontSize:12}}>⚠ {err}</span></div>}

        {/* TICKER BOARD */}
        <div style={{...styles.card,padding:0,marginBottom:'1rem',overflow:'hidden',transition:'border-color 0.3s',borderColor:flash?'rgba(245,158,11,0.5)':brand.border}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:`1px solid ${brand.border}`,background:flash?'rgba(245,158,11,0.05)':brand.graphite}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{color:brand.amber,fontWeight:700,fontSize:13,fontFamily:"'Space Grotesk', system-ui, sans-serif",letterSpacing:'0.05em',textTransform:'uppercase'}}>AXECAP TERMINAL</span>
              <span style={{fontSize:10,fontFamily:M,fontWeight:600,padding:'1px 8px',borderRadius:3,color:live?'#22C55E':brand.amber,background:live?'rgba(34,197,94,0.1)':'rgba(245,158,11,0.1)'}}>{live?'● LIVE':'○ CACHED'}</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:16}}>
              {pcr && <div style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:10,color:brand.smoke,fontFamily:M}}>P/C:</span>
                <span style={{fontFamily:M,fontSize:12,fontWeight:700,color:pcr.pcr<0.7?'#22C55E':pcr.pcr>1.0?'#EF4444':'#eab308'}}>{pcr.pcr.toFixed(2)}</span>
                <span style={{fontSize:9,fontFamily:M,fontWeight:600,padding:'1px 6px',borderRadius:3,color:pcr.sentiment==='Bullish'?'#22C55E':pcr.sentiment==='Bearish'?'#EF4444':'#eab308',background:pcr.sentiment==='Bullish'?'rgba(34,197,94,0.1)':pcr.sentiment==='Bearish'?'rgba(239,68,68,0.1)':'rgba(234,179,8,0.1)'}}>{pcr.sentiment}</span>
              </div>}
              <span style={{fontSize:10,color:brand.smoke,fontFamily:M}}>Next: <span style={{color:cd<=5?brand.amber:brand.smoke}}>{cd}s</span></span>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(quotes.length||6,6)},1fr)`,gap:0}}>
            {quotes.map((q,i) => (
              <div key={q.symbol} onClick={()=>tickClick(q.symbol)} style={{cursor:'pointer',padding:'14px 16px',borderRight:i<quotes.length-1?`1px solid ${brand.border}`:'none',borderBottom:`1px solid ${brand.border}`,background:csym===q.symbol?'rgba(245,158,11,0.06)':'transparent',transition:'background 0.2s'}}>
                <div style={{fontSize:13,fontWeight:700,color:q.changePercent>=0?'#22C55E':'#EF4444',marginBottom:2}}>{gs(q.symbol)}</div>
                <div style={{fontSize:10,color:brand.smoke,marginBottom:6}}>{q.name}</div>
                <div style={{fontSize:18,fontWeight:700,color:brand.white,fontFamily:M,marginBottom:4}}>{fp(q.price)}</div>
                <div style={{fontSize:11,fontFamily:M,color:q.changePercent>=0?'#22C55E':'#EF4444'}}>{q.change>0?'+':''}{q.change.toFixed(2)} ({q.changePercent>0?'+':''}{q.changePercent.toFixed(2)}%)</div>
                {q.high>0&&q.low>0&&<div style={{marginTop:6,fontSize:9,color:brand.smoke,fontFamily:M}}>L: {fp(q.low)} H: {fp(q.high)}</div>}
              </div>))}
            {quotes.length===0&&Array(6).fill(0).map((_,i)=><div key={i} style={{padding:'16px',borderRight:i<5?`1px solid ${brand.border}`:'none'}}><div style={{color:brand.smoke,fontSize:12,fontFamily:M}}>Loading...</div></div>)}
          </div>
        </div>

        {/* GEX LEVELS (SPY/QQQ only) */}
        {cdata&&(csym==='SPY'||csym==='QQQ')&&<GexLevels symbol={csym} currentPrice={cdata.currentPrice} calls={cdata.calls} puts={cdata.puts}/>}

        {/* SECTOR HEATMAP */}
        <div style={{marginBottom:'1.5rem'}}>
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {se.map(({t,n,d})=>{const p=d?.changePercent??0,pos=p>=0,int=Math.min(1,Math.abs(p)/3);
              return <div key={t} onClick={()=>tickClick(t)} style={{flex:'1 1 0',minWidth:70,padding:'8px 6px',background:pos?`rgba(34,197,94,${0.1+int*0.4})`:`rgba(239,68,68,${0.1+int*0.4})`,borderRadius:6,textAlign:'center',border:`1px solid ${pos?'rgba(34,197,94,0.2)':'rgba(239,68,68,0.2)'}`,cursor:'pointer'}}>
                <div style={{fontSize:10,fontWeight:700,color:brand.white,fontFamily:M,marginBottom:2}}>{n}</div>
                <div style={{fontSize:11,fontWeight:700,color:pos?'#22C55E':'#EF4444',fontFamily:M}}>{d?fpc(p):'--'}</div>
              </div>;})}
          </div>
        </div>

        {/* ECONOMIC CALENDAR */}
        <EconomicCalendar />

        {/* TWO COLUMNS: WATCHLIST + NEWS/BOBBY */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
          <div style={styles.card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <span style={{color:brand.amber,fontSize:13,fontWeight:600,fontFamily:"'Space Grotesk', system-ui, sans-serif"}}>WATCHLIST</span>
              <div style={{display:'flex',gap:8}}>
                <input value={ns} onChange={e=>setNs(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSym()} placeholder="Symbol" style={{...styles.input,width:90,padding:'6px 10px',fontSize:12}}/>
                <button onClick={addSym} style={{...styles.button,padding:'6px 12px',fontSize:12}}>+ ADD</button>
              </div>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={thl}>SYMBOL</th><th style={ths}>PRICE</th><th style={ths}>CHG</th><th style={ths}>CHG%</th><th style={{...ths,textAlign:'center'}}>SPARK</th><th style={{...ths,width:28}}></th></tr></thead>
              <tbody>{wl.map(s=>{const q=wlQ[s],sk=spk[s]; return <tr key={s}>
                <td onClick={()=>tickClick(s)} style={{...tdl,color:brand.amber,fontWeight:600,fontSize:13,cursor:'pointer'}}>{s}<div style={{fontSize:10,color:brand.smoke,fontWeight:400}}>{q?.name||''}</div></td>
                <td style={{...tds,color:brand.white,fontSize:13,fontWeight:600}}>{q?fp(q.price):'--'}</td>
                <td style={{...tds,color:q?(q.change>=0?'#22C55E':'#EF4444'):brand.smoke}}>{q?`${q.change>0?'+':''}${q.change.toFixed(2)}`:'--'}</td>
                <td style={{...tds,color:q?(q.changePercent>=0?'#22C55E':'#EF4444'):brand.smoke}}>{q?fpc(q.changePercent):'--'}</td>
                <td style={{...tds,textAlign:'center',padding:'4px 8px'}}>{sk?<Sparkline data={sk.closes}/>:<span style={{color:brand.smoke,fontSize:10}}>--</span>}</td>
                <td style={tds}><button onClick={()=>remSym(s)} style={{background:'none',border:'none',color:brand.smoke,cursor:'pointer',fontSize:14,padding:0}}>✕</button></td>
              </tr>;})}
              {wl.length===0&&<tr><td colSpan={6} style={{...tdl,textAlign:'center',color:brand.smoke,padding:20}}>Add symbols to your watchlist</td></tr>}
              </tbody>
            </table>
          </div>

          <div style={styles.card}>
            {/* Tabs: News | Bobby's Calls */}
            <div style={{display:'flex',borderBottom:`1px solid ${brand.border}`,marginBottom:12,margin:'-1.5rem -1.5rem 12px -1.5rem',padding:0}}>
              {(['news','bobby'] as const).map(tab=><button key={tab} onClick={()=>setNewsTab(tab)} style={{flex:1,padding:'10px 0',background:newsTab===tab?'rgba(245,158,11,0.08)':'transparent',border:'none',borderBottom:newsTab===tab?`2px solid ${brand.amber}`:'2px solid transparent',color:newsTab===tab?brand.amber:brand.smoke,fontFamily:M,fontSize:12,fontWeight:700,cursor:'pointer',textTransform:'uppercase'}}>{tab==='news'?'📰 News':'🔥 Bobby\'s Calls'}</button>)}
            </div>
            {newsTab==='news'?<>
            {news.length>0?news.slice(0,10).map((n,i)=>(
              <div key={n.id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 0',borderBottom:i<Math.min(news.length,10)-1?`1px solid ${brand.border}`:'none'}}>
                <div style={{flexShrink:0,minWidth:55,textAlign:'right'}}>
                  <div style={{fontFamily:M,fontSize:10,color:brand.smoke}}>{new Date(n.publishedAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}</div>
                  <div style={{fontSize:9,color:brand.smoke}}>{n.publisher}</div>
                </div>
                <div style={{flex:1}}>
                  {n.relatedSymbol&&<span style={{display:'inline-block',padding:'1px 6px',borderRadius:3,fontSize:10,fontFamily:M,background:'rgba(245,158,11,0.1)',color:brand.amber,marginBottom:4,marginRight:4}}>{n.relatedSymbol}</span>}
                  <div style={{fontSize:12,color:brand.silver,lineHeight:1.5}}>{n.link?<a href={n.link} target="_blank" rel="noopener noreferrer" style={{color:brand.silver,textDecoration:'none'}}>{n.title}</a>:n.title}</div>
                </div>
              </div>
            )):<div style={{color:brand.smoke,fontSize:12,textAlign:'center',padding:'20px 0',fontFamily:M}}>Loading market briefing...</div>}
            </>:<BobbyCalls/>}
          </div>
        </div>

        {/* TICKER DETAIL PANEL (Fundamentals + Options Chain + Earnings History) */}
        {csym&&<div style={{...styles.card,marginBottom:'1.5rem',padding:0,overflow:'hidden'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${brand.border}`,background:brand.graphite}}>
            <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
              <span style={{color:brand.amber,fontWeight:700,fontSize:15,fontFamily:M}}>{csym}</span>
              {fund&&<span style={{fontSize:11,color:brand.smoke}}>{fund.name}</span>}
              {fund&&fund.price&&<span style={{fontSize:13,fontFamily:M,color:brand.white,fontWeight:700}}>{fp(fund.price as number)}</span>}
              {fund&&fund.changePercent!=null&&<span style={{fontSize:11,fontFamily:M,color:(fund.changePercent as number)>=0?'#22C55E':'#EF4444'}}>{fpc(fund.changePercent as number)}</span>}
            </div>
            <button onClick={()=>{setCsym(null);setCdata(null);setFund(null);setEhist(null);}} style={{background:'none',border:'none',color:brand.smoke,cursor:'pointer',fontSize:18,padding:'0 4px'}}>✕</button>
          </div>
          {/* Sub-tabs: Fundamentals | Options Chain | Earnings History */}
          <div style={{display:'flex',borderBottom:`1px solid ${brand.border}`}}>
            {(['fundamentals','chain'] as const).map(tab=><button key={tab} onClick={()=>setFundTab(tab)} style={{flex:1,padding:'10px 0',background:fundTab===tab?'rgba(245,158,11,0.08)':'transparent',border:'none',borderBottom:fundTab===tab?`2px solid ${brand.amber}`:'2px solid transparent',color:fundTab===tab?brand.amber:brand.smoke,fontFamily:M,fontSize:12,fontWeight:700,cursor:'pointer',textTransform:'uppercase'}}>{tab==='fundamentals'?'📊 Fundamentals':'⛓ Options Chain'}</button>)}
          </div>

          {/* FUNDAMENTALS TAB */}
          {fundTab==='fundamentals'&&<div style={{padding:0}}>
            {fundLoad?<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12,fontFamily:M}}>Loading fundamentals...</div>
            :fund?<div>
              {/* Valuation + Earnings row */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:0}}>
                {/* Valuation */}
                <div style={{padding:'16px',borderRight:`1px solid ${brand.border}`,borderBottom:`1px solid ${brand.border}`}}>
                  <div style={{fontSize:10,color:brand.amber,fontWeight:700,fontFamily:M,marginBottom:10,letterSpacing:'0.05em'}}>VALUATION</div>
                  {[
                    ['Mkt Cap',fund.marketCap],
                    ['P/E (TTM)',fund.trailingPE!=null?Number(fund.trailingPE).toFixed(1):null],
                    ['P/E (Fwd)',fund.forwardPE!=null?Number(fund.forwardPE).toFixed(1):null],
                    ['PEG',fund.pegRatio!=null?Number(fund.pegRatio).toFixed(2):null],
                    ['P/B',fund.priceToBook!=null?Number(fund.priceToBook).toFixed(2):null],
                    ['P/S',fund.priceToSales!=null?Number(fund.priceToSales).toFixed(2):null],
                    ['EV',fund.enterpriseValue],
                    ['EV/Rev',fund.evToRevenue!=null?Number(fund.evToRevenue).toFixed(1)+'x':null],
                    ['EV/EBITDA',fund.evToEbitda!=null?Number(fund.evToEbitda).toFixed(1)+'x':null],
                  ].map(([label,val])=><div key={label as string} style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}><span style={{fontSize:11,color:brand.smoke}}>{label}</span><span style={{fontSize:11,color:brand.white,fontFamily:M,fontWeight:600}}>{val??'--'}</span></div>)}
                </div>
                {/* Profitability & Earnings */}
                <div style={{padding:'16px',borderRight:`1px solid ${brand.border}`,borderBottom:`1px solid ${brand.border}`}}>
                  <div style={{fontSize:10,color:brand.amber,fontWeight:700,fontFamily:M,marginBottom:10,letterSpacing:'0.05em'}}>PROFITABILITY</div>
                  {[
                    ['EPS (TTM)',fund.epsTrailing!=null?`$${Number(fund.epsTrailing).toFixed(2)}`:null],
                    ['EPS (Fwd)',fund.epsForward!=null?`$${Number(fund.epsForward).toFixed(2)}`:null],
                    ['Gross Margin',fund.grossMargin!=null?`${fund.grossMargin}%`:null],
                    ['Op Margin',fund.operatingMargin!=null?`${fund.operatingMargin}%`:null],
                    ['Profit Margin',fund.profitMargin!=null?`${fund.profitMargin}%`:null],
                    ['ROE',fund.returnOnEquity!=null?`${fund.returnOnEquity}%`:null],
                  ].map(([label,val])=><div key={label as string} style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}><span style={{fontSize:11,color:brand.smoke}}>{label}</span><span style={{fontSize:11,color:val&&!String(val).startsWith('--')&&!String(val).startsWith('-')?'#22C55E':val&&String(val).startsWith('-')?'#EF4444':brand.white,fontFamily:M,fontWeight:600}}>{val??'--'}</span></div>)}
                  <div style={{borderTop:`1px solid ${brand.border}`,marginTop:8,paddingTop:8}}>
                    <div style={{fontSize:10,color:brand.amber,fontWeight:700,fontFamily:M,marginBottom:6,letterSpacing:'0.05em'}}>EARNINGS</div>
                    <div style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}><span style={{fontSize:11,color:brand.smoke}}>Next Report</span><span style={{fontSize:11,color:fund.earningsDate?brand.amber:brand.smoke,fontFamily:M,fontWeight:700}}>{fund.earningsDate||fund.earningsDateStart||'--'}</span></div>
                  </div>
                </div>
                {/* Technicals & Ownership */}
                <div style={{padding:'16px',borderBottom:`1px solid ${brand.border}`}}>
                  <div style={{fontSize:10,color:brand.amber,fontWeight:700,fontFamily:M,marginBottom:10,letterSpacing:'0.05em'}}>TECHNICALS</div>
                  {[
                    ['50D Avg',fund.fiftyDayAvg!=null?fp(fund.fiftyDayAvg as number):null],
                    ['200D Avg',fund.twoHundredDayAvg!=null?fp(fund.twoHundredDayAvg as number):null],
                    ['52W High',fund.fiftyTwoWeekHigh!=null?fp(fund.fiftyTwoWeekHigh as number):null],
                    ['52W Low',fund.fiftyTwoWeekLow!=null?fp(fund.fiftyTwoWeekLow as number):null],
                    ['52W Chg',fund.fiftyTwoWeekChange!=null?`${fund.fiftyTwoWeekChange>0?'+':''}${fund.fiftyTwoWeekChange}%`:null],
                    ['Beta',fund.beta!=null?Number(fund.beta).toFixed(2):null],
                  ].map(([label,val])=><div key={label as string} style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}><span style={{fontSize:11,color:brand.smoke}}>{label}</span><span style={{fontSize:11,color:brand.white,fontFamily:M,fontWeight:600}}>{val??'--'}</span></div>)}
                  <div style={{borderTop:`1px solid ${brand.border}`,marginTop:8,paddingTop:8}}>
                    <div style={{fontSize:10,color:brand.amber,fontWeight:700,fontFamily:M,marginBottom:6,letterSpacing:'0.05em'}}>OWNERSHIP</div>
                    {[
                      ['Insider',fund.insiderHeld!=null?`${fund.insiderHeld}%`:null],
                      ['Institutional',fund.institutionHeld!=null?`${fund.institutionHeld}%`:null],
                      ['Short Ratio',fund.shortRatio!=null?Number(fund.shortRatio).toFixed(1):null],
                      ['Short Float',fund.shortFloat!=null?`${fund.shortFloat}%`:null],
                    ].map(([label,val])=><div key={label as string} style={{display:'flex',justifyContent:'space-between',padding:'3px 0'}}><span style={{fontSize:11,color:brand.smoke}}>{label}</span><span style={{fontSize:11,color:brand.white,fontFamily:M,fontWeight:600}}>{val??'--'}</span></div>)}
                  </div>
                </div>
              </div>
              {/* Analyst + Dividends bar */}
              <div style={{display:'flex',gap:0,borderBottom:`1px solid ${brand.border}`}}>
                <div style={{flex:1,padding:'12px 16px',borderRight:`1px solid ${brand.border}`,display:'flex',alignItems:'center',gap:16}}>
                  <span style={{fontSize:10,color:brand.amber,fontWeight:700,fontFamily:M}}>ANALYST</span>
                  {fund.analystRating&&<span style={{fontSize:11,color:brand.white,fontFamily:M}}>{fund.analystRating}</span>}
                  {fund.targetPrice!=null&&<span style={{fontSize:11,color:brand.smoke}}>Target: <span style={{color:(fund.targetPrice as number)>(fund.price as number||0)?'#22C55E':'#EF4444',fontFamily:M,fontWeight:700}}>{fp(fund.targetPrice as number)}</span></span>}
                  {fund.analystCount!=null&&<span style={{fontSize:10,color:brand.smoke,fontFamily:M}}>({fund.analystCount} analysts)</span>}
                </div>
                <div style={{flex:1,padding:'12px 16px',display:'flex',alignItems:'center',gap:16}}>
                  <span style={{fontSize:10,color:brand.amber,fontWeight:700,fontFamily:M}}>DIVIDEND</span>
                  {fund.dividendRate!=null&&fund.dividendRate>0?<>
                    <span style={{fontSize:11,color:'#22C55E',fontFamily:M,fontWeight:700}}>${Number(fund.dividendRate).toFixed(2)}/yr</span>
                    {fund.dividendYield!=null&&<span style={{fontSize:11,color:'#22C55E',fontFamily:M}}>({fund.dividendYield}%)</span>}
                    {fund.exDividendDate&&<span style={{fontSize:10,color:brand.smoke}}>Ex-div: {fund.exDividendDate}</span>}
                  </>:<span style={{fontSize:11,color:brand.smoke,fontFamily:M}}>No dividend</span>}
                </div>
              </div>
              {/* Implied Move Card — shows when earnings within 14 days */}
              {csym&&<ImpliedMoveCard symbol={csym}/>}

              {/* Earnings History Section (inline) */}
              {ehistLoad?<div style={{padding:20,textAlign:'center',color:brand.smoke,fontSize:12,fontFamily:M}}>Loading earnings history...</div>
              :ehist&&ehist.events.length>0?<div style={{padding:'12px 16px'}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                  <span style={{fontSize:10,color:brand.amber,fontWeight:700,fontFamily:M,letterSpacing:'0.05em'}}>SIGNIFICANT MOVES (2Y)</span>
                  {ehist.avgMove!=null&&<span style={{padding:'2px 8px',borderRadius:4,fontSize:10,fontFamily:M,background:'rgba(245,158,11,0.1)',color:brand.amber}}>Avg: ±{ehist.avgMove}%</span>}
                  <span style={{fontSize:10,fontFamily:M,color:'#22C55E'}}>↑{ehist.upMoves}</span>
                  <span style={{fontSize:10,fontFamily:M,color:'#EF4444'}}>↓{ehist.downMoves}</span>
                  {ehist.nextEarnings&&<span style={{fontSize:10,color:brand.smoke,fontFamily:M}}>Next earnings: <span style={{color:brand.amber,fontWeight:700}}>{ehist.nextEarnings}</span></span>}
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {ehist.events.slice(0,10).map((ev,i)=><div key={i} style={{padding:'6px 10px',borderRadius:6,background:ev.type==='gap-up'?'rgba(34,197,94,0.08)':'rgba(239,68,68,0.08)',border:`1px solid ${ev.type==='gap-up'?'rgba(34,197,94,0.2)':'rgba(239,68,68,0.2)'}`,minWidth:100}}>
                    <div style={{fontSize:9,color:brand.smoke,fontFamily:M,marginBottom:2}}>{ev.date}</div>
                    <div style={{fontSize:13,fontWeight:700,fontFamily:M,color:ev.type==='gap-up'?'#22C55E':'#EF4444'}}>{ev.changePercent>0?'+':''}{ev.changePercent}%</div>
                    <div style={{fontSize:9,color:brand.smoke,fontFamily:M}}>{ev.volumeSpike}x vol</div>
                  </div>)}
                </div>
              </div>:null}
            </div>
            :<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12}}>No fundamentals data</div>}
          </div>}

          {/* OPTIONS CHAIN TAB */}
          {fundTab==='chain'&&<div>
            <div style={{display:'flex',alignItems:'center',gap:12,padding:'8px 16px',borderBottom:`1px solid ${brand.border}`,background:'rgba(0,0,0,0.2)'}}>
              {cdata&&<><span style={{fontSize:10,color:brand.smoke,fontFamily:M}}>Spot: <span style={{color:brand.white}}>{f2(cdata.currentPrice)}</span></span>
                {cdata.expirations?.length>1&&<select value={sexp} onChange={e=>expChange(e.target.value)} style={{background:brand.graphite,color:brand.amber,border:`1px solid ${brand.border}`,borderRadius:4,padding:'2px 8px',fontSize:10,fontFamily:M,cursor:'pointer'}}>{cdata.expirations.map(x=><option key={x} value={x}>{x}</option>)}</select>}</>}
            </div>
            <div style={{display:'flex',borderBottom:`1px solid ${brand.border}`}}>
              {(['calls','puts'] as const).map(tab=><button key={tab} onClick={()=>setCtab(tab)} style={{flex:1,padding:'10px 0',background:ctab===tab?'rgba(245,158,11,0.08)':'transparent',border:'none',borderBottom:ctab===tab?`2px solid ${brand.amber}`:'2px solid transparent',color:ctab===tab?(tab==='calls'?'#22C55E':'#EF4444'):brand.smoke,fontFamily:M,fontSize:12,fontWeight:700,cursor:'pointer'}}>{tab.toUpperCase()} {cdata&&<span style={{fontSize:10,opacity:0.7}}>({(tab==='calls'?cdata.calls:cdata.puts).length})</span>}</button>)}
            </div>
            <div style={{overflowX:'auto',maxHeight:400}}>
              {cload?<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12,fontFamily:M}}>Loading options chain...</div>
              :cdata?<table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr><th style={thl}>Strike</th><th style={ths}>Last</th><th style={ths}>Chg</th><th style={ths}>Chg%</th><th style={ths}>Vol</th><th style={ths}>OI</th><th style={ths}>IV</th><th style={ths}>Δ</th><th style={ths}>Γ</th><th style={ths}>Θ</th><th style={ths}>V</th></tr></thead>
                <tbody>{(ctab==='calls'?cdata.calls:cdata.puts).map((o,idx)=>{
                  const atm=cdata.currentPrice>0&&Math.abs(o.strike-cdata.currentPrice)<=(cdata.currentPrice*0.005);
                  const itm=ctab==='calls'?o.strike<cdata.currentPrice:o.strike>cdata.currentPrice;
                  return <tr key={`${o.strike}-${idx}`} style={{background:atm?'rgba(245,158,11,0.10)':itm?`rgba(${ctab==='calls'?'34,197,94':'239,68,68'},0.05)`:'transparent'}}>
                    <td style={{...tdl,color:atm?brand.amber:brand.white,fontWeight:atm?700:600}}>{f2(o.strike)}{atm&&<span style={{marginLeft:6,fontSize:9,color:brand.amber}}>ATM</span>}</td>
                    <td style={{...tds,color:brand.white}}>{f2(o.last)}</td>
                    <td style={{...tds,color:(o.change??0)>=0?'#22C55E':'#EF4444'}}>{o.change?(o.change>0?'+':'')+o.change.toFixed(2):'--'}</td>
                    <td style={{...tds,color:(o.changePercent??0)>=0?'#22C55E':'#EF4444'}}>{o.changePercent?fpc(o.changePercent):'--'}</td>
                    <td style={{...tds,fontWeight:o.volume>10000?700:400,color:o.volume>10000?brand.white:brand.silver}}>{fv(o.volume)}</td>
                    <td style={tds}>{fv(o.openInterest)}</td>
                    <td style={tds}>{fi(o.impliedVolatility)}</td>
                    <td style={{...tds,color:ctab==='calls'?'#22C55E':'#EF4444'}}>{fd(o.delta)}</td>
                    <td style={tds}>{o.gamma?o.gamma.toFixed(4):'--'}</td>
                    <td style={tds}>{o.theta?o.theta.toFixed(4):'--'}</td>
                    <td style={tds}>{o.vega?o.vega.toFixed(4):'--'}</td>
                  </tr>})}</tbody></table>
              :<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12}}>No chain data</div>}
            </div>
            {/* Options Flow Visualization */}
            {cdata&&<OptionsFlow symbol={csym} expDate={cdata.expDate||sexp} currentPrice={cdata.currentPrice} calls={cdata.calls} puts={cdata.puts}/>}
          </div>}
        </div>}

        {/* EARNINGS CALENDAR + DIVIDEND TRACKER */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
          {/* Earnings Calendar */}
          <div style={{...styles.card,padding:0,overflow:'hidden'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${brand.border}`,background:brand.graphite}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:14}}>📅</span>
                <span style={{color:brand.amber,fontWeight:700,fontSize:13,fontFamily:"'Space Grotesk', system-ui, sans-serif",letterSpacing:'0.05em'}}>EARNINGS CALENDAR</span>
              </div>
              <span style={{fontSize:10,color:brand.smoke,fontFamily:M}}>Watchlist</span>
            </div>
            {earnLoad?<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12,fontFamily:M}}>Loading earnings dates...</div>
            :earn.length>0?<table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={thl}>Symbol</th><th style={thl}>Name</th><th style={ths}>Earnings Date</th><th style={ths}>EPS (TTM)</th><th style={ths}>EPS (Fwd)</th><th style={ths}>P/E</th><th style={ths}>Mkt Cap</th></tr></thead>
              <tbody>{earn.map(e=>{
                const isPast=e.earningsDate&&new Date(e.earningsDate)<new Date();
                const isSoon=e.earningsDate&&!isPast&&(new Date(e.earningsDate).getTime()-Date.now())<7*24*60*60*1000;
                return <tr key={e.symbol}>
                  <td onClick={()=>tickClick(e.symbol)} style={{...tdl,color:brand.amber,fontWeight:700,cursor:'pointer'}}>{e.symbol}</td>
                  <td style={{...tdl,fontSize:11,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.name}</td>
                  <td style={{...tds,color:isSoon?'#EF4444':isPast?brand.smoke:brand.white,fontWeight:isSoon?700:400}}>
                    {e.earningsDate||'--'}
                    {isSoon&&<span style={{marginLeft:4,fontSize:9,padding:'1px 5px',borderRadius:3,background:'rgba(239,68,68,0.15)',color:'#EF4444'}}>SOON</span>}
                  </td>
                  <td style={tds}>{e.epsTrailing!=null?`$${e.epsTrailing.toFixed(2)}`:'--'}</td>
                  <td style={tds}>{e.epsForward!=null?`$${e.epsForward.toFixed(2)}`:'--'}</td>
                  <td style={tds}>{e.trailingPE!=null?e.trailingPE.toFixed(1):'--'}</td>
                  <td style={{...tds,fontSize:11}}>{e.marketCap||'--'}</td>
                </tr>;})}
              </tbody>
            </table>
            :<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12}}>No earnings data</div>}
          </div>

          {/* Dividend Tracker */}
          <div style={{...styles.card,padding:0,overflow:'hidden'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${brand.border}`,background:brand.graphite}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:14}}>💰</span>
                <span style={{color:brand.amber,fontWeight:700,fontSize:13,fontFamily:"'Space Grotesk', system-ui, sans-serif",letterSpacing:'0.05em'}}>DIVIDEND TRACKER</span>
              </div>
              <span style={{fontSize:10,color:brand.smoke,fontFamily:M}}>Watchlist</span>
            </div>
            {divsLoad?<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12,fontFamily:M}}>Loading dividend data...</div>
            :divs.length>0?<table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={thl}>Symbol</th><th style={thl}>Name</th><th style={ths}>Price</th><th style={ths}>Div Rate</th><th style={ths}>Yield</th><th style={ths}>Ex-Div Date</th><th style={{...ths,textAlign:'center'}}>Status</th></tr></thead>
              <tbody>{divs.map(d=>{
                const exSoon=d.exDividendDate&&(new Date(d.exDividendDate).getTime()-Date.now())<14*24*60*60*1000&&new Date(d.exDividendDate)>new Date();
                return <tr key={d.symbol}>
                  <td onClick={()=>tickClick(d.symbol)} style={{...tdl,color:brand.amber,fontWeight:700,cursor:'pointer'}}>{d.symbol}</td>
                  <td style={{...tdl,fontSize:11,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.name}</td>
                  <td style={{...tds,color:brand.white}}>{d.price!=null?fp(d.price):'--'}</td>
                  <td style={{...tds,color:d.payable?'#22C55E':brand.smoke}}>{d.dividendRate!=null&&d.dividendRate>0?`$${d.dividendRate.toFixed(2)}`:d.trailingDividendRate!=null&&d.trailingDividendRate>0?`$${d.trailingDividendRate.toFixed(2)}`:'--'}</td>
                  <td style={{...tds,color:d.payable?'#22C55E':brand.smoke,fontWeight:d.payable?700:400}}>{d.dividendYieldPct||'--'}</td>
                  <td style={{...tds,color:exSoon?brand.amber:brand.silver}}>
                    {d.exDividendDate||'--'}
                    {exSoon&&<span style={{marginLeft:4,fontSize:9,padding:'1px 5px',borderRadius:3,background:'rgba(245,158,11,0.15)',color:brand.amber}}>SOON</span>}
                  </td>
                  <td style={{...tds,textAlign:'center'}}>
                    {d.payable
                      ?<span style={{padding:'2px 8px',borderRadius:4,fontSize:10,fontFamily:M,background:'rgba(34,197,94,0.1)',color:'#22C55E',fontWeight:700}}>PAYS</span>
                      :<span style={{padding:'2px 8px',borderRadius:4,fontSize:10,fontFamily:M,background:'rgba(113,113,122,0.1)',color:brand.smoke}}>NONE</span>}
                  </td>
                </tr>;})}
              </tbody>
            </table>
            :<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12}}>No dividend data</div>}
          </div>
        </div>

        {/* 0DTE SCANNER */}
        <div style={{...styles.card,marginBottom:'1.5rem',padding:0,overflow:'hidden'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${brand.border}`,background:brand.graphite}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{color:brand.amber,fontWeight:700,fontSize:13,fontFamily:M}}>0DTE SCANNER</span>
              <span style={{padding:'2px 8px',borderRadius:4,fontSize:10,fontFamily:M,background:'rgba(245,158,11,0.1)',color:brand.amber}}>SPY | QQQ | NVDA</span>
            </div>
            <span style={{fontSize:10,color:brand.smoke,fontFamily:M}}>Top 15 by volume</span>
          </div>
          <div style={{overflowX:'auto'}}>
            {z0l?<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12,fontFamily:M}}>Scanning 0DTE contracts...</div>
            :z0.length>0?<table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={thl}>Ticker</th><th style={ths}>Strike</th><th style={thl}>C/P</th><th style={ths}>Last</th><th style={ths}>Chg%</th><th style={ths}>Vol</th><th style={ths}>OI</th><th style={ths}>VWAP</th></tr></thead>
              <tbody>{z0.slice(0,15).map((c,i)=>{const vo=c.openInterest>0?c.volume/c.openInterest:0;
                return <tr key={`z-${c.symbol}-${c.strike}-${c.type}-${i}`} style={{background:vo>5?'rgba(245,158,11,0.05)':'transparent'}}>
                  <td onClick={()=>tickClick(c.symbol)} style={{...tdl,color:brand.amber,fontWeight:600,cursor:'pointer'}}>{c.symbol}</td>
                  <td style={{...tds,color:brand.white}}>{f2(c.strike)}</td>
                  <td style={{...tdl,color:c.type==='CALL'?'#22C55E':'#EF4444',fontWeight:700,fontSize:11}}>{c.type}</td>
                  <td style={{...tds,color:brand.white}}>{f2(c.last)}</td>
                  <td style={{...tds,color:(c.changePercent??0)>=0?'#22C55E':'#EF4444'}}>{c.changePercent?fpc(c.changePercent):'--'}</td>
                  <td style={{...tds,fontWeight:c.volume>10000?700:400,color:c.volume>10000?brand.white:brand.silver}}>{fv(c.volume)}{vo>5?' *':''}</td>
                  <td style={tds}>{fv(c.openInterest)}</td>
                  <td style={tds}>{c.vwap?f2(c.vwap):'--'}</td>
                </tr>;})}</tbody></table>
            :<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12}}>No 0DTE contracts found</div>}
          </div>
        </div>

        {/* UNUSUAL ACTIVITY */}
        <div style={{...styles.card,marginBottom:'1.5rem',padding:0,overflow:'hidden'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${brand.border}`,background:brand.graphite}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{color:brand.amber,fontWeight:700,fontSize:13,fontFamily:M}}>UNUSUAL ACTIVITY</span>
              <span style={{padding:'2px 8px',borderRadius:4,fontSize:10,fontFamily:M,background:'rgba(239,68,68,0.1)',color:'#EF4444'}}>{'Vol > 2x OI'}</span>
            </div>
            <span style={{fontSize:10,color:brand.smoke,fontFamily:M}}>Top 20 by Vol/OI</span>
          </div>
          <div style={{overflowX:'auto'}}>
            {unl?<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12,fontFamily:M}}>Scanning unusual activity...</div>
            :unu.length>0?<table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr><th style={thl}>Ticker</th><th style={ths}>Strike</th><th style={thl}>C/P</th><th style={ths}>Expiry</th><th style={ths}>Last</th><th style={ths}>Vol</th><th style={ths}>OI</th><th style={ths}>Vol/OI</th><th style={ths}>IV</th></tr></thead>
              <tbody>{unu.slice(0,20).map((c,i)=><tr key={`u-${c.symbol}-${c.strike}-${c.type}-${i}`} style={{background:c.volOiRatio>5?'rgba(245,158,11,0.05)':'transparent'}}>
                <td onClick={()=>tickClick(c.symbol)} style={{...tdl,color:brand.amber,fontWeight:600,cursor:'pointer'}}>{c.symbol}</td>
                <td style={{...tds,color:brand.white}}>{f2(c.strike)}</td>
                <td style={tdl}><span style={{padding:'1px 6px',borderRadius:3,fontSize:10,fontWeight:700,fontFamily:M,color:c.type==='CALL'?'#22C55E':'#EF4444',background:c.type==='CALL'?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)'}}>{c.type}</span></td>
                <td style={{...tds,fontSize:10}}>{c.expiry}</td>
                <td style={{...tds,color:brand.white}}>{f2(c.last)}</td>
                <td style={{...tds,fontWeight:700,color:brand.white}}>{fv(c.volume)}</td>
                <td style={tds}>{fv(c.openInterest)}</td>
                <td style={{...tds,fontWeight:700,color:brand.amber}}>{c.volOiRatio.toFixed(1)}x{c.volOiRatio>5?' *':''}</td>
                <td style={tds}>{fi(c.impliedVolatility)}</td>
              </tr>)}</tbody></table>
            :<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12}}>No unusual activity detected</div>}
          </div>
        </div>

        {/* TRADE JOURNAL */}
        <TradeJournal />

        {/* BOBBY'S PICKS — Historical Write-ups & Calls */}
        <div style={{...styles.card,marginBottom:'1.5rem',padding:0,overflow:'hidden'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${brand.border}`,background:brand.graphite}}>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{fontSize:16}}>🔥</span>
              <span style={{color:brand.amber,fontWeight:700,fontSize:14,fontFamily:"'Space Grotesk', system-ui, sans-serif",letterSpacing:'0.05em'}}>{"BOBBY'S PICKS"}</span>
              <span style={{padding:'2px 10px',borderRadius:4,fontSize:11,fontFamily:M,background:'rgba(34,197,94,0.1)',color:'#22C55E',fontWeight:700}}>{pickStats.winRate}% Win Rate</span>
              <span style={{fontSize:10,fontFamily:M,color:brand.smoke}}>{pickStats.wins}W / {pickStats.losses}L</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{padding:'2px 8px',borderRadius:4,fontSize:10,fontFamily:M,background:'rgba(245,158,11,0.1)',color:brand.amber}}>{pickStats.active} Active</span>
              <span style={{padding:'2px 8px',borderRadius:4,fontSize:10,fontFamily:M,background:'rgba(113,113,122,0.1)',color:brand.smoke}}>{pickStats.total} Total</span>
            </div>
          </div>
          {/* Filter tabs */}
          <div style={{display:'flex',gap:0,borderBottom:`1px solid ${brand.border}`}}>
            {([['all','All'],['active','Active'],['wins','Wins'],['growth','Growth'],['options','Options'],['ipo','IPO']] as const).map(([key,label])=>
              <button key={key} onClick={()=>setPicksFilter(key as typeof picksFilter)} style={{flex:1,padding:'8px 0',background:picksFilter===key?'rgba(245,158,11,0.08)':'transparent',border:'none',borderBottom:picksFilter===key?`2px solid ${brand.amber}`:'2px solid transparent',color:picksFilter===key?brand.amber:brand.smoke,fontFamily:M,fontSize:11,fontWeight:700,cursor:'pointer'}}>{label}</button>
            )}
          </div>
          {/* Picks list */}
          <div style={{maxHeight:600,overflowY:'auto'}}>
            {filteredPicks.map((pick:BobbyPick)=>{
              const isOpen=expandedPick===pick.id;
              const sc:Record<string,{bg:string;color:string;label:string}>={
                active:{bg:'rgba(34,197,94,0.1)',color:'#22C55E',label:'ACTIVE'},
                win:{bg:'rgba(34,197,94,0.1)',color:'#22C55E',label:'WIN ✓'},
                loss:{bg:'rgba(239,68,68,0.1)',color:'#EF4444',label:'LOSS ✗'},
                expired:{bg:'rgba(113,113,122,0.1)',color:brand.smoke,label:'EXPIRED'},
                watching:{bg:'rgba(245,158,11,0.1)',color:brand.amber,label:'WATCHING'},
              };
              const st=sc[pick.status]||sc.expired;
              return <div key={pick.id} style={{borderBottom:`1px solid ${brand.border}`}}>
                {/* Header row — always visible */}
                <div onClick={()=>setExpandedPick(isOpen?null:pick.id)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',cursor:'pointer',background:isOpen?'rgba(245,158,11,0.04)':'transparent',transition:'background 0.15s'}}>
                  <span style={{fontSize:11,color:brand.smoke,fontFamily:M,minWidth:80}}>{pick.date}</span>
                  <span onClick={(e)=>{e.stopPropagation();tickClick(pick.symbol);}} style={{color:brand.amber,fontWeight:700,fontSize:13,fontFamily:M,minWidth:60,cursor:'pointer'}}>{pick.symbol}</span>
                  <span style={{fontSize:12,color:brand.white,fontWeight:600,minWidth:100}}>{fp(pick.priceAtPick)}</span>
                  <span style={{fontSize:10,fontFamily:M,padding:'2px 6px',borderRadius:3,background:pick.direction==='LONG'?'rgba(34,197,94,0.1)':pick.direction==='SHORT'?'rgba(239,68,68,0.1)':'rgba(245,158,11,0.1)',color:pick.direction==='LONG'?'#22C55E':pick.direction==='SHORT'?'#EF4444':brand.amber,fontWeight:700}}>{pick.direction}</span>
                  <span style={{flex:1,fontSize:11,color:brand.silver,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{pick.thesis}</span>
                  <span style={{display:'flex',gap:1}}>{Array.from({length:pick.conviction},(_,i)=><span key={i} style={{fontSize:10}}>🔥</span>)}</span>
                  <span style={{padding:'2px 8px',borderRadius:4,fontSize:10,fontFamily:M,fontWeight:700,background:st.bg,color:st.color}}>{st.label}</span>
                  {pick.result?.pnl&&<span style={{fontSize:11,fontFamily:M,fontWeight:700,color:pick.result.pnl.startsWith('+')?'#22C55E':'#EF4444'}}>{pick.result.pnl}</span>}
                  <span style={{color:brand.smoke,fontSize:14,transform:isOpen?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.2s'}}>▾</span>
                </div>
                {/* Expanded analysis */}
                {isOpen&&<div style={{padding:'0 16px 16px 16px',background:'rgba(0,0,0,0.15)'}}>
                  <div style={{display:'flex',gap:16,marginBottom:12,flexWrap:'wrap'}}>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:10,color:brand.smoke}}>Type:</span>
                      <span style={{padding:'2px 6px',borderRadius:3,fontSize:10,fontFamily:M,background:'rgba(245,158,11,0.1)',color:brand.amber}}>{pick.type.toUpperCase()}</span>
                    </div>
                    {pick.entry&&<div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:10,color:brand.smoke}}>Entry:</span>
                      <span style={{fontSize:11,fontFamily:M,color:'#22C55E',fontWeight:600}}>{pick.entry}</span>
                    </div>}
                    {pick.target&&<div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:10,color:brand.smoke}}>Target:</span>
                      <span style={{fontSize:11,fontFamily:M,color:brand.amber,fontWeight:600}}>{pick.target}</span>
                    </div>}
                    {pick.stop&&<div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:10,color:brand.smoke}}>Stop:</span>
                      <span style={{fontSize:11,fontFamily:M,color:'#EF4444',fontWeight:600}}>{pick.stop}</span>
                    </div>}
                    {pick.result?.exitDate&&<div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:10,color:brand.smoke}}>Exited:</span>
                      <span style={{fontSize:11,fontFamily:M,color:brand.silver}}>{pick.result.exitDate}</span>
                    </div>}
                  </div>
                  {pick.result?.notes&&<div style={{padding:'8px 12px',borderRadius:6,background:'rgba(34,197,94,0.06)',border:'1px solid rgba(34,197,94,0.15)',marginBottom:12}}>
                    <span style={{fontSize:11,color:'#22C55E',fontFamily:M}}>{pick.result.notes}</span>
                  </div>}
                  <div style={{fontSize:12,color:brand.silver,lineHeight:1.7,fontFamily:'system-ui, sans-serif',whiteSpace:'pre-wrap'}}>{pick.analysis}</div>
                  <div style={{display:'flex',gap:6,marginTop:12,flexWrap:'wrap'}}>
                    {pick.tags.map(tag=><span key={tag} style={{padding:'2px 8px',borderRadius:12,fontSize:9,fontFamily:M,background:'rgba(113,113,122,0.1)',color:brand.smoke}}>{tag}</span>)}
                  </div>
                  {pick.source&&<div style={{marginTop:8,fontSize:10,color:brand.smoke,fontFamily:M,fontStyle:'italic'}}>Source: {pick.source}</div>}
                </div>}
              </div>;
            })}
            {filteredPicks.length===0&&<div style={{padding:32,textAlign:'center',color:brand.smoke,fontSize:12,fontFamily:M}}>No picks match this filter</div>}
          </div>
        </div>

        {/* FOOTER */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:16,padding:'12px 0',borderTop:`1px solid ${brand.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:24,height:24,borderRadius:'50%',background:'#000',border:'2px solid #22C55E',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:10,fontWeight:700,color:'#22C55E'}}>B</span>
            </div>
            <span style={{fontFamily:M,fontSize:11,color:brand.smoke}}>Powered by <span style={{color:'#22C55E',fontWeight:600}}>Bobby</span> // Trading Advisor AI</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontFamily:M,fontSize:10,color:brand.smoke}}>AXECAP TERMINAL v5.0</span>
            <span style={{fontSize:10,color:brand.smoke}}>{live?'Live data via Yahoo Finance':'Cached/fallback data'}{lr&&` | ${fmt(lr)}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}