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
            message: `Yedek başarıyla yüklendi! (${res.count} işlem aktarıldı)`,
          });
        } else {
          setImportStatus({
            type: 'error',
            message: `Hata: ${res.error || 'Dosya okunamadı.'}`,
          });
        }
      } catch (err) {
        setImportStatus({
          type: 'error',
          message: 'Geçersiz JSON dosyası.',
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
        <h3 className="text-base font-bold text-slate-900">Veri Yedekleme & Yönetim</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Verileriniz tarayıcınızda yerel olarak saklanır. Dilediğiniz zaman dışa aktarıp yedekleyebilirsiniz.
        </p>
      </div>

      {importStatus && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 animate-slide-up ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {importStatus.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{importStatus.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Export JSON */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Download className="w-4 h-4 text-emerald-600" />
              <span>JSON Tam Yedek İndir</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              İşlemler, yatırımlar ve tüm ayarlarınızı tek dosya halinde indirir.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={exportJSON}>
            Yedeği İndir (.json)
          </Button>
        </div>

        {/* Export CSV */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Excel / CSV Dökümü Al</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              İşlem geçmişinizi Microsoft Excel ve Google E-Tablolar uyumlu CSV formatında aktarır.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={exportCSV}>
            Tabloyu İndir (.csv)
          </Button>
        </div>

        {/* Import JSON */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Yedekten Geri Yükle</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Daha önce indirdiğiniz bir .json yedek dosyasını geri yükleyin.
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
              Dosya Seç (.json)
            </Button>
          </div>
        </div>

        {/* Sample Data */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              <span>Örnek Verileri Yükle</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Uygulamayı test etmek için gerçekçi örnek finansal veriler yükler.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              reloadSampleData();
              setImportStatus({
                type: 'success',
                message: 'Örnek demo verileri başarıyla yüklendi.',
              });
            }}
          >
            Örnekleri Yükle
          </Button>
        </div>
      </div>

      {/* Danger Zone: Clear all */}
      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider">Tehlikeli Bölge</h4>
          <p className="text-xs text-slate-500">Tüm işlemleri, yatırımları ve verileri kalıcı olarak siler.</p>
        </div>
        <Button
          size="sm"
          variant="danger"
          icon={Trash2}
          onClick={() => setShowClearConfirm(true)}
        >
          Tüm Verileri Sıfırla
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
            message: 'Tüm veriler başarıyla sıfırlandı.',
          });
        }}
        title="Tüm Verileri Sıfırla"
        message="Tüm gelir-gider kayıtlarınız, yatırımlarınız ve kategorileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz!"
        confirmText="Evet, Hepsini Sil"
      />
    </Card>
  );
}
