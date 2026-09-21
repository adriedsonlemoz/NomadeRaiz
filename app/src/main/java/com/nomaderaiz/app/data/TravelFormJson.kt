package com.nomaderaiz.app.data

import org.json.JSONArray
import org.json.JSONObject

/** Local draft format. It does not change the existing backup schema or keys. */
object TravelFormJson {
    private fun strings(values: Map<String, String>) = JSONObject().also { o -> values.forEach { (k, v) -> o.put(k, v) } }
    private fun readStrings(o: JSONObject?): Map<String, String> {
        if(o==null)return emptyMap()
        return o.keys().asSequence().associateWith { o.optString(it, "") }
    }
    private fun foods(values: Map<String, FoodFormValue>) = JSONObject().also { o -> values.forEach { (k, v) ->
        o.put(k, JSONObject().put("unitId", v.unitId ?: JSONObject.NULL).put("quantity", v.quantity).put("price", v.price).put("consumption", v.consumption))
    } }
    private fun readFoods(o: JSONObject?): Map<String, FoodFormValue> {
        if(o==null)return emptyMap()
        return o.keys().asSequence().mapNotNull { k ->
            o.optJSONObject(k)?.let { v -> k to FoodFormValue(v.optString("unitId").takeUnless { it.isBlank() || it == "null" }, v.optString("quantity"), v.optString("price"), v.optString("consumption")) }
        }.toMap()
    }

    private fun planning(v: PlanningDraft) = JSONObject()
        .put("destination", v.destination).put("days", v.days).put("people", v.people).put("km", v.km)
        .put("dailyKm", v.dailyKm).put("availableMoney", v.availableMoney).put("type", v.type.name)
        .put("foodForm", foods(v.foodForm)).put("waterLiters", v.waterLiters).put("refill", v.refill)
        .put("refillFrequency", v.refillFrequency).put("waterPlaces", v.waterPlaces)
        .put("speedKmh", v.speedKmh).put("hoursPerDay", v.hoursPerDay).put("safetyMarginPercent", v.safetyMarginPercent)
        .put("departureDate", v.departureDate).put("foodDailyCost", v.foodDailyCost)
        .put("waterDailyPerPerson", v.waterDailyPerPerson).put("energyDailyWh", v.energyDailyWh)

    private fun readPlanning(o: JSONObject): PlanningDraft {
        // Rascunhos gravados antes do schema 2 não tinham ritmo. Mantemos os dias antigos
        // e deixamos velocidade/horas vazias para não reinterpretar silenciosamente um plano salvo.
        val hasPace = o.has("speedKmh") || o.has("hoursPerDay")
        return PlanningDraft(
            destination = o.optString("destination"), days = o.optString("days"), people = o.optString("people", "1"),
            km = o.optString("km"), dailyKm = o.optString("dailyKm"), availableMoney = o.optString("availableMoney"),
            type = TravelType.entries.firstOrNull { it.name == o.optString("type") } ?: TravelType.CICLOVIAGEM,
            foodForm = readFoods(o.optJSONObject("foodForm")), waterLiters = o.optString("waterLiters"),
            refill = o.optBoolean("refill"), refillFrequency = o.optString("refillFrequency"), waterPlaces = o.optString("waterPlaces"),
            speedKmh = if (hasPace) o.optString("speedKmh") else "",
            hoursPerDay = if (hasPace) o.optString("hoursPerDay") else "",
            safetyMarginPercent = o.optInt("safetyMarginPercent", 0).coerceIn(0, 50),
            departureDate = o.optString("departureDate"),
            foodDailyCost = o.optString("foodDailyCost"),
            waterDailyPerPerson = o.optString("waterDailyPerPerson"),
            energyDailyWh = o.optString("energyDailyWh")
        )
    }

    fun encodePlanning(v: PlanningSession): String = JSONObject().put("schemaVersion", 2).put("draft", planning(v.draft))
        .put("lastGenerated", v.lastGenerated?.let(::planning) ?: JSONObject.NULL).toString()

    fun decodePlanning(raw: String?): PlanningSession {
        if (raw.isNullOrBlank()) return PlanningSession()
        return runCatching {
            val o = JSONObject(raw)
            PlanningSession(o.optJSONObject("draft")?.let(::readPlanning) ?: PlanningDraft(), o.optJSONObject("lastGenerated")?.let(::readPlanning))
        }.getOrDefault(PlanningSession())
    }

    private fun route(v: PlannedRoute) = JSONObject()
        .put("id", v.id)
        .put("plan", planning(v.plan))
        .put("createdAt", v.createdAt)
        .put("updatedAt", v.updatedAt)

    fun encodePlanningWorkspace(v: PlanningWorkspace): String {
        val routes = JSONArray()
        v.routes.forEach { routes.put(route(it)) }
        return JSONObject()
            .put("schemaVersion", 1)
            .put("routes", routes)
            .put("editorDraft", planning(v.editorDraft))
            .put("editingRouteId", v.editingRouteId ?: JSONObject.NULL)
            .toString()
    }

    fun decodePlanningWorkspace(raw: String?): PlanningWorkspace {
        if (raw.isNullOrBlank()) return PlanningWorkspace()
        return runCatching {
            val o = JSONObject(raw)
            val array = o.optJSONArray("routes") ?: JSONArray()
            val routes = buildList {
                for (i in 0 until array.length()) {
                    val item = array.optJSONObject(i) ?: continue
                    val id = item.optString("id").takeIf { it.isNotBlank() } ?: continue
                    val plan = item.optJSONObject("plan")?.let(::readPlanning) ?: PlanningDraft()
                    add(PlannedRoute(id, plan, item.optLong("createdAt", 0L), item.optLong("updatedAt", 0L)))
                }
            }
            PlanningWorkspace(
                routes = routes,
                editorDraft = o.optJSONObject("editorDraft")?.let(::readPlanning) ?: PlanningDraft(),
                editingRouteId = o.optString("editingRouteId").takeUnless { it.isBlank() || it == "null" }
                    ?.takeIf { id -> routes.any { it.id == id } }
            )
        }.getOrDefault(PlanningWorkspace())
    }

    /**
     * Migra o planejamento único usado até a alpha.29 para a lista de rotas.
     * O último plano salvo é preservado; um rascunho diferente também é mantido
     * como segunda rota para que nenhuma informação digitada seja descartada.
     */
    fun migrateLegacyPlanning(session: PlanningSession, now: Long): PlanningWorkspace {
        val routes = mutableListOf<PlannedRoute>()
        session.lastGenerated?.takeIf { it.hasPlanningContent() }?.let {
            routes += PlannedRoute("legacy-route", it, now, now)
        }
        if (session.draft.hasPlanningContent() && session.draft != session.lastGenerated) {
            routes += PlannedRoute("legacy-draft", session.draft, now, now)
        }
        if (routes.isEmpty() && session.draft.hasPlanningContent()) {
            routes += PlannedRoute("legacy-route", session.draft, now, now)
        }
        return PlanningWorkspace(routes = routes)
    }

    fun encodeCalculator(v: CalculatorDraft): String = JSONObject().put("schemaVersion", 1).put("fields", strings(v.fields))
        .put("foodForm", foods(v.foodForm)).put("weightData", strings(v.weightData)).put("refill", v.refill).toString()

    fun decodeCalculator(raw: String?): CalculatorDraft = runCatching {
        val o = JSONObject(raw ?: "{}")
        CalculatorDraft(mapOf("people" to "1") + readStrings(o.optJSONObject("fields")), readFoods(o.optJSONObject("foodForm")), readStrings(o.optJSONObject("weightData")), o.optBoolean("refill"))
    }.getOrDefault(CalculatorDraft())
}
