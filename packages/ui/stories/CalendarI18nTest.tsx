import React from 'react'
import { Calendar } from '../src/components/ui/calendar'
import { getCurrentLocale, setLocale } from '../src/lib/i18n'

export function CalendarI18nTest() {
  const [selectedDate, setSelectedDate] = React.useState<Date>()
  const [locale, setLocaleState] = React.useState(getCurrentLocale())

  const handleLocaleChange = (newLocale: 'en-US' | 'zh-CN') => {
    setLocale(newLocale)
    setLocaleState(newLocale)
  }

  return (
    <div className="space-y-4 p-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Calendar i18n Test</h1>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Current Locale: <strong>{locale}</strong>
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleLocaleChange('zh-CN')}
              className={`px-4 py-2 rounded ${locale === 'zh-CN' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              中文 (Chinese)
            </button>
            <button
              onClick={() => handleLocaleChange('en-US')}
              className={`px-4 py-2 rounded ${locale === 'en-US' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 inline-block">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          uiLocale={locale}
        />
      </div>

      {selectedDate && (
        <div className="text-sm text-gray-600">
          Selected: {selectedDate.toLocaleDateString(locale)}
        </div>
      )}
    </div>
  )
}

export default CalendarI18nTest
