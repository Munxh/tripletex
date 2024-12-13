import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from "react-native-safe-area-context";
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
            'https://api.github.com/search/repositories?q=stars:>1&sort=stars&order=desc&per_page=100'
        );

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return response.json();
    };

    const [selectedRepo, setSelectedRepo] = useState<Repo>();
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');


    const {
        data,
        isLoading,
        isError,
        error,
        isRefetching,
        refetch
    } = useQuery<{ items: Repo[] }>(['repos'], fetchRepos, {
        cacheTime: Infinity,
    });

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Loading...</Text>
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
        await Haptics.selectionAsync()
        setSelectedRepo(item);
        setShowModal(!!item);
    }

    const onRefresh = async () => {
        await Haptics.selectionAsync() // improvements, could vibrate until release or similar
        await refetch();
    };


    const closeModal = async () => {
        await Haptics.selectionAsync() // improvements, could vibrate until release or similar
        setShowModal(false);
    };




    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Top 100 GitHub Repositories</Text>

            <TextInput
                style={styles.searchInput}
                placeholder="Search repositories..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <FlatList
                data={ data.items
                    .filter((repo) => repo.name.toLowerCase().includes(searchQuery.toLowerCase())) || []} // improvements, could implement fuzzy search
                keyExtractor={(item) => item.id.toString()}
                initialNumToRender={10} // not really needed, but can be useful for performance
                maxToRenderPerBatch={10}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.repoItem} onPress={() => handlePress(item)}>
                        <Text style={styles.repoName}>{item.name}</Text>
                        <Text style={styles.starText}>⭐ {item.stargazers_count}</Text>
                    </TouchableOpacity>
                )}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
            />

            <Modal visible={showModal && !!selectedRepo}
                   transparent
                   animationType="fade"
                   onRequestClose={closeModal}>
                <TouchableOpacity style={styles.modalOverlay} onPress={closeModal}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                        {selectedRepo && (
                            <View>
                                <Text style={styles.repoName}>{selectedRepo.name}</Text>
                                <Text
                                    style={styles.modalText}>Description: {selectedRepo.description || 'No description available'}</Text>
                                <Text style={styles.modalText}>Stars: {selectedRepo.stargazers_count}</Text>
                                <Text style={styles.modalText}>Watchers
                                    Count: {selectedRepo.watchers_count}</Text> //this number seems to be wrong, its
                                always the same as the number of stars
                                <Text style={styles.modalText}>Open Issues
                                    Count: {selectedRepo.open_issues_count}</Text>
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
        backgroundColor: '#f9f9f9',
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
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
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
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
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
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
});

export default GitHubRepos;
