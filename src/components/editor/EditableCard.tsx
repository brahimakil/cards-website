import { useState, useEffect, useRef } from 'preact/hooks';

// Define CardData interface locally to avoid import/export issues
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

interface EditableCardProps {
  cardData: CardData;
  onFieldUpdate: (fieldName: string, value: any) => void;
  isEditing: boolean;
  cardWidth: number;
}

export default function EditableCard({ cardData, onFieldUpdate, isEditing, cardWidth }: EditableCardProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Add audio ref and animation state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const weddingDate = new Date(cardData.fields.weddingDate + ' ' + cardData.fields.weddingTime);
      const now = new Date();
      const difference = weddingDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [cardData.fields.weddingDate, cardData.fields.weddingTime]);

  const handleLocationClick = () => {
    const coordinates = cardData.fields.coordinates || '24.7136,46.6753';
    const url = `https://www.google.com/maps/search/?api=1&query=${coordinates}`;
    window.open(url, '_blank');
  };

  const getDefaultMonogram = () => {
    const groomFirst = cardData.fields.groomName?.trim()?.charAt(0) || 'ع';
    const brideFirst = cardData.fields.brideName?.trim()?.charAt(0) || 'ز';
    return `${groomFirst} & ${brideFirst}`;
  };

  const colors = cardData.fields.colors || {};

  // Add animation effect based on style
  const getAnimationClass = (style: string, enableAnimations: boolean) => {
    if (!enableAnimations) return '';
    
    switch (style) {
      case 'gentle':
        return 'gentle-animations';
      case 'elegant':
        return 'elegant-animations';
      case 'festive':
        return 'festive-animations';
      case 'romantic':
        return 'romantic-animations';
      default:
        return 'gentle-animations';
    }
  };

  // Update the main card wrapper to include animations and music
  const renderWeddingCard = () => {
    const animationClass = getAnimationClass(
      cardData.fields.animationStyle || 'gentle',
      cardData.fields.enableAnimations !== false
    );

    return (
      <div 
        class={`card-preview wedding-card-professional ${animationClass}`}
        style={{
          backgroundImage: cardData.backgroundImage ? `url(${cardData.backgroundImage})` : 'linear-gradient(135deg, #f8f6f0 0%, #e8dcc0 100%)',
          width: `${cardWidth}px`
        }}
      >
        {/* Background Music */}
        {cardData.fields.backgroundMusic && (
          <audio
            ref={audioRef}
            src={cardData.fields.backgroundMusic}
            loop
            autoPlay={false}
            style={{ display: 'none' }}
          />
        )}

        {/* Music Control Button */}
        {cardData.fields.backgroundMusic && (
          <div class="music-control-floating">
            <button
              class="btn-music-toggle"
              onClick={() => {
                if (audioRef.current) {
                  if (isPlaying) {
                    audioRef.current.pause();
                    setIsPlaying(false);
                  } else {
                    audioRef.current.play();
                    setIsPlaying(true);
                  }
                }
              }}
              title={isPlaying ? 'إيقاف الموسيقى' : 'تشغيل الموسيقى'}
            >
              {isPlaying ? '🔊' : '🔇'}
            </button>
          </div>
        )}

        <div class="card-content-professional"
          style={{
            '--section-background': colors.titleBackground || '#ffffff',
            '--section-border': colors.titleBorder || '#d4af37'
          }}
        >
          
          {/* Logo Section */}
          <div class="logo-section-professional floating-element">
            {cardData.fields.logo ? (
              <img src={cardData.fields.logo} alt="Logo" class="wedding-logo" />
            ) : (
              <div class="default-logo">
                <div 
                  class="monogram-professional"
                  style={{
                    background: `linear-gradient(135deg, ${colors.logoBackground || '#d4af37'}, ${colors.logoBorder || '#f4e4bc'})`,
                    borderColor: colors.logoBorder || '#d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}
                >
                  <span 
                    class="editable-field monogram-text"
                    contentEditable={isEditing}
                    onBlur={(e) => {
                      const content = (e.target as HTMLElement).textContent || '';
                      if (content !== getDefaultMonogram()) {
                        onFieldUpdate('customMonogram', content);
                      }
                    }}
                    suppressContentEditableWarning={true}
                    style={{
                      display: 'inline-block',
                      lineHeight: '1',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}
                  >
                    {cardData.fields.customMonogram || getDefaultMonogram()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Professional Data Section */}
          <div class="professional-data-section fade-in-up">
            <div 
              class="data-frame"
              style={{
                backgroundColor: colors.titleBackground || '#ffffff',
                borderColor: colors.titleBorder || '#d4af37',
                boxShadow: `0 8px 25px rgba(0,0,0,0.1), 0 0 0 5px ${colors.titleBorder || '#d4af37'}33`
              }}
            >
              <div 
                class="editable-field main-title-professional animate-fade-in"
                contentEditable={isEditing}
                onBlur={(e) => onFieldUpdate('eventTitle', (e.target as HTMLElement).textContent)}
                suppressContentEditableWarning={true}
              >
                {cardData.fields.eventTitle || 'دعوة زفاف'}
              </div>
              <div 
                class="decorative-line"
                style={{
                  background: `linear-gradient(90deg, ${colors.titleBorder || '#d4af37'}, ${colors.logoBorder || '#f4e4bc'}, ${colors.titleBorder || '#d4af37'})`
                }}
              ></div>
            </div>
          </div>

          {/* Quran Section */}
          <div 
            class="quran-section slide-in-left"
            style={{
              backgroundColor: colors.quranBackground || '#ffffff',
              borderColor: colors.quranBorder || '#d4af37'
            }}
          >
            <div class="quran-decoration">
              <div 
                class="islamic-pattern"
                style={{
                  background: `repeating-linear-gradient(45deg, ${colors.quranBorder || '#d4af37'}, ${colors.quranBorder || '#d4af37'} 2px, transparent 2px, transparent 8px)`
                }}
              ></div>
              <div 
                class="editable-field quran-text animate-slide-in"
                contentEditable={isEditing}
                onBlur={(e) => onFieldUpdate('quranVerse', (e.target as HTMLElement).textContent)}
                suppressContentEditableWarning={true}
              >
                {cardData.fields.quranVerse || 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ'}
              </div>
              <div class="verse-reference">سورة الروم - آية 21</div>
              <div 
                class="islamic-pattern"
                style={{
                  background: `repeating-linear-gradient(45deg, ${colors.quranBorder || '#d4af37'}, ${colors.quranBorder || '#d4af37'} 2px, transparent 2px, transparent 8px)`
                }}
              ></div>
            </div>
          </div>

          {/* Description Message Section */}
          <div 
            class="description-section"
            style={{
              backgroundColor: colors.titleBackground || '#ffffff',
              borderColor: colors.titleBorder || '#d4af37'
            }}
          >
            <div 
              class="editable-field description-text animate-fade-in"
              contentEditable={isEditing}
              onBlur={(e) => onFieldUpdate('descriptionMessage', (e.target as HTMLElement).textContent)}
              suppressContentEditableWarning={true}
            >
              {cardData.fields.descriptionMessage || 'بكل حب وتقدير، نتشرف بدعوتكم لحضور حفل زفافنا المبارك، ونسأل الله أن يجمعنا على خير في هذه المناسبة السعيدة'}
            </div>
          </div>

          {/* Names Section */}
          <div 
            class="names-section-professional scale-in"
            style={{
              backgroundColor: colors.titleBackground || '#ffffff',
              borderColor: colors.titleBorder || '#d4af37'
            }}
          >
            <div class="names-container">
              <div class="name-block-professional">
                <div class="name-title">العريس</div>
                <div 
                  class="editable-field groom-name-professional animate-slide-left"
                  contentEditable={isEditing}
                  onBlur={(e) => onFieldUpdate('groomName', (e.target as HTMLElement).textContent)}
                  suppressContentEditableWarning={true}
                >
                  {cardData.fields.groomName || 'اسم العريس'}
                </div>
                <div 
                  class="editable-field father-name-professional"
                  contentEditable={isEditing}
                  onBlur={(e) => onFieldUpdate('groomFather', (e.target as HTMLElement).textContent)}
                  suppressContentEditableWarning={true}
                >
                  {cardData.fields.groomFather || 'والد العريس'}
                </div>
              </div>

              <div class="heart-separator">💕</div>

              <div class="name-block-professional">
                <div class="name-title">العروس</div>
                <div 
                  class="editable-field bride-name-professional animate-slide-right"
                  contentEditable={isEditing}
                  onBlur={(e) => onFieldUpdate('brideName', (e.target as HTMLElement).textContent)}
                  suppressContentEditableWarning={true}
                >
                  {cardData.fields.brideName || 'اسم العروس'}
                </div>
                <div 
                  class="editable-field father-name-professional"
                  contentEditable={isEditing}
                  onBlur={(e) => onFieldUpdate('brideFather', (e.target as HTMLElement).textContent)}
                  suppressContentEditableWarning={true}
                >
                  {cardData.fields.brideFather || 'والد العروس'}
                </div>
              </div>
            </div>
          </div>

          {/* Date with Countdown Section */}
          <div 
            class="date-countdown-section pulse-glow"
            style={{
              '--date-bg-start': colors.dateBgStart || '#d4af37',
              '--date-bg-end': colors.dateBgEnd || '#f4e4bc',
              '--date-border': colors.dateBorder || 'rgba(255,255,255,0.3)',
              '--wedding-date-color': colors.weddingDateColor || '#ffffff',
              '--countdown-numbers': colors.countdownNumbers || '#ffffff',
              '--countdown-labels': colors.countdownLabels || '#ffffff'
            } as any}
          >
            <div class="main-date">
              <div 
                class="editable-field wedding-date-display"
                contentEditable={isEditing}
                onBlur={(e) => onFieldUpdate('weddingDate', (e.target as HTMLElement).textContent)}
                suppressContentEditableWarning={true}
              >
                {cardData.fields.weddingDate || '2025-06-15'}
              </div>
            </div>
            
            <div class="countdown-timer">
              <div class="countdown-item">
                <div class="countdown-number">{timeLeft.days}</div>
                <div class="countdown-label">يوم</div>
              </div>
              <div class="countdown-item">
                <div class="countdown-number">{timeLeft.hours}</div>
                <div class="countdown-label">ساعة</div>
              </div>
              <div class="countdown-item">
                <div class="countdown-number">{timeLeft.minutes}</div>
                <div class="countdown-label">دقيقة</div>
              </div>
              <div class="countdown-item">
                <div class="countdown-number">{timeLeft.seconds}</div>
                <div class="countdown-label">ثانية</div>
              </div>
            </div>
          </div>

          {/* Separator */}
          <div class="section-separator">
            <div class="separator-icon">🌸</div>
          </div>

          {/* Event Section */}
          <div 
            class="event-section slide-in-right"
            style={{
              backgroundColor: colors.eventBackground || '#ffffff',
              borderColor: colors.eventBorder || '#d4af37'
            }}
          >
            <div class="section-title">الإحتفال</div>
            
            <div class="event-details">
              <div class="event-detail-item">
                <div class="detail-icon">🕒</div>
                <div class="detail-content">
                  <div 
                    class="editable-field event-time"
                    contentEditable={isEditing}
                    onBlur={(e) => onFieldUpdate('weddingTime', (e.target as HTMLElement).textContent)}
                    suppressContentEditableWarning={true}
                  >
                    {cardData.fields.weddingTime || '20:00'}
                  </div>
                  <div 
                    class="editable-field event-day"
                    contentEditable={isEditing}
                    onBlur={(e) => onFieldUpdate('weddingDay', (e.target as HTMLElement).textContent)}
                    suppressContentEditableWarning={true}
                  >
                    {cardData.fields.weddingDay || 'يوم السبت'}
                  </div>
                </div>
              </div>

              <div class="event-detail-item">
                <div class="detail-icon">📍</div>
                <div class="detail-content">
                  <div 
                    class="editable-field venue-name"
                    contentEditable={isEditing}
                    onBlur={(e) => onFieldUpdate('venue', (e.target as HTMLElement).textContent)}
                    suppressContentEditableWarning={true}
                  >
                    {cardData.fields.venue || 'قاعة الاحتفالات'}
                  </div>
                  <div 
                    class="editable-field venue-location"
                    contentEditable={isEditing}
                    onBlur={(e) => onFieldUpdate('location', (e.target as HTMLElement).textContent)}
                    suppressContentEditableWarning={true}
                  >
                    {cardData.fields.location || 'الرياض، المملكة العربية السعودية'}
                  </div>

                </div>
                
              </div>
              <button class="location-button" onClick={handleLocationClick}>
                    خريطة الموقع
                  </button>
            </div>
          </div>

          {/* Another Separator */}
          <div class="section-separator">
            <div class="separator-icon">🌸</div>
          </div>

          {/* Gifts Section */}
          <div 
            class="gifts-section bounce-in"
            style={{
              backgroundColor: colors.giftsBackground || '#ffffff',
              borderColor: colors.giftsBorder || '#d4af37'
            }}
          >
            <div class="section-title">الهدايا</div>
            <div class="gifts-message">
              <p>حضوركم أجمل وأثمن هدية.</p>
              <p>لمن يرغب لائحة الهدايا</p>
              <p>متوفرة في:</p>
            </div>
            
            <div class="payment-options">
              <div 
                class="payment-option"
                style={{
                  backgroundColor: colors.omtBackground || '#ffffff',
                  borderColor: colors.omtBorder || '#d4af37'
                }}
              >
                <div class="payment-title">OMT</div>
                <div 
                  class="editable-field payment-info"
                  contentEditable={isEditing}
                  onBlur={(e) => onFieldUpdate('omtNumber', (e.target as HTMLElement).textContent)}
                  suppressContentEditableWarning={true}
                >
                  {cardData.fields.omtNumber || 'Acc# 03221097'}
                </div>
              </div>
              
              <div 
                class="payment-option"
                style={{
                  backgroundColor: colors.wishMoneyBackground || '#ffffff',
                  borderColor: colors.wishMoneyBorder || '#d4af37'
                }}
              >
                <div class="payment-title">Wish Money</div>
                <div 
                  class="editable-field payment-info"
                  contentEditable={isEditing}
                  onBlur={(e) => onFieldUpdate('wishMoneyUsername', (e.target as HTMLElement).textContent)}
                  suppressContentEditableWarning={true}
                >
                  {cardData.fields.wishMoneyUsername || '@username'}
                </div>
              </div>
            </div>
          </div>

          {/* Final Blessing */}
          <div class="blessing-section">
            <div class="blessing-text">
              شاركونا حب وفرحة يومنا المميز
            </div>
          </div>

          {/* Floating particles animation */}
          {cardData.fields.enableAnimations !== false && (
            <div class="floating-particles">
              <div class="particle particle-1">✨</div>
              <div class="particle particle-2">💫</div>
              <div class="particle particle-3">⭐</div>
              <div class="particle particle-4">🌟</div>
              <div class="particle particle-5">✨</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Only render ONE card based on type
  if (cardData.type === 'wedding') {
    return renderWeddingCard();
  }

  // Birthday card (simplified)
  return (
    <div class="card-canvas" style={{ width: `${cardWidth}px` }}>
      <div 
        class="card-preview birthday-card" 
        style={{
          backgroundImage: cardData.backgroundImage ? `url(${cardData.backgroundImage})` : 'linear-gradient(135deg, #fff9e6 0%, #ffe4b3 100%)',
          width: `${cardWidth}px`
        }}
      >
        <div class="card-content">
          <div class="birthday-header">
            <div 
              class="editable-field birthday-title"
              contentEditable={isEditing}
              onBlur={(e) => onFieldUpdate('celebrantName', (e.target as HTMLElement).textContent)}
              suppressContentEditableWarning={true}
            >
              {cardData.fields.celebrantName}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 