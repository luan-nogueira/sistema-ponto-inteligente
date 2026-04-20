import { eq, and, desc, gte, lte, between } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  pontoRegistros,
  justificativas,
  configuracoes,
  unidades,
  resumoDiario,
  resumoMensal,
  PontoRegistro,
  Justificativa,
  Configuracao,
  Unidade,
  ResumoDiario,
  ResumoMensal,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USERS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "cargo", "setor", "numeroMatricula"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (user.ativo !== undefined) {
      values.ativo = user.ativo;
      updateSet.ativo = user.ativo;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users);
}

export async function getColaboradores() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(users)
    .where(and(eq(users.role, "colaborador"), eq(users.ativo, true)));
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(users).set(data).where(eq(users.id, id));
  return getUserById(id);
}

// ==================== PONTO REGISTROS ====================

export async function createPontoRegistro(data: Omit<PontoRegistro, "id" | "criadoEm" | "atualizadoEm">) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(pontoRegistros).values(data);
  const id = result[0].insertId as number;
  
  const registros = await db
    .select()
    .from(pontoRegistros)
    .where(eq(pontoRegistros.id, id));
  
  return registros[0] || null;
}

export async function getPontoRegistrosByUsuario(usuarioId: number, dataInicio?: Date, dataFim?: Date) {
  const db = await getDb();
  if (!db) return [];

  if (dataInicio && dataFim) {
    return await db
      .select()
      .from(pontoRegistros)
      .where(
        and(
          eq(pontoRegistros.usuarioId, usuarioId),
          between(pontoRegistros.dataRegistro, dataInicio, dataFim)
        )
      )
      .orderBy(desc(pontoRegistros.dataRegistro));
  }

  return await db
    .select()
    .from(pontoRegistros)
    .where(eq(pontoRegistros.usuarioId, usuarioId))
    .orderBy(desc(pontoRegistros.dataRegistro));
}

export async function getPontoRegistroById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(pontoRegistros)
    .where(eq(pontoRegistros.id, id))
    .limit(1);

  return result[0] || null;
}

export async function updatePontoRegistro(id: number, data: Partial<PontoRegistro>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(pontoRegistros).set(data).where(eq(pontoRegistros.id, id));
  return getPontoRegistroById(id);
}

export async function getUltimoPontoRegistro(usuarioId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(pontoRegistros)
    .where(eq(pontoRegistros.usuarioId, usuarioId))
    .orderBy(desc(pontoRegistros.dataRegistro))
    .limit(1);

  return result[0] || null;
}

// ==================== JUSTIFICATIVAS ====================

export async function createJustificativa(data: Omit<Justificativa, "id" | "criadoEm" | "atualizadoEm">) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(justificativas).values(data);
  const id = result[0].insertId as number;

  const justificativa = await db
    .select()
    .from(justificativas)
    .where(eq(justificativas.id, id));

  return justificativa[0] || null;
}

export async function getJustificativasByUsuario(usuarioId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(justificativas)
    .where(eq(justificativas.usuarioId, usuarioId))
    .orderBy(desc(justificativas.criadoEm));
}

export async function getJustificativasPendentes() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(justificativas)
    .where(eq(justificativas.status, "pendente"))
    .orderBy(desc(justificativas.criadoEm));
}

export async function updateJustificativa(id: number, data: Partial<Justificativa>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(justificativas).set(data).where(eq(justificativas.id, id));

  const result = await db
    .select()
    .from(justificativas)
    .where(eq(justificativas.id, id));

  return result[0] || null;
}

// ==================== CONFIGURACOES ====================

export async function getConfiguracao() {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(configuracoes).limit(1);
  return result[0] || null;
}

export async function updateConfiguracao(data: Partial<Configuracao>) {
  const db = await getDb();
  if (!db) return null;

  const existing = await getConfiguracao();
  
  if (existing) {
    await db.update(configuracoes).set(data).where(eq(configuracoes.id, existing.id));
  } else {
    await db.insert(configuracoes).values(data);
  }

  return getConfiguracao();
}

// ==================== UNIDADES ====================

export async function createUnidade(data: Omit<Unidade, "id" | "criadoEm" | "atualizadoEm">) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(unidades).values(data);
  const id = result[0].insertId as number;

  const unidade = await db
    .select()
    .from(unidades)
    .where(eq(unidades.id, id));

  return unidade[0] || null;
}

export async function getUnidades() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(unidades).where(eq(unidades.ativa, true));
}

export async function getUnidadeById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(unidades).where(eq(unidades.id, id)).limit(1);
  return result[0] || null;
}

export async function updateUnidade(id: number, data: Partial<Unidade>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(unidades).set(data).where(eq(unidades.id, id));
  return getUnidadeById(id);
}

// ==================== RESUMO DIARIO ====================

export async function createResumoDiario(data: Omit<ResumoDiario, "id" | "criadoEm" | "atualizadoEm">) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(resumoDiario).values(data);
  const id = result[0].insertId as number;

  const resumo = await db
    .select()
    .from(resumoDiario)
    .where(eq(resumoDiario.id, id));

  return resumo[0] || null;
}

export async function getResumoDiario(usuarioId: number, data: Date) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(resumoDiario)
    .where(eq(resumoDiario.usuarioId, usuarioId))
    .orderBy(desc(resumoDiario.data))
    .limit(1);

  return result[0] || null;
}

export async function updateResumoDiario(id: number, data: Partial<ResumoDiario>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(resumoDiario).set(data).where(eq(resumoDiario.id, id));

  const result = await db
    .select()
    .from(resumoDiario)
    .where(eq(resumoDiario.id, id));

  return result[0] || null;
}

// ==================== RESUMO MENSAL ====================

export async function getResumoMensal(usuarioId: number, mes: number, ano: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(resumoMensal)
    .where(
      and(
        eq(resumoMensal.usuarioId, usuarioId),
        eq(resumoMensal.mes, mes),
        eq(resumoMensal.ano, ano)
      )
    )
    .limit(1);

  return result[0] || null;
}

export async function createResumoMensal(data: Omit<ResumoMensal, "id" | "criadoEm" | "atualizadoEm">) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(resumoMensal).values(data);
  const id = result[0].insertId as number;

  const resumo = await db
    .select()
    .from(resumoMensal)
    .where(eq(resumoMensal.id, id));

  return resumo[0] || null;
}

export async function updateResumoMensal(id: number, data: Partial<ResumoMensal>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(resumoMensal).set(data).where(eq(resumoMensal.id, id));

  const result = await db
    .select()
    .from(resumoMensal)
    .where(eq(resumoMensal.id, id));

  return result[0] || null;
}

export async function getResumosMensaisUsuario(usuarioId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(resumoMensal)
    .where(eq(resumoMensal.usuarioId, usuarioId))
    .orderBy(desc(resumoMensal.ano), desc(resumoMensal.mes));
}
