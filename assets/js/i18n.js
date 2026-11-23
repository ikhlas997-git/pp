/* Internationalisation: Arabic (RTL) and English (LTR) */
const DICT = {
  ar: {
    'app.name': 'برنامج الأستاذ', 'app.tagline': 'مساعدك الرقمي في التدريس', 'app.localNote': 'تُحفظ بياناتك محليًا على هذا الجهاز. لا تنسَ أخذ نسخة احتياطية.',
    'nav.dashboard': 'الرئيسية', 'nav.documents': 'ملفاتي الخاصة', 'nav.classes': 'الأقسام', 'nav.students': 'التلاميذ', 'nav.grades': 'صب النقاط',
    'nav.lessons': 'المذكرات', 'nav.exams': 'الفروض والاختبارات', 'nav.exercises': 'التمارين والأمثلة', 'nav.drawings': 'الرسومات', 'nav.settings': 'الإعدادات',
    'search.global': 'ابحث عن تلميذ، وثيقة، فرض، مذكرة...', 'search.none': 'لا توجد نتائج مطابقة',

    'common.add': 'إضافة', 'common.edit': 'تعديل', 'common.delete': 'حذف', 'common.save': 'حفظ', 'common.cancel': 'إلغاء', 'common.close': 'إغلاق',
    'common.ok': 'موافق', 'common.confirm': 'تأكيد', 'common.preview': 'معاينة', 'common.print': 'طباعة', 'common.download': 'تحميل',
    'common.printFile': 'طباعة الملف', 'common.printWithSolution': 'طباعة مع الحل', 'common.import': 'استيراد', 'common.export': 'تصدير',
    'common.all': 'الكل', 'common.actions': 'إجراءات', 'common.back': 'رجوع', 'common.total': 'المجموع', 'common.clear': 'مسح الكل',
    'common.empty': 'لا توجد عناصر بعد', 'common.emptyHint': 'ابدأ بإضافة أول عنصر.', 'common.noResults': 'لا توجد نتائج مطابقة للبحث',
    'common.noData': 'لا توجد بيانات', 'common.noFile': 'لا يوجد ملف مرفق', 'common.removeFile': 'حذف الملف الحالي', 'common.dropFile': 'اضغط لاختيار ملف أو اسحبه وأفلته هنا',
    'common.searchIn': 'بحث في', 'common.cards': 'بطاقات', 'common.list': 'قائمة', 'common.deleteSelected': 'حذف المحدد', 'common.notFound': 'العنصر غير موجود',
    'common.notPrintedByDefault': 'لا يُطبع افتراضيًا',

    'msg.saved': 'تم الحفظ بنجاح', 'msg.deleted': 'تم الحذف', 'msg.confirmDelete': 'هل تريد حذف', 'msg.required': 'حقل مطلوب',
    'msg.invalidFile': 'الملف غير صالح أو غير مدعوم', 'msg.error': 'حدث خطأ', 'msg.cannotPrintType': 'لا يمكن طباعة هذا النوع مباشرة، تم تحميله بدلًا من ذلك.',
    'msg.xlsxUnavailable': 'تعذر تحميل مكتبة Excel (تحقق من الاتصال). تم استخدام CSV.', 'msg.classDeleteStudents': 'سيتم أيضًا حذف {n} تلميذ ونقاطهم.',

    'entity.document': 'وثيقة', 'entity.class': 'قسم', 'entity.student': 'تلميذ', 'entity.lesson': 'مذكرة', 'entity.exam': 'فرض / اختبار', 'entity.exercise': 'تمرين / مثال', 'entity.drawing': 'رسم',

    'f.title': 'العنوان', 'f.category': 'الصنف', 'f.docNumber': 'رقم الوثيقة', 'f.issuer': 'الجهة المصدرة', 'f.issueDate': 'تاريخ الإصدار', 'f.expiry': 'تاريخ الانتهاء',
    'f.notes': 'ملاحظات', 'f.file': 'الملف (صورة أو PDF)', 'f.attachment': 'ملف مرفق', 'f.image': 'الصورة', 'f.photo': 'صورة التلميذ',
    'f.className': 'اسم القسم', 'f.level': 'المستوى', 'f.room': 'القاعة', 'f.schedule': 'التوقيت', 'f.class': 'القسم',
    'f.lastName': 'اللقب', 'f.firstName': 'الاسم', 'f.fullName': 'اللقب والاسم', 'f.studentNumber': 'رقم التسجيل', 'f.gender': 'الجنس',
    'f.birthDate': 'تاريخ الميلاد', 'f.birthPlace': 'مكان الميلاد', 'f.status': 'الوضعية', 'f.guardian': 'اسم الولي', 'f.phone': 'الهاتف', 'f.address': 'العنوان',
    'f.lessonTitle': 'عنوان الدرس', 'f.unit': 'المقطع / الوحدة', 'f.lessonNo': 'رقم المذكرة', 'f.date': 'التاريخ', 'f.duration': 'المدة',
    'f.objectives': 'الأهداف / مؤشرات الكفاءة', 'f.resources': 'الوسائل والسندات', 'f.lessonContent': 'سير الدرس',
    'f.examType': 'النوع', 'f.term': 'الفصل', 'f.points': 'العلامة الكاملة', 'f.examContent': 'نص الموضوع', 'f.answerKey': 'الحل وسلم التنقيط',
    'f.kind': 'النوع', 'f.difficulty': 'الصعوبة', 'f.tags': 'كلمات مفتاحية', 'f.statement': 'نص التمرين', 'f.solution': 'الحل',

    'ph.className': 'مثال: 1م1', 'ph.level': 'مثال: السنة الأولى متوسط', 'ph.schedule': 'مثال: الأحد 8:00 - 9:00', 'ph.duration': 'مثال: 60 دقيقة',
    'ph.examDuration': 'مثال: ساعة واحدة', 'ph.tags': 'افصل بينها بفاصلة: كسور, هندسة',

    'doc.cat.diploma': 'دبلوم / شهادة جامعية', 'doc.cat.workCert': 'شهادة عمل', 'doc.cat.idCard': 'بطاقة التعريف', 'doc.cat.birthCert': 'شهادة الميلاد',
    'doc.cat.appointment': 'قرار التعيين / الترسيم', 'doc.cat.inspection': 'تقرير التفتيش', 'doc.cat.training': 'شهادة تكوين', 'doc.cat.residence': 'شهادة الإقامة', 'doc.cat.other': 'أخرى',
    'doc.expired': 'منتهية الصلاحية',
    'documents.desc': 'احفظ دبلوماتك، شهادات العمل، بطاقات الهوية وكل وثائقك الإدارية في مكان واحد.',
    'classes.desc': 'أنشئ أقسامك ونظّم تلاميذك حسب القسم.', 'classes.studentsCount': 'عدد التلاميذ', 'classes.new': 'قسم جديد',
    'classes.newFromName': 'إنشاء قسم جديد', 'classes.newName': 'اسم القسم الجديد',
    'lessons.desc': 'حضّر مذكراتك اليومية واحفظها واطبعها.',
    'exams.desc': 'الفروض، الاختبارات، الاستجوابات مع الحلول وسلالم التنقيط.',
    'exercises.desc': 'بنك التمارين والأمثلة والوضعيات مع الحلول.',
    'drawings.desc': 'ارسم أشكالًا ومخططات أو ارفع صورًا لاستعمالها في دروسك.',

    'gender.m': 'ذكر', 'gender.f': 'أنثى', 'status.new': 'جديد', 'status.repeat': 'معيد',
    'term.1': 'الفصل الأول', 'term.2': 'الفصل الثاني', 'term.3': 'الفصل الثالث',
    'exam.type.assignment': 'فرض', 'exam.type.exam': 'اختبار', 'exam.type.quiz': 'استجواب', 'exam.type.homework': 'واجب منزلي', 'exam.type.diagnostic': 'تقويم تشخيصي',
    'ex.kind.exercise': 'تمرين', 'ex.kind.example': 'مثال', 'ex.kind.problem': 'مسألة', 'ex.kind.activity': 'نشاط', 'ex.kind.situation': 'وضعية إدماجية',
    'ex.diff.easy': 'سهل', 'ex.diff.medium': 'متوسط', 'ex.diff.hard': 'صعب',
    'draw.cat.geometry': 'هندسة', 'draw.cat.diagram': 'مخطط', 'draw.cat.map': 'خريطة', 'draw.cat.illustration': 'رسم توضيحي', 'draw.cat.chart': 'تمثيل بياني', 'draw.cat.other': 'أخرى',

    'students.desc': 'إدارة قوائم التلاميذ، ملفاتهم، الاستيراد والتصدير والطباعة.', 'students.searchPh': 'ابحث بالاسم، الرقم، الهاتف...',
    'students.empty': 'لا يوجد تلاميذ بعد', 'students.emptyHint': 'أضف التلاميذ يدويًا أو استورد قائمة من ملف Excel أو CSV.',
    'students.profile': 'ملف التلميذ', 'students.profileCard': 'بطاقة معلومات التلميذ', 'students.info': 'المعلومات الشخصية', 'students.results': 'النتائج الدراسية', 'students.years': 'سنة',
    'students.move': 'نقل إلى قسم', 'students.bulkDeleteConfirm': 'هل تريد حذف {n} تلميذ محدد؟',
    'students.template': 'تحميل نموذج فارغ للاستيراد', 'students.templateFile': 'نموذج_قائمة_التلاميذ', 'students.sampleLast': 'بن علي', 'students.sampleFirst': 'محمد', 'students.samplePlace': 'الجزائر',
    'students.importTitle': 'استيراد قائمة التلاميذ', 'students.importFound': 'تم العثور على {n} تلميذ في الملف «{file}».',
    'students.importClass': 'القسم الذي سيُضاف إليه التلاميذ', 'students.importClassFallback': 'القسم الافتراضي (للأسطر التي لا تحتوي على قسم)',
    'students.importNeedClass': 'اختر قسمًا أو أدخل اسم قسم جديد', 'students.importNoRows': 'لم يتم التعرف على أعمدة الملف. استعمل النموذج (اللقب، الاسم...).',
    'students.skipDuplicates': 'تجاهل التلاميذ الموجودين مسبقًا', 'students.imported': 'تم استيراد {n} تلميذ (تجاهل {s})',
    'students.printTitle': 'طباعة قائمة التلاميذ', 'students.printType': 'نوع الورقة', 'students.printList': 'قائمة اسمية مفصلة', 'students.printAttendance': 'ورقة الغيابات',
    'students.printBlank': 'قائمة بأعمدة فارغة (للنقاط)', 'students.printCards': 'بطاقات التلاميذ', 'students.blankCols': 'عدد الأعمدة الفارغة', 'students.sheetTitle': 'عنوان الورقة', 'students.listOf': 'قائمة تلاميذ القسم',

    'grades.desc': 'أدخل نقاط التقويم المستمر والفروض والاختبارات، ويتم حساب المعدلات والرتب تلقائيًا.',
    'grades.eval': 'التقويم المستمر', 'grades.a1': 'الفرض 1', 'grades.a2': 'الفرض 2', 'grades.exam': 'الاختبار', 'grades.avg': 'المعدل', 'grades.rank': 'الرتبة',
    'grades.appreciation': 'التقدير', 'grades.remark': 'ملاحظة الأستاذ', 'grades.annual': 'المعدل السنوي', 'grades.config': 'طريقة الحساب',
    'grades.hint': 'النقاط من 0 إلى {max} — Enter أو ↓ للانتقال للتلميذ التالي. الحفظ تلقائي.',
    'grades.studentsCount': 'عدد التلاميذ', 'grades.classAvg': 'معدل القسم', 'grades.highest': 'أعلى معدل', 'grades.lowest': 'أدنى معدل', 'grades.passRate': 'نسبة النجاح',
    'grades.distribution': 'توزيع التقديرات', 'grades.noClasses': 'أنشئ قسمًا أولًا لتتمكن من صب النقاط', 'grades.noStudents': 'لا يوجد تلاميذ في هذا القسم', 'grades.sheet': 'كشف النقاط',
    'appr.excellent': 'ممتاز', 'appr.veryGood': 'جيد جدًا', 'appr.good': 'جيد', 'appr.fairlyGood': 'قريب من الجيد', 'appr.pass': 'مقبول', 'appr.weak': 'دون المتوسط',

    'draw.new': 'رسم جديد', 'draw.upload': 'رفع صورة', 'draw.editCanvas': 'تعديل الرسم', 'draw.drawn': 'مرسوم', 'draw.uploaded': 'مرفوع',
    'draw.size': 'السمك', 'draw.fill': 'تعبئة', 'draw.undo': 'تراجع', 'draw.redo': 'إعادة', 'draw.insertImage': 'إدراج صورة', 'draw.enterText': 'أدخل النص',
    'draw.discard': 'هل تريد الإغلاق دون حفظ التغييرات؟',
    'draw.tool.pen': 'قلم', 'draw.tool.line': 'خط مستقيم', 'draw.tool.arrow': 'سهم', 'draw.tool.rect': 'مستطيل', 'draw.tool.ellipse': 'دائرة / إهليلج',
    'draw.tool.triangle': 'مثلث', 'draw.tool.text': 'نص', 'draw.tool.eraser': 'ممحاة',
    'draw.bg.white': 'خلفية بيضاء', 'draw.bg.grid': 'ورق مربعات', 'draw.bg.dots': 'نقاط', 'draw.bg.lines': 'أسطر', 'draw.bg.transparent': 'شفافة',

    'rich.bold': 'غامق', 'rich.italic': 'مائل', 'rich.underline': 'تسطير', 'rich.h3': 'عنوان', 'rich.insertUnorderedList': 'قائمة نقطية', 'rich.insertOrderedList': 'قائمة مرقمة',
    'rich.justifyRight': 'محاذاة لليمين', 'rich.justifyCenter': 'توسيط', 'rich.justifyLeft': 'محاذاة لليسار', 'rich.table': 'إدراج جدول', 'rich.image': 'إدراج صورة',
    'rich.removeFormat': 'إزالة التنسيق', 'rich.color': 'لون',

    'tpl.phase': 'مراحل سير الدرس', 'tpl.phaseCol': 'المرحلة', 'tpl.activities': 'الأنشطة المقترحة', 'tpl.evaluation': 'التقويم', 'tpl.time': 'المدة',
    'tpl.start': 'وضعية الانطلاق', 'tpl.build': 'بناء التعلمات', 'tpl.invest': 'إعادة الاستثمار',

    'print.teacherSign': 'إمضاء الأستاذ', 'print.parentSign': 'إمضاء الولي', 'print.directorSign': 'إمضاء المدير',

    'dash.morning': 'صباح الخير', 'dash.afternoon': 'مساء الخير', 'dash.evening': 'مساء الخير', 'dash.setupProfile': 'أكمل معلوماتك',
    'dash.quick': 'إجراءات سريعة', 'dash.addStudent': 'إضافة تلميذ', 'dash.enterGrades': 'صب النقاط', 'dash.newLesson': 'مذكرة جديدة', 'dash.newExam': 'فرض جديد',
    'dash.addDoc': 'إضافة وثيقة', 'dash.newExercise': 'تمرين جديد', 'dash.upcoming': 'الفروض والاختبارات القادمة', 'dash.noUpcoming': 'لا توجد فروض مبرمجة.',
    'dash.recent': 'آخر التعديلات', 'dash.noRecent': 'لا توجد عناصر بعد.', 'dash.expiring': 'وثائق تنتهي صلاحيتها قريبًا',

    'settings.desc': 'خصص المظهر، الخطوط، اللغة، معلوماتك وطريقة حساب المعدلات.', 'settings.language': 'اللغة', 'settings.theme': 'المظهر',
    'settings.accent': 'اللون الرئيسي', 'settings.customColor': 'لون مخصص', 'settings.radius': 'استدارة الزوايا', 'settings.density': 'كثافة العرض',
    'settings.compact': 'مضغوط', 'settings.comfortable': 'مريح', 'settings.font': 'الخط', 'settings.systemFont': 'خط النظام', 'settings.fontSize': 'حجم الخط',
    'settings.teacherInfo': 'معلومات الأستاذ', 'settings.teacherInfoHint': 'تظهر هذه المعلومات في رأس الصفحات المطبوعة.',
    'settings.teacherName': 'الأستاذ(ة)', 'settings.subject': 'المادة', 'settings.school': 'المؤسسة', 'settings.year': 'السنة الدراسية',
    'settings.header1': 'سطر الترويسة 1 (مثال: الجمهورية الجزائرية الديمقراطية الشعبية)', 'settings.header2': 'سطر الترويسة 2 (مثال: وزارة التربية الوطنية)',
    'settings.gradesCfg': 'حساب المعدلات', 'settings.gradesHint': 'حدد العلامة القصوى وعدد الفروض ومعاملات كل نقطة.',
    'settings.maxScore': 'العلامة القصوى', 'settings.passMark': 'معدل النجاح', 'settings.assignCount': 'عدد الفروض في الفصل', 'settings.decimals': 'عدد الأرقام بعد الفاصلة',
    'settings.wEval': 'معامل التقويم المستمر', 'settings.wAssign': 'معامل الفروض', 'settings.wExam': 'معامل الاختبار', 'settings.formula': 'المعادلة',
    'settings.data': 'البيانات والنسخ الاحتياطي', 'settings.dataHint': 'كل البيانات محفوظة في متصفحك. صدّر نسخة احتياطية بانتظام لتفادي ضياعها أو لنقلها إلى جهاز آخر.',
    'settings.backup': 'تصدير نسخة احتياطية', 'settings.restore': 'استرجاع نسخة', 'settings.wipe': 'حذف كل البيانات',
    'settings.backupDone': 'تم تصدير النسخة الاحتياطية', 'settings.restoreConfirm': 'سيتم استبدال البيانات الحالية بمحتوى النسخة الاحتياطية. هل تريد المتابعة؟',
    'settings.restoreDone': 'تم استرجاع البيانات', 'settings.wipeConfirm': 'سيتم حذف كل البيانات نهائيًا. هل أنت متأكد؟', 'settings.wipeDone': 'تم حذف كل البيانات',
    'settings.storageUsed': 'المساحة المستعملة',
    'theme.light': 'فاتح', 'theme.dark': 'داكن', 'theme.sepia': 'ورقي', 'theme.midnight': 'ليلي أزرق', 'theme.system': 'حسب النظام'
  },

  en: {
    'app.name': "Teacher's App", 'app.tagline': 'Your digital teaching assistant', 'app.localNote': 'Your data is stored locally on this device. Remember to make backups.',
    'nav.dashboard': 'Dashboard', 'nav.documents': 'My Documents', 'nav.classes': 'Classes', 'nav.students': 'Students', 'nav.grades': 'Grades Entry',
    'nav.lessons': 'Lesson Plans', 'nav.exams': 'Tests & Exams', 'nav.exercises': 'Exercises & Examples', 'nav.drawings': 'Drawings', 'nav.settings': 'Settings',
    'search.global': 'Search students, documents, tests, lessons...', 'search.none': 'No matching results',

    'common.add': 'Add', 'common.edit': 'Edit', 'common.delete': 'Delete', 'common.save': 'Save', 'common.cancel': 'Cancel', 'common.close': 'Close',
    'common.ok': 'OK', 'common.confirm': 'Confirm', 'common.preview': 'Preview', 'common.print': 'Print', 'common.download': 'Download',
    'common.printFile': 'Print file', 'common.printWithSolution': 'Print with solution', 'common.import': 'Import', 'common.export': 'Export',
    'common.all': 'All', 'common.actions': 'Actions', 'common.back': 'Back', 'common.total': 'Total', 'common.clear': 'Clear all',
    'common.empty': 'Nothing here yet', 'common.emptyHint': 'Start by adding your first item.', 'common.noResults': 'No items match your search',
    'common.noData': 'No data', 'common.noFile': 'No attached file', 'common.removeFile': 'Remove current file', 'common.dropFile': 'Click to choose a file or drag & drop it here',
    'common.searchIn': 'Search', 'common.cards': 'Cards', 'common.list': 'List', 'common.deleteSelected': 'Delete selected', 'common.notFound': 'Item not found',
    'common.notPrintedByDefault': 'not printed by default',

    'msg.saved': 'Saved successfully', 'msg.deleted': 'Deleted', 'msg.confirmDelete': 'Do you want to delete', 'msg.required': 'Required field',
    'msg.invalidFile': 'Invalid or unsupported file', 'msg.error': 'Something went wrong', 'msg.cannotPrintType': 'This file type cannot be printed directly; it was downloaded instead.',
    'msg.xlsxUnavailable': 'Could not load the Excel library (check your connection). CSV was used instead.', 'msg.classDeleteStudents': 'Its {n} students and their grades will also be deleted.',

    'entity.document': 'Document', 'entity.class': 'Class', 'entity.student': 'Student', 'entity.lesson': 'Lesson plan', 'entity.exam': 'Test / Exam', 'entity.exercise': 'Exercise / Example', 'entity.drawing': 'Drawing',

    'f.title': 'Title', 'f.category': 'Category', 'f.docNumber': 'Document number', 'f.issuer': 'Issued by', 'f.issueDate': 'Issue date', 'f.expiry': 'Expiry date',
    'f.notes': 'Notes', 'f.file': 'File (image or PDF)', 'f.attachment': 'Attachment', 'f.image': 'Image', 'f.photo': 'Student photo',
    'f.className': 'Class name', 'f.level': 'Level', 'f.room': 'Room', 'f.schedule': 'Schedule', 'f.class': 'Class',
    'f.lastName': 'Last name', 'f.firstName': 'First name', 'f.fullName': 'Full name', 'f.studentNumber': 'Student No.', 'f.gender': 'Gender',
    'f.birthDate': 'Date of birth', 'f.birthPlace': 'Place of birth', 'f.status': 'Status', 'f.guardian': 'Guardian', 'f.phone': 'Phone', 'f.address': 'Address',
    'f.lessonTitle': 'Lesson title', 'f.unit': 'Unit', 'f.lessonNo': 'Lesson No.', 'f.date': 'Date', 'f.duration': 'Duration',
    'f.objectives': 'Objectives', 'f.resources': 'Resources & materials', 'f.lessonContent': 'Lesson procedure',
    'f.examType': 'Type', 'f.term': 'Term', 'f.points': 'Total points', 'f.examContent': 'Test content', 'f.answerKey': 'Answer key & marking scheme',
    'f.kind': 'Kind', 'f.difficulty': 'Difficulty', 'f.tags': 'Tags', 'f.statement': 'Statement', 'f.solution': 'Solution',

    'ph.className': 'e.g. Grade 7 A', 'ph.level': 'e.g. Grade 7', 'ph.schedule': 'e.g. Sun 8:00 - 9:00', 'ph.duration': 'e.g. 60 minutes',
    'ph.examDuration': 'e.g. 1 hour', 'ph.tags': 'Comma separated: fractions, geometry',

    'doc.cat.diploma': 'Diploma / Degree', 'doc.cat.workCert': 'Work certificate', 'doc.cat.idCard': 'ID card', 'doc.cat.birthCert': 'Birth certificate',
    'doc.cat.appointment': 'Appointment decision', 'doc.cat.inspection': 'Inspection report', 'doc.cat.training': 'Training certificate', 'doc.cat.residence': 'Residence certificate', 'doc.cat.other': 'Other',
    'doc.expired': 'Expired',
    'documents.desc': 'Keep your diplomas, work certificates, ID cards and all administrative documents in one place.',
    'classes.desc': 'Create your classes and organise students by class.', 'classes.studentsCount': 'Students', 'classes.new': 'New class',
    'classes.newFromName': 'Create a new class', 'classes.newName': 'New class name',
    'lessons.desc': 'Prepare, store and print your daily lesson plans.',
    'exams.desc': 'Tests, exams and quizzes with solutions and marking schemes.',
    'exercises.desc': 'A bank of exercises, examples and problems with solutions.',
    'drawings.desc': 'Draw shapes and diagrams or upload images to use in your lessons.',

    'gender.m': 'Male', 'gender.f': 'Female', 'status.new': 'New', 'status.repeat': 'Repeating',
    'term.1': 'Term 1', 'term.2': 'Term 2', 'term.3': 'Term 3',
    'exam.type.assignment': 'Test', 'exam.type.exam': 'Exam', 'exam.type.quiz': 'Quiz', 'exam.type.homework': 'Homework', 'exam.type.diagnostic': 'Diagnostic test',
    'ex.kind.exercise': 'Exercise', 'ex.kind.example': 'Example', 'ex.kind.problem': 'Problem', 'ex.kind.activity': 'Activity', 'ex.kind.situation': 'Integration task',
    'ex.diff.easy': 'Easy', 'ex.diff.medium': 'Medium', 'ex.diff.hard': 'Hard',
    'draw.cat.geometry': 'Geometry', 'draw.cat.diagram': 'Diagram', 'draw.cat.map': 'Map', 'draw.cat.illustration': 'Illustration', 'draw.cat.chart': 'Chart', 'draw.cat.other': 'Other',

    'students.desc': 'Manage student lists and profiles, import, export and print.', 'students.searchPh': 'Search by name, number, phone...',
    'students.empty': 'No students yet', 'students.emptyHint': 'Add students manually or import a list from an Excel or CSV file.',
    'students.profile': 'Student profile', 'students.profileCard': 'Student information card', 'students.info': 'Personal information', 'students.results': 'Academic results', 'students.years': 'years',
    'students.move': 'Move to class', 'students.bulkDeleteConfirm': 'Delete {n} selected students?',
    'students.template': 'Download blank import template', 'students.templateFile': 'students_template', 'students.sampleLast': 'Smith', 'students.sampleFirst': 'John', 'students.samplePlace': 'London',
    'students.importTitle': 'Import student list', 'students.importFound': 'Found {n} students in “{file}”.',
    'students.importClass': 'Class to add the students to', 'students.importClassFallback': 'Default class (for rows without a class)',
    'students.importNeedClass': 'Choose a class or enter a new class name', 'students.importNoRows': 'Columns were not recognised. Use the template (last name, first name...).',
    'students.skipDuplicates': 'Skip students that already exist', 'students.imported': 'Imported {n} students (skipped {s})',
    'students.printTitle': 'Print student list', 'students.printType': 'Sheet type', 'students.printList': 'Detailed list', 'students.printAttendance': 'Attendance sheet',
    'students.printBlank': 'List with blank columns (for marks)', 'students.printCards': 'Student cards', 'students.blankCols': 'Number of blank columns', 'students.sheetTitle': 'Sheet title', 'students.listOf': 'Student list —',

    'grades.desc': 'Enter continuous assessment, test and exam marks; averages and ranks are calculated automatically.',
    'grades.eval': 'Continuous assessment', 'grades.a1': 'Test 1', 'grades.a2': 'Test 2', 'grades.exam': 'Exam', 'grades.avg': 'Average', 'grades.rank': 'Rank',
    'grades.appreciation': 'Grade', 'grades.remark': "Teacher's remark", 'grades.annual': 'Annual average', 'grades.config': 'Calculation',
    'grades.hint': 'Marks from 0 to {max} — press Enter or ↓ to go to the next student. Saved automatically.',
    'grades.studentsCount': 'Students', 'grades.classAvg': 'Class average', 'grades.highest': 'Highest', 'grades.lowest': 'Lowest', 'grades.passRate': 'Pass rate',
    'grades.distribution': 'Distribution', 'grades.noClasses': 'Create a class first to enter grades', 'grades.noStudents': 'No students in this class', 'grades.sheet': 'Grade sheet',
    'appr.excellent': 'Excellent', 'appr.veryGood': 'Very good', 'appr.good': 'Good', 'appr.fairlyGood': 'Fairly good', 'appr.pass': 'Pass', 'appr.weak': 'Below average',

    'draw.new': 'New drawing', 'draw.upload': 'Upload image', 'draw.editCanvas': 'Edit drawing', 'draw.drawn': 'Drawn', 'draw.uploaded': 'Uploaded',
    'draw.size': 'Size', 'draw.fill': 'Fill', 'draw.undo': 'Undo', 'draw.redo': 'Redo', 'draw.insertImage': 'Insert image', 'draw.enterText': 'Enter text',
    'draw.discard': 'Close without saving your changes?',
    'draw.tool.pen': 'Pen', 'draw.tool.line': 'Line', 'draw.tool.arrow': 'Arrow', 'draw.tool.rect': 'Rectangle', 'draw.tool.ellipse': 'Circle / Ellipse',
    'draw.tool.triangle': 'Triangle', 'draw.tool.text': 'Text', 'draw.tool.eraser': 'Eraser',
    'draw.bg.white': 'White', 'draw.bg.grid': 'Grid paper', 'draw.bg.dots': 'Dots', 'draw.bg.lines': 'Lined', 'draw.bg.transparent': 'Transparent',

    'rich.bold': 'Bold', 'rich.italic': 'Italic', 'rich.underline': 'Underline', 'rich.h3': 'Heading', 'rich.insertUnorderedList': 'Bullet list', 'rich.insertOrderedList': 'Numbered list',
    'rich.justifyRight': 'Align right', 'rich.justifyCenter': 'Center', 'rich.justifyLeft': 'Align left', 'rich.table': 'Insert table', 'rich.image': 'Insert image',
    'rich.removeFormat': 'Clear formatting', 'rich.color': 'Color',

    'tpl.phase': 'Lesson stages', 'tpl.phaseCol': 'Stage', 'tpl.activities': 'Activities', 'tpl.evaluation': 'Assessment', 'tpl.time': 'Time',
    'tpl.start': 'Warm-up', 'tpl.build': 'Presentation & practice', 'tpl.invest': 'Production / follow-up',

    'print.teacherSign': "Teacher's signature", 'print.parentSign': "Parent's signature", 'print.directorSign': "Principal's signature",

    'dash.morning': 'Good morning', 'dash.afternoon': 'Good afternoon', 'dash.evening': 'Good evening', 'dash.setupProfile': 'Complete your profile',
    'dash.quick': 'Quick actions', 'dash.addStudent': 'Add student', 'dash.enterGrades': 'Enter grades', 'dash.newLesson': 'New lesson plan', 'dash.newExam': 'New test',
    'dash.addDoc': 'Add document', 'dash.newExercise': 'New exercise', 'dash.upcoming': 'Upcoming tests & exams', 'dash.noUpcoming': 'No scheduled tests.',
    'dash.recent': 'Recently updated', 'dash.noRecent': 'Nothing yet.', 'dash.expiring': 'Documents expiring soon',

    'settings.desc': 'Customise appearance, fonts, language, your details and how averages are calculated.', 'settings.language': 'Language', 'settings.theme': 'Theme',
    'settings.accent': 'Accent color', 'settings.customColor': 'Custom color', 'settings.radius': 'Corner radius', 'settings.density': 'Density',
    'settings.compact': 'Compact', 'settings.comfortable': 'Comfortable', 'settings.font': 'Font', 'settings.systemFont': 'System font', 'settings.fontSize': 'Font size',
    'settings.teacherInfo': 'Teacher information', 'settings.teacherInfoHint': 'This information appears in the header of printed pages.',
    'settings.teacherName': 'Teacher', 'settings.subject': 'Subject', 'settings.school': 'School', 'settings.year': 'School year',
    'settings.header1': 'Header line 1 (e.g. country / authority)', 'settings.header2': 'Header line 2 (e.g. ministry / district)',
    'settings.gradesCfg': 'Average calculation', 'settings.gradesHint': 'Set the maximum mark, number of tests and the weight of each component.',
    'settings.maxScore': 'Maximum mark', 'settings.passMark': 'Pass mark', 'settings.assignCount': 'Tests per term', 'settings.decimals': 'Decimal places',
    'settings.wEval': 'Continuous assessment weight', 'settings.wAssign': 'Tests weight', 'settings.wExam': 'Exam weight', 'settings.formula': 'Formula',
    'settings.data': 'Data & backup', 'settings.dataHint': 'All data is stored in your browser. Export a backup regularly to avoid losing it or to move it to another device.',
    'settings.backup': 'Export backup', 'settings.restore': 'Restore backup', 'settings.wipe': 'Delete all data',
    'settings.backupDone': 'Backup exported', 'settings.restoreConfirm': 'Current data will be replaced with the backup content. Continue?',
    'settings.restoreDone': 'Data restored', 'settings.wipeConfirm': 'All data will be permanently deleted. Are you sure?', 'settings.wipeDone': 'All data deleted',
    'settings.storageUsed': 'Storage used',
    'theme.light': 'Light', 'theme.dark': 'Dark', 'theme.sepia': 'Sepia', 'theme.midnight': 'Midnight', 'theme.system': 'System'
  }
};

const I18n = {
  lang: 'ar',
  get dir() { return this.lang === 'ar' ? 'rtl' : 'ltr'; },
  set(lang) {
    this.lang = DICT[lang] ? lang : 'ar';
    document.documentElement.lang = this.lang;
    document.documentElement.dir = this.dir;
  },
  translateDom(root = document) {
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t(el.dataset.i18nPlaceholder); });
    root.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); el.setAttribute('aria-label', el.title); });
  }
};

function t(key, params) {
  let s = DICT[I18n.lang][key] ?? DICT.ar[key] ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(v);
  return s;
}
