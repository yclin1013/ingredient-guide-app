import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatSeasonShort, type Ingredient } from '../data/ingredients';
import { CATS, FONT, INK, LINE, MUTED, tint } from '../theme';
import CategoryIcon from './CategoryIcon';
import StampBadge from './StampBadge';

type Props = {
  item: Ingredient;
  onPress: () => void;
  /** 首頁「本月當季」卡片：固定寬度、右上角蓋當季章、副標改為品種提示 */
  seasonal?: boolean;
};

export default function ItemCard({ item, onPress, seasonal = false }: Props) {
  const color = CATS[item.category].color;
  const subtitle =
    seasonal && item.variants ? '看看有哪些品種當季' : formatSeasonShort(item);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        seasonal ? styles.cardSeasonal : styles.cardGrid,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.imageArea, { backgroundColor: tint(color) }]}>
        <CategoryIcon category={item.category} size={30} />
        {seasonal && (
          <View style={styles.stamp}>
            <StampBadge size={28} />
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    overflow: 'hidden',
  },
  cardGrid: { width: '48.5%' },
  cardSeasonal: { width: 160 },
  pressed: { opacity: 0.85 },
  imageArea: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stamp: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  body: { padding: 12 },
  name: {
    fontFamily: FONT.display,
    fontSize: 15,
    color: INK,
  },
  subtitle: {
    fontFamily: FONT.sans,
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
});
