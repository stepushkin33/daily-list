import type { TodoFilter } from '@/entities/todo/model/todo'
import type { TodoCounts } from '@/entities/todo/model/selectors'

interface TodoFiltersProps {
  activeFilter: TodoFilter
  counts: TodoCounts
  onChange: (filter: TodoFilter) => void
}

const filters: Array<{ value: TodoFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Выполненные' },
]

export const TodoFilters = ({ activeFilter, counts, onChange }: TodoFiltersProps) => (
  <nav className="filter-tabs" aria-label="Фильтр задач">
    {filters.map((filter) => (
      <button
        key={filter.value}
        className={activeFilter === filter.value ? 'filter-tab filter-tab-active' : 'filter-tab'}
        type="button"
        aria-pressed={activeFilter === filter.value}
        onClick={() => onChange(filter.value)}
      >
        {filter.label}
        <span className="filter-count">{counts[filter.value]}</span>
      </button>
    ))}
  </nav>
)
