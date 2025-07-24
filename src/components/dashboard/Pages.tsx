import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import CardEditor from '../editor/CardEditor';

interface SavedCard {
  id: string;
  title: string;
  type: 'wedding' | 'birthday' | 'custom';
  fields: { [key: string]: any };
  backgroundImage?: string;
  width?: number;
  createdAt: any;
  userId: string;
}

// Update Pages component to use onNavigate prop
interface PagesProps {
  onNavigate: (path: string) => void;
}

export default function Pages({ onNavigate }: PagesProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingCard, setEditingCard] = useState<SavedCard | null>(null);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadSavedCards();
    }
  }, [user]);

  const loadSavedCards = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'cards'), 
        where('userId', '==', user.id)
      );
      const querySnapshot = await getDocs(q);
      const cards: SavedCard[] = [];
      
      querySnapshot.forEach((doc) => {
        cards.push({
          id: doc.id,
          ...doc.data()
        } as SavedCard);
      });
      
      // Sort by creation date (newest first)
      cards.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setSavedCards(cards);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    onNavigate('/dashboard/editor');
  };

  const handleEdit = (card: SavedCard) => {
    onNavigate(`/dashboard/edit/${card.id}`);
  };

  const handleView = (card: SavedCard) => {
    // Open card in a new window/tab with clean viewer
    const cardUrl = `/card/${card.id}`;
    window.open(cardUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  };

  const handleDelete = async (cardId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه البطاقة؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    setDeleting(cardId);
    try {
      await deleteDoc(doc(db, 'cards', cardId));
      setSavedCards(prev => prev.filter(card => card.id !== cardId));
      alert('تم حذف البطاقة بنجاح');
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('حدث خطأ في حذف البطاقة');
    } finally {
      setDeleting(null);
    }
  };

  const handleCopyLink = (cardId: string) => {
    const cardUrl = `${window.location.origin}/card/${cardId}`;
    navigator.clipboard.writeText(cardUrl).then(() => {
      alert('تم نسخ الرابط! يمكنك مشاركته مع العملاء');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = cardUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('تم نسخ الرابط! يمكنك مشاركته مع العملاء');
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCardPreview = (card: SavedCard) => {
    if (card.type === 'wedding') {
      return {
        title: card.fields.eventTitle || 'دعوة زفاف',
        subtitle: `${card.fields.groomName || 'العريس'} & ${card.fields.brideName || 'العروس'}`,
        date: card.fields.weddingDate || '2025-01-01',
        icon: '💍'
      };
    } else {
      return {
        title: 'دعوة عيد ميلاد',
        subtitle: card.fields.celebrantName || 'المحتفل به',
        date: card.fields.birthdayDate || '2025-01-01',
        icon: '🎂'
      };
    }
  };

  // Show editor if editing or creating
  if (showEditor) {
    return (
      <CardEditor 
        editingCard={editingCard}
        onSaveComplete={() => {
          setShowEditor(false);
          setEditingCard(null);
          loadSavedCards(); // Refresh the list
        }}
        onCancel={() => {
          setShowEditor(false);
          setEditingCard(null);
        }}
      />
    );
  }

  return (
    <div class="pages-container">
      <div class="page-header">
        <h2>إدارة البطاقات</h2>
        <p>عرض وتعديل وحذف بطاقات الدعوة الخاصة بك</p>
        <button class="btn-create-new" onClick={handleCreateNew}>
          + إنشاء بطاقة جديدة
        </button>
      </div>

      {loading ? (
        <div class="loading-container">
          <div class="spinner"></div>
          <p>جاري تحميل البطاقات...</p>
        </div>
      ) : (
        <div class="pages-content">
          {savedCards.length === 0 ? (
            <div class="empty-state">
              <div class="empty-icon">📝</div>
              <h3>لا توجد بطاقات محفوظة</h3>
              <p>ابدأ بإنشاء بطاقة دعوة جديدة</p>
              <button class="btn-create-first" onClick={handleCreateNew}>
                إنشاء أول بطاقة
              </button>
            </div>
          ) : (
            <div class="cards-grid">
              {savedCards.map((card) => {
                const preview = getCardPreview(card);
                return (
                  <div key={card.id} class="saved-card">
                    <div class="card-preview-section">
                      <div class="card-icon">{preview.icon}</div>
                      <div class="card-info">
                        <h3 class="card-title">{card.title}</h3>
                        <p class="card-subtitle">{preview.subtitle}</p>
                        <p class="card-date">📅 {preview.date}</p>
                        <p class="card-created">تم الإنشاء: {formatDate(card.createdAt)}</p>
                      </div>
                      <div class="card-type-badge">
                        {card.type === 'wedding' ? 'زفاف' : 'عيد ميلاد'}
                      </div>
                    </div>

                    <div class="card-actions">
                      <button 
                        class="btn-edit"
                        onClick={() => handleEdit(card)}
                        title="تعديل البطاقة"
                      >
                        ✏️ تعديل
                      </button>
                      
                      <button 
                        class="btn-view"
                        onClick={() => handleView(card)}
                        title="عرض البطاقة"
                      >
                        👁️ عرض
                      </button>
                      
                      <button 
                        class="btn-copy-link"
                        onClick={() => handleCopyLink(card.id)}
                        title="نسخ رابط البطاقة"
                      >
                        🔗 نسخ الرابط
                      </button>
                      
                      <button 
                        class="btn-delete"
                        onClick={() => handleDelete(card.id)}
                        disabled={deleting === card.id}
                        title="حذف البطاقة"
                      >
                        {deleting === card.id ? '⏳' : '🗑️'} حذف
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
