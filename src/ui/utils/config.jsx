

export function getDocumentType(DO_Piece) {
    const prefixMap = {
        "DE": { type: "Devis", code: 0 },
        "BPL": { type: "Bon de préparation logistique", code: 2 },
        "PL": { type: "Péparation de livraison", code: 2 },
        "BC": { type: "Bon de commande client", code: 3 },
        "BL": { type: "Bon de livraison", code: 3 },
        "BLX": { type: "Bon de livraison externe", code: 13 },
        "FA": { type: "Facture", code: 6 },
        "BFA": { type: "Facture d’Avoir", code: 6 },
        "BDE": { type: "Bon de demande d’achat", code: 0 }
    };

    const piece = DO_Piece.slice(2);

    for (const key of ["BFA", "BPL", "BLX", "BDE", "DE", "PL", "BC", "BL", "FA"]) {
        if (piece.startsWith(key)) {
            return prefixMap[key].type;
        }
    }

    return "Type inconnu";
}