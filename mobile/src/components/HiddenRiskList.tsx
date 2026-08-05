import { ShieldAlert } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import type { HiddenRisk } from '../data/ingredients';
import { FONT, INK, STAMP_RED } from '../theme';
import SourceLink from './SourceLink';

type Props = { risks: HiddenRisk[] };

export default function HiddenRiskList({ risks }: Props) {
  return (
    <View style={styles.list}>
      {risks.map((r) => (
        <View key={r.risk} style={styles.card}>
          <View style={styles.header}>
            <ShieldAlert size={18} color={STAMP_RED} />
            <Text style={styles.headerText}>光看外觀無法判斷</Text>
          </View>
          <Text style={styles.riskText}>{r.risk}</Text>

          <Text style={styles.subLabel}>為什麼看不出來</Text>
          <Text style={styles.subText}>{r.why_not_visible}</Text>

          <Text style={styles.subLabel}>正確預防方式</Text>
          <Text style={styles.subText}>{r.prevention}</Text>

          <SourceLink url={r.source_url} date={r.source_date} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: {
    backgroundColor: STAMP_RED + '12',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: STAMP_RED + '55',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  headerText: {
    fontFamily: FONT.sansMedium,
    fontSize: 12,
    letterSpacing: 0.3,
    color: STAMP_RED,
  },
  riskText: {
    fontFamily: FONT.sansMedium,
    fontSize: 15,
    lineHeight: 22,
    color: INK,
  },
  subLabel: {
    fontFamily: FONT.sansMedium,
    fontSize: 12,
    color: STAMP_RED,
    marginTop: 10,
  },
  subText: {
    fontFamily: FONT.sans,
    fontSize: 14,
    lineHeight: 21,
    color: INK,
    marginTop: 2,
  },
});
