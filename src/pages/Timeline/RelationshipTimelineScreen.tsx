import React, { useState, useEffect } from 'react';
import { View, FlatList, Text } from 'react-native';
import { FAB } from 'react-native-paper';
import { Plus, Heart } from 'lucide-react-native';
import { Screen } from '@/src/components/layout/Screen';
import { SectionHeader } from '@/src/components/layout/SectionHeader';
import { RelationshipCard } from '@/src/components/cards/RelationshipCard';
import { TimelineEventCard } from '@/src/components/cards/TimelineEventCard';
import { EmptyState } from '@/src/components/feedback/EmptyState';
import { LoadingSpinner } from '@/src/components/feedback/LoadingSpinner';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { getTimeline } from '@/src/server/getTimeline';
import { Relationship, RelationshipEvent } from '@/src/types';


export default function RelationshipTimelineScreen() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [events, setEvents] = useState<RelationshipEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'relationships' | 'timeline'>('timeline');
  const colors = useThemeColors();

  useEffect(() => {
    loadTimelineData();
  }, []);

  const loadTimelineData = async () => {
    setLoading(true);
    try {
      const data = await getTimeline();
      setRelationships(data.relationships);
      setEvents(data.events);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRelationshipPress = (relationship: Relationship) => {
    console.log('View relationship:', relationship.id);
  };

  const handleEventPress = (event: RelationshipEvent) => {
    console.log('View event:', event.id);
  };

  const handleAddNew = () => {
    console.log('Add new relationship or event');
  };

  if (loading) {
    return (
      <Screen>
        <LoadingSpinner message="Loading your timeline..." />
      </Screen>
    );
  }

  const renderTimelineContent = () => {
    if (events.length === 0) {
      return (
        <EmptyState
          title="No Timeline Events Yet"
          description="Start documenting your relationship journey by adding your first milestone, memory, or special moment."
          icon={<Heart size={48} color={colors.onSurfaceVariant} />}
          actionText="Add Your First Event"
          onAction={handleAddNew}
        />
      );
    }

    return (
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TimelineEventCard 
            event={item} 
            onPress={() => handleEventPress(item)} 
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    );
  };

  const renderRelationshipsContent = () => {
    if (relationships.length === 0) {
      return (
        <EmptyState
          title="No Relationships Yet"
          description="Begin your journey by adding your first relationship. Document the special people who have been part of your story."
          icon={<Heart size={48} color={colors.onSurfaceVariant} />}
          actionText="Add First Relationship"
          onAction={handleAddNew}
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
        subtitle={`${events.length} events across ${relationships.length} relationships`}
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
        onPress={handleAddNew}
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