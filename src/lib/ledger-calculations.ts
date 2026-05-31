// Helper functions for ledger calculations

// Product Prices (dalam rupiah penuh)
const MORINGA_PRICE = 130000; // Kelor 130.000
const ANNORA_PRICE = 140000; // Ann/Al 140.000
const ALAMI_PRICE = 140000; // Ann/Al 140.000
const URAMAX_PRICE = 125000; // Uramax 125.000

// RO Prices (sama dengan harga produk laku)
const RO_MORINGA_PRICE = 130000; // Kelor 130.000
const RO_URAMAX_PRICE = 125000; // Uramax 125.000
const RO_ANNORA_PRICE = 140000; // Ann/Al 140.000

// Bonus Prices (harga lebih rendah dari produk laku)
const BONUS_MORINGA_PRICE = 110000;
const BONUS_URAMAX_PRICE = 90000;
const BONUS_ANNORA_PRICE = 100000;
const BONUS_ALAMI_PRICE = 100000;

// Retur Prices
const RETUR_MORINGA_TERPAKAI_PRICE = 130000; // Kelor terpakai 130.000
const RETUR_MORINGA_UTUH_PRICE = 130000; // Kelor tidak terpakai 130.000
const RETUR_URAMAX_TERPAKAI_PRICE = 125000; // Uramax terpakai 125.000
const RETUR_URAMAX_UTUH_PRICE = 125000; // Uramax tidak terpakai 125.000
const RETUR_ANNORA_TERPAKAI_PRICE = 140000; // Ann/Al terpakai 140.000
const RETUR_ANNORA_UTUH_PRICE = 140000; // Ann/Al tidak terpakai 140.000

// Other Prices (dalam rupiah penuh)
const SESI_PRICE = 7000; // Per 1 sesi = 7.000
const VITAMIN_PRICE = 2000; // Per 1 vitamin = 2.000

export interface LedgerCalculationInput {
    // Basic Info
    session: number;
    audiens: number;

    // Expenses (old fields)
    bop?: number;
    skl?: number;

    // Products Sold
    moringa60: number;
    moringa30: number;
    annora: number;
    alami: number;
    uramaxLaku: number;

    // Vitamin
    vitamin: number;

    // Repeat Order (RO)
    roMoringa: number;
    roUramax: number;
    roAnnora: number;

    // Bonus Produk
    bonusUramax: number;
    bonusMoringa: number;
    bonusAnnora: number;
    bonusAlami: number;

    // Retur Produk
    returMoringaTerpakai: number;
    returMoringaUtuh: number;
    returUramaxTerpakai: number;
    returUramaxUtuh: number;
    returAnnoraTerpakai: number;
    returAnnoraUtuh: number;

    // Other Income
    bonus?: number;
    dp: number;
}

export interface LedgerCalculationResult {
    totalBop: number;
    revenue: number;
    penghasilan: number;
    komisiPenjadwal: number;
    komisiPresenter: number;
    performa: number;
}

/**
 * Calculate all derived fields for a ledger entry
 * 
 * New Formulas:
 * - Total BOP = (sesi × 7.000) + (vitamin × 2.000) + 
 *               (Annora × 250) + (Moringa × 250) + (Alami × 250) + (Uramax × 225) +
 *               (bonusUramax × 90) + (bonusMoringa × 110) + (bonusAnnora × 100) + (bonusAlami × 100) +
 *               (returMoringaTerpakai × 110) + (returUramaxTerpakai × 90) + (returAnnoraTerpakai × 100)
 * 
 * - Penghasilan = 
 *   [(moringaLaku + roMoringa) × 250] - [(bonusMoringa × 110) + (returMoringaUtuh × 250) + (returMoringaTerpakai × 110)] +
 *   [(uramaxLaku + roUramax) × 225] - [(bonusUramax × 90) + (returUramaxUtuh × 225) + (returUramaxTerpakai × 90)] +
 *   [(annoraLaku + roAnnora) × 250] - [(bonusAnnora × 100) + (returAnnoraUtuh × 250) + (returAnnoraTerpakai × 100)] -
 *   Total BOP
 */
export function calculateLedgerFields(input: LedgerCalculationInput): LedgerCalculationResult {
    // Total Moringa laku (Moringa60 + Moringa30)
    const totalMoringaLaku = input.moringa60 + input.moringa30;

    // Calculate Total BOP - FORMULA BARU: sesi + vitamin + bonus produk + BOP
    const sesiCost = input.session * SESI_PRICE;
    const vitaminCost = input.vitamin * VITAMIN_PRICE;
    const bopInput = input.bop || 0;

    const bonusCost =
        (input.bonusUramax * BONUS_URAMAX_PRICE) +
        (input.bonusMoringa * BONUS_MORINGA_PRICE) +
        (input.bonusAnnora * BONUS_ANNORA_PRICE) +
        (input.bonusAlami * BONUS_ALAMI_PRICE);

    const totalBop = sesiCost + vitaminCost + bonusCost + bopInput;

    // Calculate Penghasilan menggunakan rumus baru dengan harga yang tepat
    const moringaRevenue = (totalMoringaLaku + input.roMoringa) * RO_MORINGA_PRICE;
    const moringaCost =
        (input.returMoringaUtuh * RETUR_MORINGA_UTUH_PRICE) +
        (input.returMoringaTerpakai * RETUR_MORINGA_TERPAKAI_PRICE);
    const moringaNet = moringaRevenue - moringaCost;

    const uramaxRevenue = (input.uramaxLaku + input.roUramax) * RO_URAMAX_PRICE;
    const uramaxCost =
        (input.returUramaxUtuh * RETUR_URAMAX_UTUH_PRICE) +
        (input.returUramaxTerpakai * RETUR_URAMAX_TERPAKAI_PRICE);
    const uramaxNet = uramaxRevenue - uramaxCost;

    const annoraRevenue = (input.annora + input.roAnnora) * RO_ANNORA_PRICE;
    const ankoraCost =
        (input.returAnnoraUtuh * RETUR_ANNORA_UTUH_PRICE) +
        (input.returAnnoraTerpakai * RETUR_ANNORA_TERPAKAI_PRICE);
    const annoraNet = annoraRevenue - ankoraCost;

    const penghasilan = moringaNet + uramaxNet + annoraNet - totalBop;

    // Calculate Revenue (untuk backward compatibility, mungkin tidak digunakan dengan rumus baru)
    const revenue = penghasilan + totalBop;

    // Calculate Commissions
    const komisiPenjadwal = penghasilan * 0.40; // 40%
    const komisiPresenter = penghasilan * 0.60; // 60%

    // Calculate Performance = (Produk Laku / Audiens) × 100%
    const totalProductsSold = totalMoringaLaku + input.annora + input.alami + input.uramaxLaku;
    const performa = input.audiens > 0
        ? (totalProductsSold / input.audiens) * 100
        : 0;

    return {
        totalBop,
        revenue,
        penghasilan,
        komisiPenjadwal,
        komisiPresenter,
        performa
    };
}

/**
 * Get month and year from a date
 */
export function getMonthYear(date: Date | string): { month: number; year: number } {
    const d = typeof date === 'string' ? new Date(date) : date;
    return {
        month: d.getMonth() + 1, // JavaScript months are 0-indexed
        year: d.getFullYear()
    };
}
