import { StyleSheet, Text, View } from 'react-native';
import type { Nutrient } from '../data/ingredients';
import { FONT, INK, LINE, MUTED } from '../theme';

type Props = { items: Nutrient[] };

export default function NutritionGrid({ items }: Props) {
  return (
    <View style={styles.grid}>
      {items.map((n) => (
        <View key={n.label} style={styles.card}>
          <Text style={styles.label}>{n.label}</Text>
          <Text style={styles.value}>{n.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  card: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    fontFamily: FONT.sans,
    fontSize: 12,
    color: MUTED,
  },
  value: {
    fontFamily: FONT.mono,
    fontSize: 13,
    color: INK,
    marginTop: 2,
  },
});
