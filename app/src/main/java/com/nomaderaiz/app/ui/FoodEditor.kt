package com.nomaderaiz.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nomaderaiz.app.data.*

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun FoodEditor(form:Map<String,FoodFormValue>,onChange:(Map<String,FoodFormValue>)->Unit,people:Int){
    var expanded by rememberSaveable{mutableStateOf<String?>(null)}
    Column(verticalArrangement=Arrangement.spacedBy(6.dp)){
        foodConfigs.forEach{food->
            key(food.id){
                val current=form[food.id]?:FoodFormValue(unitId=food.units.first().id)
                val selected=food.units.firstOrNull{it.id==current.unitId}?:food.units.first()
                val hasError=numberError(current.quantity)!=null||numberError(current.price)!=null||numberError(current.consumption,positive=true)!=null
                Card(Modifier.fillMaxWidth()){
                    Row(
                        Modifier.fillMaxWidth().testTag("food-${food.id}").clickable(role=Role.Button){expanded=if(expanded==food.id)null else food.id}.padding(10.dp),
                        verticalAlignment=Alignment.CenterVertically,horizontalArrangement=Arrangement.spacedBy(8.dp)
                    ){
                        AppSymbol(food.icon)
                        Column(Modifier.weight(1f)){
                            Text(food.name,fontWeight=FontWeight.Bold)
                            Text(if(hasError)"Revise os valores" else if(current.quantity.isBlank())"Toque para informar" else "${current.quantity} ${selected.label}",fontSize=12.sp,color=if(hasError)MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Icon(if(expanded==food.id)Icons.Default.ExpandLess else Icons.Default.ExpandMore,if(expanded==food.id)"Recolher ${food.name}" else "Editar ${food.name}")
                    }
                    if(expanded==food.id){
                        Column(Modifier.padding(start=10.dp,end=10.dp,bottom=10.dp),verticalArrangement=Arrangement.spacedBy(6.dp)){
                            if(food.units.size>1)FlowRow(horizontalArrangement=Arrangement.spacedBy(4.dp)){
                                food.units.forEach{unit->FilterChip(selected=selected.id==unit.id,onClick={onChange(form+(food.id to current.copy(unitId=unit.id,price="",consumption="")))},label={Text(unit.label)})}
                            }
                            NumericField(current.quantity,{onChange(form+(food.id to current.copy(quantity=it)))},"Quantidade (${selected.label})")
                            NumericField(current.price,{onChange(form+(food.id to current.copy(price=it)))},"Preço por unidade (R$)",helper="Em branco: ${money(selected.defaultPrice)} por ${selected.label}.")
                            NumericField(current.consumption,{onChange(form+(food.id to current.copy(consumption=it)))},"Consumo por pessoa/dia",positive=true,helper="Em branco: ${decimal(selected.defaultDailyConsumption)} ${selected.label} por pessoa/dia.")
                            if(people>1)Text("Consumo calculado para $people pessoas.",fontSize=12.sp)
                        }
                    }
                }
            }
        }
    }
}
