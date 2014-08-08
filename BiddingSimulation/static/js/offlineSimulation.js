// all the firms we have right now
//firm1 = { name: "Test Firm 1", bondCapacity: 100000, OHRatio: 0.05, bondCostRatio: 0.08, projects: [] };
//firm2 = { name: "Test Firm 2", bondCapacity: 200000, OHRatio: 0.08, bondCostRatio: 0.04, projects: [] };
//firm3 = { name: "Test Firm 3", bondCapacity: 300000, OHRatio: 0.1, bondCostRatio: 0.03, projects: [] };
//firm4 = { name: "Test Firm 4", bondCapacity: 400000, OHRatio: 0.10, bondCostRatio: 0.02, projects: [] };




// count
count = 0;
// should update the table
shouldUpdate = true;
// firm list
firmList = []

// current bond capacity for each firm
bondCapacity = [];
// current money for each firm
money = [];
// max bid
maxBid = 10;

// the firm that user plays, index from 0;
userFirm = 0;

// the current project
currentProject = undefined;

// the current bid
currentBid = undefined;

offer = [];

ownerList = [];

// projects
projectList = []

// event list
eventList = []

// firm chance list
firmChance = {}



// function to update total cost
function updateTotalCost() {
    var cost = parseFloat($('#directCost').val());
    var firm = firmList[userFirm];
    var bondCost = (firm["bondCostRatio"] * cost).toFixed(0);
    var ohCost = (firm["OHRatio"] * cost).toFixed(0);
    $('#totalCost').val((parseFloat(cost) + parseFloat(bondCost) + parseFloat(ohCost) + parseFloat($('#inputProfit').val()) * cost / 100).toFixed(0));
}

// function to update bond cost, oh cost, etc.
function update() {
    if (count < maxBid) {

        currentProject = createProject();
        var cost = currentProject["totalCost"];
        var firm = firmList[userFirm];
        var bondCost = (firm["bondCostRatio"] * cost).toFixed(0);
        var ohCost = (firm["OHRatio"] * cost).toFixed(0);

        $('#invitation').val(count);
        $('#directCost').val(cost);
        $('#bondCost').val(bondCost);
        $('#ohCost').val(ohCost);
        updateTotalCost();


        // update contact info
        $('#fake_image').attr('src', currentProject["owner"]["ui"]);
        $('#owner-name').text("Name: " + currentProject["owner"]["name"]);
        $('#owner-email').text("Email: " + currentProject["owner"]["email"]);
        $('#owner-company').text("Company Name: " + currentProject["owner"]["company"]);
        $('#owner-Type').text("Owner Type: " + currentProject["owner"]["type"]);
        $('#info-cost').text("Bid direct cost: " + currentProject["quarterCost"].toFixed(0));

    }

}

function updateUI() {
    var bidTable = $('#bid-table-body');
    // get the main for offer
    var minIndex = offer.indexOf(Math.min.apply(Math, offer));
    var string = "<tr>\
                          <td>" + (count - 1) + "</td>" + "<td>" + currentProject["totalCost"] + "</td>";
    $.each(offer, function (i) {
        if (i == minIndex) {
            string += "<td><b>" + offer[i].toFixed(0) + "</b></td>";
        } else {
            string += "<td>" + offer[i].toFixed(0) + "</td>";
        }
    });
    bidTable.append(string + "</tr>");
    // update bond table
    $('#bond-table-body').empty();
    $('#bond-table-body').append("<tr><td>" + count + "</td>\
                          <td>" + bondCapacity[0].toFixed(0) + "</td>\
                          <td>" + bondCapacity[1].toFixed(0) + "</td>\
                          <td>" + bondCapacity[2].toFixed(0) + "</td>\
                          <td>" + bondCapacity[3].toFixed(0) + "</td>\
                          </tr>");

    // update money table
    $('#money-table-body').empty();
    $('#money-table-body').append("<tr><td>" + count + "</td>\
                          <td>" + money[0].toFixed(0) + "</td>\
                          <td>" + money[1].toFixed(0) + "</td>\
                          <td>" + money[2].toFixed(0) + "</td>\
                          <td>" + money[3].toFixed(0) + "</td>\
                          </tr>");


    $('#current-project-table-body').empty();
    $('#current-project-table-body').append("<tr><td>" + "now" + "</td>\
                          <td>" + firmList[0]["projects"].length + "</td>\
                          <td>" + firmList[1]["projects"].length + "</td>\
                          <td>" + firmList[2]["projects"].length + "</td>\
                          <td>" + firmList[3]["projects"].length + "</td>\
                          </tr>");


    // progress bar
    var value = (count + 1) / maxBid * 100;
    $('#bidding-progress').css('width', value + '%').attr('aria-valuenow', value);
    $('#progressbar-span').text(value.toFixed(0) + "% Complete")

    update();
}


function startBid() {

    offer = [0, 0, 0, 0];
    var directCost = parseFloat($('#directCost').val());
    for (var i = 0; i < 4; i++) {
        if (i == userFirm) {
            var currentBondCost = parseFloat($('#bondCost').val());
            if (currentBondCost > bondCapacity[userFirm]) { offer[userFirm] = Number.MAX_VALUE; }
            else { offer[userFirm] = parseFloat($('#totalCost').val()); }
        } else {
            var currentBondCost = directCost * firmList[i]["bondCostRatio"];
            if (currentBondCost > bondCapacity[i]) { offer[i] = Number.MAX_VALUE; }
            else {
                var profitRatio = (Math.random() + firmList[i]["OHRatio"] + firmList[i]["bondCostRatio"]) * (bondCapacity[i]) / firmList[i]["bondCapacity"];
                offer[i] = directCost * (1 + profitRatio);
            }
        }
    }

    currentBid = []
    for (var i = 0; i < firmList.length; i++) {
        currentBid.push({ "firm id": i, "offer": offer[i] });
    }

    var minIndex = offer.indexOf(Math.min.apply(Math, offer));
    currentProject["ownerIndex"] = minIndex;
    var message = "";
    if (minIndex == userFirm) {
        currentProject["isCurrentUserOwned"] = true;
    } else {
        currentProject["isCurrentUserOwned"] = false;
    }

    // update the progress information
    //var resultList = []
    //for (var i = 0; i < 4; i++) {
    //    if (i == minIndex) {
    //        resultList.push("<span class='glyphicon glyphicon-ok'></span>");
    //    } else {
    //        resultList.push("");
    //    }
    //}

    // push to firm project list
    firmList[minIndex]["projects"].push($.extend({}, currentProject));

    //result[count] = resultList;

    // give them money
    money[minIndex] += offer[minIndex];

    // update the bond capacity
    bondCapacity[minIndex] -= directCost * firmList[minIndex]["bondCostRatio"];

    // update the count
    count++;

    processProjects(); // need to update the UI after the changes money

    updateUI();


}

function randomEvent(firmIndex, project) {
//    var factor = 0;
//    var events = [
//{
//    "name": "Got delayed",
//    "base chance": 0.5,
//    "effect": -0.1
//},
//{
//    "name": "Materials got stolen",
//    "base chance": 0.5,
//    "effect": -0.05
//},
//{
//    "name": "Cheap material used",
//    "base chance": 0.5,
//    "effect": 0.2
//}
//    ]


    //if (project["owner"]["type"] === "A") {
    //    factor = 1;
    //} else if (project["owner"]["type"] === "B") {
    //    factor = 2;
    //} else if (project["owner"]["type"] === "C") {
    //    factor = 3;
    //} else if (project["owner"]["type"] === "D") {
    //    factor = 4;
    //}
    

    // choose event type

    var chooseFrom = ["owner", "project type", "project size"];
    var eventType = chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
    var event = {};
    var additionCost = 0;
    var message = "";
    var effectChance = 0;
    
    // firm events here
    if (eventType == chooseFrom[0]) {
        var ownerChanceList = ownerList[project["owner"]["type"]];
        effectChance = ownerChanceList[Math.floor(Math.random() * ownerChanceList.length)];
            
    } else { // right now it's only for project type
        var chanceList = firmChance[firmList[project["ownerIndex"]]["type"]]
        var targetChanceList = chanceList[project["type"]];
        effectChance = targetChanceList[Math.floor(Math.random() * targetChanceList.length)];
    }
    if (effectChance != 0) {
        var choice = (effectChance > 0) ? "+" : "-";
        addiitonalCost = effectChance * project["quarterCost"];
        event["message"] = eventList[eventType][choice][Math.floor(eventList[eventType][choice].length * Math.random())];
        event["additionalCost"] += addiitonalCost
        project["quarterCost"] += addiitonalCost
        project["totalCost"] += addiitonalCost
        // clear event list
        while (project.events.length > 0) {
            project.events.pop();
        }
        project.events.push($.extend({}, event));

    }
}


function getProgressReport() {
    var message = "<h4>Bidding Offering</h4>\
                        <table class='table'>\
                            <thead>\
                                <tr>\
                                    <th>Firm 1</th>\
                                    <th>Firm 2</th>\
                                    <th>Firm 3</th>\
                                    <th>Firm 4</th>\
                                </tr>\
                            </thead>\
                            <tbody><tr>";
    $.each(offer, function (i) {
        message += "<td>" + offer[i].toFixed(0) + "</td>";
    });

    message += "</td></tr></tbody></table><hr>";

    message += "<h4>Bidding result Report</h4>";

    if (currentProject["isCurrentUserOwned"]) {
        message += "<p>You got the project</p><hr>";
    } else {
        message += "<p>You didn't get the project</p><hr>";
    }

    if ($('#showProgress')[0].checked) {


        message += "<h4>Quarterly Job Cost Report</h4>\
                        <table class='table'>\
                            <thead>\
                                <tr>\
                                    <th>Project #</th>\
                                    <th>Estimated Quarter Direct Cost</th>\
                                    <th>Quarter Direct Cost</th>\
                                    <th>Estimated Total Direct Cost</th>\
                                    <th>Total Direct Cost</th>\
                                    <th>Current Status</th>\
                                </tr>\
                            </thead>\
                            <tbody>";
        $.each(firmList[userFirm]["projects"], function (i, project) {
            message += "<tr><td>" + project["number"] + "</td>";
            message += "<td>" + (project["estimateCost"] / project["totalLength"]).toFixed(0)+ "</td>";
            message += "<td>" + project["quarterCost"].toFixed(0) + "</td>";
            message += "<td>" + project["estimateCost"] + "</td>";
            message += "<td>" + project["totalCost"].toFixed(0) + "</td><td>";
            if (project["events"].length > 0) {
                $.each(project["events"], function (j, event) {
                    message += "<p>" + event["message"] + "</p>";
                })
            }
            else {
                message += "<p>Good</p>";
            }

        })
        message += "</td></tr></tbody></table>";
    }
    bootbox.dialog({
        message: message,
        title: "Bidding Status",
        buttons: {
            main: {
                label: "Okay",
                className: "btn-primary"
            }
        }
    });

}

function processProjects() {
    $.each(firmList, function (i) {
        if (firmList[i]["projects"].length > 0) {
            $.each(firmList[i]["projects"], function (j, project) {
                if (project["length"] > 0) {
                    randomEvent(i, project);
                }
            })
        }
    })

    purageProejcts();

    getProgressReport();
}

function createOwner() {
    var typeArray = []
    $.each(ownerList, function (key, value) {
        typeArray.push(key);
    })
    return { "name": faker.Name.findName(), "email": faker.Internet.email(), "ui": faker.Image.avatar(), "type": typeArray[Math.floor(Math.random() * typeArray.length)], "company": faker.Company.companyName() };
}

function createProject() {
    //var cost = Math.floor((100 + Math.random() * 20000 + Math.random() * 1000000));
    var rawProject = projectList[Math.floor(Math.random() * projectList.length)];
    var cost = rawProject["Direct Cost"];
    var projectType = rawProject["Project Type"];
    var length = Math.floor(2 + Math.random() * 3);
    var owner = createOwner();
    var result = {
        "quarterCost": cost / length, "length": length, "owner": owner, "number": count, "events": [], "isCurrentUserOwned": false,
        "totalLength": length, "totalCost": cost, "ownerIndex": -1, "estimateCost": cost, "type": projectType
    };
    return result;
}

function purageProejcts() {
    $.each(firmList, function (i) {
        if (firmList[i]["projects"].length > 0) {
            var popList = []
            $.each(firmList[i]["projects"], function (j, project) {
                // I need some money
                money[project["ownerIndex"]] -= project["quarterCost"];
                if (project["length"] > 0) {
                    project["length"] -= 1;
                } else {
                    // okay need to deduct the money                        
                    popList.push(j)
                }
            })

            $.each(popList, function (j, index) {
                firmList[i]["projects"].splice(index, 1);
            })
        }
    })
}

function showrWinner() {
    var minIndex = money.indexOf(Math.max.apply(Math, money));
    if (minIndex == userFirm) {
        alert("You won the game, but it's only a simulation with dumb computers. Try the real time simulation with people the next time");
    }
    else {
        alert("Well, how can you lose the game with computers?");
    }
}

$(function () {

    // get firm change
    $.getJSON("/data?arg=firmChance", function (data) {
        firmChance = data;
    });

    // get owner list
    $.ajax({
        url: "/data?arg=owner",
        dataType: 'json',
        success: function (data) {
            ownerList = data;
        },
        async: false
    });

    // get project list
    $.ajax({
        url: "/data?arg=projects",
        dataType: 'json',
        success: function (data) {
            projectList = data;
        },
        async: false
    });

    // get events list
    $.ajax({
        url: "/data?arg=events",
        dataType: 'json',
        success: function (data) {
            eventList = data;
        },
        async: false
    });

    // get firm list
    $.ajax({
        url: "/data?arg=firms",
        dataType: 'json',
        success: function (data) {
            firmList = data;
        },
        async: false
    });


    // get firm chance list
    $.ajax({
        url: "/data?arg=firmChance",
        dataType: 'json',
        success: function (data) {
            firmChance = data;
        },
        async: false
    });



    $.each(firmList, function (i, firm) {
        bondCapacity.push(firm.bondCapacity);
        money.push(0);
    });


    // randomly choose a firm
    userFirm = Math.floor((Math.random() * 4));
    bootbox.dialog({
        message: "You are now firm " + (userFirm + 1).toString(),
        title: "Hello",
        buttons: {
            main: {
                label: "Okay",
                className: "btn-primary"
            }
        }
    });


    // update the status
    update();

    // hook up the profit form
    $('#inputProfit').change(function () {
        updateTotalCost();
    });

    $('#inputProfit').keyup(function (e) {
        updateTotalCost();
    });



    // check function
    $('#check').click(function () {
        if (shouldUpdate) {

            shouldUpdate = false;
        }
    });

    // start bid function
    $('#bid').click(function () {
        if (count < maxBid) {
            startBid();
        }
        else {
            showrWinner();
        }
    })

})
