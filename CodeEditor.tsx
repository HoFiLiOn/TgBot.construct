import { useState, useRef } from 'react';
import { Upload, Code2, Play, Save, Copy, Check, FileCode, ChevronDown } from 'lucide-react';
import { DEFAULT_CODE, EXAMPLE_CODES } from '../engine/code-parser';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onSave?: () => void;
  onTest?: () => void;
  readOnly?: boolean;
}

export default function CodeEditor({
  code,
  onChange,
  onSave,
  onTest,
  readOnly = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024) {
      alert('Файл слишком большой (макс. 100 КБ)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      onChange(content);
    };
    reader.readAsText(file);
  };

  const handleInsertExample = (exampleKey: string) => {
    const example = EXAMPLE_CODES[exampleKey];
    if (example) {
      onChange(example);
      setShowExamples(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      onChange(value.substring(0, start) + '  ' + value.substring(end));
      
      // Move cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-950">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 px-3 py-2">
        <div className="flex items-center gap-2">
          <Code2 className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Редактор кода</span>
          <span className="rounded bg-gray-800 px-1.5 py-0.5 text-xs text-gray-500">
            {code.split('\n').length} строк
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          {!readOnly && (
            <>
              {/* Examples dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="flex items-center gap-1 rounded-md bg-gray-800 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white"
                >
                  <FileCode className="h-3.5 w-3.5" />
                  Примеры
                  <ChevronDown className={`h-3 w-3 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
                </button>
                {showExamples && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-700 bg-gray-900 p-1 shadow-xl">
                    {Object.entries(EXAMPLE_CODES).map(([key, _]) => (
                      <button
                        key={key}
                        onClick={() => handleInsertExample(key)}
                        className="w-full rounded-md px-3 py-2 text-left text-xs text-gray-300 hover:bg-gray-800"
                      >
                        {key === 'echo' && '🤖 Эхо-бот'}
                        {key === 'coinflip' && '🪙 Орёл и Решка'}
                        {key === 'counter' && '🔢 Счётчик'}
                        {key === 'quiz' && '🧠 Мини-викторина'}
                      </button>
                    ))}
                    <div className="my-1 border-t border-gray-800" />
                    <button
                      onClick={() => { onChange(DEFAULT_CODE); setShowExamples(false); }}
                      className="w-full rounded-md px-3 py-2 text-left text-xs text-purple-400 hover:bg-gray-800"
                    >
                      📋 Базовый шаблон
                    </button>
                  </div>
                )}
              </div>

              {/* Upload button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 rounded-md bg-gray-800 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                <Upload className="h-3.5 w-3.5" />
                Загрузить
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".js,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          )}

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md bg-gray-800 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Скопировано' : 'Копировать'}
          </button>

          {/* Save button */}
          {onSave && !readOnly && (
            <button
              onClick={onSave}
              className="flex items-center gap-1 rounded-md bg-purple-500/20 px-2.5 py-1.5 text-xs text-purple-400 hover:bg-purple-500/30"
            >
              <Save className="h-3.5 w-3.5" />
              Сохранить
            </button>
          )}

          {/* Test button */}
          {onTest && (
            <button
              onClick={onTest}
              className="flex items-center gap-1 rounded-md bg-green-500/20 px-2.5 py-1.5 text-xs text-green-400 hover:bg-green-500/30"
            >
              <Play className="h-3.5 w-3.5" />
              Запустить
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        {/* Line numbers */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gray-900/50 border-r border-gray-800">
          <div className="p-3 font-mono text-xs text-gray-600 leading-6">
            {code.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder={DEFAULT_CODE}
          className="min-h-[400px] w-full resize-y bg-transparent pl-12 pr-4 py-3 font-mono text-sm leading-6 text-green-400 placeholder-gray-600 outline-none"
          spellCheck={false}
          style={{ tabSize: 2 }}
        />
      </div>

      {/* Help */}
      <div className="border-t border-gray-800 px-3 py-2 text-xs text-gray-600">
        <span className="mr-4">Tab = 2 пробела</span>
        <span className="mr-4">Доступны: <code className="text-purple-400">bot</code>, <code className="text-purple-400">btn()</code>, <code className="text-purple-400">keyboard()</code></span>
        <span>Ctrl+S = Сохранить</span>
      </div>
    </div>
  );
}
