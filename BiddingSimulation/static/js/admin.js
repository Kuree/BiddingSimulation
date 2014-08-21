
var count = 1
var currentProject = {}
var bondCapacity = []
var url = document.domain;
connection = new WebSocket("ws://" + url + "/realtimeSocket?id=admin");
connection.onmessage = onMessageReceived;
connection.onopen = getInstanceList;

$(function () {

    $("#createInstance").click(function () {
        var id = Math.floor(Math.random() * 10000000);
        connection.send(JSON.stringify({ "command": "create_instance", "value": id }));
        bootbox.alert("The new instance's ID is " + id + "</br>Please give it to students as pin number");
        getInstanceList();
    });

    $("#deleteInstance").click(function () {
        var id = parseInt($('#instance-id').text());
        connection.send(JSON.stringify({ "command": "delete_instance", "value": id }));
        getInstanceList();
    });
});

function onMessageReceived(evt) {
    var data = JSON.parse(evt.data)

    if (data["command"] != undefined) {
        var value = data["value"]
        console.log(value);
        switch (data["command"]) {
            case "debug":
                console.log(value);
                break;
            case "project":
                currentProject = value;
                $('#table-current-info').empty()
                break;
            case "assign_firm":
                firmList = value["firmList"];
                bondCapacity = value["bondCapacity"];
                break;
            case "send_offer":
                userFirm = value["userFirm"];
                offer = value["offer"];
                ga = value["ga"]
                profit = value["profit"]
                var content = "<tr><th>" + userFirm + "</th><th>" + profit + "</th><th>" + ga + "</th><th>" + offer + "</th></tr>";
                $('#table-current-info').append(content);
                break;
            case "update_info":
                firmList = value["firmList"];
                offer = value["offer"];
                bondCapacity = value["bondCapacity"];
                currentProject = value["currentPorject"];
                count = value["count"];
                $('#table-overall-info').empty()
                var content = "";
                $.each(firmList, function (i, firm) {
                    content += "<tr><th>" + i + "</th><th>" + firm["projects"].length + "</th><th>" + bondCapacity[i] + "</th><th>" + firm["sum"] + "</th></tr>";
                    $('#table-overall-info').append(content);
                })

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
        connection.send(JSON.stringify({"command" : "get_instance", "value" : ""}))
    }
}
