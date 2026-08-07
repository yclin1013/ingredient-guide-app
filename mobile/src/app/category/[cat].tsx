import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoryIcon from '../../components/CategoryIcon';
import ItemCard from '../../components/ItemCard';
import SearchHeader from '../../components/SearchHeader';
import SearchResults from '../../components/SearchResults';
import { ITEMS, type Category } from '../../data/ingredients';
import { CATS, FONT, INK, MAX_CONTENT_WIDTH, MUTED, PAPER } from '../../theme';

export default function CategoryScreen() {
  const router = useRouter();
  const { cat } = useLocalSearchParams<{ cat: string }>();
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();

  const category = (cat && cat in CATS ? cat : '蔬菜') as Category;
  const items = ITEMS.filter((i) => i.category === category);

  function openItem(id: string) {
    setQuery('');
    router.push(`/item/${id}`);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {!query.trim() && (
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButtonFixed, { top: insets.top + 12 }]}
        >
          <ChevronLeft size={16} color={MUTED} />
          <Text style={styles.backText}>返回</Text>
        </Pressable>
      )}
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <SearchHeader query={query} onChangeQuery={setQuery} />

        <View style={styles.content}>
          {query.trim() ? (
            <SearchResults query={query} onOpenItem={openItem} />
          ) : (
            <>
              <View style={styles.titleRow}>
                <CategoryIcon category={category} size={24} />
                <Text style={styles.title}>{category}</Text>
              </View>
              <View style={styles.grid}>
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} onPress={() => openItem(item.id)} />
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
  scroll: { paddingBottom: 40, paddingTop: 40 },
  content: {
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  backButtonFixed: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PAPER,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  backText: {
    fontFamily: FONT.sans,
    fontSize: 14,
    color: MUTED,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  title: {
    fontFamily: FONT.display,
    fontSize: 20,
    color: INK,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
});
