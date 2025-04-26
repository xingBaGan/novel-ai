import React, { useState, useEffect } from 'react';
import { X, GitBranch, Upload, RotateCw, Download, RefreshCw } from 'lucide-react';
import { useLocale } from '../contexts/LanguageContext';
import { LanguageSwitch } from './LanguageSwitch';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Template {
  name: string;
  url: string;
}

export function SettingsModal({ isOpen, onClose, onSuccess }: SettingsModalProps) {
  const { t } = useLocale();
  const [repoUrl, setRepoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<string>();


  useEffect(() => {
    // Load saved settings
    window.electron?.getSettings().then((settings: any) => {
      setRepoUrl(settings.repoUrl || '');
      setSelectedTemplate(settings.selectedTemplate || '');
    });
  }, []);


  // 定义一个异步函数handleSave，用于保存设置
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await window.electron?.saveSettings({
        repoUrl,
        selectedTemplate
      });
      onSuccess();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/20"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[480px] rounded-2xl overflow-hidden">
        {/* Frosted glass effect */}
        <div className="absolute inset-0 backdrop-blur-xl bg-white/30" />

        {/* Content */}
        <div className="relative p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4 items-center">
              <h2 className="text-xl font-semibold text-gray-900">{t('settings.title')}</h2>
              <LanguageSwitch />
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full transition-colors hover:bg-black/5"
              title={t('settings.close')}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>



          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? t('settings.saving') : t('settings.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}