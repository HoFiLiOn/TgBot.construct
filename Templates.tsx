import { useState } from 'react';
import { templates, categories, TemplateInfo } from '../data/templates';
import { ArrowRight, Tag, Search, Sparkles, Plus } from 'lucide-react';

interface TemplatesProps {
  onUseTemplate: (template: TemplateInfo) => void;
}

export default function Templates({ onUseTemplate }: TemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = templates.filter(t => {
    if (selectedCategory && t.category !== selectedCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      return t.name.toLowerCase().includes(s) || t.description.toLowerCase().includes(s) || t.tags.some(tag => tag.includes(s));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">📦 Шаблоны</h2>
          <p className="mt-1 text-gray-400">{templates.length} готовых ботов</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full sm:w-64 rounded-xl border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            !selectedCategory ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
          }`}
        >
          Все ({templates.length})
        </button>
        {categories.map(cat => {
          const count = templates.filter(t => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Templates grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map(template => (
          <div
            key={template.id}
            className="group flex flex-col rounded-xl border border-gray-800 bg-gray-900/50 p-4 transition-all hover:border-purple-500/50 hover:bg-gray-900/80"
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{template.icon}</span>
              <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                {categories.find(c => c.id === template.category)?.name.split(' ')[0]}
              </span>
            </div>
            <h3 className="font-semibold text-white mb-1">{template.name}</h3>
            <p className="text-xs text-gray-400 mb-3 line-clamp-2">{template.description}</p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {template.tags.slice(0, 3).map(tag => (
                <span key={tag} className="inline-flex items-center gap-0.5 rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-500">
                  <Tag className="h-2 w-2" />{tag}
                </span>
              ))}
            </div>

            <button
              onClick={() => onUseTemplate(template)}
              className="mt-auto flex items-center justify-center gap-1 rounded-lg bg-purple-500/10 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/20"
            >
              <ArrowRight className="h-4 w-4" />
              Использовать
            </button>
          </div>
        ))}

        {/* Create own template card */}
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-700 p-6 text-center hover:border-purple-500/50">
          <Plus className="h-8 w-8 text-gray-600 mb-2" />
          <h3 className="font-medium text-gray-400">Свой шаблон</h3>
          <p className="text-xs text-gray-500 mt-1">Используйте AI или редактор</p>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-gray-700 mb-4" />
          <p className="text-gray-400">Ничего не найдено</p>
          <p className="text-sm text-gray-500">Попробуйте другой запрос</p>
        </div>
      )}

      {/* AI suggestion */}
      <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20">
            <Sparkles className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Не нашли нужный?</h3>
            <p className="text-sm text-gray-400">AI создаст бота по вашему описанию</p>
          </div>
        </div>
      </div>
    </div>
  );
}
