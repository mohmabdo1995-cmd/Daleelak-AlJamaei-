import { Subject, StudyResource, ArticleItem, VideoItem } from '../types';

export const COLLEGE_INFO = {
  title: "معلومات عن الكلية والمواد الدراسية",
  tagline: "دليلك الشامل لرحلتك الأكاديمية والجامعية",
  image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  overview: `مرحباً بك في رحلتك الجامعية. هذه المرحلة تعتبر من أهم المراحل التعليمية في حياتك، حيث تجمع بين المعرفة العلمية العميقة والخبرة العملية والبحثية. يتطلب النجاح الأكاديمي الانضباط الذاتي، تنظيم الوقت، والفهم العميق للمواد الأساسية.`,
  creditSystem: `يعتمد النظام الأكاديمي على الساعات المعتمدة (Credit Hours) والنظام السنوي/الفصلي. يتوزع التقييم بين الاختبارات النصفية (Midterm Examinations)، الاختبارات العملية (Practical Exams)، والتقييم المستمر والأنشطة، بالإضافة إلى الاختبار النهائي (Final Examination).`,
  survivalTips: [
    {
      title: "التنظيم والتخطيط اليومي",
      description: "قم بجدولة محاضراتك وساعات المذاكرة اليومية فوراً ولا تترك المواد لتتراكم قبل الامتحانات."
    },
    {
      title: "فهم المصطلحات الأكاديمية (Medical & Academic Terms)",
      description: "ركز في البداية على حفظ وفهم المصطلحات باللغة الإنجليزية مثل Anatomy, Physiology, Biochemistry لأنها اللبنة الأساسية لفهم باقي العلوم."
    },
    {
      title: "المذاكرة من المراجع والمصادر التفاعلية",
      description: "اعتمد على الفيديوهات التوضيحية، الأطلس الطبي، والملخصات المعتمدة إلى جانب المحاضرات الرسمية."
    },
    {
      title: "حساب المعدل التراكمي (GPA)",
      description: "حافظ على معدل مرتفع في السنوات الأولى (Basic Sciences) لأنها تؤثر بشكل كبير على معدلك النهائي."
    }
  ]
};

export const SUBJECTS_DATA: Subject[] = [
  {
    id: 'anatomy',
    nameAr: 'علم التشريح',
    nameEn: 'Anatomy',
    code: 'ANAT-101',
    icon: 'Activity',
    color: 'from-rose-500 to-pink-600',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
    description: 'دراسة التركيب البنائي لجسم الإنسان والأعضاء والأنسجة المختلفة والعلاقات المتبادلة بينها.',
    credits: 4,
    overview: 'يُعد علم التشريح Anatomy حجر الزاوية في العلوم الطبية والصحية. يتعلم الطالب من خلاله التراكيب العيانية (Gross Anatomy) والتركيب الدقيق (Histology) وعلم الجنين (Embryology)، مما يمكنه من فهم الموقع التشريحي والعلاقات البنائية لكل عضو في الجسم.',
    keyTopics: [
      'Upper and Lower Limbs (الأطراف العلوية والسفلية)',
      'Thorax and Abdomen (الصدر والبطن)',
      'Head and Neck (الرأس والرقبة)',
      'Neuroanatomy (التشريح العصبي)',
      'General Embryology (علم الجنين العام)'
    ],
    studyTips: [
      'استخدم الأطلس التشريحي المصور (Atlas of Human Anatomy) بشكل دائم.',
      'اربط الفهم النظري بالعينات العملية والجثث (Cadavers) في المشرحة.',
      'ارسم المخططات التشريحية بنفسك لتثبيت المواقع والأعصاب والأوعية الدموية.'
    ],
    recommendedBooks: [
      'Gray\'s Anatomy for Students',
      'Netter\'s Atlas of Human Anatomy',
      'Snell\'s Clinical Anatomy by Regions'
    ],
    lectureTopics: [
      { id: 'anat-1', titleAr: 'مقدمة في المصطلحات التشريحية', titleEn: 'Introduction to Anatomical Terms', duration: '2 ساعة', summary: 'تعريف الوضع التشريحي القياسي والمستويات التشريحية (Sagittal, Coronal, Transverse).' },
      { id: 'anat-2', titleAr: 'تشريح الجهاز الهيكلي', titleEn: 'Skeletal System Anatomy', duration: '3 ساعات', summary: 'دراسة العظام والترابطات المفصلية وأنواع المفاصل في الجسم.' },
      { id: 'anat-3', titleAr: 'تشريح الجهاز العضلي', titleEn: 'Muscular System & Attachments', duration: '3 ساعات', summary: 'المنشأ (Origin)، المغرس (Insertion)، والتعصيب (Innervation) للعضلات الرئيسية.' }
    ]
  },
  {
    id: 'physiology',
    nameAr: 'علم وظائف الأعضاء',
    nameEn: 'Physiology',
    code: 'PHYS-102',
    icon: 'HeartPulse',
    color: 'from-red-500 to-amber-600',
    image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
    description: 'دراسة الآليات الوظيفية لكافة أجهزة الجسم وكيفية عمل الخلايا والأعضاء للحفاظ على التوازن الداخلي.',
    credits: 4,
    overview: 'يهدف مقرر علم وظائف الأعضاء Physiology إلى تفسير العمليات الحيوية والفيزيائية والكيميائية التي تحدث داخل جسم الإنسان الصحيح. يغطي التوازن الداخلي (Homeostasis)، عمل القلب والأوعية الدموية، التنفس، الإخراج، والنظام العصبي الهرموني.',
    keyTopics: [
      'Cell Physiology and Homeostasis',
      'Cardiovascular System (جهاز الدوران والقلب)',
      'Respiratory Physiology (الجهاز التنفسي)',
      'Renal Physiology (الجهاز البولي والجملة الكلوية)',
      'Endocrinology and Metabolism (الغدد الصماء والتمثيل الغذائي)'
    ],
    studyTips: [
      'افهم المخططات والرسومات البيانية (Flowcharts) بدلاً من الحفظ البصم.',
      'اربط الوظيفة بالتركيب التشريحي لكل عضو.',
      'حل الأسئلة التفاعلية وتجارب المختبر لفهم الضغط والترشيح والإشارات العصبية.'
    ],
    recommendedBooks: [
      'Guyton and Hall Textbook of Medical Physiology',
      'Costanzo Physiology',
      'Ganong\'s Review of Medical Physiology'
    ],
    lectureTopics: [
      { id: 'phys-1', titleAr: 'التوازن الداخلي وآليات التغذية الراجعة', titleEn: 'Homeostasis & Feedback Loops', duration: '2 ساعة', summary: 'التعرف على التغذية الراجعة السلبية والإيجابية وكيفية ضبط بيئة الخلية.' },
      { id: 'phys-2', titleAr: 'ديناميكية عمل القلب', titleEn: 'Cardiac Cycle & Action Potential', duration: '3 ساعات', summary: 'دراسة الدورة القلبية والجهد الفعلي لعضلة القلب وتخطيط القلب (ECG).' },
      { id: 'phys-3', titleAr: 'وظائف الكلية وتبادل الغازات', titleEn: 'Renal Filtration & Respiratory Mechanics', duration: '3 ساعات', summary: 'آليات معدل الترشيح الكبيبي (GFR) والتبادل الغازي في الرئتين.' }
    ]
  },
  {
    id: 'biochemistry',
    nameAr: 'الكيمياء الحيوية',
    nameEn: 'Biochemistry',
    code: 'BIOC-103',
    icon: 'Dna',
    color: 'from-emerald-500 to-teal-600',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    description: 'دراسة الجزيئات الحيوية، التفاعلات الكيميائية، ومسارات الأيض الطاقة داخل الخلية الحية.',
    credits: 3,
    overview: 'تبحث الكيمياء الحيوية Biochemistry في المكونات الكيميائية للخلايا من بروتينات، كربوهيدرات، دهون، وأحماض نووية DNA & RNA. تشمل دراسة مسارات الأيض (Metabolic Pathways) وإنتاج الطاقة (ATP) وعمل الإنزيمات.',
    keyTopics: [
      'Carbohydrate Metabolism (Glycolysis, Krebs Cycle)',
      'Lipid & Amino Acid Metabolism',
      'Enzymes & Kinetics (الإنزيمات وحركيتها)',
      'Molecular Biology & Gene Expression',
      'Hormonal Regulation of Metabolism'
    ],
    studyTips: [
      'ارسم خريطة الأيض (Metabolic Map) لربط حلقة كريبس وباقي المسارات.',
      'ركز على الإنزيمات المحددة للسرعة (Key Regulatory Enzymes).',
      'احفظ الصيغ البنائية والمجموعات الوظيفية المهمة.'
    ],
    recommendedBooks: [
      'Lippincott Illustrated Reviews: Biochemistry',
      'Harper\'s Illustrated Biochemistry',
      'Lehninger Principles of Biochemistry'
    ],
    lectureTopics: [
      { id: 'bioc-1', titleAr: 'تركيب ووظائف البروتينات والإنزيمات', titleEn: 'Protein Structure & Enzyme Catalysis', duration: '2 ساعة', summary: 'أنواع التركيب البروتيني وآلية تثبيط وتنشيط الفعالية الإنزيمية.' },
      { id: 'bioc-2', titleAr: 'تحلل الجلوكوز وإنتاج الطاقة', titleEn: 'Glycolysis & ATP Production', duration: '3 ساعات', summary: 'خطوات مسار تحلل السكر ومحصلة الطاقة في الظروف الهوائية واللاهوائية.' }
    ]
  },
  {
    id: 'microbiology',
    nameAr: 'علم الأحياء الدقيقة',
    nameEn: 'Microbiology',
    code: 'MICR-201',
    icon: 'Bug',
    color: 'from-purple-500 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80',
    description: 'دراسة الكائنات المجهرية من بكتيريا، فيروسات، فطريات، وطفيليات واستجابة المناعة ضدها.',
    credits: 3,
    overview: 'يتناول علم الأحياء الدقيقة Microbiology دراسة الكائنات الحية الدقيقة المسببة للأمراض الإنسانية (Medical Pathogens)، بالإضافة إلى علم المناعة (Immunology) الذي يشرح كفاءة الجسم في التصدي للعدوى.',
    keyTopics: [
      'Bacteriology (علم البكتيريا وتصنيفها)',
      'Virology (علم الفيروسات وآلية استنساخها)',
      'Mycology & Parasitology (الفطريات والطفيليات)',
      'Immunology & Antibodies (علم المناعة والأجسام المضادة)',
      'Sterilization and Infection Control'
    ],
    studyTips: [
      'اصنع جداول مقارنة بين البكتيريا موجبة وسالبة الجرام (Gram-positive & Gram-negative).',
      'ركز على الطرق التشخيصية والفحوصات المخبرية (Culture, Staining, PCR).',
      'احفظ الأعراض السريرية المميزة لكل كائن مجهري.'
    ],
    recommendedBooks: [
      'Jawetz, Melnick, & Adelberg\'s Medical Microbiology',
      'Lippincott Illustrated Reviews: Microbiology',
      'Review of Medical Microbiology and Immunology by Levinson'
    ],
    lectureTopics: [
      { id: 'micr-1', titleAr: 'تصنيف البكتيريا وصبغة جرام', titleEn: 'Bacterial Classification & Gram Stain', duration: '2 ساعة', summary: 'الفرق بين الجدار الخلوي للبكتيريا وخطوات التلوين المخبري.' },
      { id: 'micr-2', titleAr: 'استجابة المناعة الفطرية والمكتسبة', titleEn: 'Innate & Adaptive Immunity', duration: '3 ساعات', summary: 'دور الخلايا التائية والبائية والخلايا البلاعم في خطوط الدفاع.' }
    ]
  },
  {
    id: 'pathology',
    nameAr: 'علم الأمراض',
    nameEn: 'Pathology',
    code: 'PATH-202',
    icon: 'Stethoscope',
    color: 'from-blue-600 to-cyan-600',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    description: 'دراسة أسباب الأمراض، الآليات المرضية، والتغيرات النسيجية والوظيفية المصاحبة لها.',
    credits: 4,
    overview: 'يُعتبر علم الأمراض Pathology الجسر الناقل بين العلوم الأساسية والعلوم السريرية. يدرس التكيف الخلوي (Cellular Adaptation)، التهاب الأنسجة (Inflammation)، والتنشؤات الأورامية (Neoplasia).',
    keyTopics: [
      'Cell Injury, Death, and Adaptation',
      'Acute and Chronic Inflammation',
      'Neoplasia and Tumor Biology (الأورام السرطانية)',
      'Hemodynamic Disorders & Thrombus',
      'Systemic Pathology (أمراض الأجهزة)'
    ],
    studyTips: [
      'افهم السلسلة السببية: السبب (Etiology) -> الآلية (Pathogenesis) -> التغير النسيجي (Morphology) -> الأعراض (Clinical Manifestation).',
      'احرص على فحص الشرائح المجهرية (Histopathological Slides) بانتظام.'
    ],
    recommendedBooks: [
      'Robbins & Cotran Pathologic Basis of Disease',
      'Pathoma: Fundamentals of Pathology by Dr. Sattar',
      'Rubin\'s Pathology'
    ],
    lectureTopics: [
      { id: 'path-1', titleAr: 'موت الخلايا والتكيف الخلوي', titleEn: 'Necrosis, Apoptosis & Adaptation', duration: '3 ساعات', summary: 'الأنواع المختلفة للموت الخلوي (Coagulative, Liquefactive) والتكيفات كالضمور والتضخم.' },
      { id: 'path-2', titleAr: 'الالتهاب الحاد والمزمن', titleEn: 'Acute & Chronic Inflammation', duration: '3 ساعات', summary: 'الهجرة الخلوية ووسائط الالتهاب الكيميائية وترميم الأنسجة.' }
    ]
  },
  {
    id: 'pharmacology',
    nameAr: 'علم الأدوية',
    nameEn: 'Pharmacology',
    code: 'PHAR-203',
    icon: 'Pill',
    color: 'from-amber-500 to-orange-600',
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=800&q=80',
    description: 'دراسة تأثير الأدوية والمركبات الكيميائية على الجسم وآليات عملها واستخداماتها العلاجية.',
    credits: 4,
    overview: 'يركز مقرر علم الأدوية Pharmacology على جانبين رئيسيين: حركية الدواء (Pharmacokinetics: Absorption, Distribution, Metabolism, Excretion) وتأثير الدواء (Pharmacodynamics: Receptor interaction, Agonist/Antagonist).',
    keyTopics: [
      'Pharmacokinetics & Pharmacodynamics',
      'Autonomic Nervous System Drugs',
      'Cardiovascular Pharmacology',
      'Antimicrobial Agents & Antibiotics',
      'Toxicology and Side Effects'
    ],
    studyTips: [
      'صنف الأدوية في مجموعات (Drug Families) بناءً على آلية العمل (Mechanism of Action).',
      'احفظ الاستطبابات الشائعة (Indications) والآثار الجانبية الخطيرة (Adverse Effects).',
      'اصنع بطاقات استذكار تكرارية (Flashcards) للأسماء العلمية والتجارية.'
    ],
    recommendedBooks: [
      'Lippincott Illustrated Reviews: Pharmacology',
      'Katzung\'s Basic and Clinical Pharmacology',
      'Goodman & Gilman\'s The Pharmacological Basis of Therapeutics'
    ],
    lectureTopics: [
      { id: 'phar-1', titleAr: 'حركية وديناميكية الدواء', titleEn: 'Pharmacokinetics & Receptor Theory', duration: '2 ساعة', summary: 'مفاهيم التوافر الحيوي (Bioavailability) وفترة النصف الحيوية (Half-life).' },
      { id: 'phar-2', titleAr: 'المضادات الحيوية وآلية تصنيفها', titleEn: 'Antibiotics & Mechanisms of Action', duration: '3 ساعات', summary: 'مثبطات الجدار الخلوي، مثبطات تصنيع البروتينات، ومقاومة البكتيريا للأدوية.' }
    ]
  }
];

export const STUDY_RESOURCES: StudyResource[] = [
  {
    id: 'tg-bot',
    title: 'بوت التلجرام الأكاديمي الرسمي',
    subjectId: 'general',
    category: 'telegram',
    description: 'المساعد الذكي لتصفح الكتب، المذكرات، أسئلة السنوات السابقة، والتجميعات الدراسية فورياً عبر التلجرام.',
    link: 'http://t.me/Daleelak_AlJamaei_bot',
    isExternal: true,
    icon: 'Send'
  },
  {
    id: 'res-anatomy-atlas',
    title: 'أطلس التشريح التفاعلي (Interactive Anatomy Atlas)',
    subjectId: 'anatomy',
    category: 'book',
    description: 'نماذج ثلاثية الأبعاد تفاعلية لجميع أعصاب وعظام وعضلات جسم الإنسان.',
    link: 'https://openstax.org/details/books/anatomy-and-physiology-2e',
    isExternal: true,
    icon: 'BookOpen'
  },
  {
    id: 'res-khan-med',
    title: 'سلسلة المحاضرات الطبية والعلوم الحيوية',
    subjectId: 'physiology',
    category: 'video',
    description: 'شروحات مبسطة وشاملة في علم وظائف الأعضاء والكيمياء الحيوية.',
    link: 'https://www.khanacademy.org/science/health-and-medicine',
    isExternal: true,
    icon: 'Video'
  },
  {
    id: 'res-notes-drive',
    title: 'بنك التلخيصات وأسئلة الامتحانات (Question Bank & Summaries)',
    subjectId: 'general',
    category: 'notes',
    description: 'مكتبة شاملة تحتوي على ملفات PDF، أسئلة اختيارات متعددة (MCQs)، وتلخيصات مراجعة قبل الامتحان.',
    link: 'http://t.me/Daleelak_AlJamaei_bot',
    isExternal: true,
    icon: 'FileText'
  }
];

export const DEFAULT_ARTICLES: ArticleItem[] = [
  {
    id: 'art-study-habits',
    title: 'دليلك الشامل لتنظيم وقت المذاكرة والتفوق الأكاديمي',
    subtitle: 'استراتيجيات عملية مجربة لإدارة ساعات الدراسة ومقاومة التشتت اليومي',
    category: 'إرشادات دراسية',
    status: 'published',
    author: 'هيئة الإرشاد الأكاديمي',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
    content: `# دليلك الشامل لتنظيم وقت المذاكرة والتفوق الأكاديمي

النجاح في المرحلة الجامعية لا يعتمد فقط على عدد ساعات الجلوس أمام الكتب، بل على **نوعية وفاعلية إدارة الوقت**.

## 1. تقنية بومودورو الأكاديمية (Pomodoro Technique)
- قسّم جلسات المذاكرة إلى فترات مركزة مدتها 25 إلى 30 دقيقة.
- خذ استراحة قصيرة مدتها 5 دقائق لتنشيط الذهن.
- بعد 4 جلسات متتالية، خذ استراحة أطول تتراوح بين 15 إلى 20 دقيقة.

## 2. جدول المراجعة الأسبوعي (Active Recall)
لا تكتفِ بإعادة قراءة المذكرات فقط، بل اختبر نفسك باستمرار:
- حل أسئلة نهاية كل فصل.
- قم بشرح المفهوم لزميل دراسي أو لنفسك بصوت مسموع.
- دوّن النقاط الغامضة لطرحها على أستاذ المادة فوراً.

> "التنظيم هو نصف التفوق الأكاديمي، والمذاكرة اليومية المنتظمة تحميك من ضغط ليلة الامتحان."`
  },
  {
    id: 'art-anatomy-mastery',
    title: 'خارطة طريق إتقان مادة علم التشريح (Human Anatomy)',
    subtitle: 'كيفية التعامل مع المصطلحات اللاتينية، الأطلس التشريحي، والمشرحة',
    category: 'العلوم الأساسية',
    status: 'published',
    author: 'قسم العلوم الطبية',
    coverImage: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-03-02T11:00:00.000Z',
    updatedAt: '2026-03-02T11:00:00.000Z',
    content: `# خارطة طريق إتقان مادة علم التشريح (Human Anatomy)

يُعتبر علم التشريح حجر الزاوية لكل طالب في التخصصات الطبية والصحية.

## المفاتيح الذهبية للتفوق في التشريح:
- **الأطلس المصور رفيقك الدائم:** لا تحفظ نصاً تشريحياً دون النظر إلى الصورة ثلاثية الأبعاد المرافقة له.
- **تفكيك المصطلحات:** أغلب الكلمات التشريحية أصلها لاتيني أو إغريقي، فمعرفة المعنى البادئ واللاحق يسهل الحفظ بنسبة 70%.
- **الرسم اليدوي المبسط:** قم برسم مخططات بسيطة للشرايين والأوردة ومسارات الأعصاب لترسيخ الذاكرة المكانية.`
  },
  {
    id: 'art-gpa-strategy',
    title: 'كيف تحسب وتضمن استقرار معدلك التراكمي (GPA)',
    subtitle: 'تأثير الساعات المعتمدة في السنوات التأسيسية وأهمية كل درجة',
    category: 'الإرشاد الأكاديمي',
    status: 'published',
    author: 'وحدة التوجيه الطلابي',
    coverImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-03-03T12:00:00.000Z',
    updatedAt: '2026-03-03T12:00:00.000Z',
    content: `# كيف تحسب وتضمن استقرار معدلك التراكمي (GPA)

المعدل التراكمي هو مقياس أدائك الأكاديمي الإجمالي، ورفعه في الفصول الأولى أسهل بكثير من رفعه لاحقاً.

## نصائح استراتيجية:
1. ركز جهدك الأكبر على المواد ذات الساعات المعتمدة الأعلى (3 و 4 ساعات).
2. استغل حاسبة المعدل التراكمي المدمجة في الموقع لمعرفة الدرجات المطلوبة قبل دخول الامتحانات النهائية.
3. التقييم المستمر والاختبارات الدورية القصيرة (Quizzes) قد تحسم الفارق بين تقدير وآخر.`
  }
];

export const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 'vid-anatomy-intro',
    title: 'مقدمة شاملة في المصطلحات والمستويات التشريحية (Anatomical Terms)',
    description: 'شرح مبسط وواضح للأوضاع والمستويات التشريحية القياسية والحركات الميدانية لجسم الإنسان.',
    videoUrl: 'https://www.youtube.com/watch?v=uBGl2BujkPQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
    duration: '14:20',
    order: 1,
    visible: true,
    fileType: 'video/mp4',
    createdAt: '2026-03-01T10:00:00.000Z'
  },
  {
    id: 'vid-physiology-membrane',
    title: 'شرح فيسيولوجيا الخلية وجهد الغشاء والسيال العصبي (Membrane Potential)',
    description: 'فهم دقيق لانتقال الأيونات عبر الغشاء الخلوي، ومضخة الصوديوم والبوتاسيوم، وجهد الفعل والراحة.',
    videoUrl: 'https://www.youtube.com/watch?v=fHrc2gVvLz4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    duration: '18:45',
    order: 2,
    visible: true,
    fileType: 'video/mp4',
    createdAt: '2026-03-02T11:00:00.000Z'
  },
  {
    id: 'vid-spaced-repetition',
    title: 'طريقة المذاكرة الفعالة بنظام التكرار المتباعد (Spaced Repetition)',
    description: 'دليل عملي لتثبيت كميات ضخمة من المعلومات والمصطلحات دون نسيان حتى يوم الاختبار.',
    videoUrl: 'https://www.youtube.com/watch?v=Z-zNHHpXoMM',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    duration: '11:30',
    order: 3,
    visible: true,
    fileType: 'video/mp4',
    createdAt: '2026-03-03T12:00:00.000Z'
  }
];
