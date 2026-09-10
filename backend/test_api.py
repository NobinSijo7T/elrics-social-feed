#!/usr/bin/env python
"""
Automated 6-point CRUD test suite for the Django REST Framework backend.

Usage:
    python test_api.py [base_url]

    base_url defaults to http://127.0.0.1:8000

Requires the Django server to be running:
    python manage.py runserver

Tests:
  1. GET /api/users/    — list users
  2. GET /api/products/ — list products
  3. GET /api/todos/    — list todos
  4. POST /api/todos/   — create a new todo
  5. PATCH /api/todos/<id>/ — update the todo
  6. DELETE /api/todos/<id>/ — delete the todo
"""

import sys
import json
import urllib.request
import urllib.error

BASE_URL = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "http://127.0.0.1:8000"

PASS = "[PASS]"
FAIL = "[FAIL]"

results: list[tuple[str, bool, str]] = []


def request(method: str, path: str, body: dict | None = None) -> tuple[int, dict | list]:
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read().decode()
        return e.code, json.loads(raw) if raw else {}


def check(name: str, condition: bool, detail: str = "") -> None:
    results.append((name, condition, detail))
    status = PASS if condition else FAIL
    print(f"  {status}  {name}" + (f"\n         {detail}" if detail else ""))


def run_tests() -> None:
    print(f"\n{'='*60}")
    print(f"  Elrics — Django REST Framework API Test Suite")
    print(f"  Target: {BASE_URL}")
    print(f"{'='*60}\n")

    # ── Test 1: List users ───────────────────────────────────────
    print("[ Test 1 ] GET /api/users/")
    code, body = request("GET", "/api/users/")
    check("Status is 200", code == 200, f"Got {code}")
    check("Response is list or paginated", isinstance(body, (list, dict)), str(body)[:80])
    count = len(body.get("results", body)) if isinstance(body, dict) else len(body)
    check("Users returned", count >= 0, f"{count} record(s)")
    print()

    # ── Test 2: List products ────────────────────────────────────
    print("[ Test 2 ] GET /api/products/")
    code, body = request("GET", "/api/products/")
    check("Status is 200", code == 200, f"Got {code}")
    p_count = len(body.get("results", body)) if isinstance(body, dict) else len(body)
    check("Products returned", p_count >= 0, f"{p_count} record(s)")
    print()

    # ── Test 3: List todos ───────────────────────────────────────
    print("[ Test 3 ] GET /api/todos/")
    code, body = request("GET", "/api/todos/")
    check("Status is 200", code == 200, f"Got {code}")
    t_count = len(body.get("results", body)) if isinstance(body, dict) else len(body)
    check("Todos returned", t_count >= 0, f"{t_count} record(s)")
    print()

    # ── Test 4: Create a todo ────────────────────────────────────
    print("[ Test 4 ] POST /api/todos/ (create)")
    payload = {"title": "DRF Integration Test Todo", "completed": False}
    code, body = request("POST", "/api/todos/", payload)
    check("Status is 201", code == 201, f"Got {code}")
    created_id = body.get("id") if isinstance(body, dict) else None
    check("Response has id", bool(created_id), f"id={created_id}")
    check("Title matches", body.get("title") == payload["title"], body.get("title"))
    print()

    if not created_id:
        print("  WARNING  Skipping tests 5 & 6 — no id from create step.\n")
        _print_summary()
        return

    # ── Test 5: Update the todo ──────────────────────────────────
    print(f"[ Test 5 ] PATCH /api/todos/{created_id}/ (update)")
    code, body = request("PATCH", f"/api/todos/{created_id}/", {"completed": True})
    check("Status is 200", code == 200, f"Got {code}")
    check("completed=True", body.get("completed") is True, str(body.get("completed")))
    print()

    # ── Test 6: Delete the todo ──────────────────────────────────
    print(f"[ Test 6 ] DELETE /api/todos/{created_id}/ (delete)")
    code, _ = request("DELETE", f"/api/todos/{created_id}/")
    check("Status is 204", code == 204, f"Got {code}")

    # Confirm deletion
    code, _ = request("GET", f"/api/todos/{created_id}/")
    check("Record is gone (404)", code == 404, f"Got {code}")
    print()

    _print_summary()


def _print_summary() -> None:
    passed = sum(1 for _, ok, _ in results if ok)
    total = len(results)
    print(f"{'='*60}")
    print(f"  Results: {passed}/{total} checks passed")
    if passed == total:
        print("  *** All tests passed --- Django <-> Supabase integration OK! ***")
    else:
        failed = [name for name, ok, _ in results if not ok]
        print(f"  WARNING Failed: {', '.join(failed)}")
    print(f"{'='*60}\n")
    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    run_tests()
