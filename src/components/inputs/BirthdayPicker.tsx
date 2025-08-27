import React, { useState } from 'react';
import { View, Button, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { Input } from 'postcss';
import { TextInput } from 'react-native-paper';

export default function BirthdayPicker({date, onChangeDate, className} : {date : null | Date, onChangeDate: (date: Date) => void, className?: string}) {
  const [show, setShow] = useState(false);
  const colors = useThemeColors()

  const formatDate = (date: null | Date) => {
    if (!date) {
      return "MM/DD/YYYY";
    }
    const month = date.getMonth() + 1; // months are 0-based
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false); // Android closes picker after selection
    }
    if (selectedDate) {
      onChangeDate(selectedDate);
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setShow(true)}>
        <TextInput
          value={formatDate(date)}

          placeholder="MM/DD/YYYY"
          editable={false}           // 🔒 disables typing
          pointerEvents="none"       // ⛔ prevents text cursor from appearing
        />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date ?? new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChange}
          maximumDate={new Date()} // no future birthdays
        />
      )}
    </View>
  );
}