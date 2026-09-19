package com.nomaderaiz.app.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.Saver
import androidx.compose.runtime.saveable.listSaver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import com.nomaderaiz.app.data.*
import com.nomaderaiz.app.ui.theme.NomadeRaizTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged

private val NavigationStateSaver = listSaver<NavigationState, String>(
    save = { state -> listOf(state.current.name) + state.backStack.map { it.name } },
    restore = { names ->
        val screens = names.mapNotNull { name -> Screen.entries.firstOrNull { it.name == name } }
        NavigationState(
            current = screens.firstOrNull() ?: Screen.Home,
            backStack = screens.drop(1)
        )
    }
)

private val PlanningSessionSaver = Saver<PlanningSession,String>(
    save = { TravelFormJson.encodePlanning(it) },
    restore = { TravelFormJson.decodePlanning(it) }
)

private val CalculatorDraftSaver = Saver<CalculatorDraft,String>(
    save = { TravelFormJson.encodeCalculator(it) },
    restore = { TravelFormJson.decodeCalculator(it) }
)

@Composable
fun NomadeRaizApp(){
    val context=LocalContext.current
    val repo=remember(context){AppRepository(context.applicationContext)}
    var navigation by rememberSaveable(stateSaver=NavigationStateSaver){mutableStateOf(NavigationState())}
    var items by remember{mutableStateOf(repo.loadItems())}
    var journal by remember{mutableStateOf(repo.loadJournal())}
    var points by remember{mutableStateOf(repo.loadPoints())}
    var minimums by remember{mutableStateOf(repo.loadMinimums())}
    var favoriteTips by remember{mutableStateOf(repo.loadFavoriteTips())}
    var settings by remember{mutableStateOf(repo.loadSettings())}
    var quickNote by remember{mutableStateOf(repo.loadQuickNote())}
    var activeCheckMode by remember{mutableStateOf(repo.loadActiveCheckMode())}
    var favoriteManual by remember{mutableStateOf(repo.loadFavoriteManual())}
    var masteredSkills by remember{mutableStateOf(repo.loadMasteredSkills())}
    var planning by rememberSaveable(stateSaver=PlanningSessionSaver){mutableStateOf(repo.loadPlanningSession())}
    var calculator by rememberSaveable(stateSaver=CalculatorDraftSaver){mutableStateOf(repo.loadCalculatorDraft())}
    val savedScreens=rememberSaveableStateHolder()

    // Planejamento e Calculadora têm digitação contínua. O estado visual e o SavedState
    // são atualizados imediatamente; a serialização persistente é agrupada e executada
    // fora da thread da UI. Assim a Activity pode ser recriada sem perder o que foi
    // digitado e sem gravar SharedPreferences a cada tecla.
    // Um único coletor serializa as gravações em ordem. collectLatest cancela o
    // debounce anterior antes de aceitar o próximo valor e impede que um snapshot
    // antigo termine depois de um valor mais novo, sobrescrevendo campos recentes.
    LaunchedEffect(repo){
        snapshotFlow { planning }
            .distinctUntilChanged()
            .collectLatest { value ->
                delay(300)
                withContext(Dispatchers.IO){repo.savePlanningSession(value)}
            }
    }
    LaunchedEffect(repo){
        snapshotFlow { calculator }
            .distinctUntilChanged()
            .collectLatest { value ->
                delay(300)
                withContext(Dispatchers.IO){repo.saveCalculatorDraft(value)}
            }
    }

    fun reloadPersistentState(){
        items=repo.loadItems();journal=repo.loadJournal();points=repo.loadPoints();minimums=repo.loadMinimums()
        favoriteTips=repo.loadFavoriteTips();settings=repo.loadSettings();quickNote=repo.loadQuickNote();activeCheckMode=repo.loadActiveCheckMode()
        favoriteManual=repo.loadFavoriteManual();masteredSkills=repo.loadMasteredSkills()
        planning=repo.loadPlanningSession();calculator=repo.loadCalculatorDraft()
    }
    fun open(target:Screen){navigation=navigation.open(target)}
    fun selectTopLevel(target:Screen){navigation=navigation.selectTopLevel(target)}
    fun back(){navigation=navigation.back()}

    BackHandler(enabled=navigation.canGoBack){back()}

    NomadeRaizTheme(darkTheme=settings.themeMode==ThemeMode.DARK,fontScale=settings.fontScale,accent=settings.accent){
        AppSystemBars(settings.themeMode==ThemeMode.DARK)
        Scaffold(
            containerColor=MaterialTheme.colorScheme.background,
            contentWindowInsets=WindowInsets.safeDrawing,
            bottomBar={
                if(navigation.current in topLevelScreens){
                    NavigationBar(
                        modifier=Modifier.testTag("bottom-navigation"),
                        containerColor=MaterialTheme.colorScheme.surface,
                        tonalElevation=0.dp
                    ){
                        listOf(Screen.Home,Screen.Planning,Screen.Journal,Screen.More).forEach{s->
                            NavigationBarItem(
                                selected=navigation.current==s,
                                onClick={selectTopLevel(s)},
                                icon={Icon(when(s){Screen.Home->Icons.Default.Home;Screen.Planning->Icons.Default.Map;Screen.Journal->Icons.Default.MenuBook;else->Icons.Default.MoreHoriz},contentDescription=null)},
                                modifier=Modifier.testTag("nav-${s.name}"),
                                label={Text(when(s){Screen.Home->"Início";Screen.Planning->"Planejar";Screen.Journal->"Diário";else->"Mais"},fontSize=12.sp)},
                                colors=NavigationBarItemDefaults.colors(
                                    selectedIconColor=MaterialTheme.colorScheme.primary,
                                    selectedTextColor=MaterialTheme.colorScheme.primary,
                                    indicatorColor=MaterialTheme.colorScheme.primary.copy(alpha=.15f),
                                    unselectedIconColor=MaterialTheme.colorScheme.onSurfaceVariant,
                                    unselectedTextColor=MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            )
                        }
                    }
                }
            }
        ){padding->
            Box(Modifier.fillMaxSize().padding(padding).consumeWindowInsets(padding).imePadding().testTag("screen-root-${navigation.current.name}")){
              savedScreens.SaveableStateProvider(navigation.current.name){
              when(navigation.current){
                Screen.Home->HomeScreen(
                    modifier=Modifier,items=items,minimums=minimums,settings=settings,quickNote=quickNote,
                    onQuickNote={quickNote=it;repo.saveQuickNote(it)},
                    onVerify={mode->activeCheckMode=mode;repo.saveActiveCheckMode(mode);open(Screen.Verify)},
                    onGear={open(Screen.Gear)},onPlanning={selectTopLevel(Screen.Planning)},onJournal={selectTopLevel(Screen.Journal)},
                    onCalculator={open(Screen.Calculator)},onPoints={open(Screen.Points)},
                    onTips={open(Screen.Tips)},onAlerts={open(Screen.Alerts)}
                )
                Screen.Gear->EquipmentScreen(Modifier,items,{items=it;repo.saveItems(it)},{back()},repo)
                Screen.Verify->VerifyScreen(repo,activeCheckMode,{mode->activeCheckMode=mode;repo.saveActiveCheckMode(mode)},{back()})
                Screen.Planning->PlanningScreen(
                    modifier=Modifier,equipment=items,session=planning,
                    updateDraft={transform->
                        val current=planning
                        planning=current.copy(draft=transform(current.draft))
                    },
                    updateDraftImmediate={transform->
                        // Controles discretos (ex.: margem de segurança) devem sobreviver
                        // imediatamente a navegação/recriação. Mantemos a digitação numérica
                        // no debounce para não reintroduzir gravações a cada tecla.
                        val current=planning
                        val updated=current.copy(draft=transform(current.draft))
                        planning=updated
                        repo.savePlanningSession(updated)
                    },
                    commitCurrent={
                        val snapshot=planning.draft.snapshotForPlanning()
                        val updated=planning.copy(draft=snapshot,lastGenerated=snapshot)
                        planning=updated
                        repo.savePlanningSession(updated)
                    },
                    onPoints={open(Screen.Points)},onManual={open(Screen.Manual)},
                    back=if(navigation.canGoBack)({back()})else null
                )
                Screen.Journal->JournalScreen(Modifier,journal,{journal=it;repo.saveJournal(it)},repo)
                Screen.More->{
                    val alertCount=remember(items,minimums){items.count{item->minimums[item.id]?.let{minimum->(if(item.status==ItemStatus.COMPRADO)item.quantity else 0)<minimum}==true}}
                    MoreScreen(modifier=Modifier,alertCount=alertCount,open={open(it)})
                }
                Screen.Calculator->CalculatorScreen(calculator,{calculator=it},{back()})
                Screen.Points->PointsScreen(points,{points=it;repo.savePoints(it)},repo,{back()})
                Screen.Alerts->AlertsScreen(items,minimums,{minimums=it;repo.saveMinimums(it)},{back()})
                Screen.Tips->TipsScreen(favoriteTips,{favoriteTips=it;repo.saveFavoriteTips(it)},{back()})
                Screen.Manual->ManualBikeScreen(items,favoriteManual,masteredSkills,{favoriteManual=it;repo.saveFavoriteManual(it)},{masteredSkills=it;repo.saveMasteredSkills(it)},{back()})
                Screen.Backup->BackupScreen(repo,items,{reloadPersistentState()},{back()})
                Screen.Settings->SettingsScreen(settings,items.size,journal.size,points.size,{settings=it;repo.saveSettings(it)},{repo.clearAll();reloadPersistentState();navigation=NavigationState()},{back()})
                Screen.About->AboutScreen{back()}
              }
              }
            }
        }
    }
}
