import React, { useState } from 'react';
import { Upload, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';

const INK = '#1F2E22';
const MUTED = '#8A8779';
const PAPER = '#F3F5EE';
const LINE = '#E4E1D5';

const DEMO_ITEMS = {
  mango: {
    name: '芒果（愛文）',
    color: '#E08A2C',
    photoTips: [
      '果皮飽滿、有光澤，色澤紅綠交錯均勻',
      '表皮沒有明顯黑斑或裂痕',
      '蒂頭處沒有滲液或發黑',
    ],
    notPhotoTips: ['聞起來的果香濃淡（嗅覺，照片無法判斷）', '蒂頭按壓的軟硬度（觸覺，照片無法判斷）'],
  },
  cabbage: {
    name: '高麗菜',
    color: '#3F6B4A',
    photoTips: [
      '外葉翠綠，沒有枯黃或蟲咬痕跡',
      '葉球飽滿呈圓弧狀，沒有明顯凹陷',
      '切口（如果有拍到）呈現新鮮濕潤、沒有變黑',
    ],
    notPhotoTips: ['拿起來的重量感（觸覺，照片無法判斷）', '葉球壓起來是否緊實（觸覺，照片無法判斷）'],
  },
};

function buildPrompt(item) {
  return `你是一個食材品質判斷小幫手。請只根據照片「看得到」的視覺線索，評估這是不是一份品質不錯的${item.name}。

請對照以下幾個可以用眼睛判斷的重點逐一給意見：
${item.photoTips.map((t) => `- ${t}`).join('\n')}

以下這些重點無法單靠照片判斷，請直接說明「照片無法判斷」，不要用猜的：
${item.notPhotoTips.map((t) => `- ${t}`).join('\n')}

請用簡短條列的方式回覆（4-6行內，繁體中文），最後附上一句提醒：這只是AI輔助的初步判斷，並非絕對保證，實際購買時建議搭配觸摸、嗅聞等方式做綜合判斷。`;
}

export default function PhotoQualityDemo() {
  const [selectedId, setSelectedId] = useState('mango');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const item = DEMO_ITEMS[selectedId];

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setResult('');
    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      const result_ = reader.result;
      const match = result_.match(/^data:(.*);base64,(.*)$/);
      if (!match) {
        setError('圖片讀取失敗，請換一張照片試試。');
        return;
      }
      setImage({ preview: result_, mediaType: match[1], base64: match[2] });
    };
    reader.onerror = () => setError('圖片讀取失敗，請換一張照片試試。');
    reader.readAsDataURL(file);
  }

  async function handleEvaluate() {
    if (!image) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.base64 } },
                { type: 'text', text: buildPrompt(item) },
              ],
            },
          ],
        }),
      });
      const data = await response.json();
      const text = (data.content || [])
        .map((block) => (block.type === 'text' ? block.text : ''))
        .filter(Boolean)
        .join('\n');
      setResult(text || '沒有取得回應，請再試一次。');
    } catch (err) {
      console.error(err);
      setError('評估失敗，請稍後再試一次。');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "'Noto Sans TC', sans-serif", background: PAPER, color: INK }} className="min-h-screen w-full p-5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@600;700&family=Noto+Sans+TC:wght@400;500&display=swap');
        .font-display{font-family:'Noto Serif TC',serif;}
      `}</style>

      <p className="text-xs" style={{ color: MUTED }}>可行性 DEMO · 尚未整合進主要 App</p>
      <h1 className="font-display text-2xl font-bold mt-1 mb-4">拍照挑選判斷</h1>

      <div className="flex gap-2 mb-4">
        {Object.keys(DEMO_ITEMS).map((id) => (
          <button
            key={id}
            onClick={() => {
              setSelectedId(id);
              setImage(null);
              setResult('');
              setError('');
            }}
            className="px-4 py-1.5 rounded-full text-sm border transition"
            style={
              id === selectedId
                ? { background: DEMO_ITEMS[id].color, color: '#FFFFFF', borderColor: DEMO_ITEMS[id].color }
                : { background: '#FFFFFF', color: INK, borderColor: LINE }
            }
          >
            {DEMO_ITEMS[id].name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border p-4 mb-4" style={{ borderColor: LINE }}>
        <p className="text-sm font-medium flex items-center gap-1 mb-2">
          <Eye size={14} style={{ color: item.color }} /> 照片可以判斷的重點
        </p>
        <ul className="space-y-1 mb-3">
          {item.photoTips.map((t, i) => (
            <li key={i} className="text-sm" style={{ color: INK }}>
              · {t}
            </li>
          ))}
        </ul>
        <p className="text-sm font-medium flex items-center gap-1 mb-2">
          <EyeOff size={14} style={{ color: MUTED }} /> 照片無法判斷的重點
        </p>
        <ul className="space-y-1">
          {item.notPhotoTips.map((t, i) => (
            <li key={i} className="text-sm" style={{ color: MUTED }}>
              · {t}
            </li>
          ))}
        </ul>
      </div>

      <label
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl h-40 cursor-pointer bg-white"
        style={{ borderColor: LINE }}
      >
        {image ? (
          <img src={image.preview} alt="上傳的食材照片預覽" className="h-full w-full object-cover rounded-xl" />
        ) : (
          <>
            <Upload size={22} style={{ color: MUTED }} />
            <span className="text-sm" style={{ color: MUTED }}>
              點此上傳一張{item.name}的照片
            </span>
          </>
        )}
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
      </label>

      <button
        onClick={handleEvaluate}
        disabled={!image || loading}
        className="w-full mt-4 py-2.5 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition"
        style={{
          background: !image || loading ? LINE : item.color,
          color: !image || loading ? MUTED : '#FFFFFF',
          cursor: !image || loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> 評估中…
          </>
        ) : (
          <>
            <Sparkles size={16} /> AI 評估這張照片
          </>
        )}
      </button>

      {error && (
        <p className="text-sm mt-3" style={{ color: '#B33A2E' }}>
          {error}
        </p>
      )}

      {result && (
        <div className="bg-white rounded-xl border p-4 mt-4" style={{ borderColor: LINE }}>
          <p className="text-sm font-medium mb-2">AI 評估結果</p>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{result}</p>
        </div>
      )}
    </div>
  );
}
