import {isDue, daysToDueDate} from '../common/common.js';

export function latamNextUpdate(caseBody, reportBody) {
	if (reportBody) {
		updateLATAMQueueReport(reportBody)
		updateLATAMQueueDefectsReport(reportBody)
	}
  updateBASegments()
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
							// if (["Adrian Martin", "Alejandro Dobniewski", "Adrian E. Pineyro"].includes(currentName)) {
							// 	fila.children[0].style = "color: #111111; background-color: #7FDBFF; font-size: 1.2em; line-height: 2.5em;"
							// 	currentHeaderNode.style = "color: #111111; background-color: #7FDBFF; font-size: 1.2em; line-height: 2.5em;"
							// } else if (["Arianna Flores", "Martin Kociman", "Natalia Campos"].includes(currentName)) {
							// 	currentHeaderNode.style = "color: #01FF70; background-color: #85144B; font-size: 1.2em; line-height: 2.5em;"
							// 	fila.children[0].style = "color: #01FF70; background-color: #85144B; font-size: 1.2em; line-height: 2.5em;"
							// } else if (["Damian Cinich", "Daniel Diaz"].includes(currentName)) {
							// 	currentHeaderNode.style = "color: #85144B; background-color: #FFFFFF; font-size: 1.2em; line-height: 2.5em;"
							// 	fila.children[0].style = "color: #85144B; background-color: #FFFFFF; font-size: 1.2em; line-height: 2.5em;"
							// } else if (["Gabriel Viola", "Diego Salomon"].includes(currentName)) {
							// 	currentHeaderNode.style = "color: #001F3F; background-color: #FFDC00; font-size: 1.2em; line-height: 2.5em;"
							// 	fila.children[0].style = "color: #001F3F; background-color: #FFDC00; font-size: 1.2em; line-height: 2.5em;"
							// } else if (["Ariel Mira", "Pablo Cadoppi"].includes(currentName)) {
							// 	currentHeaderNode.style = "color: #111111; background-color: #2ECC40; font-size: 1.2em; line-height: 2.5em;"
							// 	fila.children[0].style = "color: #111111; background-color: #2ECC40; font-size: 1.2em; line-height: 2.5em;"
							// } else {
								currentHeaderNode.style = "color: #FFDC00; background-color: #001F3F; font-size: 1.2em; line-height: 2.5em;"
								fila.children[0].style = "color: #FFDC00; background-color: #001F3F; font-size: 1.2em; line-height: 2.5em;"
							// }
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
							currentCaseCounts[severity] ++
							if (fila.children[3] && fila.children[3].children[0] && fila.children[3].children[0].title === "Checked" ) {
								currentCaseCounts.escalado ++
							}
							if (fila.children[4] && fila.children[4].children[0] && fila.children[4].children[0].title === "Not Checked" ) {
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
		console.error('Error in updateLATAMQueueReport', err)
	}
}

function updateBASegments() {
	try {
		var totalCases = 0

		var connectorsCases = 0
		var mgtmToolsCases = 0
		var devToolsCases = 0
		var saasCases = 0
		var backendCases = 0

		var ar_connectorsCases = 0
		var ar_mgtmToolsCases = 0
		var ar_devToolsCases = 0
		var ar_saasCases = 0
		var ar_backendCases = 0
		// Severity = x-grid3-col-Priority
		// Product = x-grid3-col-00N3400000612Bq
		// Component = x-grid3-col-00N3400000612Bv
		// Subcomponent = x-grid3-col-00N3400000612C0
		// Connector = x-grid3-col-00N34000005ZwAV
		// Topics covered = x-grid3-col-00N300000024XSO

		Array.from(document.getElementsByClassName("x-grid3-col-Priority")).forEach(
			function(element, index, array) {
				totalCases++
				var texto = element.textContent
				var textoOriginal = texto.replace(/ .*/g,"")
				texto = textoOriginal
				var region = (document.getElementsByClassName("x-grid3-col-00N34000005giDv")[index]).textContent.trim()
				var prod = (document.getElementsByClassName("x-grid3-col-00N3400000612Bq")[index]).textContent.trim()
				var comp = (document.getElementsByClassName("x-grid3-col-00N3400000612Bv")[index]).textContent.trim()
				var subcomp = (document.getElementsByClassName("x-grid3-col-00N3400000612C0")[index]).textContent.trim()
				var connName = (document.getElementsByClassName("x-grid3-col-00N34000005ZwAV")[index]).textContent.trim()
				if (isMgmtTools(prod, comp, subcomp, connName)) {
					texto = texto + " [MGTM_TOOLS]";
					mgtmToolsCases++
					if (region.indexOf("[AR]")>=0) {
						ar_mgtmToolsCases++
					}
				}
				if (isConnectors(prod, comp, subcomp, connName)) {
					texto = texto + " [CONNECTORS]";
					connectorsCases++
					if (region.indexOf("[AR]")>=0) {
						ar_connectorsCases++
					}
				}
				if (isDevTools(prod, comp, subcomp, connName)) {
					texto = texto + " [DEV_TOOLS]";
					devToolsCases++
					if (region.indexOf("[AR]")>=0) {
						ar_devToolsCases++
					}
				}
				if (isSaas(prod, comp, subcomp, connName)) {
					texto = texto + " [SAAS]";
					saasCases++
					if (region.indexOf("[AR]")>=0) {
						ar_saasCases++
					}
				}
				if (isBackend(prod, comp, subcomp, connName)) {
					texto = texto + " [BACKEND]";
					backendCases++
					if (region.indexOf("[AR]")>=0) {
						ar_backendCases++
					}
			    }
			    if (texto === textoOriginal) {
			   		element.textContent = texto + " [ ?? ]";
			    } else {
			       element.textContent = texto
			    }
			}
		);

		var ar_cases = ar_connectorsCases + ar_devToolsCases + ar_saasCases + ar_mgtmToolsCases + ar_backendCases
		var listaPorSegmento = document.getElementById("LISTA_POR_SEGMENTO")
		if (listaPorSegmento) {
		  	listaPorSegmento.innerHTML = `<span style="font-size: 1.1em;">AR/WORLD: ${ar_cases}/${totalCases} >> CONNS: ${ar_connectorsCases}/${connectorsCases} | DEV_TOOLS: ${ar_devToolsCases}/${devToolsCases} | SAAS: ${ar_saasCases}/${saasCases} | MGTM_TOOLS: ${ar_mgtmToolsCases}/${mgtmToolsCases} | BACKEND: ${ar_backendCases}/${backendCases}<span>` 
		} else {
		  var listButtons = document.querySelector(".listButtons")
		  if (listButtons && listButtons.children[0]) {
		  	var node = document.createElement("LI");
		  	node.id = "LISTA_POR_SEGMENTO"
		  	node.style = "display: flex;height: 27px;align-items: center; padding: 0 10px;border-radius: 3px; background-color:#eee;"
		  	node.innerHTML = `<span style="font-size: 1.1em;">AR/WORLD: ${ar_cases}/${totalCases} >> CONNS: ${ar_connectorsCases}/${connectorsCases} | DEV_TOOLS: ${ar_devToolsCases}/${devToolsCases} | SAAS: ${ar_saasCases}/${saasCases} | MGTM_TOOLS: ${ar_mgtmToolsCases}/${mgtmToolsCases} | BACKEND: ${ar_backendCases}/${backendCases}<span>` 
		  	var list = listButtons.children[0].appendChild(node);
		  }
		}	
	} catch (err) {

	}
}

// 1 AND ((2 OR 3 OR 4 OR (9 AND 10)) AND (7 AND 8)) AND 5 AND 6
// 2 Product = Anypoint Private Cloud Edition,Mule Runtime 3.x,Mule Agent,MMC,Tcat Server
// 3 Component = CloudHub,API Gateway,APIkit,Runtime Manager
// 4 Subcomponent = Anypoint Enterprise Security
// 5 Subcomponent = <NOT> Internal DNS
// 6 Component = <NOT> Connectors,Access Management,Exchange,Data Gateway,Partner Manager
// 7 Component = <NOT> Anypoint MQ,DataMapper,DataWeave,Maven Plugin,Studio plugin
// 9 Product = Mule Runtime 4.x
// 10 Conn Name <> ""
function isBackend(prod, comp , subcomp, connName) {
	return (
			(
				["Anypoint Private Cloud Edition","Mule Runtime 3.x","Mule Agent"].includes(prod) 
				|| ["CloudHub","API Gateway","APIkit"].includes(comp) 
				|| subcomp === "Anypoint Enterprise Security"
				|| (prod === "Mule Runtime 4.x" && connName === "" )
			) 
			&& ! ["Anypoint MQ","DataMapper","DataWeave","Maven Plugin","Studio plugin", "Connectors","Access Management","Exchange","Data Gateway","Partner Manager"].includes(comp)
			&& ! subcomp !== "Internal DNS"
		)
}


// 1 AND 2 AND (3 OR 4 OR 5 OR (6 AND 7))
// 3. Components = Connectors
// 5. Product = DevKit
// 6. Product = Mule Runtime 4.x
// 7. Conn Name <> ""
function isConnectors(prod, comp , subcomp, connName) {
	return (comp === "Connectors"
				|| prod === "DevKit"
				|| (prod === "Mule Runtime 4.x" && connName !== "" )
			)
}

function isDevTools(prod, comp , subcomp, connName,) {
	return (["MUnit","Mule Maven Plugin"].includes(prod) 
				|| ["Design Center","DataMapper","DataWeave"].includes(comp)
				|| (prod === "Anypoint Studio" && ["DataMapper","DataWeave","Debugger","Maven Plugin","Studio plugin","Other","Modules"].includes(comp) )
			)
}

function isSaas(prod, comp , subcomp, connName) {
	return (
				["Access Management","Exchange","Anypoint MQ","Data Gateway","Partner Manager","API Manager"].includes(comp)
				|| ( prod === "Anypoint Platform" && ! ["Runtime Manager", "CloudHub", "Design Center"].includes(comp) )
				|| prod === "Other" 
			)
}

function isMgmtTools(prod, comp , subcomp, connName) {
	return (
				["MMC","Tcat Server"].includes(prod)
				|| comp === "Runtime Manager"
			)
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
							if (["Adrian Martin", "Alejandro Dobniewski", "Adrian E. Pineyro"].includes(currentName)) {
								fila.children[0].style = "color: #111111; background-color: #7FDBFF; font-size: 1.2em; line-height: 2.5em;"
								currentHeaderNode.style = "color: #111111; background-color: #7FDBFF; font-size: 1.2em; line-height: 2.5em;"
							} else if (["Arianna Flores", "Martin Kociman", "Natalia Campos"].includes(currentName)) {
								currentHeaderNode.style = "color: #01FF70; background-color: #85144B; font-size: 1.2em; line-height: 2.5em;"
								fila.children[0].style = "color: #01FF70; background-color: #85144B; font-size: 1.2em; line-height: 2.5em;"
							} else if (["Damian Cinich", "Daniel Diaz"].includes(currentName)) {
								currentHeaderNode.style = "color: #85144B; background-color: #FFFFFF; font-size: 1.2em; line-height: 2.5em;"
								fila.children[0].style = "color: #85144B; background-color: #FFFFFF; font-size: 1.2em; line-height: 2.5em;"
							} else if (["Gabriel Viola", "Diego Salomon"].includes(currentName)) {
								currentHeaderNode.style = "color: #001F3F; background-color: #FFDC00; font-size: 1.2em; line-height: 2.5em;"
								fila.children[0].style = "color: #001F3F; background-color: #FFDC00; font-size: 1.2em; line-height: 2.5em;"
							} else if (["Ariel Mira", "Pablo Cadoppi"].includes(currentName)) {
								currentHeaderNode.style = "color: #111111; background-color: #2ECC40; font-size: 1.2em; line-height: 2.5em;"
								fila.children[0].style = "color: #111111; background-color: #2ECC40; font-size: 1.2em; line-height: 2.5em;"
							} else {
								currentHeaderNode.style = "color: #FFDC00; background-color: #001F3F; font-size: 1.2em; line-height: 2.5em;"
								fila.children[0].style = "color: #FFDC00; background-color: #001F3F; font-size: 1.2em; line-height: 2.5em;"
							}
							fila.children[0].innerText = ""
							currentCaseCounts = { name: currentName, escalado: 0, undispatched: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 }
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
							currentCaseCounts[severity] ++
							if (fila.children[3] && fila.children[3].children[0] && fila.children[3].children[0].title === "Checked" ) {
								currentCaseCounts.escalado ++
							}
							if (fila.children[4] && fila.children[4].children[0] && fila.children[4].children[0].title === "Not Checked" ) {
								currentCaseCounts.undispatched ++
							}


							var nextUpdateDue = fila.children[7].textContent
							if (isDue(nextUpdateDue)) {
								//#FFFFFF on #FF4136
				               fila.children[7].style.backgroundColor="#FF4136";
				               fila.children[7].style.color="#FFFFFF";
							} else if (daysToDueDate(nextUpdateDue) <= 0) {
							    fila.children[7].style.backgroundColor="#c93";
							    fila.children[7].style.color="#FFFFFF";
						    }
						}
					}
				}
				var resumenNode = reportBody.querySelector(".progressIndicator")
				var totalCaseCounts = { escalado: 0, undispatched: 0, S1: 0, S2: 0, S3: 0, S4: 0, total: 0 } 
				var resumenNodeInnerHTML = `
					<div class="latam-summary-container">
					<table class="list" border="0" cellspacing="0" cellpadding="0">
						<tbody>
							<tr class="headerRow">
								<th scope="col" class=" cellCol1 zen-deemphasize">User</th>
								<th scope="col" class=" cellCol1 zen-deemphasize">Total</th>
								<th scope="col" class=" cellCol2 zen-deemphasize">Escalados</th>
								<th scope="col" class=" cellCol2 zen-deemphasize">No Despachados</th>
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
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S1}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S2}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S3}</td>
						<td class=" dataCell booleanColumn ">${totalCaseCounts.S4}</td>
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
		console.error('Error in updateLATAMQueueDefectReport', err)
	}
}