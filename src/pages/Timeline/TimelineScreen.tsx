import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { FAB } from 'react-native-paper';
import { Plus, Heart } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { RelationshipCard } from '@/src/components/cards/RelationshipCard';
import { EmptyState } from '@/src/components/feedback/EmptyState';
import { LoadingSpinner } from '@/src/components/feedback/LoadingSpinner';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import Memory from "../../types/Memory"
import  Relationship  from '@/src/types/Relationship';
import { router } from 'expo-router';
import { useUserStore } from '@/src/store/userStore';
import { getPartnerName } from '@/src/utils/getPartnerName';
import { useRelationshipStore } from '@/src/store/relationshipStore';
import {GalleryScreen} from "../../components/elements/GalleryScreen"
import { useModal } from '../../contexts/ModalContext';


export default function TimelineScreen() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  const memories = useRelationshipStore((s) => s.memories);



  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'relationships' | 'timeline'>('timeline');

  const { openModal, closeModal, modals } = useModal();
  const currentModal = modals[modals.length - 1];


  const onPressItem = async (index: number) => {
    await openModal("story_mode", {memories: memories, initialIndex: index, onClose: () => {
      closeModal(currentModal.id);
    } });
  }

  const user = useUserStore(s => s.user);
  const colors = useThemeColors();

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    setLoading(false);
  };

  const handleRelationshipPress = (relationship: Relationship) => {
    console.log('View relationship:', relationship.id);
  };
  const handleAddRelationship = () => {
    router.push("/pair")
  }

  const handleMemoryPress = (memory: Memory) => {
    console.log('View event:', memory.id);
  };

  const handleAddMemory = () => {
    router.push("/add_memory")
  };

  if (loading) {
    return (
      <Screen>
        <LoadingSpinner message="Loading your timeline..." />
      </Screen>
    );
  }

  const renderTimelineContent = () => {
    if (memories?.length === 0) {
      return (
        <EmptyState
          title="No Timeline memories Yet"
          description="Start documenting your relationship journey by adding your first milestone, memory, or special moment."
          icon={<Heart size={48} color={colors.onSurfaceVariant} />}
          actionText="Add Your First Event"
          onAction={handleAddMemory}
        />
      );
    }

    return (
      ( memories ? <GalleryScreen items={memories} onPressItem={onPressItem}></GalleryScreen> : <LoadingSpinner></LoadingSpinner> )
    );
  };

  const renderRelationshipsContent = () => {
    if (relationships.length === 0) {
      return (
        <EmptyState
          title="No Relationships Yet"
          description="Begin your journey by pairing with your first partner. Document the special people who have been part of your story."
          icon={<Heart size={48} color={colors.onSurfaceVariant} />}
          actionText={`${user?.partner?.name ? `Pair with ${getPartnerName(user?.partner?.name)}`: "Add First Relationship"}`}
          onAction={handleAddRelationship}
        />
      );
    }

    return (
      <FlatList
        data={relationships}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RelationshipCard 
            relationship={item} 
            onPress={() => handleRelationshipPress(item)} 
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    );
  };

  return (
    <Screen>


      <SectionHeader 
        title="Relationship Timeline"
        subtitle={`${memories?.length} memories across ${relationships.length} relationships`}
      />

      <View className="flex-row mb-6">
        <View className="flex-1 flex-row bg-gray-100 rounded-lg p-1">
          <View 
            className={`flex-1 py-2 px-4 rounded-md ${
              viewMode === 'timeline' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text 
              className={`text-center font-medium ${
                viewMode === 'timeline' ? 'text-primary' : 'text-gray-600'
              }`}
              onPress={() => setViewMode('timeline')}
            >
              Timeline
            </Text>
          </View>
          <View 
            className={`flex-1 py-2 px-4 rounded-md ${
              viewMode === 'relationships' ? 'bg-white shadow-sm' : ''
            }`}
          >
            <Text 
              className={`text-center font-medium ${
                viewMode === 'relationships' ? 'text-primary' : 'text-gray-600'
              }`}
              onPress={() => setViewMode('relationships')}
            >
              Relationships
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1">
        {viewMode === 'timeline' ? renderTimelineContent() : renderRelationshipsContent()}
      </View>

      <FAB
        icon={() => <Plus size={24} color="white" />}
        className={"rounded-full"}
        onPress={handleAddMemory}
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: colors.primary,
        }}
      />
    </Screen>
  );
}