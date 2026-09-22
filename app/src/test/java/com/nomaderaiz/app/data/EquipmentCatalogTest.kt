package com.nomaderaiz.app.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class EquipmentCatalogTest {
    @Test fun catalogAddsMissingBikeTechAndKeepsExistingPrice() {
        val stored = listOf(
            EquipmentItem(
                id = "powerbank",
                name = "Meu power bank",
                categoryId = "energia",
                status = ItemStatus.COMPRADO,
                price = 88.0
            )
        )
        val merged = mergeEquipmentCatalog(stored)
        assertEquals(88.0, merged.first { it.id == "powerbank" }.price, 0.0)
        assertEquals(ItemStatus.COMPRADO, merged.first { it.id == "powerbank" }.status)
        assertTrue(merged.any { it.id == "camera-esp32" })
        assertTrue(merged.any { it.id == "sensor-hall" })
    }

    @Test fun catalogFillsZeroReferencePriceWithoutChangingQuantityOrStatus() {
        val stored = listOf(
            EquipmentItem(
                id = "bomba",
                name = "Bomba de ar portátil",
                categoryId = "ferramentas",
                status = ItemStatus.PENDENTE,
                quantity = 2,
                price = 0.0
            )
        )
        val merged = mergeEquipmentCatalog(stored)
        val pump = merged.first { it.id == "bomba" }
        assertEquals(25.64, pump.price, 0.001)
        assertEquals(2, pump.quantity)
        assertEquals(ItemStatus.PENDENTE, pump.status)
    }
}
