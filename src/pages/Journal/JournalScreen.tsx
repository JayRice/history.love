import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { Card, Text, FAB, Chip } from 'react-native-paper';
import { Plus, BookOpen, Mic, Sparkles } from 'lucide-react-native';
import { Screen } from '@/src/shared/ui/layout/Screen';
import { SectionHeader } from '@/src/shared/ui/layout/SectionHeader';
import { EmptyState } from '@/src/shared/ui/feedback/EmptyState';
import { LoadingSpinner } from '@/src/shared/ui/feedback/LoadingSpinner';
import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import { JournalEntry, AIPrompt } from '@/src/shared/types/Journal';

const aiPrompts: AIPrompt[] = [
  {
    id: '1',
    category: 'reflection',
    prompt: "What did you learn about yourself today?",
    followUpQuestions: ['How did this realization make you feel?', 'What will you do differently tomorrow?'],
    isActive: true,
  },
  {
    id: '2',
    category: 'relationship',
    prompt: "Describe a moment when you felt truly connected to someone recently.",
    followUpQuestions: ['What made that moment special?', 'How can you create more moments like this?'],
    isActive: true,
  },
  {
    id: '3',
    category: 'gratitude',
    prompt: "What are three things about your relationships that you're grateful for?",
    followUpQuestions: ['How do these relationships enhance your life?', 'How can you show appreciation?'],
    isActive: true,
  },
];

interface JournalEntryCardProps {
  entry: JournalEntry;
  onPress: () => void;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry, onPress }) => {
  const colors = useThemeColors();

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'excited': return '🤩';
      case 'nervous': return '😰';
      case 'content': return '😌';
      case 'confused': return '😕';
      default: return '💭';
    }
  };

  return (
    <Card className="mb-4" style={{ backgroundColor: colors.surface }}>
      <Card.Content className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text className="text-xl mr-2">{getMoodEmoji(entry.mood)}</Text>
              <Text variant="titleMedium" className="text-gray-900 font-semibold flex-1">
                {entry.title}
              </Text>
              {entry.entryType === 'voice' && (
                <Mic size={16} color={colors.primary} />
              )}
            </View>
            <Text variant="bodySmall" className="text-gray-600 mb-3">
              {new Date(entry.createdAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        <Text variant="bodyMedium" className="text-gray-700 mb-3" numberOfLines={3}>
          {entry.content}
        </Text>

        {entry.aiPrompt && (
          <View className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg mb-3">
            <View className="flex-row items-center mb-1">
              <Sparkles size={14} color="#8B5CF6" />
              <Text variant="bodySmall" className="text-purple-700 font-medium ml-2">
                AI Prompt
              </Text>
            </View>
            <Text variant="bodySmall" className="text-purple-600 italic">
              &quot;{entry.aiPrompt}&quot;
            </Text>
          </View>
        )}

        {entry.tags.length > 0 && (
          <View className="flex-row flex-wrap">
            {entry.tags.slice(0, 3).map((tag, index) => (
              <Chip 
                key={index}
                mode="outlined"
                compact
                textStyle={{  }}
                style={{ 
                  marginRight: 4, 
                  marginBottom: 4,
                  height: 32
                }}
              >
                {tag}
              </Chip>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export default function JournalScreen() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const colors = useThemeColors();

  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    setLoading(true);
    try {
      // Mock journal entries
      const mockEntries: JournalEntry[] = [
        {
          id: '1',
          userId: '1',
          title: 'First Date Reflections',
          content: 'Had an amazing first date today. We talked for hours about our dreams, fears, and everything in between. There was this moment when we both reached for the same book at the coffee shop and our hands touched...',
          entryType: 'text',
          mood: 'excited',
          tags: ['first-date', 'coffee', 'connection'],
          isPrivate: false,
          aiPrompt: "Describe a moment when you felt truly connected to someone recently.",
          aiResponse: "It sounds like you experienced a beautiful moment of connection. These spontaneous moments often reveal the most about compatibility.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: '1',
          title: 'Relationship Growth',
          content: 'Been thinking about how much I\'ve grown in this relationship. Learning to communicate better, to listen more, and to be vulnerable. It\'s scary but also incredibly rewarding.',
          entryType: 'text',
          mood: 'content',
          tags: ['growth', 'communication', 'vulnerability'],
          isPrivate: true,
          aiPrompt: "What did you learn about yourself today?",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      
      setEntries(mockEntries);
    } catch (error) {
      console.error('Failed to load journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntryPress = (entry: JournalEntry) => {
    console.log('View entry:', entry.id);
  };

  const handleAddEntry = () => {
    console.log('Add new journal entry');
  };

  if (loading) {
    return (
      <Screen>
        <LoadingSpinner message="Loading your journal..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionHeader 
        title="Journal & Reflections"
        subtitle={`${entries.length} entries`}
      />

      {/* AI Prompts Section */}
      <Card className="mb-6" style={{ backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Card.Content className="p-4">
          <View className="flex-row items-center mb-3">
            <Sparkles size={20} color="white" />
            <Text variant="titleMedium" className="text-white font-semibold ml-2">
              Daily Reflection Prompts
            </Text>
          </View>
          <Text variant="bodyMedium" className="text-white/90 mb-4">
            AI-powered prompts to guide your journaling journey
          </Text>
          
          <View>
            {aiPrompts.slice(0, 1).map((prompt) => (
              <View key={prompt.id} className="bg-white/20 p-3 rounded-lg">
                <Text variant="bodyMedium" className="text-white italic">
                  &quot;{prompt.prompt}&quot;
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Journal Entries */}
      <View className="flex-1">
        {entries.length === 0 ? (
          <EmptyState
            title="Your Journal Awaits"
            description="Begin documenting your relationship journey. Share your thoughts, feelings, and memorable moments with AI-guided prompts."
            icon={<BookOpen size={48} color={colors.onSurfaceVariant} />}
            actionText="Write Your First Entry"
            onAction={handleAddEntry}
          />
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <JournalEntryCard 
                entry={item} 
                onPress={() => handleEntryPress(item)} 
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
      </View>

      <FAB
        icon={() => <Plus size={24} color="white" />}
        onPress={handleAddEntry}
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