from datetime import datetime, date, timezone
from fastapi import Query
def get_date(
        date: date | None = Query(default=None, description="Chosen date")
) -> date:
    if date is None:
        return datetime.now(timezone.utc).date()
    return date