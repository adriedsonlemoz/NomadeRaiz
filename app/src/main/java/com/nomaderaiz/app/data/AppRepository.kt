package com.nomaderaiz.app.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

class AppRepository(context: Context) {
    private val prefs=context.getSharedPreferences("nomade_raiz",Context.MODE_PRIVATE)

    fun purchased():Set<String> = prefs.getStringSet("purchased", emptySet()) ?: emptySet()
    fun togglePurchased(id:String) {
        val s=purchased().toMutableSet()
        if(!s.add(id)) s.remove(id)
        prefs.edit().putStringSet("purchased",s).apply()
    }

    fun journal():List<JournalEntry> = try {
        val a=JSONArray(prefs.getString("journal","[]"))
        (0 until a.length()).map { i-> a.getJSONObject(i).let { JournalEntry(it.getLong("id"),it.getString("place"),it.getString("weather"),it.getDouble("km"),it.getString("note"),it.getLong("createdAt")) } }
    } catch(_:Exception){ emptyList() }
    fun addJournal(e:JournalEntry){ saveJournal(listOf(e)+journal()) }
    fun deleteJournal(id:Long){ saveJournal(journal().filterNot{it.id==id}) }
    private fun saveJournal(v:List<JournalEntry>) {
        val a=JSONArray(); v.forEach { e-> a.put(JSONObject().put("id",e.id).put("place",e.place).put("weather",e.weather).put("km",e.km).put("note",e.note).put("createdAt",e.createdAt)) }
        prefs.edit().putString("journal",a.toString()).apply()
    }

    fun points():List<SupportPoint> = try {
        val a=JSONArray(prefs.getString("points","[]"))
        (0 until a.length()).map { i-> a.getJSONObject(i).let { SupportPoint(it.getLong("id"),it.getString("type"),it.getString("name"),it.getString("reference"),it.getString("note"),it.getInt("rating"),it.getBoolean("closed")) } }
    } catch(_:Exception){ emptyList() }
    fun addPoint(p:SupportPoint){ savePoints(listOf(p)+points()) }
    fun deletePoint(id:Long){ savePoints(points().filterNot{it.id==id}) }
    private fun savePoints(v:List<SupportPoint>) {
        val a=JSONArray(); v.forEach { p-> a.put(JSONObject().put("id",p.id).put("type",p.type).put("name",p.name).put("reference",p.reference).put("note",p.note).put("rating",p.rating).put("closed",p.closed)) }
        prefs.edit().putString("points",a.toString()).apply()
    }
}
