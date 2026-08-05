import { Info, Trash2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import type { SpoilageSign } from '../data/ingredients';
import { FONT, INK, LINE, MUTED, STAMP_RED } from '../theme';
import SourceLink from './SourceLink';

type Props = { signs: SpoilageSign[] };

export default function SpoilageSignList({ signs }: Props) {
  return (
    <View style={styles.list}>
      {signs.map((s) => {
        const isDiscard = s.verdict === 'discard';
        return (
          <View key={s.sign} style={[styles.item, isDiscard ? styles.itemDiscard : styles.itemNeutral]}>
            <View style={styles.header}>
              {isDiscard ? (
                <Trash2 size={14} color={STAMP_RED} />
              ) : (
                <Info size={14} color={MUTED} />
              )}
              <Text style={[styles.verdict, isDiscard ? styles.verdictDiscard : styles.verdictNeutral]}>
                {isDiscard ? '建議丟棄' : '品質下降，仍可食用'}
              </Text>
            </View>
            <Text style={styles.signText}>{s.sign}</Text>
            <SourceLink url={s.source_url} date={s.source_date} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  item: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemDiscard: {
    backgroundColor: STAMP_RED + '0D',
    borderColor: STAMP_RED + '4D',
  },
  itemNeutral: {
    backgroundColor: '#FFFFFF',
    borderColor: LINE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  verdict: {
    fontFamily: FONT.sansMedium,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  verdictDiscard: { color: STAMP_RED },
  verdictNeutral: { color: MUTED },
  signText: {
    fontFamily: FONT.sans,
    fontSize: 14,
    lineHeight: 21,
    color: INK,
  },
});
