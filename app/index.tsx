import { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, type ListRenderItem } from 'react-native';

import { DevStatus } from '../components/home/DevStatus';
import { ErrorState } from '../components/home/ErrorState';
import { HomeBlock } from '../components/home/HomeBlock';
import { HomeSkeleton } from '../components/home/HomeSkeleton';
import { buildHomeLayout, type HomeLayoutBlock } from '../lib/buildHomeLayout';
import { useHomepage } from '../lib/useHomepage';
import { spacing } from '../theme/tokens';
import { useTheme } from '../theme/useTheme';

const keyExtractor = (block: HomeLayoutBlock) => block.key;
const renderItem: ListRenderItem<HomeLayoutBlock> = ({ item }) => <HomeBlock block={item} />;

export default function HomeScreen() {
  const { colors } = useTheme();
  const { state, refreshing, refresh, retry } = useHomepage();
  const result = state.status === 'ready' ? state.result : null;
  const layout = useMemo(() => (result ? buildHomeLayout(result.blocks) : []), [result]);

  const header = useCallback(
    () =>
      __DEV__ && result ? (
        <DevStatus source={result.source} updatedAt={result.updatedAt} skipped={result.skipped} error={result.error} />
      ) : null,
    [result],
  );

  if (state.status === 'loading') return <HomeSkeleton />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={retry} />;

  return (
    <FlatList
      data={layout}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={header}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textMuted} />}
      initialNumToRender={4}
      windowSize={7}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
});
