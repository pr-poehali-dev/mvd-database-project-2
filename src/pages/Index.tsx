import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const EMBLEM = 'https://cdn.poehali.dev/projects/23f78510-d61e-421b-ab2d-e3655583e49b/files/4886d43a-97a2-4017-9b47-131d9da248d8.jpg';

const NAV = [
  { id: 'home', label: 'Главная', icon: 'LayoutDashboard' },
  { id: 'cases', label: 'Дела', icon: 'FolderOpen' },
  { id: 'citizens', label: 'Граждане', icon: 'Users' },
  { id: 'passport', label: 'Паспорта', icon: 'BookUser' },
  { id: 'search', label: 'Поиск', icon: 'Search' },
  { id: 'staff', label: 'Сотрудники', icon: 'ShieldCheck' },
  { id: 'reports', label: 'Отчёты', icon: 'FileBarChart' },
  { id: 'settings', label: 'Настройки', icon: 'Settings' },
];

type CaseRow = {
  id: string; num: string; title: string; article: string;
  date: string; officer: string; status: string;
  fio: string; birth: string; address: string; desc: string; photo: string | null;
};
type CitizenRow = {
  id: string; fio: string; birth: string; passport: string;
  city: string; address: string; status: string; photo: string | null;
  phone: string; gender: string; nationality: string; note: string;
};
type StaffRow = {
  id: string; fio: string; dept: string; rank: string; tab: string;
  login: string; password: string; phone: string; note: string;
};
type PassportRow = {
  id: string; fio: string; birth: string; place: string;
  series: string; number: string; issued: string; date: string; photo: string | null;
};

function useStore<T>(key: string) {
  const [items, setItems] = useState<T[]>(() => {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : []; }
    catch { return []; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(items)); }, [key, items]);
  return [items, setItems] as const;
}

const uid = () => Math.random().toString(36).slice(2, 10);

function useAuth() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem('mvd_auth'));
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mvd_auth') || 'null'); } catch { return null; }
  });
  const login = (user: { login: string; fio: string; rank: string; tab: string }) => {
    localStorage.setItem('mvd_auth', JSON.stringify(user));
    setCurrentUser(user); setAuthed(true);
  };
  const logout = () => { localStorage.removeItem('mvd_auth'); setAuthed(false); setCurrentUser(null); };
  return { authed, currentUser, login, logout };
}

function readFile(file: File): Promise<string> {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.readAsDataURL(file);
  });
}

const STATUSES_CASE = ['В работе', 'Приостановлено', 'Закрыто'];
const STATUSES_CIT = ['Чисто', 'Под наблюдением', 'Разыскивается'];

/* ================================================================ */
const Index = () => {
  const { authed, currentUser, login, logout } = useAuth();
  const [tab, setTab] = useState('home');
  const staff = useStore<StaffRow>('mvd_staff');
  const cases = useStore<CaseRow>('mvd_cases');
  const citizens = useStore<CitizenRow>('mvd_citizens');
  const passports = useStore<PassportRow>('mvd_passports');

  const handleLogin = (u: string, p: string) => {
    // Главный аккаунт
    if (u === 'Novikov' && p === '89223109976') {
      login({ login: 'Novikov', fio: 'Новиков (Администратор)', rank: 'Администратор', tab: '0001' });
      return;
    }
    // Сотрудники из базы
    const emp = staff[0].find((s) => s.login === u && s.password === p);
    if (emp) { login({ login: emp.login, fio: emp.fio, rank: emp.rank, tab: emp.tab }); return; }
    toast({ title: 'Ошибка входа', description: 'Неверный логин или пароль', variant: 'destructive' });
  };

  if (!authed) return <LoginScreen onLogin={handleLogin} />;

  const initials = (currentUser?.fio || '??').split(' ').map((w: string) => w[0]).slice(0, 2).join('');

  return (
    <div className="min-h-screen flex bg-secondary">
      <aside className="w-64 bg-gov-navy text-white flex flex-col fixed h-full gov-pattern print:hidden">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <img src={EMBLEM} alt="герб" className="w-11 h-11 rounded-md object-cover" />
          <div>
            <div className="font-heading font-700 text-lg leading-tight tracking-wide">МВД РОССИИ</div>
            <div className="text-[11px] text-gov-gold uppercase tracking-widest">Единая база</div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm transition-colors ${tab === n.id ? 'bg-white text-gov-navy font-600' : 'text-white/80 hover:bg-white/10'}`}>
              <Icon name={n.icon} size={18} />{n.label}
            </button>
          ))}
        </nav>
        <button onClick={logout} className="m-3 flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-white/70 hover:bg-gov-red/80 hover:text-white transition-colors">
          <Icon name="LogOut" size={18} /> Выйти
        </button>
      </aside>

      <main className="flex-1 ml-64 print:ml-0">
        <header className="bg-white border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10 print:hidden">
          <h1 className="font-heading text-xl text-gov-navy uppercase tracking-wide">{NAV.find((n) => n.id === tab)?.label}</h1>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><Icon name="Wifi" size={12} className="mr-1" />Защищённое соединение</Badge>
            <div className="flex items-center gap-2 pl-3 border-l">
              <div className="w-9 h-9 rounded-full bg-gov-navy text-white flex items-center justify-center text-sm font-700">{initials}</div>
              <div className="text-sm leading-tight">
                <div className="font-500">{currentUser?.fio}</div>
                <div className="text-xs text-muted-foreground">{currentUser?.rank}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 animate-fade-in" key={tab}>
          {tab === 'home'     && <Home setTab={setTab} cases={cases[0]} citizens={citizens[0]} staff={staff[0]} passports={passports[0]} />}
          {tab === 'cases'    && <Cases store={cases} />}
          {tab === 'citizens' && <Citizens store={citizens} />}
          {tab === 'passport' && <Passport store={passports} />}
          {tab === 'search'   && <SearchTab citizens={citizens[0]} cases={cases[0]} />}
          {tab === 'staff'    && <Staff store={staff} />}
          {tab === 'reports'  && <Reports cases={cases[0]} citizens={citizens[0]} />}
          {tab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
};

/* ============================================================ LOGIN */
function LoginScreen({ onLogin }: { onLogin: (u: string, p: string) => void }) {
  const [u, setU] = useState(''); const [p, setP] = useState('');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-navy gov-pattern p-4">
      <Card className="w-full max-w-md p-8 animate-scale-in shadow-2xl">
        <div className="text-center mb-8">
          <img src={EMBLEM} alt="герб" className="w-20 h-20 mx-auto rounded-lg object-cover mb-4" />
          <h1 className="font-heading text-2xl text-gov-navy uppercase tracking-wide">Единая база МВД</h1>
          <p className="text-sm text-muted-foreground mt-1">Авторизация сотрудника</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(u, p); }} className="space-y-4">
          <div><Label>Логин</Label><Input className="mt-1" value={u} onChange={(e) => setU(e.target.value)} /></div>
          <div><Label>Пароль</Label><Input type="password" className="mt-1" value={p} onChange={(e) => setP(e.target.value)} /></div>
          <Button type="submit" className="w-full bg-gov-navy hover:bg-gov-blue h-11 font-heading uppercase tracking-wide">
            <Icon name="LogIn" size={18} className="mr-2" />Войти в систему
          </Button>
        </form>
        <p className="text-[11px] text-center text-muted-foreground mt-6 flex items-center justify-center gap-1"><Icon name="Lock" size={12} />Доступ только для уполномоченных лиц</p>
      </Card>
    </div>
  );
}

/* ============================================================ HOME */
function Home({ setTab, cases, citizens, staff, passports }: { setTab: (t: string) => void; cases: CaseRow[]; citizens: CitizenRow[]; staff: StaffRow[]; passports: PassportRow[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: 'Активных дел', value: cases.filter((c) => c.status !== 'Закрыто').length, icon: 'FolderOpen', color: 'text-gov-steel' },
          { label: 'Граждан в базе', value: citizens.length, icon: 'Users', color: 'text-gov-navy' },
          { label: 'Паспортов', value: passports.length, icon: 'BookUser', color: 'text-gov-gold' },
          { label: 'Сотрудников', value: staff.length, icon: 'ShieldCheck', color: 'text-gov-red' },
        ].map((s) => (
          <Card key={s.label} className="p-5 hover:shadow-md transition-shadow">
            <Icon name={s.icon} size={26} className={s.color} />
            <div className="font-heading text-3xl text-gov-navy mt-3">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-heading text-lg text-gov-navy uppercase mb-3">Быстрые действия</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button onClick={() => setTab('cases')} variant="outline" className="justify-start"><Icon name="FolderPlus" size={16} className="mr-2" />Завести дело</Button>
          <Button onClick={() => setTab('citizens')} variant="outline" className="justify-start"><Icon name="UserPlus" size={16} className="mr-2" />Добавить гражданина</Button>
          <Button onClick={() => setTab('passport')} variant="outline" className="justify-start"><Icon name="BookUser" size={16} className="mr-2" />Создать паспорт</Button>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================ CASES */
function Cases({ store }: { store: readonly [CaseRow[], React.Dispatch<React.SetStateAction<CaseRow[]>>] }) {
  const [rows, setRows] = store;
  const [view, setView] = useState<'list' | 'add' | 'detail'>('list');
  const [selected, setSelected] = useState<CaseRow | null>(null);
  const [form, setForm] = useState<Partial<CaseRow>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sf = (k: keyof CaseRow, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = () => {
    if (!form.num || !form.fio) { toast({ title: 'Заполните обязательные поля', variant: 'destructive' }); return; }
    const row: CaseRow = {
      id: uid(), num: form.num || '', title: form.title || '', article: form.article || '',
      date: form.date || '', officer: form.officer || '', status: form.status || 'В работе',
      fio: form.fio || '', birth: form.birth || '', address: form.address || '',
      desc: form.desc || '', photo,
    };
    setRows((r) => [row, ...r]);
    toast({ title: 'Дело сохранено' });
    setForm({}); setPhoto(null); setView('list');
  };

  const del = (id: string) => { setRows((r) => r.filter((x) => x.id !== id)); setView('list'); toast({ title: 'Дело удалено' }); };

  const printCard = () => window.print();

  if (view === 'add') return (
    <Card className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-gov-navy uppercase">Новое уголовное дело</h3>
        <Button variant="outline" onClick={() => { setView('list'); setForm({}); setPhoto(null); }}><Icon name="X" size={16} className="mr-1" />Отмена</Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="font-heading text-sm text-gov-navy uppercase border-b pb-1">Сведения о деле</h4>
          <Row label="Номер дела *"><Input value={form.num || ''} onChange={(e) => sf('num', e.target.value)} /></Row>
          <Row label="Название / суть"><Input value={form.title || ''} onChange={(e) => sf('title', e.target.value)} /></Row>
          <Row label="Статья УК РФ"><Input value={form.article || ''} onChange={(e) => sf('article', e.target.value)} placeholder="158 ч.1" /></Row>
          <Row label="Дата возбуждения"><Input type="date" value={form.date || ''} onChange={(e) => sf('date', e.target.value)} /></Row>
          <Row label="Ответственный сотрудник"><Input value={form.officer || ''} onChange={(e) => sf('officer', e.target.value)} /></Row>
          <Row label="Статус">
            <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={form.status || ''} onChange={(e) => sf('status', e.target.value)}>
              <option value="">Выберите...</option>
              {STATUSES_CASE.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Row>
        </div>
        <div className="space-y-3">
          <h4 className="font-heading text-sm text-gov-navy uppercase border-b pb-1">Сведения о фигуранте</h4>
          <Row label="ФИО *"><Input value={form.fio || ''} onChange={(e) => sf('fio', e.target.value)} /></Row>
          <Row label="Дата рождения"><Input type="date" value={form.birth || ''} onChange={(e) => sf('birth', e.target.value)} /></Row>
          <Row label="Адрес"><Input value={form.address || ''} onChange={(e) => sf('address', e.target.value)} /></Row>
          <Row label="Описание / обстоятельства">
            <Textarea rows={3} value={form.desc || ''} onChange={(e) => sf('desc', e.target.value)} />
          </Row>
          <Row label="Фото фигуранта">
            <div className="flex gap-3 items-center">
              <div className="w-20 h-24 bg-secondary border rounded overflow-hidden flex items-center justify-center">
                {photo ? <img src={photo} className="w-full h-full object-cover" /> : <Icon name="User" size={24} className="text-gov-navy/30" />}
              </div>
              <Button variant="outline" onClick={() => fileRef.current?.click()}><Icon name="Camera" size={16} className="mr-1" />Загрузить</Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await readFile(f)); }} />
            </div>
          </Row>
        </div>
      </div>
      <div className="flex gap-3 mt-6 pt-4 border-t">
        <Button className="bg-gov-navy hover:bg-gov-blue" onClick={save}><Icon name="Save" size={16} className="mr-2" />Сохранить дело</Button>
      </div>
    </Card>
  );

  if (view === 'detail' && selected) return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex gap-2 mb-4 print:hidden">
        <Button variant="outline" onClick={() => setView('list')}><Icon name="ArrowLeft" size={16} className="mr-1" />Назад</Button>
        <Button variant="outline" onClick={printCard}><Icon name="Printer" size={16} className="mr-1" />Печать</Button>
        <Button variant="destructive" onClick={() => del(selected.id)}><Icon name="Trash2" size={16} className="mr-1" />Удалить дело</Button>
      </div>

      {/* Печатная карточка дела */}
      <Card className="p-8 print:shadow-none print:border-none" id="case-print">
        <div className="flex items-center gap-4 border-b pb-5 mb-5">
          <img src={EMBLEM} className="w-14 h-14 object-cover rounded print:block hidden" />
          <div>
            <div className="font-heading text-lg text-gov-navy uppercase">Министерство внутренних дел РФ</div>
            <div className="font-heading text-xl text-gov-red uppercase tracking-wide">Уголовное дело {selected.num}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <Section title="Сведения о деле">
              <PrintRow label="Статья УК РФ" value={selected.article || '—'} />
              <PrintRow label="Название" value={selected.title || '—'} />
              <PrintRow label="Дата возбуждения" value={selected.date || '—'} />
              <PrintRow label="Ответственный" value={selected.officer || '—'} />
              <PrintRow label="Статус" value={selected.status} />
            </Section>
            <Section title="Описание / обстоятельства">
              <p className="text-sm mt-1 leading-relaxed text-foreground">{selected.desc || '—'}</p>
            </Section>
          </div>
          <div className="space-y-3">
            <Section title="Сведения о фигуранте">
              {selected.photo && <img src={selected.photo} className="w-28 h-36 object-cover rounded border mb-3" />}
              <PrintRow label="ФИО" value={selected.fio} />
              <PrintRow label="Дата рождения" value={selected.birth || '—'} />
              <PrintRow label="Адрес" value={selected.address || '—'} />
            </Section>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t grid grid-cols-2 gap-4 text-sm text-muted-foreground print:mt-12">
          <div>Подпись ответственного: _______________</div>
          <div>Дата: _______________</div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="bg-gov-navy hover:bg-gov-blue" onClick={() => setView('add')}><Icon name="Plus" size={16} className="mr-1" />Новое дело</Button>
      </div>
      {rows.length === 0 ? <Empty text="Дел пока нет. Нажмите «Новое дело»." /> : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-muted-foreground">
              <tr>{['Номер', 'Статья', 'ФИО фигуранта', 'Дата', 'Сотрудник', 'Статус', ''].map((h, i) => <th key={i} className="px-4 py-3 font-500">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b hover:bg-secondary/50 cursor-pointer" onClick={() => { setSelected(c); setView('detail'); }}>
                  <td className="px-4 py-3 font-500 text-gov-navy">{c.num}</td>
                  <td className="px-4 py-3">{c.article || '—'}</td>
                  <td className="px-4 py-3">{c.fio}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
                  <td className="px-4 py-3">{c.officer}</td>
                  <td className="px-4 py-3"><StatusBadge s={c.status} /></td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}><DeleteBtn onClick={() => del(c.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ============================================================ CITIZENS */
function Citizens({ store }: { store: readonly [CitizenRow[], React.Dispatch<React.SetStateAction<CitizenRow[]>>] }) {
  const [rows, setRows] = store;
  const [view, setView] = useState<'list' | 'add' | 'detail'>('list');
  const [selected, setSelected] = useState<CitizenRow | null>(null);
  const [form, setForm] = useState<Partial<CitizenRow>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sf = (k: keyof CitizenRow, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const save = () => {
    if (!form.fio) { toast({ title: 'Укажите ФИО', variant: 'destructive' }); return; }
    const row: CitizenRow = {
      id: uid(), fio: form.fio || '', birth: form.birth || '', passport: form.passport || '',
      city: form.city || '', address: form.address || '', status: form.status || 'Чисто',
      photo, phone: form.phone || '', gender: form.gender || '', nationality: form.nationality || '',
      note: form.note || '',
    };
    setRows((r) => [row, ...r]);
    toast({ title: 'Гражданин добавлен' });
    setForm({}); setPhoto(null); setView('list');
  };

  const del = (id: string) => { setRows((r) => r.filter((x) => x.id !== id)); setView('list'); toast({ title: 'Запись удалена' }); };

  if (view === 'add') return (
    <Card className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl text-gov-navy uppercase">Личная карточка гражданина</h3>
        <Button variant="outline" onClick={() => { setView('list'); setForm({}); setPhoto(null); }}><Icon name="X" size={16} className="mr-1" />Отмена</Button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <h4 className="font-heading text-sm text-gov-navy uppercase border-b pb-1">Персональные данные</h4>
          <Row label="ФИО *"><Input value={form.fio || ''} onChange={(e) => sf('fio', e.target.value)} /></Row>
          <Row label="Дата рождения"><Input type="date" value={form.birth || ''} onChange={(e) => sf('birth', e.target.value)} /></Row>
          <Row label="Пол"><select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={form.gender || ''} onChange={(e) => sf('gender', e.target.value)}><option value="">Выберите...</option><option>Мужской</option><option>Женский</option></select></Row>
          <Row label="Национальность"><Input value={form.nationality || ''} onChange={(e) => sf('nationality', e.target.value)} /></Row>
          <Row label="Телефон"><Input value={form.phone || ''} onChange={(e) => sf('phone', e.target.value)} placeholder="+7..." /></Row>
          <Row label="Статус">
            <select className="w-full h-10 rounded-md border border-input px-3 text-sm" value={form.status || ''} onChange={(e) => sf('status', e.target.value)}>
              <option value="">Выберите...</option>
              {STATUSES_CIT.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Row>
        </div>
        <div className="space-y-3">
          <h4 className="font-heading text-sm text-gov-navy uppercase border-b pb-1">Документы и адрес</h4>
          <Row label="Серия и номер паспорта"><Input value={form.passport || ''} onChange={(e) => sf('passport', e.target.value)} placeholder="4512 678901" /></Row>
          <Row label="Город"><Input value={form.city || ''} onChange={(e) => sf('city', e.target.value)} /></Row>
          <Row label="Адрес прописки"><Input value={form.address || ''} onChange={(e) => sf('address', e.target.value)} /></Row>
          <Row label="Примечание"><Textarea rows={3} value={form.note || ''} onChange={(e) => sf('note', e.target.value)} /></Row>
          <Row label="Фото">
            <div className="flex gap-3 items-center">
              <div className="w-20 h-24 bg-secondary border rounded overflow-hidden flex items-center justify-center">
                {photo ? <img src={photo} className="w-full h-full object-cover" /> : <Icon name="User" size={24} className="text-gov-navy/30" />}
              </div>
              <Button variant="outline" onClick={() => fileRef.current?.click()}><Icon name="Camera" size={16} className="mr-1" />Загрузить</Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await readFile(f)); }} />
            </div>
          </Row>
        </div>
      </div>
      <div className="flex gap-3 mt-6 pt-4 border-t">
        <Button className="bg-gov-navy hover:bg-gov-blue" onClick={save}><Icon name="Save" size={16} className="mr-2" />Сохранить карточку</Button>
      </div>
    </Card>
  );

  if (view === 'detail' && selected) return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="flex gap-2 mb-4 print:hidden">
        <Button variant="outline" onClick={() => setView('list')}><Icon name="ArrowLeft" size={16} className="mr-1" />Назад</Button>
        <Button variant="outline" onClick={() => window.print()}><Icon name="Printer" size={16} className="mr-1" />Печать</Button>
        <Button variant="destructive" onClick={() => del(selected.id)}><Icon name="Trash2" size={16} className="mr-1" />Удалить</Button>
      </div>
      <Card className="p-8 print:shadow-none print:border-none">
        <div className="flex items-center gap-4 border-b pb-5 mb-5">
          <img src={EMBLEM} className="w-14 h-14 object-cover rounded" />
          <div>
            <div className="font-heading text-base text-gov-navy uppercase">Министерство внутренних дел РФ</div>
            <div className="font-heading text-xl text-gov-navy uppercase tracking-wide">Личная карточка гражданина</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="w-full aspect-[3/4] bg-secondary rounded overflow-hidden border flex items-center justify-center">
              {selected.photo ? <img src={selected.photo} className="w-full h-full object-cover" /> : <Icon name="User" size={48} className="text-gov-navy/20" />}
            </div>
            <div className="mt-3 text-center"><StatusBadge s={selected.status} /></div>
          </div>
          <div className="col-span-2 space-y-4">
            <Section title="Персональные данные">
              <PrintRow label="ФИО" value={selected.fio} />
              <PrintRow label="Дата рождения" value={selected.birth || '—'} />
              <PrintRow label="Пол" value={selected.gender || '—'} />
              <PrintRow label="Национальность" value={selected.nationality || '—'} />
              <PrintRow label="Телефон" value={selected.phone || '—'} />
            </Section>
            <Section title="Документы">
              <PrintRow label="Паспорт" value={selected.passport || '—'} />
              <PrintRow label="Город" value={selected.city || '—'} />
              <PrintRow label="Адрес" value={selected.address || '—'} />
            </Section>
            {selected.note && <Section title="Примечание"><p className="text-sm mt-1 leading-relaxed">{selected.note}</p></Section>}
          </div>
        </div>
        <div className="mt-8 pt-4 border-t grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>Составил: _______________</div>
          <div>Дата: _______________</div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="bg-gov-navy hover:bg-gov-blue" onClick={() => setView('add')}><Icon name="UserPlus" size={16} className="mr-1" />Добавить гражданина</Button>
      </div>
      {rows.length === 0 ? <Empty text="Граждан пока нет. Нажмите «Добавить гражданина»." /> : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-muted-foreground">
              <tr>{['Фото', 'ФИО', 'Дата рождения', 'Паспорт', 'Город', 'Статус', ''].map((h, i) => <th key={i} className="px-4 py-3 font-500">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b hover:bg-secondary/50 cursor-pointer" onClick={() => { setSelected(c); setView('detail'); }}>
                  <td className="px-4 py-2">
                    <div className="w-10 h-12 bg-secondary rounded overflow-hidden flex items-center justify-center">
                      {c.photo ? <img src={c.photo} className="w-full h-full object-cover" /> : <Icon name="User" size={18} className="text-gov-navy/30" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-500 text-gov-navy">{c.fio}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.birth}</td>
                  <td className="px-4 py-3 font-mono">{c.passport}</td>
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3"><StatusBadge s={c.status} /></td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}><DeleteBtn onClick={() => del(c.id)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

/* ============================================================ STAFF */
function Staff({ store }: { store: readonly [StaffRow[], React.Dispatch<React.SetStateAction<StaffRow[]>>] }) {
  const [rows, setRows] = store;
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Partial<StaffRow>>({});
  const sf = (k: keyof StaffRow, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});

  const save = () => {
    if (!form.fio || !form.login || !form.password) { toast({ title: 'Заполните ФИО, логин и пароль', variant: 'destructive' }); return; }
    setRows((r) => [{ id: uid(), fio: form.fio!, dept: form.dept || '', rank: form.rank || '', tab: form.tab || '', login: form.login!, password: form.password!, phone: form.phone || '', note: form.note || '' }, ...r]);
    toast({ title: 'Сотрудник добавлен' });
    setForm({}); setAdding(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button className="bg-gov-navy hover:bg-gov-blue" onClick={() => setAdding(true)}><Icon name="UserPlus" size={16} className="mr-1" />Добавить сотрудника</Button>
      </div>

      {adding && (
        <Card className="p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg text-gov-navy uppercase">Новый сотрудник</h3>
            <Button variant="outline" onClick={() => { setAdding(false); setForm({}); }}><Icon name="X" size={16} /></Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Row label="ФИО *"><Input value={form.fio || ''} onChange={(e) => sf('fio', e.target.value)} /></Row>
            <Row label="Звание"><Input value={form.rank || ''} onChange={(e) => sf('rank', e.target.value)} /></Row>
            <Row label="Отдел"><Input value={form.dept || ''} onChange={(e) => sf('dept', e.target.value)} /></Row>
            <Row label="Табельный номер"><Input value={form.tab || ''} onChange={(e) => sf('tab', e.target.value)} /></Row>
            <Row label="Телефон"><Input value={form.phone || ''} onChange={(e) => sf('phone', e.target.value)} /></Row>
            <Row label="Логин *"><Input value={form.login || ''} onChange={(e) => sf('login', e.target.value)} /></Row>
            <Row label="Пароль *"><Input type="password" value={form.password || ''} onChange={(e) => sf('password', e.target.value)} /></Row>
            <Row label="Примечание"><Input value={form.note || ''} onChange={(e) => sf('note', e.target.value)} /></Row>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button className="bg-gov-navy hover:bg-gov-blue" onClick={save}><Icon name="Save" size={16} className="mr-2" />Сохранить</Button>
          </div>
        </Card>
      )}

      {rows.length === 0 && !adding && <Empty text="Сотрудников пока нет." />}

      <div className="grid grid-cols-2 gap-5">
        {rows.map((s) => (
          <Card key={s.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gov-navy text-white flex items-center justify-center shrink-0 text-lg font-700">
                {s.fio.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-500 text-gov-navy">{s.fio}</div>
                <div className="text-sm text-muted-foreground">{s.dept}</div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {s.rank && <Badge variant="secondary">{s.rank}</Badge>}
                  {s.tab && <Badge className="bg-gov-steel">Таб. {s.tab}</Badge>}
                  {s.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Icon name="Phone" size={12} />{s.phone}</span>}
                </div>
                <div className="mt-3 pt-3 border-t text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-14">Логин:</span>
                    <span className="font-mono font-500">{s.login}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-14">Пароль:</span>
                    <span className="font-mono">{showPass[s.id] ? s.password : '••••••••'}</span>
                    <button onClick={() => setShowPass((p) => ({ ...p, [s.id]: !p[s.id] }))} className="text-muted-foreground hover:text-gov-navy ml-1">
                      <Icon name={showPass[s.id] ? 'EyeOff' : 'Eye'} size={13} />
                    </button>
                  </div>
                  {s.note && <div className="text-muted-foreground">{s.note}</div>}
                </div>
              </div>
              <DeleteBtn onClick={() => { setRows((r) => r.filter((x) => x.id !== s.id)); toast({ title: 'Сотрудник удалён' }); }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ============================================================ PASSPORT */
function Passport({ store }: { store: readonly [PassportRow[], React.Dispatch<React.SetStateAction<PassportRow[]>>] }) {
  const [saved, setSaved] = store;
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  type PF = { fio: string; birth: string; place: string; series: string; number: string; issued: string; date: string; gender: string; code: string };
  const empty: PF = { fio: '', birth: '', place: '', series: '', number: '', issued: '', date: '', gender: '', code: '' };
  const [form, setForm] = useState<PF>(empty);
  const set = (k: keyof PF, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.fio) { toast({ title: 'Укажите ФИО', variant: 'destructive' }); return; }
    setSaved((r) => [{ id: uid(), ...form, photo }, ...r]);
    setForm(empty); setPhoto(null);
    toast({ title: 'Паспорт сохранён' });
  };

  const printPassport = () => {
    const el = printRef.current;
    if (!el) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Паспорт РФ</title>
    <link href="https://fonts.googleapis.com/css2?family=Times+New+Roman:wght@400;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
    <style>
      *{margin:0;padding:0;box-sizing:border-box;}
      body{background:#e8e8e8;font-family:'Roboto',sans-serif;display:flex;justify-content:center;align-items:flex-start;padding:30px;}
      .spread{display:flex;width:780px;box-shadow:0 8px 40px rgba(0,0,0,0.4);}
    </style></head><body><div class="spread">${el.innerHTML}</div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const fioP = form.fio ? form.fio.split(' ') : [];
  const lastName  = fioP[0] || '';
  const firstName = fioP[1] || '';
  const midName   = fioP[2] || '';
  const sn = (form.series || '0000').replace(/\s/g, '') + (form.number || '000000').replace(/\s/g, '');
  const mrzLine1 = `P<RUS${(lastName+'<<'+firstName+'<'+midName).toUpperCase().replace(/[^A-Z<]/g,'').padEnd(39,'<')}`.slice(0,44);
  const mrzLine2 = `${sn}0RUS${(form.birth||'').replace(/[^0-9]/g,'').slice(2,8).padEnd(6,'0')}0${(form.date||'').replace(/[^0-9]/g,'').slice(2,8).padEnd(6,'0')}1<<<<<<<<<<<<<<<4`.slice(0,44);

  // Shared page style (beige with subtle pattern)
  const pageBg = '#e8ddd0';
  const pageStyle: React.CSSProperties = {
    flex: 1, minHeight: '460px', padding: '22px 20px', position: 'relative', overflow: 'hidden',
    background: `${pageBg} url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23b8a898' fill-opacity='0.12'%3E%3Cpath d='M30 30m-12 0a12 12 0 1 0 24 0a12 12 0 1 0-24 0'/%3E%3C/g%3E%3C/svg%3E")`,
    fontFamily: 'Roboto,sans-serif',
  };

  return (
    <div className="space-y-6">
      {/* Layout: form left, passport preview right */}
      <div className="grid grid-cols-5 gap-6 items-start">
        {/* FORM */}
        <div className="col-span-2">
          <Card className="p-5">
            <h3 className="font-heading text-base text-gov-navy uppercase mb-4 tracking-wide">Данные паспорта</h3>
            <div className="space-y-2.5">
              <div><Label className="text-xs">Фамилия Имя Отчество</Label><Input className="mt-1 h-9" value={form.fio} onChange={(e) => set('fio', e.target.value)} placeholder="Иванов Иван Иванович" /></div>
              <div><Label className="text-xs">Дата рождения</Label><Input className="mt-1 h-9" value={form.birth} onChange={(e) => set('birth', e.target.value)} placeholder="01.01.1990" /></div>
              <div><Label className="text-xs">Пол</Label>
                <select className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                  <option value="">Выберите...</option><option>МУЖ.</option><option>ЖЕН.</option>
                </select>
              </div>
              <div><Label className="text-xs">Место рождения</Label><Input className="mt-1 h-9" value={form.place} onChange={(e) => set('place', e.target.value)} placeholder="с. Москва" /></div>
              <div><Label className="text-xs">Кем выдан</Label><Input className="mt-1 h-9" value={form.issued} onChange={(e) => set('issued', e.target.value)} placeholder="Отделением УФМС России..." /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Дата выдачи</Label><Input className="mt-1 h-9" value={form.date} onChange={(e) => set('date', e.target.value)} placeholder="01.01.2012" /></div>
                <div><Label className="text-xs">Код подразд.</Label><Input className="mt-1 h-9" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="110-005" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Серия</Label><Input className="mt-1 h-9" maxLength={4} value={form.series} onChange={(e) => set('series', e.target.value)} placeholder="4512" /></div>
                <div><Label className="text-xs">Номер</Label><Input className="mt-1 h-9" maxLength={6} value={form.number} onChange={(e) => set('number', e.target.value)} placeholder="123456" /></div>
              </div>
              <Button onClick={() => fileRef.current?.click()} variant="outline" className="w-full h-9">
                <Icon name="Camera" size={15} className="mr-2" />{photo ? 'Заменить фото' : 'Загрузить фото'}
              </Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await readFile(f)); }} />
              <div className="flex gap-2 pt-1">
                <Button onClick={save} className="flex-1 bg-gov-navy hover:bg-gov-blue h-9 text-sm"><Icon name="Save" size={15} className="mr-1.5" />Сохранить</Button>
                <Button onClick={printPassport} variant="outline" className="flex-1 h-9 text-sm"><Icon name="Printer" size={15} className="mr-1.5" />Печать</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* PASSPORT SPREAD PREVIEW */}
        <div className="col-span-3">
          <div ref={printRef} style={{ display: 'flex', boxShadow: '0 6px 30px rgba(0,0,0,0.35)', fontFamily: 'Roboto,sans-serif' }}>

            {/* ===== LEFT PAGE — выдача ===== */}
            <div style={{ ...pageStyle, borderRight: '3px solid #6b5a4a' }}>
              {/* watermark emblems */}
              {[['15%','20%'],['60%','50%'],['30%','75%']].map(([l,t],i) => (
                <img key={i} src={EMBLEM} style={{ position:'absolute', left:l, top:t, width:'60px', height:'60px', objectFit:'cover', opacity:0.06, filter:'grayscale(1)' }} />
              ))}
              {/* РОССИЯ repeated header */}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'7px', letterSpacing:'3px', color:'#8B1A1A', marginBottom:'10px', opacity:0.7 }}>
                {['РОССИЯ','РОССИЯ','РОССИЯ','РОССИЯ','РОССИЯ'].map((r,i)=><span key={i}>{r}</span>)}
              </div>
              {/* Title */}
              <div style={{ textAlign:'center', marginBottom:'14px' }}>
                <div style={{ fontSize:'10px', letterSpacing:'4px', color:'#222', textTransform:'uppercase', fontWeight:500 }}>Р О С С И Й С К А Я &nbsp; Ф Е Д Е Р А Ц И Я</div>
              </div>
              {/* Issued by */}
              <div style={{ marginBottom:'6px' }}>
                <div style={{ fontSize:'7.5px', color:'#555' }}>Паспорт выдан</div>
                <div style={{ borderBottom:'1px solid #888', paddingBottom:'2px', marginTop:'2px', minHeight:'16px', fontSize:'9px', fontWeight:600, textTransform:'uppercase', textAlign:'center', color:'#111', letterSpacing:'1px' }}>
                  {form.issued || ''}
                </div>
              </div>
              <div style={{ height:'8px' }} />
              {/* Date + code */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
                <div>
                  <div style={{ fontSize:'7.5px', color:'#555' }}>Дата выдачи</div>
                  <div style={{ borderBottom:'1px solid #888', paddingBottom:'2px', marginTop:'2px', minHeight:'16px', fontSize:'11px', fontWeight:600, color:'#222', letterSpacing:'1px' }}>{form.date || ''}</div>
                </div>
                <div>
                  <div style={{ fontSize:'7.5px', color:'#555' }}>Код подразделения</div>
                  <div style={{ borderBottom:'1px solid #888', paddingBottom:'2px', marginTop:'2px', minHeight:'16px', fontSize:'11px', fontWeight:600, color:'#222', letterSpacing:'1px' }}>{form.code || ''}</div>
                </div>
              </div>
              {/* Signature area */}
              <div style={{ display:'flex', gap:'20px', alignItems:'flex-end', marginTop:'10px', marginBottom:'16px' }}>
                <div style={{ flex:1 }}>
                  {/* mock signature */}
                  <div style={{ fontSize:'28px', color:'#333', fontFamily:'cursive', opacity:0.5, marginBottom:'4px', lineHeight:1 }}>
                    {form.fio ? form.fio.split(' ').map(w=>w[0]).join('') : ''}
                  </div>
                  <div style={{ borderBottom:'1px solid #888', width:'120px' }} />
                </div>
                {/* mock round stamp */}
                <div style={{ width:'72px', height:'72px', borderRadius:'50%', border:'2.5px dashed rgba(180,60,60,0.45)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <div style={{ width:'56px', height:'56px', borderRadius:'50%', border:'1.5px solid rgba(180,60,60,0.4)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', textAlign:'center' }}>
                    <div style={{ fontSize:'5px', color:'rgba(180,60,60,0.6)', letterSpacing:'1px', textTransform:'uppercase' }}>МВД<br/>РОССИЯ</div>
                    <img src={EMBLEM} style={{ width:'20px', height:'20px', objectFit:'cover', opacity:0.35 }} />
                    <div style={{ fontSize:'5px', color:'rgba(180,60,60,0.5)', letterSpacing:'0.5px' }}>{form.code || '000-000'}</div>
                  </div>
                </div>
              </div>
              {/* Personal sign */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'8px' }}>
                <div>
                  <div style={{ fontSize:'7px', color:'#666' }}>Личный код</div>
                  <div style={{ borderBottom:'1px solid #888', minHeight:'14px', marginTop:'2px' }} />
                </div>
                <div>
                  <div style={{ fontSize:'7px', color:'#666' }}>Личная подпись</div>
                  <div style={{ borderBottom:'1px solid #888', minHeight:'14px', marginTop:'2px' }} />
                </div>
              </div>
              {/* Series vertical */}
              <div style={{ position:'absolute', right:'6px', top:'0', bottom:'0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ writingMode:'vertical-rl', fontWeight:700, fontSize:'11px', color:'#8B1A1A', letterSpacing:'4px', opacity:0.85 }}>
                  {form.series || '00'} {form.number || '000000'}
                </div>
              </div>
              {/* РОССИЯ repeated footer */}
              <div style={{ position:'absolute', bottom:'4px', left:'20px', right:'20px', display:'flex', justifyContent:'space-between', fontSize:'7px', letterSpacing:'3px', color:'#8B1A1A', opacity:0.7 }}>
                {['RUSSIA','РОССИЯ','RUSSIA','РОССИЯ','RUSSIA'].map((r,i)=><span key={i}>{r}</span>)}
              </div>
            </div>

            {/* ===== RIGHT PAGE — фото и данные ===== */}
            <div style={{ ...pageStyle }}>
              {/* watermark emblems */}
              {[['10%','30%'],['55%','15%'],['40%','65%']].map(([l,t],i) => (
                <img key={i} src={EMBLEM} style={{ position:'absolute', left:l, top:t, width:'55px', height:'55px', objectFit:'cover', opacity:0.07, filter:'grayscale(1)' }} />
              ))}
              {/* РОССИЯ repeated header */}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'7px', letterSpacing:'3px', color:'#8B1A1A', marginBottom:'8px', opacity:0.7 }}>
                {['РОССИЯ','RUSSIA','РОССИЯ','RUSSIA','РОССИЯ'].map((r,i)=><span key={i}>{r}</span>)}
              </div>

              {/* Body: photo + fields */}
              <div style={{ display:'flex', gap:'14px', marginBottom:'10px' }}>
                {/* Photo with ornament frame */}
                <div style={{ flexShrink:0 }}>
                  <div style={{ width:'95px', height:'124px', border:'3px solid #8B1A1A', background:'#f0ebe4', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative' }}>
                    {/* red ornament corners */}
                    {[{top:0,left:0},{top:0,right:0},{bottom:0,left:0},{bottom:0,right:0}].map((pos,i)=>(
                      <div key={i} style={{ position:'absolute', width:'12px', height:'12px', borderTop: (pos.top===0)?'3px solid #8B1A1A':'none', borderBottom:(pos.bottom===0)?'3px solid #8B1A1A':'none', borderLeft:(pos.left===0)?'3px solid #8B1A1A':'none', borderRight:(pos.right===0)?'3px solid #8B1A1A':'none', ...pos }} />
                    ))}
                    {photo
                      ? <img src={photo} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <Icon name="User" size={36} className="text-gov-navy/25" />}
                  </div>
                </div>

                {/* Fields */}
                <div style={{ flex:1 }}>
                  {[
                    ['Фамилия', lastName],
                    ['Имя', firstName],
                    ['Отчество', midName],
                  ].map(([l,v]) => (
                    <div key={l} style={{ marginBottom:'8px' }}>
                      <div style={{ fontSize:'7px', color:'#555' }}>{l}</div>
                      <div style={{ fontSize:'11px', fontWeight:600, color:'#111', borderBottom:'1px solid #888', paddingBottom:'2px', minHeight:'15px', letterSpacing:'0.5px' }}>{v}</div>
                    </div>
                  ))}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                    <div>
                      <div style={{ fontSize:'7px', color:'#555' }}>Пол</div>
                      <div style={{ fontSize:'10px', fontWeight:600, color:'#111', borderBottom:'1px solid #888', paddingBottom:'2px', minHeight:'14px' }}>{form.gender || ''}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:'7px', color:'#555' }}>Дата рождения</div>
                      <div style={{ fontSize:'10px', fontWeight:600, color:'#111', borderBottom:'1px solid #888', paddingBottom:'2px', minHeight:'14px' }}>{form.birth || ''}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Place of birth */}
              <div style={{ marginBottom:'6px' }}>
                <div style={{ fontSize:'7px', color:'#555' }}>Место рождения</div>
                <div style={{ fontSize:'9.5px', fontWeight:600, color:'#111', borderBottom:'1px solid #888', paddingBottom:'2px', minHeight:'14px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                  {form.place ? `С. ${form.place}` : ''}
                </div>
              </div>

              {/* QR code */}
              <div style={{ position:'absolute', top:'30px', right:'28px' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent((form.series||'0000')+' '+(form.number||'000000')+' '+form.fio)}`} style={{ width:'52px', height:'52px', display:'block' }} />
                <div style={{ fontSize:'6px', color:'#aaa', textAlign:'center', marginTop:'2px' }}>ID</div>
              </div>

              {/* Series vertical */}
              <div style={{ position:'absolute', right:'6px', top:'0', bottom:'0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ writingMode:'vertical-rl', fontWeight:700, fontSize:'11px', color:'#8B1A1A', letterSpacing:'4px', opacity:0.85 }}>
                  {form.series || '00'} {form.number || '000000'}
                </div>
              </div>

              {/* MRZ zone */}
              <div style={{ position:'absolute', bottom:'20px', left:'20px', right:'20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'7px', letterSpacing:'3px', color:'#8B1A1A', marginBottom:'4px', opacity:0.7 }}>
                  {['РОССИЯ','RUSSIA','РОССИЯ','RUSSIA','РОССИЯ'].map((r,i)=><span key={i}>{r}</span>)}
                </div>
                <div style={{ background:'rgba(0,0,0,0.06)', padding:'4px 6px', borderRadius:'2px', fontFamily:'Courier New,monospace', fontSize:'7.5px', color:'#222', letterSpacing:'1.5px', lineHeight:'1.8' }}>
                  <div>{mrzLine1}</div>
                  <div>{mrzLine2}</div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Предпросмотр · данные обновляются в реальном времени</p>
        </div>
      </div>

      {/* Saved passports */}
      {saved.length > 0 && (
        <Card className="p-5">
          <h3 className="font-heading text-base text-gov-navy uppercase mb-4">Сохранённые паспорта ({saved.length})</h3>
          <div className="grid grid-cols-3 gap-3">
            {saved.map((p) => {
              const qr = `https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${encodeURIComponent(p.series+' '+p.number+' '+p.fio)}`;
              const fp = p.fio ? p.fio.split(' ') : [];
              return (
                <div key={p.id} className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow" style={{ background: '#e8ddd0' }}>
                  <button onClick={() => setSaved((r) => r.filter((x) => x.id !== p.id))} className="absolute top-1.5 right-1.5 z-10 bg-white/80 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-gov-red"><Icon name="Trash2" size={13} /></button>
                  <div style={{ display:'flex', padding:'10px', gap:'10px' }}>
                    {/* mini red bar */}
                    <div style={{ width:'4px', background:'#8B1A1A', borderRadius:'2px', flexShrink:0 }} />
                    {/* photo */}
                    <div style={{ width:'42px', height:'54px', border:'2px solid #8B1A1A', overflow:'hidden', flexShrink:0, background:'#f0ebe4', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {p.photo ? <img src={p.photo} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <Icon name="User" size={16} className="text-gov-navy/25" />}
                    </div>
                    {/* info */}
                    <div style={{ flex:1, overflow:'hidden' }}>
                      <div style={{ fontSize:'11px', fontWeight:700, color:'#111', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{fp[0] || '—'}</div>
                      <div style={{ fontSize:'9.5px', color:'#444' }}>{fp[1] || ''} {fp[2] || ''}</div>
                      <div style={{ fontSize:'9px', fontFamily:'monospace', color:'#8B1A1A', marginTop:'2px', fontWeight:600 }}>{p.series || '0000'} {p.number || '000000'}</div>
                      <div style={{ fontSize:'8px', color:'#777', marginTop:'1px' }}>{p.birth || '—'}</div>
                    </div>
                    <img src={qr} style={{ width:'38px', height:'38px', alignSelf:'center', flexShrink:0 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================================================ SEARCH */
function SearchTab({ citizens, cases }: { citizens: CitizenRow[]; cases: CaseRow[] }) {
  const [q, setQ] = useState('');
  const norm = (s: string) => s.toLowerCase().replace(/\s/g, '');
  const qn = norm(q);
  const cr = q ? citizens.filter((c) => norm(c.fio).includes(qn) || norm(c.passport).includes(qn)) : [];
  const cas = q ? cases.filter((c) => norm(c.fio).includes(qn) || norm(c.num).includes(qn)) : [];
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card className="p-6">
        <h3 className="font-heading text-lg text-gov-navy uppercase mb-4">Поиск по базе данных</h3>
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ФИО, номер паспорта или номер дела..." className="pl-10 h-12" />
        </div>
      </Card>
      {q && (
        <div className="space-y-4 animate-fade-in">
          {cr.length > 0 && <>
            <div className="font-heading text-sm text-gov-navy uppercase">Граждане</div>
            {cr.map((c) => (
              <Card key={c.id} className="p-4 flex items-center gap-4">
                <div className="w-12 h-14 rounded overflow-hidden bg-secondary flex items-center justify-center shrink-0">
                  {c.photo ? <img src={c.photo} className="w-full h-full object-cover" /> : <Icon name="User" size={22} className="text-gov-navy/30" />}
                </div>
                <div className="flex-1">
                  <div className="font-500 text-gov-navy">{c.fio}</div>
                  <div className="text-xs text-muted-foreground font-mono">Паспорт {c.passport} · {c.birth} · {c.city}</div>
                </div>
                <StatusBadge s={c.status} />
              </Card>
            ))}
          </>}
          {cas.length > 0 && <>
            <div className="font-heading text-sm text-gov-navy uppercase">Дела</div>
            {cas.map((c) => (
              <Card key={c.id} className="p-4 flex items-center gap-4">
                <Icon name="FolderOpen" size={28} className="text-gov-steel shrink-0" />
                <div className="flex-1">
                  <div className="font-500 text-gov-navy">{c.num} — {c.fio}</div>
                  <div className="text-xs text-muted-foreground">Ст. {c.article || '—'} · {c.officer}</div>
                </div>
                <StatusBadge s={c.status} />
              </Card>
            ))}
          </>}
          {cr.length === 0 && cas.length === 0 && <Card className="p-6 text-center text-muted-foreground">Ничего не найдено</Card>}
        </div>
      )}
    </div>
  );
}

/* ============================================================ REPORTS */
function Reports({ cases, citizens }: { cases: CaseRow[]; citizens: CitizenRow[] }) {
  const exportCsv = () => {
    const lines: string[] = ['\uFEFFДЕЛА', 'Номер;Статья;ФИО;Дата;Сотрудник;Статус'];
    cases.forEach((c) => lines.push(`${c.num};${c.article};${c.fio};${c.date};${c.officer};${c.status}`));
    lines.push('', 'ГРАЖДАНЕ', 'ФИО;Дата рождения;Паспорт;Город;Телефон;Статус');
    citizens.forEach((c) => lines.push(`${c.fio};${c.birth};${c.passport};${c.city};${c.phone};${c.status}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'mvd_report.csv'; a.click();
    toast({ title: 'Файл выгружен' });
  };
  return (
    <div className="grid grid-cols-2 gap-5">
      <Card className="p-6">
        <Icon name="FileText" size={28} className="text-gov-red" />
        <h3 className="font-heading text-lg text-gov-navy uppercase mt-3">Печать / PDF</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Открыть отчёт для печати или сохранения в PDF.</p>
        <Button className="bg-gov-red hover:bg-gov-red/90" onClick={() => window.print()}><Icon name="Printer" size={16} className="mr-2" />Печать / PDF</Button>
      </Card>
      <Card className="p-6">
        <Icon name="Sheet" size={28} className="text-green-600" />
        <h3 className="font-heading text-lg text-gov-navy uppercase mt-3">Excel (CSV)</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Выгрузить дела и граждан в таблицу Excel.</p>
        <Button className="bg-green-600 hover:bg-green-700" onClick={exportCsv}><Icon name="Download" size={16} className="mr-2" />Скачать Excel</Button>
      </Card>
    </div>
  );
}

/* ============================================================ SETTINGS */
function Settings() {
  const clearAll = () => {
    ['mvd_cases', 'mvd_citizens', 'mvd_staff', 'mvd_passports'].forEach((k) => localStorage.removeItem(k));
    toast({ title: 'База очищена' });
    setTimeout(() => window.location.reload(), 800);
  };
  return (
    <Card className="p-6 max-w-lg">
      <h3 className="font-heading text-lg text-gov-navy uppercase mb-4">Настройки системы</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Главный пользователь</span><span className="font-500">Novikov</span></div>
        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Хранилище</span><span className="font-500">Локальное (браузер)</span></div>
      </div>
      <Button variant="destructive" className="mt-5" onClick={clearAll}><Icon name="Trash2" size={16} className="mr-2" />Очистить всю базу</Button>
    </Card>
  );
}

/* ============================================================ HELPERS */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-xs text-muted-foreground">{label}</Label><div className="mt-1">{children}</div></div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div className="font-heading text-xs text-gov-navy uppercase border-b pb-1 mb-2">{title}</div>{children}</div>;
}
function PrintRow({ label, value }: { label: string; value: string }) {
  return <div className="flex gap-2 text-sm py-0.5"><span className="text-muted-foreground w-36 shrink-0">{label}:</span><span className="font-500">{value}</span></div>;
}
function Field({ l, v }: { l: string; v: string }) {
  return <div><div className="text-[10px] uppercase opacity-70">{l}</div><div className="font-500 min-h-[18px]">{v || '—'}</div></div>;
}
function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = { 'Закрыто': 'bg-secondary text-foreground', 'Чисто': 'bg-secondary text-foreground', 'В работе': 'bg-gov-steel text-white', 'Разыскивается': 'bg-gov-red text-white', 'Под наблюдением': 'bg-amber-500 text-white', 'Приостановлено': 'bg-amber-500 text-white' };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-500 ${map[s] || 'bg-secondary'}`}>{s}</span>;
}
function DeleteBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="text-muted-foreground hover:text-gov-red transition-colors p-1"><Icon name="Trash2" size={16} /></button>;
}
function Empty({ text }: { text: string }) {
  return <Card className="py-14 text-center text-muted-foreground"><Icon name="Inbox" size={40} className="mx-auto mb-2 text-gov-navy/20" /><p className="text-sm">{text}</p></Card>;
}

export default Index;