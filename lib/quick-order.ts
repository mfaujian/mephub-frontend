export interface QuickOrderLine {
    sku: string;
    quantity: number;
}

export interface QuickOrderParse {
    lines: QuickOrderLine[];
    invalid: string[];
}

/**
 * Parse pasted text such as:
 *   EZ9F34110, 24
 *   LC1E0910M5   10
 *   6205-2RS<TAB>20
 * One part number per line; the quantity is the last number on the line (default 1).
 * Repeated part numbers are added together.
 */
export function parseQuickOrder(text: string): QuickOrderParse {
    const merged = new Map<string, number>();
    const invalid: string[] = [];
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line) continue;
        const parts = line.split(/[\t,;]+|\s+/).filter(Boolean);
        const sku = parts[0]?.toUpperCase();
        if (!sku || !/^[A-Z0-9][A-Z0-9._\/-]*$/.test(sku)) {
        invalid.push(line);
        continue;
        }
        let quantity = 1;
        if (parts.length > 1) {
        const last = parts[parts.length - 1];
        if (!/^\d+$/.test(last) || Number(last) < 1) {
            invalid.push(line);
            continue;
        }
        quantity = Number(last);
        }
        merged.set(sku, (merged.get(sku) ?? 0) + quantity);
    }
    return { lines: [...merged].map(([sku, quantity]) => ({ sku, quantity })), invalid };
    }