import { StyleSheet, Text, View } from 'react-native';
import { searchItems } from '../data/ingredients';
import { FONT, MUTED } from '../theme';
import ItemCard from './ItemCard';

type Props = { query: string; onOpenItem: (id: string) => void };

/** 搜尋結果：輸入關鍵字時取代原本畫面內容（對應雛形 query.trim() 的分支） */
export default function SearchResults({ query, onOpenItem }: Props) {
  const results = searchItems(query);
  return (
    <View style={styles.container}>
      <Text style={styles.count}>{results.length} 筆結果</Text>
      <View style={styles.grid}>
        {results.map((item) => (
          <ItemCard key={item.id} item={item} onPress={() => onOpenItem(item.id)} />
        ))}
      </View>
      {results.length === 0 && (
        <Text style={styles.empty}>找不到符合的食材，換個關鍵字試試。</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  count: {
    fontFamily: FONT.sans,
    fontSize: 12,
    color: MUTED,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  empty: {
    fontFamily: FONT.sans,
    fontSize: 14,
    color: MUTED,
    marginTop: 24,
  },
});
