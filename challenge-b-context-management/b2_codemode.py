"""Challenge B2 - Code Mode.

Same question over many log files, two ways:
  native   : LLM gets list_files/read_file -> every raw log line flows through the context
  codemode : LLM gets run_code -> its script reads the logs in a subprocess, only stdout returns
Prints input tokens (from API usage), bytes sent to the LLM, and correctness vs ground truth.

Run:  python b2_codemode.py [both|native|code]
"""
import os
import random
import re
import shutil
import subprocess
import sys
from collections import Counter

from llm import HERE, USAGE_LOG, run_agent, usage_table

LOGS = os.path.join(HERE, "b2_logs")
N_FILES, N_LINES = 10, 400
QUESTION = ("Trong toàn bộ các file log, 5 endpoint nào có nhiều response status 500 nhất? "
            "Endpoint là path (vd /v1/orders), gộp mọi HTTP method. "
            "Trả lời bằng bảng: endpoint | số lần 500, sắp xếp giảm dần.")
# probability of a 500 per endpoint; distinct rates make a clear top 5
RATE500 = {"/v1/payments": .14, "/v1/orders": .11, "/v1/auth/refresh": .09, "/v1/inventory": .07, "/v1/search": .05,
           "/v1/cart": .02, "/v1/users": .015, "/v1/shipping": .015, "/v1/reviews": .01, "/v1/coupons": .01,
           "/v1/profile": .005, "/v1/notifications": .005}
FORMAT = "2026-10-20T08:15:02Z ERROR POST /v1/orders 500 431ms node=3 req=9f2a11c0"


def make_logs():
    shutil.rmtree(LOGS, ignore_errors=True)
    os.makedirs(LOGS, exist_ok=True)
    rng = random.Random(2026)
    for f in range(1, N_FILES + 1):
        lines = []
        for i in range(N_LINES):
            ep = rng.choice(list(RATE500))
            status = 500 if rng.random() < RATE500[ep] else rng.choice([200] * 8 + [201, 204, 400, 404, 429])
            level = "ERROR" if status >= 500 else "WARN" if status >= 400 else "INFO"
            lines.append(f"2026-10-20T{8 + i * 10 // N_LINES:02d}:{rng.randint(0, 59):02d}:{rng.randint(0, 59):02d}Z "
                         f"{level} {rng.choice(['GET', 'POST'])} {ep} {status} {rng.randint(3, 900)}ms "
                         f"node={f} req={rng.getrandbits(32):08x}")
        with open(os.path.join(LOGS, f"api-node{f:02d}.log"), "w", encoding="utf-8") as fh:
            fh.write("\n".join(lines) + "\n")


def ground_truth():
    c = Counter()
    for name in os.listdir(LOGS):
        with open(os.path.join(LOGS, name), encoding="utf-8") as fh:
            for line in fh:
                p = line.split()
                if p[4] == "500":
                    c[p[3]] += 1
    return c.most_common(5)


def score(answer, truth):
    """How many of the true top-5 (endpoint AND exact count on the same line) the answer got."""
    lines = answer.splitlines()
    return sum(any(ep in l and re.search(rf"(?<!\d){n}(?!\d)", l) for l in lines) for ep, n in truth)


# ---------------------------------------------------------------- tools
SENT = Counter()  # chars each mode's tools returned into the LLM context


def list_files():
    out = "\n".join(f"{n} ({os.path.getsize(os.path.join(LOGS, n)):,} bytes)" for n in sorted(os.listdir(LOGS)))
    SENT["native"] += len(out)
    return out


def read_file(name):
    with open(os.path.join(LOGS, os.path.basename(name)), encoding="utf-8") as fh:
        out = fh.read()
    SENT["native"] += len(out)
    return out


def run_code(code):
    # ponytail: subprocess + timeout is NOT a sandbox (slide 31); production needs a container,
    # no network, permission checks and CPU/memory limits
    print("          --- script ---\n          " + code.replace("\n", "\n          "))
    try:
        # -X utf8: Windows stdout defaults to cp1252 (and -I ignores PYTHONIOENCODING)
        p = subprocess.run([sys.executable, "-I", "-X", "utf8", "-c", code], cwd=LOGS, capture_output=True,
                           text=True, encoding="utf-8", errors="replace", timeout=30)
        out = p.stdout + (f"\nSTDERR:\n{p.stderr[-1500:]}" if p.returncode else "")
    except subprocess.TimeoutExpired:
        out = "ERROR: timeout after 30s"
    if len(out) > 2000:
        out = out[:2000] + f"\n...[truncated {len(out) - 2000} chars - print only the final aggregated result]"
    SENT["codemode"] += len(out)
    return out


def fn(name, desc, props=None):
    props = props or {}
    return {"type": "function", "function": {"name": name, "description": desc, "parameters": {
        "type": "object", "properties": {k: {"type": "string"} for k in props}, "required": list(props)}}}


MODES = {
    "native": dict(
        system=f"You are a log analysis agent. Logs are in a folder of {N_FILES} files. Line format:\n{FORMAT}\n"
               "Use list_files and read_file (you may call read_file for several files at once). "
               "Answer in Vietnamese with exact counts.",
        tools=[fn("list_files", "List log files"), fn("read_file", "Read a whole log file", {"name": 1})],
        impls={"list_files": list_files, "read_file": read_file}),
    "codemode": dict(
        system=f"You are a log analysis agent working in CODE MODE. Logs: {N_FILES} files *.log in the current "
               f"directory. Line format (space separated):\n{FORMAT}\n"
               "You have ONE tool, run_code: it runs a Python 3 script whose cwd is the logs folder and returns its stdout. "
               "Write a script that reads and aggregates the files itself and prints ONLY the final compact result - "
               "never print raw log lines. Answer in Vietnamese with exact counts.",
        tools=[fn("run_code", "Run a Python 3 script (cwd = logs folder); returns stdout only", {"code": 1})],
        impls={"run_code": run_code}),
}


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "both"
    make_logs()
    truth = ground_truth()
    raw = sum(os.path.getsize(os.path.join(LOGS, n)) for n in os.listdir(LOGS))
    print(f"Logs: {N_FILES} files x {N_LINES} lines = {raw:,} bytes on disk\nQ: {QUESTION}\nGround truth: {truth}")
    results = {}
    for mode, cfg in MODES.items():
        if which not in ("both", mode, "code" if mode == "codemode" else mode):
            continue
        print(f"\n{'=' * 90}\nMODE: {mode}")
        start = len(USAGE_LOG)
        answer = run_agent([{"role": "system", "content": cfg["system"]}, {"role": "user", "content": QUESTION}],
                           cfg["tools"], cfg["impls"], max_steps=6, label=mode)
        print(f"--- AGENT:\n{answer}")
        recs = USAGE_LOG[start:]
        usage_table(recs)
        results[mode] = (len(recs), sum(r["prompt"] for r in recs), max((r["prompt"] for r in recs), default=0),
                         SENT[mode], score(answer, truth))

    print(f"\n{'=' * 90}\nCOMPARISON  (raw logs on disk: {raw:,} bytes)")
    print(f"   {'mode':<10} {'requests':>8} {'total input tok':>16} {'peak input tok':>15} {'tool->LLM chars':>16} {'top-5 correct':>14}")
    for mode, (n, total, peak, sent, ok) in results.items():
        print(f"   {mode:<10} {n:>8} {total:>16,} {peak:>15,} {sent:>16,} {ok:>12}/5")


if __name__ == "__main__":
    main()
