package com.nomaderaiz.app.ui

import android.app.DatePickerDialog
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.*
import java.time.LocalDate
import java.util.UUID
import kotlin.math.ceil

private const val PLANNING_LIST = "LIST"
private const val PLANNING_EDITOR = "EDITOR"
private const val PLANNING_DETAILS = "DETAILS"

@Composable
internal fun PlanningScreen(
    modifier: Modifier,
    equipment: List<EquipmentItem>,
    workspace: PlanningWorkspace,
    dispatch: (PlanningAction) -> Unit,
    onPoints: () -> Unit,
    onManual: () -> Unit,
    back: (() -> Unit)? = null
) {
    var view by rememberSaveable { mutableStateOf(PLANNING_LIST) }
    var selectedRouteId by rememberSaveable { mutableStateOf<String?>(null) }

    val selectedRoute = remember(workspace.routes, selectedRouteId) {
        workspace.routes.firstOrNull { it.id == selectedRouteId }
    }

    LaunchedEffect(selectedRouteId, workspace.routes) {
        if (selectedRouteId != null && selectedRoute == null) {
            selectedRouteId = null
            view = PLANNING_LIST
        }
    }

    fun returnToList(discardEditor: Boolean = false) {
        if (discardEditor) dispatch(PlanningAction.CancelEditing)
        selectedRouteId = null
        view = PLANNING_LIST
    }

    BackHandler(enabled = view != PLANNING_LIST) {
        returnToList(discardEditor = view == PLANNING_EDITOR)
    }

    when (view) {
        PLANNING_EDITOR -> PlanningRouteEditor(
            modifier = modifier,
            workspace = workspace,
            dispatch = dispatch,
            onPoints = onPoints,
            onCancel = { returnToList(discardEditor = true) },
            onSaved = { returnToList() }
        )

        PLANNING_DETAILS -> selectedRoute?.let { route ->
            PlanningRouteDetails(
                modifier = modifier,
                route = route,
                equipment = equipment,
                onManual = onManual,
                onBack = { returnToList() },
                onEdit = {
                    dispatch(PlanningAction.StartEditRoute(route.id))
                    view = PLANNING_EDITOR
                },
                onDuplicate = {
                    dispatch(PlanningAction.DuplicateRoute(route.id, UUID.randomUUID().toString(), System.currentTimeMillis()))
                    returnToList()
                },
                onDelete = {
                    dispatch(PlanningAction.DeleteRoute(route.id))
                    returnToList()
                },
                onUseSuggestion = { hours ->
                    dispatch(PlanningAction.StartEditRoute(route.id))
                    dispatch(PlanningAction.EditDraft { it.copy(hoursPerDay = hours.toInt().toString()) })
                    view = PLANNING_EDITOR
                }
            )
        } ?: returnToList()

        else -> PlanningRouteList(
            modifier = modifier,
            routes = workspace.routes,
            back = back,
            onCreate = {
                dispatch(PlanningAction.StartNewRoute)
                view = PLANNING_EDITOR
            },
            onOpen = { id ->
                selectedRouteId = id
                view = PLANNING_DETAILS
            }
        )
    }
}

@Composable
private fun PlanningRouteList(
    modifier: Modifier,
    routes: List<PlannedRoute>,
    back: (() -> Unit)?,
    onCreate: () -> Unit,
    onOpen: (String) -> Unit
) {
    val sorted = remember(routes) { routes.sortedByDescending { it.updatedAt } }
    LazyColumn(
        modifier.fillMaxSize().padding(horizontal = 14.dp).testTag("planning-routes-list"),
        contentPadding = PaddingValues(top = 6.dp, bottom = 20.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item { ScreenHeader("Planejar", "Suas rotas e estimativas", back) }
        item {
            Button(
                onClick = onCreate,
                modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp).testTag("planning-create-route")
            ) {
                Icon(Icons.Outlined.Add, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("CRIAR NOVA ROTA")
            }
        }

        if (sorted.isEmpty()) {
            item {
                SectionCard("Nenhuma rota cadastrada", Icons.Outlined.Map) {
                    Text("Crie sua primeira rota. Depois disso, o Planejar mostra apenas as viagens salvas e suas informações principais.")
                    Text(
                        "Os cálculos detalhados ficam dentro de cada rota, deixando esta tela mais rápida e limpa.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            item {
                Text(
                    "${sorted.size} ${if (sorted.size == 1) "rota cadastrada" else "rotas cadastradas"}",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(horizontal = 2.dp)
                )
            }
            items(sorted, key = { it.id }) { route ->
                RouteListCard(route = route, onClick = { onOpen(route.id) })
            }
        }
    }
}

@Composable
private fun RouteListCard(route: PlannedRoute, onClick: () -> Unit) {
    val plan = route.plan
    val estimate = remember(plan.km, plan.speedKmh, plan.hoursPerDay, plan.safetyMarginPercent) { plan.tripEstimate }
    val essentials = remember(plan.days, plan.people, plan.foodDailyCost, plan.waterDailyPerPerson, plan.energyDailyWh, estimate) {
        essentialResourceEstimate(plan)
    }
    val days = estimate?.days ?: plan.days.numberOrNull()?.let { ceil(it).toInt() }
    val arrival = remember(plan.departureDate, days) { days?.let { estimatedArrivalDate(plan.departureDate, it) } }

    OutlinedCard(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth().testTag("planning-route-${route.id}")
    ) {
        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(7.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Icon(Icons.Outlined.Map, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Column(Modifier.weight(1f)) {
                    Text(
                        plan.destination.ifBlank { "Rota sem nome" },
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        buildString {
                            plan.km.numberOrNull()?.let { append("${decimal(it)} km") }
                            days?.let { if (isNotEmpty()) append(" • "); append("$it dia(s)") }
                            if (isEmpty()) append("Toque para completar a rota")
                        },
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Icon(Icons.Outlined.ChevronRight, contentDescription = "Abrir rota")
            }

            estimate?.let {
                Text(
                    "${decimal(it.speedKmh)} km/h • ${decimal(it.hoursPerDay)} h/dia • ${decimal(it.dailyDistanceKm)} km/dia • margem ${it.safetyMarginPercent}%",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (plan.departureDate.isNotBlank()) {
                Text(
                    if (arrival != null) "${formatPlanningDate(plan.departureDate)} → ${formatPlanningDate(arrival)}"
                    else "Saída: ${formatPlanningDate(plan.departureDate)}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            if (essentials != null && listOf(essentials.foodCost, essentials.waterLiters, essentials.energyWh).any { it != null }) {
                Text(
                    buildList {
                        essentials.foodCost?.let { add(money(it)) }
                        essentials.waterLiters?.let { add("${decimal(it)} L") }
                        essentials.energyWh?.let { add("${decimal(it)} Wh") }
                    }.joinToString(" • "),
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
private fun PlanningRouteEditor(
    modifier: Modifier,
    workspace: PlanningWorkspace,
    dispatch: (PlanningAction) -> Unit,
    onPoints: () -> Unit,
    onCancel: () -> Unit,
    onSaved: () -> Unit
) {
    val draft = workspace.editorDraft
    val editing = workspace.editingRouteId != null
    val issues = remember(draft) { draft.issues }
    val estimate = remember(draft.km, draft.speedKmh, draft.hoursPerDay, draft.safetyMarginPercent) { draft.tripEstimate }
    val suggestion = remember(draft.km, draft.speedKmh, draft.safetyMarginPercent) { nomadRouteSuggestion(draft) }
    val essentials = remember(draft) { essentialResourceEstimate(draft) }
    var resourcesExpanded by rememberSaveable { mutableStateOf(false) }
    var advancedExpanded by rememberSaveable { mutableStateOf(false) }
    val focus = LocalFocusManager.current

    val changeDraft: (((PlanningDraft) -> PlanningDraft) -> Unit) = { transform ->
        dispatch(PlanningAction.EditDraft(transform))
    }

    Column(modifier.fillMaxSize().testTag("planning-editor")) {
        LazyColumn(
            Modifier.weight(1f).fillMaxWidth().padding(horizontal = 14.dp).testTag("planning-list"),
            contentPadding = PaddingValues(top = 6.dp, bottom = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item { ScreenHeader(if (editing) "Editar rota" else "Nova rota", "Destino, ritmo e estimativa", onCancel) }
            item { PlanningTripFields(draft, changeDraft) }
            item {
                PlanningRideFields(
                    draft = draft,
                    change = changeDraft,
                    setSafetyMargin = { value ->
                        focus.clearFocus(force = true)
                        dispatch(PlanningAction.SetSafetyMargin(value))
                    }
                )
            }
            item { LivePlanCard(draft, estimate) }
            suggestion?.let { item { NomadSuggestionCard(draft, it) { hours -> changeDraft { current -> current.copy(hoursPerDay = hours.toInt().toString()) } } } }

            item {
                OutlinedButton(
                    onClick = { resourcesExpanded = !resourcesExpanded },
                    modifier = Modifier.fillMaxWidth().testTag("planning-resources-toggle")
                ) {
                    Icon(Icons.Outlined.Backpack, contentDescription = null)
                    Spacer(Modifier.width(7.dp))
                    Text(if (resourcesExpanded) "RECOLHER RECURSOS" else "RECURSOS OPCIONAIS")
                }
            }
            if (resourcesExpanded) item { EssentialResourcesCard(draft, essentials, changeDraft) }

            item {
                TextButton(
                    onClick = { advancedExpanded = !advancedExpanded },
                    modifier = Modifier.fillMaxWidth().testTag("planning-advanced-toggle")
                ) {
                    Icon(Icons.Outlined.Tune, contentDescription = null)
                    Spacer(Modifier.width(7.dp))
                    Text(if (advancedExpanded) "OCULTAR OPÇÕES AVANÇADAS" else "OPÇÕES AVANÇADAS")
                }
            }
            if (advancedExpanded) {
                item { AdvancedPlanningFields(draft, changeDraft) }
                item {
                    val people = draft.people.wholeNumberOrNull() ?: 1
                    val food = remember(draft.foodForm, people) { Calculator.food(Calculator.buildFoodLines(foodConfigs, foodInputs(draft.foodForm), people)) }
                    SectionCard("Alimentação detalhada", Icons.Outlined.Restaurant) {
                        Text("Opcional. Use apenas se quiser controlar alimentos individualmente.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        FoodEditor(draft.foodForm, { foodForm -> changeDraft { it.copy(foodForm = foodForm) } }, people)
                        if (foodFormErrors(draft.foodForm).isEmpty() && food.valid) {
                            Text("Autonomia do inventário: ${food.days ?: 0} dia(s) • valor carregado: ${money(food.totalValue)}", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                        }
                    }
                }
                item { PlanningWaterFields(draft, changeDraft, onPoints) }
            }
        }

        Surface(tonalElevation = 2.dp, shadowElevation = 2.dp) {
            Column(Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    issues.firstOrNull() ?: if (editing) "Salve para atualizar esta rota." else "Salve para adicionar esta rota à sua lista.",
                    fontSize = 12.sp,
                    color = if (issues.isNotEmpty()) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant
                )
                Button(
                    onClick = {
                        focus.clearFocus()
                        dispatch(PlanningAction.SaveRoute(UUID.randomUUID().toString(), System.currentTimeMillis()))
                        onSaved()
                    },
                    enabled = issues.isEmpty(),
                    modifier = Modifier.fillMaxWidth().testTag("save-route")
                ) {
                    Icon(Icons.Outlined.CheckCircle, contentDescription = null)
                    Spacer(Modifier.width(7.dp))
                    Text(if (editing) "SALVAR ALTERAÇÕES" else "ADICIONAR ROTA")
                }
            }
        }
    }
}

@Composable
private fun PlanningRouteDetails(
    modifier: Modifier,
    route: PlannedRoute,
    equipment: List<EquipmentItem>,
    onManual: () -> Unit,
    onBack: () -> Unit,
    onEdit: () -> Unit,
    onDuplicate: () -> Unit,
    onDelete: () -> Unit,
    onUseSuggestion: (Double) -> Unit
) {
    val plan = route.plan
    val estimate = remember(plan.km, plan.speedKmh, plan.hoursPerDay, plan.safetyMarginPercent) { plan.tripEstimate }
    val essentials = remember(plan) { essentialResourceEstimate(plan) }
    val suggestion = remember(plan.km, plan.speedKmh, plan.safetyMarginPercent) { nomadRouteSuggestion(plan) }
    val result = remember(plan, equipment) { if (plan.issues.isEmpty()) buildPlanningResult(plan, equipment) else null }
    var showFullAnalysis by rememberSaveable { mutableStateOf(false) }
    var confirmDelete by rememberSaveable { mutableStateOf(false) }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text("Excluir rota?") },
            text = { Text("A rota ${plan.destination.ifBlank { "selecionada" }} será removida do Planejar.") },
            confirmButton = { TextButton(onClick = { confirmDelete = false; onDelete() }) { Text("EXCLUIR") } },
            dismissButton = { TextButton(onClick = { confirmDelete = false }) { Text("CANCELAR") } }
        )
    }

    LazyColumn(
        modifier.fillMaxSize().padding(horizontal = 14.dp).testTag("planning-details"),
        contentPadding = PaddingValues(top = 6.dp, bottom = 24.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        item { ScreenHeader(plan.destination.ifBlank { "Detalhes da rota" }, "Planejamento salvo", onBack) }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                FilledTonalButton(onClick = onEdit, modifier = Modifier.weight(1f).testTag("edit-route")) {
                    Icon(Icons.Outlined.Edit, contentDescription = null); Spacer(Modifier.width(5.dp)); Text("EDITAR")
                }
                OutlinedButton(onClick = onDuplicate, modifier = Modifier.weight(1f).testTag("duplicate-route")) {
                    Icon(Icons.Outlined.ContentCopy, contentDescription = null); Spacer(Modifier.width(5.dp)); Text("DUPLICAR")
                }
            }
        }
        item { RouteSummaryCard(plan, estimate, essentials) }
        suggestion?.let { item { NomadSuggestionCard(plan, it, onUseSuggestion, actionLabel = "EDITAR COM ESTA SUGESTÃO") } }

        item {
            OutlinedButton(onClick = { showFullAnalysis = !showFullAnalysis }, modifier = Modifier.fillMaxWidth().testTag("route-analysis-toggle")) {
                Icon(Icons.Outlined.Assessment, contentDescription = null)
                Spacer(Modifier.width(7.dp))
                Text(if (showFullAnalysis) "RECOLHER ANÁLISE COMPLETA" else "VER CUSTOS E RECOMENDAÇÕES")
            }
        }
        if (showFullAnalysis) {
            if (result != null) item { PlanningResultDetails(plan, result, onManual) }
            else item {
                SectionCard("Rota precisa de revisão", Icons.Outlined.WarningAmber) {
                    plan.issues.take(4).forEach { Text("• $it") }
                    Text("Edite a rota para completar os campos necessários.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
        item {
            TextButton(onClick = { confirmDelete = true }, modifier = Modifier.fillMaxWidth().testTag("delete-route")) {
                Icon(Icons.Outlined.DeleteOutline, contentDescription = null)
                Spacer(Modifier.width(7.dp))
                Text("EXCLUIR ROTA")
            }
        }
    }
}

@Composable
private fun RouteSummaryCard(draft: PlanningDraft, estimate: TripEstimate?, essentials: EssentialResourceEstimate?) {
    SectionCard("Resumo da rota", Icons.Outlined.Map) {
        if (estimate != null) {
            Text("${decimal(estimate.distanceKm)} km • ${estimate.days} dia(s)", fontSize = 21.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
            Text("${decimal(estimate.speedKmh)} km/h • ${decimal(estimate.hoursPerDay)} h/dia • ${decimal(estimate.dailyDistanceKm)} km/dia")
            Text("Pedal efetivo: ${decimal(estimate.theoreticalHours)} h • margem: ${estimate.safetyMarginPercent}%", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            estimatedArrivalDate(draft.departureDate, estimate.days)?.let {
                Text("${formatPlanningDate(draft.departureDate)} → ${formatPlanningDate(it)}", fontWeight = FontWeight.SemiBold)
            }
        } else {
            Text("Esta rota veio de uma versão anterior e precisa ser revisada para gerar a estimativa por ritmo.")
        }
        essentials?.let {
            HorizontalDivider()
            Text("Essenciais", fontWeight = FontWeight.Bold)
            it.foodCost?.let { value -> Text("Alimentação estimada: ${money(value)}") }
            it.waterLiters?.let { value -> Text("Consumo total de água: ${decimal(value)} L") }
            it.energyWh?.let { value -> Text("Energia estimada: ${decimal(value)} Wh") }
            if (it.waterLiters != null) Text("Água é consumo total da viagem; não significa carregar todo esse volume de uma vez.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun PlanningTripFields(draft: PlanningDraft, change: ((PlanningDraft) -> PlanningDraft) -> Unit) {
    val context = LocalContext.current
    SectionCard("1. Para onde você vai?", Icons.Outlined.Explore) {
        OutlinedTextField(
            draft.destination,
            { value -> change { it.copy(destination = value) } },
            label = { Text("Destino (opcional)") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            NumericField(draft.km, { value -> change { it.copy(km = value) } }, "Distância prevista", Modifier.weight(1.35f), positive = true, unit = "km")
            NumericField(draft.people, { value -> change { it.copy(people = value) } }, "Pessoas", Modifier.weight(.75f), whole = true, positive = true)
        }
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            OutlinedButton(
                onClick = {
                    val base = parsePlanningDate(draft.departureDate) ?: LocalDate.now()
                    DatePickerDialog(
                        context,
                        { _, year, month, day -> change { it.copy(departureDate = LocalDate.of(year, month + 1, day).toString()) } },
                        base.year,
                        base.monthValue - 1,
                        base.dayOfMonth
                    ).show()
                },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Outlined.CalendarMonth, contentDescription = null)
                Spacer(Modifier.width(6.dp))
                Text(if (draft.departureDate.isBlank()) "DATA DE SAÍDA" else formatPlanningDate(draft.departureDate))
            }
            if (draft.departureDate.isNotBlank()) {
                IconButton(onClick = { change { it.copy(departureDate = "") } }) {
                    Icon(Icons.Outlined.Close, contentDescription = "Remover data de saída")
                }
            }
        }
    }
}

@Composable
private fun PlanningRideFields(
    draft: PlanningDraft,
    change: ((PlanningDraft) -> PlanningDraft) -> Unit,
    setSafetyMargin: (Int) -> Unit
) {
    SectionCard("2. Como quer pedalar?", Icons.Outlined.DirectionsBike) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            NumericField(draft.speedKmh, { value -> change { it.copy(speedKmh = value) } }, "Velocidade média", Modifier.weight(1f), positive = true, unit = "km/h")
            NumericField(draft.hoursPerDay, { value -> change { it.copy(hoursPerDay = value) } }, "Horas/dia", Modifier.weight(1f), positive = true, unit = "h")
        }
        Text("Use a média que espera manter enquanto estiver pedalando; paradas entram na margem.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text("Margem de segurança", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf(0 to "0%", 10 to "+10%", 20 to "+20%").forEach { (value, label) ->
                Button(
                    onClick = { setSafetyMargin(value) },
                    modifier = Modifier.weight(1f).heightIn(min = 46.dp).testTag("planning-margin-$value"),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (draft.safetyMarginPercent == value) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
                        contentColor = if (draft.safetyMarginPercent == value) MaterialTheme.colorScheme.onPrimaryContainer else MaterialTheme.colorScheme.onSurfaceVariant
                    ),
                    contentPadding = PaddingValues(horizontal = 6.dp, vertical = 8.dp)
                ) { Text(label, fontWeight = if (draft.safetyMarginPercent == value) FontWeight.Bold else FontWeight.Medium, fontSize = 13.sp) }
            }
        }
        Text(
            "Margem atual: ${if (draft.safetyMarginPercent == 0) "0%" else "+${draft.safetyMarginPercent}%"}",
            modifier = Modifier.testTag("planning-margin-current"),
            fontWeight = FontWeight.SemiBold,
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.primary
        )
    }
}

@Composable
private fun LivePlanCard(draft: PlanningDraft, estimate: TripEstimate?) {
    SectionCard("Estimativa", Icons.Outlined.Assessment) {
        if (estimate == null) {
            Text("Informe distância, velocidade média e horas por dia para calcular a rota.", color = MaterialTheme.colorScheme.onSurfaceVariant)
            return@SectionCard
        }
        Text("${estimate.days} dia(s)", fontSize = 22.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
        Row(Modifier.fillMaxWidth()) {
            Metric("${decimal(estimate.dailyDistanceKm)} km", "por dia", Modifier.weight(1f))
            Metric("${decimal(estimate.theoreticalHours)} h", "pedal", Modifier.weight(1f))
            Metric("${decimal(estimate.lastDayHours)} h", "último dia", Modifier.weight(1f))
        }
        Text("A ${decimal(estimate.speedKmh)} km/h por ${decimal(estimate.hoursPerDay)} h/dia, a referência é ${decimal(estimate.dailyDistanceKm)} km/dia.", fontSize = 13.sp)
        estimatedArrivalDate(draft.departureDate, estimate.days)?.let { arrival ->
            Text("Saindo em ${formatPlanningDate(draft.departureDate)}, chegada estimada em ${formatPlanningDate(arrival)}.", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
        }
    }
}

@Composable
private fun NomadSuggestionCard(
    draft: PlanningDraft,
    suggestion: NomadRouteSuggestion,
    apply: (Double) -> Unit,
    actionLabel: String = "USAR SUGESTÃO"
) {
    val current = draft.hoursPerDay.numberOrNull()
    val same = current != null && kotlin.math.abs(current - suggestion.hoursPerDay) < 0.01
    SectionCard("Sugestão do Nômade", Icons.Outlined.Lightbulb) {
        Text(suggestion.reason, fontSize = 13.sp)
        Text(
            "${decimal(suggestion.hoursPerDay)} h/dia → ${decimal(suggestion.estimate.dailyDistanceKm)} km/dia → cerca de ${suggestion.estimate.days} dia(s)",
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        Text("É uma referência de planejamento. Terreno, clima, paradas e seu ritmo real podem mudar o resultado.", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        FilledTonalButton(onClick = { apply(suggestion.hoursPerDay) }, enabled = !same, modifier = Modifier.fillMaxWidth().testTag("apply-nomad-suggestion")) {
            Text(if (same) "SUGESTÃO JÁ APLICADA" else actionLabel)
        }
    }
}

@Composable
private fun EssentialResourcesCard(draft: PlanningDraft, estimate: EssentialResourceEstimate?, change: ((PlanningDraft) -> PlanningDraft) -> Unit) {
    SectionCard("Recursos da rota", Icons.Outlined.Backpack) {
        Text("Opcional. Só os três cálculos essenciais ficam aqui.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        NumericField(
            draft.foodDailyCost, { value -> change { it.copy(foodDailyCost = value) } },
            "Alimentação por pessoa/dia", money = true, positive = true,
            helper = estimate?.foodCost?.let { "Total para a viagem: ${money(it)}" }
        )
        NumericField(
            draft.waterDailyPerPerson, { value -> change { it.copy(waterDailyPerPerson = value) } },
            "Água por pessoa/dia", positive = true, unit = "L/pessoa/dia",
            helper = estimate?.waterLiters?.let { "Consumo total: ${decimal(it)} L" }
        )
        NumericField(
            draft.energyDailyWh, { value -> change { it.copy(energyDailyWh = value) } },
            "Consumo de energia do grupo", positive = true, unit = "Wh/dia",
            helper = estimate?.energyWh?.let { "Necessidade estimada: ${decimal(it)} Wh" }
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun AdvancedPlanningFields(draft: PlanningDraft, change: ((PlanningDraft) -> PlanningDraft) -> Unit) {
    SectionCard("Opções avançadas", Icons.Outlined.Tune) {
        Text("Campos antigos continuam disponíveis sem ocupar a tela principal.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        NumericField(draft.availableMoney, { value -> change { it.copy(availableMoney = value) } }, "Dinheiro disponível", money = true)
        Text("Tipo de viagem", fontWeight = FontWeight.SemiBold)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            TravelType.entries.forEach { travel ->
                FilterChip(selected = draft.type == travel, onClick = { change { it.copy(type = travel) } }, label = { Text(travel.label) })
            }
        }
        NumericField(draft.dailyKm, { value -> change { it.copy(dailyKm = value) } }, "Meta manual de km/dia", positive = true, helper = "Compatibilidade com planos antigos.", unit = "km/dia")
        NumericField(draft.days, { value -> change { it.copy(days = value) } }, "Duração manual", positive = true, helper = "Compatibilidade com planos antigos.", unit = "dias")
    }
}

@Composable
private fun PlanningWaterFields(draft: PlanningDraft, change: ((PlanningDraft) -> PlanningDraft) -> Unit, onPoints: () -> Unit) {
    val water = remember(draft.waterLiters, draft.refill, draft.refillFrequency, draft.people, draft.waterDailyPerPerson) {
        Calculator.water(
            draft.waterLiters.numberOrNull() ?: 0.0,
            draft.refill,
            draft.refillFrequency.numberOrNull() ?: 0.0,
            draft.people.wholeNumberOrNull() ?: 1,
            litersPerPersonDay = draft.waterDailyPerPerson.numberOrNull()?.takeIf { it > 0 } ?: Calculator.WATER_PER_PERSON_DAY
        )
    }
    SectionCard("Água carregada e reabastecimento", Icons.Outlined.WaterDrop) {
        Text("Opcional. Compara a água que levará com o consumo planejado.", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        NumericField(draft.waterLiters, { value -> change { it.copy(waterLiters = value) } }, "Água carregada", unit = "L")
        Row(verticalAlignment = Alignment.CenterVertically) { Switch(draft.refill, { value -> change { it.copy(refill = value) } }); Text(" Planejo reabastecer") }
        if (draft.refill) {
            NumericField(draft.refillFrequency, { value -> change { it.copy(refillFrequency = value) } }, "Intervalo entre reabastecimentos", positive = true, unit = "dias")
            OutlinedTextField(draft.waterPlaces, { value -> change { it.copy(waterPlaces = value) } }, label = { Text("Locais previstos para água") }, modifier = Modifier.fillMaxWidth())
            OutlinedButton(onClick = onPoints, modifier = Modifier.fillMaxWidth()) { Icon(Icons.Outlined.Place, contentDescription = null); Text(" PONTOS DE APOIO") }
        }
        if (numberError(draft.waterLiters) == null && draft.waterLiters.isNotBlank() && draft.people.wholeNumberOrNull()?.let { it > 0 } == true) {
            Text("Consumo do grupo: ${decimal(water.consumoDia)} L/dia • autonomia carregada: ${decimal(water.dias)} dia(s)", fontSize = 13.sp)
        }
    }
}

@Composable
private fun PlanningResultDetails(draft: PlanningDraft, result: PlanningResult, onManual: () -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        result.essential?.let { essential ->
            SectionCard("Resumo essencial", Icons.Outlined.Assessment) {
                Text("Duração usada: ${essential.days} dia(s) • ${essential.people} pessoa(s)", fontSize = 13.sp)
                essential.foodCost?.let { Text("Alimentação: ${money(it)}") }
                essential.waterLiters?.let { Text("Água planejada: ${decimal(it)} L") }
                essential.energyWh?.let { Text("Energia planejada: ${decimal(it)} Wh") }
            }
        }
        SectionCard("Custos e reservas", Icons.Outlined.Payments) {
            Text("Equipamentos pendentes: ${money(result.pendingCost)}")
            Text("Alimentação necessária: ${money(result.foodRequired)}")
            if (result.foodNeed.missingValue > 0 && result.essential?.foodCost == null) Text("Falta comprar em alimentação: ${money(result.foodNeed.missingValue)}")
            Text("Reserva financeira (${(draft.type.reservePercent * 100).toInt()}%): ${money(result.reserve)}")
            Text("Custo total estimado: ${money(result.totalCost)}", fontWeight = FontWeight.Bold)
        }
        SectionCard("Energia pelo inventário", Icons.Outlined.Bolt) {
            val energy = result.energy
            Text("Painel: ${if (energy.hasPanel) "sim" else "não"} • reserva: ${if (energy.hasBattery) "sim" else "não"}")
            Text("Consumo automático: ${decimal(energy.dailyConsumptionWh)} Wh/dia • geração: ${decimal(energy.dailyGenerationWh)} Wh/dia")
            Text(if (energy.selfSustaining) "Sistema autossustentável" else "Autonomia estimada do inventário: ${decimal(energy.days ?: 0.0)} dia(s)")
        }
        SectionCard("Segurança e abrigo", Icons.Outlined.Shield) {
            result.safety.forEach { essential ->
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(if (essential.bought) Icons.Outlined.CheckCircle else Icons.Outlined.WarningAmber, contentDescription = null)
                    Text(essential.label)
                }
            }
            Text("Abrigo: ${if (!result.shelterRequired) "dispensável para este perfil" else "${result.boughtShelter}/${result.shelterCount} adquirido(s)"}")
            OutlinedButton(onClick = onManual, modifier = Modifier.fillMaxWidth()) { Text("ABRIR MANUAL DA BIKE") }
        }
        SectionCard("Recomendações", Icons.Outlined.Lightbulb) {
            result.recommendations.forEach { r ->
                Text("• ${r.text}", color = if (r.type == RecommendationType.ALERTA) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurface)
            }
        }
    }
}
