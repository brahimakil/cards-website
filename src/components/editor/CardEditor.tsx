import { useState, useRef, useEffect } from 'preact/hooks';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import CardTemplates from './CardTemplates';
import EditableCard from './EditableCard';

// Define CardData interface here to avoid import issues
interface CardData {
  id?: string;
  type: 'wedding' | 'birthday' | 'custom';
  title: string;
  fields: { [key: string]: any };
  backgroundImage?: string;
  width?: number;
  createdAt?: Date;
  userId?: string;
}

interface CardEditorProps {
  editingCardId?: string | null;
  onNavigate: (path: string) => void;
}

export default function CardEditor({ editingCardId, onNavigate }: CardEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardWidth, setCardWidth] = useState(400);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [uploadingMusic, setUploadingMusic] = useState(false);
  const musicInputRef = useRef<HTMLInputElement>(null);

  // Color template presets
  const colorTemplates = [
    {
      name: 'Classic Gold',
      colors: {
        titleBackground: '#ffffff',
        titleBorder: '#d4af37',
        quranBackground: '#ffffff',
        quranBorder: '#d4af37',
        logoBackground: '#d4af37',
        logoBorder: '#f4e4bc',
        omtBackground: '#ffffff',
        omtBorder: '#d4af37',
        wishMoneyBackground: '#ffffff',
        wishMoneyBorder: '#d4af37',
        eventBackground: '#ffffff', // Add event section colors
        eventBorder: '#d4af37',
        giftsBackground: '#ffffff', // Add gifts section colors
        giftsBorder: '#d4af37',
        dateBgStart: '#d4af37',
        dateBgEnd: '#f4e4bc',
        dateBorder: 'rgba(255,255,255,0.3)',
        weddingDateColor: '#ffffff',
        countdownNumbers: '#ffffff',
        countdownLabels: '#ffffff',
        accentColor: '#d4af37',
        secondaryAccent: '#f4e4bc'
      }
    },
    {
      name: 'Royal Purple',
      colors: {
        titleBackground: '#f8f6ff',
        titleBorder: '#7c3aed',
        quranBackground: '#faf5ff',
        quranBorder: '#8b5cf6',
        logoBackground: '#7c3aed',
        logoBorder: '#a78bfa',
        omtBackground: '#f3f4f6',
        omtBorder: '#7c3aed',
        wishMoneyBackground: '#f3f4f6',
        wishMoneyBorder: '#7c3aed',
        eventBackground: '#f3f4f6', // Add event section colors
        eventBorder: '#7c3aed',
        giftsBackground: '#f3f4f6', // Add gifts section colors
        giftsBorder: '#7c3aed',
        dateBgStart: '#7c3aed',
        dateBgEnd: '#a78bfa',
        dateBorder: 'rgba(255,255,255,0.3)',
        weddingDateColor: '#ffffff',
        countdownNumbers: '#ffffff',
        countdownLabels: '#ffffff',
        accentColor: '#7c3aed',
        secondaryAccent: '#a78bfa'
      }
    },
    {
      name: 'Rose Gold',
      colors: {
        titleBackground: '#fdf2f8',
        titleBorder: '#e11d48',
        quranBackground: '#fff1f2',
        quranBorder: '#f43f5e',
        logoBackground: '#e11d48',
        logoBorder: '#fb7185',
        omtBackground: '#f9fafb',
        omtBorder: '#e11d48',
        wishMoneyBackground: '#f9fafb',
        wishMoneyBorder: '#e11d48',
        eventBackground: '#f9fafb', // Add event section colors
        eventBorder: '#e11d48',
        giftsBackground: '#f9fafb', // Add gifts section colors
        giftsBorder: '#e11d48',
        dateBgStart: '#e11d48',
        dateBgEnd: '#fb7185',
        dateBorder: 'rgba(255,255,255,0.3)',
        weddingDateColor: '#ffffff',
        countdownNumbers: '#ffffff',
        countdownLabels: '#ffffff',
        accentColor: '#e11d48',
        secondaryAccent: '#fb7185'
      }
    },
    {
      name: 'Emerald Green',
      colors: {
        titleBackground: '#f0fdf4',
        titleBorder: '#059669',
        quranBackground: '#ecfdf5',
        quranBorder: '#10b981',
        logoBackground: '#059669',
        logoBorder: '#34d399',
        omtBackground: '#f9fafb',
        omtBorder: '#059669',
        wishMoneyBackground: '#f9fafb',
        wishMoneyBorder: '#059669',
        eventBackground: '#f9fafb', // Add event section colors
        eventBorder: '#059669',
        giftsBackground: '#f9fafb', // Add gifts section colors
        giftsBorder: '#059669',
        dateBgStart: '#059669',
        dateBgEnd: '#34d399',
        dateBorder: 'rgba(255,255,255,0.3)',
        weddingDateColor: '#ffffff',
        countdownNumbers: '#ffffff',
        countdownLabels: '#ffffff',
        accentColor: '#059669',
        secondaryAccent: '#34d399'
      }
    },
    {
      name: 'Ocean Blue',
      colors: {
        titleBackground: '#eff6ff',
        titleBorder: '#2563eb',
        quranBackground: '#f0f9ff',
        quranBorder: '#3b82f6',
        logoBackground: '#2563eb',
        logoBorder: '#60a5fa',
        omtBackground: '#f8fafc',
        omtBorder: '#2563eb',
        wishMoneyBackground: '#f8fafc',
        wishMoneyBorder: '#2563eb',
        eventBackground: '#f8fafc', // Add event section colors
        eventBorder: '#2563eb',
        giftsBackground: '#f8fafc', // Add gifts section colors
        giftsBorder: '#2563eb',
        dateBgStart: '#2563eb',
        dateBgEnd: '#60a5fa',
        dateBorder: 'rgba(255,255,255,0.3)',
        weddingDateColor: '#ffffff',
        countdownNumbers: '#ffffff',
        countdownLabels: '#ffffff',
        accentColor: '#2563eb',
        secondaryAccent: '#60a5fa'
      }
    }
  ];

  // Load existing card for editing
  useEffect(() => {
    if (editingCardId) {
      loadCardForEditing();
    }
  }, [editingCardId]);

  const loadCardForEditing = async () => {
    if (!editingCardId) return;
    
    setLoading(true);
    try {
      const cardDoc = await getDoc(doc(db, 'cards', editingCardId));
      if (cardDoc.exists()) {
        const existingCard = {
          id: cardDoc.id,
          ...cardDoc.data()
        } as CardData;
        
        setCardData(existingCard);
        setSelectedTemplate(existingCard.type);
        setIsEditing(true);
        setCardWidth(existingCard.width || 400);
      } else {
        alert('Card not found');
        onNavigate('/dashboard/pages');
      }
    } catch (error) {
      console.error('Error loading card:', error);
      alert('Error loading card');
      onNavigate('/dashboard/pages');
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateType: 'wedding' | 'birthday') => {
    const defaultData: CardData = {
      type: templateType,
      title: `New ${templateType === 'wedding' ? 'Wedding' : 'Birthday'} Card`,
      fields: getDefaultFields(templateType),
      width: 400
    };
    setCardData(defaultData);
    setSelectedTemplate(templateType);
    setIsEditing(true);
    setCardWidth(400);
  };

  const getDefaultFields = (type: 'wedding' | 'birthday') => {
    if (type === 'wedding') {
      return {
        logo: '',
        customMonogram: '',
        eventTitle: 'دعوة زفاف',
        quranVerse: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ',
        descriptionMessage: 'بكل حب وتقدير، نتشرف بدعوتكم لحضور حفل زفافنا المبارك، ونسأل الله أن يجمعنا على خير في هذه المناسبة السعيدة',
        groomName: 'أحمد محمد',
        brideName: 'فاطمة علي',
        groomFather: 'محمد أحمد',
        brideFather: 'علي حسن',
        weddingDate: '2025-06-15',
        weddingTime: '20:00',
        weddingDay: 'يوم السبت',
        venue: 'قاعة الاحتفالات الكبرى',
        location: 'الرياض، المملكة العربية السعودية',
        coordinates: '24.7136,46.6753',
        omtNumber: 'Acc# 03221097',
        wishMoneyUsername: '@username',
        backgroundMusic: '',
        musicFileName: '',
        enableAnimations: true,
        animationStyle: 'gentle', // gentle, elegant, festive
        colors: {
          titleBackground: '#ffffff',
          titleBorder: '#d4af37',
          quranBackground: '#ffffff',
          quranBorder: '#d4af37',
          logoBackground: '#d4af37',
          logoBorder: '#f4e4bc',
          omtBackground: '#ffffff',
          omtBorder: '#d4af37',
          wishMoneyBackground: '#ffffff',
          wishMoneyBorder: '#d4af37',
          accentColor: '#d4af37',
          secondaryAccent: '#f4e4bc'
        }
      };
    } else {
      return {
        celebrantName: 'اسم المحتفل به',
        birthdayDate: '2025-01-01',
        birthdayTime: '18:00',
        venue: 'مكان الاحتفال',
        location: 'الرياض، المملكة العربية السعودية',
        age: '25',
        phoneNumber: '+966xxxxxxxxx',
        additionalInfo: 'تفاصيل إضافية'
      };
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `card-images/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleBackgroundChange = async () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && cardData) {
      try {
        const imageUrl = await handleImageUpload(file);
        setCardData({
          ...cardData,
          backgroundImage: imageUrl
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  const handleMusicUpload = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `card-music/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleMusicChange = async () => {
    musicInputRef.current?.click();
  };

  const handleMusicFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && cardData) {
      // Check file type
      if (!file.type.startsWith('audio/')) {
        alert('يرجى اختيار ملف صوتي صالح (MP3, WAV, etc.)');
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم الملف كبير جداً. يرجى اختيار ملف أقل من 10 ميجابايت');
        return;
      }

      setUploadingMusic(true);
      try {
        const musicUrl = await handleMusicUpload(file);
        setCardData({
          ...cardData,
          fields: {
            ...cardData.fields,
            backgroundMusic: musicUrl,
            musicFileName: file.name
          }
        });
        alert('تم رفع الموسيقى بنجاح!');
      } catch (error) {
        console.error('Error uploading music:', error);
        alert('فشل في رفع الموسيقى. حاول مرة أخرى.');
      } finally {
        setUploadingMusic(false);
      }
    }
  };

  const handleRemoveMusic = () => {
    if (cardData && confirm('هل تريد إزالة الموسيقى من البطاقة؟')) {
      setCardData({
        ...cardData,
        fields: {
          ...cardData.fields,
          backgroundMusic: '',
          musicFileName: ''
        }
      });
    }
  };

  const handleFieldUpdate = (fieldName: string, value: any) => {
    if (cardData) {
      setCardData({
        ...cardData,
        fields: {
          ...cardData.fields,
          [fieldName]: value
        }
      });
    }
  };

  const handleColorChange = (key: string, value: string) => {
    if (cardData) {
      setCardData({
        ...cardData,
        fields: {
          ...cardData.fields,
          colors: {
            ...cardData.fields.colors,
            [key]: value
          }
        }
      });
    }
  };

  const handleWidthChange = (newWidth: number) => {
    setCardWidth(newWidth);
    if (cardData) {
      setCardData({
        ...cardData,
        width: newWidth
      });
    }
  };

  const applyColorTemplate = (template: any) => {
    if (cardData) {
      setCardData({
        ...cardData,
        fields: {
          ...cardData.fields,
          colors: { ...template.colors }
        }
      });
    }
  };

  const handleSave = async () => {
    if (!cardData || !user) return;

    setSaving(true);
    try {
      const cardToSave = {
        ...cardData,
        width: cardWidth,
        userId: user.id,
        createdAt: editingCardId ? cardData.createdAt : new Date()
      };

      if (editingCardId) {
        // Update existing card
        await updateDoc(doc(db, 'cards', editingCardId), cardToSave);
        alert('تم تحديث البطاقة بنجاح!');
      } else {
        // Create new card
        const docRef = await addDoc(collection(db, 'cards'), cardToSave);
        const cardUrl = `/card/${docRef.id}`;
        alert(`تم حفظ البطاقة بنجاح! رابط البطاقة: ${window.location.origin}${cardUrl}`);
      }
      
      onNavigate('/dashboard/pages');
    } catch (error) {
      console.error('Error saving card:', error);
      alert('حدث خطأ في حفظ البطاقة. حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    if (cardData) {
      setCardData({
        ...cardData,
        title: newTitle
      });
    }
  };

  const handleCancel = () => {
    onNavigate('/dashboard/pages');
  };

  // Show loading while fetching card for editing
  if (loading) {
    return (
      <div class="loading-container">
        <div class="spinner"></div>
        <p>جاري تحميل البطاقة للتعديل...</p>
      </div>
    );
  }

  // Show template selection only for new cards (not editing)
  if (!editingCardId && (!selectedTemplate || !cardData)) {
    return <CardTemplates onTemplateSelect={handleTemplateSelect} />;
  }

  // Show editor if we have card data
  if (cardData) {
    return (
      <div class="card-editor">
        <div class="editor-header">
          <div class="header-controls">
            <button 
              class="btn-back" 
              onClick={handleCancel}
            >
              ← العودة إلى البطاقات
            </button>
            <input
              type="text"
              value={cardData.title}
              onChange={(e) => handleTitleChange((e.target as HTMLInputElement).value)}
              class="title-input"
              placeholder="Card Title"
            />
            <div class="action-buttons">
              <button class="btn-bg-change" onClick={handleBackgroundChange}>
                Change Background
              </button>
              <button 
                class="btn-save" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'جاري الحفظ...' : editingCardId ? 'تحديث البطاقة' : 'حفظ البطاقة'}
              </button>
            </div>
          </div>
        </div>

        <div class="editor-content">
          <div class="editor-sidebar">
            <div class="field-editor">
              <h3>Edit Fields</h3>
              
              {/* Width Control Section */}
              <div class="width-control-section">
                <h4>Card Width</h4>
                <div class="width-controls">
                  <input
                    type="range"
                    min="300"
                    max="800"
                    value={cardWidth}
                    onChange={(e) => handleWidthChange(parseInt((e.target as HTMLInputElement).value))}
                    class="width-slider"
                  />
                  <div class="width-display">
                    <input
                      type="number"
                      min="300"
                      max="800"
                      value={cardWidth}
                      onChange={(e) => handleWidthChange(parseInt((e.target as HTMLInputElement).value))}
                      class="width-input"
                    />
                    <span>px</span>
                  </div>
                </div>
                <div class="width-presets">
                  <button 
                    class="preset-btn" 
                    onClick={() => handleWidthChange(350)}
                    data-active={cardWidth === 350}
                  >
                    Small
                  </button>
                  <button 
                    class="preset-btn" 
                    onClick={() => handleWidthChange(400)}
                    data-active={cardWidth === 400}
                  >
                    Medium
                  </button>
                  <button 
                    class="preset-btn" 
                    onClick={() => handleWidthChange(500)}
                    data-active={cardWidth === 500}
                  >
                    Large
                  </button>
                  <button 
                    class="preset-btn" 
                    onClick={() => handleWidthChange(650)}
                    data-active={cardWidth === 650}
                  >
                    XL
                  </button>
                </div>
              </div>

              {/* Quick Name Editor Section */}
              <div class="quick-name-section">
                <h4>👰🤵 Names & Monogram</h4>
                <div class="name-inputs-grid">
                  <div class="name-input-group">
                    <label>Groom Name (العريس)</label>
                    <input
                      type="text"
                      value={cardData.fields.groomName || ''}
                      onChange={(e) => {
                        const newName = (e.target as HTMLInputElement).value;
                        handleFieldUpdate('groomName', newName);
                        if (cardData.fields.customMonogram) {
                          handleFieldUpdate('customMonogram', '');
                        }
                      }}
                      class="field-input name-input"
                      placeholder="أحمد محمد"
                    />
                  </div>

                  <div class="name-input-group">
                    <label>Bride Name (العروس)</label>
                    <input
                      type="text"
                      value={cardData.fields.brideName || ''}
                      onChange={(e) => {
                        const newName = (e.target as HTMLInputElement).value;
                        handleFieldUpdate('brideName', newName);
                        if (cardData.fields.customMonogram) {
                          handleFieldUpdate('customMonogram', '');
                        }
                      }}
                      class="field-input name-input"
                      placeholder="فاطمة علي"
                    />
                  </div>

                  <div class="monogram-preview">
                    <label>Monogram Preview</label>
                    <div class="monogram-display">
                      {cardData.fields.customMonogram || 
                       `${cardData.fields.groomName?.charAt(0) || 'أ'} & ${cardData.fields.brideName?.charAt(0) || 'ف'}`}
                    </div>
                    <input
                      type="text"
                      value={cardData.fields.customMonogram || ''}
                      onChange={(e) => handleFieldUpdate('customMonogram', (e.target as HTMLInputElement).value)}
                      class="field-input monogram-input"
                      placeholder="Custom monogram (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Color Customization Section */}
              <div class="color-customization-section">
                <h4>🎨 Color Themes</h4>
                
                {/* Color Templates */}
                <div class="color-templates">
                  <h5>Quick Templates</h5>
                  <div class="template-grid">
                    {colorTemplates.map((template, index) => (
                      <button
                        key={index}
                        class="color-template-btn"
                        onClick={() => applyColorTemplate(template)}
                        style={{
                          background: `linear-gradient(135deg, ${template.colors.accentColor}, ${template.colors.secondaryAccent})`
                        }}
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Individual Color Controls */}
                <div class="individual-colors">
                  <h5>Custom Colors</h5>
                  <div class="color-controls-grid">
                    <div class="color-control">
                      <label>Title Background</label>
                      <input
                        type="color"
                        value={cardData.fields.colors?.titleBackground || '#ffffff'}
                        onChange={(e) => handleFieldUpdate('colors', {
                          ...cardData.fields.colors,
                          titleBackground: (e.target as HTMLInputElement).value
                        })}
                        class="color-picker"
                      />
                    </div>

                    <div class="color-control">
                      <label>Title Border</label>
                      <input
                        type="color"
                        value={cardData.fields.colors?.titleBorder || '#d4af37'}
                        onChange={(e) => handleFieldUpdate('colors', {
                          ...cardData.fields.colors,
                          titleBorder: (e.target as HTMLInputElement).value
                        })}
                        class="color-picker"
                      />
                    </div>

                    <div class="color-control">
                      <label>Quran Background</label>
                      <input
                        type="color"
                        value={cardData.fields.colors?.quranBackground || '#ffffff'}
                        onChange={(e) => handleFieldUpdate('colors', {
                          ...cardData.fields.colors,
                          quranBackground: (e.target as HTMLInputElement).value
                        })}
                        class="color-picker"
                      />
                    </div>

                    <div class="color-control">
                      <label>Quran Border</label>
                      <input
                        type="color"
                        value={cardData.fields.colors?.quranBorder || '#d4af37'}
                        onChange={(e) => handleFieldUpdate('colors', {
                          ...cardData.fields.colors,
                          quranBorder: (e.target as HTMLInputElement).value
                        })}
                        class="color-picker"
                      />
                    </div>

                    <div class="color-control">
                      <label>Logo Background</label>
                      <input
                        type="color"
                        value={cardData.fields.colors?.logoBackground || '#d4af37'}
                        onChange={(e) => handleFieldUpdate('colors', {
                          ...cardData.fields.colors,
                          logoBackground: (e.target as HTMLInputElement).value
                        })}
                        class="color-picker"
                      />
                    </div>

                    <div class="color-control">
                      <label>Logo Border</label>
                      <input
                        type="color"
                        value={cardData.fields.colors?.logoBorder || '#f4e4bc'}
                        onChange={(e) => handleFieldUpdate('colors', {
                          ...cardData.fields.colors,
                          logoBorder: (e.target as HTMLInputElement).value
                        })}
                        class="color-picker"
                      />
                    </div>

                    <div class="color-control">
                      <label>OMT Background</label>
                      <input
                        type="color"
                        value={cardData.fields.colors?.omtBackground || '#ffffff'}
                        onChange={(e) => handleFieldUpdate('colors', {
                          ...cardData.fields.colors,
                          omtBackground: (e.target as HTMLInputElement).value
                        })}
                        class="color-picker"
                      />
                    </div>

                    <div class="color-control">
                      <label>OMT Border</label>
                      <input
                        type="color"
                        value={cardData.fields.colors?.omtBorder || '#d4af37'}
                        onChange={(e) => handleFieldUpdate('colors', {
                          ...cardData.fields.colors,
                          omtBorder: (e.target as HTMLInputElement).value
                        })}
                        class="color-picker"
                      />
                    </div>

                    <div class="color-control">
                      <label>Wish Money Background</label>
                      <input
                        type="color"
                        value={cardData.fields.colors?.wishMoneyBackground || '#ffffff'}
                        onChange={(e) => handleFieldUpdate('colors', {
                          ...cardData.fields.colors,
                          wishMoneyBackground: (e.target as HTMLInputElement).value
                        })}
                        class="color-picker"
                      />
                    </div>

                    <div class="color-control">
                      <label>Wish Money Border</label>
                      <input
                        type="color"
                        value={cardData.fields.colors?.wishMoneyBorder || '#d4af37'}
                        onChange={(e) => handleFieldUpdate('colors', {
                          ...cardData.fields.colors,
                          wishMoneyBorder: (e.target as HTMLInputElement).value
                        })}
                        class="color-picker"
                      />
                    </div>

                    {/* Date/Time Section Colors */}
                    <div class="color-section">
                      <h4>تخصيص ألوان التاريخ والعد التنازلي</h4>
                      <div class="color-controls">
                        <div class="color-control">
                          <label>خلفية التاريخ (البداية)</label>
                          <input
                            type="color"
                            value={cardData.fields.colors?.dateBgStart || '#d4af37'}
                            onChange={(e) => handleColorChange('dateBgStart', (e.target as HTMLInputElement).value)}
                          />
                        </div>
                        <div class="color-control">
                          <label>خلفية التاريخ (النهاية)</label>
                          <input
                            type="color"
                            value={cardData.fields.colors?.dateBgEnd || '#f4e4bc'}
                            onChange={(e) => handleColorChange('dateBgEnd', (e.target as HTMLInputElement).value)}
                          />
                        </div>
                        <div class="color-control">
                          <label>حدود التاريخ</label>
                          <input
                            type="color"
                            value={cardData.fields.colors?.dateBorder || '#ffffff'}
                            onChange={(e) => handleColorChange('dateBorder', (e.target as HTMLInputElement).value)}
                            class="color-picker"
                          />
                        </div>
                        
                        <div class="color-control">
                          <label>لون نص التاريخ الرئيسي</label>
                          <input
                            type="color"
                            value={cardData.fields.colors?.weddingDateColor || '#ffffff'}
                            onChange={(e) => handleColorChange('weddingDateColor', (e.target as HTMLInputElement).value)}
                            class="color-picker"
                          />
                        </div>
                        
                        {/* Countdown Numbers Color Controls */}
                        <div class="color-control">
                          <label>لون أرقام العد التنازلي</label>
                          <input
                            type="color"
                            value={cardData.fields.colors?.countdownNumbers || '#ffffff'}
                            onChange={(e) => handleColorChange('countdownNumbers', (e.target as HTMLInputElement).value)}
                            class="color-picker"
                          />
                        </div>
                        
                        <div class="color-control">
                          <label>لون تسميات العد التنازلي</label>
                          <input
                            type="color"
                            value={cardData.fields.colors?.countdownLabels || '#ffffff'}
                            onChange={(e) => handleColorChange('countdownLabels', (e.target as HTMLInputElement).value)}
                            class="color-picker"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Event Section Color Controls */}
                    <div class="color-section">
                      <h4>تخصيص ألوان قسم الإحتفال</h4>
                      <div class="color-controls">
                        <div class="color-control">
                          <label>خلفية قسم الإحتفال</label>
                          <input
                            type="color"
                            value={cardData.fields.colors?.eventBackground || '#ffffff'}
                            onChange={(e) => handleColorChange('eventBackground', (e.target as HTMLInputElement).value)}
                            class="color-picker"
                          />
                        </div>
                        
                        <div class="color-control">
                          <label>حدود قسم الإحتفال</label>
                          <input
                            type="color"
                            value={cardData.fields.colors?.eventBorder || '#d4af37'}
                            onChange={(e) => handleColorChange('eventBorder', (e.target as HTMLInputElement).value)}
                            class="color-picker"
                          />
                        </div>
                        
                        {/* Gifts Section Color Controls */}
                        <div class="color-control">
                          <label>خلفية قسم الهدايا</label>
                          <input
                            type="color"
                            value={cardData.fields.colors?.giftsBackground || '#ffffff'}
                            onChange={(e) => handleColorChange('giftsBackground', (e.target as HTMLInputElement).value)}
                            class="color-picker"
                          />
                        </div>
                        
                        <div class="color-control">
                          <label>حدود قسم الهدايا</label>
                          <input
                            type="color"
                            value={cardData.fields.colors?.giftsBorder || '#d4af37'}
                            onChange={(e) => handleColorChange('giftsBorder', (e.target as HTMLInputElement).value)}
                            class="color-picker"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Music & Animation Section */}
              <div class="music-animation-section">
                <h4>🎵 Music & Animation</h4>
                
                {/* Music Upload */}
                <div class="music-upload-section">
                  <h5>Background Music</h5>
                  {cardData.fields.backgroundMusic ? (
                    <div class="music-preview">
                      <div class="music-info">
                        <span class="music-icon">🎵</span>
                        <span class="music-name">{cardData.fields.musicFileName || 'Background Music'}</span>
                      </div>
                      <div class="music-controls">
                        <audio controls src={cardData.fields.backgroundMusic} class="audio-preview">
                          Your browser does not support the audio element.
                        </audio>
                        <button class="btn-remove-music" onClick={handleRemoveMusic}>
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div class="music-upload">
                      <button 
                        class="btn-upload-music" 
                        onClick={handleMusicChange}
                        disabled={uploadingMusic}
                      >
                        {uploadingMusic ? '⏳ Uploading...' : '🎵 Upload Music'}
                      </button>
                      <p class="upload-hint">MP3, WAV, OGG (Max 10MB)</p>
                    </div>
                  )}
                </div>

                {/* Animation Controls */}
                <div class="animation-controls">
                  <h5>Animation Settings</h5>
                  <div class="animation-toggle">
                    <label class="toggle-label">
                      <input
                        type="checkbox"
                        checked={cardData.fields.enableAnimations !== false}
                        onChange={(e) => handleFieldUpdate('enableAnimations', (e.target as HTMLInputElement).checked)}
                        class="toggle-checkbox"
                      />
                      <span class="toggle-slider"></span>
                      Enable Animations
                    </label>
                  </div>

                  {cardData.fields.enableAnimations !== false && (
                    <div class="animation-style-selector">
                      <label>Animation Style</label>
                      <select
                        value={cardData.fields.animationStyle || 'gentle'}
                        onChange={(e) => handleFieldUpdate('animationStyle', (e.target as HTMLSelectElement).value)}
                        class="animation-select"
                      >
                        <option value="gentle">Gentle</option>
                        <option value="elegant">Elegant</option>
                        <option value="festive">Festive</option>
                        <option value="romantic">Romantic</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div class="field-list">
                {Object.entries(cardData.fields).map(([key, value]) => {
                  // Skip color and custom fields that have their own sections
                  if (key === 'colors' || key === 'customMonogram' || key === 'groomName' || key === 'brideName') {
                    return null;
                  }
                  
                  return (
                    <div key={key} class="field-item">
                      <label>{getFieldLabel(key)}</label>
                      {key.includes('Date') ? (
                        <input
                          type="date"
                          value={value}
                          onChange={(e) => handleFieldUpdate(key, (e.target as HTMLInputElement).value)}
                          class="field-input"
                        />
                      ) : key.includes('Time') ? (
                        <input
                          type="time"
                          value={value}
                          onChange={(e) => handleFieldUpdate(key, (e.target as HTMLInputElement).value)}
                          class="field-input"
                        />
                      ) : key === 'quranVerse' || key === 'descriptionMessage' ? (
                        <textarea
                          value={value}
                          onChange={(e) => handleFieldUpdate(key, (e.target as HTMLTextAreaElement).value)}
                          class="field-textarea"
                          rows={3}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleFieldUpdate(key, (e.target as HTMLInputElement).value)}
                          class="field-input"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div class="editor-canvas">
            <EditableCard 
              cardData={cardData}
              onFieldUpdate={handleFieldUpdate}
              isEditing={isEditing}
              cardWidth={cardWidth}
            />
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <input
          ref={musicInputRef}
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={handleMusicFileSelect}
        />
      </div>
    );
  }

  // Fallback
  return <CardTemplates onTemplateSelect={handleTemplateSelect} />;
}

function getFieldLabel(fieldKey: string): string {
  const labels: { [key: string]: string } = {
    logo: 'Logo Image',
    eventTitle: 'Event Title',
    quranVerse: 'Quran Verse',
    descriptionMessage: 'Description Message',
    groomFather: 'Groom Father (والد العريس)',
    brideFather: 'Bride Father (والد العروس)',
    weddingDate: 'Wedding Date',
    weddingTime: 'Wedding Time',
    weddingDay: 'Wedding Day',
    venue: 'Venue Name',
    location: 'Location',
    coordinates: 'GPS Coordinates',
    omtNumber: 'OMT Account',
    wishMoneyUsername: 'Wish Money Username',
  };
  return labels[fieldKey] || fieldKey;
}