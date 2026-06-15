import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const EMBLEM = 'https://cdn.poehali.dev/projects/23f78510-d61e-421b-ab2d-e3655583e49b/files/4886d43a-97a2-4017-9b47-131d9da248d8.jpg';
const LOGIN = 'Novikov';
const PASSWORD = '89223109976';

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

type CaseRow = { id: string; num: string; title: string; date: string; officer: string; status: string };
type CitizenRow = { id: string; fio: string; birth: string; passport: string; city: string; status: string };
type StaffRow = { id: string; fio: string; dept: string; rank: string; tab: string };
type PassportRow = { id: string; fio: string; birth: string; place: string; series: string; number: string; issued: string; date: string; photo: string | null };

function useStore<T>(key: string, initial: T[]) {
  const [items, setItems] = useState<T[]>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items));
  }, [key, items]);
  return [items, setItems] as const;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const Index = () => {
  const [authed, setAuthed] = useState(() => localStorage.getItem('mvd_auth') === '1');
  const [tab, setTab] = useState('home');

  const cases = useStore<CaseRow>('mvd_cases', []);
  const citizens = useStore<CitizenRow>('mvd_citizens', []);
  const staff = useStore<StaffRow>('mvd_staff', []);
  const passports = useStore<PassportRow>('mvd_passports', []);

  const login = () => { localStorage.setItem('mvd_auth', '1'); setAuthed(true); };
  const logout = () => { localStorage.removeItem('mvd_auth'); setAuthed(false); };

  if (!authed) return <Login onLogin={login} />;

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
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-500 transition-colors ${
                tab === n.id ? 'bg-white text-gov-navy' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              <Icon name={n.icon} size={18} />
              {n.label}
            </button>
          ))}
        </nav>
        <button
          onClick={logout}
          className="m-3 flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-white/70 hover:bg-gov-red/80 hover:text-white transition-colors"
        >
          <Icon name="LogOut" size={18} /> Выйти
        </button>
      </aside>

      <main className="flex-1 ml-64 print:ml-0">
        <header className="bg-white border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10 print:hidden">
          <h1 className="font-heading text-xl text-gov-navy uppercase tracking-wide">
            {NAV.find((n) => n.id === tab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              <Icon name="Wifi" size={12} className="mr-1" /> Защищённое соединение
            </Badge>
            <div className="flex items-center gap-2 pl-3 border-l">
              <div className="w-9 h-9 rounded-full bg-gov-navy text-white flex items-center justify-center text-sm font-700">NV</div>
              <div className="text-sm leading-tight">
                <div className="font-500">Novikov</div>
                <div className="text-xs text-muted-foreground">Сотрудник МВД</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 animate-fade-in" key={tab}>
          {tab === 'home' && <Home setTab={setTab} cases={cases[0]} citizens={citizens[0]} staff={staff[0]} passports={passports[0]} />}
          {tab === 'cases' && <Cases store={cases} />}
          {tab === 'citizens' && <Citizens store={citizens} />}
          {tab === 'passport' && <Passport store={passports} />}
          {tab === 'search' && <SearchTab citizens={citizens[0]} />}
          {tab === 'staff' && <Staff store={staff} />}
          {tab === 'reports' && <Reports cases={cases[0]} citizens={citizens[0]} />}
          {tab === 'settings' && <Settings />}
        </div>
      </main>
    </div>
  );
};

/* ---------------- Login ---------------- */
function Login({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === LOGIN && pass === PASSWORD) onLogin();
    else toast({ title: 'Ошибка входа', description: 'Неверный логин или пароль', variant: 'destructive' });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-navy gov-pattern p-4">
      <Card className="w-full max-w-md p-8 animate-scale-in shadow-2xl">
        <div className="text-center mb-8">
          <img src={EMBLEM} alt="герб" className="w-20 h-20 mx-auto rounded-lg object-cover mb-4" />
          <h1 className="font-heading text-2xl text-gov-navy uppercase tracking-wide">Единая база МВД</h1>
          <p className="text-sm text-muted-foreground mt-1">Авторизация сотрудника</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Логин</Label>
            <Input value={user} onChange={(e) => setUser(e.target.value)} placeholder="Логин" className="mt-1" />
          </div>
          <div>
            <Label>Пароль</Label>
            <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" className="mt-1" />
          </div>
          <Button type="submit" className="w-full bg-gov-navy hover:bg-gov-blue h-11 font-heading uppercase tracking-wide">
            <Icon name="LogIn" size={18} className="mr-2" /> Войти в систему
          </Button>
        </form>
        <p className="text-[11px] text-center text-muted-foreground mt-6 flex items-center justify-center gap-1">
          <Icon name="Lock" size={12} /> Доступ только для уполномоченных лиц
        </p>
      </Card>
    </div>
  );
}

/* ---------------- Home ---------------- */
function Home({ setTab, cases, citizens, staff, passports }: { setTab: (t: string) => void; cases: CaseRow[]; citizens: CitizenRow[]; staff: StaffRow[]; passports: PassportRow[] }) {
  const stats = [
    { label: 'Активных дел', value: cases.filter((c) => c.status !== 'Закрыто').length, icon: 'FolderOpen', color: 'text-gov-steel' },
    { label: 'Граждан в базе', value: citizens.length, icon: 'Users', color: 'text-gov-navy' },
    { label: 'Паспортов выдано', value: passports.length, icon: 'BookUser', color: 'text-gov-gold' },
    { label: 'Сотрудников', value: staff.length, icon: 'ShieldCheck', color: 'text-gov-red' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-5">
        {stats.map((s) => (
          <Card key={s.label} className="p-5 hover:shadow-md transition-shadow">
            <Icon name={s.icon} size={26} className={s.color} />
            <div className="font-heading text-3xl text-gov-navy mt-3">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h3 className="font-heading text-lg text-gov-navy uppercase mb-4">Быстрые действия</h3>
        <div className="grid grid-cols-3 gap-3">
          <Button onClick={() => setTab('passport')} variant="outline" className="justify-start"><Icon name="BookUser" size={16} className="mr-2" /> Создать паспорт</Button>
          <Button onClick={() => setTab('citizens')} variant="outline" className="justify-start"><Icon name="UserPlus" size={16} className="mr-2" /> Добавить гражданина</Button>
          <Button onClick={() => setTab('cases')} variant="outline" className="justify-start"><Icon name="FolderPlus" size={16} className="mr-2" /> Завести дело</Button>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- Reusable add modal ---------------- */
function FieldsForm({ fields, onSubmit, onCancel }: { fields: [string, string][]; onSubmit: (v: Record<string, string>) => void; onCancel: () => void }) {
  const [v, setV] = useState<Record<string, string>>({});
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(v); }}
      className="bg-secondary rounded-lg p-5 mb-5 grid grid-cols-2 gap-3 animate-fade-in"
    >
      {fields.map(([k, label]) => (
        <div key={k} className={k === 'title' || k === 'fio' ? 'col-span-2' : ''}>
          <Label>{label}</Label>
          <Input className="mt-1 bg-white" value={v[k] || ''} onChange={(e) => setV((p) => ({ ...p, [k]: e.target.value }))} required />
        </div>
      ))}
      <div className="col-span-2 flex gap-2 pt-1">
        <Button type="submit" className="bg-gov-navy hover:bg-gov-blue"><Icon name="Check" size={16} className="mr-1" /> Сохранить</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>
      </div>
    </form>
  );
}

/* ---------------- Cases ---------------- */
function Cases({ store }: { store: readonly [CaseRow[], React.Dispatch<React.SetStateAction<CaseRow[]>>] }) {
  const [rows, setRows] = store;
  const [adding, setAdding] = useState(false);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b">
        <h3 className="font-heading text-lg text-gov-navy uppercase">Реестр дел</h3>
        <Button className="bg-gov-navy hover:bg-gov-blue" onClick={() => setAdding(true)}><Icon name="Plus" size={16} className="mr-1" /> Новое дело</Button>
      </div>
      <div className="p-5">
        {adding && (
          <FieldsForm
            fields={[['num', 'Номер дела'], ['title', 'Описание'], ['date', 'Дата'], ['officer', 'Ответственный'], ['status', 'Статус']]}
            onSubmit={(v) => { setRows((r) => [{ id: uid(), num: v.num, title: v.title, date: v.date, officer: v.officer, status: v.status || 'В работе' }, ...r]); setAdding(false); toast({ title: 'Дело добавлено' }); }}
            onCancel={() => setAdding(false)}
          />
        )}
        {rows.length === 0 && !adding && <Empty text="Дел пока нет. Нажмите «Новое дело»." />}
        {rows.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-muted-foreground">
              <tr>{['Номер', 'Описание', 'Дата', 'Ответственный', 'Статус', ''].map((h, i) => <th key={i} className="px-4 py-2 font-500">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b hover:bg-secondary/50">
                  <td className="px-4 py-3 font-500 text-gov-navy">{c.num}</td>
                  <td className="px-4 py-3">{c.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.date}</td>
                  <td className="px-4 py-3">{c.officer}</td>
                  <td className="px-4 py-3"><Badge variant={c.status === 'Закрыто' ? 'secondary' : 'default'} className={c.status !== 'Закрыто' ? 'bg-gov-steel' : ''}>{c.status}</Badge></td>
                  <td className="px-4 py-3 text-right"><DeleteBtn onClick={() => setRows((r) => r.filter((x) => x.id !== c.id))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

/* ---------------- Citizens ---------------- */
function Citizens({ store }: { store: readonly [CitizenRow[], React.Dispatch<React.SetStateAction<CitizenRow[]>>] }) {
  const [rows, setRows] = store;
  const [adding, setAdding] = useState(false);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b">
        <h3 className="font-heading text-lg text-gov-navy uppercase">Личные карточки граждан</h3>
        <Button className="bg-gov-navy hover:bg-gov-blue" onClick={() => setAdding(true)}><Icon name="UserPlus" size={16} className="mr-1" /> Добавить</Button>
      </div>
      <div className="p-5">
        {adding && (
          <FieldsForm
            fields={[['fio', 'ФИО'], ['birth', 'Дата рождения'], ['passport', 'Паспорт'], ['city', 'Город'], ['status', 'Статус']]}
            onSubmit={(v) => { setRows((r) => [{ id: uid(), fio: v.fio, birth: v.birth, passport: v.passport, city: v.city, status: v.status || 'Чисто' }, ...r]); setAdding(false); toast({ title: 'Гражданин добавлен' }); }}
            onCancel={() => setAdding(false)}
          />
        )}
        {rows.length === 0 && !adding && <Empty text="Граждан пока нет. Нажмите «Добавить»." />}
        {rows.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-muted-foreground">
              <tr>{['ФИО', 'Дата рождения', 'Паспорт', 'Город', 'Статус', ''].map((h, i) => <th key={i} className="px-4 py-2 font-500">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b hover:bg-secondary/50">
                  <td className="px-4 py-3 font-500 text-gov-navy">{c.fio}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.birth}</td>
                  <td className="px-4 py-3 font-mono">{c.passport}</td>
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3"><Badge variant={c.status === 'Чисто' ? 'secondary' : 'destructive'}>{c.status}</Badge></td>
                  <td className="px-4 py-3 text-right"><DeleteBtn onClick={() => setRows((r) => r.filter((x) => x.id !== c.id))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
}

/* ---------------- Staff ---------------- */
function Staff({ store }: { store: readonly [StaffRow[], React.Dispatch<React.SetStateAction<StaffRow[]>>] }) {
  const [rows, setRows] = store;
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button className="bg-gov-navy hover:bg-gov-blue" onClick={() => setAdding(true)}><Icon name="UserPlus" size={16} className="mr-1" /> Добавить сотрудника</Button>
      </div>
      {adding && (
        <Card className="p-2">
          <FieldsForm
            fields={[['fio', 'ФИО'], ['dept', 'Отдел'], ['rank', 'Звание'], ['tab', 'Таб. номер']]}
            onSubmit={(v) => { setRows((r) => [{ id: uid(), fio: v.fio, dept: v.dept, rank: v.rank, tab: v.tab }, ...r]); setAdding(false); toast({ title: 'Сотрудник добавлен' }); }}
            onCancel={() => setAdding(false)}
          />
        </Card>
      )}
      {rows.length === 0 && !adding && <Card className="p-2"><Empty text="Сотрудников пока нет." /></Card>}
      <div className="grid grid-cols-3 gap-5">
        {rows.map((s) => (
          <Card key={s.id} className="p-6 text-center hover:shadow-md transition-shadow relative">
            <button onClick={() => setRows((r) => r.filter((x) => x.id !== s.id))} className="absolute top-3 right-3 text-muted-foreground hover:text-gov-red"><Icon name="Trash2" size={16} /></button>
            <div className="w-16 h-16 rounded-full bg-gov-navy text-white flex items-center justify-center mx-auto mb-3"><Icon name="ShieldCheck" size={28} /></div>
            <div className="font-500 text-gov-navy">{s.fio}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.dept}</div>
            <div className="flex items-center justify-center gap-2 mt-3 text-xs">
              <Badge variant="secondary">{s.rank}</Badge>
              <Badge className="bg-gov-steel">Таб. {s.tab}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Passport ---------------- */
function Passport({ store }: { store: readonly [PassportRow[], React.Dispatch<React.SetStateAction<PassportRow[]>>] }) {
  const [saved, setSaved] = store;
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  type PF = { fio: string; birth: string; place: string; series: string; number: string; issued: string; date: string };
  const empty: PF = { fio: '', birth: '', place: '', series: '', number: '', issued: '', date: '' };
  const [form, setForm] = useState<PF>(empty);
  const set = (k: keyof PF, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const qrData = encodeURIComponent(`${form.series || '0000'} ${form.number || '000000'} ${form.fio || 'Гражданин РФ'}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`;

  const save = () => {
    if (!form.fio) { toast({ title: 'Укажите ФИО', variant: 'destructive' }); return; }
    setSaved((r) => [{ id: uid(), ...form, photo }, ...r]);
    setForm(empty); setPhoto(null);
    toast({ title: 'Паспорт сохранён' });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6 print:block">
        <Card className="p-6 print:hidden">
          <h3 className="font-heading text-lg text-gov-navy uppercase mb-4">Создание паспорта</h3>
          <div className="space-y-3">
            {([['fio', 'Фамилия Имя Отчество'], ['birth', 'Дата рождения'], ['place', 'Место рождения'], ['issued', 'Кем выдан'], ['date', 'Дата выдачи']] as [keyof PF, string][]).map(([k, label]) => (
              <div key={k}>
                <Label>{label}</Label>
                <Input className="mt-1" value={form[k]} onChange={(e) => set(k, e.target.value)} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Серия</Label><Input className="mt-1" maxLength={4} value={form.series} onChange={(e) => set('series', e.target.value)} /></div>
              <div><Label>Номер</Label><Input className="mt-1" maxLength={6} value={form.number} onChange={(e) => set('number', e.target.value)} /></div>
            </div>
            <Button onClick={() => fileRef.current?.click()} variant="outline" className="w-full">
              <Icon name="Camera" size={16} className="mr-2" /> {photo ? 'Заменить фото' : 'Загрузить фото'}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            <div className="flex gap-2">
              <Button onClick={save} className="flex-1 bg-gov-navy hover:bg-gov-blue"><Icon name="Save" size={16} className="mr-2" /> Сохранить</Button>
              <Button onClick={() => window.print()} variant="outline" className="flex-1"><Icon name="Printer" size={16} className="mr-2" /> Печать</Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <PassportCard data={form} photo={photo} qrUrl={qrUrl} />
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-md p-3 print:hidden">
            <Icon name="QrCode" size={16} className="text-gov-steel" />
            QR-код содержит серию, номер и ФИО для быстрой идентификации
          </div>
        </div>
      </div>

      {saved.length > 0 && (
        <Card className="p-6 print:hidden">
          <h3 className="font-heading text-lg text-gov-navy uppercase mb-4">Сохранённые паспорта ({saved.length})</h3>
          <div className="grid grid-cols-3 gap-4">
            {saved.map((p) => (
              <div key={p.id} className="border rounded-lg p-3 flex gap-3 items-center relative hover:shadow-md transition-shadow">
                <button onClick={() => setSaved((r) => r.filter((x) => x.id !== p.id))} className="absolute top-2 right-2 text-muted-foreground hover:text-gov-red"><Icon name="Trash2" size={15} /></button>
                <div className="w-12 h-16 bg-secondary rounded overflow-hidden flex items-center justify-center shrink-0">
                  {p.photo ? <img src={p.photo} alt="" className="w-full h-full object-cover" /> : <Icon name="User" size={20} className="text-gov-navy/30" />}
                </div>
                <div className="text-sm min-w-0">
                  <div className="font-500 text-gov-navy truncate">{p.fio}</div>
                  <div className="text-xs font-mono text-muted-foreground">{p.series || '0000'} {p.number || '000000'}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function PassportCard({ data, photo, qrUrl }: { data: { fio: string; birth: string; place: string; series: string; number: string }; photo: string | null; qrUrl: string }) {
  return (
    <Card className="p-6 bg-gradient-to-br from-[#7a1414] to-[#9E1B1B] text-white relative overflow-hidden print:shadow-none">
      <div className="absolute right-4 top-4 opacity-20"><Icon name="Shield" size={80} /></div>
      <div className="text-center border-b border-white/30 pb-3 mb-4">
        <div className="font-heading text-lg uppercase tracking-widest">Российская Федерация</div>
        <div className="text-xs uppercase tracking-wider opacity-90">Паспорт гражданина</div>
      </div>
      <div className="flex gap-4">
        <div className="w-28 h-36 bg-white/90 rounded flex items-center justify-center overflow-hidden shrink-0">
          {photo ? <img src={photo} alt="фото" className="w-full h-full object-cover" /> : <Icon name="User" size={40} className="text-gov-navy/40" />}
        </div>
        <div className="flex-1 text-sm space-y-1.5">
          <Field l="Фамилия, имя, отчество" v={data.fio} />
          <Field l="Дата рождения" v={data.birth} />
          <Field l="Место рождения" v={data.place} />
        </div>
      </div>
      <div className="flex items-end justify-between mt-4 pt-3 border-t border-white/30">
        <div className="text-sm">
          <div className="text-[10px] uppercase opacity-70">Серия / Номер</div>
          <div className="font-mono font-700 text-lg tracking-wider">{data.series || '0000'} {data.number || '000000'}</div>
        </div>
        <div className="bg-white p-1 rounded">
          <img src={qrUrl} alt="QR" className="w-16 h-16" />
        </div>
      </div>
    </Card>
  );
}

function Field({ l, v }: { l: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase opacity-70">{l}</div>
      <div className="font-500 min-h-[18px]">{v || '—'}</div>
    </div>
  );
}

/* ---------------- Search ---------------- */
function SearchTab({ citizens }: { citizens: CitizenRow[] }) {
  const [q, setQ] = useState('');
  const results = q
    ? citizens.filter((c) => c.fio.toLowerCase().includes(q.toLowerCase()) || c.passport.replace(/\s/g, '').includes(q.replace(/\s/g, '')))
    : [];
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Card className="p-6">
        <h3 className="font-heading text-lg text-gov-navy uppercase mb-4">Поиск по базе данных</h3>
        <div className="relative">
          <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ФИО или номер паспорта..." className="pl-10 h-12" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Поиск по ФИО и серии/номеру паспорта</p>
      </Card>
      {q && (
        <div className="space-y-3 animate-fade-in">
          {results.length === 0 && <Card className="p-6 text-center text-muted-foreground">Ничего не найдено</Card>}
          {results.map((c) => (
            <Card key={c.id} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-gov-navy text-white flex items-center justify-center"><Icon name="User" size={22} /></div>
              <div className="flex-1">
                <div className="font-500 text-gov-navy">{c.fio}</div>
                <div className="text-xs text-muted-foreground font-mono">Паспорт {c.passport} · {c.birth} · {c.city}</div>
              </div>
              <Badge variant={c.status === 'Чисто' ? 'secondary' : 'destructive'}>{c.status}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Reports ---------------- */
function Reports({ cases, citizens }: { cases: CaseRow[]; citizens: CitizenRow[] }) {
  const exportCsv = () => {
    const lines: string[] = ['ДЕЛА'];
    lines.push('Номер;Описание;Дата;Ответственный;Статус');
    cases.forEach((c) => lines.push(`${c.num};${c.title};${c.date};${c.officer};${c.status}`));
    lines.push('', 'ГРАЖДАНЕ', 'ФИО;Дата рождения;Паспорт;Город;Статус');
    citizens.forEach((c) => lines.push(`${c.fio};${c.birth};${c.passport};${c.city};${c.status}`));
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mvd_report.csv';
    a.click();
    toast({ title: 'Отчёт выгружен в Excel (CSV)' });
  };
  return (
    <div className="grid grid-cols-2 gap-5">
      <Card className="p-6">
        <Icon name="FileText" size={28} className="text-gov-red" />
        <h3 className="font-heading text-lg text-gov-navy uppercase mt-3">Экспорт в PDF</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Открыть отчёт для печати или сохранения в PDF.</p>
        <Button className="bg-gov-red hover:bg-gov-red/90" onClick={() => window.print()}><Icon name="Printer" size={16} className="mr-2" /> Печать / PDF</Button>
      </Card>
      <Card className="p-6">
        <Icon name="Sheet" size={28} className="text-green-600" />
        <h3 className="font-heading text-lg text-gov-navy uppercase mt-3">Экспорт в Excel</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Выгрузить дела и граждан в таблицу Excel.</p>
        <Button className="bg-green-600 hover:bg-green-700" onClick={exportCsv}><Icon name="Download" size={16} className="mr-2" /> Скачать Excel</Button>
      </Card>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function Settings() {
  const clearAll = () => {
    ['mvd_cases', 'mvd_citizens', 'mvd_staff', 'mvd_passports'].forEach((k) => localStorage.removeItem(k));
    toast({ title: 'База очищена', description: 'Обновите страницу' });
    setTimeout(() => window.location.reload(), 800);
  };
  return (
    <Card className="p-6 max-w-lg">
      <h3 className="font-heading text-lg text-gov-navy uppercase mb-4">Настройки системы</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Пользователь</span><span className="font-500">Novikov</span></div>
        <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Хранилище</span><span className="font-500">Локальное (браузер)</span></div>
      </div>
      <Button variant="destructive" className="mt-5" onClick={clearAll}><Icon name="Trash2" size={16} className="mr-2" /> Очистить всю базу</Button>
    </Card>
  );
}

/* ---------------- Helpers ---------------- */
function DeleteBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="text-muted-foreground hover:text-gov-red transition-colors"><Icon name="Trash2" size={16} /></button>;
}
function Empty({ text }: { text: string }) {
  return (
    <div className="py-12 text-center text-muted-foreground">
      <Icon name="Inbox" size={40} className="mx-auto mb-2 text-gov-navy/20" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export default Index;
