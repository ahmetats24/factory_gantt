# app.py
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:admin123@localhost:5432/factory_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)


# Utilities
ISO_ERROR = {"error": "Invalid ISO-8601 datetime. Use e.g. 2025-08-20T09:00:00Z"}

def parse_iso_utc(iso_str: str) -> datetime | None:
    try:
        # Accept ...Z or explicit offset
        dt = datetime.fromisoformat((iso_str or '').replace('Z', '+00:00'))
        # Require timezone-aware
        if dt.tzinfo is None:
            return None
        return dt.astimezone(timezone.utc)
    except Exception:
        return None

def to_utc_z(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')


class WorkOrder(db.Model):
    __tablename__ = 'work_orders'
    id = db.Column(db.String, primary_key=True)
    product = db.Column(db.String, nullable=False)
    qty = db.Column(db.Integer, nullable=False)
    operations = db.relationship('Operation', backref='work_order', cascade="all, delete-orphan", order_by='Operation.index')

class Operation(db.Model):
    __tablename__ = 'operations'
    id = db.Column(db.String, primary_key=True)
    work_order_id = db.Column(db.String, db.ForeignKey('work_orders.id'), nullable=False)
    index = db.Column(db.Integer, nullable=False)
    machine_id = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    start = db.Column(db.DateTime(timezone=True), nullable=False)
    end = db.Column(db.DateTime(timezone=True), nullable=False)


@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "name": "Factory Gantt API",
        "endpoints": [
            "GET /api/work_orders",
            "PUT /api/operations/<op_id>",
            "GET /api/server_time"
        ]
    })


@app.route('/api/server_time', methods=['GET'])
def server_time():
    now = datetime.now(timezone.utc)
    return jsonify({"nowUtc": to_utc_z(now)})


@app.route('/api/work_orders', methods=['GET'])
def get_work_orders():
    work_orders = WorkOrder.query.all()
    return jsonify([{
        "id": wo.id,
        "product": wo.product,
        "qty": wo.qty,
        "operations": [
            {
                "id": op.id,
                "workOrderId": op.work_order_id,
                "index": op.index,
                "machineId": op.machine_id,
                "name": op.name,
                "start": to_utc_z(op.start),
                "end": to_utc_z(op.end)
            } for op in wo.operations
        ]
    } for wo in work_orders])


@app.route('/api/operations/<op_id>', methods=['PUT'])
def update_operation(op_id):
    op = Operation.query.get(op_id)
    if not op:
        return jsonify({"error": "Operation not found"}), 404

    data = request.json or {}
    start_str = data.get('start')
    end_str = data.get('end')
    if not start_str or not end_str:
        return jsonify({"error": "Both 'start' and 'end' are required"}), 400

    new_start = parse_iso_utc(start_str)
    new_end = parse_iso_utc(end_str)
    if not new_start or not new_end:
        return jsonify(ISO_ERROR), 400

    if new_end <= new_start:
        return jsonify({"error": "End must be after start", "start": to_utc_z(new_start), "end": to_utc_z(new_end)}), 400

    now = datetime.now(timezone.utc)
    if new_start < now:
        return jsonify({
            "error": "Start cannot be before now",
            "nowUtc": to_utc_z(now),
            "start": to_utc_z(new_start)
        }), 400

    # R1 — Precedence within Work Order
    ops_in_wo = Operation.query.filter_by(work_order_id=op.work_order_id).order_by(Operation.index).all()
    for i, o in enumerate(ops_in_wo):
        if o.id == op.id:
            if i > 0 and new_start < ops_in_wo[i - 1].end:
                return jsonify({
                    "error": "Precedence violation: must start at or after previous operation ends",
                    "previousOpId": ops_in_wo[i - 1].id,
                    "previousEnd": to_utc_z(ops_in_wo[i - 1].end)
                }), 400
            if i < len(ops_in_wo) - 1 and new_end > ops_in_wo[i + 1].start:
                return jsonify({
                    "error": "Must end before next operation starts",
                    "nextOpId": ops_in_wo[i + 1].id,
                    "nextStart": to_utc_z(ops_in_wo[i + 1].start)
                }), 400
            break

    # R2 — Lane exclusivity on same machine
    overlap = Operation.query.filter(
        Operation.machine_id == op.machine_id,
        Operation.id != op.id,
        Operation.start < new_end,
        Operation.end > new_start
    ).first()
    if overlap:
        return jsonify({
            "error": f"Lane exclusivity violation: overlaps with operation {overlap.id} on machine {op.machine_id}",
            "overlapOpId": overlap.id,
            "overlapStart": to_utc_z(overlap.start),
            "overlapEnd": to_utc_z(overlap.end)
        }), 400

    op.start = new_start
    op.end = new_end
    db.session.commit()
    return jsonify({"message": "Operation updated successfully", "id": op.id, "start": to_utc_z(op.start), "end": to_utc_z(op.end)})


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


if __name__ == '__main__':
    app.run(debug=True)
