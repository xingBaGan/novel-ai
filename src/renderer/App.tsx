import { useState, useEffect } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { Settings, Minus, Square, X, CopyIcon, Cog, CheckCircle } from 'lucide-react';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { scan } from "react-scan";

const isDev = import.meta.env.DEV;
if (isDev) {
  scan({ enabled: true, log: true, showToolbar: true });
}
// 添加CSS属性类型
const dragStyle = {
  WebkitAppRegion: 'drag'
} as React.CSSProperties;

const noDragStyle = {
  WebkitAppRegion: 'no-drag'
} as React.CSSProperties;

function AppContent() {
  const { t } = useTranslation();
  const { isSettingsOpen, setIsSettingsOpen } = useSettings();
  const [isMaximized, setIsMaximized] = useState(false);
  const [message, setMessage] = useState<{show: boolean; text: string}>({ show: false, text: '' });

  // 添加最大化状态监听
  useEffect(() => {
    const handleMaximize = () => setIsMaximized(true);
    const handleUnmaximize = () => setIsMaximized(false);

    window.electron?.onMaximize(handleMaximize);
    window.electron?.onUnmaximize(handleUnmaximize);

    return () => {
      window.electron?.removeMaximize(handleMaximize);
      window.electron?.removeUnmaximize(handleUnmaximize);
    };
  }, []);


  const showMessage = (text: string) => {
    setMessage({ show: true, text });
    setTimeout(() => {
      setMessage({ show: false, text: '' });
    }, 1500);
  };

  return (
    <div
      className="flex flex-col h-screen"
    >
      {/* 自定义标题栏 */}
      <div
        className="flex justify-between items-center px-4 h-8 bg-gray-300 select-none"
        style={dragStyle}
        onDoubleClick={() => window.electron?.maximize()}
      >
        <div className="text-gray-700 text-bold">{t('title')}</div>
        <div className="flex items-center space-x-2" style={noDragStyle}>
          <button
            onClick={() => window.electron?.minimize()}
            className="p-1 rounded hover:bg-gray-500"
            title={t('minimize')}
          >
            <Minus className="w-4 h-4 text-gray-700" />
          </button>
          <button
            onClick={() => window.electron?.maximize()}
            className="p-1 rounded hover:bg-gray-500"
            title={t('maximize')}
          >
            {isMaximized ? (
              <CopyIcon className="w-4 h-4 text-gray-700" />
            ) : (
              <Square className="w-4 h-4 text-gray-700" />
            )}
          </button>
          <button
            onClick={() => window.electron?.close()}
            className="p-1 rounded hover:bg-red-500"
            title={t('close')}
          >
            <X className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex relative h-[calc(100vh-32px)]">

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSuccess={() => {
            setIsSettingsOpen(false)
            showMessage(t('settingsSaved'))
          }}
        />

        {/* 消息提示 */}
        {message.show && (
          <div className="fixed top-20 left-1/2 z-50 transform -translate-x-1/2">
            <div className="flex gap-2 items-center p-4 rounded-lg shadow-lg backdrop-blur-sm bg-white/90">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-800">{message.text}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </SettingsProvider>
  );
}

export default App;