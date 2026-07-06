import { Search } from 'lucide-react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { FONT, INK, LINE, MUTED } from '../theme';

type Props = { query: string; onChangeQuery: (q: string) => void };

/** 首頁與分類頁共用的頁首：標語、App 名稱、搜尋列（對應雛形 view !== 'detail' 的頁首） */
export default function SearchHeader({ query, onChangeQuery }: Props) {
  return (
    <View style={styles.header}>
      <Text style={styles.tagline}>TAIWAN MARKET GUIDE</Text>
      <Text style={styles.title}>食材圖鑑</Text>
      <View style={styles.searchBar}>
        <Search size={16} color={MUTED} />
        <TextInput
          value={query}
          onChangeText={onChangeQuery}
          placeholder="搜尋食材名稱，例如：芒果"
          placeholderTextColor={MUTED}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  tagline: {
    fontFamily: FONT.mono,
    fontSize: 11,
    letterSpacing: 3,
    color: MUTED,
  },
  title: {
    fontFamily: FONT.display,
    fontSize: 24,
    color: INK,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
  },
  input: {
    flex: 1,
    fontFamily: FONT.sans,
    fontSize: 14,
    color: INK,
    padding: 0,
  },
});
