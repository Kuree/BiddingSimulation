// count
count = 1;
// should update the table
shouldUpdate = true;
// firm list
firmList = []

// current bond capacity for each firm
bondCapacity = [];
// max bid
maxBid = 41;

// the firm that user plays, index from 0;
userFirm = 0;

// the current project
currentProject = undefined;

// the current bid
currentBid = undefined;

offer = [];

ownerList = [];

// projects
projectList = [];

// event list
eventList = {};

// firm chance list
firmChance = {};

QUARTER_COUNT = 4;

// function to update total cost
function updateTotalCost() {
    var cost = parseFloat($('#directCost').val());
    var firm = firmList[userFirm];
    var bondCost = (firm["bondCostRatio"] * cost).toFixed(0);
    var ohCost = (firm["OHRatio"] * cost).toFixed(0);
    var ga = parseFloat($('#inputGA').val()) * firm["GA"] / 100;
    $('#totalCost').val((parseFloat(cost) + parseFloat(bondCost) + parseFloat(ohCost) + parseFloat($('#inputProfit').val()) * cost / 100 + ga).toFixed(0));
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
        $('#info-project-type').text("Project Type: " + currentProject["type"]);
        $('#info-project-size').text("Project Size: " + currentProject["size"]);
        $('#info-project-description').text("Project Description: " + currentProject["description"]);
    }

}

function updateUI() {
    var bidTable = $('#bid-table-body');
    // get the main for offer
    var minIndex = offer.indexOf(Math.min.apply(Math, offer));
    var string = "<tr>\
                          <td>" + (count - 1) + "</td>" + "<td>" + currentProject["totalCost"] + "</td>";
    $.each(offer, function (i) {
        if (i === minIndex) {
            string += "<td><b>" + offer[i].toFixed(0) + "</b></td>";
        } else {
            string += "<td>" + offer[i].toFixed(0) + "</td>";
        }
    });
    bidTable.append(string + "</tr>");
    // update bond table
    var append = "";
    $('#bond-table-body').empty();
    append = "<tr><td>" + count + "</td>";
    $.each(firmList, function (i) {
        append += "<td>" + bondCapacity[i].toFixed(0) + "</td>";
    })
    append += "</tr>";

    $('#bond-table-body').append(append);

    // update active projects
    $('#money-table-body').empty();
    append = "<tr><td>" + count + "</td>";
    $.each(firmList, function (i) {
        append += "<td>" + firmList[i]["money"].toFixed(0) + "</td>";
    });
    append += "</tr>";
    $('#money-table-body').append(append);

    $('#current-project-table-body').empty();
    append = "<tr><td>" + "now" + "</td>";
    $.each(firmList, function (i) {
        var length = 0;
        $.each(firmList[i]["projects"], function (i, project) {
            if (project["length"] > 0) {
                length += 1;
            }
        })
        append += "<td>" + length + "</td>";
    });
    append += "</tr>";
    $('#current-project-table-body').append(append);

    append = "<tr><td>" + (count - 1) + "</td>";
    $.each(firmList, function (i) {
        if (i == minIndex) {
            append += "<td>" + offer[i].toFixed(0) + "</td>";
        } else {
            append += "<td></td>";
        }
    })
    append += "</tr>";
    $('#project-stats-table-body').append(append);

    append = "<tr><td>" + "Total" + "</td>";
    $.each(firmList, function (i) {
        append += "<td>" + firmList[i]["sum"] + "</td>";
    });
    $('#project-sum-table-body').empty();
    $('#project-sum-table-body').append(append);

    // progress bar
    var value = (count + 1) / maxBid * 100;
    $('#bidding-progress').css('width', value + '%').attr('aria-valuenow', value);
    $('#progressbar-span').text(value.toFixed(0) + "% Complete")

    // quarter indicator
    var indicator = "Year " + ((count % QUARTER_COUNT) != 0 ? (~~(count / QUARTER_COUNT) + 1) : (~~(count / QUARTER_COUNT))) + " Quarter: " + ((count % QUARTER_COUNT) != 0 ? (count % QUARTER_COUNT) : QUARTER_COUNT);
    $('#quarter-indicator').text(indicator);

    update();
}


function startBid() {

    offer = [0, 0, 0, 0];
    var directCost = parseFloat($('#directCost').val());
    var profit = 0;
    var ga = 0;
    for (var i = 0; i < firmList.length; i++) {
        if (i == userFirm) {
            var currentBondCost = parseFloat($('#bondCost').val());
            if (currentBondCost > bondCapacity[userFirm]) { offer[userFirm] = parseFloat($('#totalCost').val()) * 1.15; }
            else { offer[userFirm] = parseFloat($('#totalCost').val()); }
            console.log($('#inputProfit').val()/ 100);
            profit = $('#inputProfit').val() / 100;
            ga = parseFloat($('#inputGA').val());
        } else {
            var currentBondCost = directCost * firmList[i]["bondCostRatio"];
            profit = Math.random() * 0.5;
            var profitRatio = (firmList[i]["OHRatio"] + firmList[i]["bondCostRatio"]) * (bondCapacity[i]) / firmList[i]["bondCapacity"] + profit;
            ga = 25;
            if (profitRatio < 0) {
                // reach the bond capacity
                profitRatio = -profitRatio;
                profitRatio *= 1.15
            }
            offer[i] = directCost * (1 + profitRatio) + ga * firmList[i]["GA"] / 100;
            if (currentBondCost > bondCapacity[i]) { offer[i] *= 1.1; }
        }
    }

    currentBid = []
    for (var i = 0; i < firmList.length; i++) {
        currentBid.push({ "firm id": i, "offer": offer[i] });
    }

    var minIndex = offer.indexOf(Math.min.apply(Math, offer));
    currentProject["ownerIndex"] = minIndex;
    currentProject["offer"] = offer[minIndex];
    currentProject["profit"] = profit * directCost;
    currentProject["gaOverhead"] = ga;

    var message = "";
    if (minIndex == userFirm) {
        currentProject["isCurrentUserOwned"] = true;
    } else {
        currentProject["isCurrentUserOwned"] = false;
    }

   

    // push to firm project list
    firmList[minIndex]["projects"].push($.extend({}, currentProject));

    // push to sum
    firmList[minIndex]["sum"] += offer[minIndex];


    //result[count] = resultList;

    // give them money
    firmList[minIndex]["money"] += offer[minIndex];

    // update the bond capacity
    bondCapacity[minIndex] -= directCost * firmList[minIndex]["bondCostRatio"];

    // cover some overhead
    var overhead = minIndex == userFirm ? $('#inputGA').val() : 0.25;
    firmList[minIndex]["gaOverhead"] += overhead;

    
    // update the count
    count++;

    processProjects(); // need to update the UI after the changes money

    updateUI();
}


function processGA()
{
    $.each(firmList, function (i, firm) {
        firm["money"] -= (100 - firm["currentGA"]) * firm["GA"] / 100;
    });

    resetGAOverhead();
}

function randomEvent(firmIndex, project) {
    

    // choose event type

    var chooseFrom = ["owner", "project type", "project size"];
    var eventType = chooseFrom[Math.floor(Math.random() * chooseFrom.length)];
    var event = {};
    var addiitonalCost = 0;
    var message = "";
    var effectChance = 0;
    
    // firm events here
    if (eventType == chooseFrom[0]) { // owner impact
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
        var eventListFromRandom = eventList[eventType];
        if (eventListFromRandom == undefined) {
            console.log("error");
        }
        event["message"] = eventListFromRandom[choice][Math.floor(eventListFromRandom[choice].length * Math.random())];
        event["additionalCost"] += addiitonalCost
        project["quarterCost"] += addiitonalCost
        project["totalCost"] += addiitonalCost

        // add impact to project's impact list
        switch (eventType) {
            case chooseFrom[0]:
                project["ownerImpact"] += addiitonalCost;
                break;
            case chooseFrom[1]:
                project["typeImpact"] += addiitonalCost;
                break;
            case chooseFrom[2]:
                project["sizeImpact"] += addiitonalCost;
                break;
        }

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
        message += "<p>You got the project</p>";
    } else {
        message += "<p>You didn't get the project</p>";
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
            if (project["length"] > 0) {
                message += "<tr><td>" + project["number"] + "</td>";
                message += "<td>" + (project["estimateCost"] / project["totalLength"]).toFixed(0) + "</td>";
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
                className: "btn-default"
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

    // process G&A overhead
    if (count != 1 && count % QUARTER_COUNT == 1) { // a year
        processGA();
        console.log("processed")
    }
}

function resetGAOverhead() {
    $.each(firmList, function (i, firm) {
        firm["currentGA"] = 0;
    })
}

function createOwner(ownerClass) {
    return { "name": faker.Name.findName(), "email": faker.Internet.email(), "ui": faker.Image.avatar(), "type": ownerClass, "company": faker.Company.companyName() };
}

function createProject() {
    //var cost = Math.floor((100 + Math.random() * 20000 + Math.random() * 1000000));
    var rawProject = projectList[Math.floor(Math.random() * projectList.length)];
    var cost = rawProject["Direct Cost"];
    var projectType = rawProject["Project Type"];
    var length = Math.floor(2 + Math.random() * 3);
    var owner = createOwner(rawProject["Owner Class"]);
    var projectSize = rawProject["Project Size"];
    var projectDescription = rawProject["Project Description"]; 

    var result = {
        "quarterCost": cost / length, "length": length, "owner": owner, "number": count, "events": [], "isCurrentUserOwned": false,
        "totalLength": length, "totalCost": cost, "ownerIndex": -1, "estimateCost": cost, "type": projectType, "size": projectSize, "description": projectDescription,
        "gaOverhead": 0, "isAlive": true, "offer": 0, "profit": 0, "sizeImpact": 0, "typeImpact": 0, "ownerImpact": 0
    };
    return result;
}

function purageProejcts() {
    $.each(firmList, function (i) {
        if (firmList[i]["projects"].length > 0) {
            var popList = []
            $.each(firmList[i]["projects"], function (j, project) {
                // I need some money
                firmList[project["ownerIndex"]]["money"] -= project["quarterCost"]; // remove some part of money
                if (project["length"] > 0) {
                    project["length"] -= 1;
                //} else {
                //    // okay need to deduct the money                        
                //    popList.push(j)
                }
            })

            $.each(popList, function (j, index) {
                // firmList[i]["projects"].splice(index, 1); ------> need to implement in safer way

                // before delete, need to cover the G&A overhead
                var project = firmList[i]["projects"][index];
                firmList[i]["currentGA"] += project["gaOverhead"];
                delete firmList[i]["projects"][index];
            })

            // remove undefined
            firmList[i]["projects"] = firmList[i]["projects"].filter(function (n) { return n != undefined });
        }
    })
}

function showrWinner() {
    var minIndex = 0;
    for (var i = 0; i < firmList.length; i++) {
        if (firmList[i]["money"] < firmList[minIndex]) {
            minIndex = i;
        }
    }
    if (minIndex == userFirm) {
        alert("You won the game, but it's only a simulation with dumb computers. Try the real time simulation with people the next time");
    }
    else {
        alert("Well, how can you lose the game with computers?");
    }
}



$(function () {

    // // get firm change
    $.ajax({
        url: "/data?arg=firmChance",
        dataType: 'json',
        success: function (data) {
            firmChance = data;
        },
        async: false
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

    // reset the G&A overhead for each company.
    resetGAOverhead();

    $.each(firmList, function (i, firm) {
        bondCapacity.push(firm.bondCapacity);
        //money.push(0);
    });


    // randomly choose a firm
    userFirm = Math.floor((Math.random() * firmList.length));
    bootbox.dialog({
        message: "You are now firm " + (userFirm + 1).toString(),
        title: "Hello",
        buttons: {
            main: {
                label: "Okay",
                className: "btn-default"
            }
        }
    });


    // update the status
    update();


    // show the G&A
    $('#TotalGA').val(firmList[userFirm]["GA"]);


    // hook up the bid total form
    $('#inputProfit').change(function () {
        updateTotalCost();
    });

    $('#inputProfit').keyup(function (e) {
        updateTotalCost();
    });

    $('#inputGA').change(function () {
        updateTotalCost();
    });

    $('#inputGA').keyup(function (e) {
        updateTotalCost();
    });


    // initialize the firm list in UI
    var tableContent = "<thead>\
                                <tr>\
                                    <th>#</th>";
    var tableContentCost = "<thead>\
                                <tr>\
                                    <th>#</th>\
                                    <th>Total Cost</th>";

    $.each(firmList, function (i, firm) {
        tableContent += "<th>" + firm["name"] + "</th>"
        tableContentCost += "<th>" + firm["name"] + "</th>"
    });
    tableContent += "</tr>\
                            </thead>";
    tableContentCost += "</tr>\
                            </thead>";

    $('.firms').append(tableContent);
    console.log($('.firms'));
    $('.cost').append(tableContentCost);

    // start bid function
    $('#check-income-statement').click(function () {
        $.ajax({
            type: "POST",
            url: "income-statement",
            async: false,
            data: JSON.stringify({ "firm": firmList[userFirm], "count": count }),
            success: function (data) {
                var win = window.open();
                win.URL = "You should not pass!"; // if you can see it, then great because you know you can bypass the off-line simulation. However, I will not let you cheat in the real-time simulation!
                win.document.write(data);
            },
            error: function () {
                alert("error");
            }
        })
    })

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
