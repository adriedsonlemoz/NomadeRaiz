package com.nomaderaiz.app.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.listSaver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.nomaderaiz.app.data.*
import com.nomaderaiz.app.ui.theme.NomadeRaizTheme

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

    fun reloadPersistentState(){
        items=repo.loadItems();journal=repo.loadJournal();points=repo.loadPoints();minimums=repo.loadMinimums()
        favoriteTips=repo.loadFavoriteTips();settings=repo.loadSettings();quickNote=repo.loadQuickNote();activeCheckMode=repo.loadActiveCheckMode()
        favoriteManual=repo.loadFavoriteManual();masteredSkills=repo.loadMasteredSkills()
    }
    fun open(target:Screen){navigation=navigation.open(target)}
    fun selectTopLevel(target:Screen){navigation=navigation.selectTopLevel(target)}
    fun back(){navigation=navigation.back()}

    BackHandler(enabled=navigation.canGoBack){back()}

    NomadeRaizTheme(darkTheme=settings.themeMode==ThemeMode.DARK,fontScale=settings.fontScale,accent=settings.accent){
        Scaffold(
            bottomBar={
                if(navigation.current in topLevelScreens){
                    NavigationBar{
                        listOf(Screen.Home,Screen.Planning,Screen.Journal,Screen.More).forEach{s->
                            NavigationBarItem(
                                selected=navigation.current==s,
                                onClick={selectTopLevel(s)},
                                icon={Icon(when(s){Screen.Home->Icons.Default.Home;Screen.Planning->Icons.Default.Map;Screen.Journal->Icons.Default.MenuBook;else->Icons.Default.MoreHoriz},contentDescription=null)},
                                label={Text(when(s){Screen.Home->"Início";Screen.Planning->"Planejamento";Screen.Journal->"Diário";else->"Mais"})}
                            )
                        }
                    }
                }
            }
        ){padding->
            when(navigation.current){
                Screen.Home->HomeScreen(
                    modifier=Modifier.padding(padding),items=items,minimums=minimums,settings=settings,quickNote=quickNote,
                    onQuickNote={quickNote=it;repo.saveQuickNote(it)},
                    onVerify={mode->activeCheckMode=mode;repo.saveActiveCheckMode(mode);open(Screen.Verify)},
                    onGear={open(Screen.Gear)},onPlanning={selectTopLevel(Screen.Planning)},onJournal={selectTopLevel(Screen.Journal)},
                    onCalculator={open(Screen.Calculator)},onPoints={open(Screen.Points)},
                    onTips={open(Screen.Tips)},onAlerts={open(Screen.Alerts)}
                )
                Screen.Gear->EquipmentScreen(Modifier.padding(padding),items,{items=it;repo.saveItems(it)},{back()},repo)
                Screen.Verify->VerifyScreen(repo,activeCheckMode,{mode->activeCheckMode=mode;repo.saveActiveCheckMode(mode)},{back()})
                Screen.Planning->PlanningScreen(Modifier.padding(padding),items,{open(Screen.Points)},{open(Screen.Manual)})
                Screen.Journal->JournalScreen(Modifier.padding(padding),journal,{journal=it;repo.saveJournal(it)},repo)
                Screen.More->MoreScreen(
                    modifier=Modifier.padding(padding),
                    alertCount=items.count{item->minimums[item.id]?.let{minimum->(if(item.status==ItemStatus.COMPRADO)item.quantity else 0)<minimum}==true},
                    open={open(it)}
                )
                Screen.Calculator->CalculatorScreen(items,{back()})
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
