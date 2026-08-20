import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoryIcon from '../../components/CategoryIcon';
import HiddenRiskList from '../../components/HiddenRiskList';
import NutritionGrid from '../../components/NutritionGrid';
import SeasonTicket from '../../components/SeasonTicket';
import SpoilageSignList from '../../components/SpoilageSignList';
import StampBadge from '../../components/StampBadge';
import TipList from '../../components/TipList';
import { ITEMS, isMonthsInSeason } from '../../data/ingredients';
import { INGREDIENT_PHOTOS } from '../../data/ingredientPhotos';
import { CATS, FONT, INK, LINE, MAX_CONTENT_WIDTH, MUTED, PAPER, STAMP_RED } from '../../theme';

function Section({
  title,
  note,
  titleColor,
  children,
}: {
  title: string;
  note?: string;
  titleColor?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, titleColor ? { color: titleColor } : null]}>
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
  const [hydrated, setHydrated] = useState(false);
  const insets = useSafeAreaInsets();

  // 網頁版的 /item/[id] 是共用的靜態外殼，建置當下還不知道實際的 id，
  // 首次繪製時一定找不到對應食材；要等 JS 接手（hydrate）、拿到網址列真正的 id 後才能判斷。
  // 用這個旗標避免在那段空窗期把「找不到」誤植入畫面，讓使用者以為真的沒有資料。
  useEffect(() => {
    setHydrated(true);
  }, []);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const item = ITEMS.find((i) => i.id === id);
  if (!item) {
    if (!hydrated) {
      return <SafeAreaView style={styles.safe} edges={['top']} />;
    }
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.content}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <ChevronLeft size={16} color={MUTED} />
            <Text style={styles.backText}>返回</Text>
          </Pressable>
          <Text style={styles.emptyText}>找不到這筆食材資料。</Text>
        </View>
      </SafeAreaView>
    );
  }

  const catColor = CATS[item.category].color;
  const photo = INGREDIENT_PHOTOS[item.id];
  const variant = item.variants ? item.variants[variantIdx] : null;
  const months = variant ? variant.months : item.months;
  const appearance = variant ? variant.appearance : item.characteristics;
  const tips = variant ? variant.selectionTips : item.selectionTips;
  const currentMonth = new Date().getMonth() + 1;
  const inSeasonNow = isMonthsInSeason(months, currentMonth);
  const variantNote = item.variants ? '依品種而異' : undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Pressable
        onPress={goBack}
        style={[styles.backButtonFixed, { top: insets.top + 12 }]}
      >
        <ChevronLeft size={16} color={MUTED} />
        <Text style={styles.backText}>返回</Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
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

          <View style={styles.imageWrap}>
            <View style={styles.imageContainer}>
              {photo ? (
                <Image source={photo} style={styles.photoImage} resizeMode="contain" />
              ) : (
                <View style={[styles.iconFill, { backgroundColor: catColor + '14' }]}>
                  <CategoryIcon category={item.category} size={40} />
                </View>
              )}
            </View>
          </View>
          {!photo && <Text style={styles.imageCaption}>（示意圖，之後串接實拍照片）</Text>}

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

          {item.spoilageSigns && item.spoilageSigns.length > 0 && (
            <Section title="保存後如何判斷">
              <SpoilageSignList signs={item.spoilageSigns} />
            </Section>
          )}

          {item.hiddenRisks && item.hiddenRisks.length > 0 && (
            <Section title="需特別留意" titleColor={STAMP_RED}>
              <HiddenRiskList risks={item.hiddenRisks} />
            </Section>
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
    paddingTop: 56,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    alignSelf: 'flex-start',
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
  imageWrap: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  imageContainer: {
    width: '50%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 18,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  iconFill: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
