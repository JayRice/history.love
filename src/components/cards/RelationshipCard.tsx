import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { Calendar, MapPin, Heart } from 'lucide-react-native';
import { Relationship } from '@/src/types/Relationship';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatDate } from '@/src/utils/formatDate';

interface RelationshipCardProps {
  relationship: Relationship;
  onPress: () => void;
  onEdit?: () => void;
}

export const RelationshipCard: React.FC<RelationshipCardProps> = ({
  relationship,
  onPress,
}) => {
  const colors = useThemeColors();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.primary;
      case 'ended': return colors.onSurfaceVariant;
      case 'complicated': return '#FF9500';
      default: return colors.onSurfaceVariant;
    }
  };

  const duration = relationship.endDate 
    ? `${formatDate(relationship.startDate)} - ${formatDate(relationship.endDate)}`
    : `Since ${formatDate(relationship.startDate)}`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="mb-4 mx-1" style={{ backgroundColor: colors.surface }}>
        <Card.Content className="p-4">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text variant="titleMedium" className="text-gray-900 font-semibold">
                {relationship.partnerName}
              </Text>
              <View className="flex-row items-center mt-1">
                <Calendar size={14} color={colors.onSurfaceVariant} />
                <Text variant="bodySmall" className="text-gray-600 ml-2">
                  {duration}
                </Text>
              </View>
            </View>
            <Chip 
              mode="flat"
              textStyle={{ fontSize: 12, color: getStatusColor(relationship.status) }}
              style={{ backgroundColor: getStatusColor(relationship.status) + '20' }}
            >
              {relationship.status}
            </Chip>
          </View>

          <View className="flex-row items-center justify-between">
            <Text 
              variant="labelMedium" 
              className="text-gray-700 capitalize font-medium"
            >
              {relationship.relationshipType.replace('-', ' ')}
            </Text>
            <View className="flex-row items-center">
              <Heart 
                size={16} 
                color={colors.primary} 
                fill={relationship.status === 'active' ? colors.primary : 'transparent'} 
              />
              <Text variant="bodySmall" className="text-gray-600 ml-2">
                {relationship.events.length} events
              </Text>
            </View>
          </View>

          {relationship.notes && (
            <Text 
              variant="bodySmall" 
              className="text-gray-600 mt-2 italic" 
              numberOfLines={2}
            >
              {relationship.notes}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};