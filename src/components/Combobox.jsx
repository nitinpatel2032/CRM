import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Check, X, Loader2 } from 'lucide-react';

// Custom hook for debouncing a value
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

export const Combobox = ({
    options: initialOptions = [],
    value,
    onChange,
    placeholder = 'Select...',
    multiple = false,
    disabled = false,
    optionValue = 'id',
    optionLabel = 'name',
    onLoadOptions,
    debounceTimeout = 300,
    isCreatable = false,
    onCreateOption,
    renderOption,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fetchedOptions, setFetchedOptions] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    const comboboxRef = useRef(null);
    const inputRef = useRef(null);
    const listRef = useRef(null);

    const debouncedQuery = useDebounce(query, debounceTimeout);

    // --- DATA FETCHING ---
    useEffect(() => {
        if (debouncedQuery && onLoadOptions) {
            setIsLoading(true);
            onLoadOptions(debouncedQuery)
                .then(newOptions => {
                    setFetchedOptions(newOptions || []);
                })
                .catch(() => setFetchedOptions([]))
                .finally(() => setIsLoading(false));
        } else if (!debouncedQuery && onLoadOptions) {
            setFetchedOptions([]);
        }
    }, [debouncedQuery, onLoadOptions]);

    const options = onLoadOptions ? fetchedOptions : initialOptions;

    // --- DERIVED STATE & MEMOIZED VALUES ---
    const selectedValuesSet = useMemo(() => new Set(multiple ? value || [] : [value]), [value, multiple]);

    const flattenedOptions = useMemo(() => {
        let flat = [];
        options.forEach(option => {
            if (option.options) { // It's a group
                flat.push(...option.options.map(subOption => ({ ...subOption, group: option.label })));
            } else {
                flat.push(option);
            }
        });
        return flat;
    }, [options]);

    const filteredAndGroupedOptions = useMemo(() => {
        const filtered = query
            ? flattenedOptions.filter(opt => opt[optionLabel]?.toString().toLowerCase().includes(query.toLowerCase()))
            : flattenedOptions;

        // Re-group the filtered options
        const grouped = {};
        filtered.forEach(opt => {
            const groupLabel = opt.group || 'ungrouped';
            if (!grouped[groupLabel]) grouped[groupLabel] = { label: opt.group, options: [] };
            grouped[groupLabel].options.push(opt);
        });

        const result = [];
        if (grouped.ungrouped) result.push(...grouped.ungrouped.options);
        delete grouped.ungrouped;
        Object.values(grouped).forEach(group => result.push(group));
        return result;

    }, [query, flattenedOptions, optionLabel]);

    const selectableOptions = useMemo(() => {
        return filteredAndGroupedOptions.flatMap(item => (item.options ? item.options : item));
    }, [filteredAndGroupedOptions]);

    const isCreatableOptionVisible = isCreatable && query && !selectableOptions.some(opt => opt[optionLabel].toLowerCase() === query.toLowerCase());

    const totalSelectableCount = selectableOptions.length + (isCreatableOptionVisible ? 1 : 0);

    // --- EVENT HANDLERS ---
    const handleSelect = (option) => {
        const selectedValue = option[optionValue];
        if (multiple) {
            const newValue = selectedValuesSet.has(selectedValue)
                ? (value || []).filter(v => v !== selectedValue)
                : [...(value || []), selectedValue];
            onChange(newValue);
            setQuery('');
            inputRef.current?.focus();
        } else {
            onChange(selectedValue);
            setQuery('');
            setIsOpen(false);
        }
    };

    const handleCreateOption = async () => {
        if (!onCreateOption) return;
        const newOption = await onCreateOption(query);
        if (newOption) {
            handleSelect(newOption);
        }
    };

    // handler to clear the entire selection
    const handleClear = (e) => {
        e.stopPropagation();
        onChange(multiple ? [] : '');
        setQuery('');
        inputRef.current?.focus();
    };

    const handleRemoveTag = (e, valToRemove) => {
        e.stopPropagation();
        const newValue = (value || []).filter(v => v !== valToRemove);
        onChange(newValue);
    };

    // --- KEYBOARD NAVIGATION ---
    const handleKeyDown = (e) => {
        if (disabled) return;
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => (prev < totalSelectableCount - 1 ? prev + 1 : prev));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0) {
                    if (highlightedIndex === selectableOptions.length && isCreatableOptionVisible) {
                        handleCreateOption();
                    } else if (selectableOptions[highlightedIndex]) {
                        handleSelect(selectableOptions[highlightedIndex]);
                    }
                }
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            case 'Tab':
                setIsOpen(false);
                break;
        }
    };

    // --- EFFECTS ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
                setIsOpen(false);
                setQuery('');
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listRef.current) {
            const item = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
            if (item) {
                item.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    useEffect(() => {
        setHighlightedIndex(0);
    }, [query, options]);

    const selectedItems = useMemo(() =>
        multiple ? flattenedOptions.filter(opt => selectedValuesSet.has(opt[optionValue])) : [],
        [multiple, flattenedOptions, selectedValuesSet, optionValue]
    );

    const singleDisplayValue = useMemo(() => {
        if (multiple) return '';
        return flattenedOptions.find(opt => opt[optionValue] === value)?.[optionLabel] || '';
    }, [multiple, value, flattenedOptions, optionValue, optionLabel]);

    // Condition to show the clear button
    const isClearable = !disabled && (multiple ? (value?.length || 0) > 0 : !!value);


    // --- RENDER LOGIC ---
    let currentIndex = -1;
    return (
        <div className="relative w-full" ref={comboboxRef}>
            <div
                className={`input-style relative flex items-center gap-1.5 flex-wrap ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && inputRef.current?.focus()}
            >
                {multiple && selectedItems.map(item => (
                    <span key={item[optionValue]} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-sm font-medium px-2 py-0.5 rounded-md">
                        {item[optionLabel]}
                        <button type="button" onClick={(e) => handleRemoveTag(e, item[optionValue])} className="text-indigo-500 hover:text-indigo-800">
                            <X size={14} />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    onFocus={() => !disabled && setIsOpen(true)}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    value={isOpen ? query : (multiple ? query : singleDisplayValue)}
                    placeholder={selectedItems.length > 0 || singleDisplayValue ? '' : placeholder}
                    disabled={disabled}
                    className="flex-grow bg-transparent outline-none text-sm pr-12" // padding to avoid text overlap with icons
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                    {isClearable && (
                        <button type="button" onClick={handleClear} className="p-1 text-gray-400 hover:text-gray-600">
                            <X size={16} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(prev => !prev)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                    >
                        <ChevronDown size={17} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {isOpen && (
                <ul ref={listRef} className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto p-1">
                    {isLoading ? (
                        <li className="p-2 text-sm text-center text-gray-500 flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> Loading...
                        </li>
                    ) : totalSelectableCount === 0 && !isLoading ? (
                        <li className="p-2 text-sm text-center text-gray-500">No results found.</li>
                    ) : (
                        <>
                            {filteredAndGroupedOptions.map((item, groupIndex) => {
                                if (item.options) { // It's a group
                                    return (
                                        <div key={item.label || groupIndex}>
                                            <li className="px-2 py-1 text-xs font-bold text-gray-500 uppercase">{item.label}</li>
                                            {item.options.map(option => {
                                                currentIndex++;
                                                const localIndex = currentIndex;
                                                return (
                                                    <OptionItem key={option[optionValue]} option={option} index={localIndex} isSelected={selectedValuesSet.has(option[optionValue])} isHighlighted={highlightedIndex === localIndex} onSelect={handleSelect} optionValue={optionValue} optionLabel={optionLabel} renderOption={renderOption} multiple={multiple} />
                                                );
                                            })}
                                        </div>
                                    );
                                } else { // It's a single item
                                    currentIndex++;
                                    const localIndex = currentIndex;
                                    return (
                                        <OptionItem key={item[optionValue]} option={item} index={localIndex} isSelected={selectedValuesSet.has(item[optionValue])} isHighlighted={highlightedIndex === localIndex} onSelect={handleSelect} optionValue={optionValue} optionLabel={optionLabel} renderOption={renderOption} multiple={multiple} />
                                    );
                                }
                            })}
                            {isCreatableOptionVisible && (
                                <li
                                    data-index={selectableOptions.length}
                                    onClick={handleCreateOption}
                                    className={`flex items-center p-2 text-sm rounded-md cursor-pointer ${highlightedIndex === selectableOptions.length ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
                                >
                                    Create "{query}"
                                </li>
                            )}
                        </>
                    )}
                </ul>
            )}
        </div>
    );
};

// Helper component for rendering list items
const OptionItem = ({ option, index, isSelected, isHighlighted, onSelect, optionValue, optionLabel, renderOption, multiple }) => (
    <li
        data-index={index}
        key={option[optionValue]}
        onClick={() => onSelect(option)}
        className={`flex items-center justify-between p-2 text-sm text-gray-800 rounded-md cursor-pointer ${isHighlighted ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
    >
        <div className="flex items-center">
            {multiple && (
                <div className={`w-4 h-4 mr-3 flex-shrink-0 flex items-center justify-center border rounded ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                    {isSelected && <Check size={12} className="text-white" />}
                </div>
            )}
            <span className="truncate">
                {renderOption ? renderOption(option, 'option') : option[optionLabel]}
            </span>
        </div>
        {!multiple && isSelected && <Check size={16} className="text-indigo-600 flex-shrink-0" />}
    </li>
);