package com.nomaderaiz.app.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import com.nomaderaiz.app.data.*
import com.nomaderaiz.app.ui.theme.NomadeRaizTheme

enum class Screen { Home, Gear, Planning, Journal, More, Verify, Calculator, Points, Alerts, Tips, Manual, Backup, Settings, About }

@Composable
fun NomadeRaizApp(){
    val context=LocalContext.current
    val repo=remember(context){AppRepository(context.applicationContext)}
    var screen by remember{mutableStateOf(Screen.Home)}
    var detailReturnScreen by remember{mutableStateOf(Screen.More)}
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
    fun openDetail(target:Screen,returnTo:Screen){detailReturnScreen=returnTo;screen=target}

    NomadeRaizTheme(darkTheme=settings.themeMode==ThemeMode.DARK,fontScale=settings.fontScale,accent=settings.accent){
        Scaffold(
            bottomBar={
                if(screen in listOf(Screen.Home,Screen.Planning,Screen.Journal,Screen.More)){
                    NavigationBar{
                        listOf(Screen.Home,Screen.Planning,Screen.Journal,Screen.More).forEach{s->
                            NavigationBarItem(
                                selected=screen==s,
                                onClick={screen=s},
                                icon={Icon(when(s){Screen.Home->Icons.Default.Home;Screen.Planning->Icons.Default.Map;Screen.Journal->Icons.Default.MenuBook;else->Icons.Default.MoreHoriz},contentDescription=null)},
                                label={Text(when(s){Screen.Home->"Início";Screen.Planning->"Planejamento";Screen.Journal->"Diário";else->"Mais"})}
                            )
                        }
                    }
                }
            }
        ){padding->
            when(screen){
                Screen.Home->HomeScreen(
                    modifier=Modifier.padding(padding),items=items,minimums=minimums,settings=settings,quickNote=quickNote,
                    onQuickNote={quickNote=it;repo.saveQuickNote(it)},
                    onVerify={mode->activeCheckMode=mode;repo.saveActiveCheckMode(mode);screen=Screen.Verify},
                    onGear={screen=Screen.Gear},onPlanning={screen=Screen.Planning},onJournal={screen=Screen.Journal},
                    onCalculator={openDetail(Screen.Calculator,Screen.Home)},onPoints={openDetail(Screen.Points,Screen.Home)},
                    onTips={openDetail(Screen.Tips,Screen.Home)},onAlerts={openDetail(Screen.Alerts,Screen.Home)}
                )
                Screen.Gear->EquipmentScreen(Modifier.padding(padding),items,{items=it;repo.saveItems(it)},{screen=Screen.Home},repo)
                Screen.Verify->VerifyScreen(repo,activeCheckMode,{mode->activeCheckMode=mode;repo.saveActiveCheckMode(mode)},{screen=Screen.Home})
                Screen.Planning->PlanningScreen(Modifier.padding(padding),items,{openDetail(Screen.Points,Screen.Planning)},{openDetail(Screen.Manual,Screen.Planning)})
                Screen.Journal->JournalScreen(Modifier.padding(padding),journal,{journal=it;repo.saveJournal(it)},repo)
                Screen.More->MoreScreen(Modifier.padding(padding)){destination->
                    val target=when(destination){
                        "Calculadora"->Screen.Calculator;"Pontos de apoio"->Screen.Points;"Alertas"->Screen.Alerts;"Dicas"->Screen.Tips;"Manual da Bike"->Screen.Manual
                        "Exportar / Backup"->Screen.Backup;"Configurações"->Screen.Settings;"Sobre"->Screen.About;else->Screen.More
                    }
                    if(target==Screen.More)screen=Screen.More else openDetail(target,Screen.More)
                }
                Screen.Calculator->CalculatorScreen(items,{screen=detailReturnScreen})
                Screen.Points->PointsScreen(points,{points=it;repo.savePoints(it)},repo,{screen=detailReturnScreen})
                Screen.Alerts->AlertsScreen(items,minimums,{minimums=it;repo.saveMinimums(it)},{screen=detailReturnScreen})
                Screen.Tips->TipsScreen(favoriteTips,{favoriteTips=it;repo.saveFavoriteTips(it)},{screen=detailReturnScreen})
                Screen.Manual->ManualBikeScreen(items,favoriteManual,masteredSkills,{favoriteManual=it;repo.saveFavoriteManual(it)},{masteredSkills=it;repo.saveMasteredSkills(it)},{screen=detailReturnScreen})
                Screen.Backup->BackupScreen(repo,items,{reloadPersistentState()},{screen=detailReturnScreen})
                Screen.Settings->SettingsScreen(settings,items.size,journal.size,points.size,{settings=it;repo.saveSettings(it)},{repo.clearAll();reloadPersistentState();screen=Screen.Home},{screen=detailReturnScreen})
                Screen.About->AboutScreen{screen=detailReturnScreen}
            }
        }
    }
}
