"""Offline checks for the demo logic (no API calls). Run: python test_offline.py"""
import os
import tempfile

import b1_compact as b1
import b2_codemode as b2

# keep the real run's b1_workspace/ and b1_archive/ (checkpoints) intact
TMP = tempfile.mkdtemp()
b1.WS, b1.ARCHIVE = os.path.join(TMP, "ws"), os.path.join(TMP, "archive")

# B1: fake test suite reacts to the right fix only
b1.setup()
out = b1.run_tests()
assert out.endswith("Tests: 3 failed, 480 passed, 483 total"), out[-80:]
b1.edit_file("session.ts", "TOKEN_TTL = 900", "TOKEN_TTL = 3600")
assert "3 failed" in b1.run_tests().splitlines()[-1]                      # TTL is not the fix
b1.setup()
b1.edit_file("session.ts", "WHERE token = $1\"", "WHERE token = $1 AND revoked = false RETURNING token\"")
assert b1.run_tests().splitlines()[-1].startswith("Tests: 0 failed")       # atomic conditional revoke is a fix
b1.setup()
b1.edit_file("session.ts", "  const row", "  await db.none('SELECT pg_advisory_xact_lock(1)');\n  const row")
assert b1.run_tests().splitlines()[-1].startswith("Tests: 0 failed")       # locking is
b1.edit_file("session.ts", "oldToken: string)", "token: string)")
assert "1 failed" in b1.run_tests().splitlines()[-1]                      # API break is caught
assert b1.ttl("export const TOKEN_TTL = 3600;") == 3600 and b1.ttl("no ttl") is None

# B1: prune keeps every FAIL line and archives the raw log
b1.setup()
msgs = [{"role": "tool", "name": "run_tests", "content": b1.run_tests()},
        {"role": "user", "content": "turn 2"},
        {"role": "tool", "name": "read_file", "content": b1.SESSION_TS},
        {"role": "tool", "name": "run_tests", "content": b1.run_tests()}]
raw_len = len(msgs[0]["content"])
b1.prune(msgs, current_turn=1)
assert len(msgs[0]["content"]) < raw_len // 20 and msgs[0]["content"].count("FAIL") == 3, msgs[0]["content"]
assert msgs[2]["content"] == b1.SESSION_TS            # file read in the current turn is kept
assert msgs[3]["content"].count("FAIL") == 3 and len(msgs[3]["content"]) < 2000   # current-turn log is cut

# B2: ground truth, scoring, and run_code returning only stdout
b2.make_logs()
truth = b2.ground_truth()
assert len(truth) == 5 and truth[0][1] > truth[4][1]
assert b2.score("\n".join(f"| {e} | {n} |" for e, n in truth), truth) == 5
assert b2.score(f"| {truth[0][0]} | {truth[0][1] + 1} |", truth) == 0
code = ("import glob,collections\nc=collections.Counter(l.split()[3] for f in glob.glob('*.log') "
        "for l in open(f) if l.split()[4]=='500')\nprint(c.most_common(5))")
assert b2.run_code(code).strip() == str(truth), b2.run_code(code)
print("offline checks OK, prune ratio:", raw_len, "->", len(msgs[0]["content"]), "chars")

# B1: over threshold mid-turn -> prune only; checkpoint + drop waits for the next turn start
b1.setup()
b1.chat = lambda *a, **k: {"content": '{"goal": "fix race", "next_action": "db.tx + FOR UPDATE"}'}
msgs = [{"role": "system", "content": b1.SYSTEM}, {"role": "user", "content": "turn 1"},
        {"role": "tool", "name": "read_file", "content": b1.SESSION_TS}, {"role": "user", "content": "turn 2"},
        {"role": "tool", "name": "run_tests", "content": b1.run_tests() * 3}]
b1.maybe_compact(msgs)
assert not b1.COMPACTIONS and b1.PENDING and len(msgs) == 5     # pruned, history kept
msgs.append({"role": "user", "content": "turn 3"})
b1.maybe_compact(msgs)
assert len(b1.COMPACTIONS) == 1 and not b1.PENDING and len(msgs) == 2 and "fix race" in msgs[0]["content"]
print("deferred compaction OK")
