import { create } from 'zustand';

const useStore = create((set) => ({
  selectedClientId: null,
  setSelectedClientId: (clientId) => set({ selectedClientId: clientId }),
  
  documentViewerOpen: false,
  setDocumentViewerOpen: (isOpen) => set({ documentViewerOpen: isOpen }),
  selectedDocumentUrl: null,
  setSelectedDocumentUrl: (url) => set({ selectedDocumentUrl: url }),
  
  editingPayment: null,
  setEditingPayment: (payment) => set({ editingPayment: payment }),
  clearEditingPayment: () => set({ editingPayment: null }),
  
  isMobileMenuOpen: false,
  setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
  
  // Form state tracking
  isFormDirty: false,
  setFormDirty: (isDirty) => set({ isFormDirty: isDirty }),
}));

export default useStore;