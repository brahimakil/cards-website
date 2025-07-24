interface CardTemplatesProps {
  onTemplateSelect: (type: 'wedding' | 'birthday') => void;
}

export default function CardTemplates({ onTemplateSelect }: CardTemplatesProps) {
  return (
    <div class="card-templates">
      <div class="templates-header">
        <h2>Choose a Template</h2>
        <p>Select a template to start creating your card</p>
      </div>

      <div class="templates-grid">
        <div class="template-card" onClick={() => onTemplateSelect('wedding')}>
          <div class="template-preview wedding-preview">
            <div class="preview-content">
              <div class="preview-logo">💍</div>
              <h3>Wedding Invitation</h3>
              <div class="preview-text">
                <p>العريس والعروس</p>
                <p>حفل الزفاف</p>
                <p>2025/01/01</p>
              </div>
            </div>
          </div>
          <div class="template-info">
            <h4>Wedding Invitation</h4>
            <p>Perfect for wedding ceremonies and celebrations</p>
          </div>
        </div>

        <div class="template-card" onClick={() => onTemplateSelect('birthday')}>
          <div class="template-preview birthday-preview">
            <div class="preview-content">
              <div class="preview-logo">🎂</div>
              <h3>Birthday Invitation</h3>
              <div class="preview-text">
                <p>عيد ميلاد سعيد</p>
                <p>حفلة عيد الميلاد</p>
                <p>2025/01/01</p>
              </div>
            </div>
          </div>
          <div class="template-info">
            <h4>Birthday Invitation</h4>
            <p>Great for birthday parties and celebrations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
