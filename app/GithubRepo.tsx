import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

type Repo = {
  id: number;
  name: string;
  description: string | null;
  watchers_count: number;
  open_issues_count: number;
  stargazers_count: number;
  keys_url?: string;
};


const GitHubRepos: React.FC = () => {
  const fetchRepos = async (): Promise<{ items: Repo[] }> => {
    const response = await fetch(
      'https://api.github.com/search/repositories?q=stars:>1&sort=stars&order=desc&per_page=100',
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  };

  const [selectedRepo, setSelectedRepo] = useState<Repo>();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, error, isRefetching, refetch } = useQuery<{
    items: Repo[];
  }>(['repos'], fetchRepos, {
    cacheTime: Infinity, // improvements, could set a cache time to avoid fetching the same data too often
  });

  if (isLoading) { // could use activity indicator instead of text
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error: {(error as Error).message}</Text>
      </SafeAreaView>
    );
  }

  const handlePress = async (item: Repo) => {
    await Haptics.selectionAsync();
    setSelectedRepo(item);
    setShowModal(!!item);
  };

  const onRefresh = async () => {
    await Haptics.selectionAsync(); // improvements, could vibrate until release or similar
    await refetch();
  };

  const closeModal = async () => {
    await Haptics.selectionAsync();
    setShowModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {' '}
      // make sure we have a safe area for the content
      <Text style={styles.title}>Top 100 GitHub Repositories</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search repositories..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList // use Flatlist instead of ScrollView for performance, also easier rendering method with no .map needed
        data={
          data.items.filter((repo) =>
            repo.name.toLowerCase().includes(searchQuery.toLowerCase()),
          ) || []
        } // improvements, could implement fuzzy search
        keyExtractor={(item) => item.id.toString()}
        initialNumToRender={10} // not really needed for 100 elements, but can be useful for performance
        maxToRenderPerBatch={10}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.repoItem}
            onPress={() => handlePress(item)}
          >
            <Text style={styles.repoName}>{item.name}</Text>
            <Text style={styles.starText}>⭐ {item.stargazers_count}</Text>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
      />
      <Modal
        visible={showModal && !!selectedRepo}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={closeModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            {selectedRepo && (
              <View>
                <Text style={styles.repoName}>{selectedRepo.name}</Text>
                <Text style={styles.modalText}>
                  Description:{' '}
                  {selectedRepo.description || 'No description available'}
                </Text>
                {selectedRepo.stargazers_count && (
                  <Text style={styles.modalText}>
                    Stars: {selectedRepo.stargazers_count}
                  </Text>
                )}
                {selectedRepo.watchers_count && (
                  <Text style={styles.modalText}>
                    Watchers Count: {selectedRepo.watchers_count}
                  </Text>
                )}{' '}
                {/* this number seems to be wrong, it's always the same as the
                number of stars */}
                {selectedRepo.open_issues_count && (
                  <Text style={styles.modalText}>
                    Open Issues Count: {selectedRepo.open_issues_count}
                  </Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  searchInput: {
    height: 40,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  repoItem: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  repoName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    marginVertical: 8,
  },
  starText: {
    fontSize: 16,
    fontWeight: 'semibold',
    marginVertical: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff0202',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 40,
  },
});

export default GitHubRepos;
