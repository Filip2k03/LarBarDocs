export type PaymentMethod = 'CASH' | 'KBZPAY' | 'WAVEPAY' | 'AYAPAY';

export interface FarePolicy {
  version: string;
  minimumTransportFareMMK: number;
  includedDistanceKm: number;
  distanceStepKm: number;
  distanceStepFareMMK: number;
  serviceFeeMMK: number;
  cashRoundingUnitMMK: number;
  promoCreditValueMMK: number;
}

export interface FareBreakdown {
  transportFareMMK: number;
  extraDistanceSteps: number;
  extraDistanceFareMMK: number;
  serviceFeeMMK: number;
  promoCreditsApplied: number;
  promoDiscountMMK: number;
  subtotalMMK: number;
  cashRoundingMMK: number;
  payableMMK: number;
}

export const farePolicy: FarePolicy = {
  version: 'MM-2026-08-v1',
  minimumTransportFareMMK: 5000,
  includedDistanceKm: 2,
  distanceStepKm: 0.1,
  distanceStepFareMMK: 150,
  serviceFeeMMK: 1500,
  cashRoundingUnitMMK: 500,
  promoCreditValueMMK: 10,
};

export function calculateFare(
  distanceKm: number,
  paymentMethod: PaymentMethod,
  promoCredits = 0,
  policy = farePolicy,
): FareBreakdown {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) throw new Error('distanceKm must be greater than zero');
  if (!Number.isInteger(promoCredits) || promoCredits < 0) throw new Error('promoCredits must be a non-negative integer');

  const extraDistanceKm = Math.max(0, distanceKm - policy.includedDistanceKm);
  const extraDistanceSteps = Math.ceil(extraDistanceKm / policy.distanceStepKm - 1e-9);
  const extraDistanceFareMMK = extraDistanceSteps * policy.distanceStepFareMMK;
  const transportFareMMK = policy.minimumTransportFareMMK + extraDistanceFareMMK;
  const promoDiscountMMK = Math.min(transportFareMMK, promoCredits * policy.promoCreditValueMMK);
  const promoCreditsApplied = promoDiscountMMK / policy.promoCreditValueMMK;
  const subtotalMMK = transportFareMMK - promoDiscountMMK + policy.serviceFeeMMK;
  const payableMMK = paymentMethod === 'CASH'
    ? Math.ceil(subtotalMMK / policy.cashRoundingUnitMMK) * policy.cashRoundingUnitMMK
    : subtotalMMK;

  return {
    transportFareMMK,
    extraDistanceSteps,
    extraDistanceFareMMK,
    serviceFeeMMK: policy.serviceFeeMMK,
    promoCreditsApplied,
    promoDiscountMMK,
    subtotalMMK,
    cashRoundingMMK: payableMMK - subtotalMMK,
    payableMMK,
  };
}
