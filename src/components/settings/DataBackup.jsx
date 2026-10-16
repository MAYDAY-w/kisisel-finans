import React, { useState, useRef } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export function DataBackup() {
  const {
    exportJSON,
    exportCSV,
    importFromJSON,
    resetAllData,
    reloadSampleData,
    t,
  } = useFinance();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const res = importFromJSON(text);
        if (res.success) {
          setImportStatus({
            type: 'success',
            message: t('dataBackup.importSuccess', { count: res.count }),
          });
        } else {
          setImportStatus({
            type: 'error',
            message: t('dataBackup.importError', { error: res.error || 'Dosya okunamadı' }),
          });
        }
      } catch (err) {
        setImportStatus({
          type: 'error',
          message: t('dataBackup.invalidJson'),
        });
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsText(file);
  };

  return (
    <Card padding="p-5" className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('dataBackup.title')}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t('dataBackup.subtitle')}
        </p>
      </div>

      {importStatus && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 animate-slide-up ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Export JSON */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
              <Download className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>{t('dataBackup.jsonExportTitle')}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('dataBackup.jsonExportDesc')}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={exportJSON}>
            {t('dataBackup.jsonExportBtn')}
          </Button>
        </div>

        {/* Export CSV */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
              <FileSpreadsheet className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>{t('dataBackup.csvExportTitle')}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('dataBackup.csvExportDesc')}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={exportCSV}>
            {t('dataBackup.csvExportBtn')}
          </Button>
        </div>

        {/* Import JSON */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
              <Upload className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span>{t('dataBackup.jsonImportTitle')}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('dataBackup.jsonImportDesc')}
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="json-file-upload"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('dataBackup.jsonImportBtn')}
            </Button>
          </div>
        </div>

        {/* Sample Data */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
              <RefreshCw className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{t('dataBackup.sampleDataTitle')}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('dataBackup.sampleDataDesc')}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              reloadSampleData();
              setImportStatus({
                type: 'success',
                message: t('dataBackup.sampleSuccess'),
              });
            }}
          >
            {t('dataBackup.sampleDataBtn')}
          </Button>
        </div>
      </div>

      {/* Danger Zone: Clear all */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">{t('dataBackup.dangerZoneTitle')}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('dataBackup.dangerZoneDesc')}</p>
        </div>
        <Button
          size="sm"
          variant="danger"
          icon={Trash2}
          onClick={() => setShowClearConfirm(true)}
        >
          {t('dataBackup.resetAllBtn')}
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          resetAllData();
          setImportStatus({
            type: 'success',
            message: t('dataBackup.resetSuccess'),
          });
        }}
        title={t('dataBackup.resetConfirmTitle')}
        message={t('dataBackup.resetConfirmMsg')}
        confirmText={t('dataBackup.resetConfirmBtn')}
      />
    </Card>
  );
}
