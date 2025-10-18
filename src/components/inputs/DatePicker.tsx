// components/inputs/DateInput.tsx
import React, { useMemo, useState } from 'react';
import {
  Platform,
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Text, TextInput } from 'react-native-paper';
import { Calendar as CalendarIcon, X as XIcon } from 'lucide-react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';

type Props = {
  date: Date | null;
  onChangeDate: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  error?: string;
  style?: any;
  testID?: string;
};

export default function DateInput({
                                    date,
                                    onChangeDate,
                                    label = 'Date',
                                    placeholder = 'MM/DD/YYYY',
                                    minimumDate,
                                    maximumDate = new Date(), // e.g., no future birthdays
                                    disabled = false,
                                    error,
                                    style,
                                    testID,
                                  }: Props) {
  const colors = useThemeColors();
  const [show, setShow] = useState(false);
  const [tempIOSDate, setTempIOSDate] = useState<Date>(date ?? new Date(2000, 0, 1));

  const valueText = useMemo(() => (date ? fmt(date) : ''), [date]);

  const openPicker = () => {
    if (disabled) return;
    if (Platform.OS === 'ios') {
      setTempIOSDate(date ?? new Date(2000, 0, 1));
      setShow(true);
    } else {
      setShow(true);
    }
  };

  const onAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    // Android closes automatically on selection / dismiss
    setShow(false);
    if (event.type === 'set' && selected) onChangeDate(selected);
  };

  const onIOSConfirm = () => {
    onChangeDate(tempIOSDate);
    setShow(false);
  };

  const onIOSCancel = () => setShow(false);

  const clear = () => onChangeDate(null);

  return (
    <View style={style}>
      {!!label && (
        <Text style={{ color: colors.onSurfaceVariant, marginBottom: 6, fontWeight: '600' }}>
          {label}
        </Text>
      )}

      <TouchableOpacity activeOpacity={0.8} onPress={openPicker} testID={testID}>
        <TextInput
          value={valueText || placeholder}
          placeholder={placeholder}
          editable={false}
          mode="outlined"
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
          }}
          outlineColor={error ? colors.error : colors.outline}
          activeOutlineColor={colors.primary}
          textColor={valueText ? colors.onSurface : colors.onSurfaceVariant}
          right={
            valueText ? (
              <TextInput.Icon
                forceTextInputFocus={false}
                onPress={clear}
                icon={() => <XIcon size={18} color={colors.onSurfaceVariant} />}
              />
            ) : null
          }
          left={
            <TextInput.Icon
              forceTextInputFocus={false}
              icon={() => <CalendarIcon size={18} color={valueText ? colors.primary:colors.onSurfaceVariant} />}
            />
          }
          pointerEvents="none" // prevents caret
        />
      </TouchableOpacity>

      {!!error && (
        <Text style={{ color: colors.error, fontSize: 12, marginTop: 6 }}>{error}</Text>
      )}

      {/* ANDROID: native dialog */}
      {Platform.OS === 'android' && show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date ?? new Date(2000, 0, 1)}
          mode="date"
          display="default"
          onChange={onAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* IOS: custom bottom sheet */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={show}
          transparent
          animationType="slide"
          onRequestClose={onIOSCancel}
        >
          <View style={[styles.backdrop, { backgroundColor: colors.backdrop?.concat('66') ?? '#00000066' }]}>
            <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
              <View style={[styles.sheetHeader, { borderBottomColor: colors.outlineVariant }]}>
                <PrimaryButton variant="text" onPress={onIOSCancel}>
                  Cancel
                </PrimaryButton>
                <PrimaryButton variant="filled" onPress={onIOSConfirm}>
                  Done
                </PrimaryButton>
              </View>

              <View style={styles.pickerWrap}>
                <DateTimePicker
                  testID="dateTimePickerIOS"
                  value={tempIOSDate}
                  mode="date"
                  display="spinner"
                  onChange={(_, d) => d && setTempIOSDate(d)}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  style={{ backgroundColor: 'transparent' }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// MM/DD/YYYY with leading zeros
function fmt(d: Date) {
  console.log("d:", d)
  if(!d) {return}
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  sheetHeader: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerWrap: {
    paddingVertical: 8,
  },
});
