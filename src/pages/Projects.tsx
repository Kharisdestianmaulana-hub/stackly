import * as React from 'react';
import { Folder, Globe, Code, FolderOpen, Trash2, Plus, RefreshCw, DownloadCloud, UploadCloud, Copy, Edit3 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useConfirm } from '../contexts/ConfirmContext';
import toast from 'react-hot-toast';
import { useTranslation } from '../contexts/LanguageContext';

interface ProjectInfo {
  name: string;
  size: string;
  modifiedAt: number;
}

export function Projects() {
  const { t } = useTranslation();
  const [projects, setProjects] = React.useState<ProjectInfo[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  const [isCreating, setIsCreating] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState('');
  const [projectType, setProjectType] = React.useState<'blank' | 'wordpress' | 'laravel'>('blank');
  
  const [isRenaming, setIsRenaming] = React.useState(false);
  const [renamingProject, setRenamingProject] = React.useState('');
  const [renameValue, setRenameValue] = React.useState('');

  const confirm = useConfirm();

  const fetchProjects = async () => {
    setLoading(true);
    if (window.stackly?.projects) {
      const data = await window.stackly.projects.list();
      setProjects(data);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !window.stackly?.projects) return;

    setLoading(true);
    const result = await window.stackly.projects.createBoilerplate(newProjectName.trim(), projectType);
    if (result.success) {
      toast.success(`Proyek ${newProjectName} berhasil dibuat!`);
      setIsCreating(false);
      setNewProjectName('');
      setProjectType('blank');
      fetchProjects();
    } else {
      toast.error(`Gagal membuat proyek: ${result.message}`);
      setLoading(false);
    }
  };

  const handleRenameProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameValue.trim() || !window.stackly?.projects) return;

    const success = await window.stackly.projects.rename(renamingProject, renameValue.trim());
    if (success) {
      toast.success('Nama proyek berhasil diubah!');
      setIsRenaming(false);
      fetchProjects();
    } else {
      toast.error('Gagal mengubah nama. Nama mungkin sudah ada atau tidak valid.');
    }
  };

  const handleDuplicateProject = async (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (!window.stackly?.projects) return;
    
    const newName = window.prompt(`Masukkan nama untuk duplikat proyek "${name}":`, `${name}_copy`);
    if (newName && newName.trim()) {
      setLoading(true);
      const success = await window.stackly.projects.duplicate(name, newName.trim());
      if (!success) {
        toast.error('Gagal menduplikasi proyek.');
        setLoading(false);
      } else {
        toast.success('Proyek berhasil diduplikasi.');
        fetchProjects();
      }
    }
  };

  const handleImportZip = async () => {
    setLoading(true);
    try {
      const result = await window.stackly?.projects.importZip();
      if (result?.success) {
        toast.success('Proyek berhasil diimpor!');
        fetchProjects();
      } else if (result?.message !== 'Canceled') {
        toast.error(`Gagal mengimpor zip: ${result?.message}`);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
      setLoading(false);
    }
  };

  const handleExportZip = async (projectName: string) => {
    setLoading(true);
    try {
      const result = await window.stackly?.projects.exportZip(projectName);
      if (result?.success) {
        toast.success('Proyek berhasil diekspor!');
      } else if (result?.message !== 'Canceled') {
        toast.error(`Gagal mengekspor zip: ${result?.message}`);
      }
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
    setLoading(false);
  };

  const handleDeleteProject = async (name: string) => {
    if (!window.stackly?.projects) return;
    const isConfirmed = await confirm({
      title: 'Hapus Proyek',
      message: `Apakah Anda yakin ingin menghapus proyek "${name}" beserta seluruh isinya secara permanen?`,
      isDanger: true,
      confirmLabel: 'Hapus',
    });
    
    if (isConfirmed) {
      await window.stackly.projects.delete(name);
      toast.success('Proyek berhasil dihapus.');
      fetchProjects();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-[1200px] mx-auto h-full flex flex-col pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">{t('projects.title')}</h1>
          <p className="text-text-secondary">{t('projects.description')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={fetchProjects} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="secondary" onClick={handleImportZip} disabled={loading}>
            <UploadCloud className="w-4 h-4 mr-2" /> Import Zip
          </Button>
          <Button variant="primary" onClick={() => { setIsCreating(true); setIsRenaming(false); }} disabled={loading}>
            <Plus className="w-4 h-4 mr-2" /> {t('projects.newProject')}
          </Button>
        </div>
      </div>

      {isCreating && (
        <Card className="mb-6 bg-card-elevated border-electric-blue/50 p-4">
          <h3 className="text-lg font-medium text-text-primary mb-4">{t('projects.createTitle')}</h3>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-text-muted mb-1">{t('projects.projectName')}</label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="my-awesome-site"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-input border border-border-strong rounded-md px-4 py-2 text-text-primary focus:outline-none focus:border-primary-blue transition-colors"
                />
              </div>
              <div className="w-1/3">
                <label className="block text-xs font-medium text-text-muted mb-1">{t('projects.projectType')}</label>
                <select 
                  value={projectType} 
                  onChange={(e) => setProjectType(e.target.value as any)}
                  className="w-full bg-input border border-border-strong rounded-md px-4 py-2 text-text-primary focus:outline-none focus:border-primary-blue transition-colors appearance-none cursor-pointer"
                >
                  <option value="blank">{t('projects.phpBasic')}</option>
                  <option value="wordpress">WordPress</option>
                  <option value="laravel">{t('projects.laravel')}</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>{t('common.cancel')}</Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? t('common.loading') : t('projects.createProject')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isRenaming && (
        <Card className="mb-6 bg-card-elevated border-electric-blue/50 p-4">
          <h3 className="text-lg font-medium text-text-primary mb-4">{t('projects.renameTitle')}</h3>
          <form onSubmit={handleRenameProject} className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                autoFocus
                required
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full bg-input border border-border-strong rounded-md px-4 py-2 text-text-primary focus:outline-none focus:border-primary-blue transition-colors"
              />
            </div>
            <Button type="submit" variant="primary">{t('common.save')}</Button>
            <Button type="button" variant="ghost" onClick={() => setIsRenaming(false)}>{t('common.cancel')}</Button>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <RefreshCw className="w-8 h-8 text-electric-blue animate-spin mb-4" />
          <p className="text-text-muted">{t('common.loading')}</p>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="w-10 h-10 text-electric-blue" />}
          title={t('projects.emptyTitle')}
          description={t('projects.emptyDesc')}
          actionLabel={t('projects.createProject')}
          onAction={() => setIsCreating(true)}
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-2 pb-4">
          {projects.map((project) => (
            <Card key={project.name} className="flex flex-col justify-between hover:border-border-strong transition-colors group">
              <div className="p-5 border-b border-border-soft flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-sidebar border border-border-soft flex items-center justify-center text-electric-blue shrink-0">
                  <Folder className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-text-primary truncate" title={project.name}>{project.name}</h3>
                  <div className="flex items-center text-xs text-text-muted mt-1 space-x-3">
                    <span>{project.size}</span>
                    <span>•</span>
                    <span>{formatDate(project.modifiedAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-2 gap-2 bg-sidebar border-b border-border-soft/50">
                <Button 
                  variant="secondary" 
                  className="text-xs justify-center"
                  onClick={() => window.stackly?.browser.openProject(project.name)}
                >
                  <Globe className="w-3.5 h-3.5 mr-1.5" /> Browser
                </Button>
                <Button 
                  variant="secondary" 
                  className="text-xs justify-center"
                  onClick={() => window.stackly?.projects.openEditor(project.name)}
                >
                  <Code className="w-3.5 h-3.5 mr-1.5" /> {t('dashboard.openEditor')}
                </Button>
                <Button 
                  variant="ghost" 
                  className="text-xs justify-center col-span-2"
                  onClick={() => window.stackly?.projects.openFolder(project.name)}
                >
                  <FolderOpen className="w-3.5 h-3.5 mr-1.5" /> {t('dashboard.openFolder')}
                </Button>
              </div>

              <div className="px-4 py-3 flex items-center justify-between bg-sidebar">
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" className="p-1.5 text-text-muted hover:text-text-primary" title={t('common.edit')} onClick={() => { setRenamingProject(project.name); setRenameValue(project.name); setIsRenaming(true); setIsCreating(false); }}>
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 text-text-muted hover:text-text-primary" title={t('projects.duplicateTitle')} onClick={(e) => handleDuplicateProject(e, project.name)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-1.5 text-text-muted hover:text-text-primary" title="Export as Zip" onClick={() => handleExportZip(project.name)}>
                    <DownloadCloud className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="p-1.5 text-danger hover:text-danger hover:bg-danger/10" title={t('common.delete')} onClick={() => handleDeleteProject(project.name)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
