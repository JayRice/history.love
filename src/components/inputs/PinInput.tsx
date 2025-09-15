/*
Usage example (controlled):


const [pin, setPin] = useState("");


<PinInput
value={pin}
setValue={setPin}
length={6}
mode="alphanumeric"
loading={isSubmitting}
autoFocus
onComplete={(code) => submit(code)}
textFieldProps={{
// Customize every cell's TextField
// className: "w-12 h-12 text-center",
// placeholder: "•",
}}
/>
*/


import React, { useMemo, useRef, useEffect } from "react";
import { View } from "react-native";
// Assuming your TextField matches this minimal prop surface. Adjust as needed in your codebase.
// If you have a proper type, replace `any` below with your real `TextFieldProps` type.
import { TextField } from '@/src/components/inputs/TextField';

export type PinMode = "numeric" | "alpha" | "alphanumeric";

export interface PinInputProps {
  /** Controlled value (e.g., "123456"). */
  value: string;
  /** Controlled setter coming from parent state. */
  setValue: (next: string) => void;

  /** Number of boxes/characters. Default 6. */
  length?: number;
  /** Allowed characters. Default "numeric". */
  mode?: PinMode;
  /** Disable editing (e.g., while loading). */
  loading?: boolean;
  /** Autofocus the first box on mount. */
  autoFocus?: boolean;
  /** Called once all boxes are filled. */
  onComplete?: (code: string) => void;

  /** Optional additional props forwarded to every TextField */
  textFieldProps?: Partial<any>;
  /** Optional container style props */
  gap?: number; // horizontal gap between boxes
}

function sanitize(mode: PinMode, raw: string): string {
  const up = raw.toUpperCase();
  if (mode === "numeric") return up.replace(/[^0-9]/g, "");
  if (mode === "alpha") return up.replace(/[^A-Z]/g, "");
  return up.replace(/[^0-9A-Z]/g, ""); // alphanumeric
}

export default function PinInput({
                                   value,
                                   setValue,
                                   length = 6,
                                   mode = "numeric",
                                   loading = false,
                                   autoFocus = false,
                                   onComplete,
                                   textFieldProps,
                                   gap = 8,
                                 }: PinInputProps) {
  const refs = useRef<Array<any>>([]);

  // Ensure array of refs matches `length`
  useEffect(() => {
    if (refs.current.length !== length) {
      refs.current = Array.from({ length }, (_, i) => refs.current[i] || null);
    }
  }, [length]);

  // Derived array of characters padded to length
  const chars = useMemo(() => {
    const clean = sanitize(mode, value || "").slice(0, length);
    if (clean !== value) setValue(clean); // keep parent state sanitized
    return Array.from({ length }, (_, i) => clean[i] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length, mode]);

  useEffect(() => {
    if (autoFocus && !loading && refs.current[0]?.focus) {
      refs.current[0].focus();
    }
  }, [autoFocus, loading]);

  const keyboardType = mode === "numeric" ? ("number-pad" as const) : ("default" as const);

  function focusIndex(i: number) {
    const target = refs.current[i];
    if (target && typeof target.focus === "function") target.focus();
  }

  function blurIndex(i: number) {
    const target = refs.current[i];
    if (target && typeof target.blur === "function") target.blur();
  }

  function handleChangeAt(index: number, input: string) {
    if (loading) return;
    const incoming = sanitize(mode, input);
    if (incoming.length === 0) {
      // Clearing this box
      const next = [...chars];
      next[index] = "";
      setValue(next.join(""));
      return;
    }

    // If user pasted or typed multiple chars, distribute forward
    const next = [...chars];
    let i = index;
    for (const ch of incoming) {
      if (i >= length) break;
      next[i] = ch;
      i++;
    }

    const joined = next.join("").slice(0, length);
    setValue(joined);

    if (i < length) {
      focusIndex(i);
    } else {
      blurIndex(length - 1);
      if (joined.length === length) onComplete?.(joined);
    }
  }

  function handleKeyPressAt(index: number, e: { nativeEvent?: { key?: string } }) {
    const key = e?.nativeEvent?.key;
    if (key === "Backspace") {
      if (chars[index]) {
        // Normal backspace inside current box
        const next = [...chars];
        next[index] = "";
        setValue(next.join(""));
      } else if (index > 0) {
        // Move back to previous box and clear it
        focusIndex(index - 1);
        const next = [...chars];
        next[index - 1] = "";
        setValue(next.join(""));
      }
    }
  }

  return (
    <View style={{ flexDirection: "row", gap, alignItems: "center" }}>
      {Array.from({ length }).map((_, idx) => (
        <TextField
          key={idx}
          // Expose a ref: your TextField should forward ref to RN TextInput
          ref={(r: any) => (refs.current[idx] = r)}
          label={`Code ${idx + 1}`}
          value={chars[idx]}
          onChangeText={(t: string) => handleChangeAt(idx, t)}
          onKeyPress={(e: any) => handleKeyPressAt(idx, e)}
          autoCapitalize={mode === "numeric" ? "none" : "characters"}
          autoCorrect={false}
          keyboardType={keyboardType}
          maxLength={1}
          editable={!loading}
          // Visual state hint (if your TextField supports it)
          // status={loading ? "disabled" : undefined}
          {...textFieldProps}
        />
      ))}
    </View>
  );
}
