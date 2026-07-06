import { StyleSheet, Text, View } from 'react-native';
import { FONT, STAMP_RED } from '../theme';

type Props = { label?: string; size?: number };

export default function StampBadge({ label = '當季', size = 40 }: Props) {
  return (
    <View style={[styles.stamp, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.label, { fontSize: size * 0.3 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stamp: {
    borderWidth: 2,
    borderColor: STAMP_RED,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  label: {
    fontFamily: FONT.display,
    color: STAMP_RED,
    letterSpacing: 1,
  },
});
