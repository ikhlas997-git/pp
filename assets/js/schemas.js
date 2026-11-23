/* Entity definitions used by the generic CRUD module */
const LESSON_TEMPLATE = () => `
<h3>${t('tpl.phase')}</h3>
<table class="rt-table"><tbody>
<tr><td><b>${t('tpl.phaseCol')}</b></td><td><b>${t('tpl.activities')}</b></td><td><b>${t('tpl.evaluation')}</b></td><td><b>${t('tpl.time')}</b></td></tr>
<tr><td>${t('tpl.start')}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
<tr><td>${t('tpl.build')}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
<tr><td>${t('tpl.invest')}</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>
</tbody></table><p><br></p>`;

const Schemas = {
  documents: {
    store: 'documents', icon: 'folder', title: 'nav.documents', desc: 'documents.desc', singular: 'entity.document', route: 'documents',
    fields: [
      { key: 'title', type: 'text', label: 'f.title', required: true },
      { key: 'category', type: 'select', label: 'f.category', options: ['diploma', 'workCert', 'idCard', 'birthCert', 'appointment', 'inspection', 'training', 'residence', 'other'], optPrefix: 'doc.cat.', filter: true, required: true },
      { key: 'number', type: 'text', label: 'f.docNumber' },
      { key: 'issuer', type: 'text', label: 'f.issuer' },
      { key: 'date', type: 'date', label: 'f.issueDate' },
      { key: 'expiry', type: 'date', label: 'f.expiry' },
      { key: 'notes', type: 'textarea', label: 'f.notes', full: true },
      { key: 'file', type: 'file', label: 'f.file', accept: 'image/*,application/pdf,.doc,.docx', full: true }
    ],
    thumb: 'file',
    card: r => ({
      title: r.title,
      subtitle: [t('doc.cat.' + r.category), r.issuer].filter(Boolean).join(' · '),
      badges: [r.date && UI.fmtDate(r.date), r.expiry && (r.expiry < UI.today() ? { text: t('doc.expired'), cls: 'danger' } : { text: `${t('f.expiry')}: ${UI.fmtDate(r.expiry)}` })].filter(Boolean)
    }),
    sort: (a, b) => (b.date || '').localeCompare(a.date || '') || b.createdAt - a.createdAt
  },

  classes: {
    store: 'classes', icon: 'layers', title: 'nav.classes', desc: 'classes.desc', singular: 'entity.class', route: 'classes', view: 'table',
    fields: [
      { key: 'name', type: 'text', label: 'f.className', required: true, placeholder: 'ph.className' },
      { key: 'level', type: 'text', label: 'f.level', placeholder: 'ph.level' },
      { key: 'year', type: 'text', label: 'settings.year', default: () => Settings.get().teacher.year },
      { key: 'subject', type: 'text', label: 'settings.subject', default: () => Settings.get().teacher.subject },
      { key: 'room', type: 'text', label: 'f.room' },
      { key: 'schedule', type: 'text', label: 'f.schedule', placeholder: 'ph.schedule' },
      { key: 'notes', type: 'textarea', label: 'f.notes', full: true }
    ],
    columns: [
      { label: 'f.className', value: r => `<b>${esc(r.name)}</b>` },
      { label: 'f.level', value: r => esc(r.level) },
      { label: 'settings.year', value: r => esc(r.year) },
      { label: 'settings.subject', value: r => esc(r.subject) },
      { label: 'classes.studentsCount', value: (r, ctx) => `<span class="badge">${ctx.counts[r.id] || 0}</span>` }
    ],
    extraCtx: async () => {
      const counts = {};
      (await DB.all('students')).forEach(s => { counts[s.classId] = (counts[s.classId] || 0) + 1; });
      return { counts };
    },
    recordActions: [
      { icon: 'users', label: 'nav.students', onClick: r => { location.hash = `#/students?class=${r.id}`; } },
      { icon: 'chart', label: 'nav.grades', onClick: r => { location.hash = `#/grades?class=${r.id}`; } }
    ],
    sort: (a, b) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true })
  },

  students: {
    store: 'students', icon: 'users', title: 'nav.students', singular: 'entity.student', route: 'students',
    fields: [
      { key: 'lastName', type: 'text', label: 'f.lastName', required: true },
      { key: 'firstName', type: 'text', label: 'f.firstName', required: true },
      { key: 'number', type: 'text', label: 'f.studentNumber' },
      { key: 'classId', type: 'class', label: 'f.class', required: true },
      { key: 'gender', type: 'select', label: 'f.gender', options: ['m', 'f'], optPrefix: 'gender.' },
      { key: 'birthDate', type: 'date', label: 'f.birthDate' },
      { key: 'birthPlace', type: 'text', label: 'f.birthPlace' },
      { key: 'status', type: 'select', label: 'f.status', options: ['new', 'repeat'], optPrefix: 'status.' },
      { key: 'guardian', type: 'text', label: 'f.guardian' },
      { key: 'phone', type: 'text', label: 'f.phone', inputType: 'tel' },
      { key: 'address', type: 'text', label: 'f.address', full: true },
      { key: 'notes', type: 'textarea', label: 'f.notes', full: true },
      { key: 'photo', type: 'file', label: 'f.photo', accept: 'image/*', full: true }
    ]
  },

  lessons: {
    store: 'lessons', icon: 'book', title: 'nav.lessons', desc: 'lessons.desc', singular: 'entity.lesson', route: 'lessons',
    fields: [
      { key: 'title', type: 'text', label: 'f.lessonTitle', required: true },
      { key: 'subject', type: 'text', label: 'settings.subject', default: () => Settings.get().teacher.subject },
      { key: 'level', type: 'text', label: 'f.level', filter: true },
      { key: 'classId', type: 'class', label: 'f.class', filter: true },
      { key: 'unit', type: 'text', label: 'f.unit' },
      { key: 'number', type: 'number', label: 'f.lessonNo' },
      { key: 'date', type: 'date', label: 'f.date', default: () => UI.today() },
      { key: 'duration', type: 'text', label: 'f.duration', placeholder: 'ph.duration' },
      { key: 'objectives', type: 'textarea', label: 'f.objectives', full: true },
      { key: 'resources', type: 'textarea', label: 'f.resources', full: true },
      { key: 'content', type: 'rich', label: 'f.lessonContent', full: true, default: LESSON_TEMPLATE },
      { key: 'file', type: 'file', label: 'f.attachment', full: true }
    ],
    card: (r, ctx) => ({
      title: r.title,
      subtitle: [r.unit, ctx.cmap[r.classId]?.name || r.level].filter(Boolean).join(' · '),
      badges: [r.date && UI.fmtDate(r.date), r.number && `#${r.number}`, r.duration].filter(Boolean)
    }),
    sort: (a, b) => (b.date || '').localeCompare(a.date || '') || (b.number || 0) - (a.number || 0)
  },

  exams: {
    store: 'exams', icon: 'clipboard', title: 'nav.exams', desc: 'exams.desc', singular: 'entity.exam', route: 'exams',
    fields: [
      { key: 'title', type: 'text', label: 'f.title', required: true },
      { key: 'type', type: 'select', label: 'f.examType', options: ['assignment', 'exam', 'quiz', 'homework', 'diagnostic'], optPrefix: 'exam.type.', filter: true, required: true },
      { key: 'term', type: 'select', label: 'f.term', options: ['1', '2', '3'], optPrefix: 'term.', filter: true },
      { key: 'classId', type: 'class', label: 'f.class', filter: true },
      { key: 'level', type: 'text', label: 'f.level' },
      { key: 'date', type: 'date', label: 'f.date' },
      { key: 'duration', type: 'text', label: 'f.duration', placeholder: 'ph.examDuration' },
      { key: 'points', type: 'number', label: 'f.points', default: () => Settings.get().grades.max },
      { key: 'content', type: 'rich', label: 'f.examContent', full: true },
      { key: 'answerKey', type: 'rich', label: 'f.answerKey', full: true, secret: true },
      { key: 'file', type: 'file', label: 'f.attachment', full: true }
    ],
    card: (r, ctx) => ({
      title: r.title,
      subtitle: [t('exam.type.' + r.type), r.term && t('term.' + r.term), ctx.cmap[r.classId]?.name].filter(Boolean).join(' · '),
      badges: [r.date && (r.date >= UI.today() ? { text: UI.fmtDate(r.date), cls: 'primary' } : UI.fmtDate(r.date)), r.duration].filter(Boolean)
    }),
    sort: (a, b) => (b.date || '').localeCompare(a.date || '') || b.createdAt - a.createdAt
  },

  exercises: {
    store: 'exercises', icon: 'zap', title: 'nav.exercises', desc: 'exercises.desc', singular: 'entity.exercise', route: 'exercises',
    fields: [
      { key: 'title', type: 'text', label: 'f.title', required: true },
      { key: 'kind', type: 'select', label: 'f.kind', options: ['exercise', 'example', 'problem', 'activity', 'situation'], optPrefix: 'ex.kind.', filter: true, required: true },
      { key: 'difficulty', type: 'select', label: 'f.difficulty', options: ['easy', 'medium', 'hard'], optPrefix: 'ex.diff.', filter: true },
      { key: 'level', type: 'text', label: 'f.level', filter: true },
      { key: 'subject', type: 'text', label: 'settings.subject', default: () => Settings.get().teacher.subject },
      { key: 'unit', type: 'text', label: 'f.unit' },
      { key: 'tags', type: 'tags', label: 'f.tags', full: true, placeholder: 'ph.tags' },
      { key: 'content', type: 'rich', label: 'f.statement', full: true },
      { key: 'solution', type: 'rich', label: 'f.solution', full: true, secret: true },
      { key: 'file', type: 'file', label: 'f.attachment', full: true }
    ],
    card: r => ({
      title: r.title,
      subtitle: [t('ex.kind.' + r.kind), r.level, r.unit].filter(Boolean).join(' · '),
      badges: [r.difficulty && { text: t('ex.diff.' + r.difficulty), cls: { easy: 'success', medium: 'warning', hard: 'danger' }[r.difficulty] }, ...(r.tags || []).slice(0, 3).map(x => '#' + x)].filter(Boolean),
      excerpt: UI.strip(r.content).slice(0, 140)
    }),
    sort: (a, b) => b.updatedAt - a.updatedAt
  },

  drawings: {
    store: 'drawings', icon: 'penTool', title: 'nav.drawings', desc: 'drawings.desc', singular: 'entity.drawing', route: 'drawings',
    fields: [
      { key: 'title', type: 'text', label: 'f.title', required: true },
      { key: 'category', type: 'select', label: 'f.category', options: ['geometry', 'diagram', 'map', 'illustration', 'chart', 'other'], optPrefix: 'draw.cat.', filter: true },
      { key: 'level', type: 'text', label: 'f.level' },
      { key: 'notes', type: 'textarea', label: 'f.notes', full: true },
      { key: 'image', type: 'file', label: 'f.image', accept: 'image/*', full: true, required: true }
    ],
    thumb: 'image',
    card: r => ({
      title: r.title,
      subtitle: [r.category && t('draw.cat.' + r.category), r.level].filter(Boolean).join(' · '),
      badges: [r.source === 'drawn' ? t('draw.drawn') : t('draw.uploaded')]
    }),
    toolbar: [{ icon: 'pen', label: 'draw.new', cls: 'primary', onClick: ctx => Drawings.openEditor(null, ctx.reload) }],
    recordActions: [{ icon: 'pen', label: 'draw.editCanvas', onClick: (r, ctx) => Drawings.openEditor(r, ctx.reload) }],
    sort: (a, b) => b.updatedAt - a.updatedAt
  }
};
