import { useState, useEffect } from "react";

const G = "#1A8A6A";
const CARDS = [
  { id:1, e:"🔥", nm:"셰프스 테이블", sub:"스타 셰프 코칭", c:"#E8593C", bg:"#FFF5F2", n:24, cat:"meal" },
  { id:2, e:"🍚", nm:"하루한끼", sub:"간헐적 단식 한 끼", c:"#2E7DD1", bg:"#F0F6FD", n:18, cat:"meal" },
  { id:3, e:"🏠", nm:"엄마손맛", sub:"세대를 잇는 가정식", c:"#4A9E3F", bg:"#F2F9F1", n:32, cat:"meal" },
  { id:4, e:"📺", nm:"드라마 한 끼", sub:"K-콘텐츠 레시피", c:"#7B5DC7", bg:"#F5F1FD", n:15, cat:"meal" },
  { id:5, e:"🌿", nm:"혼웰 라이프", sub:"나만의 웰빙 루틴", c:"#1A8A6A", bg:"#EFF9F5", n:27, cat:"meal" },
  { id:6, e:"🌾", nm:"제철한상", sub:"절기·시즌 식재료", c:"#B8860B", bg:"#FDF8ED", n:12, cat:"meal", nw:true },
  { id:7, e:"🌍", nm:"글로벌 원플레이트", sub:"세계 한 접시", c:"#6B6B65", bg:"#F5F5F3", n:20, cat:"meal", nw:true },
  { id:8, e:"🍡", nm:"K-디저트 랩", sub:"한국 디저트 실험실", c:"#C44D7B", bg:"#FDF1F5", n:9, cat:"snack", nw:true },
  { id:9, e:"🎒", nm:"방과후 간식팩", sub:"성장기 건강 간식", c:"#C43030", bg:"#FDF1F1", n:14, cat:"snack", nw:true },
  { id:10, e:"🎬", nm:"홈시네마 나이트", sub:"영화 시청 페어링", c:"#0F6E56", bg:"#EFF9F5", n:8, cat:"cinema", nw:true },
];

const DETAIL_CARDS = {
  5: [
    { title:"Morning Glow Bowl", desc:"피부 관리 원 보울", items:["연어 100g","아보카도 1/2","퀴노아 100g","블루베리 50g","견과류 30g"], price:12400, health:92, img:"🥗" },
    { title:"After-Run Refuel", desc:"운동 후 고단백 회복식", items:["닭가슴살 150g","현미밥 1공기","브로콜리 100g","삶은 계란 2개"], price:8900, health:95, img:"💪" },
    { title:"Stress-Off Dinner", desc:"스트레스 해소 저녁", items:["두부 1모","시금치 100g","표고버섯 50g","현미밥 1공기","된장 1T"], price:7200, health:88, img:"🧘" },
  ],
  1: [
    { title:"Chef Choi's 간편한식", desc:"40년 내공 한식 반찬 3종", items:["소고기 200g","무 1/4","대파 2대","간장·설탕·마늘"], price:18500, health:78, img:"👨‍🍳" },
    { title:"Chef Yoon's 안주 세트", desc:"전통주 페어링 안주", items:["두부 1모","김치 200g","고등어 1마리","소주 1병"], price:22000, health:72, img:"🍶" },
  ],
  10: [
    { title:"액션 무비 세트", desc:"하이볼+닭강정+나초", items:["위스키 미니 1병","탄산수 2캔","닭강정 300g","나초칩 1봉","살사소스"], price:24500, health:45, img:"🎬" },
    { title:"키즈 무비나이트", desc:"주스+팝콘+과일꼬치", items:["오렌지주스 2팩","팝콘 옥수수 100g","딸기 10개","바나나 2개","꼬치"], price:11200, health:82, img:"🧒" },
  ],
};

const FAMILY = [
  { nm:"수진", role:"엄마(관리자)", av:"👩", lv:7, cards:45, color:"#4A9E3F" },
  { nm:"아빠", role:"공동관리", av:"👨", lv:4, cards:18, color:"#2E7DD1" },
  { nm:"서연", role:"트렌드 큐레이터", av:"👧", lv:5, cards:31, color:"#7B5DC7", teen:true },
  { nm:"하준", role:"우리집 막내셰프", av:"👦", lv:3, cards:12, color:"#E8593C", kid:true },
];

const VOTES = [
  { menu:"멕시코 타코 나이트", card:"글로벌 원플레이트", voters:["👩","👧","👦"], total:3 },
  { menu:"김치찌개+계란말이", card:"엄마손맛", voters:["👨","👦"], total:2 },
  { menu:"흑백요리사 미션 재현", card:"드라마 한 끼", voters:["👧"], total:1 },
];

const Phone = ({ children }) => (
  <div style={{ width:375, minHeight:812, maxHeight:812, overflow:"hidden", margin:"0 auto", background:"#FAFAF7", fontFamily:"'Pretendard',-apple-system,sans-serif", position:"relative", borderRadius:24, border:"1px solid #E0E0DB" }}>
    <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 20px 0", fontSize:11, color:"#999" }}>
      <span style={{ fontWeight:600 }}>9:41</span>
      <div style={{ display:"flex", gap:3, alignItems:"center" }}>
        <span style={{ fontSize:9 }}>●●●●</span>
        <span style={{ background:"#222", color:"#fff", borderRadius:3, padding:"0 4px", fontSize:9, fontWeight:600 }}>87</span>
      </div>
    </div>
    {children}
  </div>
);

const Pill = ({ children, active, onClick, style = {} }) => (
  <button onClick={onClick} style={{ padding:"5px 12px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontWeight:active?600:400, background:active?"#1A1A18":"#F0F0EB", color:active?"#fff":"#888", fontFamily:"inherit", transition:"all .15s", whiteSpace:"nowrap", ...style }}>
    {children}
  </button>
);

export default function FreshPickPrototype() {
  const [screen, setScreen] = useState(0);
  const [detailCard, setDetailCard] = useState(null);
  const [catFilter, setCatFilter] = useState("all");
  const [flipped, setFlipped] = useState(null);
  const [cart, setCart] = useState([]);
  const [kidMode, setKidMode] = useState(null);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setLoaded(true); }, []);
  useEffect(() => { setLoaded(false); setTimeout(() => setLoaded(true), 50); }, [screen]);

  const screenNames = ["카드메뉴 홈","카드 상세","AI채팅+카드","우리가족","키즈·청소년","장바구니"];

  const filtered = catFilter==="all" ? CARDS : CARDS.filter(c=>c.cat===catFilter);

  const addToCart = (item) => { setCart(prev => [...prev, item]); };

  // ─── Screen 0: Card Menu Home ───
  const Screen0 = () => (
    <>
      <div style={{ padding:"12px 20px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ margin:0, fontSize:11, color:"#AAA" }}>FreshPick AI장보기</p>
            <h1 style={{ margin:"1px 0 0", fontSize:20, fontWeight:700, color:"#1A1A18", letterSpacing:-.5 }}>카드메뉴</h1>
          </div>
          <div style={{ width:34, height:34, borderRadius:10, background:G, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", fontWeight:700 }}>수</div>
        </div>
      </div>
      {/* Trending */}
      <div style={{ padding:"12px 20px 8px" }}>
        <div style={{ background:`linear-gradient(135deg, ${G} 0%, #2E7DD1 100%)`, borderRadius:14, padding:"12px 14px", color:"#fff" }}>
          <p style={{ margin:0, fontSize:9, opacity:.7, fontWeight:600, letterSpacing:1 }}>TRENDING NOW</p>
          <p style={{ margin:"3px 0 6px", fontSize:14, fontWeight:600 }}>이번 주 인기 카드 TOP 3</p>
          {[["1","흑백요리사 미션 재현","HOT"],["2","봄동 비빔밥 세트",""],["3","금요 무비나이트","HOT"]].map(([n,t,h])=>(
            <div key={n} style={{ display:"flex", gap:6, alignItems:"center", fontSize:11, marginBottom:2 }}>
              <span style={{ background:"rgba(255,255,255,.2)", borderRadius:8, padding:"0 6px", fontSize:9, fontWeight:700 }}>{n}</span>
              <span style={{ fontWeight:500 }}>{t}</span>
              {h && <span style={{ fontSize:8, background:"rgba(255,255,255,.25)", padding:"0 5px", borderRadius:6 }}>{h}</span>}
            </div>
          ))}
        </div>
      </div>
      {/* Filter */}
      <div style={{ padding:"2px 20px 6px", display:"flex", gap:5, overflowX:"auto" }}>
        {[["all","전체 10종"],["meal","식사 7종"],["snack","간식 2종"],["cinema","홈시네마"]].map(([k,l])=>(
          <Pill key={k} active={catFilter===k} onClick={()=>setCatFilter(k)}>{l}</Pill>
        ))}
      </div>
      {/* Grid */}
      <div style={{ padding:"4px 20px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, overflowY:"auto", maxHeight:420, paddingBottom:20 }}>
        {filtered.map((cd,i) => (
          <div key={cd.id} onClick={()=>{ setDetailCard(cd.id); setScreen(1); }}
            style={{ background:"#fff", borderRadius:14, padding:"13px 12px", border:"1px solid #EDEDE8", cursor:"pointer", position:"relative",
              opacity:loaded?1:0, transform:loaded?"translateY(0)":"translateY(10px)", transition:`all .35s ease ${i*.05}s` }}>
            {cd.nw && <span style={{ position:"absolute", top:8, right:8, background:cd.c, color:"#fff", fontSize:7, fontWeight:700, padding:"1px 5px", borderRadius:5 }}>NEW</span>}
            <div style={{ width:38, height:38, borderRadius:12, background:cd.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:8 }}>{cd.e}</div>
            <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#1A1A18" }}>{cd.nm}</p>
            <p style={{ margin:"2px 0 0", fontSize:10, color:"#AAA" }}>{cd.sub}</p>
            <span style={{ display:"inline-block", marginTop:8, fontSize:9, color:cd.c, fontWeight:600, background:cd.bg, padding:"2px 7px", borderRadius:8 }}>{cd.n}장</span>
          </div>
        ))}
      </div>
    </>
  );

  // ─── Screen 1: Card Detail (Flip) ───
  const Screen1 = () => {
    const cd = CARDS.find(c=>c.id===(detailCard||5));
    const items = DETAIL_CARDS[cd.id] || DETAIL_CARDS[5];
    return (
      <>
        <div style={{ padding:"12px 20px 0", display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>setScreen(0)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", padding:0 }}>←</button>
          <h2 style={{ margin:0, fontSize:17, fontWeight:700, flex:1 }}>{cd.e} {cd.nm}</h2>
          <span style={{ fontSize:11, color:cd.c, fontWeight:600, background:cd.bg, padding:"3px 10px", borderRadius:10 }}>{cd.n}장</span>
        </div>
        <p style={{ margin:"4px 20px 10px", fontSize:11, color:"#999" }}>{cd.sub}</p>
        <div style={{ padding:"0 20px", display:"flex", flexDirection:"column", gap:10, overflowY:"auto", maxHeight:580, paddingBottom:20 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ background:"#fff", borderRadius:16, border:"1px solid #EDEDE8", overflow:"hidden",
              cursor:"pointer", transition:"transform .2s" }}
              onClick={()=>setFlipped(flipped===idx?null:idx)}>
              {/* Front */}
              {flipped!==idx ? (
                <div style={{ padding:"16px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <span style={{ fontSize:28 }}>{item.img}</span>
                      <p style={{ margin:"6px 0 2px", fontSize:15, fontWeight:600, color:"#1A1A18" }}>{item.title}</p>
                      <p style={{ margin:0, fontSize:11, color:"#999" }}>{item.desc}</p>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <p style={{ margin:0, fontSize:16, fontWeight:700, color:G }}>₩{item.price.toLocaleString()}</p>
                      <div style={{ display:"flex", gap:4, marginTop:4, justifyContent:"flex-end" }}>
                        <span style={{ fontSize:9, background:item.health>=80?"#EFF9F5":"#FDF8ED", color:item.health>=80?G:"#B8860B", padding:"2px 6px", borderRadius:8, fontWeight:600 }}>
                          건강 {item.health}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{ margin:"8px 0 0", fontSize:10, color:"#BBB", textAlign:"center" }}>탭하면 식재료 상세 보기</p>
                </div>
              ) : (
                /* Back */
                <div style={{ padding:"16px", background:cd.bg }}>
                  <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:600, color:cd.c }}>{item.title} — 식재료</p>
                  {item.items.map((ing, j) => (
                    <div key={j} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 0", borderBottom:j<item.items.length-1?"1px solid rgba(0,0,0,.06)":"none" }}>
                      <span style={{ fontSize:12, color:"#333" }}>{ing}</span>
                      <button onClick={(e)=>{ e.stopPropagation(); addToCart({ name:ing, card:item.title, price:Math.round(item.price/item.items.length) }); }}
                        style={{ background:cd.c, color:"#fff", border:"none", borderRadius:8, fontSize:10, padding:"4px 10px", cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}>
                        담기
                      </button>
                    </div>
                  ))}
                  <button onClick={(e)=>{ e.stopPropagation(); item.items.forEach(ing=>addToCart({ name:ing, card:item.title, price:Math.round(item.price/item.items.length) })); }}
                    style={{ width:"100%", marginTop:10, background:cd.c, color:"#fff", border:"none", borderRadius:12, fontSize:12, padding:"10px", cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}>
                    전체 장바구니에 담기 — ₩{item.price.toLocaleString()}
                  </button>
                  <p style={{ margin:"6px 0 0", fontSize:10, color:cd.c, textAlign:"center", opacity:.7 }}>탭하면 앞면으로</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

  // ─── Screen 2: AI Chat + Card ───
  const Screen2 = () => {
    const [input, setInput] = useState("");
    const defaultMsgs = [
      { role:"ai", text:"안녕하세요! FreshPick입니다 🌿\n오늘 어떤 카드메뉴를 도와드릴까요?", cards:null },
      { role:"user", text:"오늘 저녁 중식이 땡기는데 칼로리 낮은 거 추천해줘" },
      { role:"ai", text:"중식이 땡기시는군요! 혼웰 라이프 카드에서 저칼로리 중식 원보울을 찾았어요.", cards:[
        { title:"저칼로리 새우볶음밥", price:9800, health:87, emoji:"🍳" },
        { title:"두부 유산슬 덮밥", price:8500, health:91, emoji:"🥘" }
      ]},
    ];
    const msgs = chatMsgs.length > 0 ? chatMsgs : defaultMsgs;
    return (
      <>
        <div style={{ padding:"12px 20px 0", display:"flex", alignItems:"center", gap:10 }}>
          <h2 style={{ margin:0, fontSize:17, fontWeight:700, flex:1 }}>AI채팅</h2>
          <span style={{ fontSize:10, color:G, fontWeight:600, background:"#EFF9F5", padding:"3px 8px", borderRadius:8 }}>FreshPick</span>
        </div>
        <div style={{ padding:"10px 20px", overflowY:"auto", maxHeight:540, display:"flex", flexDirection:"column", gap:10 }}>
          {msgs.map((m,i) => (
            <div key={i} style={{ alignSelf:m.role==="user"?"flex-end":"flex-start", maxWidth:"85%" }}>
              {m.role==="ai" && <span style={{ fontSize:9, color:G, fontWeight:600, marginBottom:2, display:"block" }}>FreshPick</span>}
              <div style={{
                background:m.role==="user"?G:"#fff",
                color:m.role==="user"?"#fff":"#333",
                padding:"10px 13px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
                fontSize:13, lineHeight:1.5, border:m.role==="ai"?"1px solid #EDEDE8":"none",
                whiteSpace:"pre-wrap"
              }}>
                {m.text}
              </div>
              {m.cards && (
                <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:6 }}>
                  {m.cards.map((c,j) => (
                    <div key={j} style={{ background:"#fff", border:"1px solid #EDEDE8", borderRadius:12, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <span style={{ fontSize:18 }}>{c.emoji}</span>
                        <p style={{ margin:"2px 0 0", fontSize:12, fontWeight:600 }}>{c.title}</p>
                        <div style={{ display:"flex", gap:6, marginTop:3 }}>
                          <span style={{ fontSize:10, color:G, fontWeight:600 }}>₩{c.price.toLocaleString()}</span>
                          <span style={{ fontSize:9, background:"#EFF9F5", color:G, padding:"1px 5px", borderRadius:6 }}>건강 {c.health}</span>
                        </div>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        <button onClick={()=>addToCart({ name:c.title, card:"혼웰", price:c.price })}
                          style={{ background:G, color:"#fff", border:"none", borderRadius:8, fontSize:10, padding:"5px 10px", cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}>
                          담기
                        </button>
                        <button style={{ background:"none", color:G, border:`1px solid ${G}`, borderRadius:8, fontSize:10, padding:"4px 10px", cursor:"pointer", fontWeight:500, fontFamily:"inherit" }}>
                          메모
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ position:"absolute", bottom:68, left:0, right:0, padding:"10px 16px", background:"#FAFAF7", borderTop:"1px solid #EDEDE8" }}>
          <div style={{ display:"flex", gap:8, alignItems:"center", background:"#fff", borderRadius:14, border:"1px solid #E0E0DB", padding:"8px 12px" }}>
            <span style={{ fontSize:16, cursor:"pointer" }}>+</span>
            <input value={input} onChange={e=>setInput(e.target.value)} placeholder="오늘 어떤 음식을 준비할까?"
              style={{ flex:1, border:"none", outline:"none", fontSize:13, background:"transparent", fontFamily:"inherit" }} />
            <div style={{ width:30, height:30, borderRadius:10, background:"#1A1A18", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              <span style={{ color:"#fff", fontSize:14 }}>↑</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ─── Screen 3: Family Board ───
  const Screen3 = () => (
    <>
      <div style={{ padding:"12px 20px 0" }}>
        <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>👨‍👩‍👧‍👦 우리가족</h2>
        <p style={{ margin:"2px 0 0", fontSize:11, color:"#999" }}>김수진네 가족 · 4명</p>
      </div>
      {/* Family Members */}
      <div style={{ padding:"10px 20px", display:"flex", gap:8, overflowX:"auto" }}>
        {FAMILY.map((f,i) => (
          <div key={i} style={{ minWidth:80, background:"#fff", borderRadius:14, border:"1px solid #EDEDE8", padding:"12px 10px", textAlign:"center", cursor:"pointer" }}
            onClick={()=>{ if(f.kid) { setKidMode("kid"); setScreen(4); } else if(f.teen) { setKidMode("teen"); setScreen(4); } }}>
            <span style={{ fontSize:28 }}>{f.av}</span>
            <p style={{ margin:"4px 0 1px", fontSize:12, fontWeight:600 }}>{f.nm}</p>
            <p style={{ margin:0, fontSize:9, color:"#AAA" }}>{f.role}</p>
            <div style={{ marginTop:6, display:"flex", justifyContent:"center", gap:4 }}>
              <span style={{ fontSize:9, background:f.color+"18", color:f.color, padding:"1px 6px", borderRadius:6, fontWeight:600 }}>Lv.{f.lv}</span>
              <span style={{ fontSize:9, background:"#F5F5F3", color:"#888", padding:"1px 6px", borderRadius:6 }}>{f.cards}장</span>
            </div>
          </div>
        ))}
      </div>
      {/* Vote Board */}
      <div style={{ padding:"4px 20px 8px" }}>
        <div style={{ background:"#fff", borderRadius:14, border:"1px solid #EDEDE8", padding:"14px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
            <p style={{ margin:0, fontSize:13, fontWeight:600 }}>🗳️ 이번 주 뭐 먹지?</p>
            <span style={{ fontSize:9, color:G, fontWeight:600, background:"#EFF9F5", padding:"2px 8px", borderRadius:8 }}>투표 중</span>
          </div>
          {VOTES.map((v,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<2?"1px solid #F5F5F3":"none" }}>
              <div>
                <p style={{ margin:0, fontSize:12, fontWeight:500 }}>{v.menu}</p>
                <p style={{ margin:"1px 0 0", fontSize:10, color:"#AAA" }}>{v.card}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ display:"flex" }}>
                  {v.voters.map((vt,j)=> <span key={j} style={{ fontSize:14, marginLeft:j>0?-4:0 }}>{vt}</span>)}
                </div>
                <span style={{ fontSize:11, fontWeight:600, color:i===0?G:"#AAA" }}>{v.total}표</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Family Collection / Ranking */}
      <div style={{ padding:"0 20px 8px" }}>
        <div style={{ background:"#fff", borderRadius:14, border:"1px solid #EDEDE8", padding:"14px" }}>
          <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:600 }}>📊 이번 달 우리가족 TOP 3</p>
          {[["🥇","엄마의 된장찌개","12회","⭐ 4.8"],["🥈","타코 나이트","8회","⭐ 4.6"],["🥉","금요 무비나이트 세트","6회","⭐ 4.5"]].map(([m,t,cnt,r],i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 0", borderBottom:i<2?"1px solid #F5F5F3":"none" }}>
              <span style={{ fontSize:18 }}>{m}</span>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:12, fontWeight:500 }}>{t}</p>
                <p style={{ margin:0, fontSize:10, color:"#AAA" }}>{cnt} · {r}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Shared Cards */}
      <div style={{ padding:"0 20px" }}>
        <div style={{ background:"#fff", borderRadius:14, border:"1px solid #EDEDE8", padding:"14px" }}>
          <p style={{ margin:"0 0 6px", fontSize:13, fontWeight:600 }}>⭐ 우리 아이가 좋아하는</p>
          <div style={{ display:"flex", gap:6, overflowX:"auto" }}>
            {["카레라이스 ⭐5","떡볶이 ⭐5","팝콘치킨 ⭐4","약과파이 ⭐4"].map((t,i) => (
              <span key={i} style={{ fontSize:10, background:"#FDF1F1", color:"#C43030", padding:"4px 10px", borderRadius:10, whiteSpace:"nowrap", fontWeight:500 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  // ─── Screen 4: Kids / Teen Mode ───
  const Screen4 = () => {
    const isKid = kidMode === "kid";
    return (
      <>
        <div style={{ padding:"12px 20px 0", display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={()=>setScreen(3)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", padding:0 }}>←</button>
          <h2 style={{ margin:0, fontSize:17, fontWeight:700 }}>{isKid ? "👦 하준이 모드" : "👧 서연이 모드"}</h2>
          <span style={{ fontSize:10, background:isKid?"#FDF1F1":"#F5F1FD", color:isKid?"#C43030":"#7B5DC7", padding:"2px 8px", borderRadius:8, fontWeight:600 }}>
            {isKid?"키즈":"청소년"}
          </span>
        </div>
        {isKid ? (
          /* Kids Mode */
          <div style={{ padding:"12px 20px" }}>
            <div style={{ background:"#FFF9F0", borderRadius:16, padding:"16px", border:"1px solid #F5E6D0", marginBottom:10 }}>
              <p style={{ margin:"0 0 8px", fontSize:14, fontWeight:600 }}>🍛 오늘 먹고 싶은 거 있어?</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {["🍛 카레","🍝 파스타","🍕 피자","🍗 치킨","🍜 라면","🥟 만두"].map((f,i) => (
                  <button key={i} style={{ background:"#fff", border:"1px solid #F0E8DD", borderRadius:12, padding:"10px 4px", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:500, textAlign:"center" }}>
                    {f}
                  </button>
                ))}
              </div>
              <p style={{ margin:"10px 0 0", fontSize:10, color:"#C49A60", textAlign:"center" }}>선택하면 엄마에게 알림이 가요!</p>
            </div>
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #EDEDE8", padding:"14px", marginBottom:10 }}>
              <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:600 }}>⭐ 어제 저녁 어땠어?</p>
              <p style={{ margin:"0 0 8px", fontSize:12, color:"#666" }}>엄마의 김치찌개</p>
              <div style={{ display:"flex", gap:4 }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ fontSize:24, cursor:"pointer", opacity:s<=4?1:.3 }}>⭐</span>
                ))}
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #EDEDE8", padding:"14px" }}>
              <p style={{ margin:"0 0 6px", fontSize:13, fontWeight:600 }}>🎯 이번 주 미션</p>
              <div style={{ background:"#F5F1FD", borderRadius:10, padding:"10px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:22 }}>🌮</span>
                <div>
                  <p style={{ margin:0, fontSize:12, fontWeight:600, color:"#7B5DC7" }}>새로운 음식 1개 도전!</p>
                  <p style={{ margin:0, fontSize:10, color:"#999" }}>완료하면 스티커 획득</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Teen Mode */
          <div style={{ padding:"12px 20px" }}>
            <div style={{ background:"#F5F1FD", borderRadius:16, padding:"14px", border:"1px solid #E8E0F5", marginBottom:10 }}>
              <p style={{ margin:"0 0 8px", fontSize:14, fontWeight:600, color:"#7B5DC7" }}>📺 트렌딩 카드 만들기</p>
              <p style={{ margin:"0 0 10px", fontSize:11, color:"#888" }}>틱톡·인스타에서 본 요리를 카드로!</p>
              <div style={{ display:"flex", gap:6 }}>
                <button style={{ flex:1, background:"#7B5DC7", color:"#fff", border:"none", borderRadius:10, padding:"10px", fontSize:12, cursor:"pointer", fontWeight:600, fontFamily:"inherit" }}>
                  새 카드 만들기
                </button>
                <button style={{ flex:1, background:"#fff", color:"#7B5DC7", border:"1px solid #7B5DC7", borderRadius:10, padding:"10px", fontSize:12, cursor:"pointer", fontWeight:500, fontFamily:"inherit" }}>
                  가족에게 제안
                </button>
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #EDEDE8", padding:"14px", marginBottom:10 }}>
              <p style={{ margin:"0 0 8px", fontSize:13, fontWeight:600 }}>🏆 서연이의 활동</p>
              <div style={{ display:"flex", gap:8 }}>
                {[["Lv.5","트렌드 큐레이터","#7B5DC7"],["31장","보유 카드","#2E7DD1"],["8회","직접 조리","#E8593C"]].map(([v,l,cl],i) => (
                  <div key={i} style={{ flex:1, background:cl+"10", borderRadius:10, padding:"10px 8px", textAlign:"center" }}>
                    <p style={{ margin:0, fontSize:16, fontWeight:700, color:cl }}>{v}</p>
                    <p style={{ margin:"2px 0 0", fontSize:9, color:"#999" }}>{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:"#fff", borderRadius:14, border:"1px solid #EDEDE8", padding:"14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:600 }}>🍳 내가 만들었어!</p>
                <span style={{ fontSize:9, background:"#FDF8ED", color:"#B8860B", padding:"2px 6px", borderRadius:6, fontWeight:600 }}>인증 3회</span>
              </div>
              {["흑백요리사 새우볶음밥","멕시코 타코","약과파이"].map((t,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 0", borderBottom:i<2?"1px solid #F5F5F3":"none" }}>
                  <span style={{ fontSize:14 }}>🥇</span>
                  <span style={{ fontSize:12, fontWeight:500, flex:1 }}>{t}</span>
                  <span style={{ fontSize:9, color:G, fontWeight:600 }}>인증완료</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  // ─── Screen 5: Cart + Checkout ───
  const Screen5 = () => (
    <>
      <div style={{ padding:"12px 20px 0", display:"flex", alignItems:"center", gap:10 }}>
        <button onClick={()=>setScreen(0)} style={{ background:"none", border:"none", fontSize:18, cursor:"pointer", padding:0 }}>←</button>
        <h2 style={{ margin:0, fontSize:17, fontWeight:700, flex:1 }}>장바구니</h2>
        <span style={{ fontSize:11, color:"#999" }}>{cart.length}개</span>
      </div>
      <div style={{ padding:"10px 20px", overflowY:"auto", maxHeight:500 }}>
        {cart.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"#CCC" }}>
            <p style={{ fontSize:32 }}>🛒</p>
            <p style={{ fontSize:13, fontWeight:500 }}>장바구니가 비어있어요</p>
            <p style={{ fontSize:11 }}>카드 상세에서 식재료를 담아보세요</p>
          </div>
        ) : (
          <>
            {cart.map((item, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #F5F5F3" }}>
                <div>
                  <p style={{ margin:0, fontSize:13, fontWeight:500 }}>{item.name}</p>
                  <p style={{ margin:"1px 0 0", fontSize:10, color:"#AAA" }}>{item.card}</p>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:4, background:"#F5F5F3", borderRadius:8, padding:"4px 8px" }}>
                    <button onClick={()=>{}} style={{ background:"none", border:"none", fontSize:14, cursor:"pointer", padding:0, color:"#888" }}>−</button>
                    <span style={{ fontSize:12, fontWeight:600, minWidth:16, textAlign:"center" }}>1</span>
                    <button onClick={()=>{}} style={{ background:"none", border:"none", fontSize:14, cursor:"pointer", padding:0, color:"#888" }}>+</button>
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:G }}>₩{item.price.toLocaleString()}</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop:16, background:"#fff", borderRadius:14, border:"1px solid #EDEDE8", padding:"14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:12, color:"#999" }}>상품 합계</span>
                <span style={{ fontSize:12, fontWeight:600 }}>₩{cart.reduce((s,c)=>s+c.price,0).toLocaleString()}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"#999" }}>배달/픽업</span>
                <span style={{ fontSize:12, color:G, fontWeight:600 }}>매장픽업 무료</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:"1px solid #F0F0EB" }}>
                <span style={{ fontSize:14, fontWeight:700 }}>총 결제금액</span>
                <span style={{ fontSize:16, fontWeight:700, color:G }}>₩{cart.reduce((s,c)=>s+c.price,0).toLocaleString()}</span>
              </div>
            </div>
            <button style={{ width:"100%", marginTop:12, background:G, color:"#fff", border:"none", borderRadius:14, padding:"14px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              결제하기
            </button>
          </>
        )}
      </div>
    </>
  );

  const screens = [Screen0, Screen1, Screen2, Screen3, Screen4, Screen5];
  const CurrentScreen = screens[screen];

  return (
    <Phone>
      {/* Screen Tabs */}
      <div style={{ padding:"6px 12px 0", display:"flex", gap:3, overflowX:"auto" }}>
        {screenNames.map((nm, i) => (
          <button key={i} onClick={()=>setScreen(i)}
            style={{ padding:"4px 8px", borderRadius:8, border:"none", fontSize:9, cursor:"pointer",
              background:screen===i?G+"15":"transparent", color:screen===i?G:"#BBB",
              fontWeight:screen===i?600:400, fontFamily:"inherit", whiteSpace:"nowrap", transition:"all .15s" }}>
            {i+1}. {nm}
          </button>
        ))}
      </div>
      <CurrentScreen />
      {/* Bottom Nav */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"#fff", borderTop:"1px solid #EDEDE8", display:"flex", justifyContent:"space-around", padding:"8px 0 20px", zIndex:10 }}>
        {[["🏠","홈",false],["🛒","장바구니",screen===5],["✨","AI장보기",screen<=2],["📋","주문",false],["👤","마이",false]].map(([ic,lb,ac],i)=>(
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:1, cursor:"pointer", position:"relative" }}
            onClick={()=>{ if(i===1) setScreen(5); if(i===2) setScreen(0); }}>
            <span style={{ fontSize:18, opacity:ac?1:.35 }}>{ic}</span>
            <span style={{ fontSize:9, fontWeight:ac?600:400, color:ac?G:"#CCC" }}>{lb}</span>
            {i===1 && cart.length>0 && (
              <span style={{ position:"absolute", top:-2, right:-4, background:"#E8593C", color:"#fff", fontSize:8, fontWeight:700, width:16, height:16, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>{cart.length}</span>
            )}
          </div>
        ))}
      </div>
    </Phone>
  );
}
