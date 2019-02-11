import {isDue, daysToDueDate, calculateBurnout, calculateCaseBurnout} from '../common/common.js';

export function latamNextUpdate(caseBody, reportBody) {
	if (reportBody) {
		updateLATAMQueueReport(reportBody)
		updateLATAMQueueDefectsReport(reportBody)
	}
	highlighRegionalAccountAffinity()
}


function highlighRegionalAccountAffinity() {
	Array.from(document.getElementsByClassName("x-grid3-col-00N34000005giDv")).forEach(
		function(element, index, array) {
			var texto = element.textContent
			texto = texto.replace(/\[AR\] /g,"")
			if (texto === "NA - South" || texto === "NA - East" || texto === "NA - North" || texto.indexOf("LATAM")>=0 ) {
				element.textContent = "[AR] " + texto;
				element.style = "font-weight: bold; color: #B4DCFD; background-color: #001f3f;"
			} else if (texto.indexOf("APAC")>=0 ) {
				element.style = "color: #ddd;"
			}
		}
	);
}

function updateLATAMQueueDefectsReport(reportBody) {
	try {
		if (! reportBody.hasAttribute('data-latamrep')) {
			let titleNode = reportBody.querySelector(".noSecondHeader.pageType")
			if (titleNode.innerText === "LATAM Active Queue and Defects") {

				var tabla = reportBody.querySelector(".reportTable.tabularReportTable")
				var resumen = []
				if (tabla) {
					let filas = tabla.getElementsByTagName("tr")
					let currentName = ""
					let currentHeaderNode = null
					let currentCaseCounts = {
						escalado: 0,
						undispatched: 0,
						S1: 0,
						S2: 0,
						S3: 0,
						S4: 0,
						total: 0
					}
					for (var i = 0; i < filas.length; i++) {
						var fila = filas[i]
						if (fila.className === "breakRowClass0 breakRowClass0Top") {
							if (currentHeaderNode) {
								resumen.push(currentCaseCounts)
								const nameID = currentCaseCounts.name.replace(/ /g,"_").toUpperCase()
								currentHeaderNode.innerHTML = `<span id="member_row_${nameID}"><strong><a href="#member_row_${nameID}"><img src="https://na29.salesforce.com/EXT/theme/sfdc/images/grid/col-move-bottom.gif" style="transform: translateY(25%);background: white;padding: 5px;border-radius: 12px;margin: 0;"/></a> ${currentCaseCounts.name} | TOTAL: ${currentCaseCounts.total} | ESCALADOS: ${currentCaseCounts.escalado}</strong> | S1: ${currentCaseCounts.S1} | S2: ${currentCaseCounts.S2} | S3: ${currentCaseCounts.S3} | S4: ${currentCaseCounts.S4}</span>`
							}
							currentName = fila.getElementsByClassName("groupvalue")[0].textContent
							currentHeaderNode = fila.children[1]
							currentHeaderNode.style = "color: #FFDC00; background-color: #001F3F; font-size: 1.2em; line-height: 2.5em;"
							fila.children[0].style = "color: #FFDC00; background-color: #001F3F; font-size: 1.2em; line-height: 2.5em;"
							fila.children[0].innerText = ""
							currentCaseCounts = { name: currentName, escalado: 0, undispatched: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0, defects: 0, dued: 0, dueToday: 0 }
						} else if (fila.className === "grandTotal grandTotalTop" || fila.className === "grandTotal" ) {
							if (currentHeaderNode) {
								resumen.push(currentCaseCounts)
								const nameID = currentCaseCounts.name.replace(/ /g,"_").toUpperCase()
								currentHeaderNode.innerHTML = `<span id="member_row_${nameID}"><strong>
									<a href="#member_row_${nameID}"><img src="https://na29.salesforce.com/EXT/theme/sfdc/images/grid/col-move-bottom.gif" style="transform: translateY(25%);background: white;padding: 5px;border-radius: 12px;margin: 0;"/></a> ${currentCaseCounts.name} | TOTAL: ${currentCaseCounts.total} | ESCALADOS: ${currentCaseCounts.escalado}</strong> | S1: ${currentCaseCounts.S1} | S2: ${currentCaseCounts.S2} | S3: ${currentCaseCounts.S3} | S4: ${currentCaseCounts.S4}</span>`
							}
							currentHeaderNode = null
						} else if (fila.className === "even" || fila.className === "odd") {
							// Cases
							currentCaseCounts.total ++
							var severity = fila.children[2].textContent
							var isEscalated = fila.children[3] && fila.children[3].children[0] && fila.children[3].children[0].title === "Checked"
							var isDispatchComplete = fila.children[4] && fila.children[4].children[0] && fila.children[4].children[0].title === "Checked" 
							currentCaseCounts[severity] ++
							if (isEscalated) {
								currentCaseCounts.escalado ++
							}
							if (! isDispatchComplete) {
								currentCaseCounts.undispatched ++
							}

							const status = fila.children[6].textContent
							if (status==="Defect/ER Submitted") {
								currentCaseCounts.defects ++
							}



							var nextUpdateDue = fila.children[7].textContent
							if (isDue(nextUpdateDue)) {
								//#FFFFFF on #FF4136
				               fila.children[7].style.backgroundColor="#FF4136";
							   fila.children[7].style.color="#FFFFFF";
							   currentCaseCounts.dued ++
							} else if (daysToDueDate(nextUpdateDue) <= 0) {
								fila.children[7].style.backgroundColor="#c93";
							    fila.children[7].style.color="#FFFFFF";
								currentCaseCounts.dueToday ++
							}
							
							// export function calculateCaseBurnout(severity, isEscalated, isAIR, dueDate, isDispatchComplete) {
							// currentCaseCounts.b = calculateCaseBurnout(severity, )

							// currentCaseCounts.b = calculateCaseBurnout(severity, isEscalated, isAIR, nextUpdateDue, isDispatchComplete)
						}
					}
				}
				var resumenNode = reportBody.querySelector(".progressIndicator")
				var totalCaseCounts = { escalado: 0, undispatched: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0, defects:0, dued:0, dueToday:0 } 
				var resumenNodeInnerHTML = `
					<div class="latam-summary-container">
					<table class="list" border="0" cellspacing="0" cellpadding="0">
						<tbody>
							<tr class="headerRow">
								<th scope="col" class=" cellCol1 zen-deemphasize">User</th>
								<th scope="col" class=" cellCol1 zen-deemphasize">Total</th>
								<th scope="col" class=" cellCol2 zen-deemphasize">Escalados</th>
								<th scope="col" class=" cellCol2 zen-deemphasize">No Despachados</th>
								<th scope="col" class=" cellCol2 zen-deemphasize">Defects</th>
								<th scope="col" class=" cellCol2 zen-deemphasize">Due</th>
								<th scope="col" class=" cellCol2 zen-deemphasize">Due Today</th>
								<th scope="col" class=" cellCol3 zen-deemphasize">S1</th>
								<th scope="col" class=" cellCol4 zen-deemphasize">S2</th>
								<th scope="col" class=" cellCol5 zen-deemphasize">S3</th>
								<th scope="col" class=" cellCol6 zen-deemphasize">S4</th>
							</tr>`
				resumen.sort(function(a, b){return b.total-a.total});
				for (var i = 0; i < resumen.length; i++) {
					totalCaseCounts.escalado += resumen[i].escalado
					totalCaseCounts.total += resumen[i].total
					totalCaseCounts.undispatched += resumen[i].undispatched
					totalCaseCounts.defects += resumen[i].defects
					totalCaseCounts.due += resumen[i].dued
					totalCaseCounts.dueToday += resumen[i].dueToday
					totalCaseCounts.S1 += resumen[i].S1
					totalCaseCounts.S2 += resumen[i].S2
					totalCaseCounts.S3 += resumen[i].S3
					totalCaseCounts.S4 += resumen[i].S4
					const nameID = resumen[i].name.replace(/ /g,"_").toUpperCase()
					resumenNodeInnerHTML += `
						<tr class="dataRow">
							<td class=" dataCell "><a href="#member_row_${nameID}">${resumen[i].name}</a></td>
							<td class=" dataCell booleanColumn ">${resumen[i].total}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].escalado}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].undispatched}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].defects}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].dued}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].dueToday}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].S1}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].S2}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].S3}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].S4}</td>
						</tr>`
				}

				resumenNodeInnerHTML += `
					<tr class="dataRow" style="font-weight: 900;font-size: larger;">
						<td class=" dataCell cellCol1 ">TOTAL</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.total}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.escalado}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.undispatched}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.defects}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.dued}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.dueToday}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S1}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S2}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S3}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S4}</td>
					</tr>
					</tbody></table></div><div class="clearingBox"></div>`
				resumenNode.innerHTML = resumenNodeInnerHTML

				// reportBody.querySelector(".reportParameters").style.display = "none"
				// reportBody.querySelector(".reportHeader").style.display = "none"
				titleNode.textContent = "LATAM Active Queue and Defects (ʘ‿ʘ)";
				reportBody.setAttribute('data-latamrep','');
			}
		}
	} catch (err) {
		console.error('Error in updateLATAMQueueDefectsReport', err)
	}
}

function updateLATAMQueueReport(reportBody) {
	try {
		if (! reportBody.hasAttribute('data-latamrep')) {
			let titleNode = reportBody.querySelector(".noSecondHeader.pageType")
			if (titleNode.innerText === "Support LATAM Queue") {

				var tabla = reportBody.querySelector(".reportTable.tabularReportTable")
				var resumen = []
				if (tabla) {
					let filas = tabla.getElementsByTagName("tr")
					let currentName = ""
					let currentHeaderNode = null
					let currentCaseCounts = {
						escalado: 0,
						undispatched: 0,
						S1: 0,
						S2: 0,
						S3: 0,
						S4: 0,
						due: 0,
						closeDue: 0,
						total: 0,
						b: 0
					}
					for (var i = 0; i < filas.length; i++) {
						var fila = filas[i]
						if (fila.className === "breakRowClass0 breakRowClass0Top") {
							if (currentHeaderNode) {
								// currentCaseCounts.b = calculateBurnout(currentCaseCounts.S1, currentCaseCounts.S2, currentCaseCounts.S3, currentCaseCounts.S4, currentCaseCounts.escalado, (currentCaseCounts["Awaiting Internal Response"] ? currentCaseCounts["Awaiting Internal Response"] : 0), currentCaseCounts.due, currentCaseCounts.closeDue)
								resumen.push(currentCaseCounts)
								const nameID = currentCaseCounts.name.replace(/ /g,"_").toUpperCase()
								currentHeaderNode.innerHTML = `<span id="member_row_${nameID}"><strong><a href="#latam-summary-container"><img src="https://na29.salesforce.com/EXT/theme/sfdc/images/grid/col-move-bottom.gif" style="transform: translateY(25%);background: white;padding: 5px;border-radius: 12px;margin: 0;"/></a> ${currentCaseCounts.name} | TOTAL: ${currentCaseCounts.total} | ESCALADOS: ${currentCaseCounts.escalado}</strong> | S1: ${currentCaseCounts.S1} | S2: ${currentCaseCounts.S2} | S3: ${currentCaseCounts.S3} | S4: ${currentCaseCounts.S4}</span>`
							}
							currentName = fila.getElementsByClassName("groupvalue")[0].textContent
							currentHeaderNode = fila.children[1]
							currentHeaderNode.style = "color: #FFDC00; background-color: #001F3F; font-size: 1.2em; line-height: 2.5em;"
							fila.children[0].style = "color: #FFDC00; background-color: #001F3F; font-size: 1.2em; line-height: 2.5em;"
							fila.children[0].innerText = ""
							currentCaseCounts = { name: currentName, escalado: 0, awaiting: 0, undispatched: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0, due: 0, closeDue: 0, b: 0 }
						} else if (fila.className === "grandTotal grandTotalTop" || fila.className === "grandTotal" ) {
							if (currentHeaderNode) {
								// currentCaseCounts.b = calculateBurnout(currentCaseCounts.S1, currentCaseCounts.S2, currentCaseCounts.S3, currentCaseCounts.S4, currentCaseCounts.escalado, (currentCaseCounts["Awaiting Internal Response"] ? currentCaseCounts["Awaiting Internal Response"] : 0), currentCaseCounts.due, currentCaseCounts.closeDue)
								resumen.push(currentCaseCounts)
								const nameID = currentCaseCounts.name.replace(/ /g,"_").toUpperCase()
								currentHeaderNode.innerHTML = `<span id="member_row_${nameID}"><strong>
									<a href="#latam-summary-container"><img src="https://na29.salesforce.com/EXT/theme/sfdc/images/grid/col-move-bottom.gif" style="transform: translateY(25%);background: white;padding: 5px;border-radius: 12px;margin: 0;"/></a> ${currentCaseCounts.name} | TOTAL: ${currentCaseCounts.total} | ESCALADOS: ${currentCaseCounts.escalado}</strong> | S1: ${currentCaseCounts.S1} | S2: ${currentCaseCounts.S2} | S3: ${currentCaseCounts.S3} | S4: ${currentCaseCounts.S4}</span>`
							}
							currentHeaderNode = null
						} else if (fila.className === "even" || fila.className === "odd") {
							// Cases
							currentCaseCounts.total ++
							const severity = fila.children[2].textContent
							const status = fila.children[6].textContent
							const isEscalated = fila.children[3] && fila.children[3].children[0] && fila.children[3].children[0].title === "Checked"
							const isDispatchComplete = fila.children[4] && fila.children[4].children[0] && fila.children[4].children[0].title === "Checked"
							const nextUpdateDue = fila.children[7].textContent
							const isAIR = status === "Awaiting Internal Response"
							
							currentCaseCounts[severity] ++
							if (isEscalated) {
								currentCaseCounts.escalado ++
							}
							if (! isDispatchComplete) {
								currentCaseCounts.undispatched ++
							}
							if (currentCaseCounts[status]) {
								currentCaseCounts[status] ++
							} else {
								currentCaseCounts[status] = 1
							}

							if (isDue(nextUpdateDue)) {
								//#FFFFFF on #FF4136
				               fila.children[7].style.backgroundColor="#FF4136";
							   fila.children[7].style.color="#FFFFFF";
							   currentCaseCounts.due ++
							} else if (daysToDueDate(nextUpdateDue) <= 0) {
							    fila.children[7].style.backgroundColor="#c93";
							    fila.children[7].style.color="#FFFFFF";
								currentCaseCounts.closeDue ++
							}
							const b = calculateCaseBurnout(severity, isEscalated, isAIR, nextUpdateDue, isDispatchComplete)
							currentCaseCounts.b += b
							fila.children[16].textContent = b
							fila.className = `b-${Math.floor(b/3)}`
						}
					}
				}
				var resumenNode = reportBody.querySelector(".progressIndicator")
				var totalCaseCounts = { escalado: 0, awaiting: 0, undispatched: 0, S1: 0, S2: 0, S3: 0, S4: 0, due:0, closeDue:0, total: 0 } 
				var resumenNodeInnerHTML = `
					<div class="latam-summary-container" id="latam-summary-container">
					<table class="list" border="0" cellspacing="0" cellpadding="0">
						<tbody>
							<tr class="headerRow">
								<th scope="col" class="zen-deemphasize">User</th>
								<th scope="col" class="zen-deemphasize">Tot</th>
								<th scope="col" class="zen-deemphasize">Esc</th>
								<th scope="col" class="zen-deemphasize">Dis</th>
								<th scope="col" class="zen-deemphasize">AIR</th>
								<th scope="col" class="zen-deemphasize">S1</th>
								<th scope="col" class="zen-deemphasize">S2</th>
								<th scope="col" class="zen-deemphasize">S3</th>
								<th scope="col" class="zen-deemphasize">S4</th>
								<th scope="col" class="zen-deemphasize">Due</th>
								<th scope="col" class="zen-deemphasize">CDue</th>
								<th scope="col" class="zen-deemphasize">B</th>
							</tr>`
				resumen.sort(function(a, b){return b.b-a.b});
				for (var i = 0; i < resumen.length; i++) {
					totalCaseCounts.escalado += resumen[i].escalado
					totalCaseCounts.total += resumen[i].total
					totalCaseCounts.undispatched += resumen[i].undispatched
					totalCaseCounts.awaiting += resumen[i]["Awaiting Internal Response"] ? resumen[i]["Awaiting Internal Response"] : 0
					totalCaseCounts.S1 += resumen[i].S1
					totalCaseCounts.S2 += resumen[i].S2
					totalCaseCounts.S3 += resumen[i].S3
					totalCaseCounts.S4 += resumen[i].S4
					totalCaseCounts.due += resumen[i].due
					totalCaseCounts.closeDue += resumen[i].closeDue
					const nameID = resumen[i].name.replace(/ /g,"_").toUpperCase()
					// const sp = calculateBurnout(resumen[i].S1, resumen[i].S2, resumen[i].S3, resumen[i].S4, resumen[i].escalado, (resumen[i]["Awaiting Internal Response"] ? resumen[i]["Awaiting Internal Response"] : 0), resumen[i].due, resumen[i].closeDue)
					resumenNodeInnerHTML += `
						<tr class="dataRow">
							<td class=" dataCell "><a href="#member_row_${nameID}">${resumen[i].name}</a></td>
							<td class=" dataCell booleanColumn ">${resumen[i].total}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].escalado}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].undispatched}</td>
							<td class=" dataCell booleanColumn ">${resumen[i]["Awaiting Internal Response"] ? resumen[i]["Awaiting Internal Response"] : 0}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].S1}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].S2}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].S3}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].S4}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].due}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].closeDue}</td>
							<td class=" dataCell booleanColumn ">${resumen[i].b}</td>
						</tr>`
				}

				resumenNodeInnerHTML += `
					<tr class="dataRow" style="font-weight: 900;font-size: larger;">
						<td class=" dataCell cellCol1 ">TOTAL</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.total}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.escalado}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.undispatched}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.awaiting}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S1}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S2}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S3}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S4}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.due}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.closeDue}</td>
						<td class=" dataCell booleanColumn "></td>
					</tr>
					</tbody></table></div><div class="clearingBox"></div>`
				resumenNode.innerHTML = resumenNodeInnerHTML

				// reportBody.querySelector(".reportParameters").style.display = "none"
				// reportBody.querySelector(".reportHeader").style.display = "none"
				titleNode.textContent = "Support LATAM Queue (ʘ‿ʘ)";
				reportBody.setAttribute('data-latamrep','');
			}
		}
	} catch (err) {
		console.error('Error in updateLATAMQueueReport', err)
	}
}