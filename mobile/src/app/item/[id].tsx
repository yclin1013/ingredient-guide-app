import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryIcon from '../../components/CategoryIcon';
import NutritionGrid from '../../components/NutritionGrid';
import SeasonTicket from '../../components/SeasonTicket';
import StampBadge from '../../components/StampBadge';
import TipList from '../../components/TipList';
import { ITEMS, isMonthsInSeason } from '../../data/ingredients';
import { CATS, FONT, INK, LINE, MUTED, PAPER } from '../../theme';

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
        {note ? <Text style={styles.sectionNote}>（{note}）</Text> : null}
      </Text>
      {children}
    </View>
  );
}

export default function ItemDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [variantIdx, setVariantIdx] = useState(0);

  const item = ITEMS.find((i) => i.id === id);
  if (!item) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={16} color={MUTED} />
            <Text style={styles.backText}>返回</Text>
          </Pressable>
          <Text style={styles.emptyText}>找不到這筆食材資料。</Text>
        </View>
      </SafeAreaView>
    );
  }

  const catColor = CATS[item.category].color;
  const variant = item.variants ? item.variants[variantIdx] : null;
  const months = variant ? variant.months : item.months;
  const appearance = variant ? variant.appearance : item.characteristics;
  const tips = variant ? variant.selectionTips : item.selectionTips;
  const currentMonth = new Date().getMonth() + 1;
  const inSeasonNow = isMonthsInSeason(months, currentMonth);
  const variantNote = item.variants ? '依品種而異' : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={16} color={MUTED} />
            <Text style={styles.backText}>返回</Text>
          </Pressable>

          <Text style={[styles.categoryLabel, { color: catColor }]}>{item.category}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.name}</Text>
            {inSeasonNow && <StampBadge />}
          </View>

          {item.variants && (
            <View style={styles.variantRow}>
              {item.variants.map((v, idx) => {
                const active = idx === variantIdx;
                return (
                  <Pressable
                    key={v.name}
                    onPress={() => setVariantIdx(idx)}
                    style={[
                      styles.variantPill,
                      active
                        ? { backgroundColor: catColor, borderColor: catColor }
                        : styles.variantPillInactive,
                    ]}
                  >
                    <Text style={[styles.variantText, active && styles.variantTextActive]}>
                      {v.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={[styles.imagePlaceholder, { backgroundColor: catColor + '14' }]}>
            <CategoryIcon category={item.category} size={48} />
          </View>
          <Text style={styles.imageCaption}>（示意圖，之後串接實拍照片）</Text>

          <Section title="產季">
            {months ? (
              <SeasonTicket months={months} color={catColor} />
            ) : (
              <Text style={styles.seasonNote}>{item.seasonNote || '全年供應'}</Text>
            )}
          </Section>

          <Section title="外觀特性" note={variantNote}>
            <Text style={styles.bodyText}>{appearance}</Text>
          </Section>

          {tips && (
            <Section title="挑選技巧" note={variantNote}>
              <TipList tips={tips} color={catColor} />
            </Section>
          )}

          <Section title="營養價值" note={item.variants ? '共用，不隨品種變動' : undefined}>
            <NutritionGrid items={item.nutrition} />
          </Section>

          <Section title="保存方式">
            <Text style={[styles.bodyText, styles.storageBox]}>{item.storage}</Text>
          </Section>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAPER },
  scroll: { paddingBottom: 40 },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: FONT.sans,
    fontSize: 14,
    color: MUTED,
  },
  emptyText: {
    fontFamily: FONT.sans,
    fontSize: 14,
    color: MUTED,
  },
  categoryLabel: {
    fontFamily: FONT.mono,
    fontSize: 11,
    letterSpacing: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  title: {
    fontFamily: FONT.display,
    fontSize: 30,
    color: INK,
  },
  variantRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  variantPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  variantPillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: LINE,
  },
  variantText: {
    fontFamily: FONT.sansMedium,
    fontSize: 14,
    color: INK,
  },
  variantTextActive: {
    color: '#FFFFFF',
  },
  imagePlaceholder: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  imageCaption: {
    fontFamily: FONT.sans,
    fontSize: 12,
    color: MUTED,
    textAlign: 'center',
    marginTop: 4,
  },
  section: { marginTop: 24 },
  sectionTitle: {
    fontFamily: FONT.display,
    fontSize: 16,
    color: INK,
    marginBottom: 8,
  },
  sectionNote: {
    fontFamily: FONT.sans,
    fontSize: 12,
    color: MUTED,
  },
  bodyText: {
    fontFamily: FONT.sans,
    fontSize: 14,
    lineHeight: 22,
    color: INK,
  },
  seasonNote: {
    fontFamily: FONT.sans,
    fontSize: 14,
    color: INK,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  storageBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
