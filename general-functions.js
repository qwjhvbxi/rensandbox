
// general info
CurrentVersion=0.184;
ShowRangeSelector=true;
Simplified=0;
// Files: column 0: Date; column 1: Load (MW); column 2: Solar (capacity factor); column 3: Wind (capacity factor)
colorCodes={
	Solar:"#aaaa00",
	Wind:"#00aa33",
	Nuclear:"#FF7F00",
	Coal:"#630",
	PHS:"#6677ff",
	P2G:"#456789",
	Direct:"#00FA9A",
	Load:"#333",
	Unserved:"#ff0000",
	Surplus:"#9cc",
}


function initializeApp() {

	initializeCaps(1);
	
	$("#VersionNo").html(CurrentVersion);
	
	listCountries();
	
	initializeScenario();
	
	updateSimplified();
	
	document.getElementById('stackedopt').addEventListener('change',function() {
		UserOptions.Stacked=document.getElementById("stackedopt").checked;
		localStorage.setItem('UserOptions', JSON.stringify(UserOptions));
		initialDateWindow=g1.dateWindow_;
		changeState(drawCharts)
	});
	document.getElementById('advancedcontroloption').addEventListener('change',function() {
		UserOptions.Advanced=document.getElementById("advancedcontroloption").checked;
		localStorage.setItem('UserOptions', JSON.stringify(UserOptions));
		updateSimplified();
	});
	
}

function initializeScenario() {
	
	initialDateWindow=undefined;
	
	CurrentScenario=UserOptions.Scenario;
	FileName='data/'+Scenarios[CurrentScenario].FileName+'.csv';//'data/Germany_2015.csv';
	
	for (var key in Scenarios[CurrentScenario]) {
		if ($('#'+key) && Scenarios[CurrentScenario][key].length>1) {
			$('#'+key).attr({
			   "min" : Scenarios[CurrentScenario][key][0],
			   "max" : Scenarios[CurrentScenario][key][1],
			   "step": Scenarios[CurrentScenario][key][2],
			});
		}
	}
	
	get(FileName).then(function(response) {
		changeState(generateLoad);
	}, function(error) {
		console.error("Failed!", error);
	})
	
	showScenarios();
	
}

function initializeCaps(resetOption) {
	
	// resetOption:
	// 1 gets localstorage if it exists
	// 2 delete user scenarios with prompt
	// 3 delete user scenarios directly
	
	
	if (resetOption==1) {
		
		// check if version exists
		var SavedVersion=localStorage.getItem("SavedVersion");
		if (SavedVersion==null || localStorage.getItem("SavedVersion")<CurrentVersion) {
			localStorage.clear();
			localStorage.setItem('SavedVersion', CurrentVersion);
			console.log('new version')
		} 
		
		var SavedUserOptions=localStorage.getItem("UserOptions");
		if (SavedUserOptions!==null) {
			UserOptions=JSON.parse(localStorage.getItem('UserOptions'));
		} else {
			localStorage.setItem('UserOptions', JSON.stringify(UserOptions));
		}
		
		var LastCapChoiceOptions=localStorage.getItem("LastCapChoiceOptions");
		if (LastCapChoiceOptions!==null) {
			CapChoiceOptionsUser = JSON.parse(localStorage.getItem('LastCapChoiceOptions'));
		} else {
			localStorage.setItem('LastCapChoiceOptions', JSON.stringify(CapChoiceOptionsUser));
		}
		
		var LastCapChoice=localStorage.getItem("LastCapChoice");
		if (LastCapChoice!==null) {
			CapChoice = JSON.parse(localStorage.getItem('LastCapChoice'));
			writeOptions()
		} else {
			changeScenario(0,true)
		}
	}
	
	if (resetOption==2) {
		var r = confirm("Delete all saved scenarios?");
		if (r == true) {
			resetOption=3;
		} else {
			return
		}
	}
	
	if (resetOption==3) {
		CapChoiceOptionsUser = {};//JSON.parse(JSON.stringify(CapChoiceOptionsDefault))
		localStorage.clear();
		localStorage.setItem('UserOptions', JSON.stringify(UserOptions));
		readOptions();
		localStorage.setItem('LastCapChoice', JSON.stringify(CapChoice));
		//localStorage.setItem('LastCapChoiceOptions', JSON.stringify(CapChoiceOptions));
		writeOptions()
		showScenarios()
		return
	}
	
}

function changeScenario(S,DefaultS) {
	
	if (DefaultS==true) {
		CapChoice=$.extend( {}, CapChoiceOptionsDefault[S] );
	}else {
		CapChoice=$.extend( {}, CapChoiceOptionsUser[S] );
	}
	
	localStorage.setItem('LastCapChoice', JSON.stringify(CapChoice));
	
	writeOptions()
	showScenarios()
	updateRanges()
	
}

function listCountries() {
	var i;
	var optionHtml="";
	for (let i=0;i<Scenarios.length;i++) {
		optionHtml+="<option value='"+i+"' ";
		if (Scenarios[i].Active==false) {
			optionHtml+="disabled";
		} else {
			if (UserOptions.Scenario==i) {
				optionHtml+=" selected";
			}
		}
		optionHtml+=">"+Scenarios[i].Name+"</option>";
	}
	$("#countryselect").html(optionHtml);
	$("#countryselect").change(function() {
		UserOptions.Scenario=$("#countryselect").val();
		localStorage.setItem('UserOptions', JSON.stringify(UserOptions));
		initializeScenario() 
	});
}

function updateRanges() {
	
	var i,t;
	var c=$(".ranges"); // select all ranges
	for (t=c.length,i=0;i<t;i++) {
		$("#"+c[i].title).html(c[i].value);
	}
	if (typeof SolarDemandPerc !== 'undefined') {
		$('#S2').html( Math.round($("#SolarPowerCapacity").val()*SolarDemandPerc*10)/10 )
		$('#W2').html( Math.round($("#WindPowerCapacity").val()*WindDemandPerc*10)/10 )
		$('#N2').html( Math.round($("#NuclearPowerCapacity").val()*NuclearDemandPerc*10)/10 )
	}
}

function readOptions() {
	var NewValue;
	for (var key in CapChoice) {
		if (typeof CapChoice[key] === 'object' && CapChoice[key] !== null) {
			for (var key2 in CapChoice[key]) {
				NewValue=$('#'+key+key2).val();
				if (typeof NewValue !== 'undefined') {
					CapChoice[key][key2]=NewValue;
				}
			}
		}
	}
}

function writeOptions() {
	
	for (var key in CapChoice) {
		if (typeof CapChoice[key] === 'object' && CapChoice[key] !== null) {
			for (var key2 in CapChoice[key]) {
				$('#'+key+key2).val(CapChoice[key][key2]);
			}
		}
	}
	document.getElementById("stackedopt").checked=UserOptions.Stacked;
	document.getElementById("advancedcontroloption").checked=UserOptions.Advanced;
	$("#countryselect").val(UserOptions.Scenario.toString());
	//$('#countryselect option[value='+UserOptions.Scenario.toString()+']').attr('selected','selected');
}

function updateSimplified() {
	if (UserOptions.Advanced==true) {
		$(".economic").css({display:"table-cell"});
		$("#genchar").attr('colspan',1);
	} else {
		$(".economic").css({display:"none"});
		$("#genchar").attr('colspan',4);
	}
}

function showScenarios() {
	var text="";
	
	for (let i=0;i<CapChoiceOptionsDefault.length;i++) {
		if (CapChoiceOptionsDefault[i].ScenarioName==Scenarios[UserOptions.Scenario].Name) {
			text += "<input type='submit' class='scenariooptionsdefault' value='"+CapChoiceOptionsDefault[i].Name+"' onclick='changeScenario("+i+",true)'>";
		}
	}
	
	for (let i=0;i<CapChoiceOptionsUser.length;i++) {
		if (CapChoiceOptionsUser[i].ScenarioName==Scenarios[UserOptions.Scenario].Name) {
			text += "<input type='submit' class='scenariooptions' value='"+CapChoiceOptionsUser[i].Name+"' onclick='changeScenario("+i+",false)'><input type='submit' class='deletescenariooption' value='x' onclick='deleteScenario("+i+")'>";
		}
	}
	$('#inputPresets').html($(text));
}

function displaySave() {
	$('#savePane').css('display','block');
}

function saveScenario() {
	
	var ScenarioName=sanitize($('#saveScenarioName').val());
	var ScenarioComment=sanitize($('#saveScenarioComment').val());
	
	if (ScenarioName!='' && ScenarioComment!='') {
		readOptions();
		var CC=$.extend( {}, CapChoice);
		CC.ScenarioName=Scenarios[UserOptions.Scenario].Name;
		CC.Name=ScenarioName;
		CC.Comment=ScenarioComment;
		CapChoiceOptionsUser.push(CC);
		$('#savePane').css('display','none');
		localStorage.setItem('LastCapChoiceOptions', JSON.stringify(CapChoiceOptionsUser));
		sendSaved(CC);
		showScenarios();
	} else {
		alert('Please write a title and a comment for the scenario');
	}
	
}

function sendSaved(CC) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		console.log('Scenario saved');
	}
	};
	xhttp.open("POST", "test.php", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhttp.send("savedScenario="+JSON.stringify(CC));
}

function deleteScenario(s) {
	var r = confirm("Delete scenario '"+CapChoiceOptionsUser[s].Name+"'?");
	if (r == true) {
		CapChoiceOptionsUser.splice(s,1);
		localStorage.setItem('LastCapChoiceOptions', JSON.stringify(CapChoiceOptionsUser));
		showScenarios()
	}
}

function changeState(callback) {
	showMask2();
	setTimeout(callback, 50);
}

function showMask2() {	
	$("#mask").css("display","block");
}

function generateLoad() {
	
	readOptions()
	ThisData=EnergyData.data;
	localStorage.setItem('LastCapChoice', JSON.stringify(CapChoice));
	
	EpochStart=ThisData[0][0].getTime();
	EpochEnd=ThisData[ThisData.length-1][0].getTime();
	EpochL=EpochEnd-EpochStart;
	
	var Resolution=Math.round(EpochL/ThisData.length/1000/60); // time resolution in minutes
	HR=60/Resolution;
	var i,p2gPowerHigh,p2gPowerLow;	
	
	PowerData=[];
	PowerDataStacked=[];
	StorageData=[];
	
	Solar=[];
	Wind=[];
	Nuclear=[];
	Load=[];
	Surplus=[];
	Unserved=[];
	Generation=[];
	
	phsPower=[];
	phsPowerGen=[];
	phsStorage=[];
	phsStorage[0]=CapChoice.PHS.StorageCapacity/2;
	
	p2gPower=[];
	p2gPowerGen=[];
	p2gStorage=[];
	p2gStorage[0]=CapChoice.P2G.StorageCapacity/2;
	
	CapitalCost=CapChoice.Nuclear.CapitalCost*CapChoice.Nuclear.PowerCapacity/CapChoice.Nuclear.LifeSpan;
	CapitalCost+=CapChoice.Solar.CapitalCost*CapChoice.Solar.PowerCapacity/CapChoice.Solar.LifeSpan;
	CapitalCost+=CapChoice.Wind.CapitalCost*CapChoice.Wind.PowerCapacity/CapChoice.Wind.LifeSpan;
	CapitalCost+=(CapChoice.PHS.CapitalCost*CapChoice.PHS.PowerCapacity+CapChoice.PHS.CapitalCostStorage*CapChoice.PHS.StorageCapacity)/CapChoice.PHS.LifeSpan;
	CapitalCost+=(CapChoice.P2G.CapitalCost*CapChoice.P2G.PowerCapacity+CapChoice.P2G.CapitalCostStorage*CapChoice.P2G.StorageCapacity)/CapChoice.P2G.LifeSpan;	
			
	for (i=0,itot=ThisData.length;i<itot;i++) {
		
		Load[i]=ThisData[i][1]/1000;
		
		Solar[i]=ThisData[i][2]*CapChoice.Solar.PowerCapacity;
		Wind[i]=ThisData[i][3]*CapChoice.Wind.PowerCapacity;
		
		phsPowerHigh=Math.min(phsStorage[i]*(CapChoice.PHS.Efficiency/100),CapChoice.PHS.PowerCapacity); // generation
		phsPowerLow=Math.max(phsStorage[i]-CapChoice.PHS.StorageCapacity,-CapChoice.PHS.PowerCapacity) // storage
		p2gPowerHigh=Math.min(p2gStorage[i]*(CapChoice.P2G.Efficiency/100),CapChoice.P2G.PowerCapacity); // generation
		p2gPowerLow=Math.max(p2gStorage[i]-CapChoice.P2G.StorageCapacity,-CapChoice.P2G.PowerCapacity) // storage
		
		Nuclear[i]=Math.max(0,Math.min(Load[i]-phsPowerLow-p2gPowerLow-Solar[i]-Wind[i],CapChoice.Nuclear.PowerCapacity));
		
		Generation[i]=Solar[i]+Wind[i]+Nuclear[i];
		
		phsPower[i]=Math.max(phsPowerLow,Math.min(phsPowerHigh,Load[i]-Generation[i]));
		phsPowerGen[i]=Math.max(0,phsPower[i]);
		phsStorage[i+1]=Math.max(0,phsStorage[i]-phsPowerGen[i]/(CapChoice.PHS.Efficiency/100)-Math.min(0,phsPower[i]));

		p2gPower[i]=Math.max(p2gPowerLow,Math.min(p2gPowerHigh,Load[i]-Generation[i]-phsPower[i]));
		p2gPowerGen[i]=Math.max(0,p2gPower[i]);
		p2gStorage[i+1]=Math.max(0,p2gStorage[i]-p2gPowerGen[i]/(CapChoice.P2G.Efficiency/100)-Math.min(0,p2gPower[i]));
		
		Surplus[i]=Math.max(0,-Load[i]+Generation[i]+phsPower[i]+p2gPower[i]);
		Unserved[i]=Math.max(0,Load[i]-Generation[i]-phsPower[i]-p2gPower[i]);
		
		// 1: solar; 2: wind; 3: load
		PowerLabels=[ "Date", "Solar","Wind","Nuclear","Load","PHS","P2G"];
		PowerColors=[ colorCodes.Solar,colorCodes.Wind,colorCodes.Nuclear,colorCodes.Load,colorCodes.PHS,colorCodes.P2G]
		PowerData[i]=[];
		PowerData[i][0]=ThisData[i][0];
		PowerData[i][1]=Solar[i];
		PowerData[i][2]=Wind[i];
		PowerData[i][3]=Nuclear[i];
		PowerData[i][4]=Load[i];
		PowerData[i][5]=phsPower[i];
		PowerData[i][6]=p2gPower[i];
		
		PowerStackedLabels=[ "Date","Unserved","P2G","PHS","Solar","Wind","Nuclear"];
		PowerStackedColors=[ colorCodes.Unserved,colorCodes.P2G,colorCodes.PHS,colorCodes.Solar,colorCodes.Wind,colorCodes.Nuclear];
		PowerDataStacked[i]=[];
		PowerDataStacked[i][0]=ThisData[i][0];
		PowerDataStacked[i][1]=Unserved[i];
		//PowerDataStacked[i][2]=Surplus[i];
		PowerDataStacked[i][2]=p2gPowerGen[i];
		PowerDataStacked[i][3]=phsPowerGen[i];
		PowerDataStacked[i][4]=Solar[i];
		PowerDataStacked[i][5]=Wind[i];
		PowerDataStacked[i][6]=Nuclear[i];
		
		StorageLabels=[ "Date", "PHS storage", "P2G storage"];
		StorageColors=[colorCodes.PHS,colorCodes.P2G];
		StorageData[i]=[];
		StorageData[i][0]=ThisData[i][0];
		StorageData[i][1]=phsStorage[i];
		StorageData[i][2]=p2gStorage[i];
		
	}
	
	Total=[];
	Total.Load=Load.reduce(sumFun);
	Total.Solar=Solar.reduce(sumFun);
	Total.Wind=Wind.reduce(sumFun);
	Total.Nuclear=Nuclear.reduce(sumFun);
	Total.P2G=p2gPowerGen.reduce(sumFun);
	Total.PHS=phsPowerGen.reduce(sumFun);
	Total.Unserved=Unserved.reduce(sumFun);
	Total.Surplus=Surplus.reduce(sumFun);
	
	Peak=[];
	Peak.Load=Math.max.apply(Math, Load);
	Peak.Solar=Math.max.apply(Math, Solar);
	Peak.Wind=Math.max.apply(Math, Wind);
	Peak.Nuclear=Math.max.apply(Math, Nuclear);
	Peak.P2G=Math.max.apply(Math, p2gPower);
	Peak.PHS=Math.max.apply(Math, phsPower);
	Peak.Unserved=Math.max.apply(Math, Unserved);
	Peak.Surplus=Math.max.apply(Math, Surplus);
	
	// costs
	VariableCost=CapChoice.Nuclear.VariableCost*Total.Nuclear/HR;
	VariableCost+=CapChoice.Solar.VariableCost*Total.Solar/HR;
	VariableCost+=CapChoice.Wind.VariableCost*Total.Wind/HR;
	VariableCost+=CapChoice.PHS.VariableCost*Total.PHS/HR;
	VariableCost+=CapChoice.P2G.VariableCost*Total.P2G/HR;	
	
	// amount of % for each additional GW
	SolarDemandPerc=Total.Solar/CapChoice.Solar.PowerCapacity/Total.Load*100;
	WindDemandPerc=Total.Wind/CapChoice.Wind.PowerCapacity/Total.Load*100;
	NuclearDemandPerc=1/(Total.Load/Load.length)*100;
	
	updateRanges();
	
	var c=$(".results");
	var k,t;
	for (t=c.length,k=0;k<t;k++) {
		$(c[k]).html("<div class='infoItem'>"+c[k].title+"</div>\
		<span class='dot' style='background-color:"+colorCodes[c[k].title]+";transform:scale("+Math.sqrt((Total[c[k].title])/Total.Load)+")'></span>\
		<div class='infoNumbers'><p><span>"+(Math.round(Total[c[k].title]/Total.Load*1000)/10).toFixed(1)+"%</span></p><p><span>"+Math.round(Total[c[k].title]/1000/HR)+"</span>\
		</p><p><span>"+Math.round(Peak[c[k].title])+"</span></p></div>");
	}
	
	$("#costperyear").html(Math.round((CapitalCost+VariableCost)/100)/10)
	//$("#costperyeardot").css("transform","scale("+Math.sqrt((CapitalCost+VariableCost)/1e5)+")");
	
	//<span class='dot' style='background-color:"+colorCodes[c[k].title]+";transform:scale("+Math.sqrt((Total[c[k].title])/Total.Load)+")'></span>
	$("#costperkwh").html((Math.round((CapitalCost+VariableCost)/((Total.Load-Total.Unserved)/HR)*100)/100).toFixed(2))
	$("#costperkwhdot").css("transform","scale("+Math.sqrt(((CapitalCost+VariableCost)/((Total.Load-Total.Unserved)/HR))/(0.2))+")");
	
	if (Total.Unserved>0) {
		$("#resultsContainer2").addClass("Alert");
	}else{
		$("#resultsContainer2").removeClass("Alert");
	}
	
	$("#plots").css({"visibility":"visible"});
	$("#resultsContainer2").css({"visibility":"visible"});

	var LevelCoarse=Math.round(24*60/Resolution);
	var LevelMedium=Math.round(3*60/Resolution);
	
	PowerData96=downsample(PowerData,LevelCoarse);
	PowerData12=downsample(PowerData,LevelMedium);
	PowerDataStacked96=downsample(PowerDataStacked,LevelCoarse);
	PowerDataStacked12=downsample(PowerDataStacked,LevelMedium);
	StorageData96=downsample(StorageData,LevelCoarse);
	StorageData12=downsample(StorageData,LevelMedium);
	
	SpliceL=PowerData96.length;
		
	//EpochStart=new Date("2015/01/01 00:00:00").getTime();
	//EpochEnd=new Date("2016/01/01 00:00:00").getTime();
	
	drawCharts();
	displayPie();
	//adaptRes(EpochStart,EpochEnd);
	
	setTimeout(createLoadDuration([Solar,Wind,Nuclear,phsPower,p2gPower],['percentile','solar','wind','nuclear','PHS','P2G'],[colorCodes.Solar,colorCodes.Wind,colorCodes.Nuclear,colorCodes.PHS,colorCodes.P2G]), 50);
	
}

function drawCharts() {

	var target1=document.getElementById("powerchart");
	var options1=  {
		title: '',
		ylabel: 'Power (GW)',
		legend: 'always',
		showRangeSelector: false,
		interactionModel: Dygraph.defaultInteractionModel,
		rangeSelectorHeight: 30,
		maxNumberWidth: 20,
		stackedGraph: UserOptions.Stacked,
		height:250,//320,
		labelsDiv:'powerlabels',
		zoomCallback:adaptRes,
		//drawCallback:adaptRes2,
		animatedZooms:true,
	};

	if (UserOptions.Stacked==false) {
		options1.labels=PowerLabels;
		options1.colors=PowerColors;
		g1=new Dygraph(target1,PowerData96,options1);
	} else {
		options1.labels=PowerStackedLabels;
		options1.colors=PowerStackedColors;
		g1=new Dygraph(target1,PowerDataStacked96,options1);//downsample(PowerDataStacked,16)
	}
	
	g2=new Dygraph(
	  document.getElementById("storage"),
	  StorageData,
	  {
		customBars: false,
		title: '',
		ylabel: 'Energy (GWh)',
		legend: 'always',
		showRangeSelector: false,//ShowRangeSelector,
		rangeSelectorHeight: 30,
		labels: StorageLabels,
		colors: StorageColors,
		maxNumberWidth: 20,
		stackedGraph: true,
		height: 200,
		labelsDiv:'storagelabels',
		zoomCallback:adaptRes,
		animatedZooms:false,
		//rollPeriod: 14,
		//showRoller: true,
		/*
		interactionModel : {
            'mousedown' : downV3,
            'mousemove' : moveV3,
            'mouseup' : upV3,
            'click' : clickV3,
            'dblclick' : dblClickV3,
            'mousewheel' : scrollV3
            },
		*/
	}
	);
	var sync = Dygraph.synchronize(g1, g2,{
		selection: true,
		zoom: true,
		range: false
	});
 
	$("#mask").css("display","none");
	
	// set mousedown event to trigger chart update from Range selector
	$(".dygraph-rangesel-fgcanvas").mousedown(function(){attivato=1});
	
	// set mousedown event + alt/shift key press to trigger chart update from pan
	$('#powerchart').mousedown(function(e){
		if (e.shiftKey || e.altKey) { attivato=1 }
	});
	$('#storage').mousedown(function(){
		if (e.shiftKey || e.altKey) { attivato=1 }
	});
	
	if (typeof initialDateWindow !== 'undefined')  {
		zoomGraphX(initialDateWindow[0], initialDateWindow[1]);
	}
}

// check mouseup events for updating graph from Range selector
attivato=0;
$(this).mouseup(checkPointer);
function checkPointer(){
	if (attivato==1) {
		adaptRes();
		attivato=0;
	}
}

function zoomGraphX(minDate, maxDate) {
	g1.updateOptions({
		dateWindow: [minDate, maxDate]
	});
	adaptRes(minDate,maxDate);
	//showXDimensions(minDate, maxDate);
}

function adaptRes(minDate, maxDate, yRanges) {
	
	// in case it's called from range selector
	if (maxDate===undefined) {
		minDate=g1.dateWindow_[0];
		maxDate=g1.dateWindow_[1];
	}
	
	initialDateWindow=[minDate,maxDate];
	
	//console.log(maxDate-minDate)
	var newData,newDataStacked,newDataStorage;
	var st=g1.user_attrs_.stackedGraph; // using stacked graph?
	
	// base data for splicing
	if (st == true) {
		baseData=PowerDataStacked96;
	}else {
		baseData=PowerData96;
	}

	// 3 resolutions levels
	if (maxDate-minDate>200*24*3600*1000) {	
		//console.log('96');
		newData=baseData;
		newDataStorage=StorageData96;
	} else {
		if (maxDate-minDate>14*24*3600*1000) { 
			//console.log('12');
			if (st == true) {
				newData=PowerDataStacked12;
			}else {
				newData=PowerData12;
			}
			newDataStorage=StorageData12;
		} else {
			//console.log('1');
			if (st == true) {
				newData=PowerDataStacked;
			}else {
				newData=PowerData;
			}
			newDataStorage=StorageData;
		}
		
		var VecL=newData.length;
		
		var VecStart=Math.floor((minDate-EpochStart)/(EpochL)*VecL);
		var VecEnd=Math.ceil((maxDate-EpochStart)/(EpochL)*VecL);
		var spliceStart=Math.floor((minDate-EpochStart)/(EpochL)*SpliceL);
		var spliceEnd=Math.ceil((maxDate-EpochStart)/(EpochL)*SpliceL);

		var mezzo = newData.slice(VecStart,VecEnd);
		var prima = baseData.slice(0, spliceStart);
		var dopo = baseData.slice(spliceEnd);
		/*
		console.log(VecStart)
		console.log(VecEnd)
		console.log(spliceStart)
		console.log(spliceEnd)
		console.log(prima)
		console.log(mezzo)
		console.log(dopo)
		*/
		newData=prima.concat(mezzo,dopo);	
	}
	
	g1.updateOptions({'file': newData,});
	g2.updateOptions({'file': newDataStorage,});
	
}

function createLoadDuration(data,LabelIn,ColorsIn) {
	
	var h=[];
	var IntervalLeng=PowerData.length/100;
	var res=[];
	var J;
	var Counter;
	
	for (i=0;i<data.length;i++) {
		h[i]=histogram(data[i],1);
	}
	
	for (k=0;k<=100;k++) {
		res[k]=[];
		res[k][0]=k;
	}
	
	for (i=0;i<h.length;i++) {
		J=0;
		Counter=h[i][0][1];
		for (k=0;k<=100;k++) {
			while(Counter<=IntervalLeng*k && J<h[i].length-1) {
				J++;
				Counter=Counter+h[i][J][1];
			}
			res[k][i+1]=h[i][J][0];
			//if (i==2) {console.log(k,J,h[i][J][0])}
		}
	}
	
	setTimeout(function(){ displayLoadDuration(res,LabelIn,ColorsIn) },500);
	//return res;
	
}


function displayLoadDuration(data2,LabelIn,ColorsIn) {
	
	$('#loaddurationContainer').css('display','block');
	
	var Box=document.getElementById("loadDurationPlot");
	var BoxLabel=document.getElementById("loadDurationPlotLabels");
	gLoad=new Dygraph(
		Box,
		data2,
		{
		customBars: false,
		title: '',//'Daily Temperatures in New York vs. San Francisco',
		ylabel: 'Power (GW)',
		legend: 'always',
		legendFormatter:legendFormatter ,
		xRangePad: 5,
		pixelsPerLabel: 20,
		drawAxesAtZero:true,
		labelsDiv:BoxLabel,
		labelsSeparateLines:true,
		showRangeSelector: false,
		rangeSelectorHeight: 30,
		labels: LabelIn,
		colors: ColorsIn,
		maxNumberWidth: 20,
		stackedGraph: false,
		height: 250,
		width:400,
		stepPlot:true,
		connectSeparatedPoints: true,
		xlabel:'duration (%)',
	});
	
}


function legendFormatter(data) {
	
	var dygraph = data.dygraph;
	var html = "";
	var showvalues = data.x != null; // false if there's no selected value currently
	
	// Need a way to lookup the JavaScript dygraph object later from the onclick listener 
	// (using just a javascript string), so assign a unique id to the div and add a data attribute to it
	// (would be great if the dygraphs constructor did this automatically, could be useful for other use cases also)
	if (!dygraph.graphDiv.id) {
		var i = 1;
		while (document.getElementById("__dygraph"+i)) 
			i++;
		dygraph.graphDiv.id = "__dygraph"+i;
	}
	if (!dygraph.graphDiv.dygraph) { dygraph.graphDiv.dygraph = data.dygraph; }
	
	var seriesIndex = 0;
	data.series.forEach(function(series) 
	{
		html += "<label class='graph-checkbox-label'><input type='checkbox' onclick=\"document.getElementById('"+dygraph.graphDiv.id+"').dygraph.setVisibility("+seriesIndex+", ";
		// nb: we have to use dygraph.visibility() here as series.isVisible has incorrect value for points where y value is undefined
		if (dygraph.visibility()[seriesIndex]) { 
			html += "false);\" checked>";
		} else {
			html += "true);\" >"; 
		}
		
		var labeledData = "<span class='graph-checkbox-span' style='font-weight:bold;color:"+dygraph.getOption('colors')[seriesIndex]+"'>" + series.labelHTML + "</span>";
		
		// workaround for the bug where Dygraph.prototype.setColors_ un-sets color for any series where visibility=false; 
		// this workaround gives correct color if configured using options{colors:[...]} and falls back to transparent if not
		series.dashHTML = series.dashHTML.replace("color: undefined;", "color: "+(dygraph.getOption('colors')[seriesIndex] || "rgba(255,255,255,0.0)")+";");
		
		if (showvalues && series != undefined && series.y != undefined) { labeledData += ': ' + series.yHTML; }
		if (series.isHighlighted) { labeledData = '<b>' + labeledData + '</b>'; }
		html += series.dashHTML + " " + labeledData + "</label><br>\n";
		seriesIndex += 1;
	});
	// Display x value at the end, after all the series (to avoid making them jump up/down when there's no selection)
	if (showvalues) {
		html += this.getLabels()[0] + ': '+data.xHTML;
	}

	return html;
}

function displayPie() {
	
	$('#energysourcesContainer').css('display','block');
	
	document.getElementById("energysourcesPlot").innerHTML = '';
	$('#energysourcesPlot').append($(document.createElement('canvas')).attr('id', 'energysources'));
	
	var i;
	var ServedDirectly=[];
	var ServedWithPHS=[];
	var ServedWithP2G=[];
	for (i=1;i<Generation.length;i++) {
		ServedDirectly[i]=Math.min(Generation[i],Load[i]);
		ServedWithP2G[i]=Math.max(0,p2gPower[i]);
		ServedWithPHS[i]=Math.max(0,phsPower[i]);
	}
	var data1=[
		Math.round(ServedDirectly.reduce(sumFun)/HR/1000*10)/10,
		Math.round(ServedWithPHS.reduce(sumFun)/HR/1000*10)/10,
		Math.round(ServedWithP2G.reduce(sumFun)/HR/1000*10)/10,
		Math.round(Unserved.reduce(sumFun)/HR/1000*10)/10
	];
					
	var totale=data1.reduce(sumFun);
	
	var ctx = document.getElementById('energysources').getContext('2d');
	var chart = new Chart(ctx, {
		type: 'pie',
		data: {
			datasets: [{
				data: data1,
				backgroundColor: [
					colorCodes.Direct,
					colorCodes.PHS,
					colorCodes.P2G,
					colorCodes.Unserved
				],
				label: 'Dataset 1'
			}],
			labels: [
				'Direct ('+(Math.round(data1[0]/totale*1000)/10)+'%)',
				'PHS ('+(Math.round(data1[1]/totale*1000)/10)+'%)',
				'P2G ('+(Math.round(data1[2]/totale*1000)/10)+'%)',
				'Unserved ('+(Math.round(data1[3]/totale*1000)/10)+'%)'
			]
		},
		options: {
			responsive: true,
			legend: {position: 'right'},
			tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) { 
						return data1[tooltipItems.index] + ' TWh';
                    }
                }
            },
		}
	});
}

/*
function createMainMenu() {
	var c=$('.contentpanel');
	var m=$('#mainmenu');
	var i;
	var o;
	m[0].textContent="";
	for (let i=0;i<c.length;i++) {
		//$(m[0]).html()
		o=$("<div class='menuitem'>"+c[i].id+"</div>");
		o.bind("click",function(){
			updateTabs(i);
		});
		$(m[0]).append(o);
	}
	updateTabs(0);
}

function updateTabs(num) {
	//resize();
	$('.contentpanel').css('display','none');
	$('.contentpanel')[num].style.display="block";	
	$('.menuitem').removeClass('menuitemactive');
	$($('.menuitem')[num]).addClass('menuitemactive');
}

function displayTutorial(n) {

	updateTabs(0);

	$('#savePane').css("display","none");
	var c = $("#tutorials div");
	c.css("display","none");
	$(".tutorialSelected").addClass("smallcontainerafter").removeClass("tutorialSelected");

	if (c[n]) {
		$(".smallcontainerafter").addClass("smallcontainer").removeClass("smallcontainerafter");
		var Block=c[n];
		Block.style.display="block";
		
		var Subje=document.getElementById(Block.title);
		if (Subje) {
			var SPos=Subje.getBoundingClientRect();
			var w=window.innerWidth;
			var h=window.innerHeight;
			
			// quadrants check
			if (SPos.left+SPos.right>w) {
				
				if (SPos.top+SPos.bottom>h) {
					Block.style.top=SPos.top+"px";
					Block.style.left=SPos.left-530+"px";
				} else {
					Block.style.left=SPos.left+"px";
					Block.style.top=SPos.bottom+"px";
				}
			} else {
				Block.style.left=SPos.right+"px";
				Block.style.top=SPos.top+"px";
			}
			Subje.className="tutorialSelected";	
		}
		
		if ($(Block).find("span").length==0) {
		var Prev=$('<span>back</span>').click(function(){displayTutorial(n-1);});
		var Clos=$('<span>exit</span>').click(function(){displayTutorial(-1);});
		var Next=$('<span>next</span>').click(function(){displayTutorial(n+1);});
		//Block.addEventListener("click",function() {displayTutorial(n+1);});
		Block.append(Prev[0],Clos[0],Next[0]);
		}
		
	} else {
		$(".smallcontainer").addClass("smallcontainerafter").removeClass("smallcontainer");
		
		/*
		var bottone=$("#replaytutorial");
		var offset = bottone.offset();
		var leftoff=Math.round(offset.left+bottone.width()/2)+'px';
		$("#tutorialReminder").css({'left':leftoff,'display':'block','opacity':1});
		setTimeout(function(){ $("#tutorialReminder").css('opacity','0'); }, 1000);
		setTimeout(function(){ $("#tutorialReminder").css('display','none'); }, 5000);
		*//*

		//replaytutorial
		//$(".tutorialSelected").addClass("smallcontainerafter").removeClass("tutorialSelected");
		//$("#tutorials").css("display","none");
	}

	return null;

}
*/
