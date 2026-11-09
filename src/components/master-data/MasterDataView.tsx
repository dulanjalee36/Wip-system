/**
 * UNIMAK WIP STOCK MANAGEMENT SYSTEM
 * Master Data Management Module
 * Jobs, Items, Sheet Sizes, Coating Types, Side Configurations, and Factory Lines
 */

import React, { useState } from 'react';
import {
  Database,
  Plus,
  Briefcase,
  Boxes,
  Maximize2,
  Layers,
  Building2,
  CheckCircle2,
  XCircle,
  Edit2,
  Lock,
  Search,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  JobMaster,
  ItemMaster,
  SheetSizeMaster,
  CoatingTypeMaster,
  FactoryMaster,
} from '../../types';

export const MasterDataView: React.FC = () => {
  const {
    jobs,
    items,
    sheetSizes,
    coatingTypes,
    factories,
    saveJob,
    saveItem,
    saveSheetSize,
    saveCoatingType,
    saveFactory,
    currentUser,
  } = useApp();

  const isAdmin = currentUser.role === 'Administrator';

  // Tabs: 'jobs' | 'items' | 'sizes' | 'coatings' | 'factories'
  const [activeTab, setActiveTab] = useState<'jobs' | 'items' | 'sizes' | 'coatings' | 'factories'>('jobs');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobMaster | null>(null);

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemMaster | null>(null);

  const [showSizeModal, setShowSizeModal] = useState(false);
  const [editingSize, setEditingSize] = useState<SheetSizeMaster | null>(null);

  const [showCoatingModal, setShowCoatingModal] = useState(false);
  const [editingCoating, setEditingCoating] = useState<CoatingTypeMaster | null>(null);

  const [showFactoryModal, setShowFactoryModal] = useState(false);
  const [editingFactory, setEditingFactory] = useState<FactoryMaster | null>(null);

  // Forms
  const [jobForm, setJobForm] = useState({
    jobNumber: '',
    jobName: '',
    customerName: '',
    description: '',
    active: true,
  });

  const [itemForm, setItemForm] = useState({
    itemCode: '',
    itemName: '',
    sheetSize: sheetSizes[0]?.size || '',
    unitOfMeasure: 'Sheets',
    description: '',
    active: true,
  });

  const [sizeForm, setSizeForm] = useState({
    size: '',
    description: '',
    active: true,
  });

  const [coatingForm, setCoatingForm] = useState({
    code: '',
    name: '',
    description: '',
    active: true,
  });

  const [factoryForm, setFactoryForm] = useState({
    code: '',
    name: '',
    isPrintingLine: false,
    description: '',
    active: true,
  });

  // Handlers for Jobs
  const handleOpenJobModal = (job?: JobMaster) => {
    if (job) {
      setEditingJob(job);
      setJobForm({
        jobNumber: job.jobNumber,
        jobName: job.jobName,
        customerName: job.customerName || '',
        description: job.description || '',
        active: job.active,
      });
    } else {
      setEditingJob(null);
      setJobForm({
        jobNumber: '',
        jobName: '',
        customerName: '',
        description: '',
        active: true,
      });
    }
    setShowJobModal(true);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobForm.jobNumber.trim() || !jobForm.jobName.trim()) return;

    saveJob({
      id: editingJob?.id || `job-${Date.now()}`,
      jobNumber: jobForm.jobNumber.trim(),
      jobName: jobForm.jobName.trim(),
      customerName: jobForm.customerName.trim() || undefined,
      description: jobForm.description.trim() || undefined,
      active: jobForm.active,
      createdAt: editingJob?.createdAt || new Date().toISOString(),
    });
    setShowJobModal(false);
  };

  // Handlers for Items
  const handleOpenItemModal = (item?: ItemMaster) => {
    if (item) {
      setEditingItem(item);
      setItemForm({
        itemCode: item.itemCode,
        itemName: item.itemName,
        sheetSize: item.sheetSize,
        unitOfMeasure: item.unitOfMeasure,
        description: item.description || '',
        active: item.active,
      });
    } else {
      setEditingItem(null);
      setItemForm({
        itemCode: '',
        itemName: '',
        sheetSize: sheetSizes[0]?.size || '0.20 × 710 × 910',
        unitOfMeasure: 'Sheets',
        description: '',
        active: true,
      });
    }
    setShowItemModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.itemCode.trim() || !itemForm.itemName.trim()) return;

    saveItem({
      id: editingItem?.id || `item-${Date.now()}`,
      itemCode: itemForm.itemCode.trim().toUpperCase(),
      itemName: itemForm.itemName.trim(),
      sheetSize: itemForm.sheetSize,
      unitOfMeasure: itemForm.unitOfMeasure || 'Sheets',
      description: itemForm.description.trim() || undefined,
      active: itemForm.active,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    });
    setShowItemModal(false);
  };

  // Handlers for Sheet Sizes
  const handleOpenSizeModal = (size?: SheetSizeMaster) => {
    if (size) {
      setEditingSize(size);
      setSizeForm({ size: size.size, description: size.description || '', active: size.active });
    } else {
      setEditingSize(null);
      setSizeForm({ size: '', description: '', active: true });
    }
    setShowSizeModal(true);
  };

  const handleSaveSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeForm.size.trim()) return;
    saveSheetSize({
      id: editingSize?.id || `sz-${Date.now()}`,
      size: sizeForm.size.trim(),
      description: sizeForm.description.trim() || undefined,
      active: sizeForm.active,
    });
    setShowSizeModal(false);
  };

  // Handlers for Coating Types
  const handleOpenCoatingModal = (coating?: CoatingTypeMaster) => {
    if (coating) {
      setEditingCoating(coating);
      setCoatingForm({
        code: coating.code,
        name: coating.name,
        description: coating.description || '',
        active: coating.active,
      });
    } else {
      setEditingCoating(null);
      setCoatingForm({ code: '', name: '', description: '', active: true });
    }
    setShowCoatingModal(true);
  };

  const handleSaveCoating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coatingForm.name.trim()) return;
    saveCoatingType({
      id: editingCoating?.id || `coat-${Date.now()}`,
      code: (coatingForm.code.trim() || coatingForm.name.slice(0, 3)).toUpperCase(),
      name: coatingForm.name.trim(),
      description: coatingForm.description.trim() || undefined,
      active: coatingForm.active,
    });
    setShowCoatingModal(false);
  };

  // Handlers for Factories
  const handleOpenFactoryModal = (factory?: FactoryMaster) => {
    if (factory) {
      setEditingFactory(factory);
      setFactoryForm({
        code: factory.code,
        name: factory.name,
        isPrintingLine: factory.isPrintingLine,
        description: factory.description || '',
        active: factory.active,
      });
    } else {
      setEditingFactory(null);
      setFactoryForm({ code: '', name: '', isPrintingLine: false, description: '', active: true });
    }
    setShowFactoryModal(true);
  };

  const handleSaveFactory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryForm.name.trim()) return;
    saveFactory({
      id: editingFactory?.id || `fac-${Date.now()}`,
      code: (factoryForm.code.trim() || factoryForm.name.slice(0, 3)).toUpperCase(),
      name: factoryForm.name.trim(),
      isPrintingLine: factoryForm.isPrintingLine,
      description: factoryForm.description.trim() || undefined,
      active: factoryForm.active,
    });
    setShowFactoryModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Master Data Management
            </h1>
            {!isAdmin && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center">
                <Lock className="w-3 h-3 mr-1" /> Read Only
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain jobs, items, sheet dimensions, coating formulations, and manufacturing plant lines.
          </p>
        </div>

        {/* Global Add button if admin */}
        {isAdmin && (
          <div className="flex items-center space-x-2">
            {activeTab === 'jobs' && (
              <button
                onClick={() => handleOpenJobModal()}
                className="flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Job
              </button>
            )}
            {activeTab === 'items' && (
              <button
                onClick={() => handleOpenItemModal()}
                className="flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Item
              </button>
            )}
            {activeTab === 'sizes' && (
              <button
                onClick={() => handleOpenSizeModal()}
                className="flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Sheet Size
              </button>
            )}
            {activeTab === 'coatings' && (
              <button
                onClick={() => handleOpenCoatingModal()}
                className="flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Coating Type
              </button>
            )}
            {activeTab === 'factories' && (
              <button
                onClick={() => handleOpenFactoryModal()}
                className="flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Add Factory Line
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 space-x-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center py-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'jobs'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Jobs ({jobs.length})
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center py-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'items'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Boxes className="w-4 h-4 mr-2" />
          Items ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('sizes')}
          className={`flex items-center py-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'sizes'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Sheet Sizes ({sheetSizes.length})
        </button>

        <button
          onClick={() => setActiveTab('coatings')}
          className={`flex items-center py-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'coatings'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4 mr-2" />
          Coating Types ({coatingTypes.length})
        </button>

        <button
          onClick={() => setActiveTab('factories')}
          className={`flex items-center py-3 px-1 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'factories'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4 mr-2" />
          Factories & Lines ({factories.length})
        </button>
      </div>

      {/* TAB 1: JOBS */}
      {activeTab === 'jobs' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Production Job Orders
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Unique Job Codes linked across coating, printing and QA
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Job Number</th>
                  <th className="px-4 py-3">Job Name</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No jobs registered. Click "Add Job" to create your first production job.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {job.jobNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {job.jobName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {job.customerName || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {job.description || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            job.active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {job.active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1 text-slate-400" /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '-'}
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleOpenJobModal(job)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Edit Job"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ITEMS */}
      {activeTab === 'items' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Item SKU Directory
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Sheet specifications & standard dimensions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Item Code</th>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3">Default Sheet Size</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No items registered. Click "Add Item" to configure item master.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {item.itemCode}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {item.itemName}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                        {item.sheetSize}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{item.unitOfMeasure}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {item.description || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            item.active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleOpenItemModal(item)}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SHEET SIZES */}
      {activeTab === 'sizes' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Sheet Dimensions (Thickness × Width × Length)
            </h3>
            <span className="text-xs text-slate-500">Configured Sheet Sizes for Dropdown Menus</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Size Specification</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sheetSizes.map((size) => (
                  <tr key={size.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">
                      {size.size}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{size.description || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          size.active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {size.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenSizeModal(size)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COATING TYPES */}
      {activeTab === 'coatings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Coating Formulations & Types
            </h3>
            <span className="text-xs text-slate-500">
              White, Size, Gold, LPVC, NPVC, Silver, Black
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Coating Type Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {coatingTypes.map((cType) => (
                  <tr key={cType.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {cType.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {cType.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{cType.description || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          cType.active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cType.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenCoatingModal(cType)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: FACTORIES */}
      {activeTab === 'factories' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Factories & Manufacturing Departments
            </h3>
            <span className="text-xs text-slate-500">
              Crown Line, Plant 2, Plant 3, Printing Line
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Factory / Department Name</th>
                  <th className="px-4 py-3">Printing Line WIP Route?</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Status</th>
                  {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {factories.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {fac.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                      {fac.name}
                    </td>
                    <td className="px-4 py-3">
                      {fac.isPrintingLine ? (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 font-bold text-[10px]">
                          Yes (Generates Printing WIP)
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">No (Final Factory Issue)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fac.description || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          fac.active
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {fac.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenFactoryModal(fac)}
                          className="p-1 rounded text-slate-400 hover:text-blue-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* JOB MODAL */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSaveJob}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {editingJob ? 'Edit Job Master' : 'Add New Job Master'}
              </h3>
              <button
                type="button"
                onClick={() => setShowJobModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Number / Code * (Unique)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JB-2026-088"
                  value={jobForm.jobNumber}
                  onChange={(e) => setJobForm({ ...jobForm, jobNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Job Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lion Beer Crown Caps 28mm"
                  value={jobForm.jobName}
                  onChange={(e) => setJobForm({ ...jobForm, jobName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ceylon Brewery PLC"
                  value={jobForm.customerName}
                  onChange={(e) => setJobForm({ ...jobForm, customerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional order specifications or notes..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="jobActive"
                  checked={jobForm.active}
                  onChange={(e) => setJobForm({ ...jobForm, active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="jobActive" className="font-semibold text-slate-700 dark:text-slate-300">
                  Active (Eligible for new receiving and issues)
                </label>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowJobModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save Job
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ITEM MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSaveItem}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {editingItem ? 'Edit Item Master' : 'Add New Item SKU'}
              </h3>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Code * (Unique SKU)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TP-CRN-020"
                  value={itemForm.itemCode}
                  onChange={(e) => setItemForm({ ...itemForm, itemCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tinplate Crown Cork 0.20mm"
                  value={itemForm.itemName}
                  onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sheet Size
                  </label>
                  <select
                    value={itemForm.sheetSize}
                    onChange={(e) => setItemForm({ ...itemForm, sheetSize: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {sheetSizes.map((s) => (
                      <option key={s.id} value={s.size}>
                        {s.size}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    value={itemForm.unitOfMeasure}
                    onChange={(e) => setItemForm({ ...itemForm, unitOfMeasure: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Product specs..."
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="itemActive"
                  checked={itemForm.active}
                  onChange={(e) => setItemForm({ ...itemForm, active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="itemActive" className="font-semibold text-slate-700 dark:text-slate-300">
                  Active (Allowed in transactions)
                </label>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SHEET SIZE MODAL */}
      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSaveSize}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Configure Sheet Size
              </h3>
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Size String * (e.g. 0.20 × 710 × 910)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Thickness × Width × Length"
                  value={sizeForm.size}
                  onChange={(e) => setSizeForm({ ...sizeForm, size: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Standard Crown Tinplate"
                  value={sizeForm.description}
                  onChange={(e) => setSizeForm({ ...sizeForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sizeActive"
                  checked={sizeForm.active}
                  onChange={(e) => setSizeForm({ ...sizeForm, active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="sizeActive" className="font-semibold text-slate-700 dark:text-slate-300">
                  Active
                </label>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowSizeModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save Size
              </button>
            </div>
          </form>
        </div>
      )}

      {/* COATING TYPE MODAL */}
      {showCoatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSaveCoating}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Coating Formulation
              </h3>
              <button
                type="button"
                onClick={() => setShowCoatingModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Coating Name * (e.g. White, Size, Gold, LPVC, NPVC, Silver, Black)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Coating formulation name"
                  value={coatingForm.name}
                  onChange={(e) => setCoatingForm({ ...coatingForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. GLD"
                  value={coatingForm.code}
                  onChange={(e) => setCoatingForm({ ...coatingForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Protective lacquer, internal enamel, etc."
                  value={coatingForm.description}
                  onChange={(e) => setCoatingForm({ ...coatingForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="coatingActive"
                  checked={coatingForm.active}
                  onChange={(e) => setCoatingForm({ ...coatingForm, active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="coatingActive" className="font-semibold text-slate-700 dark:text-slate-300">
                  Active (Allowed in coating multi-select)
                </label>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCoatingModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save Coating Type
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FACTORY MODAL */}
      {showFactoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSaveFactory}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-850">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Factory / Production Department
              </h3>
              <button
                type="button"
                onClick={() => setShowFactoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Factory Name * (e.g. Crown Line, Plant 2, Plant 3, Printing Line)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Factory name"
                  value={factoryForm.name}
                  onChange={(e) => setFactoryForm({ ...factoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Short Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CRN"
                  value={factoryForm.code}
                  onChange={(e) => setFactoryForm({ ...factoryForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase"
                />
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                <input
                  type="checkbox"
                  id="factoryIsPrinting"
                  checked={factoryForm.isPrintingLine}
                  onChange={(e) => setFactoryForm({ ...factoryForm, isPrintingLine: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="factoryIsPrinting" className="font-semibold text-blue-900 dark:text-blue-300">
                  Is Printing Line? (Generates Printing WIP & Eligible for Quality Returns)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="facActive"
                  checked={factoryForm.active}
                  onChange={(e) => setFactoryForm({ ...factoryForm, active: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <label htmlFor="facActive" className="font-semibold text-slate-700 dark:text-slate-300">
                  Active
                </label>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowFactoryModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
              >
                Save Factory
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
