
var count = 1;
var currentProject = {};
var bondCapacity = [];
var url = document.domain;
connection = new WebSocket("ws://" + url + "/realtimeSocket?id=admin");
connection.onmessage = onMessageReceived;
connection.onopen = getInstanceList;
var firmList = [];

$(function () {

    $("#createInstance").click(function () {
        var id = Math.floor(Math.random() * 10000000);
        var maxbid = parseInt($("#max-bid").val());
        var player_count = parseInt($("#player-count").val());
        connection.send(JSON.stringify({ "command": "create_instance", "value": {"id": id, "max":maxbid, "count" : player_count}}));
        bootbox.alert("The new instance's ID is " + id + "</br>Please give it to students as pin number");
        getInstanceList();
    });

    $("#deleteInstance").click(function () {
        var id = parseInt($('#instance-id').text());
        connection.send(JSON.stringify({ "command": "delete_instance", "value": id }));
        getInstanceList();
    });

    $.ajax({
        url: "/data?arg=firms",
        dataType: 'json',
        success: function (data) {
            firmList = data;
        },
        async: false
    });
});

function onMessageReceived(evt) {
    var data = JSON.parse(evt.data);

    if (data["command"] != undefined) {
        var value = data["value"];
        console.log(value);
        switch (data["command"]) {
            case "debug":
                console.log(value);
                break;
            case "project":
                currentProject = value;
                if (count !== 1) {
                    $('#table-current-info').append("<tr><th>Project" + count + "</th><th></th><th></th><th></th></tr>");
                }
                break;
            case "assign_firm":
                firmList = value["firmList"];
                bondCapacity = value["bondCapacity"];
                break;
            case "send_offer":
                userFirm = value["userFirm"];
                offer = value["offer"];
                ga = value["ga"];
                profit = value["profit"];
                var content = "<tr><th>" + firmList[userFirm]["name"] + "</th><th>" + profit.toFixed(0) + "</th><th>" + ga.toFixed(0) + "</th><th>" + offer.toFixed(0) + "</th></tr>";
                $('#table-current-info').append(content);
                break;
            case "update_info":
                firmList = value["firmList"];
                offer = value["offer"];
                bondCapacity = value["bondCapacity"];
                currentProject = value["currentPorject"];
                count = value["count"];
                $('#table-overall-info').empty();
                var content = "";
                $.each(firmList, function (i, firm) {
                    content = "<tr><th>" + firm["name"] + "</th><th>" + firm["projects"].length + "</th><th>" + bondCapacity[i].toFixed(0) + "</th><th>" + firm["money"].toFixed(0) + "</th></tr>";
                    $('#table-overall-info').append(content);
                });
                break;
            case "instance_id_list":                
                if (value.length < 1) {
                    $("#createInstance").prop("disabled", false);
                    $("#deleteInstance").prop("disabled", true);
                }
                else
                {
                    $("#createInstance").prop("disabled", true);
                    $("#deleteInstance").prop("disabled", false);
                }

                $('#instance-id').text(value[0]);
                break;
            default:
                break;
        }
    }
}
// 
function getInstanceList() {
    if (connection != undefined) {
        connection.send(JSON.stringify({"command" : "get_instance", "value" : ""}));
    }
}
