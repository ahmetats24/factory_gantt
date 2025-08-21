from app import app, db, WorkOrder, Operation
from datetime import datetime, timezone, timedelta
import json
import os

def parse_iso_utc(iso_str: str):
    try:
        dt = datetime.fromisoformat((iso_str or '').replace('Z', '+00:00'))
        if dt.tzinfo is None:
            return None
        return dt.astimezone(timezone.utc)
    except Exception:
        return None

# Optional: Shift all seed times by SEED_SHIFT_HOURS (e.g., 24 -> tomorrow)
SEED_SHIFT_HOURS = int(os.environ.get('SEED_SHIFT_HOURS', '0'))

with app.app_context():
    with open('seed.json', 'r', encoding='utf-8') as f:
        seed = json.load(f)

    Operation.query.delete()
    WorkOrder.query.delete()
    db.session.commit()

    shift = timedelta(hours=SEED_SHIFT_HOURS)

    for wo in seed:
        work_order = WorkOrder(
            id=wo['id'],
            product=wo['product'],
            qty=wo['qty']
        )
        db.session.add(work_order)
        for op in wo.get('operations', []):
            start_dt = parse_iso_utc(op['start'])
            end_dt = parse_iso_utc(op['end'])
            if start_dt is None or end_dt is None:
                raise ValueError(f"Invalid ISO-8601 in seed for operation {op.get('id')}")
            start_dt += shift
            end_dt += shift
            operation = Operation(
                id=op['id'],
                work_order_id=op['workOrderId'],
                index=op['index'],
                machine_id=op['machineId'],
                name=op['name'],
                start=start_dt,
                end=end_dt
            )
            db.session.add(operation)

    db.session.commit()
    print("Seed complete! Shift hours:", SEED_SHIFT_HOURS)
