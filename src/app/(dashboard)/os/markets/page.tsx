'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { brand, styles } from '@/lib/brand';

interface Quote { symbol: string; name: string; price: number; change: number; changePercent: number; high: number; low: number; marketState?: string; }
interface NewsItem { id: string; title: string; publisher: string; link?: string; publishedAt: string; relatedSymbol: string; }
interface OptionContract { strike: number; last: number; change: number; changePercent: number; volume: number; openInterest: number; impliedVolatility: number; delta: number; gamma: number; theta: number; vega: number; vwap: number; high: number; low: number; ticker: string; }
interface ChainData { symbol: string; expDate: string; currentPrice: number; calls: OptionContract[]; puts: OptionContract[]; expirations: string[]; }
interface ZeroDTEContract { symbol: string; strike: number; type: 'CALL' | 'PUT'; expiry: string; last: number; change: number; changePercent: number; volume: number; openInterest: number; impliedVolatility: number; vwap: number; ticker: string; }
interface UnusualContract extends ZeroDTEContract { volOiRatio: number; }
interface SectorQuote { price: number; change: number; changePercent: number; volume: number; name: string; high: number; low: number; }
interface SparklineData { timestamps: number[]; closes: number[]; }
interface PCRData { pcr: number; totalPuts: number; totalCalls: number; sentiment: string; }

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

  const tickClick = useCallback((s:string) => { if(csym===s){setCsym(null);setCdata(null);return;} setCsym(s);setSexp('');fetchC(s); },[csym,fetchC]);
  const expChange = useCallback((e:string) => { setSexp(e); if(csym) fetchC(csym,e); },[csym,fetchC]);
  const refreshAll = useCallback(() => { fetchD(wl);fetchZ();fetchU();fetchS();fetchP();setCd(30); },[fetchD,fetchZ,fetchU,fetchS,fetchP,wl]);

  const addSym = useCallback(() => {
    const s=ns.trim().toUpperCase();
    if(s&&!wl.includes(s)){const n=[...wl,s];setWl(n);localStorage.setItem('axecap-watchlist',JSON.stringify(n));setNs('');fetchD(n);fetchSp([s]);}
  },[ns,wl,fetchD,fetchSp]);
  const remSym = useCallback((s:string) => { const n=wl.filter(x=>x!==s);setWl(n);localStorage.setItem('axecap-watchlist',JSON.stringify(n)); },[wl]);

  useEffect(() => {
    let w=DWL; try{const s=localStorage.getItem('axecap-watchlist');if(s){w=JSON.parse(s);setWl(w);}}catch{}
    fetchD(w);fetchZ();fetchU();fetchS();fetchP();fetchSp(w);
  },[fetchD,fetchZ,fetchU,fetchS,fetchP,fetchSp]);

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
            <h1 style={{...styles.h1,fontSize:'1.5rem',letterSpacing:'0.05em',display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
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
              <span style={{color:brand.amber,fontWeight:700,fontSize:13,fontFamily:M,letterSpacing:'0.05em'}}>AXECAP TERMINAL</span>
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

        {/* TWO COLUMNS: WATCHLIST + NEWS */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.5rem',marginBottom:'1.5rem'}}>
          <div style={styles.card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <span style={{color:brand.amber,fontSize:13,fontWeight:600,fontFamily:M}}>WATCHLIST</span>
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
            <div style={{color:brand.amber,fontSize:13,fontWeight:600,marginBottom:16,fontFamily:M}}>MARKET BRIEFING</div>
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
          </div>
        </div>

        {/* OPTIONS CHAIN */}
        {csym&&<div style={{...styles.card,marginBottom:'1.5rem',padding:0,overflow:'hidden'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 16px',borderBottom:`1px solid ${brand.border}`,background:brand.graphite}}>
            <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
              <span style={{color:brand.amber,fontWeight:700,fontSize:13,fontFamily:M}}>OPTIONS CHAIN | {csym}</span>
              {cdata&&<><span style={{fontSize:10,color:brand.smoke,fontFamily:M}}>Spot: <span style={{color:brand.white}}>{f2(cdata.currentPrice)}</span></span>
                {cdata.expirations?.length>1&&<select value={sexp} onChange={e=>expChange(e.target.value)} style={{background:brand.graphite,color:brand.amber,border:`1px solid ${brand.border}`,borderRadius:4,padding:'2px 8px',fontSize:10,fontFamily:M,cursor:'pointer'}}>{cdata.expirations.map(x=><option key={x} value={x}>{x}</option>)}</select>}</>}
            </div>
            <button onClick={()=>{setCsym(null);setCdata(null);}} style={{background:'none',border:'none',color:brand.smoke,cursor:'pointer',fontSize:18,padding:'0 4px'}}>✕</button>
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
        </div>}

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

        {/* FOOTER */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:16,padding:'12px 0',borderTop:`1px solid ${brand.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:24,height:24,borderRadius:'50%',background:'#000',border:'2px solid #22C55E',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <span style={{fontSize:10,fontWeight:700,color:'#22C55E'}}>B</span>
            </div>
            <span style={{fontFamily:M,fontSize:11,color:brand.smoke}}>Powered by <span style={{color:'#22C55E',fontWeight:600}}>Bobby</span> // Trading Advisor AI</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontFamily:M,fontSize:10,color:brand.smoke}}>AXECAP TERMINAL v4.0</span>
            <span style={{fontSize:10,color:brand.smoke}}>{live?'Live data via Yahoo Finance':'Cached/fallback data'}{lr&&` | ${fmt(lr)}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
}