import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { Calendar, MapPin, Tag } from 'lucide-react-native';
import { RelationshipEvent } from '@/src/types/Relationship';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatDate } from '@/src/utils/formatDate';
import Memory from '@/src/types/Memory';
import { MemoryCategory } from '@/src/types/Memory';




interface TimelineEventCardProps {
  event: Memory;
  onPress: () => void;
  showRelationship?: boolean;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  onPress,
}) => {
  const colors = useThemeColors();

  const getMemoryTypeColor = (type: MemoryCategory) => {
    switch (type) {
      case 'milestone': return colors.primary;
      case 'quality-time': return '#FF9500';
      case 'challenge': return colors.error;
      case 'gift': return '#34A853';
      case 'family': return '#8E24AA';
      case 'holiday': return colors.error;
      default: return colors.onSurfaceVariant;
    }
  };

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
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="mb-3 mx-1" style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-4">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-2xl mr-2">
                  {getMoodEmoji(event.mood ?? "")}
                </Text>
                <Text variant="titleMedium" className="text-gray-900 font-semibold flex-1">
                  {event.title}
                </Text>
              </View>
              
              <View className="flex-row items-center mt-1">
                <Calendar size={14} color={colors.onSurfaceVariant} />
                <Text variant="bodySmall" className="text-gray-600 ml-2">
                  {formatDate(new Date(event.date))}
                </Text>
                {event.location && (
                  <>
                    <MapPin size={14} color={colors.onSurfaceVariant} className="ml-3" />
                    <Text variant="bodySmall" className="text-gray-600 ml-1">
                      {event.location.label}
                    </Text>
                  </>
                )}
              </View>
            </View>

          </View>

          <Text variant="bodyMedium" className="text-gray-700 mb-3" numberOfLines={3}>
            {event.note}
          </Text>

          {(event.categories?.length ?? 0) > 0 && (
            <View className="flex-row items-center flex-wrap">
              <Tag size={14} color={colors.onSurfaceVariant} />
              {(event.tags ?? []).slice(0, 3).map((tag, index) => (
                <Chip 
                  key={index}
                  mode="outlined"
                  compact
                  textStyle={{  }}
                  style={{ 
                    marginLeft: 4, 
                    marginRight: 4,
                    height: 32
                  }}
                >
                  <Text className={"m-8"}>{tag}</Text>
                </Chip>
              ))}
              {(event.tags?.length ?? 0) > 3 && (
                <Text variant="bodySmall" className="text-gray-500">
                  +{(event.tags?.length ?? 0) - 3} more
                </Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};