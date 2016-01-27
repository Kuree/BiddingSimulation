

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
        $('#directCost').val(convertToComma(cost));
        $('#bondCost').val(convertToComma(bondCost));
        $('#ohCost').val(convertToComma(ohCost));
        updateTotalCost();

        // update contact info
        $('#fake_image').attr('src', currentProject["owner"]["ui"]);
        $('#owner-name').text("Name: " + currentProject["owner"]["name"]);
        $('#owner-email').text("Email: " + currentProject["owner"]["email"]);
        $('#owner-company').text("Company Name: " + currentProject["owner"]["company"]);
        $('#owner-Type').text("Owner Type: " + currentProject["owner"]["type"]);
        $('#info-cost').text("Bid direct cost: " + convertToComma(currentProject["totalCost"]));
        $('#info-project-type').text("Project Type: " + currentProject["type"]);
        $('#info-project-size').text("Project Size: " + currentProject["size"]);
        $('#info-project-description').text("Project Description: " + currentProject["description"]);


        hasSubmit = false;
    }

}




function startBid() {

    offer = [0, 0, 0, 0];
    var directCost = parseFloat(convertToInt($('#directCost').val()));
    var profit = 0;
    var ga = 0;
    for (var i = 0; i < firmList.length; i++) {
        if (i == userFirm) {
            var currentBondCost = parseFloat(convertToInt($('#bondCost').val()));
            //if (currentBondCost > bondCapacity[userFirm]) { offer[userFirm] = parseFloat($('#totalCost').val()) * 1.15; }
            offer[userFirm] = parseFloat(convertToInt($('#totalCost').val()));
            profit = $('#inputProfit').val() / 100;
            //ga = parseFloat($('#inputGA').val());
        } else {
            var currentBondCost = directCost * firmList[i]["bondCostRatioBelow"];
            profit = Math.random() * 0.5;
            var profitRatio = profit;
            ga = 30;
            offer[i] = directCost * (1 + profitRatio) + ga * firmList[i]["GA"] / 100;
            // add the bond cost
            offer[i] += getBondCost(firmList[i], directCost, bondCapacity[i]);
        }
    }

    currentBid = [];
    for (var i = 0; i < firmList.length; i++) {
        currentBid.push({ "firm id": i, "offer": offer[i] });
    }

    var minIndex = offer.indexOf(Math.min.apply(Math, offer));
    currentProject["offer"] = offer[minIndex];
    currentProject["profit"] = profit * directCost;
    currentProject["gaOverhead"] = minIndex == userFirm ? parseFloat($('#inputGA').val()) : ga;

    currentProject["ownerID"] = minIndex; // push to firm project list
    firmList[minIndex]["projects"].push($.extend({}, currentProject));

    // push to sum
    firmList[minIndex]["sum"] += offer[minIndex];


    //result[count] = resultList;

    // give them money
    firmList[minIndex]["money"] += offer[minIndex];

    // update the bond capacity
    // bondCapacity[minIndex] -= getBondCost(firmList[minIndex], directCost, bondCapacity[minIndex]);

    // cover some overhead
    var overhead = parseFloat(minIndex == userFirm ? $('#inputGA').val() : 30);
    firmList[minIndex]["currentGA"] += overhead;

    
    // update the count
    count++;

    processProjects(); // need to update the UI after the changes money

    hasSubmit = true;
    updateUI();
    update();
}


function sendDefaultBid() {
    offer = [0, 0, 0, 0];
    var directCost = parseFloat(convertToInt($('#directCost').val()));
    var profit = 0;
    var ga = 0;
    for (var i = 0; i < firmList.length; i++) {
        if (i == userFirm) {
            // var currentBondCost = parseFloat(convertToInt($('#bondCost').val()));
            //if (currentBondCost > bondCapacity[userFirm]) { offer[userFirm] = parseFloat($('#totalCost').val()) * 1.15; }
            $('#inputProfit').val(100);
            $('#inputProfit').change();
            $('#inputGA').val(100);
            $('#inputGA').change();
            offer[userFirm] = parseFloat(convertToInt($('#totalCost').val()));
            // profit = $('#inputProfit').val() / 100;
            // ga = parseFloat($('#inputGA').val());
        } else {
            var currentBondCost = directCost * firmList[i]["bondCostRatioBelow"];
            profit = Math.random() * 0.5;
            var profitRatio = profit;
            ga = 30;
            offer[i] = directCost * (1 + profitRatio) + ga * firmList[i]["GA"] / 100;
            // if (currentBondCost > bondCapacity[i]) { offer[i] += getBondCost(firmList[i], directCost, bondCapacity[i]); }
        }
    }

    currentBid = [];
    for (var i = 0; i < firmList.length; i++) {
        currentBid.push({ "firm id": i, "offer": offer[i] });
    }

    var minIndex = offer.indexOf(Math.min.apply(Math, offer));
    currentProject["offer"] = offer[minIndex];
    currentProject["profit"] = profit * directCost;
    currentProject["gaOverhead"] = ga;

    currentProject["ownerID"] = minIndex; // push to firm project list
    firmList[minIndex]["projects"].push($.extend({}, currentProject));

    // push to sum
    firmList[minIndex]["sum"] += offer[minIndex];


    //result[count] = resultList;

    // give them money
    firmList[minIndex]["money"] += offer[minIndex];

    // update the bond capacity
    // bondCapacity[minIndex] -= getBondCost(firmList[minIndex], directCost, bondCapacity[minIndex]);

    // cover some overhead
    var overhead = parseFloat(minIndex == userFirm ? $('#inputGA').val() : 30);
    firmList[minIndex]["currentGA"] += overhead;


    // update the count
    count++;

    processProjects(); // need to update the UI after the changes money

    hasSubmit = true;
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
    var event = {"additionalCost" : 0};
    var addiitonalCost = 0;
    var message = "";
    var effectChance = 0;
    
    // firm events here
    if (eventType == chooseFrom[0]) { // owner impact
        var ownerChanceList = ownerList[project["owner"]["type"]];
        effectChance = ownerChanceList[Math.floor(Math.random() * ownerChanceList.length)];
            
    } else { // right now it's only for project type
        var chanceList = firmChance[firmList[project["ownerID"]]["type"]];
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
        event["additionalCost"] += addiitonalCost;
        project["quarterCost"] += addiitonalCost;
        project["totalCost"] += addiitonalCost; // add impact to project's impact list
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
            });
        }
    });
    purageProejcts();

    if (count != 1 && count % 4 == 1) {
        processGA();
    }

    getProgressReport();



}

function resetGAOverhead() {
    $.each(firmList, function (i, firm) {
        firm["currentGA"] = 0;
    });
}

function createOwner(ownerClass) {
    return { "name": faker.Name.findName(), "email": faker.Internet.email(), "ui": "http://lorempixel.com/200/200/business/", "type": ownerClass, "company": faker.Company.companyName() };
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
        "quarterCost": cost / length, "length": length, "owner": owner, "number": count, "events": [], "ownerID": 0,
        "totalLength": length, "totalCost": cost, "estimateCost": cost, "type": projectType, "size": projectSize, "description": projectDescription,
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
                    firmList[project["ownerID"]]["money"] -= project["quarterCost"]; // remove some part of money
                    project["quarterCost"] = project["estimateCost"] / project["totalLength"]; // reset the quarterCost
                } 
            });
        }
    });
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

function setUserFirm(i) {
    console.log(i);
    userFirm = i;
    $('#firm-choose').text("You chose " + firmList[i]["textName"]);
    // show the G&A
    var gaValue = convertToComma(firmList[userFirm]["GA"]);
    $('#TotalGA').val(gaValue);
}

function addFirmProperties() {
    var result = "";
    $.each(firmList, function(i, firm){

        result += "<tr><td>" + (i+1) + "</td>";
        result += "<td>" + convertToComma(firm["bondCapacity"]) + "</td>";
        result += "<td>" + convertToComma(firm["GA"]) + "</td>";
        result += "<td>" + convertToComma((firm["bondCapacity"] - firm["bondLower"])) + "</td>";
        result += "<td>" + (firm["bondCostRatioBelow"] * 100).toFixed(2) + "%</td>";
        result += "<td>" + (firm["bondCostRatioClose"] * 100).toFixed(2) + "%</td>";
        result += "<td>" + (firm["bondCostRatioAbove"] * 100).toFixed(2) + "%</td>";
        result += "<td>" + firm["type"] + "</td>";
        result += "</tr>";
    });
    return result;
}

function initialize() {
    update();
    showFirmInfo();
    dialogFinished();
}

$(function () {

    // // get firm chance
    $.ajax({
        url: "/data?arg=firmChance",
        dataType: 'json',
        success: function (data) {
            firmChance = data;

            // get owner list
            $.ajax({
                url: "/data?arg=owner",
                dataType: 'json',
                success: function (data) {
                    ownerList = data;

                    // get project list
                    $.ajax({
                        url: "/data?arg=projects",
                        dataType: 'json',
                        success: function (data) {
                            projectList = data;

                            // get events list
                            $.ajax({
                                url: "/data?arg=events",
                                dataType: 'json',
                                success: function (data) {
                                    // make it async because it will be used later
                                    eventList = data;
                                }
                            });

                            // get firm list
                            $.ajax({
                                url: "/data?arg=firms",
                                dataType: 'json',
                                success: function (data) {
                                    firmList = data;

                                // reset the G&A overhead for each company.
                                resetGAOverhead();

                                $.each(firmList, function (i, firm) {
                                    bondCapacity.push(firm.bondCapacity);
                                    //money.push(0);
                                });



                                var message = "<h4>Please choose a firm</h4>";
                                message += "<div class=\"btn-group\">";
                                for(var i = 0; i < firmList.length; i++){
                                    message += "<button class=\"btn btn-default\" type=\"button\" onclick=\"setUserFirm(" + i + ")\">" + firmList[i]["name"] + "</button>";
                                }
                                message += "</div>";

                                message += "<p id=\"firm-choose\">You chose Firm " + firmList[0]["name"] + "</p>";
                                $('#TotalGA').val(firmList[0]["GA"]);

                                message += "<h4>Firm Characteristics</h4>\
                                                    <table class='table'>\
                                                        <thead>\
                                                            <tr>\
                                                                <th>Firm #</th>\
                                                                <th>Bonding Capacity</th>\
                                                                <th>Annual G&A Overhead</th>\
                                                                <th>Lower Bond Limit</th>\
                                                                <th>Bond Rate for Below Bond Limit</th>\
                                                                <th>Bond Rate for Above Lower Bond Limit and Below Bond Capacity</th>\
                                                                <th>Bond Rate for Above Bond Capacity</th>\
                                                                <th>Company Specialty</th>\
                                                            </tr>\
                                                        </thead>\
                                                        <tbody>";
                                


                                message += addFirmProperties();
                                message += "</tbody></table>";


                                bootbox.dialog({
                                    message: message,
                                    title: "Please Choose Your Firm",
                                    buttons: {
                                        main: {
                                            label: "Okay",
                                            className: "btn-default",
                                            callback: initialize
                                        }
                                    }
                                });

                                // console.log(userFirm); // initialize the firm list in UI
                                var tableContent = "<thead>\
                                                            <tr>\
                                                                <th>#</th>";
                                var tableContentCost = "<thead>\
                                                            <tr>\
                                                                <th>#</th>\
                                                                <th>Total Cost</th>";

                                $.each(firmList, function (i, firm) {
                                    tableContent += "<th>" + firm["name"] + "</th>";
                                    tableContentCost += "<th>" + firm["name"] + "</th>";
                                });
                                tableContent += "</tr>\
                                                        </thead>";
                                tableContentCost += "</tr>\
                                                        </thead>";

                                $('.firms').append(tableContent);
                                //console.log($('.firms'));
                                $('.cost').append(tableContentCost);
                                
                                }
                            });
                            
                        }
                    });
                }
            });
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
    });
    hasSubmit = false;
    shouldStop = false;

});
