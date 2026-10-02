# NAWI Metrological Calculation Methodology & Worked Examples

> **Statutory Reference:** OIML R 76-1:2006 (Clauses 3.5, 3.6, 3.8, 3.9; Annex A & Annex B)  
> **Standard:** Non-Automatic Weighing Instruments (NAWI)  

---

## 1. Indication & Error at Changeover Point ($P, E, E_c$)

### Formula
Because digital scale indications step discontinuously in scale divisions $d$, the standard uses the supplementary load ($\Delta L$) changeover method to determine the intrinsic error with higher resolution than $d$ (R 76-1 Clause A.4.4.3).

$$P = I + \frac{1}{2}e - \Delta L$$

Where:
- $I$: Indication on the instrument (in grams)
- $e$: Verification scale interval (in grams)
- $\Delta L$: Additional small load (in tenths of $e$, typically $0.1e$) added until the indication unambiguously steps up to the next division $(I + e)$.

The error $E$ is:
$$E = P - L = I + \frac{1}{2}e - \Delta L - L$$

Where $L$ is the applied test load.

The corrected error $E_c$ eliminates zero-point displacement error $E_0$:
$$E_c = E - E_0$$

Where $E_0$ is the error calculated at zero (or near-zero) load.

### Worked Example 1 (Class III Platform Scale)
- Declared parameters: Class III, $\text{Max} = 60\text{ kg} = 60\,000\text{ g}$, $e = 20\text{ g}$, $d = 20\text{ g}$.
- **Zero load observation:**
  - $L = 0\text{ g}$, $I = 0\text{ g}$.
  - Supplementary weights are added until display flips to $20\text{ g}$: $\Delta L = 8\text{ g}$.
  - $P_0 = 0 + \frac{1}{2}(20) - 8 = 10 - 8 = 2\text{ g}$.
  - $E_0 = P_0 - L = 2 - 0 = +2\text{ g}$.
- **Test load observation ($L = 20\,000\text{ g}$):**
  - Applied load: $L = 20\,000\text{ g}$.
  - Instrument indication: $I = 20\,000\text{ g}$.
  - Small weights added until display flips to $20\,020\text{ g}$: $\Delta L = 4\text{ g}$.
  - True indication: $P = 20\,000 + 10 - 4 = 20\,006\text{ g}$.
  - Uncorrected error: $E = P - L = 20\,006 - 20\,000 = +6\text{ g}$.
  - Corrected error: $E_c = E - E_0 = +6 - (+2) = +4\text{ g}$.
- **MPE check:**
  - At $L = 20\,000\text{ g}$, $m = \frac{L}{e} = \frac{20\,000}{20} = 1000e$.
  - In Class III Table 6, $500e < m \le 2000e \implies \text{mpe} = \pm 1.0e = \pm 20\text{ g}$.
  - Since $|E_c| = |+4\text{ g}| \le 20\text{ g}$, this test load **PASSES**.

---

## 2. Maximum Permissible Error (MPE) Table 6 Lookup

MPE on initial verification depends on the applied load $m$ expressed in units of $e$ ($m = L / e$):

| Accuracy Class | $\pm 0.5e$ Range | $\pm 1.0e$ Range | $\pm 1.5e$ Range |
|---|---|---|---|
| **Class I** | $0 \le m \le 50\,000$ | $50\,000 < m \le 200\,000$ | $m > 200\,000$ |
| **Class II** | $0 \le m \le 5\,000$ | $5\,000 < m \le 20\,000$ | $20\,000 < m \le 100\,000$ |
| **Class III** | $0 \le m \le 500$ | $500 < m \le 2\,000$ | $2\,000 < m \le 10\,000$ |
| **Class IIII** | $0 \le m \le 50$ | $50 < m \le 200$ | $200 < m \le 1\,000$ |

*Note: In-service verification allows $2 \times \text{MPE}$ (selectable in the system).*

---

## 3. Repeatability Test (R 76-1 Clause A.4.10)

### Formula
Two series of weighings are performed (one at approx. $50\% \text{ Max}$ and one near $100\% \text{ Max}$).
At each load, the difference between the maximum and minimum true indications cannot exceed the absolute value of the MPE for that load:

$$(P_{max} - P_{min}) \le |\text{mpe}|$$

### Worked Example 2
- Class III scale, $\text{Max} = 60\text{ kg}$, $e = 20\text{ g}$.
- Test at $L = 30\,000\text{ g}$ ($m = 1500e \implies \text{mpe} = 20\text{ g}$).
- 5 successive loadings record $P$ values:
  - Trial 1: $P_1 = 30\,004\text{ g}$
  - Trial 2: $P_2 = 30\,012\text{ g}$
  - Trial 3: $P_3 = 30\,000\text{ g}$
  - Trial 4: $P_4 = 29\,998\text{ g}$
  - Trial 5: $P_5 = 30\,010\text{ g}$
- $P_{max} = 30\,012\text{ g}$, $P_{min} = 29\,998\text{ g}$.
- Range $= 30\,012 - 29\,998 = 14\text{ g}$.
- Since $14\text{ g} \le \text{mpe} (20\text{ g})$, repeatability at $50\% \text{ Max}$ **PASSES**.

---

## 4. Creep & Zero Return (R 76-1 Clause A.4.11)

### Creep Early Termination Rule
When loaded near Max, readings are logged at $0, 5, 15, 30\text{ minutes}$.
If within 30 minutes:
$$|\Delta P_{30}| \le 0.5e_1 \quad \text{AND} \quad |\Delta P_{30} - \Delta P_{15}| \le 0.2e_1$$
The creep test terminates early at 30 minutes and **PASSES**. Otherwise, testing must continue over 4 hours with $|\Delta P| \le |\text{mpe}|$.

---

## 5. Temperature Effect on No-Load Indication (R 76-1 Clause A.5.3.2)

### Formula
The zero indication must not vary by more than $1e$ per reference temperature interval:
- **Class I:** $\Delta \text{Zero} \le 1e$ per $1^\circ\text{C}$
- **Class II, III, IIII:** $\Delta \text{Zero} \le 1e$ per $5^\circ\text{C}$
