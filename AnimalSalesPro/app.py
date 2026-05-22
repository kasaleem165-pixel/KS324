import sqlite3
import os
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, abort, flash

app = Flask(__name__)
app.secret_key = "ks324-animal-sales"
DB = os.path.join(os.path.dirname(__file__), "sales.db")


def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS animals (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                code            TEXT UNIQUE NOT NULL,
                sno_weight      INTEGER,
                purchase_date   TEXT,
                description     TEXT,
                age_type        TEXT,
                weight_initial  REAL,
                weight_final    REAL,
                status          TEXT NOT NULL DEFAULT 'available',
                animal_type     TEXT,
                stage           TEXT,
                breed           TEXT,
                gender          TEXT,
                dob             TEXT,
                purchase_amount REAL,
                animal_source   TEXT,
                voucher_no      TEXT,
                voucher_date    TEXT,
                voucher_type    TEXT
            );

            CREATE TABLE IF NOT EXISTS customers (
                id      INTEGER PRIMARY KEY AUTOINCREMENT,
                name    TEXT NOT NULL,
                phone   TEXT,
                address TEXT
            );

            CREATE TABLE IF NOT EXISTS sales (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                receipt_no      TEXT UNIQUE NOT NULL,
                animal_code     TEXT NOT NULL,
                customer_id     INTEGER NOT NULL,
                sale_date       TEXT NOT NULL,
                weight_at_sale  REAL NOT NULL,
                rate_per_kg     REAL NOT NULL,
                expenses        REAL NOT NULL DEFAULT 0,
                amount          REAL NOT NULL,
                notes           TEXT,
                FOREIGN KEY (animal_code)  REFERENCES animals(code),
                FOREIGN KEY (customer_id)  REFERENCES customers(id)
            );

            CREATE TABLE IF NOT EXISTS payments (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                pay_date    TEXT NOT NULL,
                amount      REAL NOT NULL,
                method      TEXT NOT NULL DEFAULT 'Cash',
                notes       TEXT,
                FOREIGN KEY (customer_id) REFERENCES customers(id)
            );

            CREATE TABLE IF NOT EXISTS settings (
                key     TEXT PRIMARY KEY,
                value   TEXT
            );

            INSERT OR IGNORE INTO settings VALUES ('rate_per_kg', '780');
            INSERT OR IGNORE INTO settings VALUES ('expenses_default', '30000');
        """)


def migrate_db():
    new_cols = [
        ("animal_type",     "TEXT"),
        ("stage",           "TEXT"),
        ("breed",           "TEXT"),
        ("gender",          "TEXT"),
        ("dob",             "TEXT"),
        ("purchase_amount", "REAL"),
        ("animal_source",   "TEXT"),
        ("voucher_no",      "TEXT"),
        ("voucher_date",    "TEXT"),
        ("voucher_type",    "TEXT"),
    ]
    with get_db() as conn:
        existing = {row[1] for row in conn.execute("PRAGMA table_info(animals)")}
        for col, typ in new_cols:
            if col not in existing:
                conn.execute(f"ALTER TABLE animals ADD COLUMN {col} {typ}")


def get_setting(key):
    with get_db() as conn:
        row = conn.execute("SELECT value FROM settings WHERE key=?", (key,)).fetchone()
    return float(row["value"]) if row else 0


def next_receipt_no():
    with get_db() as conn:
        row = conn.execute(
            "SELECT receipt_no FROM sales ORDER BY id DESC LIMIT 1"
        ).fetchone()
    if not row:
        return "RCP-001"
    last_num = int(row["receipt_no"].split("-")[1])
    return f"RCP-{last_num + 1:03d}"


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    with get_db() as conn:
        total_animals = conn.execute("SELECT COUNT(*) FROM animals").fetchone()[0]
        available     = conn.execute("SELECT COUNT(*) FROM animals WHERE status='available'").fetchone()[0]
        sold          = conn.execute("SELECT COUNT(*) FROM animals WHERE status='sold'").fetchone()[0]
        revenue       = conn.execute("SELECT COALESCE(SUM(amount),0) FROM sales").fetchone()[0]
        collected     = conn.execute("SELECT COALESCE(SUM(amount),0) FROM payments").fetchone()[0]
        pending       = revenue - collected
        recent_sales  = conn.execute("""
            SELECT s.receipt_no, s.sale_date, s.amount, s.animal_code, c.name
            FROM sales s JOIN customers c ON c.id = s.customer_id
            ORDER BY s.id DESC LIMIT 6
        """).fetchall()
    return render_template("index.html",
        total_animals=total_animals, available=available, sold=sold,
        revenue=revenue, collected=collected, pending=pending,
        recent_sales=recent_sales)


# ── Animals ───────────────────────────────────────────────────────────────────

@app.route("/animals")
def animals():
    with get_db() as conn:
        rows = conn.execute("""
            SELECT a.*, s.receipt_no, c.name as customer_name
            FROM animals a
            LEFT JOIN sales s ON s.animal_code = a.code
            LEFT JOIN customers c ON c.id = s.customer_id
            ORDER BY CAST(a.code AS INTEGER)
        """).fetchall()
    return render_template("animals.html", animals=rows)


@app.route("/animals/add", methods=["GET", "POST"])
def add_animal():
    if request.method == "POST":
        code = request.form["code"].strip()
        try:
            wi = float(request.form["weight_initial"]) if request.form["weight_initial"] else None
            wf = float(request.form["weight_final"])   if request.form["weight_final"]   else None
            pa = float(request.form["purchase_amount"]) if request.form.get("purchase_amount") else None
            with get_db() as conn:
                conn.execute("""
                    INSERT INTO animals
                        (code, sno_weight, purchase_date, description, age_type, weight_initial, weight_final,
                         animal_type, stage, breed, gender, dob, purchase_amount,
                         animal_source, voucher_no, voucher_date, voucher_type)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """, (code, request.form.get("sno_weight") or None,
                      request.form.get("purchase_date") or None,
                      request.form.get("description") or None,
                      request.form.get("age_type") or None,
                      wi, wf,
                      request.form.get("animal_type") or None,
                      request.form.get("stage") or None,
                      request.form.get("breed") or None,
                      request.form.get("gender") or None,
                      request.form.get("dob") or None,
                      pa,
                      request.form.get("animal_source") or None,
                      request.form.get("voucher_no") or None,
                      request.form.get("voucher_date") or None,
                      request.form.get("voucher_type") or None))
            flash(f"Animal Code {code} added successfully.", "success")
            return redirect(url_for("animals"))
        except sqlite3.IntegrityError:
            flash(f"Animal Code '{code}' already exists.", "error")
    return render_template("add_animal.html")


@app.route("/animals/<code>/edit", methods=["GET", "POST"])
def edit_animal(code):
    with get_db() as conn:
        animal = conn.execute("SELECT * FROM animals WHERE code=?", (code,)).fetchone()
    if not animal:
        abort(404)
    if request.method == "POST":
        wi = float(request.form["weight_initial"]) if request.form["weight_initial"] else None
        wf = float(request.form["weight_final"])   if request.form["weight_final"]   else None
        pa = float(request.form["purchase_amount"]) if request.form.get("purchase_amount") else None
        with get_db() as conn:
            conn.execute("""
                UPDATE animals SET sno_weight=?, purchase_date=?, description=?,
                    age_type=?, weight_initial=?, weight_final=?,
                    animal_type=?, stage=?, breed=?, gender=?, dob=?,
                    purchase_amount=?, animal_source=?, voucher_no=?, voucher_date=?, voucher_type=?
                WHERE code=?
            """, (request.form.get("sno_weight") or None,
                  request.form.get("purchase_date") or None,
                  request.form.get("description") or None,
                  request.form.get("age_type") or None,
                  wi, wf,
                  request.form.get("animal_type") or None,
                  request.form.get("stage") or None,
                  request.form.get("breed") or None,
                  request.form.get("gender") or None,
                  request.form.get("dob") or None,
                  pa,
                  request.form.get("animal_source") or None,
                  request.form.get("voucher_no") or None,
                  request.form.get("voucher_date") or None,
                  request.form.get("voucher_type") or None,
                  code))
        flash(f"Animal {code} updated.", "success")
        return redirect(url_for("animals"))
    return render_template("add_animal.html", animal=animal)


# ── Customers ─────────────────────────────────────────────────────────────────

@app.route("/customers")
def customers():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM customers ORDER BY name").fetchall()
    return render_template("customers.html", customers=rows)


@app.route("/customers/add", methods=["GET", "POST"])
def add_customer():
    if request.method == "POST":
        with get_db() as conn:
            conn.execute(
                "INSERT INTO customers (name, phone, address) VALUES (?,?,?)",
                (request.form["name"], request.form.get("phone",""),
                 request.form.get("address",""))
            )
        flash("Customer added.", "success")
        return redirect(url_for("customers"))
    return render_template("add_customer.html")


@app.route("/customers/<int:cid>")
def customer_ledger(cid):
    with get_db() as conn:
        customer = conn.execute("SELECT * FROM customers WHERE id=?", (cid,)).fetchone()
        if not customer:
            abort(404)
        sales_rows = conn.execute("""
            SELECT s.*, a.age_type, a.weight_initial
            FROM sales s JOIN animals a ON a.code = s.animal_code
            WHERE s.customer_id=? ORDER BY s.sale_date
        """, (cid,)).fetchall()
        pay_rows = conn.execute(
            "SELECT * FROM payments WHERE customer_id=? ORDER BY pay_date", (cid,)
        ).fetchall()
        total_sale = conn.execute(
            "SELECT COALESCE(SUM(amount),0) FROM sales WHERE customer_id=?", (cid,)
        ).fetchone()[0]
        total_paid = conn.execute(
            "SELECT COALESCE(SUM(amount),0) FROM payments WHERE customer_id=?", (cid,)
        ).fetchone()[0]
    balance = total_sale - total_paid
    return render_template("ledger.html",
        customer=customer, sales=sales_rows, payments=pay_rows,
        total_sale=total_sale, total_paid=total_paid, balance=balance)


@app.route("/customers/<int:cid>/payment", methods=["GET", "POST"])
def add_payment(cid):
    with get_db() as conn:
        customer = conn.execute("SELECT * FROM customers WHERE id=?", (cid,)).fetchone()
    if not customer:
        abort(404)
    if request.method == "POST":
        with get_db() as conn:
            conn.execute(
                "INSERT INTO payments (customer_id, pay_date, amount, method, notes) VALUES (?,?,?,?,?)",
                (cid, request.form["pay_date"], float(request.form["amount"]),
                 request.form.get("method","Cash"), request.form.get("notes",""))
            )
        flash("Payment recorded.", "success")
        return redirect(url_for("customer_ledger", cid=cid))
    today = datetime.now().strftime("%Y-%m-%d")
    return render_template("add_payment.html", customer=customer, today=today)


# ── Sales ─────────────────────────────────────────────────────────────────────

@app.route("/sales")
def sales():
    with get_db() as conn:
        rows = conn.execute("""
            SELECT s.*, a.age_type, a.weight_initial, c.name AS customer_name
            FROM sales s
            JOIN animals a ON a.code = s.animal_code
            JOIN customers c ON c.id = s.customer_id
            ORDER BY s.id DESC
        """).fetchall()
    return render_template("sales.html", sales=rows)


@app.route("/sales/new", methods=["GET", "POST"])
def new_sale():
    default_rate     = get_setting("rate_per_kg")
    default_expenses = get_setting("expenses_default")
    with get_db() as conn:
        available_animals = conn.execute(
            "SELECT * FROM animals WHERE status='available' ORDER BY CAST(code AS INTEGER)"
        ).fetchall()
        all_customers = conn.execute("SELECT * FROM customers ORDER BY name").fetchall()

    if request.method == "POST":
        animal_code = request.form["animal_code"]
        customer_id = int(request.form["customer_id"])
        weight      = float(request.form["weight_at_sale"])
        rate        = float(request.form["rate_per_kg"])
        expenses    = float(request.form.get("expenses", 0) or 0)
        amount      = (weight * rate) + expenses
        receipt_no  = next_receipt_no()
        sale_date   = datetime.now().strftime("%Y-%m-%d %H:%M")

        with get_db() as conn:
            conn.execute("""
                INSERT INTO sales
                    (receipt_no, animal_code, customer_id, sale_date,
                     weight_at_sale, rate_per_kg, expenses, amount, notes)
                VALUES (?,?,?,?,?,?,?,?,?)
            """, (receipt_no, animal_code, customer_id, sale_date,
                  weight, rate, expenses, amount, request.form.get("notes","")))
            conn.execute("UPDATE animals SET status='sold', weight_final=? WHERE code=?",
                         (weight, animal_code))
        flash(f"Sale recorded. Receipt: {receipt_no}", "success")
        return redirect(url_for("receipt", receipt_no=receipt_no))

    today = datetime.now().strftime("%Y-%m-%d")
    return render_template("new_sale.html",
        animals=available_animals, customers=all_customers,
        default_rate=default_rate, default_expenses=default_expenses, today=today)


@app.route("/receipt/<receipt_no>")
def receipt(receipt_no):
    with get_db() as conn:
        row = conn.execute("""
            SELECT s.*, a.age_type, a.weight_initial, a.description AS animal_desc,
                   a.purchase_date, a.purchase_amount, a.animal_source,
                   a.animal_type, a.stage, a.breed, a.gender, a.dob,
                   a.voucher_no, a.voucher_date, a.voucher_type,
                   c.name AS customer_name, c.phone, c.address
            FROM sales s
            JOIN animals a ON a.code = s.animal_code
            JOIN customers c ON c.id = s.customer_id
            WHERE s.receipt_no = ?
        """, (receipt_no,)).fetchone()
    if not row:
        abort(404)
    return render_template("receipt.html", s=row)


# ── Settings ──────────────────────────────────────────────────────────────────

@app.route("/settings", methods=["GET", "POST"])
def settings():
    if request.method == "POST":
        with get_db() as conn:
            conn.execute("INSERT OR REPLACE INTO settings VALUES ('rate_per_kg', ?)",
                         (request.form["rate_per_kg"],))
            conn.execute("INSERT OR REPLACE INTO settings VALUES ('expenses_default', ?)",
                         (request.form["expenses_default"],))
        flash("Settings saved.", "success")
        return redirect(url_for("settings"))
    rate     = get_setting("rate_per_kg")
    expenses = get_setting("expenses_default")
    return render_template("settings.html", rate=rate, expenses=expenses)


if __name__ == "__main__":
    init_db()
    migrate_db()
    app.run(debug=True, port=5000)
