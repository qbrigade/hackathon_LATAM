import { DayPicker } from 'react-day-picker';
import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-day-picker/style.css';

type DatePickerProps = {
  value?: string; // DD/MM/YYYY format
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export const DatePicker = ({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  className = '',
  disabled = false
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2001, 0)); // Start with January 2001
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert DD/MM/YYYY string to Date object
  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const parts = dateString.split('/');
    if (parts.length !== 3) return undefined;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return isNaN(date.getTime()) ? undefined : date;
  };

  // Convert Date object to DD/MM/YYYY string
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Initialize selectedDate from value prop
  useEffect(() => {
    if (value) {
      const parsed = parseDate(value);
      setSelectedDate(parsed);
      if (parsed) {
        setCurrentMonth(parsed);
      }
    } else {
      setSelectedDate(undefined);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      onChange(formatDate(date));
    } else {
      onChange('');
    }
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    // Try to parse the input and update selectedDate
    const parsed = parseDate(inputValue);
    setSelectedDate(parsed);
    if (parsed) {
      setCurrentMonth(parsed);
    }
  };

  const handleYearChange = (year: number) => {
    const newMonth = new Date(year, currentMonth.getMonth());
    setCurrentMonth(newMonth);
  };

  const handleMonthChange = (month: number) => {
    const newMonth = new Date(currentMonth.getFullYear(), month);
    setCurrentMonth(newMonth);
  };

  // Generate year options (current year back to 100 years ago)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="border border-[#D9D9D9] rounded-lg p-3 w-full text-[#404040] pr-10"
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Calendar size={16} />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80">
          {/* Year and Month Selectors */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <select
                value={currentMonth.getFullYear()}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm cursor-pointer"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={currentMonth.getMonth()}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1 text-sm cursor-pointer"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            showOutsideDays
            className="p-3"
            classNames={{
              day: 'hover:bg-gray-100 rounded-md cursor-pointer',
              day_selected: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]',
              day_today: 'bg-gray-100 font-semibold',
            }}
          />
        </div>
      )}
    </div>
  );
};
