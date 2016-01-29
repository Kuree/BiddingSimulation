import tornado.websocket
from  jinja2 import Environment, FileSystemLoader
import ujson
import random
import hashlib
from faker import name, company, internet
import urllib
import requests
import copy
import sys
import Settings

#Format of message to be send to the clients
#{
#    "command" : command,
#    "value" : any data
#}



#problems right now:
#    1. after refresh, the connection won't be consistent. Almost fixed
#       However, the time remaining will be messed up.
#       Need to store the time data on the server side and send data via socket
#    2. If the users modify the local userForm variable, the entire system will be screwed up.
#       Bug fixed


class CommandManager:

    @staticmethod
    def setCookie(socket, id, instanceID):
        socket.write_message(ujson.dumps({"command" : "set_cookie", "value" : {"cookieID" : str(id), "instanceID" : instanceID}}))
        return

    @staticmethod
    def deleteIDCookie(socket, id):
        socket.write_message(ujson.dumps({"command" : "remove_cookie", "value" : str(id)}))
        return

    @staticmethod
    def deleteInstanceCookie(socket):
        socket.write_message(ujson.dumps({"command" : "remove_instance", "value" : ""}))
        return

    @staticmethod
    def refreshPage(socket):
        socket.write_message(ujson.dumps({"command" : "refresh", "value" : ""}))
        return

    @staticmethod
    def sendCounter(socket, count):
        socket.write_message(ujson.dumps({"command" : "set_counter", "value" : str(count)}))
        return

    @staticmethod
    def sendDebugMessage(socket, message):
        socket.write_message(ujson.dumps({"command" : "debug", "value" : str(message)}))
        return

    @staticmethod
    def sendProjectFromClient(client, project):
        client._socket.write_message(ujson.dumps({"command" : "project", "value" : project}))
        return

    @staticmethod
    def sendReady(client, isReady):
        client._socket.write_message(ujson.dumps({"command" : "connection_ready", "value" : isReady}))
        return

    @staticmethod
    def assignFirmFromClient(client, firmList, usrFirm, bondCapacity):
        client.firmID = usrFirm
        client._socket.write_message(ujson.dumps({"command" : "assign_firm", "value" : {"firmList" : firmList, "userFirm" : usrFirm, "bondCapacity" : bondCapacity}}))
        return

    @staticmethod
    def updateInformation(client, firmList, offer, currentProject, bondCapacity, count):
        client._socket.write_message(ujson.dumps({"command" : "update_info", "value" : {"firmList" : firmList, "offer" : offer, "currentPorject": currentProject, "bondCapacity" : bondCapacity, "count": count}}))
        return

    @staticmethod
    def assignFirmFromSocket(socket, firmList, usrFirm, bondCapacity):
        socket.write_message(ujson.dumps({"command" : "assign_firm", "value" : {"firmList" : firmList, "userFirm" : usrFirm, "bondCapacity" : bondCapacity}}))
        return

    @staticmethod
    def sendProjectFromSocket(socket, project):
        socket.write_message(ujson.dumps({"command" : "project", "value" : project}))
        return

    @staticmethod
    def sendAdminMessage(socket, command, message):
        socket.write_message(ujson.dumps({"command" : command, "value" : message}))
        return

    @staticmethod
    def sendSimulationResult(client, cookieID):
        client._socket.write_message(ujson.dumps({"command" : "simulation_result", "value" : int(cookieID)}))


class SimulationInstance:


    def __init__(self, id):
        self.__clients = set()
        self.count = 1
        self.id = int(id)
        self.firmList = None
        self.currentBid = []
        self.bondCapacity = []
        self.currentProject = None
        self.currentProfitList = []
        self.currentGAList = []
        self.firmIdDictionary = {};
        self.MAX_BID = Settings.SettingHelper.getMaxBid()
        self.MAX_CONNECTION =Settings.SettingHelper.getMaxConnection()
        
    def serialize(self):
        result = {}
        clients = []
        for client in self.__clients:
            if client is SimulationClient:
                pass
        pass


    def writeMessage(self, message):
        for client in self.__clients:
             client._sendMessage(message)

    def addClient(self, client):
        self.__clients.add(client)

    def findClient(self, id):
        for client in self.__clients:
            realID = id if id == "admin" else int(id)
            clientID = client.id if client.id == "admin" else int(client.id)
            if clientID == realID:
                return client
        return None

    def __findClientIndex(self, id):
        for i in range(len(self.__clients)):
            if int(self.__clients[i].id) == int(id):
                return i
        return None

    def setCLientID(self, oldID, newID):
        find = self.findClient(oldID)
        if find != None:
            find.id = newID

    def removeClient(self, id):
        find = self.findClient(id)
        if find != None:
            self.__clients.remove(find)


    def isConnectionReady(self):
        count = 0
        for client in self.__clients:
            if client.id != "admin": # admin is not included
                count += 1
        return count >= self.MAX_CONNECTION

    def isBiddingReady(self):
        #for offer in self.currentBid:
        #    if offer == 0:
        #        return False
        #return True
        count = 0
        for offer in self.currentBid:
            if offer != sys.maxint:
                count += 1
        return count == self.MAX_CONNECTION

    def getNoneAdminClients(self):
        result = []
        for client in self.__clients:
            if client.id != "admin": # admin is not included
                result.append(client)
        return result

    def getAllClients(self):
        return self.__clients

    def prepareToBid(self, firmList):
        self.firmList = copy.deepcopy(firmList)
        self.currentBid = [sys.maxint] * len(RealtimeSimulationSocketHandler.firmList)
        self.currentGAList = [0] * len(RealtimeSimulationSocketHandler.firmList)
        self.currentProfitList = [0] * len(RealtimeSimulationSocketHandler.firmList)
        for i in range(len(self.firmList)):
            self.bondCapacity.append(self.firmList[i]["bondCapacity"])

    def clientLen(self):
        return len(self.__clients)

    def getAdminSocket(self):
        for client in self.__clients:
            if client.id == "admin":
                return client._socket
        return None




class SimulationClient:
    def __init__(self, socket, id):
        self._socket = socket
        self.id = id
        self.firmID = 0

    def _sendMessage(self, message):
        self._socket.write_message(message)

    def serialize(self):
        ip = repr(self.request.remote_ip)
        firmID = self.firmID
        pass


class RealtimeSimulationSocketHandler(tornado.websocket.WebSocketHandler):   

    instanceList = []
    firmChance = ujson.load(open("static/data/firmChance.json"))
    ownerList = ujson.load(open("static/data/owner.json"))
    eventList = ujson.load(open("static/data/events.json"))
    projectList = ujson.load(open("static/data/projects.json"))
    firmList = ujson.load(open("static/data/firms.json"))
    
    project_id = 0

    def open(self, *args): 
        rawID = self.get_argument("id")
        print rawID
        id = None
        try:
            id = int(rawID)
            self.id = id
        except ValueError:
            admin = self.get_secure_cookie("admin")
            if admin == None or rawID != "admin":
                print "empty"
                self.close()
                return
            else:
                self.id = rawID # i.e. admin

        currentInstance = RealtimeSimulationSocketHandler.instanceList[-1] if len(RealtimeSimulationSocketHandler.instanceList) > 0 else None
        if currentInstance != None:
            print "Connection established"

            if currentInstance.isConnectionReady() and id != "admin": # no more connection
                print "Connection maximum reached. Could not establish new connection."
                self.close()
                return

            if id != None and id != "admin" : # make sure it is not a malicious connection

                # get the instance id
                # if the instance is wrong
                # no candy

                instanceID = int(self.get_argument("instanceid"))
                if RealtimeSimulationSocketHandler.findInstanceById(instanceID) == None:
                    # nope
                    print "Old instance number used. Need to clear the old session"
                    CommandManager.deleteIDCookie(self, id)
                    CommandManager.deleteInstanceCookie(self)
                    CommandManager.refreshPage(self);
                    self.close()
                    return

                find = currentInstance.findClient(id)
                if find == None: # might because the old simulation
                    currentInstance.addClient(SimulationClient(self, id))
                    CommandManager.deleteIDCookie(self, id) # PROBLEM HERE TO RECONNECT
                    CommandManager.setCookie(self, id, currentInstance.id)

                else:
                    CommandManager.sendReady(find, true)
                    CommandManager.sendDebugMessage(self, "client not none")

                # check the working progress right now 
                # this is still problematic
                if id in currentInstance.firmIdDictionary: # someone just made a stupid mistake
                    firmID = currentInstance.firmIdDictionary[id]
                    CommandManager.assignFirmFromSocket(self, currentInstance.firmList, firmID, currentInstance.bondCapacity)
                    if currentInstance.currentProject != None and currentInstance.currentBid[firmID] == sys.maxint:
                        CommandManager.sendProjectFromSocket(self, currentInstance.currentProject)
                        CommandManager.sendCounter(self, currentInstance.count)
            elif id == "admin":
                currentInstance.addClient(SimulationClient(self, id)) # add it to the list but do nothing
       
            print currentInstance.clientLen()
        
            if currentInstance.isConnectionReady() and currentInstance.currentProject == None: # let the party begin!
                self.sendConnectionReady()
                self.assignFirms()
                self.sendProject()
                return

            CommandManager.sendDebugMessage(self, currentInstance.isConnectionReady())




    def on_message(self, message):      
        data = ujson.loads(message)
        command = data["command"]
        value = data["value"]
        currentInstance = RealtimeSimulationSocketHandler.instanceList[-1] if len(RealtimeSimulationSocketHandler.instanceList) > 0 else None

        if currentInstance == None:
            if self.get_secure_cookie("admin") != None:
                CommandManager.sendAdminMessage(self, "instance_id_list", [])
            else:
                return

        if command == "send_offer":
            userFirm = currentInstance.firmIdDictionary[int(value["id"])]
            offer = value["offer"]
            ga = value["ga"]
            profit = value["profit"]


            currentInstance.currentBid[userFirm] = offer
            currentInstance.currentGAList[userFirm] = ga
            currentInstance.currentProfitList[userFirm] = profit

            adminSocket = currentInstance.getAdminSocket()
            if adminSocket != None:
                CommandManager.sendAdminMessage(adminSocket, "send_offer", {"userFirm" : userFirm, "offer" : offer, "ga" : ga, "profit": profit})

            if currentInstance.isBiddingReady():
                RealtimeSimulationSocketHandler.chooceAndProcessBidWinner(currentInstance) # choose winner
                RealtimeSimulationSocketHandler.processProject(currentInstance.firmList, currentInstance.count) # update all the information
                for client in currentInstance.getAllClients():
                    CommandManager.updateInformation(client, currentInstance.firmList, currentInstance.currentBid, currentInstance.currentProject, currentInstance.bondCapacity, currentInstance.count) # send the information
                currentInstance.currentBid = [sys.maxint] * len(RealtimeSimulationSocketHandler.firmList) # reset offer/currentBid
                currentInstance.currentProject = RealtimeSimulationSocketHandler.createProject()
                currentInstance.currentGAList = [0, 0, 0, 0]

                for client in currentInstance.getAllClients():
                    CommandManager.sendProjectFromClient(client, currentInstance.currentProject) # send new project

                if currentInstance.count >= currentInstance.MAX_BID: # need to show winner
                    # need to process all the results
                    for i in range(10):
                        # loop 10 times to make sure all the projects are terminated
                        RealtimeSimulationSocketHandler.processProject(currentInstance.firmList, 0)

                    minIndex = RealtimeSimulationSocketHandler.processSimulationWinner(currentInstance.firmList)
                    winnerID = 0
                    for key in currentInstance.firmIdDictionary:
                        if currentInstance.firmIdDictionary[key] == minIndex:
                            winnerID = key
                    for client in currentInstance.getNoneAdminClients():
                        CommandManager.sendSimulationResult(client, winnerID)

        elif command == "get_instance":
            if self.get_secure_cookie("admin") == None: # nope
                return
            result = []
            for instance in RealtimeSimulationSocketHandler.instanceList:
                result.append(instance.id)
            CommandManager.sendAdminMessage(self, "instance_id_list", result)
        elif command == "get_instance_info_by_id":
            if self.get_secure_cookie("admin") == None: # nope
                return
            id = value
            for instance in RealtimeSimulationSocketHandler.instanceList:
                if instance.id == id:
                     CommandManager.sendAdminMessage(self, "instance", {"firmList" : instance.firmList, "firmIdDictionary" :instance.firmIdDictionary, "bondCapacity" : instance.bondCapacity, "offer" : instance.currentBid})

            CommandManager.sendAdminMessage(self, "instance", {}) # nothing found
        elif command == "create_instance":
            if self.get_secure_cookie("admin") == None: # nope
                return
            id = value["id"]
            print "Game started", id
            max_bid = value["max"]
            player_count = value["count"]
            Settings.SettingHelper.setMaxBid(max_bid)
            Settings.SettingHelper.setMaxConnection(player_count)
            
            # set the max bid etc

            # check if the instance exits
            if RealtimeSimulationSocketHandler.findInstanceById(id) != None:
                CommandManager.sendAdminMessage(self, {"error": "Instance ID already exists"})
                return

            currentInstance = SimulationInstance(id)
            RealtimeSimulationSocketHandler.instanceList.append(currentInstance)
            currentInstance.addClient(SimulationClient(self, "admin"))

        elif command == "delete_instance":
            if self.get_secure_cookie("admin") == None: # nope
                return
            instance = RealtimeSimulationSocketHandler.findInstanceById(value)

            if instance != None:
                RealtimeSimulationSocketHandler.instanceList.remove(instance)

        elif command == "removeAdmin":
            if self.get_secure_cookie("admin") == None: # nope
                return
            id = self.get_secure_cookie("adminID")
            # this part needs to be rewritten. A better implementation is needed.

    @staticmethod
    def findInstanceById(id):
        for instance in RealtimeSimulationSocketHandler.instanceList:
                if instance.id == id:
                    return instance
        return None

    @staticmethod
    def chooceAndProcessBidWinner(currentInstance):
        currentProject = currentInstance.currentProject
        offer = currentInstance.currentBid
        minIndex = RealtimeSimulationSocketHandler.findMin(offer)
        currentProject["ownerIndex"] = minIndex
        currentProject["ownerID"] = minIndex # dirty fix for showing round winner

        currentProject["offer"] = offer[minIndex];
        currentProject["profit"] = currentInstance.currentProfitList[minIndex] * currentProject["estimateCost"] / 100;
        currentProject["gaOverhead"] = currentInstance.currentGAList[minIndex];

        # push to project list
        currentInstance.firmList[minIndex]["projects"].append(copy.deepcopy(currentProject))
        # push to sum
        currentInstance.firmList[minIndex]["money"] += currentProject["profit"];

        # cover some overhead
        currentInstance.firmList[minIndex]["currentGA"] += currentInstance.currentGAList[minIndex];
        if currentInstance.firmList[minIndex]["currentGA"] > 100:
            currentInstance.firmList[minIndex]["currentGA"] =  100

        currentInstance.count += 1

    @staticmethod
    def findMin(lst):
        minIndex = 0
        for i in range(1, len(lst)):
            if isinstance(lst[i], (int, long)) and lst[i] < lst[minIndex]:
                minIndex = i
        return minIndex

    @staticmethod
    def getBondCost(firm, directCost, bondCapacity):
        bond = bondCapacity
        for project in firm["projects"]:
            if project["length"] > 0:
                bond -= project["totalCost"]
        if (bond < 0) :
            return firm["bondCostRatioAbove"] * directCost;
        elif (bond < firm["bondLower"]) :
            return firm["bondCostRatioClose"] * directCost;
        else:
            return firm["bondCostRatioAbove"] * directCost;
        

    def on_close(self):
        if len(RealtimeSimulationSocketHandler.instanceList) > 0:
            RealtimeSimulationSocketHandler.instanceList[-1].removeClient(self.id)

    def assignFirms(self):
        firmIDList = range(len(RealtimeSimulationSocketHandler.firmList)) # this is raw firm list
        random.shuffle(firmIDList)
        currentInstance = RealtimeSimulationSocketHandler.instanceList[-1]
        
        clientList = currentInstance.getNoneAdminClients()        
        currentInstance.prepareToBid(RealtimeSimulationSocketHandler.firmList)

        for i in range(len(clientList)):
            currentInstance.firmIdDictionary[clientList[i].id] = firmIDList[i];
            CommandManager.assignFirmFromClient(clientList[i], RealtimeSimulationSocketHandler.firmList, firmIDList[i], currentInstance.bondCapacity)
        pass

    def sendProject(self):
        clientList = RealtimeSimulationSocketHandler.instanceList[-1].getAllClients()
        RealtimeSimulationSocketHandler.instanceList[-1].currentProject = RealtimeSimulationSocketHandler.createProject()
        for client in clientList:
            CommandManager.sendProjectFromClient(client, RealtimeSimulationSocketHandler.instanceList[-1].currentProject)

    def sendConnectionReady(self):
        clientList = RealtimeSimulationSocketHandler.instanceList[-1].getAllClients()
        for client in clientList:
            CommandManager.sendReady(client, True)

    def sendToWait(self):
        clientList = RealtimeSimulationSocketHandler.instanceList[-1].getNoneAdminClients()
        for client in clientList:
            CommandManager.sendReady(client, False)

    def sendConnectionNotReady(self):
        '''Need to pause the game because someone is offline'''
        clientList = RealtimeSimulationSocketHandler.instanceList[-1].getAllClients()
        for client in clientList:
            CommandManager.sendReady(client, False)

    @staticmethod
    def createProject():
        rawProject = random.choice(RealtimeSimulationSocketHandler.projectList)
        cost = rawProject["Direct Cost"];
        projectType = rawProject["Project Type"];
        length = random.randint(5, 7);
        owner = RealtimeSimulationSocketHandler.createOwner(rawProject["Owner Class"]);
        projectSize = rawProject["Project Size"];
        projectDescription = rawProject["Project Description"]; 
        count = RealtimeSimulationSocketHandler.instanceList[-1].count        
        
        id = RealtimeSimulationSocketHandler.project_id;
        RealtimeSimulationSocketHandler.project_id += 1
        
        result = {
        "additionalCost": 0, "quarterCost": cost / length, "length": length, "owner": owner, "number": count, "events": [],
        "totalLength": length, "totalCost": cost, "ownerIndex": 4, "estimateCost": cost, "type": projectType, "size": projectSize, "description": projectDescription,
        "gaOverhead": 0, "isAlive": True, "offer": 0, "profit": 0, "sizeImpact": 0, "typeImpact": 0, "ownerImpact": 0 }

        return result;

    @staticmethod
    def createOwner(ownerClass):
        return { "name": name.find_name(), "email": internet.email(), "ui": "http://lorempixel.com/200/200/business/", "type": ownerClass, "company": company.company_name() };


    @staticmethod
    def processProject(firmList, count):
        for firm in firmList:
            if len(firm["projects"]) > 0:
                for project in firm["projects"]:
                    if project["length"] > 0:
                        RealtimeSimulationSocketHandler.randomEvent(firm, project)

        RealtimeSimulationSocketHandler.purageProjects(firmList)

        if count != 1 and count % 4 == 1:
            RealtimeSimulationSocketHandler.processGA(firmList)
        return

    @staticmethod
    def processSimulationWinner(firmList):
        maxIndex = 0
        for i in range(len(firmList)):
            if firmList[i]["money"] > firmList[maxIndex]["money"]:
                maxIndex = i
        return maxIndex

    @staticmethod
    def randomEvent(firm, project):
        # direct translation from javascript to python
        chooseFrom = ["owner", "project type", "project size"]
        eventType = random.choice(chooseFrom)
        event = {"additionalCost" : 0}
        addiitonalCost = 0
        message = ""
        effectChance = 0
    
        # firm events here
        if (eventType == chooseFrom[0]) : # owner impact
            ownerChanceList = RealtimeSimulationSocketHandler.ownerList[str(project["owner"]["type"])];
            effectChance = random.choice(ownerChanceList)
            
        elif eventType == chooseFrom[1]:
            chanceList = RealtimeSimulationSocketHandler.firmChance[RealtimeSimulationSocketHandler.firmList[project["ownerIndex"]]["type"]]
            targetChanceList = chanceList[str(project["type"])];
            effectChance = random.choice(targetChanceList)
        else:
            chanceList = RealtimeSimulationSocketHandler.firmChance[RealtimeSimulationSocketHandler.firmList[project["ownerIndex"]]["size"]]
            targetChanceList = chanceList[str(project["size"])];
            effectChance = random.choice(targetChanceList)
        
        if (effectChance != 0):
            choice = "+" if (effectChance > 0) else "-"
            addiitonalCost = effectChance * project["quarterCost"];
            eventListFromRandom = RealtimeSimulationSocketHandler.eventList[eventType];
            if (eventListFromRandom == None):
                print "error"

            event["message"] = random.choice(eventListFromRandom[choice])
            event["additionalCost"] += addiitonalCost
            project["quarterCost"] += addiitonalCost
            project["totalCost"] += addiitonalCost
            project["additionalCost"] = event["additionalCost"]

            # add impact to project's impact list
            if eventType == chooseFrom[0]:
                    project["ownerImpact"] += addiitonalCost
 
            elif eventType == chooseFrom[1]:
                    project["typeImpact"] += addiitonalCost

            elif eventType == chooseFrom[2]:
                    project["sizeImpact"] += addiitonalCost

            # clear event list
            project["events"] = [copy.deepcopy(event)]



    @staticmethod
    def purageProjects(firmList):
        for i in range(len(firmList)):
            if len(firmList[i]["projects"]) > 0:
                for project in firmList[i]["projects"]:
                    if (project["length"] > 0):
                        project["length"] -= 1;
                        # deduct some money
                        if project["additionalCost"]:
                                firmList[project["ownerIndex"]]["money"] -= project["additionalCost"] # remove some part of money
                                project["additionalCost"] = 0


    @staticmethod
    def processGA(firmList):
        for firm in firmList:
            firm["money"] -= firm["GA"]
        RealtimeSimulationSocketHandler.resetGAOverhead(firmList);

    @staticmethod
    def resetGAOverhead(firmList):
        for firm in firmList:
            firm["currentGA"] = 0;



class RealtimeSimulationHandler(tornado.web.RequestHandler):
    def get(self):
        html_output = self.template.render(title="Realtime Simulation", ContentName="Realtime Simulation", showTimer = True)
        self.write(html_output)
        return

    def initialize(self):
        self.TEMPLATE_FILE = "realtimeSimulation.html"
        self.templateLoader = FileSystemLoader( searchpath="templates/" )
        self.templateEnv = Environment( loader=self.templateLoader )
        self.template = self.templateEnv.get_template(self.TEMPLATE_FILE)
        
