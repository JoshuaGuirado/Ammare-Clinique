import { useState, useMemo } from 'react';
import { useAppContext } from '../store';
import { Kit } from '../types';
import Header from '../components/Header';
import { Pencil, Trash2, Plus, Save, X, LogIn, Download, FileSpreadsheet, FileText, Share2, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { categories, initialKits } from '../data';
import { List } from 'react-window';
import * as XLSX from 'xlsx';

export default function Admin() {
  const { kits, categories, updateKit, removeKit, addKit, addCategory, removeCategory, products, updateProduct, removeProduct, addProduct } = useAppContext();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('ammare_admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  
  const [editingKitId, setEditingKitId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Kit | null>(null);
  const [itemsInput, setItemsInput] = useState('');
  const [sizesInput, setSizesInput] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  
  const [activeTab, setActiveTab] = useState<'kits' | 'individuals'>('kits');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [shareCopied, setShareCopied] = useState(false);

  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ammareadmin') {
      setIsAuthenticated(true);
      localStorage.setItem('ammare_admin_auth', 'true');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ammare_admin_auth');
  };

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const currentList = useMemo(() => {
    return kits.filter(k => activeTab === 'kits' ? !k.isIndividual : k.isIndividual);
  }, [kits, activeTab]);

  const toggleAllSelection = () => {
    const currentIds = currentList.map(k => k.id);
    const allSelected = currentIds.every(id => selectedItems.includes(id));
    
    if (allSelected) {
      setSelectedItems(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      setSelectedItems(prev => {
        const newItems = [...prev];
        currentIds.forEach(id => {
          if (!newItems.includes(id)) newItems.push(id);
        });
        return newItems;
      });
    }
  };

  const handleShareSelected = () => {
    if (selectedItems.length === 0) return;
    const url = new URL(window.location.href);
    url.pathname = '/';
    url.search = '';
    url.searchParams.set('items', selectedItems.join('_'));
    url.searchParams.set('theme', 'exclusive');
    
    const initialKitIds = new Set(initialKits.map(k => k.id));
    const customSelectedKits = kits.filter(k => selectedItems.includes(k.id) && !initialKitIds.has(k.id));
    if (customSelectedKits.length > 0) {
      try {
        // Strip large base64 image strings from products/kits to avoid HTTP 431 errors in URL
        const cleanedSelectedKits = customSelectedKits.map(kit => {
          const cleaned = { ...kit };
          if (cleaned.imageUrl && cleaned.imageUrl.startsWith('data:')) {
            cleaned.imageUrl = '';
          }
          if (cleaned.galleryUrls) {
            cleaned.galleryUrls = cleaned.galleryUrls.map(url => url.startsWith('data:') ? '' : url).filter(Boolean);
          }
          return cleaned;
        });
        const encoded = btoa(encodeURIComponent(JSON.stringify(cleanedSelectedKits)));
        url.searchParams.set('c', encoded);
      } catch (e) {
        console.error("Error encoding custom kits", e);
      }
    }
    
    navigator.clipboard.writeText(url.toString());
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const getExportData = () => {
    const isKits = activeTab === 'kits';
    const listToExport = kits.filter(k => isKits ? !k.isIndividual : k.isIndividual);

    const headers = isKits ? [
      'ID',
      'Nome',
      'Categoria',
      'Descrição Curta',
      'Descrição Completa',
      'Itens',
      'Status'
    ] : [
      'ID',
      'Nome',
      'Categoria',
      'Descrição Curta',
      'Descrição Completa',
      'Tamanhos',
      'Cores',
      'Status'
    ];

    const rows = listToExport.map(kit => isKits ? [
      kit.id,
      kit.name,
      kit.category,
      kit.shortDescription,
      kit.fullDescription,
      kit.items ? kit.items.map(i => i.name).join(' | ') : '',
      kit.isActive !== false ? 'Ativo' : 'Desativado'
    ] : [
      kit.id,
      kit.name,
      kit.category,
      kit.shortDescription,
      kit.fullDescription,
      kit.sizes ? kit.sizes.join(' | ') : '',
      kit.colors ? kit.colors.join(' | ') : '',
      kit.isActive !== false ? 'Ativo' : 'Desativado'
    ]);
    
    const typeLabel = isKits ? 'kits' : 'produtos_individuais';
    return { headers, rows, typeLabel };
  };

  const handleExportCSV = () => {
    const { headers, rows, typeLabel } = getExportData();
    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    // Add BOM for UTF-8 to work correctly with Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ammare_estoque_${typeLabel}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const { headers, rows, typeLabel } = getExportData();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, activeTab === 'kits' ? "Kits" : "Produtos");
    XLSX.writeFile(workbook, `ammare_estoque_${typeLabel}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const initEditForm = (kit: Kit) => {
    setEditingKitId(kit.id);
    setEditForm({ ...kit });
    setItemsInput((kit.items || []).map(i => i.name).join('\n'));
    setSizesInput((kit.sizes || []).join(', '));
    setColorsInput((kit.colors || []).join(', '));
  };

  const handleEditClick = (kit: Kit) => {
    initEditForm(kit);
  };

  const handleAddClick = () => {
    const newKit: Kit = {
      id: `kit-${crypto.randomUUID()}`,
      name: '',
      shortDescription: '',
      fullDescription: '',
      category: categories.length > 0 ? categories[0] : 'Todos',
      imageUrl: '',
      galleryUrls: [],
      items: [],
      sizes: [],
      colors: [],
      isActive: true,
      isIndividual: activeTab === 'individuals'
    };
    initEditForm(newKit);
  };

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setUploadError('A imagem é muito grande. Escolha uma imagem de até 2MB.');
      return;
    }
    setUploadError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (editForm) {
        setEditForm({ ...editForm, imageUrl: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        setUploadError('Uma ou mais imagens da galeria excedem 2MB.');
        return;
      }
    }
    setUploadError(null);

    const newUrls: string[] = [];
    let loaded = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newUrls.push(reader.result as string);
        loaded++;
        if (loaded === files.length) {
           setEditForm(prev => {
             if (!prev) return prev;
             return { ...prev, galleryUrls: [...(prev.galleryUrls || []), ...newUrls] };
           });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleSave = () => {
    if (editForm) {
      const parsedItems = itemsInput
        .split('\n')
        .map(i => i.trim())
        .filter(i => i.length > 0)
        .map((name, index) => ({ id: `item-${Date.now()}-${index}`, name }));
        
      const parsedSizes = sizesInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const parsedColors = colorsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const updatedKit: Kit = {
        ...editForm,
        items: parsedItems,
        sizes: parsedSizes,
        colors: parsedColors
      };

      if (kits.some(k => k.id === updatedKit.id)) {
        updateKit(updatedKit.id, updatedKit);
      } else {
        addKit(updatedKit);
      }
      setEditingKitId(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingKitId(null);
    setEditForm(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const typeName = activeTab === 'kits' ? 'kit' : 'produto';
    if (window.confirm(`Tem certeza que deseja remover este ${typeName}?`)) {
      removeKit(id);
    }
  };

  if (!isAuthenticated) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen bg-ammare-bg font-sans flex flex-col"
      >
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-ammare-white p-8 md:p-12 shadow-2xl rounded-sm"
          >
            <div className="text-center mb-8">
              <h2 className="font-serif text-3xl text-ammare-dark mb-2">Acesso Restrito</h2>
              <p className="text-ammare-dark/50 text-sm font-light">Área administrativa Ammare Clinique.</p>
              <p className="text-[0.6rem] text-ammare-dark/30 uppercase tracking-widest mt-2">(Senha: ammareadmin)</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha Administrativa"
                  className="w-full px-4 py-3 border-b border-ammare-light/50 focus:border-ammare-dark text-center tracking-widest bg-transparent outline-none transition-colors"
                />
                {loginError && <p className="text-red-500 text-xs text-center mt-2 tracking-wider">Senha incorreta.</p>}
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-ammare-dark text-ammare-white text-[0.7rem] uppercase tracking-[0.2em] hover:bg-ammare-black transition-colors flex justify-center items-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Entrar
              </button>
            </form>
          </motion.div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-ammare-bg font-sans"
    >
      <div className="no-print">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="font-serif text-3xl text-ammare-dark mb-2">Painel Administrativo</h1>
            <p className="text-ammare-dark/60 font-light text-sm">Gerencie os produtos do catálogo virtual.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-ammare-light/10 p-1 rounded-sm mr-2">
              <button 
                onClick={() => setActiveTab('kits')}
                className={`px-4 py-2 text-[0.65rem] uppercase tracking-widest transition-colors rounded-sm ${activeTab === 'kits' ? 'bg-ammare-white shadow-sm text-ammare-dark font-medium' : 'text-ammare-dark/50'}`}
              >
                Kits
              </button>
              <button 
                onClick={() => setActiveTab('individuals')}
                className={`px-4 py-2 text-[0.65rem] uppercase tracking-widest transition-colors rounded-sm ${activeTab === 'individuals' ? 'bg-ammare-white shadow-sm text-ammare-dark font-medium' : 'text-ammare-dark/50'}`}
              >
                Produtos Individuais
              </button>
            </div>

            <button onClick={() => setIsManagingCategories(true)} className="px-4 py-3 border border-ammare-light/50 text-ammare-dark/60 rounded-sm text-[0.65rem] uppercase tracking-widest hover:text-ammare-dark hover:border-ammare-dark transition-colors hidden md:block">
              Categorias
            </button>
            <button 
              onClick={handleShareSelected} 
              disabled={selectedItems.length === 0}
              className="flex items-center gap-2 px-4 py-3 border border-ammare-light/50 text-ammare-dark/60 rounded-sm text-[0.65rem] uppercase tracking-widest hover:text-ammare-dark hover:border-ammare-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-4 h-4" /> 
              {shareCopied ? 'Copiado!' : `Compartilhar (${selectedItems.length})`}
            </button>
            <div className="relative group hidden md:block">
              <button className="flex items-center gap-2 px-4 py-3 border border-ammare-light/50 text-ammare-dark/60 rounded-sm text-[0.65rem] uppercase tracking-widest hover:text-ammare-dark hover:border-ammare-dark transition-colors cursor-pointer">
                <Download className="w-4 h-4" /> Exportar
              </button>
              <div className="absolute top-full mt-2 right-0 bg-ammare-white border border-ammare-light/20 shadow-xl rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-40 z-50 flex flex-col py-1">
                <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-3 text-left text-[0.65rem] text-ammare-dark/70 uppercase tracking-widest hover:bg-ammare-bg/80 transition-colors border-b border-ammare-light/10 cursor-pointer">
                  <FileText className="w-4 h-4" /> CSV (.csv)
                </button>
                <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-3 text-left text-[0.65rem] text-ammare-dark/70 uppercase tracking-widest hover:bg-ammare-bg/80 transition-colors cursor-pointer">
                  <FileSpreadsheet className="w-4 h-4" /> Excel (.xlsx)
                </button>
                <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-3 text-left text-[0.65rem] text-ammare-dark/70 uppercase tracking-widest hover:bg-ammare-bg/80 transition-colors border-t border-ammare-light/10 cursor-pointer">
                  <FileText className="w-4 h-4" /> Relatório PDF (.pdf)
                </button>
              </div>
            </div>
            <button onClick={handleAddClick} className="flex items-center gap-2 px-6 py-3 bg-ammare-dark text-ammare-white rounded-sm text-[0.65rem] uppercase tracking-widest hover:bg-ammare-black transition-colors">
              <Plus className="w-4 h-4" />
              Adicionar {activeTab === 'kits' ? 'Kit' : 'Produto'}
            </button>
            <button onClick={handleLogout} className="px-4 py-3 border border-ammare-light/50 text-ammare-dark/60 rounded-sm text-[0.65rem] uppercase tracking-widest hover:text-ammare-dark hover:border-ammare-dark transition-colors">
              Sair
            </button>
          </div>
        </div>

        <div className="bg-ammare-white rounded-sm shadow-xl shadow-black/5 border border-ammare-light/20 overflow-hidden">
          <div className="overflow-x-auto min-w-[700px]">
            <div className="w-full text-left border-collapse flex flex-col">
              <div className="bg-ammare-bg/50 border-b border-ammare-dark/5 flex w-full items-center">
                <div className="px-6 py-4 w-16 shrink-0 flex items-center justify-center">
                  <button onClick={toggleAllSelection} className="text-ammare-dark/40 hover:text-ammare-dark transition-colors rounded-full p-1" title={selectedItems.length === currentList.length ? "Desmarcar todos" : "Marcar todos"}>
                    {selectedItems.length > 0 && selectedItems.length === currentList.length ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                </div>
                <div className="px-6 py-4 text-[0.65rem] uppercase tracking-widest text-ammare-dark/40 font-medium w-32 shrink-0">
                  {activeTab === 'kits' ? 'Kit' : 'Produto'}
                </div>
                <div className="px-6 py-4 text-[0.65rem] uppercase tracking-widest text-ammare-dark/40 font-medium flex-1">Nome & Descrição</div>
                <div className="px-6 py-4 text-[0.65rem] uppercase tracking-widest text-ammare-dark/40 font-medium w-48 shrink-0 hidden md:block">Categoria</div>
                <div className="px-6 py-4 text-[0.65rem] uppercase tracking-widest text-ammare-dark/40 font-medium w-32 shrink-0 text-right">Ações</div>
              </div>
              <div className="w-full">
                <List
                  style={{ height: 500, width: '100%' }}
                  rowCount={currentList.length}
                  rowHeight={100}
                  rowProps={{ data: currentList, onEdit: handleEditClick, onDelete: handleDelete, selectedItems, toggleSelection }}
                  rowComponent={({ index, style, data, onEdit, onDelete, selectedItems, toggleSelection }: any) => {
                    const kit = data[index];
                    const isSelected = selectedItems.includes(kit.id);
                    return (
                      <div style={style} className={`flex border-b border-ammare-light/10 hover:bg-ammare-bg/30 transition-colors w-full items-center box-border ${isSelected ? 'bg-ammare-light/10' : ''}`}>
                        <div className="px-6 py-4 w-16 shrink-0 h-full flex items-center justify-center">
                          <button onClick={() => toggleSelection(kit.id)} className={`transition-colors rounded-full p-1 ${isSelected ? 'text-ammare-dark' : 'text-ammare-dark/20 hover:text-ammare-dark/40'}`}>
                            {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className="px-6 py-4 w-32 shrink-0 h-full flex items-center">
                          {kit.imageUrl ? (
                            <div className="w-16 h-16 rounded overflow-hidden bg-ammare-light/10 shrink-0">
                              <img src={kit.imageUrl || undefined} alt={kit.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded bg-ammare-light/20 flex items-center justify-center text-[10px] text-ammare-dark/30 tracking-wider shrink-0">
                              N/A
                            </div>
                          )}
                        </div>
                        <div className="px-6 py-4 flex-1 h-full flex flex-col justify-center overflow-hidden cursor-pointer" onClick={() => toggleSelection(kit.id)}>
                          <div className="font-serif text-lg text-ammare-dark flex items-center gap-3 truncate" onClick={(e) => e.stopPropagation()}>
                            {kit.name || 'Sem nome'}
                            {kit.isActive === false && (
                              <span className="px-2 py-0.5 border border-red-500/20 text-red-600 bg-red-50 text-[0.55rem] uppercase tracking-widest rounded-sm shrink-0">
                                Desativado
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-ammare-dark/50 mt-1 truncate max-w-[250px] md:max-w-md font-light">{kit.shortDescription || 'Sem descrição'}</div>
                        </div>
                        <div className="px-6 py-4 w-48 shrink-0 h-full hidden md:flex items-center text-[0.7rem] uppercase tracking-widest text-ammare-dark/50 truncate">
                          {kit.category}
                        </div>
                        <div className="px-6 py-4 w-32 shrink-0 h-full flex items-center justify-end text-right">
                          <div className="flex justify-end gap-3">
                            <button onClick={() => onEdit(kit)} className="p-2 text-ammare-dark/40 hover:text-ammare-dark hover:bg-ammare-light/10 rounded transition-all" title="Editar">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => onDelete(kit.id, e)} className="p-2 rounded transition-all flex items-center gap-2 text-ammare-dark/40 hover:text-red-600 hover:bg-red-50" title="Excluir">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Category Management Modal */}
      {isManagingCategories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ammare-dark/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-ammare-white w-full max-w-lg shadow-2xl flex flex-col rounded-sm"
          >
            <div className="p-6 border-b border-ammare-light/30 flex justify-between items-center">
              <div>
                <h2 className="font-serif text-2xl text-ammare-dark">Categorias</h2>
              </div>
              <button onClick={() => setIsManagingCategories(false)} className="text-ammare-dark/40 hover:text-ammare-dark p-2 bg-ammare-light/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nova categoria..."
                  className="flex-1 px-4 py-3 bg-ammare-white border border-ammare-light/40 focus:outline-none focus:border-ammare-dark rounded-sm transition-colors text-sm"
                />
                <button 
                  onClick={handleAddCategory}
                  className="px-6 py-3 bg-ammare-dark text-ammare-white rounded-sm text-[0.65rem] uppercase tracking-widest hover:bg-ammare-black transition-colors"
                >
                  Adicionar
                </button>
              </div>
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-2">
                {categories.map((c, i) => (
                  <div key={`${c}-${i}`} className="flex justify-between items-center p-3 border border-ammare-light/20 rounded-sm">
                    <span className="text-sm text-ammare-dark">{c}</span>
                    <button 
                      onClick={() => c !== 'Todos' && removeCategory(c)}
                      className={`p-2 rounded ${c === 'Todos' ? 'opacity-30 cursor-not-allowed' : 'text-ammare-dark/40 hover:text-red-600 hover:bg-red-50'}`}
                      disabled={c === 'Todos'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Full Modal Edit */}
      {editingKitId && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-ammare-dark/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-ammare-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-ammare-light/30 flex justify-between items-center bg-ammare-white">
              <div>
                <h2 className="font-serif text-2xl text-ammare-dark">
                  {editingKitId.startsWith('kit-') && !kits.some(k => k.id === editingKitId) 
                    ? `Criar Novo ${editForm.isIndividual ? 'Produto' : 'Kit'}` 
                    : `Editar ${editForm.isIndividual ? 'Produto' : 'Kit'}`}
                </h2>
                <p className="text-[0.65rem] tracking-widest uppercase text-ammare-dark/40 mt-1">Configurações do Produto</p>
              </div>
              <button onClick={handleCancel} className="text-ammare-dark/40 hover:text-ammare-dark p-2 bg-ammare-light/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3">Nome do {editForm.isIndividual ? 'Produto' : 'Kit'}</label>
                  <input 
                    type="text" 
                    value={editForm.name} 
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Ex: Kit Pós Operatório Premium"
                    className="w-full px-4 py-3 bg-ammare-white border border-ammare-light/40 focus:outline-none focus:border-ammare-dark rounded-sm transition-colors text-sm mb-4"
                  />
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editForm.isActive !== false}
                      onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                      className="w-4 h-4 text-ammare-dark border-ammare-light/40 focus:ring-ammare-dark"
                    />
                    <span className="text-xs text-ammare-dark/70 tracking-wide">Produto Ativo (Exibir no catálogo)</span>
                  </label>
                </div>
                
                <div>
                  <label className="block text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3">Categoria</label>
                  <select 
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                    className="w-full px-4 py-3 bg-ammare-white border border-ammare-light/40 focus:outline-none focus:border-ammare-dark rounded-sm transition-colors text-sm appearance-none"
                  >
                    {categories.filter(c => c !== 'Todos').map((c, i) => (
                      <option key={`${c}-${i}`} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3">Descrição Curta</label>
                <input 
                  type="text" 
                  value={editForm.shortDescription} 
                  onChange={(e) => setEditForm({...editForm, shortDescription: e.target.value})}
                  placeholder={`Aparece no card do ${editForm.isIndividual ? 'produto' : 'kit'}...`}
                  className="w-full px-4 py-3 bg-ammare-white border border-ammare-light/40 focus:outline-none focus:border-ammare-dark rounded-sm transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3">Descrição Completa</label>
                <textarea 
                  value={editForm.fullDescription} 
                  onChange={(e) => setEditForm({...editForm, fullDescription: e.target.value})}
                  rows={4}
                  placeholder={`Descrição detalhada que aparece dentro da página do ${editForm.isIndividual ? 'produto' : 'kit'}...`}
                  className="w-full px-4 py-3 bg-ammare-white border border-ammare-light/40 focus:outline-none focus:border-ammare-dark rounded-sm transition-colors text-sm resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {!editForm.isIndividual && (
                  <div>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3">
                      Itens do Kit (Um por linha)
                    </label>
                    <textarea 
                      value={itemsInput} 
                      onChange={(e) => setItemsInput(e.target.value)}
                      rows={5}
                      placeholder="Cinta modeladora&#10;Placa abdominal&#10;Espuma..."
                      className="w-full px-4 py-3 bg-ammare-white border border-ammare-light/40 focus:outline-none focus:border-ammare-dark rounded-sm transition-colors text-sm whitespace-pre-wrap leading-relaxed"
                    />
                  </div>
                )}

                <div className={`flex flex-col gap-8 ${editForm.isIndividual ? 'md:col-span-2' : ''}`}>
                  <div className={`${editForm.isIndividual ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : ''}`}>
                    <div>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3">
                      Tamanhos Disponíveis (Separados por vírgula)
                    </label>
                    <input 
                      type="text" 
                      value={sizesInput} 
                      onChange={(e) => setSizesInput(e.target.value)}
                      placeholder="P, M, G, GG..."
                      className="w-full px-4 py-3 bg-ammare-white border border-ammare-light/40 focus:outline-none focus:border-ammare-dark rounded-sm transition-colors text-sm mb-6"
                    />
                    
                    <label className="block text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3">
                      Cores Disponíveis (Separadas por vírgula)
                    </label>
                    <input 
                      type="text" 
                      value={colorsInput} 
                      onChange={(e) => setColorsInput(e.target.value)}
                      placeholder="Nude, Preto, Branco..."
                      className="w-full px-4 py-3 bg-ammare-white border border-ammare-light/40 focus:outline-none focus:border-ammare-dark rounded-sm transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3">
                      Imagem Principal do {editForm.isIndividual ? 'Produto' : 'Kit'}
                    </label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer flex-1 py-3 px-4 border border-dashed border-ammare-dark/30 hover:border-ammare-dark text-center rounded-sm transition-colors text-sm text-ammare-dark/60">
                          <span>Fazer Upload (Max 2MB)</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                      {uploadError && (
                         <div className="text-xs text-red-500 tracking-wider font-medium">{uploadError}</div>
                      )}
                      <div className="text-center text-[0.65rem] text-ammare-dark/40 uppercase tracking-widest">
                        OU COLE O LINK
                      </div>
                      <input 
                        type="text" 
                        value={editForm.imageUrl} 
                        onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                        placeholder="https://exemplo.com/imagem.png"
                        className="w-full px-4 py-3 bg-ammare-white border border-ammare-light/40 focus:outline-none focus:border-ammare-dark rounded-sm transition-colors text-sm"
                      />
                      {editForm.imageUrl && (
                         <div className="mt-2 text-xs text-green-600 tracking-wider">Imagem selecionada/informada.</div>
                      )}
                    </div>
                  </div>
                  </div>

                  <div>
                    <label className="block text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 mb-3">
                      Imagens da Galeria (Adicionais)
                    </label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <label className="cursor-pointer flex-1 py-3 px-4 border border-dashed border-ammare-dark/30 hover:border-ammare-dark text-center rounded-sm transition-colors text-sm text-ammare-dark/60">
                          <span>Fazer Upload de Galeria (Max 2MB/cada)</span>
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} />
                        </label>
                      </div>
                      
                      {editForm.galleryUrls && editForm.galleryUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editForm.galleryUrls.map((url, i) => (
                            <div key={`form-gallery-${i}`} className="relative w-16 h-16 group">
                              <img src={url || undefined} alt="Galeria" className="w-full h-full object-cover rounded-sm border border-ammare-dark/10" />
                              <button
                                onClick={() => setEditForm({
                                  ...editForm,
                                  galleryUrls: editForm.galleryUrls?.filter((_, index) => index !== i)
                                })}
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"
                                title="Remover imagem"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-ammare-light/20 bg-ammare-white flex justify-end gap-4">
              <button 
                onClick={handleCancel}
                className="px-6 py-3 text-[0.65rem] uppercase tracking-widest text-ammare-dark/50 hover:text-ammare-dark transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-3 bg-ammare-dark text-ammare-white rounded-sm text-[0.65rem] uppercase tracking-widest hover:bg-ammare-black transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </div>

      {/* Print-Only Premium Catalog Document */}
      <div className="hidden print-only p-12 text-black bg-white flex-col font-sans w-full">
        <div className="flex justify-between items-center border-b border-zinc-300 pb-6 mb-8 w-full">
          <div>
            <h1 className="font-serif text-3xl tracking-wider text-zinc-900 uppercase">Ammare Clinique</h1>
            <p className="text-[0.65rem] uppercase tracking-widest text-zinc-400 mt-1">Catálogo e Inventário Oficial de Estoque</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 font-light">Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
            <p className="text-xs text-zinc-500 font-light">Tipo: {activeTab === 'kits' ? 'Kits Completos' : 'Produtos Individuais'}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-300 text-[0.65rem] uppercase tracking-widest text-zinc-500">
              <th className="py-3 px-2 w-1/4">Nome</th>
              <th className="py-3 px-2 w-1/4">Categoria</th>
              <th className="py-3 px-2 w-2/5">Descrição / Detalhes</th>
              <th className="py-3 px-2 w-1/12 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentList.map((kit) => (
              <tr key={`print-${kit.id}`} className="border-b border-zinc-100 text-xs">
                <td className="py-4 px-2 font-serif text-sm font-semibold text-zinc-900">{kit.name || 'Sem nome'}</td>
                <td className="py-4 px-2 text-zinc-500 tracking-wide uppercase text-[9px]">{kit.category}</td>
                <td className="py-4 px-2 text-zinc-600 font-light leading-relaxed">
                  <p className="mb-1">{kit.shortDescription}</p>
                  {!kit.isIndividual ? (
                    <ul className="list-disc list-inside space-y-0.5 text-zinc-500 text-[10px] mt-2">
                      {kit.items && kit.items.map(item => (
                        <li key={item.id}>{item.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <>
                      {kit.sizes && kit.sizes.length > 0 && <p className="text-[9px] text-zinc-400">Tamanhos: {kit.sizes.join(', ')}</p>}
                      {kit.colors && kit.colors.length > 0 && <p className="text-[9px] text-zinc-400">Cores: {kit.colors.join(', ')}</p>}
                    </>
                  )}
                </td>
                <td className="py-4 px-2 text-right text-zinc-800 font-medium">
                  {kit.isActive !== false ? 'Ativo' : 'Inativo'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-16 pt-8 border-t border-zinc-200 flex justify-between items-center text-[9px] text-zinc-400 uppercase tracking-widest">
          <span>Ammare Clinique - Relatório de Inventário</span>
          <span>Página 1 de 1</span>
        </div>
      </div>
    </motion.div>
  );
}
