import { Check } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { FONT, INK } from '../theme';

type Props = { tips: string[]; color: string };

export default function TipList({ tips, color }: Props) {
  return (
    <View style={styles.list}>
      {tips.map((t) => (
        <View key={t} style={styles.item}>
          <Check size={14} color={color} style={styles.icon} />
          <Text style={styles.text}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  icon: { marginTop: 3 },
  text: {
    flex: 1,
    fontFamily: FONT.sans,
    fontSize: 14,
    lineHeight: 21,
    color: INK,
  },
});
