

UserOptions={
	Stacked:true,
	Scenario:0,
	Advanced:true,
}

Scenarios=[
	{
		Name:'Germany (2015)',
		FileName:'Germany_2015',
		Active:true,
		PHSPowerCapacity:[0,10,1],
		PHSStorageCapacity:[0,50,1],
	},
	{
		Name:'Japan (2018)',
		FileName:'Japan_2018',
		Active:true,
		PHSPowerCapacity:[0,30,1],
		PHSStorageCapacity:[0,100,1],
	},
	{
		Name:'Italy (2019)',
		FileName:'Italy_2019',
		Active:false,
		PHSPowerCapacity:[0,5,1],
		PHSStorageCapacity:[0,20,1],
	},
]

CapChoiceOptionsUser = [];

CapChoiceOptionsDefault=[
	{
		ScenarioName:'Germany (2015)',
		Name:'Germany 2015',
		Nuclear: {
			PowerCapacity:11,
			CapitalCost:5000, // $ per kW
			VariableCost:0.01, // $ per kWh
			LifeSpan:60, // years
		},
		Solar: {
			PowerCapacity: 38,
			CapitalCost:1000, // $ per kW
			VariableCost:0, // $ per kWh
			LifeSpan:25,
		},
		Wind: {
			PowerCapacity: 40,
			CapitalCost:2000, // $ per kW
			VariableCost:0.005, // $ per kWh
			LifeSpan:20,
		},
		Biomass: {
			PowerCapacity:7,
			CapitalCost:1000, // $ per kW
			VariableCost:0.1, // $ per kWh
			LifeSpan:30,
		},
		Coal: {
			PowerCapacity:50,
			CapitalCost:500, // $ per kW
			VariableCost:0.1, // $ per kWh
			LifeSpan:40,
		},
		Gas: {
			PowerCapacity:28,
			CapitalCost:1000, // $ per kW
			VariableCost:0.1, // $ per kWh
			LifeSpan:30,
		},
		PHS: { 
			PowerCapacity:7,
			StorageCapacity:10,
			Efficiency:70,
			CapitalCost:10000, // $ per kW
			CapitalCostStorage:0, // $ per kWh
			VariableCost:0, // $ per kWh
			LifeSpan:60,
		},
		P2G: {
			PowerCapacity:0,
			StorageCapacity:0,
			Efficiency:40,
			CapitalCost:10000, // $ per kW
			CapitalCostStorage:50, // $ per kWh
			VariableCost:0, // $ per kWh
			LifeSpan:10,
		},
	},
	{
		ScenarioName:'Germany (2015)',
		Name:'Germany 2019',
		Nuclear: {
			PowerCapacity:9,
			CapitalCost:5000, // $ per kW
			VariableCost:0.01, // $ per kWh
			LifeSpan:60, // years
		},
		Solar: {
			PowerCapacity: 49,
			CapitalCost:1000, // $ per kW
			VariableCost:0, // $ per kWh
			LifeSpan:25,
		},
		Wind: {
			PowerCapacity: 61,
			CapitalCost:2000, // $ per kW
			VariableCost:0.005, // $ per kWh
			LifeSpan:20,
		},
		Biomass: {
			PowerCapacity:8,
			CapitalCost:1000, // $ per kW
			VariableCost:0.1, // $ per kWh
			LifeSpan:30,
		},
		Coal: {
			PowerCapacity:44,
			CapitalCost:500, // $ per kW
			VariableCost:0.1, // $ per kWh
			LifeSpan:40,
		},
		Gas: {
			PowerCapacity:30,
			CapitalCost:1000, // $ per kW
			VariableCost:0.1, // $ per kWh
			LifeSpan:30,
		},
		PHS: { 
			PowerCapacity:7,
			StorageCapacity:10,
			Efficiency:70,
			CapitalCost:10000, // $ per kW
			CapitalCostStorage:0, // $ per kWh
			VariableCost:0, // $ per kWh
			LifeSpan:60,
		},
		P2G: {
			PowerCapacity:0,
			StorageCapacity:0,
			Efficiency:40,
			CapitalCost:10000, // $ per kW
			CapitalCostStorage:50, // $ per kWh
			VariableCost:0, // $ per kWh
			LifeSpan:10,
		},
	},
	{
		ScenarioName:'Japan (2018)',
		Name:'Japan 2018',
		Nuclear: {
			PowerCapacity:40,
			CapitalCost:0, // $ per kW
			VariableCost:0.01, // $ per kWh
			LifeSpan:60, // years
		},
		Solar: {
			PowerCapacity:56,
			CapitalCost:1000, // $ per kW
			VariableCost:0, // $ per kWh
			LifeSpan:25,
		},
		Wind: {
			PowerCapacity:4,
			CapitalCost:2000, // $ per kW
			VariableCost:0.005, // $ per kWh
			LifeSpan:20,
		},
		PHS: { 
			PowerCapacity:25,
			StorageCapacity:50,
			Efficiency:70,
			CapitalCost:10000, // $ per kW
			CapitalCostStorage:0, // $ per kWh
			VariableCost:0, // $ per kWh
			LifeSpan:60,
		},
		P2G: {
			PowerCapacity:0,
			StorageCapacity:0,
			Efficiency:40,
			CapitalCost:10000, // $ per kW
			CapitalCostStorage:50, // $ per kWh
			VariableCost:0, // $ per kWh
			LifeSpan:10,
		},
	},
	{
		ScenarioName:'Italy (2019)',
		Name:'Italy 2019',
		Nuclear: {
			PowerCapacity:0,
			CapitalCost:0, // $ per kW
			VariableCost:0.01, // $ per kWh
			LifeSpan:60, // years
		},
		Solar: {
			PowerCapacity:20,
			CapitalCost:1000, // $ per kW
			VariableCost:0, // $ per kWh
			LifeSpan:25,
		},
		Wind: {
			PowerCapacity:10,
			CapitalCost:2000, // $ per kW
			VariableCost:0.005, // $ per kWh
			LifeSpan:20,
		},
		PHS: { 
			PowerCapacity:4,
			StorageCapacity:10,
			Efficiency:70,
			CapitalCost:10000, // $ per kW
			CapitalCostStorage:0, // $ per kWh
			VariableCost:0, // $ per kWh
			LifeSpan:60,
		},
		P2G: {
			PowerCapacity:0,
			StorageCapacity:0,
			Efficiency:40,
			CapitalCost:10000, // $ per kW
			CapitalCostStorage:50, // $ per kWh
			VariableCost:0, // $ per kWh
			LifeSpan:10,
		},
	},
]