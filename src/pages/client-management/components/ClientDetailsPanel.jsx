import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

const ClientDetailsPanel = ({ client, onClose, onEdit }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);

  if (!client) return null;

  // Charger les notes du client
  useEffect(() => {
    if (client?.id && activeTab === 'notes') {
      loadNotes();
    }
  }, [client?.id, activeTab]);

  // Charger les documents du client
  useEffect(() => {
    if (client?.id && activeTab === 'documents') {
      loadDocuments();
    }
  }, [client?.id, activeTab]);

  const loadNotes = async () => {
    try {
      setLoadingNotes(true);
      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Erreur chargement notes:', error);
    } finally {
      setLoadingNotes(false);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoadingDocs(true);
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Erreur chargement documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Aperçu', icon: 'Info' },
    { id: 'invoices', label: 'Factures', icon: 'FileText' },
    { id: 'payments', label: 'Paiements', icon: 'CreditCard' },
    { id: 'documents', label: 'Documents', icon: 'FolderOpen' },
    { id: 'notes', label: 'Notes', icon: 'MessageSquare' }
  ];

  const handleCreateInvoice = () => {
    navigate('/invoice-management', { 
      state: { 
        prefilledClient: {
          clientName: client.companyName,
          clientEmail: client.email,
          clientAddress: client.billingAddress
        }
      }
    });
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const authorName = profileData 
        ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || 'Utilisateur'
        : 'Utilisateur';

      const { error } = await supabase
        .from('client_notes')
        .insert([{
          client_id: client.id,
          user_id: user.id,
          content: newNote,
          author_name: authorName
        }]);

      if (error) throw error;

      alert('✅ Note ajoutée avec succès !');
      setNewNote('');
      setIsEditingNotes(false);
      await loadNotes();
    } catch (error) {
      console.error('Erreur ajout note:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleUploadDocument = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const fileName = `${user.id}/${client.id}/${Date.now()}_${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('client-documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('client_documents')
          .insert([{
            client_id: client.id,
            user_id: user.id,
            name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type
          }]);

        if (dbError) throw dbError;

        alert('✅ Document uploadé !');
        await loadDocuments();
      } catch (error) {
        console.error('Erreur upload:', error);
        alert('Erreur: ' + error.message);
      }
    };

    input.click();
  };

  const handleDownloadDocument = async (doc) => {
    try {
      const { data, error } = await supabase.storage
        .from('client-documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (!confirm(`Supprimer "${doc.name}" ?`)) return;

    try {
      const { error: storageError } = await supabase.storage
        .from('client-documents')
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', doc.id);

      if (dbError) throw dbError;

      alert('✅ Document supprimé !');
      await loadDocuments();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur: ' + error.message);
    }
  };

  const renderOverview = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-muted/50 rounded-lg p-4 md:p-5">
        <h4 className="font-heading font-semibold text-base md:text-lg mb-3 md:mb-4">Informations générales</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Entreprise</p>
            <p className="text-sm md:text-base font-medium">{client?.companyName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Contact principal</p>
            <p className="text-sm md:text-base font-medium">{client?.contactName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm md:text-base font-medium">{client?.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Téléphone</p>
            <p className="text-sm md:text-base font-medium">{client?.phone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">SIRET</p>
            <p className="text-sm md:text-base font-medium">{client?.siret || 'Non renseigné'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">N° TVA</p>
            <p className="text-sm md:text-base font-medium">{client?.vatNumber || 'Non renseigné'}</p>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 md:p-5">
        <h4 className="font-heading font-semibold text-base md:text-lg mb-3 md:mb-4">Adresse de facturation</h4>
        <p className="text-sm md:text-base text-foreground whitespace-pre-line">{client?.billingAddress}</p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 md:p-5">
        <h4 className="font-heading font-semibold text-base md:text-lg mb-3 md:mb-4">Statistiques</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-primary">{client?.totalInvoices || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Factures</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-success">{client?.paidInvoices || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Payées</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-warning">{client?.pendingInvoices || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">En attente</p>
          </div>
          <div className="text-center">
            <p className="text-xl md:text-2xl font-bold text-error">{client?.overdueInvoices || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">En retard</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="space-y-3 md:space-y-4">
      {client?.recentInvoices?.length > 0 ? (
        client.recentInvoices.map((invoice) => (
          <div key={invoice?.id} className="bg-muted/50 rounded-lg p-4 md:p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h5 className="font-semibold text-sm md:text-base">{invoice?.number}</h5>
                <p className="text-xs text-muted-foreground">{invoice?.date}</p>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                invoice?.status === 'paid' ? 'bg-success/10 text-success' :
                invoice?.status === 'pending'? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
              }`}>
                {invoice?.status === 'paid' ? 'Payée' : invoice?.status === 'pending' ? 'En attente' : 'En retard'}
              </span>
            </div>
            <Button variant="ghost" size="sm" iconName="Eye" onClick={() => navigate(`/invoice-management?invoice=${invoice.id}`)}>
              Voir
            </Button>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <Icon name="FileText" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune facture</p>
          <Button variant="default" size="sm" className="mt-4" onClick={handleCreateInvoice}>
            Créer la première facture
          </Button>
        </div>
      )}
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-3 md:space-y-4">
      {client?.paymentHistory?.length > 0 ? (
        client.paymentHistory.map((payment) => (
          <div key={payment?.id} className="bg-muted/50 rounded-lg p-4 md:p-5">
            <p className="font-semibold">{payment?.amount?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
            <p className="text-xs text-muted-foreground">{payment?.date}</p>
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <Icon name="CreditCard" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun paiement</p>
        </div>
      )}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-3 md:space-y-4">
      <Button variant="outline" size="sm" iconName="Upload" onClick={handleUploadDocument} className="w-full">
        Uploader un document
      </Button>

      {loadingDocs ? (
        <div className="text-center py-8"><p className="text-muted-foreground">Chargement...</p></div>
      ) : documents.length > 0 ? (
        documents.map((doc) => (
          <div key={doc.id} className="bg-muted/50 rounded-lg p-4 flex items-center gap-3">
            <Icon name="FileText" size={20} color="var(--color-primary)" />
            <div className="flex-1">
              <h5 className="font-semibold text-sm truncate">{doc.name}</h5>
              <p className="text-xs text-muted-foreground">
                {new Date(doc.created_at).toLocaleDateString('fr-FR')} • {(doc.file_size / 1024).toFixed(0)} KB
              </p>
            </div>
            <Button variant="ghost" size="sm" iconName="Download" onClick={() => handleDownloadDocument(doc)} />
            <Button variant="ghost" size="sm" iconName="Trash" onClick={() => handleDeleteDocument(doc)} className="text-error" />
          </div>
        ))
      ) : (
        <div className="text-center py-8">
          <Icon name="FolderOpen" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun document</p>
        </div>
      )}
    </div>
  );

  const renderNotes = () => (
    <div className="space-y-3 md:space-y-4">
      {isEditingNotes ? (
        <div className="bg-muted/50 rounded-lg p-4">
          <textarea
            className="w-full min-h-[100px] p-3 rounded-md border border-border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ajouter une note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <div className="flex gap-2 mt-3">
            <Button variant="default" size="sm" onClick={handleAddNote}>Enregistrer</Button>
            <Button variant="outline" size="sm" onClick={() => { setIsEditingNotes(false); setNewNote(''); }}>Annuler</Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" iconName="Plus" onClick={() => setIsEditingNotes(true)} className="w-full">
          Ajouter une note
        </Button>
      )}

      {loadingNotes ? (
        <div className="text-center py-8"><p className="text-muted-foreground">Chargement...</p></div>
      ) : notes.length > 0 ? (
        notes.map((note) => (
          <div key={note.id} className="bg-muted/50 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">{note.author_name?.charAt(0) || 'U'}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{note.author_name || 'Utilisateur'}</p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <p className="text-sm">{note.content}</p>
              </div>
            </div>
          </div>
        ))
      ) : (
        !isEditingNotes && (
          <div className="text-center py-8">
            <Icon name="MessageSquare" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
            <p className="text-muted-foreground">Aucune note</p>
          </div>
        )
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'invoices': return renderInvoices();
      case 'payments': return renderPayments();
      case 'documents': return renderDocuments();
      case 'notes': return renderNotes();
      default: return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-150 lg:relative lg:bg-transparent lg:backdrop-blur-none">
      <div className="fixed inset-y-0 right-0 w-full lg:w-[480px] xl:w-[560px] bg-card border-l border-border shadow-elevation-4 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border">
          <h3 className="font-heading font-semibold text-lg md:text-xl">Détails du client</h3>
          <Button variant="ghost" size="icon" iconName="X" onClick={onClose} />
        </div>

        <div className="flex-shrink-0 border-b border-border overflow-x-auto">
          <div className="flex p-2 gap-1 min-w-max">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-smooth whitespace-nowrap ${
                  activeTab === tab?.id ? 'bg-primary text-primary-foreground shadow-elevation-1' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <Icon name={tab?.icon} size={16} color="currentColor" />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderTabContent()}
        </div>

        <div className="flex-shrink-0 p-4 md:p-6 border-t border-border bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" fullWidth iconName="Edit" onClick={() => onEdit(client)}>Modifier</Button>
            <Button variant="default" fullWidth iconName="FileText" onClick={handleCreateInvoice}>Nouvelle facture</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsPanel;
