
// general info
CurrentVersion=0.13;
ShowRangeSelector=false;
Simplified=0;
SolarCapInit=38;
WindCapInit=40;





function initializeEnergy() {

	var FileName='data/GermanyData_2015.csv';
	initializeCaps(-1);
	$("#VersionNo").html(CurrentVersion);

	get(FileName).then(function(response) {
		generateLoad(response,drawCharts);
	}, function(error) {
		console.error("Failed!", error);
	})

	document.getElementById('stackedopt').addEventListener('change',function() {
		CapChoice.Options.Stacked=document.getElementById("stackedopt").checked;
		localStorage.setItem('LastCapChoice', JSON.stringify(CapChoice));
		//drawCharts();
		changeState(drawCharts)
	});
	
}


							
function updateRanges() {
	
	var i,t;
	var c=$(".ranges"); // select all ranges
	for (t=c.length,i=0;i<t;i++) {
		$("#"+c[i].title).html(c[i].value);
	}
	$('#S2').html( Math.round($("#SolarPowerCapacity").val()*SolarDemandPerc*10)/10 )
	$('#W2').html( Math.round($("#WindPowerCapacity").val()*WindDemandPerc*10)/10 )
	$('#N2').html( Math.round($("#NuclearPowerCapacity").val()*NuclearDemandPerc*10)/10 )
	
}


function initializeCaps(resetOption) {
	
	// resetOption:
	// -1 gets localstorage if it exists
	// -2 return defaults
	
	if (resetOption==-1) {
		
		//first run
		if (localStorage.getItem("SavedVersion")) {
			if (localStorage.getItem("SavedVersion")<CurrentVersion) {
				localStorage.clear();
				localStorage.setItem('SavedVersion', CurrentVersion);
			}
		} else {
			localStorage.clear();
			localStorage.setItem('SavedVersion', CurrentVersion);
		}
		
		if (localStorage.getItem("LastCapChoice")) {
			CapChoice = JSON.parse(localStorage.getItem('LastCapChoice'));
			if (localStorage.getItem("LastCapChoiceOptions")) {
				CapChoiceOptions = JSON.parse(localStorage.getItem('LastCapChoiceOptions'));
			}
			writeOptions()
			showScenarios()
			return;
		} else {
			CapChoiceOptions = JSON.parse(JSON.stringify(CapChoiceOptionsDefault));
			if ($("#tutorialReminder").css('display')!='none') {
				displayTutorial(0);
			} else {
				console.log('tutorial hidden')
			}
		}
		
	}
	
	if (resetOption==-2) {
		var r = confirm("Delete all saved scenarios?");
		if (r == true) {
			resetOption=-3;
		} else {
			return			
		}
	}
		
	if (resetOption==-3) {
		CapChoiceOptions = JSON.parse(JSON.stringify(CapChoiceOptionsDefault))
		localStorage.clear();
		readOptions();
		localStorage.setItem('LastCapChoice', JSON.stringify(CapChoice));
		localStorage.setItem('LastCapChoiceOptions', JSON.stringify(CapChoiceOptions));
		writeOptions()
		showScenarios()
		return
	}
	
	
	CapChoice=$.extend( {}, CapChoiceOptions[Math.max(0,resetOption)] );
	
	var stackedOption
	if (resetOption>=0) {
		stackedOption=document.getElementById("stackedopt").checked;
		CapChoice.Options.Stacked=stackedOption;
	} 

	writeOptions()
	showScenarios()

	if (resetOption>=0) {
		updateRanges();
		/*
		changeSolar();
		changeWind();
		changeNuclear();
		*/
	} else {
		localStorage.setItem('LastCapChoice', JSON.stringify(CapChoice));
		localStorage.setItem('LastCapChoiceOptions', JSON.stringify(CapChoiceOptions));
	}
	
}


function readOptions() {
	var NewValue;
	for (var key in CapChoice) {
		if (typeof CapChoice[key] === 'object' && CapChoice[key] !== null && key !== 'Options') {
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
		if (typeof CapChoice[key] === 'object' && CapChoice[key] !== null && key !== 'Options') {
			for (var key2 in CapChoice[key]) {
				$('#'+key+key2).val(CapChoice[key][key2]);
			}
		}
	}
	document.getElementById("stackedopt").checked=CapChoice.Options.Stacked;
	
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
		CC.Name=ScenarioName;
		CC.Comment=ScenarioComment;
		CapChoiceOptions.push(CC);
		$('#savePane').css('display','none');
		localStorage.setItem('LastCapChoiceOptions', JSON.stringify(CapChoiceOptions));
		showScenarios()
	} else {
		alert('Please write a title and a comment for the scenario');
	}
	
}

function showScenarios() {
	$('#inputPresets').html('')
	for (let i=0;i<CapChoiceOptions.length;i++) {
		
		$('#inputPresets').append($("<input type='submit' class='scenariooptions' value='"+CapChoiceOptions[i].Name+"' onclick='initializeCaps("+i+")'><input type='submit' class='deletescenariooption' value='x' onclick='deleteScenario("+i+")'>"));
	}
}

function deleteScenario(s) {
	var r = confirm("Delete scenario '"+CapChoiceOptions[s].Name+"'?");
	if (r == true) {
		CapChoiceOptions.splice(s,1);
		localStorage.setItem('LastCapChoiceOptions', JSON.stringify(CapChoiceOptions));
		showScenarios()
	}
}

function adjustheight() {
   w = window.innerWidth;
   h = window.innerHeight;
   $('#rightcontentwrapper').css('height',h-40-20-40);
  
}
//window.addEventListener("resize", adjustheight);


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
	
	//document.getElementById("PVLandRequirement").innerHTML=(14*CapChoice.solarCap); 
	//1.4 ha/MW  - 14 km2/GW
	//(https://www.ise.fraunhofer.de/content/dam/ise/en/documents/publications/studies/recent-facts-about-photovoltaics-in-germany.pdf)
	
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
		
		Load[i]=ThisData[i][4]/1000;
		
		Solar[i]=ThisData[i][1]/SolarCapInit*CapChoice.Solar.PowerCapacity/1000;
		Wind[i]=(ThisData[i][2]+ThisData[i][3])/WindCapInit*CapChoice.Wind.PowerCapacity/1000;
		
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
		PowerDataStacked[i][4]=PowerData[i][1];
		PowerDataStacked[i][5]=PowerData[i][2];
		PowerDataStacked[i][6]=PowerData[i][3];
		
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
	VariableCost=CapChoice.Nuclear.VariableCost*Total.Nuclear/4;
	VariableCost+=CapChoice.Solar.VariableCost*Total.Solar/4;
	VariableCost+=CapChoice.Wind.VariableCost*Total.Wind/4;
	VariableCost+=CapChoice.PHS.VariableCost*Total.PHS/4;
	VariableCost+=CapChoice.P2G.VariableCost*Total.P2G/4;	
	
	// amount of % for each additional GW
	SolarDemandPerc=Total.Solar/CapChoice.Solar.PowerCapacity/Total.Load*100;
	WindDemandPerc=Total.Wind/CapChoice.Wind.PowerCapacity/Total.Load*100;
	NuclearDemandPerc=1/(Total.Load/Load.length)*100;
	
	updateRanges();
	
	var c=$(".results");
	var k,t;
	for (t=c.length,k=0;k<t;k++) {
		/*
		$(c[k]).html("<div class='infoItem'>"+c[k].title+"</div><span class='dot' style='background-color:"+colorCodes[c[k].title]+";transform:scale("+Math.sqrt((Total[c[k].title]+0.01)/Total.Load)+")'></span><div class='infoNumbers'><p><span>"+Math.round(Total[c[k].title]/1000/4)+"</span> TWh</p><p><span>"+(Math.round(Total[c[k].title]/Total.Load*1000)/10).toFixed(1)+"</span>%</p><p><span>"+Math.round(Peak[c[k].title])+"</span> GW</p></div>");
		*/
		//*
		$(c[k]).html("<div class='infoItem'>"+c[k].title+"</div><span class='dot' style='background-color:"+colorCodes[c[k].title]+";transform:scale("+Math.sqrt((Total[c[k].title])/Total.Load)+")'></span><div class='infoNumbers'><p><span>"+(Math.round(Total[c[k].title]/Total.Load*1000)/10).toFixed(1)+"%</span></p><p><span>"+Math.round(Total[c[k].title]/1000/4)+"</span></p><p><span>"+Math.round(Peak[c[k].title])+"</span></p></div>");
		//*/
		/*
		$(c[k]).html(""+c[k].title+": "+Math.round(Total[c[k].title]/1000/4)+" TWh ("+(Math.round(Total[c[k].title]/Total.Load*1000)/10).toFixed(1)+"% of demand). Peak: "+Math.round(Peak[c[k].title])+" GW");
		*/
	}
	
	$("#costperyear").html(Math.round((CapitalCost+VariableCost)/100)/10)
	//$("#costperyeardot").css("transform","scale("+Math.sqrt((CapitalCost+VariableCost)/1e5)+")");
	
	//<span class='dot' style='background-color:"+colorCodes[c[k].title]+";transform:scale("+Math.sqrt((Total[c[k].title])/Total.Load)+")'></span>
	$("#costperkwh").html((Math.round((CapitalCost+VariableCost)/((Total.Load-Total.Unserved)/4)*100)/100).toFixed(2))
	$("#costperkwhdot").css("transform","scale("+Math.sqrt(((CapitalCost+VariableCost)/((Total.Load-Total.Unserved)/4))/(0.2))+")");
	
	if (Total.Unserved>0) {
		$("#resultsContainer2").addClass("Alert");
	}else{
		$("#resultsContainer2").removeClass("Alert");
	}
	
	drawCharts();
	displayPie();
	
	setTimeout(createLoadDuration([Solar,Wind,Nuclear,phsPower,p2gPower],['percentile','solar','wind','nuclear','PHS','P2G'],[colorCodes.Solar,colorCodes.Wind,colorCodes.Nuclear,colorCodes.PHS,colorCodes.P2G]), 50);
	
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
		Math.round(ServedDirectly.reduce(sumFun)/4/1000*10)/10,
		Math.round(ServedWithPHS.reduce(sumFun)/4/1000*10)/10,
		Math.round(ServedWithP2G.reduce(sumFun)/4/1000*10)/10,
		Math.round(Unserved.reduce(sumFun)/4/1000*10)/10
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




function drawCharts() {

	var target1=document.getElementById("powerchart");
	var options1=  {
		title: '',
		ylabel: 'Power (GW)',
		legend: 'always',
		showRangeSelector: ShowRangeSelector,
		interactionModel: Dygraph.defaultInteractionModel,
		rangeSelectorHeight: 30,
		maxNumberWidth: 20,
		stackedGraph: CapChoice.Options.Stacked,
		height:250,//320,
		labelsDiv:'powerlabels',
	};

	if (CapChoice.Options.Stacked==false) {
		options1.labels=PowerLabels;
		options1.colors=PowerColors;
		var g1=new Dygraph(target1,PowerData,options1);
	} else {
		options1.labels=PowerStackedLabels;
		options1.colors=PowerStackedColors;
		var g1=new Dygraph(target1,PowerDataStacked,options1);//downsample(PowerDataStacked,16)
	}
	
	var g2=new Dygraph(
	  document.getElementById("storage"),
	  StorageData,
	  {
		customBars: false,
		title: '',
		ylabel: 'Energy (GWh)',
		legend: 'always',
		showRangeSelector: false,
		rangeSelectorHeight: 30,
		labels: StorageLabels,
		colors: StorageColors,
		maxNumberWidth: 20,
		stackedGraph: true,
		height: 200,
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
		
		var bottone=$("#replaytutorial");
		var offset = bottone.offset();
		var leftoff=Math.round(offset.left+bottone.width()/2)+'px';
		$("#tutorialReminder").css({'left':leftoff,'display':'block','opacity':1});
		setTimeout(function(){ $("#tutorialReminder").css('opacity','0'); }, 1000);
		setTimeout(function(){ $("#tutorialReminder").css('display','none'); }, 5000);
		
		//replaytutorial
		//$(".tutorialSelected").addClass("smallcontainerafter").removeClass("tutorialSelected");
		//$("#tutorials").css("display","none");
	}

	return null;

}


function get(url) {
	
	// Return a new promise.
	return new Promise(function(resolve, reject) {
		// Do the usual XHR stuff
		var req = new XMLHttpRequest();
		req.open('GET', url);
		req.onload = function() {
		  // This is called even on 404 etc
		  // so check the status
			if (req.status == 200) {
				// Resolve the promise with the response text
				EnergyData = Papa.parse(req.response ,{
					header: false,
					dynamicTyping: true
					}
					);
					
				EnergyData.data.splice(0,1);
				
				for (i=0;i<EnergyData.data.length;i++) {
					EnergyData.data[i][0]=new Date(EnergyData.data[i][0]);
				}
				resolve(EnergyData.data);
			
				//resolve(req.response);
			} else {
				// Otherwise reject with the status text
				// which will hopefully be a meaningful error
				reject(Error(req.statusText));
			}
		};

		// Handle network errors
		req.onerror = function() {
			reject(Error("Network Error"));
		};
		// Make the request
		req.send();
  });
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

function toggleSimplified() {
	Simplified=1-Simplified;
	if (Simplified==0) {
		$(".economic").css({display:"table-cell"});
		$("#genchar").attr('colspan',1);
	} else {
		$(".economic").css({display:"none"});
		$("#genchar").attr('colspan',4);
	}
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
		html += "<label><input type='checkbox' onclick=\"document.getElementById('"+dygraph.graphDiv.id+"').dygraph.setVisibility("+seriesIndex+", ";
		// nb: we have to use dygraph.visibility() here as series.isVisible has incorrect value for points where y value is undefined
		if (dygraph.visibility()[seriesIndex]) { 
			html += "false);\" checked>";
		} else {
			html += "true);\" >"; 
		}
		
		var labeledData = "<span style='font-weight:bold;color:"+dygraph.getOption('colors')[seriesIndex]+"'>" + series.labelHTML + "</span>";
		
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


function histogram(data, size) {
    var length = data.length;
    var min = Math.min.apply(null,data);
    var max = Math.max.apply(null,data);
    var bins = Math.ceil((max - min + 1) / size);
    var histogram = [];
	
    for (var i = 0; i < bins; i++) {
		histogram[i] = [];
		histogram[i][0] = min+i*size;
		histogram[i][1] = 0;
	}
    for (var i = 0; i < length; i++) {
        histogram[Math.floor((data[i] - min) / size)][1]++;
	}
    return histogram;
}

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

function sumFun(total, num) {
  return total + num;
}

function sumFun2(total,num) {
	
	
}

function sanitize(string) {
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#x27;',
		"/": '&#x2F;',
		//"`": '&grave;',
	};
	const reg = /[&<>"'/]/ig;
	return string.replace(reg, (match)=>(map[match]));
}

function downsample(data,num) {
	
	var i,j,k;
	var res=[]; // result
	var L=data.length;
	var L2=data[0].length;
	var tot=Math.ceil(L/num);
	
	if (L2>1) {
		
		for (i=0;i<L;i++) {
			if (i%num==0) {
				j=i/num;
				res[j]=[];
				res[j][0]=data[i][0]; // keep the first date
				for (let k=1;k<L2;k++) {
					res[j][k]=0;
				}
			}
			for (let k=1;k<L2;k++) {
				res[j][k]+=data[i][k]/num;
			}
		}
	
	} else {
		
		for (j=0;j<tot;j++) {
			res[j]=data.splice(0,num).reduce(sumFun);
		}
	}
	
	return res;
	
}




