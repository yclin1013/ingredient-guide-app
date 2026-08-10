import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ItemCard from '../components/ItemCard';
import SearchHeader from '../components/SearchHeader';
import SearchResults from '../components/SearchResults';
import { CATEGORY_COVERS } from '../data/categoryCovers';
import { ITEMS, isItemInSeason, type Category } from '../data/ingredients';
import { CATS, FONT, INK, LINE, MAX_CONTENT_WIDTH, MUTED, PAPER } from '../theme';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const currentMonth = new Date().getMonth() + 1;

  const seasonalNow = useMemo(
    () => ITEMS.filter((item) => isItemInSeason(item, currentMonth)),
    [currentMonth]
  );

  function openItem(id: string) {
    setQuery('');
    router.push(`/item/${id}`);
  }

  function openCategory(cat: Category) {
    setQuery('');
    router.push(`/category/${cat}`);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SearchHeader query={query} onChangeQuery={setQuery} />

        <View style={styles.content}>
          {query.trim() ? (
            <SearchResults query={query} onOpenItem={openItem} />
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>本月當季</Text>
                <Text style={styles.monthLabel}>{currentMonth} 月</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.seasonalRow}
                style={styles.seasonalScroller}
              >
                {seasonalNow.map((item) => (
                  <ItemCard key={item.id} item={item} seasonal onPress={() => openItem(item.id)} />
                ))}
                {seasonalNow.length === 0 && (
                  <Text style={styles.emptyText}>這個月沒有特別當季的品項。</Text>
                )}
              </ScrollView>

              <Text style={[styles.sectionTitle, styles.categorySectionTitle]}>分類瀏覽</Text>
              <View style={styles.categoryGrid}>
                {(Object.keys(CATS) as Category[]).map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => openCategory(cat)}
                    style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]}
                  >
                    <Image
                      source={CATEGORY_COVERS[cat]}
                      style={styles.categoryCoverImage}
                      resizeMode="cover"
                    />
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAPER },
  scroll: { paddingBottom: 40 },
  content: {
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONT.display,
    fontSize: 18,
    color: INK,
  },
  monthLabel: {
    fontFamily: FONT.mono,
    fontSize: 12,
    color: MUTED,
  },
  seasonalScroller: {
    marginHorizontal: -20,
  },
  seasonalRow: {
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  emptyText: {
    fontFamily: FONT.sans,
    fontSize: 14,
    color: MUTED,
  },
  categorySectionTitle: {
    marginTop: 32,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  categoryCard: {
    width: '48.5%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.85 },
  categoryCoverImage: {
    width: '100%',
    height: '100%',
  },
});
