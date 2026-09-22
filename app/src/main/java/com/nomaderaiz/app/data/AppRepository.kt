package com.nomaderaiz.app.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class AppRepository(context: Context) {
    private val prefs=context.getSharedPreferences("nomade_raiz",Context.MODE_PRIVATE)

    fun loadItems():List<EquipmentItem>{
        val raw=prefs.getString("items",null)?:return seedItems
        return runCatching {
            val a=JSONArray(raw)
            val stored=List(a.length()){i->
                val o=a.getJSONObject(i)
                val now=System.currentTimeMillis()
                EquipmentItem(
                    id=o.getString("id"),
                    name=o.getString("name"),
                    categoryId=o.getString("categoryId"),
                    status=runCatching{ItemStatus.valueOf(o.getString("status"))}.getOrDefault(ItemStatus.PENDENTE),
                    priority=runCatching{Priority.valueOf(o.optString("priority","MEDIO"))}.getOrDefault(Priority.MEDIO),
                    quantity=o.optInt("quantity",1).coerceAtLeast(0),
                    price=o.optDouble("price",0.0).coerceAtLeast(0.0),
                    notes=o.optString("notes"),
                    createdAt=o.optLong("createdAt",now),
                    updatedAt=o.optLong("updatedAt",now)
                )
            }
            mergeEquipmentCatalog(stored)
        }.getOrElse{seedItems}
    }

    fun saveItems(items:List<EquipmentItem>){
        val a=JSONArray()
        items.forEach{item->
            a.put(JSONObject()
                .put("id",item.id).put("name",item.name).put("categoryId",item.categoryId)
                .put("status",item.status.name).put("priority",item.priority.name)
                .put("quantity",item.quantity).put("price",item.price).put("notes",item.notes)
                .put("createdAt",item.createdAt).put("updatedAt",item.updatedAt))
        }
        prefs.edit().putString("items",a.toString()).apply()
    }

    fun loadChecks(mode:String):Map<String,Boolean>{
        if(mode !in persistentCheckModes)return emptyMap()
        val o=runCatching{JSONObject(prefs.getString("checks_$mode","{}")!!)}.getOrElse{JSONObject()}
        return o.keys().asSequence().associateWith{o.optBoolean(it,false)}
    }
    fun saveChecks(mode:String,map:Map<String,Boolean>){
        if(mode !in persistentCheckModes)return
        val o=JSONObject();map.forEach{o.put(it.key,it.value)}
        prefs.edit().putString("checks_$mode",o.toString()).apply()
    }
    fun loadActiveCheckMode():String=prefs.getString("active_check_mode","antes-sair")?:"antes-sair"
    fun saveActiveCheckMode(mode:String){prefs.edit().putString("active_check_mode",mode).apply()}

    fun loadJournal():List<JournalEntry>{
        val raw=prefs.getString("journal","[]")!!
        return runCatching{
            val a=JSONArray(raw)
            List(a.length()){i->val o=a.getJSONObject(i);JournalEntry(o.getString("id"),o.optString("local"),o.optString("clima","☀️"),o.optDouble("km",0.0).coerceAtLeast(0.0),o.optString("nota"),o.optLong("createdAt",System.currentTimeMillis()))}
        }.getOrElse{emptyList()}
    }
    fun saveJournal(v:List<JournalEntry>){
        val a=JSONArray();v.forEach{a.put(JSONObject().put("id",it.id).put("local",it.local).put("clima",it.clima).put("km",it.km).put("nota",it.nota).put("createdAt",it.createdAt))}
        prefs.edit().putString("journal",a.toString()).apply()
    }

    fun loadPoints():List<SupportPoint>{
        val raw=prefs.getString("support_points","[]")!!
        return runCatching{
            val a=JSONArray(raw)
            List(a.length()){i->val o=a.getJSONObject(i);SupportPoint(o.getString("id"),normalizePointType(o.optString("tipo","outro")),o.optString("nome"),o.optString("referencia"),o.optString("obs"),o.optInt("avaliacao",2).coerceIn(1,3),o.optBoolean("fechado",false))}
        }.getOrElse{emptyList()}
    }
    fun savePoints(v:List<SupportPoint>){
        val a=JSONArray();v.forEach{a.put(JSONObject().put("id",it.id).put("tipo",normalizePointType(it.tipo)).put("nome",it.nome).put("referencia",it.referencia).put("obs",it.obs).put("avaliacao",it.avaliacao.coerceIn(1,3)).put("fechado",it.fechado))}
        prefs.edit().putString("support_points",a.toString()).apply()
    }

    fun loadMinimums():Map<String,Int>{
        val o=runCatching{JSONObject(prefs.getString("minimums","{}")!!)}.getOrElse{JSONObject()}
        return o.keys().asSequence().associateWith{o.optInt(it,0).coerceAtLeast(0)}
    }
    fun saveMinimums(v:Map<String,Int>){val o=JSONObject();v.forEach{o.put(it.key,it.value.coerceAtLeast(0))};prefs.edit().putString("minimums",o.toString()).apply()}

    fun loadFavoriteTips():Set<String> = prefs.getStringSet("favorite_tips",emptySet())?.toSet()?:emptySet()
    fun saveFavoriteTips(v:Set<String>){prefs.edit().putStringSet("favorite_tips",v).apply()}
    fun loadFavoriteManual():Set<String> = prefs.getStringSet("favorite_manual",emptySet())?.toSet()?:emptySet()
    fun saveFavoriteManual(v:Set<String>){prefs.edit().putStringSet("favorite_manual",v).apply()}
    fun loadMasteredSkills():Set<String> = prefs.getStringSet("mastered_skills",emptySet())?.toSet()?:emptySet()
    fun saveMasteredSkills(v:Set<String>){prefs.edit().putStringSet("mastered_skills",v).apply()}

    fun loadSettings():AppSettings{
        val mode=runCatching{ThemeMode.valueOf(prefs.getString("theme_mode",ThemeMode.DARK.name)!!)}.getOrDefault(ThemeMode.DARK)
        val scale=runCatching{FontScale.valueOf(prefs.getString("font_scale",FontScale.MD.name)!!)}.getOrDefault(FontScale.MD)
        val accent=runCatching{AppAccent.valueOf(prefs.getString("app_accent",AppAccent.RAIZ.name)!!)}.getOrDefault(AppAccent.RAIZ)
        val start=if(prefs.contains("start_date"))prefs.getLong("start_date",0L).takeIf{it>0} else null
        return AppSettings(mode,scale,start,accent)
    }
    fun saveSettings(v:AppSettings){
        val e=prefs.edit().putString("theme_mode",v.themeMode.name).putString("font_scale",v.fontScale.name).putString("app_accent",v.accent.name)
        if(v.startDate==null)e.remove("start_date") else e.putLong("start_date",v.startDate)
        e.apply()
    }

    fun loadQuickNote():String=prefs.getString("quick_note","")?:""
    fun saveQuickNote(v:String){prefs.edit().putString("quick_note",v).apply()}

    fun loadPlanningSession():PlanningSession = TravelFormJson.decodePlanning(prefs.getString("planning_session_v1",null))
    fun savePlanningSession(v:PlanningSession){prefs.edit().putString("planning_session_v1",TravelFormJson.encodePlanning(v)).apply()}
    /**
     * Gravação síncrona reservada a escolhas discretas que precisam estar persistidas
     * quando o gesto termina (por exemplo, a margem de segurança do Planejamento).
     * Campos de digitação continuam usando savePlanningSession() fora da UI thread.
     */
    fun savePlanningSessionImmediate(v:PlanningSession):Boolean =
        prefs.edit().putString("planning_session_v1",TravelFormJson.encodePlanning(v)).commit()

    /** Novo armazenamento do Planejar por rotas. O formato antigo fica intacto para migração. */
    fun loadPlanningWorkspace():PlanningWorkspace {
        val current=prefs.getString("planning_routes_v1",null)
        if(!current.isNullOrBlank()) return TravelFormJson.decodePlanningWorkspace(current)
        val migrated=TravelFormJson.migrateLegacyPlanning(loadPlanningSession(),System.currentTimeMillis())
        // Commit somente na migração para garantir que o mesmo plano legado não seja importado duas vezes.
        prefs.edit().putString("planning_routes_v1",TravelFormJson.encodePlanningWorkspace(migrated)).commit()
        return migrated
    }
    fun savePlanningWorkspace(v:PlanningWorkspace){
        prefs.edit().putString("planning_routes_v1",TravelFormJson.encodePlanningWorkspace(v)).apply()
    }
    fun savePlanningWorkspaceImmediate(v:PlanningWorkspace):Boolean =
        prefs.edit().putString("planning_routes_v1",TravelFormJson.encodePlanningWorkspace(v)).commit()
    fun loadCalculatorDraft():CalculatorDraft = TravelFormJson.decodeCalculator(prefs.getString("calculator_draft_v1",null))
    fun saveCalculatorDraft(v:CalculatorDraft){prefs.edit().putString("calculator_draft_v1",TravelFormJson.encodeCalculator(v)).apply()}

    fun exportText(items:List<EquipmentItem>,format:String):String{
        val totalValue=items.sumOf{it.price*it.quantity.coerceAtLeast(0)}
        val bought=items.filter{it.status==ItemStatus.COMPRADO}
        val pending=items.filter{it.status==ItemStatus.PENDENTE&&it.quantity>0}
        val boughtValue=bought.sumOf{it.price*it.quantity.coerceAtLeast(0)}
        fun line(i:EquipmentItem,notes:Boolean=false):String{
            val base="${if(i.status==ItemStatus.COMPRADO)"✓" else "○"} ${i.name} ×${i.quantity.coerceAtLeast(0)} — R$ %.2f".format(i.price*i.quantity.coerceAtLeast(0))
            return if(notes&&i.notes.isNotBlank())"$base — ${i.notes}" else base
        }
        return when(format){
            "resumo"->listOf("NOMADE RAIZ — RESUMO","","Itens cadastrados: ${items.size}","Comprados: ${bought.size}","Pendentes: ${pending.size}","Investimento total: R$ %.2f".format(totalValue),"Já investido: R$ %.2f".format(boughtValue),"Falta investir: R$ %.2f".format(pending.sumOf{it.price*it.quantity.coerceAtLeast(0)})).joinToString("\n")
            "compras"->if(pending.isEmpty())"NOMADE RAIZ — LISTA DE COMPRAS\n\n✅ Nenhuma compra pendente." else (listOf("NOMADE RAIZ — LISTA DE COMPRAS","")+pending.map{line(it)}+listOf("","Total pendente: R$ %.2f".format(pending.sumOf{it.price*it.quantity.coerceAtLeast(0)}))).joinToString("\n")
            else->if(items.isEmpty())"NOMADE RAIZ — INVENTÁRIO COMPLETO\n\nNenhum item cadastrado." else (listOf("NOMADE RAIZ — INVENTÁRIO COMPLETO","")+items.map{line(it,true)}+listOf("","Total do inventário: R$ %.2f".format(totalValue))).joinToString("\n")
        }
    }

    fun exportBackup(appVersion:String):String{
        val data=JSONObject()
        data.put("items",JSONArray(prefs.getString("items",JSONArray(seedItems.map{itemToJson(it)}).toString())?:"[]"))
        data.put("modoAtivo",loadActiveCheckMode())
        val checks=JSONObject();persistentCheckModes.forEach{mode->checks.put(mode,JSONObject(prefs.getString("checks_$mode","{}")?:"{}"))};data.put("checks",checks)
        data.put("diario",JSONArray(prefs.getString("journal","[]")?:"[]"))
        data.put("pontos",JSONArray(prefs.getString("support_points","[]")?:"[]"))
        data.put("minimos",JSONObject(prefs.getString("minimums","{}")?:"{}"))
        val settings=loadSettings();data.put("settings",JSONObject().put("themeMode",settings.themeMode.name.lowercase()).put("fontScale",settings.fontScale.name.lowercase()).put("startDate",settings.startDate).put("accent",settings.accent.name.lowercase()))
        data.put("notaRapida",loadQuickNote())
        data.put("favoritosDicas",JSONArray(loadFavoriteTips().toList()))
        data.put("favoritosTutoriais",JSONArray(loadFavoriteManual().toList()))
        data.put("habilidadesDominadas",JSONArray(loadMasteredSkills().toList()))
        return JSONObject().put("app","nomade-raiz").put("schemaVersion",1).put("appVersion",appVersion).put("exportedAt",java.time.Instant.now().toString()).put("data",data).toString(2)
    }

    fun importBackup(text:String){
        val parsed=org.json.JSONTokener(text).nextValue()
        if(parsed is JSONArray){ saveItems(parseItems(parsed));return }
        require(parsed is JSONObject){"Backup inválido."}
        if(parsed.has("items")&&!parsed.has("data")){saveItems(parseItems(parsed.getJSONArray("items")));return}
        require(parsed.optString("app")=="nomade-raiz"&&parsed.optInt("schemaVersion")==1&&parsed.opt("data") is JSONObject){"Backup incompatível ou inválido."}
        val data=parsed.getJSONObject("data")
        saveItems(parseItems(data.optJSONArray("items")?:JSONArray()))
        saveActiveCheckMode(data.optString("modoAtivo","antes-sair"))
        val checks=data.optJSONObject("checks")?:JSONObject();persistentCheckModes.forEach{mode->val o=checks.optJSONObject(mode)?:JSONObject();val map=o.keys().asSequence().associateWith{o.optBoolean(it,false)};saveChecks(mode,map)}
        val diario=data.optJSONArray("diario")?:JSONArray();val j=List(diario.length()){i->val o=diario.getJSONObject(i);JournalEntry(o.optString("id",id()),o.optString("local"),o.optString("clima","☀️"),o.optDouble("km",0.0).coerceAtLeast(0.0),o.optString("nota"),o.optLong("createdAt",System.currentTimeMillis()))};saveJournal(j)
        val pontos=data.optJSONArray("pontos")?:JSONArray();val p=List(pontos.length()){i->val o=pontos.getJSONObject(i);SupportPoint(o.optString("id",id()),normalizePointType(o.optString("tipo","outro")),o.optString("nome"),o.optString("referencia"),o.optString("obs"),o.optInt("avaliacao",2).coerceIn(1,3),o.optBoolean("fechado",false))};savePoints(p)
        val mins=data.optJSONObject("minimos")?:JSONObject();saveMinimums(mins.keys().asSequence().associateWith{mins.optInt(it,0).coerceAtLeast(0)})
        val set=data.optJSONObject("settings")?:JSONObject()
        val importedAccent=runCatching{AppAccent.valueOf(set.optString("accent",AppAccent.RAIZ.name).uppercase())}.getOrDefault(AppAccent.RAIZ)
        saveSettings(AppSettings(
            if(set.optString("themeMode")=="light")ThemeMode.LIGHT else ThemeMode.DARK,
            when(set.optString("fontScale")){"sm"->FontScale.SM;"lg"->FontScale.LG;else->FontScale.MD},
            set.optLong("startDate",0L).takeIf{it>0},
            importedAccent
        ))
        saveQuickNote(data.optString("notaRapida",""))
        val fav=data.optJSONArray("favoritosDicas")?:JSONArray();saveFavoriteTips((0 until fav.length()).mapNotNull{fav.optString(it).takeIf(String::isNotBlank)}.toSet())
        val favManual=data.optJSONArray("favoritosTutoriais")?:JSONArray();saveFavoriteManual((0 until favManual.length()).mapNotNull{favManual.optString(it).takeIf(String::isNotBlank)}.toSet())
        val mastered=data.optJSONArray("habilidadesDominadas")?:JSONArray();saveMasteredSkills((0 until mastered.length()).mapNotNull{mastered.optString(it).takeIf(String::isNotBlank)}.toSet())
    }

    fun clearAll(){prefs.edit().clear().apply()}
    fun id()=UUID.randomUUID().toString()

    private fun itemToJson(it:EquipmentItem)=JSONObject().put("id",it.id).put("name",it.name).put("categoryId",it.categoryId).put("status",it.status.name).put("priority",it.priority.name).put("quantity",it.quantity).put("price",it.price).put("notes",it.notes).put("createdAt",it.createdAt).put("updatedAt",it.updatedAt)
    private fun parseItems(a:JSONArray):List<EquipmentItem>{
        val now=System.currentTimeMillis()
        return List(a.length()){i->val o=a.getJSONObject(i);EquipmentItem(o.optString("id",id()),o.optString("name"),o.optString("categoryId","mobilidade"),if(o.optString("status").lowercase() in setOf("comprado","bought","COMPRADO".lowercase()))ItemStatus.COMPRADO else runCatching{ItemStatus.valueOf(o.optString("status","PENDENTE"))}.getOrDefault(ItemStatus.PENDENTE),when(o.optString("priority").lowercase()){"urgente"->Priority.URGENTE;"baixo"->Priority.BAIXO;else->runCatching{Priority.valueOf(o.optString("priority","MEDIO"))}.getOrDefault(Priority.MEDIO)},o.optInt("quantity",1).coerceAtLeast(0),o.optDouble("price",0.0).coerceAtLeast(0.0),o.optString("notes"),o.optLong("createdAt",now),o.optLong("updatedAt",now))}
    }
    private fun normalizePointType(v:String)=if(v in setOf("agua","mercado","camping","saude","oficina","outro"))v else "outro"
}
