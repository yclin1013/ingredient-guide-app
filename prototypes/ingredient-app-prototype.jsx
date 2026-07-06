import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, Check, Sprout, Apple, Fish, Beef } from 'lucide-react';

const INK = '#1F2E22';
const MUTED = '#8A8779';
const PAPER = '#F3F5EE';
const LINE = '#E4E1D5';
const STAMP_RED = '#B33A2E';

const CATS = {
  蔬菜: { icon: Sprout, color: '#3F6B4A' },
  水果: { icon: Apple, color: '#E08A2C' },
  海鮮: { icon: Fish, color: '#2E6E8E' },
  肉品: { icon: Beef, color: '#8B4A32' },
};

const ITEMS = [
  {
    id: 'cabbage',
    name: '高麗菜',
    category: '蔬菜',
    months: Array.from({ length: 12 }, (_, i) => i + 1),
    characteristics: '葉球緊實，層層包覆，口感清脆微甜，是台灣家常菜最常見的蔬菜之一。',
    tips: [
      '葉球拿起來有沉重感，代表水分充足',
      '外葉翠綠無枯黃，也沒有蟲咬破洞',
      '葉球壓起來緊實不鬆軟',
      '切口處新鮮濕潤，避免發黑乾裂',
    ],
    nutrition: [
      { label: '熱量', value: '約 23 kcal/100g' },
      { label: '維生素C', value: '含量高' },
      { label: '膳食纖維', value: '含量高' },
      { label: '鉀', value: '尚可' },
    ],
    storage: '保鮮膜包裹後冷藏，可放 7–10 天；切開處建議先包好，避免切口水分流失變黑。',
  },
  {
    id: 'sweet-potato',
    name: '地瓜',
    category: '蔬菜',
    months: [9, 10, 11, 12, 1],
    characteristics: '根莖類，口感綿密偏甜，適合蒸烤或煮湯，秋冬是盛產期。',
    tips: [
      '表皮光滑無破損、無黑斑',
      '拿起來有重量感，代表水分足夠',
      '兩端不軟爛、沒有發芽',
    ],
    nutrition: [
      { label: '熱量', value: '約 86 kcal/100g' },
      { label: '膳食纖維', value: '含量高' },
      { label: '維生素A', value: '含量高' },
    ],
    storage: '放陰涼通風處保存，避免冷藏（低溫容易劣化），約可放 2–3 週。',
  },
  {
    id: 'mango',
    name: '芒果',
    category: '水果',
    characteristics: '台灣夏季代表水果，品種眾多，各品種產季與挑選重點略有差異。',
    nutrition: [
      { label: '熱量', value: '約 60 kcal/100g' },
      { label: '維生素C', value: '含量高' },
      { label: '膳食纖維', value: '尚可' },
    ],
    storage: '常溫催熟至有香氣、微軟後移入冷藏，可放 3–5 天；切開後盡快食用完畢。',
    variants: [
      {
        name: '愛文',
        months: [5, 6, 7, 8],
        appearance: '長橢圓形，果皮紅綠交錯。',
        tips: ['果皮飽滿有光澤', '聞起來有淡淡果香', '蒂頭處微軟代表已熟'],
      },
      {
        name: '金煌',
        months: [6, 7, 8],
        appearance: '體型較大，果皮金黃帶紅暈。',
        tips: ['選果皮金黃色澤均勻者', '按壓蒂頭處微軟即可食用', '避免有黑斑或裂痕'],
      },
      {
        name: '玉文',
        months: [7, 8, 9],
        appearance: '果形較細長，果皮偏綠黃色。',
        tips: ['果皮轉黃即代表成熟', '香氣濃郁者風味較佳', '蒂頭無滲液為佳'],
      },
    ],
  },
  {
    id: 'guava',
    name: '芭樂',
    category: '水果',
    months: Array.from({ length: 12 }, (_, i) => i + 1),
    characteristics: '台灣全年皆有生產，秋冬產期口感更脆甜。',
    tips: ['表皮翠綠有光澤，無黑斑', '拿起來扎實有重量', '蒂頭處新鮮不乾枯'],
    nutrition: [
      { label: '熱量', value: '約 38 kcal/100g' },
      { label: '維生素C', value: '含量極高' },
      { label: '膳食纖維', value: '含量高' },
    ],
    storage: '常溫可放 2–3 天，冷藏可延長至 5–7 天。',
  },
  {
    id: 'squid',
    name: '透抽',
    category: '海鮮',
    months: [4, 5, 6, 7, 8, 9],
    characteristics: '肉質Q彈細緻，適合快炒、汆燙或做一夜干。',
    tips: [
      '眼睛清澈透亮，不混濁',
      '身體摸起來有彈性、緊實',
      '表皮色澤鮮豔、無黏液感',
      '聞起來是淡淡海水味，無腥臭',
    ],
    nutrition: [
      { label: '熱量', value: '約 71 kcal/100g' },
      { label: '蛋白質', value: '含量高' },
      { label: 'Omega-3', value: '尚可' },
    ],
    storage: '當天食用風味最佳；需冷藏可放 1 天，冷凍可放 1–2 週。',
  },
  {
    id: 'white-shrimp',
    name: '白蝦',
    category: '海鮮',
    months: Array.from({ length: 12 }, (_, i) => i + 1),
    characteristics: '台灣養殖為主，全年皆可購得，肉質細嫩帶自然甜味。',
    tips: ['蝦殼透明有光澤，緊貼蝦身', '頭尾完整不脫落', '聞起來無異味'],
    nutrition: [
      { label: '熱量', value: '約 90 kcal/100g' },
      { label: '蛋白質', value: '含量高' },
    ],
    storage: '冷藏當天食用為佳，或急速冷凍保存約 2 週。',
  },
  {
    id: 'pork-belly',
    name: '豬五花肉',
    category: '肉品',
    seasonNote: '全年供應',
    characteristics: '油脂與瘦肉相間，適合滷、炒、烤，是台菜常用部位。',
    tips: [
      '肉色呈自然粉紅，無暗沉變色',
      '油脂與瘦肉紋理分明',
      '觸摸有彈性、不黏手',
      '注意包裝上的有效期限與冷藏標示',
    ],
    nutrition: [
      { label: '熱量', value: '較高（油脂多）' },
      { label: '蛋白質', value: '含量高' },
    ],
    storage: '冷藏 2–3 天內食用完畢，或分裝密封後冷凍保存。',
  },
  {
    id: 'chicken-thigh',
    name: '土雞腿肉',
    category: '肉品',
    seasonNote: '全年供應',
    characteristics: '肉質較一般白肉雞緊實，帶皮風味足，適合滷、烤、炸。',
    tips: [
      '肉色呈自然粉紅，無暗沉變色',
      '觸摸有彈性、不黏手',
      '注意包裝上的有效期限與冷藏標示',
    ],
    nutrition: [
      { label: '熱量', value: '中等' },
      { label: '蛋白質', value: '含量高' },
    ],
    storage: '冷藏 1–2 天內食用完畢，或分裝密封後冷凍保存。',
  },
];

function formatSeasonShort(item) {
  if (item.variants) return '依品種而異';
  if (!item.months) return item.seasonNote || '全年供應';
  if (item.months.length >= 12) return '全年供應';
  const min = Math.min(...item.months);
  const max = Math.max(...item.months);
  return `${min}–${max} 月當季`;
}

function isMonthsInSeason(months, currentMonth) {
  return Array.isArray(months) && months.length < 12 && months.includes(currentMonth);
}

function StampBadge({ label = '當季' }) {
  return (
    <div
      className="flex items-center justify-center font-display text-xs font-bold flex-shrink-0"
      style={{
        width: 40,
        height: 40,
        borderRadius: '9999px',
        border: `2px solid ${STAMP_RED}`,
        color: STAMP_RED,
        transform: 'rotate(-12deg)',
        letterSpacing: '1px',
      }}
    >
      {label}
    </div>
  );
}

function SeasonTicket({ months, color }) {
  return (
    <div className="grid grid-cols-6 gap-1.5">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
        const active = months.includes(m);
        return (
          <div
            key={m}
            className="font-mono text-xs flex items-center justify-center rounded-full"
            style={{
              height: 32,
              border: active ? 'none' : `1px dashed ${LINE}`,
              background: active ? color : 'transparent',
              color: active ? '#FFFFFF' : MUTED,
              fontWeight: active ? 700 : 400,
            }}
          >
            {m}
          </div>
        );
      })}
    </div>
  );
}

function NutritionGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((n, i) => (
        <div key={i} className="bg-white rounded-lg border px-3 py-2" style={{ borderColor: LINE }}>
          <p className="text-xs" style={{ color: MUTED }}>{n.label}</p>
          <p className="font-mono text-sm font-medium" style={{ color: INK }}>{n.value}</p>
        </div>
      ))}
    </div>
  );
}

function TipList({ tips, color }) {
  return (
    <ul className="space-y-2">
      {tips.map((t, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color }} />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

function CategoryIcon({ category, size = 28, color }) {
  const Icon = CATS[category].icon;
  return <Icon size={size} style={{ color: color || CATS[category].color }} />;
}

function ItemCard({ item, onOpen }) {
  const color = CATS[item.category].color;
  return (
    <button
      onClick={() => onOpen(item.id)}
      className="text-left bg-white rounded-xl border overflow-hidden w-full hover:shadow-md transition"
      style={{ borderColor: LINE }}
    >
      <div className="h-20 flex items-center justify-center" style={{ background: color + '1A' }}>
        <CategoryIcon category={item.category} size={30} />
      </div>
      <div className="p-3">
        <p className="font-display font-bold" style={{ color: INK }}>{item.name}</p>
        <p className="text-xs mt-0.5" style={{ color: MUTED }}>{formatSeasonShort(item)}</p>
      </div>
    </button>
  );
}

export default function IngredientApp() {
  const [view, setView] = useState('home');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);
  const [variantIdx, setVariantIdx] = useState(0);
  const [query, setQuery] = useState('');

  const currentMonth = new Date().getMonth() + 1;
  const activeItem = ITEMS.find((i) => i.id === activeItemId);
  const activeVariant = activeItem && activeItem.variants ? activeItem.variants[variantIdx] : null;

  const seasonalNow = useMemo(
    () =>
      ITEMS.filter((item) => {
        if (item.variants) return item.variants.some((v) => isMonthsInSeason(v.months, currentMonth));
        return isMonthsInSeason(item.months, currentMonth);
      }),
    [currentMonth]
  );

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return ITEMS.filter((i) => i.name.includes(q));
  }, [query]);

  function openItem(id) {
    setActiveItemId(id);
    setVariantIdx(0);
    setQuery('');
    setView('detail');
  }

  function openCategory(cat) {
    setActiveCategory(cat);
    setQuery('');
    setView('category');
  }

  function goBack() {
    if (view === 'detail') setView(activeCategory ? 'category' : 'home');
    else if (view === 'category') setView('home');
  }

  const months = activeVariant ? activeVariant.months : activeItem && activeItem.months;
  const appearance = activeVariant ? activeVariant.appearance : activeItem && activeItem.characteristics;
  const tips = activeVariant ? activeVariant.tips : activeItem && activeItem.tips;
  const catColor = activeItem && CATS[activeItem.category].color;
  const inSeasonNow = months ? isMonthsInSeason(months, currentMonth) : false;

  return (
    <div style={{ fontFamily: "'Noto Sans TC', sans-serif", background: PAPER, color: INK }} className="min-h-screen w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@600;700&family=Noto+Sans+TC:wght@400;500&family=JetBrains+Mono:wght@500&display=swap');
        .font-display{font-family:'Noto Serif TC',serif;}
        .font-mono{font-family:'JetBrains Mono',monospace;}
      `}</style>

      {view !== 'detail' && (
        <div className="px-5 pt-6 pb-3">
          <p className="font-mono text-xs tracking-widest" style={{ color: MUTED }}>TAIWAN MARKET GUIDE</p>
          <h1 className="font-display text-2xl font-bold mt-1">食材圖鑑</h1>
          <div
            className="flex items-center gap-2 bg-white border rounded-full px-4 py-2 mt-4"
            style={{ borderColor: LINE }}
          >
            <Search size={16} style={{ color: MUTED }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋食材名稱，例如：芒果"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>
      )}

      <div className="px-5 pb-10">
        {query.trim() ? (
          <div className="mt-2">
            <p className="text-xs mb-3" style={{ color: MUTED }}>{searchResults.length} 筆結果</p>
            <div className="grid grid-cols-2 gap-3">
              {searchResults.map((item) => (
                <ItemCard key={item.id} item={item} onOpen={openItem} />
              ))}
            </div>
            {searchResults.length === 0 && (
              <p className="text-sm mt-6" style={{ color: MUTED }}>找不到符合的食材，換個關鍵字試試。</p>
            )}
          </div>
        ) : view === 'home' ? (
          <div>
            <div className="flex items-center justify-between mt-2 mb-3">
              <h2 className="font-display text-lg font-bold">本月當季</h2>
              <span className="font-mono text-xs" style={{ color: MUTED }}>{currentMonth} 月</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {seasonalNow.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openItem(item.id)}
                  className="text-left bg-white rounded-xl border overflow-hidden flex-shrink-0 w-40 hover:shadow-md transition"
                  style={{ borderColor: LINE }}
                >
                  <div
                    className="h-20 flex items-center justify-center relative"
                    style={{ background: CATS[item.category].color + '1A' }}
                  >
                    <CategoryIcon category={item.category} size={28} />
                    <div className="absolute top-1 right-1">
                      <div style={{ transform: 'scale(0.7)', transformOrigin: 'top right' }}>
                        <StampBadge />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-display font-bold">{item.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                      {item.variants ? '看看有哪些品種當季' : formatSeasonShort(item)}
                    </p>
                  </div>
                </button>
              ))}
              {seasonalNow.length === 0 && (
                <p className="text-sm" style={{ color: MUTED }}>這個月沒有特別當季的品項。</p>
              )}
            </div>

            <h2 className="font-display text-lg font-bold mt-8 mb-3">分類瀏覽</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(CATS).map((cat) => (
                <button
                  key={cat}
                  onClick={() => openCategory(cat)}
                  className="bg-white border rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition"
                  style={{ borderColor: LINE }}
                >
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 48, height: 48, background: CATS[cat].color + '1A' }}
                  >
                    <CategoryIcon category={cat} size={24} />
                  </div>
                  <span className="font-display font-bold">{cat}</span>
                </button>
              ))}
            </div>

            <p className="text-xs text-center mt-10" style={{ color: MUTED }}>
              ＊互動雛形，僅含示範資料，用來驗證資訊架構與版面
            </p>
          </div>
        ) : view === 'category' ? (
          <div>
            <button onClick={goBack} className="flex items-center gap-1 text-sm mb-4" style={{ color: MUTED }}>
              <ChevronLeft size={16} /> 返回
            </button>
            <div className="flex items-center gap-2 mb-5">
              <CategoryIcon category={activeCategory} size={24} />
              <h2 className="font-display text-xl font-bold">{activeCategory}</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ITEMS.filter((i) => i.category === activeCategory).map((item) => (
                <ItemCard key={item.id} item={item} onOpen={openItem} />
              ))}
            </div>
          </div>
        ) : (
          activeItem && (
            <div className="pt-6">
              <button onClick={goBack} className="flex items-center gap-1 text-sm mb-4" style={{ color: MUTED }}>
                <ChevronLeft size={16} /> 返回
              </button>

              <p className="text-xs font-mono tracking-widest" style={{ color: catColor }}>
                {activeItem.category}
              </p>
              <div className="flex items-center justify-between mt-1">
                <h1 className="font-display text-3xl font-bold">{activeItem.name}</h1>
                {inSeasonNow && <StampBadge />}
              </div>

              {activeItem.variants && (
                <div className="flex gap-2 mt-4 flex-wrap">
                  {activeItem.variants.map((v, idx) => (
                    <button
                      key={v.name}
                      onClick={() => setVariantIdx(idx)}
                      className="px-4 py-1.5 rounded-full text-sm border transition"
                      style={
                        idx === variantIdx
                          ? { background: catColor, color: '#FFFFFF', borderColor: catColor }
                          : { background: '#FFFFFF', color: INK, borderColor: LINE }
                      }
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              )}

              <div
                className="h-40 rounded-xl border flex items-center justify-center mt-5"
                style={{ borderColor: LINE, background: catColor + '14' }}
              >
                <CategoryIcon category={activeItem.category} size={48} />
              </div>
              <p className="text-xs text-center mt-1" style={{ color: MUTED }}>（示意圖，之後串接實拍照片）</p>

              <div className="mt-6">
                <h3 className="font-display font-bold mb-2">產季</h3>
                {months ? (
                  <SeasonTicket months={months} color={catColor} />
                ) : (
                  <p className="text-sm bg-white border rounded-lg px-3 py-2 inline-block" style={{ borderColor: LINE }}>
                    {activeItem.seasonNote || '全年供應'}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <h3 className="font-display font-bold mb-2">
                  外觀特性 {activeItem.variants && <span className="text-xs font-normal" style={{ color: MUTED }}>（依品種而異）</span>}
                </h3>
                <p className="text-sm leading-relaxed">{appearance}</p>
              </div>

              <div className="mt-6">
                <h3 className="font-display font-bold mb-2">
                  挑選技巧 {activeItem.variants && <span className="text-xs font-normal" style={{ color: MUTED }}>（依品種而異）</span>}
                </h3>
                <TipList tips={tips} color={catColor} />
              </div>

              <div className="mt-6">
                <h3 className="font-display font-bold mb-2">
                  營養價值 {activeItem.variants && <span className="text-xs font-normal" style={{ color: MUTED }}>（共用，不隨品種變動）</span>}
                </h3>
                <NutritionGrid items={activeItem.nutrition} />
              </div>

              <div className="mt-6 mb-6">
                <h3 className="font-display font-bold mb-2">保存方式</h3>
                <p className="text-sm leading-relaxed bg-white border rounded-lg px-3 py-2" style={{ borderColor: LINE }}>
                  {activeItem.storage}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
