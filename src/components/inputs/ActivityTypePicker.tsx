import React from "react";
import { CategoryPicker } from "@/src/components/inputs/CategoryPicker";
import type { ActivityType } from "@/src/types/Calendar";

export const ActivityTypeList: ActivityType[] = [
  "date-night",
  "workout",
  "movie",
  "anniversary",
  "study",
  "dinner",
  "appointment",
  "other",
];

type Props = {
  label?: string;
  value?: ActivityType;
  onChange: (type: ActivityType | undefined) => void;
};

export const ActivityTypePicker: React.FC<Props> = ({
                                                      label = "Type",
                                                      value,
                                                      onChange,
                                                    }) => {
  return (
    <CategoryPicker
      multiple={false}
      label={label}
      categories={[...ActivityTypeList]}
      value={value ? [value] : []}
      onChange={(vals) => onChange(vals?.[0])}
    />
  );
};
