import { useState, useEffect } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { Minus, Square, X, CopyIcon, CheckCircle } from 'lucide-react';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { CommentsProvider } from './contexts/CommentsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { scan } from "react-scan";
import { InstallStatus } from '../types';
import InstallConfirmDialog from './components/InstallConfirmDialog';
import MessageBox from './components/MessageBox';
import NovelEditor from "./components/NovelEditor";
import Comments from "./components/Comments/index";

const isDev = import.meta.env.DEV;
if (isDev) {
  scan({ enabled: true, log: true, showToolbar: true });
}

function AppContent() {
  const { t } = useTranslation();
  const { isSettingsOpen, setIsSettingsOpen } = useSettings();
  const [isMaximized, setIsMaximized] = useState(false);
  const [message, setMessage] = useState<{ show: boolean; text: string }>({ show: false, text: '' });
  const [, setInstallStatus] = useState<InstallStatus>(InstallStatus.Installed);
  const [showInstallConfirm, setShowInstallConfirm] = useState<{
    isOpen: boolean;
    checkResult: any;
  } | null>(null);
  const [messageBox, setMessageBox] = useState<{
    isOpen: boolean;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>({
    isOpen: false,
    message: '',
    type: 'info'
  });

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

  // useEffect(() => {
  //   const checkAndPromptInstall = async () => {
  //     try {
  //       const checkResult = await window.electron.checkEnvironment();
  //       if (checkResult.needsInstall) {
  //         setShowInstallConfirm({
  //           isOpen: true,
  //           checkResult
  //         });
  //         return;
  //       }
  //       setMessageBox({
  //         isOpen: true,
  //         message: t('environmentCheckComplete'),
  //         type: 'success'
  //       });
  //     } catch (error) {
  //       console.error('Environment check failed:', error);
  //       setMessageBox({
  //         isOpen: true,
  //         message: t('environmentCheckFailed'),
  //         type: 'error'
  //       });
  //     }
  //   };
  //   checkAndPromptInstall()
  // }, [])


  // Message box close
  const messageBoxClose = () => {
    setMessageBox(prev => ({ ...prev, isOpen: false }));
  };

  // Install environment
  const handleInstallConfirm = async () => {
    try {
      setInstallStatus(InstallStatus.Installing);
      setShowInstallConfirm(null);
      await window.electron.installEnvironment();
    } catch (error) {
      console.error('Installation failed:', error);
      setMessageBox({
        isOpen: true,
        message: t('installationFailed', { error: String(error) }),
        type: 'error'
      });
    } finally {
      setInstallStatus(InstallStatus.Installed);
      const installResult = await window.electron.checkEnvironment();
      if (!installResult.needsInstall) {
        setMessageBox({
          isOpen: true,
          message: t('installationComplete'),
          type: 'success'
        });
      } else {
        setMessageBox({
          isOpen: true,
          message: t('restartAgainAndInstall'),
          type: 'error'
        });
      }
    }
  };

  const showMessage = (text: string) => {
    setMessage({ show: true, text });
    setTimeout(() => {
      setMessage({ show: false, text: '' });
    }, 1500);
  };

  return (
    <>
      {/* 自定义标题栏 */}
      <div
        className="flex justify-between items-center px-4 h-8 bg-gray-300 select-none fixed top-0 left-0 right-0 z-10 w-full"
        onDoubleClick={() => window.electron?.maximize()}
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <div className="text-gray-700 text-bold">{t('title')}</div>
        <div className="flex items-center space-x-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
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

      <div
        className="flex flex-col h-[calc(100vh-48px)] relative z-1 mt-12"
      >

        {/* 主内容区域 */}
        <>
          <NovelEditor />
          <Comments />
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
        </>

        {/* 安装环境确认 */}
        {showInstallConfirm && (
          <InstallConfirmDialog
            isOpen={showInstallConfirm.isOpen}
            onCancel={() => setShowInstallConfirm(null)}
            onConfirm={handleInstallConfirm}
            checkResult={showInstallConfirm.checkResult}
          />
        )}

        <MessageBox
          isOpen={messageBox.isOpen}
          onClose={messageBoxClose}
          message={messageBox.message}
          type={messageBox.type}
        />
      </div>
    </>
  );
}

export function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <CommentsProvider>
          <AppContent />
        </CommentsProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}

export default App;