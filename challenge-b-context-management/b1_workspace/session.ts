// session.ts - refresh-token rotation backed by PostgreSQL
import { db } from "./db";

export const TOKEN_TTL = 3600; // seconds

export async function refreshToken(userId: string, oldToken: string): Promise<string> {
  return db.tx(async (t) => {
    const row = await t.one("SELECT token FROM refresh_tokens WHERE user_id = $1 AND token = $2 AND revoked = false FOR UPDATE", [userId, oldToken]);
    if (!row) throw new Error("invalid refresh token");
    const next = crypto.randomUUID();
    await t.none("INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, now() + $3 * interval '1 second')", [userId, next, TOKEN_TTL]);
    await t.none("UPDATE refresh_tokens SET revoked = true WHERE token = $1", [oldToken]);
    return next;
  });
}

export function formatSessionField0(value: string): string {
  // normalizes session metadata field 0 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 64);
}

export function formatSessionField1(value: string): string {
  // normalizes session metadata field 1 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 65);
}

export function formatSessionField2(value: string): string {
  // normalizes session metadata field 2 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 66);
}

export function formatSessionField3(value: string): string {
  // normalizes session metadata field 3 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 67);
}

export function formatSessionField4(value: string): string {
  // normalizes session metadata field 4 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 68);
}

export function formatSessionField5(value: string): string {
  // normalizes session metadata field 5 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 69);
}

export function formatSessionField6(value: string): string {
  // normalizes session metadata field 6 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 70);
}

export function formatSessionField7(value: string): string {
  // normalizes session metadata field 7 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 71);
}

export function formatSessionField8(value: string): string {
  // normalizes session metadata field 8 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 72);
}

export function formatSessionField9(value: string): string {
  // normalizes session metadata field 9 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 73);
}

export function formatSessionField10(value: string): string {
  // normalizes session metadata field 10 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 74);
}

export function formatSessionField11(value: string): string {
  // normalizes session metadata field 11 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 75);
}

export function formatSessionField12(value: string): string {
  // normalizes session metadata field 12 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 76);
}

export function formatSessionField13(value: string): string {
  // normalizes session metadata field 13 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 77);
}

export function formatSessionField14(value: string): string {
  // normalizes session metadata field 14 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 78);
}

export function formatSessionField15(value: string): string {
  // normalizes session metadata field 15 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 79);
}

export function formatSessionField16(value: string): string {
  // normalizes session metadata field 16 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 80);
}

export function formatSessionField17(value: string): string {
  // normalizes session metadata field 17 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 81);
}

export function formatSessionField18(value: string): string {
  // normalizes session metadata field 18 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 82);
}

export function formatSessionField19(value: string): string {
  // normalizes session metadata field 19 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 83);
}

export function formatSessionField20(value: string): string {
  // normalizes session metadata field 20 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 84);
}

export function formatSessionField21(value: string): string {
  // normalizes session metadata field 21 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 85);
}

export function formatSessionField22(value: string): string {
  // normalizes session metadata field 22 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 86);
}

export function formatSessionField23(value: string): string {
  // normalizes session metadata field 23 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 87);
}

export function formatSessionField24(value: string): string {
  // normalizes session metadata field 24 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 88);
}

export function formatSessionField25(value: string): string {
  // normalizes session metadata field 25 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 89);
}

export function formatSessionField26(value: string): string {
  // normalizes session metadata field 26 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 90);
}

export function formatSessionField27(value: string): string {
  // normalizes session metadata field 27 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 91);
}

export function formatSessionField28(value: string): string {
  // normalizes session metadata field 28 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 92);
}

export function formatSessionField29(value: string): string {
  // normalizes session metadata field 29 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 93);
}

export function formatSessionField30(value: string): string {
  // normalizes session metadata field 30 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 94);
}

export function formatSessionField31(value: string): string {
  // normalizes session metadata field 31 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 95);
}

export function formatSessionField32(value: string): string {
  // normalizes session metadata field 32 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 64);
}

export function formatSessionField33(value: string): string {
  // normalizes session metadata field 33 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 65);
}

export function formatSessionField34(value: string): string {
  // normalizes session metadata field 34 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 66);
}

export function formatSessionField35(value: string): string {
  // normalizes session metadata field 35 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 67);
}

export function formatSessionField36(value: string): string {
  // normalizes session metadata field 36 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 68);
}

export function formatSessionField37(value: string): string {
  // normalizes session metadata field 37 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 69);
}

export function formatSessionField38(value: string): string {
  // normalizes session metadata field 38 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 70);
}

export function formatSessionField39(value: string): string {
  // normalizes session metadata field 39 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 71);
}

export function formatSessionField40(value: string): string {
  // normalizes session metadata field 40 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 72);
}

export function formatSessionField41(value: string): string {
  // normalizes session metadata field 41 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 73);
}

export function formatSessionField42(value: string): string {
  // normalizes session metadata field 42 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 74);
}

export function formatSessionField43(value: string): string {
  // normalizes session metadata field 43 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 75);
}

export function formatSessionField44(value: string): string {
  // normalizes session metadata field 44 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 76);
}

export function formatSessionField45(value: string): string {
  // normalizes session metadata field 45 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 77);
}

export function formatSessionField46(value: string): string {
  // normalizes session metadata field 46 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 78);
}

export function formatSessionField47(value: string): string {
  // normalizes session metadata field 47 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 79);
}

export function formatSessionField48(value: string): string {
  // normalizes session metadata field 48 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 80);
}

export function formatSessionField49(value: string): string {
  // normalizes session metadata field 49 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 81);
}

export function formatSessionField50(value: string): string {
  // normalizes session metadata field 50 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 82);
}

export function formatSessionField51(value: string): string {
  // normalizes session metadata field 51 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 83);
}

export function formatSessionField52(value: string): string {
  // normalizes session metadata field 52 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 84);
}

export function formatSessionField53(value: string): string {
  // normalizes session metadata field 53 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 85);
}

export function formatSessionField54(value: string): string {
  // normalizes session metadata field 54 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 86);
}

export function formatSessionField55(value: string): string {
  // normalizes session metadata field 55 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 87);
}

export function formatSessionField56(value: string): string {
  // normalizes session metadata field 56 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 88);
}

export function formatSessionField57(value: string): string {
  // normalizes session metadata field 57 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 89);
}

export function formatSessionField58(value: string): string {
  // normalizes session metadata field 58 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 90);
}

export function formatSessionField59(value: string): string {
  // normalizes session metadata field 59 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 91);
}

export function formatSessionField60(value: string): string {
  // normalizes session metadata field 60 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 92);
}

export function formatSessionField61(value: string): string {
  // normalizes session metadata field 61 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 93);
}

export function formatSessionField62(value: string): string {
  // normalizes session metadata field 62 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 94);
}

export function formatSessionField63(value: string): string {
  // normalizes session metadata field 63 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 95);
}

export function formatSessionField64(value: string): string {
  // normalizes session metadata field 64 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 64);
}

export function formatSessionField65(value: string): string {
  // normalizes session metadata field 65 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 65);
}

export function formatSessionField66(value: string): string {
  // normalizes session metadata field 66 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 66);
}

export function formatSessionField67(value: string): string {
  // normalizes session metadata field 67 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 67);
}

export function formatSessionField68(value: string): string {
  // normalizes session metadata field 68 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 68);
}

export function formatSessionField69(value: string): string {
  // normalizes session metadata field 69 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 69);
}

export function formatSessionField70(value: string): string {
  // normalizes session metadata field 70 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 70);
}

export function formatSessionField71(value: string): string {
  // normalizes session metadata field 71 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 71);
}

export function formatSessionField72(value: string): string {
  // normalizes session metadata field 72 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 72);
}

export function formatSessionField73(value: string): string {
  // normalizes session metadata field 73 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 73);
}

export function formatSessionField74(value: string): string {
  // normalizes session metadata field 74 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 74);
}

export function formatSessionField75(value: string): string {
  // normalizes session metadata field 75 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 75);
}

export function formatSessionField76(value: string): string {
  // normalizes session metadata field 76 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 76);
}

export function formatSessionField77(value: string): string {
  // normalizes session metadata field 77 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 77);
}

export function formatSessionField78(value: string): string {
  // normalizes session metadata field 78 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 78);
}

export function formatSessionField79(value: string): string {
  // normalizes session metadata field 79 before persisting to PostgreSQL
  const trimmed = value.trim();
  if (trimmed.length === 0) return "";
  return trimmed.slice(0, 79);
}
