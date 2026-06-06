import React, { useMemo } from 'react';
import AdminAnimatedSelect from './AdminAnimatedSelect';

const PLACEHOLDER = 'Choose a category';

export default function AdminCategorySelect({ categories, value, onChange, colors, isDark }) {
  const options = useMemo(
    () =>
      categories.map((category) => {
        const subCount = (category.subcategories || []).length;
        return {
          value: category.slug,
          label: category.name,
          subLabel: subCount ? `${subCount} subcategor${subCount === 1 ? 'y' : 'ies'}` : null,
        };
      }),
    [categories],
  );

  const formatOptionLabel = (option) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span>{option.label}</span>
      {option.subLabel ? (
        <span style={{ fontSize: 12, opacity: 0.75, fontWeight: 500 }}>{option.subLabel}</span>
      ) : null}
    </div>
  );

  return (
    <AdminAnimatedSelect
      inputId="admin-category-select"
      ariaLabel="Select category"
      placeholder={PLACEHOLDER}
      value={value}
      onChange={onChange}
      options={options}
      colors={colors}
      isDark={isDark}
      isClearable
      isSearchable
      formatOptionLabel={formatOptionLabel}
      noOptionsMessage="No categories found"
      minWidth={200}
      selectWidth="100%"
    />
  );
}
