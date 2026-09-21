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
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.distinctUntilChanged
import java.util.concurrent.atomic.AtomicLong
import java.util.concurrent.atomic.AtomicReference

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

private val PlanningWorkspaceSaver = Saver<PlanningWorkspace,String>(
    save = { TravelFormJson.encodePlanningWorkspace(it) },
    restore = { TravelFormJson.decodePlanningWorkspace(it) }
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
    var planning by rememberSaveable(stateSaver=PlanningWorkspaceSaver){mutableStateOf(repo.loadPlanningWorkspace())}
    var calculator by rememberSaveable(stateSaver=CalculatorDraftSaver){mutableStateOf(repo.loadCalculatorDraft())}
    val savedScreens=rememberSaveableStateHolder()

    // Planejamento usa persistência explícita para evitar uma corrida entre o debounce
    // dos campos digitados e escolhas discretas (como a margem de segurança). Só o
    // snapshot mais recente pode chegar ao repositório. Controles discretos invalidam
    // qualquer gravação pendente e são aplicados imediatamente.
    val persistenceScope=rememberCoroutineScope()
    val planningRevision=remember{AtomicLong(0)}
    val planningSaveJob=remember{AtomicReference<Job?>(null)}
    val planningWriteLock=remember{Any()}

    fun persistPlanningDebounced(value:PlanningWorkspace){
        val revision=planningRevision.incrementAndGet()
        planningSaveJob.getAndSet(null)?.cancel()
        val job=persistenceScope.launch{
            delay(300)
            withContext(Dispatchers.IO){
                synchronized(planningWriteLock){
                    if(planningRevision.get()==revision) repo.savePlanningWorkspace(value)
                }
            }
        }
        planningSaveJob.set(job)
    }

    fun persistPlanningImmediate(value:PlanningWorkspace){
        val revision=planningRevision.incrementAndGet()
        planningSaveJob.getAndSet(null)?.cancel()
        // A escrita síncrona em SharedPreferences não bloqueia mais a UI. A ação é
        // imediata no estado Compose e o commit é serializado em Dispatchers.IO.
        val job=persistenceScope.launch{
            withContext(Dispatchers.IO){
                synchronized(planningWriteLock){
                    if(planningRevision.get()==revision) repo.savePlanningWorkspaceImmediate(value)
                }
            }
        }
        planningSaveJob.set(job)
    }

    fun dispatchPlanning(action:PlanningAction){
        // Única porta de entrada do estado do Planejamento. O redutor sempre recebe
        // o PlanningWorkspace mais recente, eliminando caminhos paralelos de atualização.
        val updated=reducePlanning(planning,action)
        planning=updated
        when(persistenceFor(action)){
            PlanningPersistence.DEBOUNCED->persistPlanningDebounced(updated)
            PlanningPersistence.IMMEDIATE->persistPlanningImmediate(updated)
        }
    }

    // A Calculadora permanece com debounce serializado porque só recebe digitação
    // contínua e não possui o mesmo tipo de escolha discreta do Planejamento.
    LaunchedEffect(repo){
        snapshotFlow { calculator }
            .distinctUntilChanged()
            .collectLatest { value ->
                delay(300)
                withContext(Dispatchers.IO){repo.saveCalculatorDraft(value)}
            }
    }

    fun reloadPersistentState(){
        planningRevision.incrementAndGet()
        planningSaveJob.getAndSet(null)?.cancel()
        items=repo.loadItems();journal=repo.loadJournal();points=repo.loadPoints();minimums=repo.loadMinimums()
        favoriteTips=repo.loadFavoriteTips();settings=repo.loadSettings();quickNote=repo.loadQuickNote();activeCheckMode=repo.loadActiveCheckMode()
        favoriteManual=repo.loadFavoriteManual();masteredSkills=repo.loadMasteredSkills()
        planning=repo.loadPlanningWorkspace();calculator=repo.loadCalculatorDraft()
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
                    modifier=Modifier,equipment=items,workspace=planning,
                    dispatch=::dispatchPlanning,
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
