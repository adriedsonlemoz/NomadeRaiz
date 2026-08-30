package com.nomaderaiz.app.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class AppRepository(context: Context) {
    private val prefs=context.getSharedPreferences("nomade_raiz",Context.MODE_PRIVATE)
    fun loadItems():List<EquipmentItem>{ val raw=prefs.getString("items",null)?:return seedItems; return runCatching { val a=JSONArray(raw); List(a.length()){i-> val o=a.getJSONObject(i); EquipmentItem(o.getString("id"),o.getString("name"),o.getString("categoryId"),ItemStatus.valueOf(o.getString("status")),Priority.valueOf(o.getString("priority")),o.getInt("quantity"),o.getDouble("price"),o.optString("notes")) } }.getOrElse{seedItems} }
    fun saveItems(items:List<EquipmentItem>){ val a=JSONArray(); items.forEach{ a.put(JSONObject().put("id",it.id).put("name",it.name).put("categoryId",it.categoryId).put("status",it.status.name).put("priority",it.priority.name).put("quantity",it.quantity).put("price",it.price).put("notes",it.notes))}; prefs.edit().putString("items",a.toString()).apply() }
    fun loadChecks(mode:String):Map<String,Boolean>{ val o=runCatching{JSONObject(prefs.getString("checks_$mode","{}")!!)}.getOrElse{JSONObject()}; return o.keys().asSequence().associateWith{o.optBoolean(it,false)} }
    fun saveChecks(mode:String,map:Map<String,Boolean>){ val o=JSONObject(); map.forEach{o.put(it.key,it.value)}; prefs.edit().putString("checks_$mode",o.toString()).apply() }
    fun loadJournal():List<JournalEntry>{ val raw=prefs.getString("journal","[]")!!; return runCatching{val a=JSONArray(raw);List(a.length()){i->val o=a.getJSONObject(i);JournalEntry(o.getString("id"),o.getString("local"),o.getString("clima"),o.getDouble("km"),o.getString("nota"),o.getLong("createdAt"))}}.getOrElse{emptyList()} }
    fun saveJournal(v:List<JournalEntry>){val a=JSONArray();v.forEach{a.put(JSONObject().put("id",it.id).put("local",it.local).put("clima",it.clima).put("km",it.km).put("nota",it.nota).put("createdAt",it.createdAt))};prefs.edit().putString("journal",a.toString()).apply()}

    fun loadPoints():List<SupportPoint>{ val raw=prefs.getString("support_points","[]")!!;return runCatching{val a=JSONArray(raw);List(a.length()){i->val o=a.getJSONObject(i);SupportPoint(o.getString("id"),o.getString("tipo"),o.getString("nome"),o.optString("referencia"),o.optString("obs"),o.optInt("avaliacao",2).coerceIn(1,3),o.optBoolean("fechado",false))}}.getOrElse{emptyList()} }
    fun savePoints(v:List<SupportPoint>){val a=JSONArray();v.forEach{a.put(JSONObject().put("id",it.id).put("tipo",it.tipo).put("nome",it.nome).put("referencia",it.referencia).put("obs",it.obs).put("avaliacao",it.avaliacao).put("fechado",it.fechado))};prefs.edit().putString("support_points",a.toString()).apply()}
    fun loadMinimums():Map<String,Int>{val o=runCatching{JSONObject(prefs.getString("minimums","{}")!!)}.getOrElse{JSONObject()};return o.keys().asSequence().associateWith{o.optInt(it,0)}}
    fun saveMinimums(v:Map<String,Int>){val o=JSONObject();v.forEach{o.put(it.key,it.value)};prefs.edit().putString("minimums",o.toString()).apply()}
    fun loadFavoriteTips():Set<String>{return prefs.getStringSet("favorite_tips",emptySet())?.toSet()?:emptySet()}
    fun saveFavoriteTips(v:Set<String>){prefs.edit().putStringSet("favorite_tips",v).apply()}
    fun id()=UUID.randomUUID().toString()
}
