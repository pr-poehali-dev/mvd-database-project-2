
CREATE TABLE IF NOT EXISTS t_p3424016_mvd_database_project.cases (
  id TEXT PRIMARY KEY,
  num TEXT NOT NULL,
  title TEXT DEFAULT '',
  article TEXT DEFAULT '',
  date TEXT DEFAULT '',
  officer TEXT DEFAULT '',
  status TEXT DEFAULT 'В работе',
  fio TEXT DEFAULT '',
  birth TEXT DEFAULT '',
  address TEXT DEFAULT '',
  descr TEXT DEFAULT '',
  photo TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p3424016_mvd_database_project.citizens (
  id TEXT PRIMARY KEY,
  fio TEXT NOT NULL,
  birth TEXT DEFAULT '',
  passport TEXT DEFAULT '',
  city TEXT DEFAULT '',
  address TEXT DEFAULT '',
  status TEXT DEFAULT 'Чисто',
  photo TEXT DEFAULT NULL,
  phone TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  nationality TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p3424016_mvd_database_project.passports (
  id TEXT PRIMARY KEY,
  fio TEXT NOT NULL,
  birth TEXT DEFAULT '',
  place TEXT DEFAULT '',
  series TEXT DEFAULT '',
  number TEXT DEFAULT '',
  issued TEXT DEFAULT '',
  date TEXT DEFAULT '',
  gender TEXT DEFAULT '',
  code TEXT DEFAULT '',
  photo TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p3424016_mvd_database_project.staff (
  id TEXT PRIMARY KEY,
  fio TEXT NOT NULL,
  dept TEXT DEFAULT '',
  rank TEXT DEFAULT '',
  tab TEXT DEFAULT '',
  login TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
