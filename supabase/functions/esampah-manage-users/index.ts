import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, "Content-Type": "application/json" },
});

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey || !serviceKey) return json({ error: "Konfigurasi server belum lengkap" }, 500);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return json({ error: "Sesi login diperlukan" }, 401);
  const caller = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: { user }, error: authError } = await caller.auth.getUser();
  if (authError || !user) return json({ error: "Sesi tidak valid" }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: actor } = await admin.from("esampah_petugas")
    .select("id,role,aktif").eq("auth_user_id", user.id).maybeSingle();
  if (!actor?.aktif || actor.role !== "admin_kecamatan") {
    return json({ error: "Hanya Admin Kecamatan E-Sampah yang dapat mengelola akun" }, 403);
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "Format permintaan tidak valid" }, 400); }
  if (body.action !== "create") return json({ error: "Aksi belum didukung" }, 400);

  const username = String(body.username ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const staffId = String(body.staff_master_id ?? "");
  const unitId = String(body.unit_id ?? "");
  const role = String(body.role ?? "");
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) return json({ error: "Username 3–32 karakter: huruf kecil, angka, titik, garis bawah, atau minus" }, 400);
  if (password.length < 10) return json({ error: "Password minimal 10 karakter" }, 400);
  if (!["admin_kecamatan","admin_kelurahan","petugas_rw","pimpinan"].includes(role)) return json({ error: "Peran tidak valid" }, 400);

  const [{ data: staff }, { data: unit }] = await Promise.all([
    admin.from("staff_master").select("id,nama,aktif,deleted_at,kelurahan_id").eq("id", staffId).maybeSingle(),
    admin.from("esampah_unit").select("id,nama,tipe,kelurahan_id,aktif").eq("id", unitId).maybeSingle(),
  ]);
  if (!staff?.aktif || staff.deleted_at) return json({ error: "Pegawai tidak aktif/tidak ditemukan di master SDM" }, 400);
  if (!unit?.aktif) return json({ error: "Unit bank sampah tidak aktif/tidak ditemukan" }, 400);
  const expectedType = role === "admin_kelurahan" ? "kelurahan" : role === "petugas_rw" ? "rw" : "kecamatan";
  if (unit.tipe !== expectedType) return json({ error: "Peran tidak sesuai dengan jenis unit yang dipilih" }, 400);
  if ((role === "admin_kelurahan" || role === "petugas_rw") &&
      staff.kelurahan_id && staff.kelurahan_id !== unit.kelurahan_id) {
    return json({ error: "Pegawai dan unit penugasan harus berada pada kelurahan yang sama" }, 400);
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: username + "@login.esampah.sukolilo.online",
    password,
    email_confirm: true,
    app_metadata: { application: "esampah" },
  });
  if (createError || !created.user) return json({ error: createError?.message ?? "Gagal membuat akun autentikasi" }, 400);

  const { data: profile, error: profileError } = await admin.from("esampah_petugas").insert({
    auth_user_id: created.user.id, staff_master_id: staff.id, username, role, unit_id: unit.id, aktif: true,
  }).select("id,username,role,unit_id").single();

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return json({ error: profileError.message }, 400);
  }
  return json({ ok: true, petugas: profile, nama: staff.nama, unit: unit.nama });
});
