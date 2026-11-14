// ⭐ Planes de OPLORA (nov 2026). Precios con IVA incluido, en céntimos.
//  · Pago único por periodo (tarjeta o Bizum): no se renueva solo.
//  · Mensual con renovación automática (solo tarjeta): se cancela desde el portal de Stripe.
export type IdPlan = 'mes' | 'semestre' | 'anual' | 'mensual_auto';

export interface Plan {
  id: IdPlan;
  nombre: string;
  meses: number;
  importeCentimos: number;
  renovacion: boolean;
}

export const PLANES: Record<IdPlan, Plan> = {
  mes: { id: 'mes', nombre: 'OPLORA · 1 mes', meses: 1, importeCentimos: 995, renovacion: false },
  semestre: { id: 'semestre', nombre: 'OPLORA · 6 meses', meses: 6, importeCentimos: 4995, renovacion: false },
  anual: { id: 'anual', nombre: 'OPLORA · 12 meses', meses: 12, importeCentimos: 7995, renovacion: false },
  mensual_auto: { id: 'mensual_auto', nombre: 'OPLORA · Mensual', meses: 1, importeCentimos: 995, renovacion: true },
};
