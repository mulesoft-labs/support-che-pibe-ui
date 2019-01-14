
export function isDue(str) {
	var rightnow = new Date((new Date()).getTime());
	var strDate = str.replace(/\//g,":").replace(/-/g,":").replace(/ /g,":").split(":");
	var updatedue = new Date(strDate[2], strDate[0], strDate[2], strDate[3], strDate[4], strDate[5]) ; 
	if (strDate[5]==='PM') {
	   updatedue = new Date(strDate[2], strDate[0]-1, strDate[1], strDate[3] - 0 + 12, strDate[4]) ; 
	} else {
	   updatedue = new Date(strDate[2], strDate[0]-1, strDate[1], strDate[3], strDate[4]) ; 
	}

	return (rightnow>updatedue)
}

export function daysToDueDate(str) {
	const rightnow = new Date((new Date()).getTime());
	const strDate = str.replace(/\//g,":").replace(/-/g,":").replace(/ /g,":").split(":");
	/// new Date(year, month, day, hours, minutes, seconds, milliseconds)
	let updatedue = new Date(strDate[2], strDate[0]-1, strDate[1], 0, 0, 0) ; 
	const timeDiff = updatedue.getTime() - rightnow.getTime();
	const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
	return (diffDays)
}