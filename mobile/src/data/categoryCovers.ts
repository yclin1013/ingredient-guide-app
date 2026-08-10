import type { ImageSourcePropType } from 'react-native';
import type { Category } from './types';

// 首頁「分類瀏覽」的封面插畫；來源是 picture/cover.png 裁切而成
export const CATEGORY_COVERS: Record<Category, ImageSourcePropType> = {
  蔬菜: require('../../assets/category-covers/vegetable.jpg'),
  水果: require('../../assets/category-covers/fruit.jpg'),
  海鮮: require('../../assets/category-covers/seafood.jpg'),
  肉品: require('../../assets/category-covers/meat.jpg'),
};
