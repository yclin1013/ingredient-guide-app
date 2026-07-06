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
  /** 各欄位的查證狀態；分級定義見 DATA_SCHEMA.md */
  verification: {
    nutrition: Verification;
    selectionTips: Verification;
    months: Verification;
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
