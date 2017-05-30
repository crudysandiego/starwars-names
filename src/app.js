const express = require('express');
const app = express();
var fs = require('fs');
var _ = require('lodash');

app.get('/', function(req, res) {
    var fhirRegions = []
    var fhirMarkets = []
    var fhirCohorts = []
    var regions = []
    var markets = [];
    var cohorts = [];

    var orgs = JSON.parse(fs.readFileSync('navigation_fhir_mock.json', 'utf8'));
    var i = 0;
    var j = 0;

    // iterates through each Organization resource type and adds item to array type
    for (i = 0; i < orgs.entry.length; i++) {
        if (orgs.entry[i].resource.type[0].coding[0].display === 'Region') {
            fhirRegions.push(orgs.entry[i]);
        } else if (orgs.entry[i].resource.type[0].coding[0].display === 'Market') {
            fhirMarkets.push(orgs.entry[i]);
        } else if (orgs.entry[i].resource.type[0].coding[0].display === 'Cohort') {
            fhirCohorts.push(orgs.entry[i]);
        }
    }

    // iterates through fhir regions array, builds region object and pushes to regions array
    for (i = 0; i < fhirRegions.length; i++) {
        var region = {};
        region.parentId = "";
        region.id = fhirRegions[i].resource.id;
        region.items = [];
        region.name = fhirRegions[i].resource.name;
        region.url = 'hierarchy=' + fhirRegions[i].resource.id;
        regions.push(region);
    }

    // iterates through fhir markets array, builds market object and pushes to markets array
    for (i = 0; i < fhirMarkets.length; i++) {
        var market = {};
        market.parentId = fhirMarkets[i].resource.partOf.reference;
        market.id = fhirMarkets[i].resource.id;
        market.items = [];
        market.name = fhirMarkets[i].resource.name;
        market.url = 'hierarchy=' + fhirMarkets[i].resource.id;
        markets.push(market);
    }

    // iterates through fhir cohorts array, builds cohort object and pushes to cohorts array
    for (i = 0; i < fhirCohorts.length; i++) {
        var cohort = {};
        cohort.parentId = fhirCohorts[i].resource.partOf.reference;
        cohort.id = fhirCohorts[i].resource.id;
        cohort.name = fhirCohorts[i].resource.name;
        cohort.url = 'hierarchy=' + fhirCohorts[i].resource.id;
        cohorts.push(cohort);
    }

    // iterates through markets array and adds cohort child object(s)
    for (i = 0; i < markets.length; i++) {
        for (j = 0; j < cohorts.length; j++) {
            if (cohorts[j].parentId.indexOf(markets[i].id) !== -1) {
                markets[i].items.push(cohorts[j]);
            }
        }
    }

    // iterates through regions array and adds market child objects 
    for (i = 0; i < regions.length; i++) {
        for (j = 0; j < markets.length; j++) {
            if (markets[j].parentId.indexOf(regions[i].id) !== -1) {
                regions[i].items.push(markets[j]);
            }
        }
    }

    res.json(regions);
})

app.get('/test', function(req, res) {
    var list = [{
        "dates": [{
                "datetime": "2014-08-26",
                "deviceModels": [{
                        "deviceModel": "Canon450MX",
                        "devices": [{
                                "deviceModel": "Canon450MX",
                                "inchesPrinted": 10,
                                "serialNum": "111",
                                "codes": [{
                                    "type": "Resource"
                                }]
                            },
                            {
                                "deviceModel": "Canon450MX",
                                "inchesPrinted": 10,
                                "serialNum": "222",
                                "codes": [{
                                    "type": "Resource"
                                }]
                            },
                            {
                                "deviceModel": "Canon450MX",
                                "inchesPrinted": 10,
                                "serialNum": "333",
                                "codes": [{
                                    "type": "Resource"
                                }]
                            }
                        ]
                    },
                    {
                        "deviceModel": "HPDeskjet",
                        "devices": [{
                                "deviceModel": "HPDeskjet",
                                "inchesPrinted": 20,
                                "serialNum": "444",
                                "codes": [{
                                    "type": "Resource"
                                }]
                            },
                            {
                                "deviceModel": "HPDeskjet",
                                "inchesPrinted": 20,
                                "serialNum": "555",
                                "codes": [{
                                    "type": "Resource"
                                }]
                            }
                        ]
                    }
                ]
            },
            {
                "datetime": "2014-08-27",
                "deviceModels": [{
                        "deviceModel": "Canon450MX",
                        "devices": [{
                                "deviceModel": "Canon450MX",
                                "inchesPrinted": 5,
                                "serialNum": "111",
                                "codes": [{
                                    "type": "Resource"
                                }]
                            },
                            {
                                "deviceModel": "Canon450MX",
                                "inchesPrinted": 25,
                                "serialNum": "222",
                                "codes": [{
                                    "type": "Resource"
                                }]
                            },
                            {
                                "deviceModel": "Canon450MX",
                                "inchesPrinted": 15,
                                "serialNum": "333",
                                "codes": [{
                                    "type": "Resource"
                                }]
                            }
                        ]
                    },
                    {
                        "deviceModel": "HPDeskjet",
                        "devices": [{
                                "deviceModel": "HPDeskjet",
                                "inchesPrinted": 10,
                                "serialNum": "444",
                                "codes": [{
                                    "type": "Resource"
                                }]
                            },
                            {
                                "deviceModel": "gx420d",
                                "inchesPrinted": 20,
                                "serialNum": "555",
                                "codes": [{
                                    "type": "Resource"
                                }]
                            }
                        ]
                    }
                ]
            }
        ]
    }]

    var sumInchesPrinted = function(total, device) {
        return total + device.inchesPrinted
    }

    var transformDeviceModels = function(dates) {
        return _.map(dates.deviceModels, function(deviceModel) {
            return _.map(deviceModel.codes, function(code) {
                return {
                    date: dates.datetime,
                    deviceModel: deviceModel.deviceModel,
                    type: code.type
                }
            })
        });
    };

    var data = _.chain(list[0].dates)
        .map(transformDeviceModels)
        .flatten()
        .value();

    res.json(data);
})

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
})