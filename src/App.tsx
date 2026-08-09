import React, { useState, useEffect } from 'react';
import { ReviewRecord } from './types';
import { SAMPLE_RECORDS } from './data/sampleData';
import { exportToCSV } from './utils/statsCalculator';
import { Header } from './components/Header';
import { SpreadsheetTable } from './components/SpreadsheetTable';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { RecordModal } from './components/RecordModal';
import { AIReportModal } from './components/AIReportModal';
import { ImageScannerModal } from './components/ImageScannerModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ResetConfirmModal } from './components/ResetConfirmModal';

const STORAGE_KEY = 'referee_irs_review_records_v3';

export default function App() {
  const [records, setRecords] = useState<ReviewRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load records from localStorage:', e);
    }
    return [];
  });

  const [activeView, setActiveView] = useState<'table' | 'analytics'>('table');
  
  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReviewRecord | null>(null);
  
  const [deletingRecord, setDeletingRecord] = useState<ReviewRecord | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const [isAIReportOpen, setIsAIReportOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Save to localStorage when records change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save records to localStorage:', e);
    }
  }, [records]);

  // Record Handlers
  const handleSaveRecord = (record: ReviewRecord) => {
    setRecords((prev) => {
      const existsIndex = prev.findIndex((r) => r.id === record.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = record;
        return updated;
      } else {
        return [record, ...prev];
      }
    });
  };

  const handlePromptDelete = (record: ReviewRecord) => {
    setDeletingRecord(record);
  };

  const handleConfirmDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setDeletingRecord(null);
  };

  const handleEditRecord = (record: ReviewRecord) => {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleOpenNewRecord = () => {
    setEditingRecord(null);
    setIsRecordModalOpen(true);
  };

  const handleConfirmResetSampleData = () => {
    setRecords(SAMPLE_RECORDS);
    setIsResetModalOpen(false);
  };

  const handleImportRecords = (newRecords: ReviewRecord[]) => {
    setRecords((prev) => [...newRecords, ...prev]);
  };

  const handleExportCSV = () => {
    exportToCSV(records);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* App Header */}
      <Header
        onOpenNewRecord={handleOpenNewRecord}
        onResetSampleData={() => setIsResetModalOpen(true)}
        onExportCSV={handleExportCSV}
        onOpenAIReport={() => setIsAIReportOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        totalRecords={records.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeView === 'table' ? (
          <SpreadsheetTable
            records={records}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handlePromptDelete}
            onOpenNewRecord={handleOpenNewRecord}
          />
        ) : (
          <AnalyticsDashboard records={records} />
        )}

      </main>

      {/* App Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Control de Revisiones de Coaches y Árbitros - Sistema IRS</p>
          <p className="text-slate-600">
            Optimizado para partidos FIBA, NBA y ligas profesionales
          </p>
        </div>
      </footer>

      {/* Modals */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSave={handleSaveRecord}
        initialData={editingRecord}
      />

      <DeleteConfirmModal
        isOpen={!!deletingRecord}
        record={deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
      />

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmResetSampleData}
      />

      <AIReportModal
        isOpen={isAIReportOpen}
        onClose={() => setIsAIReportOpen(false)}
        records={records}
      />

      <ImageScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onImportRecords={handleImportRecords}
      />

    </div>
  );
}
