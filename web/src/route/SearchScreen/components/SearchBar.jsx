import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Search, X } from "lucide-react";

const SearchBar = forwardRef(({ onSearch, initialQuery = "" }, ref) => {
    const [focused, setFocused] = useState(false);
    const [query, setQuery] = useState(initialQuery);
    const inputRef = useRef(null);

    useEffect(() => {
        if (initialQuery !== query) {
            setQuery(initialQuery);
        }
    }, [initialQuery]);

    const handleChangeText = (text) => {
        setQuery(text);
        onSearch?.(text);
    };

    const handleClear = () => {
        setQuery("");
        onSearch?.("");
    };

    const collapse = () => {
        setFocused(false);
        inputRef.current?.blur();
    };

    const expandVisual = () => {
        setFocused(true);
    };

    const hideHistory = () => {
        setFocused(false);
    };

    const collapseKeepText = () => {
        setFocused(false);
        inputRef.current?.blur();
    };

    useImperativeHandle(ref, () => ({
        collapse,
        expandVisual,
        hideHistory,
        collapseKeepText,
    }));

    return (
        <div style={{
            position: 'relative',
            width: '100%',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: '10px',
                padding: '12px 16px',
                border: focused ? '1px solid #0f172a' : '1px solid #e5e7eb',
                transition: 'all 0.2s ease',
                boxShadow: focused ? '0 0 0 3px rgba(15, 23, 42, 0.1)' : 'none',
            }}>
                <Search size={18} color="#9ca3af" style={{ marginRight: 12 }} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleChangeText(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onSearch?.(query);
                            inputRef.current?.blur();
                        }
                    }}
                    placeholder="Search articles..."
                    style={{
                        flex: 1,
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#0f172a',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                    }}
                />
                {query && (
                    <button
                        onClick={handleClear}
                        style={{
                            marginLeft: 8,
                            padding: '4px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e5e7eb';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <X size={16} color="#9ca3af" />
                    </button>
                )}
            </div>
        </div>
    );
});

SearchBar.displayName = 'SearchBar';
export default SearchBar;
