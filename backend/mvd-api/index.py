import json
import os
import psycopg2

SCHEMA = 't_p3424016_mvd_database_project'
CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

ALLOWED_TABLES = {'cases', 'citizens', 'passports', 'staff'}

COLUMNS = {
    'cases':     ['id','num','title','article','date','officer','status','fio','birth','address','descr','photo'],
    'citizens':  ['id','fio','birth','passport','city','address','status','photo','phone','gender','nationality','note'],
    'passports': ['id','fio','birth','place','series','number','issued','date','gender','code','photo'],
    'staff':     ['id','fio','dept','rank','tab','login','password','phone','note'],
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data):
    return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False)}


def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps({'error': msg})}


def handler(event: dict, context) -> dict:
    """CRUD API для всех разделов МВД: дела, граждане, паспорта, сотрудники."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    qs = event.get('queryStringParameters') or {}
    table = qs.get('table', '')

    if table not in ALLOWED_TABLES:
        return err(f'Unknown table: {table}')

    cols = COLUMNS[table]
    tbl = f'"{SCHEMA}"."{table}"'

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET — список всех записей
        if method == 'GET':
            cur.execute(f'SELECT {", ".join(cols)} FROM {tbl} ORDER BY created_at DESC')
            rows = cur.fetchall()
            result = [dict(zip(cols, row)) for row in rows]
            return ok(result)

        # POST — создать запись
        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            # Фильтруем только разрешённые колонки
            data = {k: v for k, v in body.items() if k in cols}
            if not data:
                return err('Empty data')
            keys = list(data.keys())
            vals = [data[k] for k in keys]
            placeholders = ', '.join(['%s'] * len(keys))
            col_list = ', '.join([f'"{k}"' for k in keys])
            cur.execute(
                f'INSERT INTO {tbl} ({col_list}) VALUES ({placeholders})',
                vals
            )
            conn.commit()
            return ok({'ok': True})

        # DELETE — удалить по id
        if method == 'DELETE':
            row_id = qs.get('id', '')
            if not row_id:
                return err('No id')
            cur.execute(f'DELETE FROM {tbl} WHERE id = %s', (row_id,))
            conn.commit()
            return ok({'ok': True})

        return err('Method not allowed', 405)

    finally:
        cur.close()
        conn.close()
