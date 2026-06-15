import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

const CITIZENS = [
  { id: 1, fio: 'Иванов Иван Иванович', birth: '14.03.1988', passport: '4512 678901', city: 'Москва', status: 'Чисто' },
  { id: 2, fio: 'Петрова Анна Сергеевна', birth: '02.07.1995', passport: '4509 112233', city: 'Санкт-Петербург', status: 'Чисто' },
  { id: 3, fio: 'Сидоров Олег Викторович', birth: '21.11.1979', passport: '4518 445566', city: 'Казань', status: 'Под наблюдением' },
  { id: 4, fio: 'Кузнецова Мария Павловна', birth: '30.05.2001', passport: '4520 778899', city: 'Новосибирск', status: 'Чисто' },
];

const CASES = [
  { id: '№ 2024-0451', title: 'Кража имущества', date: '12.06.2024', officer: 'Капитан Орлов А.В.', status: 'В работе' },
  { id: '№ 2024-0448', title: 'Мошенничество', date: '09.06.2024', officer: 'Лейтенант Белова Е.С.', status: 'В работе' },
  { id: '№ 2024-0430', title: 'Нарушение ПДД', date: '01.06.2024', officer: 'Майор Громов Д.И.', status: 'Закрыто' },
];

const STAFF = [
  { fio: 'Майор Громов Дмитрий Игоревич', dept: 'Уголовный розыск', rank: 'Майор', tab: '0451' },
  { fio: 'Капитан Орлов Артём Владимирович', dept: 'Следственный отдел', rank: 'Капитан', tab: '0452' },
  { fio: 'Лейтенант Белова Елена Сергеевна', dept: 'Дознание', rank: 'Лейтенант', tab: '0453' },
];

const Index = () => {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState('home');

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen flex bg-secondary">
      {/* Sidebar */}
      <aside className="w-64 bg-gov-navy text-white flex flex-col fixed h-full gov-pattern">
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
          onClick={() => setAuthed(false)}
          className="m-3 flex items-center gap-3 px-4 py-2.5 rounded-md text-sm text-white/70 hover:bg-gov-red/80 hover:text-white transition-colors"
        >
          <Icon name="LogOut" size={18} /> Выйти
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64">
        <header className="bg-white border-b h-16 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="font-heading text-xl text-gov-navy uppercase tracking-wide">
            {NAV.find((n) => n.id === tab)?.label}
          </h1>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              <Icon name="Wifi" size={12} className="mr-1" /> Защищённое соединение
            </Badge>
            <div className="flex items-center gap-2 pl-3 border-l">
              <div className="w-9 h-9 rounded-full bg-gov-navy text-white flex items-center justify-center text-sm font-700">ДГ</div>
              <div className="text-sm leading-tight">
                <div className="font-500">Майор Громов Д.И.</div>
                <div className="text-xs text-muted-foreground">Уголовный розыск</div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 animate-fade-in" key={tab}>
          {tab === 'home' && <Home setTab={setTab} />}
          {tab === 'cases' && <Cases />}
          {tab === 'citizens' && <Citizens />}
          {tab === 'passport' && <Passport />}
          {tab === 'search' && <SearchTab />}
          {tab === 'staff' && <Staff />}
          {tab === 'reports' && <Reports />}
          {tab === 'settings' && <Placeholder icon="Settings" title="Настройки системы" />}
        </div>
      </main>
    </div>
  );
};

/* ---------------- Login ---------------- */
function Login({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-navy gov-pattern p-4">
      <Card className="w-full max-w-md p-8 animate-scale-in shadow-2xl">
        <div className="text-center mb-8">
          <img src={EMBLEM} alt="герб" className="w-20 h-20 mx-auto rounded-lg object-cover mb-4" />
          <h1 className="font-heading text-2xl text-gov-navy uppercase tracking-wide">Единая база МВD</h1>
          <p className="text-sm text-muted-foreground mt-1">Авторизация сотрудника</p>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); onLogin(); }}
          className="space-y-4"
        >
          <div>
            <Label>Табельный номер</Label>
            <Input placeholder="0451" className="mt-1" defaultValue="0451" />
          </div>
          <div>
            <Label>Пароль</Label>
            <Input type="password" placeholder="••••••••" className="mt-1" defaultValue="123456" />
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
function Home({ setTab }: { setTab: (t: string) => void }) {
  const stats = [
    { label: 'Активных дел', value: '142', icon: 'FolderOpen', color: 'text-gov-steel' },
    { label: 'Граждан в базе', value: '38 410', icon: 'Users', color: 'text-gov-navy' },
    { label: 'Паспортов выдано', value: '1 207', icon: 'BookUser', color: 'text-gov-gold' },
    { label: 'Сотрудников', value: '64', icon: 'ShieldCheck', color: 'text-gov-red' },
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
      <div className="grid grid-cols-3 gap-5">
        <Card className="col-span-2 p-6">
          <h3 className="font-heading text-lg text-gov-navy uppercase mb-4">Последние дела</h3>
          <div className="space-y-3">
            {CASES.map((c) => (
              <div key={c.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div>
                  <div className="font-500">{c.title}</div>
                  <div className="text-xs text-muted-foreground">{c.id} · {c.officer}</div>
                </div>
                <Badge variant={c.status === 'Закрыто' ? 'secondary' : 'default'} className={c.status !== 'Закрыто' ? 'bg-gov-steel' : ''}>{c.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-heading text-lg text-gov-navy uppercase mb-4">Быстрые действия</h3>
          <div className="space-y-2">
            <Button onClick={() => setTab('passport')} variant="outline" className="w-full justify-start"><Icon name="BookUser" size={16} className="mr-2" /> Создать паспорт</Button>
            <Button onClick={() => setTab('citizens')} variant="outline" className="w-full justify-start"><Icon name="UserPlus" size={16} className="mr-2" /> Добавить гражданина</Button>
            <Button onClick={() => setTab('search')} variant="outline" className="w-full justify-start"><Icon name="Search" size={16} className="mr-2" /> Поиск по базе</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- Cases ---------------- */
function Cases() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b">
        <h3 className="font-heading text-lg text-gov-navy uppercase">Реестр дел</h3>
        <Button className="bg-gov-navy hover:bg-gov-blue"><Icon name="Plus" size={16} className="mr-1" /> Новое дело</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-muted-foreground">
          <tr>
            {['Номер', 'Описание', 'Дата', 'Ответственный', 'Статус'].map((h) => <th key={h} className="px-5 py-3 font-500">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {CASES.map((c) => (
            <tr key={c.id} className="border-b hover:bg-secondary/50 transition-colors">
              <td className="px-5 py-3 font-500 text-gov-navy">{c.id}</td>
              <td className="px-5 py-3">{c.title}</td>
              <td className="px-5 py-3 text-muted-foreground">{c.date}</td>
              <td className="px-5 py-3">{c.officer}</td>
              <td className="px-5 py-3"><Badge variant={c.status === 'Закрыто' ? 'secondary' : 'default'} className={c.status !== 'Закрыто' ? 'bg-gov-steel' : ''}>{c.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ---------------- Citizens ---------------- */
function Citizens() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b">
        <h3 className="font-heading text-lg text-gov-navy uppercase">Личные карточки граждан</h3>
        <Button className="bg-gov-navy hover:bg-gov-blue"><Icon name="UserPlus" size={16} className="mr-1" /> Добавить</Button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-secondary text-left text-muted-foreground">
          <tr>
            {['ФИО', 'Дата рождения', 'Паспорт', 'Город', 'Статус'].map((h) => <th key={h} className="px-5 py-3 font-500">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {CITIZENS.map((c) => (
            <tr key={c.id} className="border-b hover:bg-secondary/50 transition-colors">
              <td className="px-5 py-3 font-500 text-gov-navy">{c.fio}</td>
              <td className="px-5 py-3 text-muted-foreground">{c.birth}</td>
              <td className="px-5 py-3 font-mono">{c.passport}</td>
              <td className="px-5 py-3">{c.city}</td>
              <td className="px-5 py-3"><Badge variant={c.status === 'Чисто' ? 'secondary' : 'destructive'}>{c.status}</Badge></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ---------------- Passport ---------------- */
function Passport() {
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  type PassportForm = { fio: string; birth: string; place: string; series: string; number: string; issued: string; date: string };
  const [form, setForm] = useState<PassportForm>({ fio: '', birth: '', place: '', series: '', number: '', issued: '', date: '' });
  const set = (k: keyof PassportForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPhoto(URL.createObjectURL(f));
  };

  const qrData = encodeURIComponent(`${form.series || '0000'} ${form.number || '000000'} ${form.fio || 'Гражданин РФ'}`);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}`;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Form */}
      <Card className="p-6">
        <h3 className="font-heading text-lg text-gov-navy uppercase mb-4">Создание паспорта</h3>
        <div className="space-y-3">
          {([
            ['fio', 'Фамилия Имя Отчество'],
            ['birth', 'Дата рождения'],
            ['place', 'Место рождения'],
            ['issued', 'Кем выдан'],
            ['date', 'Дата выдачи'],
          ] as [keyof PassportForm, string][]).map(([k, label]) => (
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
        </div>
      </Card>

      {/* Preview */}
      <div className="flex flex-col gap-4">
        <Card className="p-6 bg-gradient-to-br from-[#7a1414] to-[#9E1B1B] text-white relative overflow-hidden">
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
              <Field l="Фамилия, имя, отчество" v={form.fio} />
              <Field l="Дата рождения" v={form.birth} />
              <Field l="Место рождения" v={form.place} />
            </div>
          </div>
          <div className="flex items-end justify-between mt-4 pt-3 border-t border-white/30">
            <div className="text-sm">
              <div className="text-[10px] uppercase opacity-70">Серия / Номер</div>
              <div className="font-mono font-700 text-lg tracking-wider">{form.series || '0000'} {form.number || '000000'}</div>
            </div>
            <div className="bg-white p-1 rounded">
              <img src={qrUrl} alt="QR" className="w-16 h-16" />
            </div>
          </div>
        </Card>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary rounded-md p-3">
          <Icon name="QrCode" size={16} className="text-gov-steel" />
          QR-код содержит серию, номер и ФИО для быстрой идентификации
        </div>
      </div>
    </div>
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
function SearchTab() {
  const [q, setQ] = useState('');
  const results = q
    ? CITIZENS.filter((c) => c.fio.toLowerCase().includes(q.toLowerCase()) || c.passport.replace(/\s/g, '').includes(q.replace(/\s/g, '')))
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

/* ---------------- Staff ---------------- */
function Staff() {
  return (
    <div className="grid grid-cols-3 gap-5">
      {STAFF.map((s) => (
        <Card key={s.tab} className="p-6 text-center hover:shadow-md transition-shadow">
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
  );
}

/* ---------------- Reports ---------------- */
function Reports() {
  return (
    <div className="grid grid-cols-2 gap-5">
      <Card className="p-6">
        <Icon name="FileText" size={28} className="text-gov-red" />
        <h3 className="font-heading text-lg text-gov-navy uppercase mt-3">Экспорт в PDF</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Сформировать отчёт по делам и гражданам в формате PDF.</p>
        <Button className="bg-gov-red hover:bg-gov-red/90"><Icon name="Download" size={16} className="mr-2" /> Скачать PDF</Button>
      </Card>
      <Card className="p-6">
        <Icon name="Sheet" size={28} className="text-green-600" />
        <h3 className="font-heading text-lg text-gov-navy uppercase mt-3">Экспорт в Excel</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Выгрузить таблицы базы данных в формате Excel.</p>
        <Button className="bg-green-600 hover:bg-green-700"><Icon name="Download" size={16} className="mr-2" /> Скачать Excel</Button>
      </Card>
    </div>
  );
}

function Placeholder({ icon, title }: { icon: string; title: string }) {
  return (
    <Card className="p-16 text-center text-muted-foreground">
      <Icon name={icon} size={48} className="mx-auto mb-3 text-gov-navy/30" />
      <h3 className="font-heading text-lg text-gov-navy uppercase">{title}</h3>
      <p className="text-sm mt-1">Раздел в разработке</p>
    </Card>
  );
}

export default Index;