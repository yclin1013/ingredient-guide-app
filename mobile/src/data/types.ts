export type Category = '蔬菜' | '水果' | '海鮮' | '肉品';

export type Nutrient = { label: string; value: string };

export type VerificationLevel = 'official' | 'secondary' | 'unverified';

/** 單一欄位的查證狀態；level 定義與適用範圍見 DATA_SCHEMA.md 的「資料驗證分級」 */
export type Verification = {
  level: VerificationLevel;
  /** level 為 official/secondary 時應填來源說明；unverified 時可省略 */
  source?: string;
};

export type Variant = {
  name: string;
  /** 產季月份（1–12） */
  months: number[];
  appearance: string;
  selectionTips: string[];
};

/** 保存後判斷是否變質的徵兆；查證標準見 DATA_SCHEMA.md 的「保存變質徵兆欄位」 */
export type SpoilageSign = {
  sign: string;
  /** discard：已變質有食安疑慮，建議丟棄／quality-loss：品質下降但通常仍可食用，建議儘快處理 */
  verdict: 'discard' | 'quality-loss';
  /** 查證來源網址，用於食材詳細頁顯示可點擊的資料來源連結；查無可靠來源時留空 */
  source_url?: string;
  /** 查證日期（YYYY-MM-DD），與 source_url 一併留空或一併填寫 */
  source_date?: string;
};

/**
 * 無法透過外觀／氣味判斷、只能靠保存方式預防的隱性風險（例如鯖科魚類的組織胺中毒）。
 * 跟 spoilageSigns 是刻意分開的兩個欄位——spoilageSigns 是「看得出來」的變質徵兆，
 * hiddenRisks 是「看不出來」的風險，UI 上不可合併呈現，避免使用者誤以為靠看外觀也能防範。
 * 查證標準見 DATA_SCHEMA.md 的「隱性風險欄位」。
 */
export type HiddenRisk = {
  /** 風險描述（是什麼風險、可能的症狀） */
  risk: string;
  /** 為什麼無法靠外觀或氣味判斷 */
  why_not_visible: string;
  /** 正確的預防方式（通常是保存方式，而不是挑選技巧） */
  prevention: string;
  source_url?: string;
  source_date?: string;
};

export type Ingredient = {
  id: string;
  name: string;
  category: Category;
  subcategory?: string;
  /** 尚無實拍照片時省略，畫面會顯示分類圖示佔位 */
  image?: string;
  /** 產季月份；肉品等全年供應者可省略，改用 seasonNote */
  months?: number[];
  seasonNote?: string;
  characteristics: string;
  /** 有 variants 時挑選技巧依品種而異，主體層級可省略 */
  selectionTips?: string[];
  nutrition: Nutrient[];
  storage: string;
  variants?: Variant[];
  /** 保存後如何判斷是否變質；查無可靠來源時省略此欄位，不用一般網路共識填補 */
  spoilageSigns?: SpoilageSign[];
  /** 外觀相近但變質結論相反的狀態說明（例如「發芽」跟「發霉腐爛」階段接近但結論不同），方便 UI 做對照式呈現；只有 spoilageSigns 存在明顯混淆風險時才填 */
  easily_confused_with?: string;
  /** 無法靠外觀／氣味判斷、只能靠保存方式預防的風險；查無可靠來源時省略此欄位 */
  hiddenRisks?: HiddenRisk[];
  /** 各欄位的查證狀態；分級定義見 DATA_SCHEMA.md */
  verification: {
    nutrition: Verification;
    selectionTips: Verification;
    months: Verification;
    /** 只有 spoilageSigns 欄位存在時才需要填 */
    spoilageSigns?: Verification;
    /** 只有 hiddenRisks 欄位存在時才需要填 */
    hiddenRisks?: Verification;
  };
  /** 市場俗名對應官方名稱／學名的解析結果，見 CONTENT_WORKFLOW.md 的「名稱對應解析」 */
  aliases?: {
    market_name: string;
    official_name: string;
    scientific_name: string;
    note?: string;
  };
  /** 俗名對應多個可能物種、尚未能確定唯一對應時的候選紀錄，見 CONTENT_WORKFLOW.md */
  nameResolution?: {
    market_name: string;
    status: '待確認';
    note: string;
    candidates: Array<{
      name?: string;
      db_sample?: string;
      calories?: string;
      note?: string;
    }>;
  };
};
