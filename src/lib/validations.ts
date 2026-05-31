import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

export const productSchema = z.object({
    name: z.string().min(1, "Nama produk wajib diisi").max(255),
    description: z.string().min(1, "Deskripsi wajib diisi"),
    price: z.number().min(0, "Harga harus positif"),
    imageUrl: z.string().optional(),
});

export const stockSchema = z.object({
    productId: z.number().int().positive("Product ID harus valid"),
    date: z.string().or(z.date()),
    quantity: z.number().int().min(0, "Jumlah stok tidak boleh negatif"),
});

export const transactionSchema = z.object({
    productId: z.number().int().positive("Product ID harus valid"),
    type: z.enum(["IN", "OUT"]),
    quantity: z.number().int().min(1, "Jumlah harus lebih dari 0"),
    description: z.string().optional(),
    date: z.string().or(z.date()),
});

export const cashFlowSchema = z.object({
    type: z.enum(["IN", "OUT"]),
    amount: z.number().min(0.01, "Jumlah harus lebih dari 0"),
    description: z.string().min(1, "Keterangan wajib diisi"),
    date: z.string().or(z.date()),
});

export const ledgerSchema = z.object({
    // User Relations
    schedulerId: z.number().int().positive().optional(),
    presenterId: z.number().int().positive().optional(),

    // Basic Info
    date: z.string().or(z.date()),
    session: z.number().int().min(1, "Sesi minimal 1"),
    audiens: z.number().int().min(0, "Audiens tidak boleh negatif"),

    // Expenses
    bop: z.number().min(0, "BOP tidak boleh negatif"),
    skl: z.number().min(0, "SKL tidak boleh negatif"),

    // Products Sold
    moringa60: z.number().int().min(0, "Moringa 60 tidak boleh negatif"),
    moringa30: z.number().int().min(0, "Moringa 30 tidak boleh negatif"),
    annora: z.number().int().min(0, "Annora tidak boleh negatif"),
    alami: z.number().int().min(0, "Alami tidak boleh negatif"),
    uramaxLaku: z.number().int().min(0, "Uramax tidak boleh negatif").optional(),

    // Vitamin
    vitamin: z.number().int().min(0, "Vitamin tidak boleh negatif").optional(),

    // Repeat Order (RO)
    roMoringa: z.number().int().min(0, "RO Moringa tidak boleh negatif").optional(),
    roUramax: z.number().int().min(0, "RO Uramax tidak boleh negatif").optional(),
    roAnnora: z.number().int().min(0, "RO Annora tidak boleh negatif").optional(),

    // Bonus Produk
    bonusUramax: z.number().int().min(0, "Bonus Uramax tidak boleh negatif").optional(),
    bonusMoringa: z.number().int().min(0, "Bonus Moringa tidak boleh negatif").optional(),
    bonusAnnora: z.number().int().min(0, "Bonus Annora tidak boleh negatif").optional(),
    bonusAlami: z.number().int().min(0, "Bonus Alami tidak boleh negatif").optional(),

    // Retur Produk
    returMoringaTerpakai: z.number().int().min(0, "Retur Moringa terpakai tidak boleh negatif").optional(),
    returMoringaUtuh: z.number().int().min(0, "Retur Moringa utuh tidak boleh negatif").optional(),
    returUramaxTerpakai: z.number().int().min(0, "Retur Uramax terpakai tidak boleh negatif").optional(),
    returUramaxUtuh: z.number().int().min(0, "Retur Uramax utuh tidak boleh negatif").optional(),
    returAnnoraTerpakai: z.number().int().min(0, "Retur Annora terpakai tidak boleh negatif").optional(),
    returAnnoraUtuh: z.number().int().min(0, "Retur Annora utuh tidak boleh negatif").optional(),

    // Other Income
    bonus: z.number().min(0, "Bonus tidak boleh negatif"),
    dp: z.number().min(0, "DP tidak boleh negatif"),
});

export const commissionSchema = z.object({
    userId: z.number().int().positive("User ID harus valid"),
    amount: z.number().min(0, "Jumlah tidak boleh negatif"), // Will be mapped to 'income' in UI
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(2000),
    description: z.string().optional(),
    role: z.enum(["PRESENTER", "SCHEDULER"]).default("PRESENTER"),

    // Detailed Metrics
    sessions: z.number().int().optional(),
    audience: z.number().int().optional(),
    moringaSold: z.number().int().optional(),
    uramaxSold: z.number().int().optional(),
    annoraSold: z.number().int().optional(),
    roMoringa: z.number().int().optional(),
    roUramax: z.number().int().optional(),
    roAnnora: z.number().int().optional(),
    kasbonMoringa: z.number().int().optional(),
    kasbonUramax: z.number().int().optional(),
    kasbonAnnora: z.number().int().optional(),
    returnMoringa: z.number().int().optional(),
    returnUramax: z.number().int().optional(),
    returnAnnora: z.number().int().optional(),
    bonusMoringa: z.number().optional(),
    bonusUramax: z.number().optional(),
    bonusAnnora: z.number().optional(),
    bonusVitamin: z.number().optional(),
});

export const userSchema = z.object({
    name: z.string().min(1, "Nama tidak boleh kosong"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
});

export type ProductInput = z.infer<typeof productSchema>;
export type StockInput = z.infer<typeof stockSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type CashFlowInput = z.infer<typeof cashFlowSchema>;
export type LedgerInput = z.infer<typeof ledgerSchema>;
export type CommissionInput = z.infer<typeof commissionSchema>;
export type UserInput = z.infer<typeof userSchema>;
