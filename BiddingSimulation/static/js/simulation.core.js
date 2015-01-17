// count
count = 1;

// firm list
firmList = [];

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
    var cost = parseFloat(convertToInt($('#directCost').val()));
    var firm = firmList[userFirm];
    var bondCost = parseFloat(convertToInt($('#bondCost').val()));   // You need fix here about the bond cost
    var ohCost = (firm["OHRatio"] * cost).toFixed(0);
    var ga = parseFloat($('#inputGA').val()) * firm["GA"] / 100;
    var value = parseInt((parseFloat(cost) + parseFloat(bondCost) + parseFloat(ohCost) + parseFloat($('#inputProfit').val()) * cost / 100 + ga));
    if (value) {
        var str = convertToComma(value);
        $('#totalCost').val(str);
    }
};

function convertToComma(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function convertToInt(value) {
    return value.replace(/,/g, '');
}

function updateUI() {
    var bidTable = $('#bid-table-body');
    // get the main for offer
    var minIndex = offer.indexOf(Math.min.apply(Math, offer));
    var string = "<tr>\
                          <td>" + (count - 1) + "</td>" + "<td>" + convertToComma(currentProject["totalCost"]) + "</td>";
    $.each(offer, function (i) {
        if (i === minIndex) {
            string += "<td><b>" + convertToComma(offer[i].toFixed(0)) + "</b></td>";
        } else {
            string += "<td>" + convertToComma(offer[i].toFixed(0)) + "</td>";
        }
    });
    bidTable.append(string + "</tr>");
    //// update bond table
    //var append = "";
    //$('#bond-table-body').empty();
    //append = "<tr><td>" + count + "</td>";
    //$.each(firmList, function (i) {
    //    append += "<td>" + bondCapacity[i].toFixed(0) + "</td>";
    //});
    //append += "</tr>";

    //$('#bond-table-body').append(append);

    //// update active projects
    //$('#money-table-body').empty();
    //append = "<tr><td>" + count + "</td>";
    //$.each(firmList, function (i) {
    //    append += "<td>" + firmList[i]["money"].toFixed(0) + "</td>";
    //});
    //append += "</tr>";
    //$('#money-table-body').append(append);

    //$('#current-project-table-body').empty();
    //append = "<tr><td>" + "now" + "</td>";
    //$.each(firmList, function (i) {
    //    var length = 0;
    //    $.each(firmList[i]["projects"], function (i, project) {
    //        if (project["length"] > 0) {
    //            length += 1;
    //        }
    //    })
    //    append += "<td>" + length + "</td>";
    //});
    //append += "</tr>";
    //$('#current-project-table-body').append(append);

    append = "<tr><td>" + (count - 1) + "</td>";
    $.each(firmList, function (i) {
        if (i === minIndex) {
            append += "<td>" + convertToComma(offer[i].toFixed(0)) + "</td>";
        } else {
            append += "<td></td>";
        }
    })
    append += "</tr>";
    $('#project-stats-table-body').append(append);

    //append = "<tr><td>" + "Total" + "</td>";
    //$.each(firmList, function (i) {
    //    append += "<td>" + firmList[i]["money"].toFixed(0) + "</td>";
    //});
    //$('#project-sum-table-body').empty();
    //$('#project-sum-table-body').append(append);

    // progress bar
    var value = (count + 1) / maxBid * 100;
    $('#bidding-progress').css('width', value + '%').attr('aria-valuenow', value);
    $('#progressbar-span').text(value.toFixed(0) + "% Complete");

    // quarter indicator
    var quarter = ((count % QUARTER_COUNT) != 0 ? (count % QUARTER_COUNT) : QUARTER_COUNT)
    var indicator = "Year " + ((count % QUARTER_COUNT) !== 0 ? (~~(count / QUARTER_COUNT) + 1) : (~~(count / QUARTER_COUNT))) + " Quarter: " + quarter;
    $('#quarter-indicator').text(indicator);
    if (quarter <= 1) {
        bootbox.dialog({
            message: "Please Check Your Income Statement",
            title: "Attention",
            buttons: {
                main: {
                    label: "Okay",
                    className: "btn-default",
                    callback: function () {
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
                    }
                }
            }
        });
    }


    // clear out the input
    $('#inputProfit').val('');
    $('#inputProfit').keyup();
    $('#inputGA').val('');
    $('#inputGA').keyup();
    console.log($('#inputGA'));
}


function getBondCost(firm, directCost, bondCapacity) {
    if (bondCapacity < 0) {
        return firm["bondCostRatioAbove"] * directCost;
    } else if (bondCapacity < firm["bondLower"]) {
        return firm["bondCostRatioClose"] * directCost;
    } else {
        return firm["bondCostRatioBelow"] * directCost;
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
        message += "<td>" + convertToComma(offer[i].toFixed(0)) + "</td>";
    });

    message += "</td></tr></tbody></table><hr>";

    message += "<h4>Bidding result Report</h4>";

    if (currentProject["ownerID"] == userFirm) {
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
        if (firmList[userFirm]["projects"].length == 0) {
            message += "<p>No project yet</p>"
        }
        $.each(firmList[userFirm]["projects"], function (i, project) {
            if (project["length"] > 0) {
                message += "<tr><td>" + project["number"] + "</td>";
                message += "<td>" + (project["estimateCost"] / project["totalLength"]).toFixed(0) + "</td>";
                message += "<td>" + convertToComma(project["quarterCost"].toFixed(0)) + "</td>";
                message += "<td>" + convertToComma(project["estimateCost"]) + "</td>";
                message += "<td>" + convertToComma(project["totalCost"].toFixed(0)) + "</td><td>";

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
                className: "btn-default",
                callback: dialogFinished
            }
        }
    });
}

function showFirmInfo() {
    var firm = firmList[userFirm];
    $('#firm-name').text("Firm Name: " + firm["name"]);
    $('#firm-type').text("Firm Type: " + firm["type"]);
    $('#firm-size').text("Firm Size: " + firm["size"]);
    $('#firm-bond-capacity').text("Firm Bond Capacity: " + convertToComma(firm["bondCapacity"]));
    $('#firm-bond-low').text("Lower Bond Limit: " + convertToComma((firm["bondCapacity"] - firm["bondLower"])));
    $('#firm-bond-ratio-below').text("Bond Rate for Below Bond Limit" + convertToComma(firm["bondCostRatioBelow"]));
    $('#firm-bond-ratio-close').text("Bond Rate for Above Lower Bond Limit and Below Bond Capacity: " + convertToComma(firm["bondCostRatioClose"]));
    $('#firm-bond-ratio-above').text("Bond Rate for Above Bond Capacity: " + convertToComma(firm["bondCostRatioAbove"]));
    $('#firm-bond-ratio-above').text("Annual G&A Overhead: " + convertToComma(firm["GA"]));
    //$('#firm-current-GA').text(firm["currentGA"]);
    
}



function validateInput() {
    var validation = true;
    if (!parseFloat($('#inputGA').val())) {
        $("#inputGA").css("border", "2px solid red");
        validation = false;
    } else {
        $("#inputGA").css("border", "");
    }
    if (!parseFloat($('#inputProfit').val())) {
        $("#inputProfit").css("border", "2px solid red");
        validation = false;
    } else {
        $("#inputProfit").css("border", "");
    }
    $("#bid").prop("disabled", !validation);
}

function dialogFinished() {

}

$(function () {

    // hook up the bid total form
    $('#inputProfit').change(function () {
        updateTotalCost();
        validateInput();
    });

    $('#inputProfit').keyup(function (e) {
        updateTotalCost();
        validateInput();
    });

    $('#inputGA').change(function () {
        updateTotalCost();
        validateInput();
    });

    $('#inputGA').keyup(function (e) {
        updateTotalCost();
        validateInput();
    });

    validateInput();

    // start bid function
    $('#check-income-statement').click(function (e) {
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

    // set up stop timer
    shouldStop = false;

    var vis = (function () {
        var stateKey, eventKey, keys = {
            hidden: "visibilitychange",
            webkitHidden: "webkitvisibilitychange",
            mozHidden: "mozvisibilitychange",
            msHidden: "msvisibilitychange"
        };
        for (stateKey in keys) {
            if (stateKey in document) {
                eventKey = keys[stateKey];
                break;
            }
        }
        return function (c) {
            if (c) document.addEventListener(eventKey, c);
            return !document[stateKey];
        }
    })();

    vis(function () {
        shouldStop = vis() ? false : true;
        console.log(shouldStop);
    });
    
});