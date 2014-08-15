

// function to update bond cost, oh cost, etc.
function update() {
    if (count < maxBid) {

        //getBondCost(firm, directCost, bondCapacity)

        currentProject = createProject();
        var cost = currentProject["totalCost"];
        var firm = firmList[userFirm];
        var bondCost = (getBondCost(firm, cost, bondCapacity[userFirm])).toFixed(0);
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




function startBid() {

    offer = [0, 0, 0, 0];
    var directCost = parseFloat($('#directCost').val());
    var profit = 0;
    var ga = 0;
    for (var i = 0; i < firmList.length; i++) {
        if (i == userFirm) {
            var currentBondCost = parseFloat($('#bondCost').val());
            //if (currentBondCost > bondCapacity[userFirm]) { offer[userFirm] = parseFloat($('#totalCost').val()) * 1.15; }
            offer[userFirm] = parseFloat($('#totalCost').val()); 
            console.log($('#inputProfit').val()/ 100);
            profit = $('#inputProfit').val() / 100;
            ga = parseFloat($('#inputGA').val());
        } else {
            var currentBondCost = directCost * firmList[i]["bondCostRatioBelow"];
            profit = Math.random() * 0.5;
            var profitRatio = (firmList[i]["OHRatio"] + firmList[i]["bondCostRatioBelow"]) * (bondCapacity[i]) / firmList[i]["bondCapacity"] + profit;
            ga = 30;
            if (profitRatio < 0) {
                // reach the bond capacity
                profitRatio = -profitRatio;
                profitRatio *= 1.15
            }
            offer[i] = directCost * (1 + profitRatio) + ga * firmList[i]["GA"] / 100;
            if (currentBondCost > bondCapacity[i]) { offer[i] += getBondCost(firmList[i], directCost, bondCapacity[i]); }
        }
    }

    currentBid = [];
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
    bondCapacity[minIndex] -= getBondCost(firmList[minIndex], directCost, bondCapacity[minIndex]);

    // cover some overhead
    var overhead = parseFloat(minIndex == userFirm ? $('#inputGA').val() : 25);
    firmList[minIndex]["currentGA"] += overhead;

    
    // update the count
    count++;

    processProjects(); // need to update the UI after the changes money

    updateUI();
    update();
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

    if (count != 1 && count % 4 == 1) {
        processGA();
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
            $.each(firmList[i]["projects"], function (j, project) {                
                if (project["length"] > 0) {
                    project["length"] -= 1;
                    firmList[project["ownerIndex"]]["money"] -= project["quarterCost"]; // remove some part of money
                    project["quarterCost"] = project["estimateCost"] / project["totalLength"]; // reset the quarterCost
                } 
            })

            
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


    showFirmInfo();
})
