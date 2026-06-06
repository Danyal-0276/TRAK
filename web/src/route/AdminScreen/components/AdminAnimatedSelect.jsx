import React, { useMemo } from 'react';
import Select, { components } from 'react-select';
import { ChevronDown } from 'lucide-react';
import './adminSettingsUi.css';

function buildStyles({
  inputBg,
  cardBackground,
  borderColor,
  textPrimary,
  textSecondary,
  primary,
  isDark,
  minWidth,
  selectWidth,
}) {
  const resolvedWidth = selectWidth || minWidth || 160;
  return {
    container: (base) => ({
      ...base,
      width: selectWidth ? '100%' : base.width,
    }),
    control: (base, state) => ({
      ...base,
      minHeight: 44,
      width: selectWidth ? '100%' : resolvedWidth,
      minWidth: resolvedWidth,
      maxWidth: selectWidth ? '100%' : undefined,
      borderRadius: 10,
      borderColor: state.isFocused ? primary : borderColor,
      backgroundColor: inputBg,
      boxShadow: state.isFocused ? `0 0 0 1px ${primary}` : 'none',
      '&:hover': { borderColor: state.isFocused ? primary : borderColor },
      cursor: 'pointer',
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '2px 12px',
      fontSize: 15,
      fontWeight: 600,
      flexWrap: 'nowrap',
    }),
    placeholder: (base) => ({
      ...base,
      color: textSecondary,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    singleValue: (base) => ({
      ...base,
      color: textPrimary,
      transition: 'opacity 0.18s ease',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }),
    input: (base) => ({
      ...base,
      color: textPrimary,
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 10,
      overflow: 'hidden',
      border: `1px solid ${borderColor}`,
      backgroundColor: cardBackground,
      boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.45)' : '0 8px 24px rgba(15,23,42,0.12)',
      zIndex: 20,
      marginTop: 6,
    }),
    menuList: (base) => ({
      ...base,
      padding: 4,
      maxHeight: 280,
    }),
    option: (base, state) => ({
      ...base,
      fontSize: 14,
      borderRadius: 8,
      margin: '2px 0',
      cursor: 'pointer',
      color: state.isSelected ? '#fff' : textPrimary,
      backgroundColor: state.isSelected
        ? primary
        : state.isFocused
          ? isDark
            ? 'rgba(59,130,246,0.2)'
            : 'rgba(59,130,246,0.1)'
          : 'transparent',
      '&:active': {
        backgroundColor: state.isSelected ? primary : isDark ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.15)',
      },
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base) => ({
      ...base,
      color: textSecondary,
      paddingRight: 12,
      '&:hover': { color: textPrimary },
    }),
    clearIndicator: (base) => ({
      ...base,
      color: textSecondary,
      paddingRight: 4,
      transition: 'color 0.18s ease, opacity 0.18s ease',
      '&:hover': { color: textPrimary },
    }),
  };
}

function AnimatedMenu(props) {
  return (
    <components.Menu {...props} className="admin-animated-select__menu">
      {props.children}
    </components.Menu>
  );
}

function AnimatedDropdownIndicator(props) {
  const open = props.selectProps.menuIsOpen;
  return (
    <components.DropdownIndicator {...props}>
      <span
        className={`admin-animated-select__chevron${open ? ' admin-animated-select__chevron--open' : ''}`}
        aria-hidden
      >
        <ChevronDown size={18} color="currentColor" />
      </span>
    </components.DropdownIndicator>
  );
}

function AnimatedOption(props) {
  return (
    <components.Option {...props} className="admin-animated-select__option">
      {props.children}
    </components.Option>
  );
}

function AnimatedControl(props) {
  return (
    <components.Control {...props} className="admin-animated-select__control">
      {props.children}
    </components.Control>
  );
}

const SELECT_COMPONENTS = {
  Control: AnimatedControl,
  Menu: AnimatedMenu,
  DropdownIndicator: AnimatedDropdownIndicator,
  Option: AnimatedOption,
};

function normalizeOptions(options) {
  return options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return { value: opt.value, label: opt.label, ...opt };
  });
}

export default function AdminAnimatedSelect({
  inputId,
  ariaLabel,
  placeholder,
  value,
  onChange,
  options,
  colors,
  isDark,
  isClearable = false,
  isSearchable = false,
  formatOptionLabel,
  noOptionsMessage = 'No options found',
  minWidth,
  selectWidth,
}) {
  const { inputBg, cardBackground, borderColor, textPrimary, textSecondary, primary } = colors;

  const normalized = useMemo(() => normalizeOptions(options), [options]);
  const selected = normalized.find((o) => o.value === value) || null;

  const styles = useMemo(
    () =>
      buildStyles({
        inputBg,
        cardBackground,
        borderColor,
        textPrimary,
        textSecondary,
        primary,
        isDark,
        minWidth,
        selectWidth,
      }),
    [inputBg, cardBackground, borderColor, textPrimary, textSecondary, primary, isDark, minWidth, selectWidth],
  );

  return (
    <Select
      inputId={inputId}
      aria-label={ariaLabel}
      placeholder={placeholder}
      isClearable={isClearable}
      isSearchable={isSearchable}
      options={normalized}
      value={selected}
      onChange={(opt) => onChange(opt?.value ?? '')}
      styles={styles}
      components={SELECT_COMPONENTS}
      formatOptionLabel={formatOptionLabel}
      noOptionsMessage={() => noOptionsMessage}
    />
  );
}
