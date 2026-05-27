import { Select, Stack, Text } from "@sanity/ui";
import { useEffect } from "react";
import { set, StringInputProps } from "sanity";
import { NJUSKALO_HEATING_OPTIONS } from "@/lib/listingFieldFormatters";

const NOT_SELECTED_VALUE = "not_selected";

export function HeatingInputSanity(props: StringInputProps) {
  const { onChange, readOnly, value } = props;
  const selectedValue = value || NOT_SELECTED_VALUE;

  useEffect(() => {
    if (!value && !readOnly) {
      onChange(set(NOT_SELECTED_VALUE));
    }
  }, [onChange, readOnly, value]);

  return (
    <Stack space={2}>
      <Select
        disabled={readOnly}
        value={selectedValue}
        onChange={(event) => onChange(set(event.currentTarget.value))}
      >
        {NJUSKALO_HEATING_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.title.hr}
          </option>
        ))}
      </Select>
      {selectedValue === NOT_SELECTED_VALUE && (
        <Text muted size={1}>
          Grijanje se neće slati na Njuškalo.
        </Text>
      )}
    </Stack>
  );
}
