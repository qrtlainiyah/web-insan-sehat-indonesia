import { prisma } from "@/lib/prisma";

/**
 * Updates product stock based on ledger entry
 * Deducts sold products from available stock
 */
export async function updateStockFromLedger(ledgerData: {
    moringa60: number;
    moringa30: number;
    annora: number;
    alami: number;
    uramaxLaku: number;
    vitamin: number;
    bonusUramax: number;
    bonusMoringa: number;
    bonusAnnora: number;
    bonusAlami: number;
}) {
    // Get product IDs by name
    const products = await prisma.product.findMany({
        where: {
            name: {
                in: [
                    'Kelor (Moringa)',
                    'Uramax',
                    'Annora',
                    'Alami',
                    'Vitamin'
                ]
            }
        },
        select: { id: true, name: true, stockAvailable: true }
    });

    const productMap = products.reduce((acc, product) => {
        acc[product.name] = product;
        return acc;
    }, {} as Record<string, typeof products[0]>);

    // Calculate total quantities per product
    const stockUpdates: Array<{ productId: number; quantity: number; name: string }> = [];

    // Kelor/Moringa (60 + 30 + bonus)
    const kelorProduct = productMap['Kelor (Moringa)'];
    if (kelorProduct) {
        const totalKelor = ledgerData.moringa60 + ledgerData.moringa30 + ledgerData.bonusMoringa;
        if (totalKelor > 0) {
            stockUpdates.push({
                productId: kelorProduct.id,
                quantity: totalKelor,
                name: kelorProduct.name
            });
        }
    }

    // Uramax (laku + bonus)
    const uramaxProduct = productMap['Uramax'];
    if (uramaxProduct) {
        const totalUramax = ledgerData.uramaxLaku + ledgerData.bonusUramax;
        if (totalUramax > 0) {
            stockUpdates.push({
                productId: uramaxProduct.id,
                quantity: totalUramax,
                name: uramaxProduct.name
            });
        }
    }

    // Annora (laku + bonus)
    const annoraProduct = productMap['Annora'];
    if (annoraProduct) {
        const totalAnnora = ledgerData.annora + ledgerData.bonusAnnora;
        if (totalAnnora > 0) {
            stockUpdates.push({
                productId: annoraProduct.id,
                quantity: totalAnnora,
                name: annoraProduct.name
            });
        }
    }

    // Alami (laku + bonus)
    const alamiProduct = productMap['Alami'];
    if (alamiProduct) {
        const totalAlami = ledgerData.alami + ledgerData.bonusAlami;
        if (totalAlami > 0) {
            stockUpdates.push({
                productId: alamiProduct.id,
                quantity: totalAlami,
                name: alamiProduct.name
            });
        }
    }

    // Vitamin
    const vitaminProduct = productMap['Vitamin'];
    if (vitaminProduct) {
        const totalVitamin = ledgerData.vitamin;
        if (totalVitamin > 0) {
            stockUpdates.push({
                productId: vitaminProduct.id,
                quantity: totalVitamin,
                name: vitaminProduct.name
            });
        }
    }

    // Validate stock availability
    for (const update of stockUpdates) {
        const product = products.find(p => p.id === update.productId);
        if (product && product.stockAvailable < update.quantity) {
            throw new Error(
                `Stok ${update.name} tidak mencukupi. ` +
                `Dibutuhkan: ${update.quantity}, Tersedia: ${product.stockAvailable}`
            );
        }
    }

    // Update stock for all products
    const updatePromises = stockUpdates.map(update =>
        prisma.product.update({
            where: { id: update.productId },
            data: {
                stockAvailable: {
                    decrement: update.quantity
                }
            }
        })
    );

    await Promise.all(updatePromises);
}

/**
 * Reverts stock changes from a ledger entry
 * Adds back products that were sold
 */
export async function revertStockFromLedger(ledgerData: {
    moringa60: number;
    moringa30: number;
    annora: number;
    alami: number;
    uramaxLaku: number;
    vitamin: number;
    bonusUramax: number;
    bonusMoringa: number;
    bonusAnnora: number;
    bonusAlami: number;
}) {
    // Get product IDs by name
    const products = await prisma.product.findMany({
        where: {
            name: {
                in: [
                    'Kelor (Moringa)',
                    'Uramax',
                    'Annora',
                    'Alami',
                    'Vitamin'
                ]
            }
        },
        select: { id: true, name: true }
    });

    const productMap = products.reduce((acc, product) => {
        acc[product.name] = product;
        return acc;
    }, {} as Record<string, typeof products[0]>);

    // Calculate total quantities per product
    const stockUpdates: Array<{ productId: number; quantity: number }> = [];

    // Kelor/Moringa (60 + 30 + bonus)
    const kelorProduct = productMap['Kelor (Moringa)'];
    if (kelorProduct) {
        const totalKelor = ledgerData.moringa60 + ledgerData.moringa30 + ledgerData.bonusMoringa;
        if (totalKelor > 0) {
            stockUpdates.push({ productId: kelorProduct.id, quantity: totalKelor });
        }
    }

    // Uramax (laku + bonus)
    const uramaxProduct = productMap['Uramax'];
    if (uramaxProduct) {
        const totalUramax = ledgerData.uramaxLaku + ledgerData.bonusUramax;
        if (totalUramax > 0) {
            stockUpdates.push({ productId: uramaxProduct.id, quantity: totalUramax });
        }
    }

    // Annora (laku + bonus)
    const annoraProduct = productMap['Annora'];
    if (annoraProduct) {
        const totalAnnora = ledgerData.annora + ledgerData.bonusAnnora;
        if (totalAnnora > 0) {
            stockUpdates.push({ productId: annoraProduct.id, quantity: totalAnnora });
        }
    }

    // Alami (laku + bonus)
    const alamiProduct = productMap['Alami'];
    if (alamiProduct) {
        const totalAlami = ledgerData.alami + ledgerData.bonusAlami;
        if (totalAlami > 0) {
            stockUpdates.push({ productId: alamiProduct.id, quantity: totalAlami });
        }
    }

    // Vitamin
    const vitaminProduct = productMap['Vitamin'];
    if (vitaminProduct) {
        const totalVitamin = ledgerData.vitamin;
        if (totalVitamin > 0) {
            stockUpdates.push({ productId: vitaminProduct.id, quantity: totalVitamin });
        }
    }

    // Add back stock for all products
    const updatePromises = stockUpdates.map(update =>
        prisma.product.update({
            where: { id: update.productId },
            data: {
                stockAvailable: {
                    increment: update.quantity
                }
            }
        })
    );

    await Promise.all(updatePromises);
}
