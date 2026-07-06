import { StyleSheet, Text, View } from 'react-native';
import { FONT, LINE, MUTED } from '../theme';

type Props = { months: number[]; color: string };

const ROWS = [
  [1, 2, 3, 4, 5, 6],
  [7, 8, 9, 10, 11, 12],
];

export default function SeasonTicket({ months, color }: Props) {
  return (
    <View style={styles.grid}>
      {ROWS.map((row) => (
        <View key={row[0]} style={styles.row}>
          {row.map((m) => {
            const active = months.includes(m);
            return (
              <View
                key={m}
                style={[
                  styles.cell,
                  active ? { backgroundColor: color } : styles.cellInactive,
                ]}
              >
                <Text style={[styles.cellText, active ? styles.cellTextActive : null]}>{m}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 6 },
  row: { flexDirection: 'row', gap: 6 },
  cell: {
    flex: 1,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInactive: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: LINE,
  },
  cellText: {
    fontFamily: FONT.mono,
    fontSize: 12,
    color: MUTED,
  },
  cellTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
