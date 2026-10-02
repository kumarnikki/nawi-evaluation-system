/**
 * NAWI Rules Engine — applicability.ts
 * Determines which test modules are mandatory, optional, or not applicable
 * for a given instrument configuration.
 * R 76-1:2006 / R 76-2:1993
 */
import type { InstrumentParams } from './types'

export type Applicability = 'mandatory' | 'optional' | 'not_applicable'

export interface ApplicabilityResult {
  testId: string
  applicability: Applicability
  reason: string
}

export function getTestApplicability(
  testId: string,
  params: InstrumentParams
): ApplicabilityResult {
  const { accuracyClass: cls, powerSupplyType, indicationType, hasTare, isRetail, e_g, max_g } = params

  switch (testId) {
    case 'test-1-weighing': {
      return { testId, applicability: 'mandatory', reason: 'Weighing performance is required for all classes (R 76-1 A.4.4).' }
    }

    case 'test-2-temp-effect': {
      return { testId, applicability: 'mandatory', reason: 'Temperature effect test required for all classes (R 76-1 A.5.3.2).' }
    }

    case 'test-3-1-eccentricity-weight': {
      return { testId, applicability: 'mandatory', reason: 'Eccentricity with weights required for all classes (R 76-1 A.4.7.1-3).' }
    }

    case 'test-3-2-eccentricity-rolling': {
      // Typically for platform/vehicle scales
      return { testId, applicability: 'optional', reason: 'Eccentricity with rolling load applies when receptor is suitable (R 76-1 A.4.7.4).' }
    }

    case 'test-4-1-discrimination': {
      return { testId, applicability: 'mandatory', reason: 'Discrimination test required for all instruments (R 76-1 A.4.8 / 3.8).' }
    }

    case 'test-4-2-sensitivity': {
      if (indicationType === 'non-self') {
        return { testId, applicability: 'mandatory', reason: 'Sensitivity test required for non-self-indicating instruments (R 76-1 A.4.9).' }
      }
      return { testId, applicability: 'not_applicable', reason: 'Sensitivity test only for non-self-indicating instruments (R 76-1 A.4.9).' }
    }

    case 'test-5-repeatability': {
      return { testId, applicability: 'mandatory', reason: 'Repeatability required for all classes (R 76-1 A.4.10).' }
    }

    case 'test-6-1-zero-return': {
      if (cls === 'I') {
        return { testId, applicability: 'not_applicable', reason: 'Zero return test not required for class I (R 76-1 A.4.11.2).' }
      }
      return { testId, applicability: 'mandatory', reason: 'Zero return required for class II, III, IIII (R 76-1 A.4.11.2).' }
    }

    case 'test-6-2-creep': {
      if (cls === 'I') {
        return { testId, applicability: 'not_applicable', reason: 'Creep test not required for class I (R 76-1 A.4.11.1).' }
      }
      return { testId, applicability: 'mandatory', reason: 'Creep test required for class II, III, IIII (R 76-1 A.4.11.1).' }
    }

    case 'test-7-stability': {
      return { testId, applicability: 'mandatory', reason: 'Stability of equilibrium required for all classes (R 76-1 A.4.12).' }
    }

    case 'test-8-tilting': {
      if (cls === 'I') {
        return { testId, applicability: 'not_applicable', reason: 'Tilting test not required for class I (class I needs level indicator instead — R 76-1 A.5.1).' }
      }
      return { testId, applicability: 'mandatory', reason: 'Tilting test required for class II, III, IIII (R 76-1 A.5.1).' }
    }

    case 'test-9-tare': {
      if (!hasTare) {
        return { testId, applicability: 'not_applicable', reason: 'No tare device declared on this instrument.' }
      }
      return { testId, applicability: 'mandatory', reason: 'Tare weighing test required when tare device is present (R 76-1 A.4.6.1).' }
    }

    case 'test-10-warmup': {
      if (powerSupplyType === 'none') {
        return { testId, applicability: 'not_applicable', reason: 'Warm-up test not applicable (no electronic components).' }
      }
      return { testId, applicability: 'mandatory', reason: 'Warm-up time test required for electronic instruments (R 76-1 A.5.2).' }
    }

    case 'test-11-voltage': {
      if (powerSupplyType === 'none') {
        return { testId, applicability: 'not_applicable', reason: 'Voltage variation test not applicable (no mains/electrical supply).' }
      }
      return { testId, applicability: 'mandatory', reason: 'Voltage variation test required for electrically-powered instruments (R 76-1 A.5.4).' }
    }

    case 'test-12-1-power-reduction':
    case 'test-12-2-bursts':
    case 'test-12-3-esd':
    case 'test-12-4-radiated-emf':
    case 'test-12-5-surge':
    case 'test-12-6-conducted-rf': {
      if (powerSupplyType === 'none') {
        return { testId, applicability: 'not_applicable', reason: 'EMC tests not applicable (no electrical supply).' }
      }
      return { testId, applicability: 'mandatory', reason: 'Electrical disturbance tests required for electronic instruments (R 76-1 B.3 / T.5).' }
    }

    case 'test-13-damp-heat': {
      if (cls === 'I') {
        return { testId, applicability: 'not_applicable', reason: 'Damp heat test not applicable to class I (R 76-1 B.2.2).' }
      }
      if (cls === 'II' && e_g < 1) {
        return { testId, applicability: 'not_applicable', reason: 'Damp heat test not applicable to class II with e < 1 g (R 76-1 B.2.2).' }
      }
      if (powerSupplyType === 'none') {
        return { testId, applicability: 'not_applicable', reason: 'Damp heat test only for electronic instruments.' }
      }
      return { testId, applicability: 'mandatory', reason: 'Damp heat test required (R 76-1 B.2.2).' }
    }

    case 'test-14-span-stability': {
      if (cls === 'I') {
        return { testId, applicability: 'not_applicable', reason: 'Span stability test not applicable to class I (R 76-1 B.4).' }
      }
      if (powerSupplyType === 'none') {
        return { testId, applicability: 'not_applicable', reason: 'Span stability test only for electronic instruments.' }
      }
      return { testId, applicability: 'mandatory', reason: 'Span stability test required (R 76-1 B.4).' }
    }

    case 'test-15-endurance': {
      if (cls === 'I') {
        return { testId, applicability: 'not_applicable', reason: 'Endurance test not applicable to class I (R 76-1 A.6).' }
      }
      const maxKg = max_g / 1000
      if (maxKg > 100) {
        return { testId, applicability: 'not_applicable', reason: `Endurance test not applicable (Max = ${maxKg} kg > 100 kg; R 76-1 A.6).` }
      }
      return { testId, applicability: 'mandatory', reason: 'Endurance test required for class II, III, IIII with Max ≤ 100 kg (R 76-1 A.6).' }
    }

    case 'test-16-construction': {
      return { testId, applicability: 'mandatory', reason: 'Construction examination required for all instruments (R 76-2 Section 16).' }
    }

    case 'test-17-checklist': {
      return { testId, applicability: 'mandatory', reason: 'Checklist verification required for all instruments (R 76-2 Section 17).' }
    }

    default:
      return { testId, applicability: 'not_applicable', reason: 'Unknown test module.' }
  }
}

/** Get applicability for all standard tests */
export function getAllTestApplicabilities(params: InstrumentParams): ApplicabilityResult[] {
  const testIds = [
    'test-1-weighing',
    'test-2-temp-effect',
    'test-3-1-eccentricity-weight',
    'test-3-2-eccentricity-rolling',
    'test-4-1-discrimination',
    'test-4-2-sensitivity',
    'test-5-repeatability',
    'test-6-1-zero-return',
    'test-6-2-creep',
    'test-7-stability',
    'test-8-tilting',
    'test-9-tare',
    'test-10-warmup',
    'test-11-voltage',
    'test-12-1-power-reduction',
    'test-12-2-bursts',
    'test-12-3-esd',
    'test-12-4-radiated-emf',
    'test-12-5-surge',
    'test-12-6-conducted-rf',
    'test-13-damp-heat',
    'test-14-span-stability',
    'test-15-endurance',
    'test-16-construction',
    'test-17-checklist',
  ]
  return testIds.map((id) => getTestApplicability(id, params))
}
