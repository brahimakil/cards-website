import { useState, useEffect, useRef } from 'preact/hooks';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import EditableCard from '../editor/EditableCard';

interface CardViewerProps {
  cardId: string;
}

export default function CardViewer({ cardId }: CardViewerProps) {
  const [cardData, setCardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchCard();
  }, [cardId]);

  const fetchCard = async () => {
    if (!cardId || cardId === 'undefined' || cardId === 'null') {
      setError('معرف البطاقة غير صحيح');
      setLoading(false);
      return;
    }

    try {
      const cardDoc = await getDoc(doc(db, 'cards', cardId));
      
      if (!cardDoc.exists()) {
        setError('البطاقة غير موجودة أو تم حذفها');
        setLoading(false);
        return;
      }

      const data = cardDoc.data();
      setCardData({
        id: cardDoc.id,
        ...data
      });
    } catch (error) {
      console.error('Error fetching card:', error);
      setError('حدث خطأ في تحميل البطاقة');
    } finally {
      setLoading(false);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  if (loading) {
    return (
      <div class="card-viewer-loading">
        <div class="loading-spinner"></div>
        <p>جاري تحميل البطاقة...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div class="card-viewer-error">
        <div class="error-icon">❌</div>
        <h2>خطأ في تحميل البطاقة</h2>
        <p>{error}</p>
        <div class="error-actions">
          <button 
            class="btn-back-home"
            onClick={() => window.location.href = '/'}
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div class="card-viewer-error">
        <div class="error-icon">🔍</div>
        <h2>البطاقة غير موجودة</h2>
        <p>لم يتم العثور على البطاقة المطلوبة</p>
        <div class="error-actions">
          <button 
            class="btn-back-home"
            onClick={() => window.location.href = '/'}
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Get the custom width from card data, default to 400px if not set
  const cardWidth = cardData.width || 400;

  return (
    <div class="card-viewer-clean">
      {/* Music Control */}
      {cardData.fields?.musicUrl && (
        <div class="music-control-floating">
          <button 
            class="btn-music-toggle"
            onClick={toggleMusic}
            title={isPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <audio 
            ref={audioRef}
            loop
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={cardData.fields.musicUrl} type="audio/mpeg" />
          </audio>
        </div>
      )}

      {/* Card Content with Custom Width */}
      <div 
        class="card-viewer-container-clean"
        style={{ 
          maxWidth: `${cardWidth}px`,
          width: `${cardWidth}px`,
          margin: '0 auto',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box'
        }}
      >
        <EditableCard 
          cardData={cardData}
          onFieldUpdate={() => {}} // Read-only mode
          isEditing={false}
          cardWidth={cardWidth}
        />
      </div>
    </div>
  );
}