import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { formatSourceDate } from '../data/ingredients';
import { FONT, MUTED } from '../theme';

type Props = { url?: string; date?: string };

export default function SourceLink({ url, date }: Props) {
  if (!url) return null;
  return (
    <Pressable onPress={() => Linking.openURL(url)} hitSlop={4}>
      <Text style={styles.text}>資料來源{date ? `・${formatSourceDate(date)} 查證` : ''}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: FONT.sans,
    fontSize: 11,
    color: MUTED,
    marginTop: 6,
    textDecorationLine: 'underline',
  },
});
